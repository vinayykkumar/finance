import { supabase } from './supabase';
import { updateBankBalance } from './bank-service';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  category_id?: string;
  bank_id: string;
  to_bank_id?: string; // For transfer transactions
  date: string;
  user_id?: string;
  created_at: string;
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  try {
    // Input validation - description is now optional
    
    if (isNaN(transaction.amount) || transaction.amount <= 0) {
      throw new Error('Transaction amount must be a positive number');
    }
    
    if (!transaction.bank_id) {
      throw new Error('Bank account is required');
    }
    
    if (transaction.type === 'transfer' && !transaction.to_bank_id) {
      throw new Error('Destination account is required for transfers');
    }
    
    if (transaction.type === 'expense' && !transaction.category_id) {
      throw new Error('Category is required for expenses');
    }
    
    const amount = Math.abs(transaction.amount);
    
    if (transaction.type === 'transfer' && transaction.to_bank_id) {
      // For transfers, create two transactions: withdrawal and deposit
      const [withdrawalData, depositData] = await Promise.all([
        supabase
          .from('transactions')
          .insert({
            description: `${transaction.description} (Transfer Out)`,
            amount: amount,
            type: 'expense',
            date: transaction.date,
            bank_id: transaction.bank_id
          })
          .select()
          .single(),
        
        supabase
          .from('transactions')
          .insert({
            description: `${transaction.description} (Transfer In)`,
            amount: amount,
            type: 'income',
            date: transaction.date,
            bank_id: transaction.to_bank_id
          })
          .select()
          .single()
      ]);

      if (withdrawalData.error) throw withdrawalData.error;
      if (depositData.error) throw depositData.error;
      if (!withdrawalData.data || !depositData.data) throw new Error('No data returned from insert');

      // Update bank balances
      await updateBankBalance(transaction.bank_id, -amount);
      await updateBankBalance(transaction.to_bank_id, amount);

      return withdrawalData.data;
    } else {
      // For regular transactions
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category_id: transaction.category_id || null,
          date: transaction.date,
          bank_id: transaction.bank_id
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      // Update bank balance
      if (transaction.type === 'expense') {
        await updateBankBalance(transaction.bank_id, -amount);
      } else if (transaction.type === 'income') {
        await updateBankBalance(transaction.bank_id, amount);
      }
      
      // No need to manually update category spending here
      // The loadCategorySpending function in App.tsx will calculate this
      // based on the transactions linked to each category

      return data;
    }
  } catch (error) {
    console.error('Failed to create transaction:', error);
    throw error;
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  try {
    console.log('Deleting transaction with ID:', id);

    // Get transaction details before deleting
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching transaction:', fetchError);
      throw new Error(`Error fetching transaction: ${fetchError.message}`);
    }

    if (!transaction) throw new Error('Transaction not found');

    // Now delete the transaction
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw new Error(`Error deleting transaction: ${deleteError.message} (${deleteError.code})`);
    }

    // Reverse the balance changes
    const amount = Math.abs(transaction.amount);
    if (transaction.type === 'expense') {
      await updateBankBalance(transaction.bank_id, amount);
    } else if (transaction.type === 'income') {
      await updateBankBalance(transaction.bank_id, -amount);
    } else if (transaction.type === 'transfer' && transaction.to_bank_id) {
      await updateBankBalance(transaction.bank_id, amount);
      await updateBankBalance(transaction.to_bank_id, -amount);
    }

    console.log('Transaction deleted successfully');
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      throw error;
    } else if (typeof error === 'object' && error !== null) {
      throw new Error(JSON.stringify(error));
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to load transactions:', error);
    throw error; // Throw error instead of returning empty array for consistency
  }
}
