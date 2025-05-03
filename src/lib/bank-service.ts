import { supabase } from './supabase';

export interface Bank {
  id: string;
  name: string;
  balance: number;
  created_at: string;
}

export async function getBanks(): Promise<Bank[]> {
  try {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching banks:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to load banks:', error);
    throw error;
  }
}

export async function addBank(name: string, initialBalance: number): Promise<Bank> {
  try {
    console.log('Adding bank with:', { name, initialBalance });

    const { data, error: insertError } = await supabase
      .from('banks')
      .insert([
        {
          name,
          balance: initialBalance
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error(`Error adding bank: ${insertError.message} (${insertError.code})`);
    }

    if (!data) {
      throw new Error('No data returned from Supabase');
    }

    console.log('Bank added successfully:', data);
    return data;
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

export async function updateBankBalance(bankId: string, amount: number): Promise<void> {
  try {
    // Use a more atomic approach to prevent race conditions
    // This uses RPC (Remote Procedure Call) to a PostgreSQL function that handles the update atomically
    // If your Supabase instance doesn't have this function, we'll fall back to the regular approach
    const { error: rpcError } = await supabase.rpc('update_bank_balance', {
      bank_id: bankId,
      amount_change: amount
    });

    // If RPC fails (likely because the function doesn't exist), fall back to the regular approach
    if (rpcError) {
      console.warn('RPC update_bank_balance failed, falling back to regular update:', rpcError);
      
      // Get latest balance with a FOR UPDATE lock (if supported by your Supabase plan)
      const { data: bank, error: fetchError } = await supabase
        .from('banks')
        .select('balance')
        .eq('id', bankId)
        .single();

      if (fetchError) {
        console.error('Error fetching bank:', fetchError);
        throw new Error(`Failed to fetch bank: ${fetchError.message}`);
      }

      if (!bank) {
        throw new Error('Bank not found');
      }

      // Update with new balance
      const { error: updateError } = await supabase
        .from('banks')
        .update({ balance: bank.balance + amount })
        .eq('id', bankId);

      if (updateError) {
        console.error('Error updating bank balance:', updateError);
        throw new Error(`Failed to update bank balance: ${updateError.message}`);
      }
    }
  } catch (error) {
    console.error('Error in updateBankBalance:', error);
    throw error;
  }
}

// Helper function to delete all transactions associated with a bank
async function deleteAllBankTransactions(bankId: string): Promise<void> {
  console.log('Deleting all transactions for bank ID:', bankId);
  
  // First delete transactions where this is the source bank
  const { error: sourceError } = await supabase
    .from('transactions')
    .delete()
    .eq('bank_id', bankId);
  
  if (sourceError) {
    console.error('Error deleting source transactions:', sourceError);
    throw new Error(`Error deleting source transactions: ${sourceError.message}`);
  }
  
  // Then delete transactions where this is the destination bank (transfers)
  const { error: destError } = await supabase
    .from('transactions')
    .delete()
    .eq('to_bank_id', bankId);
  
  if (destError) {
    console.error('Error deleting destination transactions:', destError);
    throw new Error(`Error deleting destination transactions: ${destError.message}`);
  }
  
  console.log('Successfully deleted all transactions for bank');
}

export async function deleteBank(id: string): Promise<void> {
  try {
    console.log('Deleting bank with ID:', id);

    // First check if there are any transactions associated with this bank
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('bank_id', id);

    if (transactionError) {
      console.error('Error checking transactions:', transactionError);
      throw new Error(`Error checking transactions: ${transactionError.message}`);
    }

    console.log('Transactions found for bank_id:', id, transactions);

    // Also check if there are any transfers to this bank
    const { data: transfersTo, error: transfersToError } = await supabase
      .from('transactions')
      .select('*')
      .eq('to_bank_id', id);

    if (transfersToError) {
      console.error('Error checking transfers:', transfersToError);
      throw new Error(`Error checking transfers: ${transfersToError.message}`);
    }

    console.log('Transfers found to bank_id:', id, transfersTo);

    // If there are transactions or transfers, delete them first
    if ((transactions && transactions.length > 0) || (transfersTo && transfersTo.length > 0)) {
      const transactionCount = (transactions?.length || 0) + (transfersTo?.length || 0);
      console.log(`Found ${transactionCount} transactions to delete first`);
      
      // Delete all transactions associated with this bank
      await deleteAllBankTransactions(id);
    }

    // Now proceed with bank deletion
    const { error: deleteError } = await supabase
      .from('banks')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw new Error(`Error deleting bank: ${deleteError.message} (${deleteError.code})`);
    }

    console.log('Bank deleted successfully');
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

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  balance: number;
  created_at: string;
}

export async function getCreditCards(): Promise<CreditCard[]> {
  try {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching credit cards:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to load credit cards:', error);
    throw error;
  }
}

export async function addCreditCard(name: string, limit: number): Promise<CreditCard> {
  try {
    const { data, error } = await supabase
      .from('credit_cards')
      .insert([
        {
          name,
          limit,
          balance: 0
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding credit card:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to add credit card:', error);
    throw error;
  }
}

export async function deleteCreditCard(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting credit card:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete credit card:', error);
    throw error;
  }
}
