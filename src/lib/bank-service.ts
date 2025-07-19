import { localDB } from './local-storage-db';

export interface Bank {
  id: string;
  name: string;
  balance: number;
  user_id?: string;
  created_at: string;
}

export async function getBanks(userId?: string): Promise<Bank[]> {
  try {
    const banks = localDB.findAll<Bank>('banks');
    return banks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch (error) {
    console.error('Failed to load banks:', error);
    throw error;
  }
}

export async function addBank(name: string, initialBalance: number, userId?: string): Promise<Bank> {
  try {
    console.log('Adding bank with:', { name, initialBalance, userId });

    const newBank = localDB.create<Bank>('banks', {
      name,
      balance: initialBalance,
      user_id: userId,
    });

    console.log('Bank added successfully:', newBank);
    return newBank;
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
    const bank = localDB.findById<Bank>('banks', bankId);
    if (!bank) {
      throw new Error('Bank not found');
    }

    const updatedBank = localDB.update<Bank>('banks', bankId, {
      balance: bank.balance + amount,
    });

    if (!updatedBank) {
      throw new Error('Failed to update bank balance');
    }
  } catch (error) {
    console.error('Error in updateBankBalance:', error);
    throw error;
  }
}

// Helper function to delete all transactions associated with a bank
async function deleteAllBankTransactions(bankId: string): Promise<void> {
  console.log('Deleting all transactions for bank ID:', bankId);
  
  // Get all transactions
  const transactions = localDB.findAll('transactions');
  
  // Filter out transactions related to this bank
  const transactionsToDelete = transactions.filter(
    (tx: any) => tx.bank_id === bankId || tx.to_bank_id === bankId
  );
  
  // Delete each transaction
  transactionsToDelete.forEach((tx: any) => {
    localDB.delete('transactions', tx.id);
  });
  
  console.log('Successfully deleted all transactions for bank');
}

export async function deleteBank(id: string): Promise<void> {
  try {
    console.log('Deleting bank with ID:', id);

    // Check if there are any transactions associated with this bank
    const transactions = localDB.findWhere('transactions', (tx: any) => 
      tx.bank_id === id || tx.to_bank_id === id
    );

    console.log('Transactions found for bank_id:', id, transactions);

    // If there are transactions, delete them first
    if (transactions.length > 0) {
      console.log(`Found ${transactions.length} transactions to delete first`);
      await deleteAllBankTransactions(id);
    }

    // Now proceed with bank deletion
    const deleted = localDB.delete('banks', id);
    if (!deleted) {
      throw new Error('Bank not found');
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

export async function getCreditCards(userId?: string): Promise<CreditCard[]> {
  try {
    const creditCards = localDB.findAll<CreditCard>('credit_cards');
    return creditCards.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch (error) {
    console.error('Failed to load credit cards:', error);
    throw error;
  }
}

export async function addCreditCard(name: string, limit: number, userId?: string): Promise<CreditCard> {
  try {
    const newCreditCard = localDB.create<CreditCard>('credit_cards', {
      name,
      limit,
      balance: 0,
      user_id: userId,
    });

    return newCreditCard;
  } catch (error) {
    console.error('Failed to add credit card:', error);
    throw error;
  }
}

export async function deleteCreditCard(id: string): Promise<void> {
  try {
    const deleted = localDB.delete('credit_cards', id);
    if (!deleted) {
      throw new Error('Credit card not found');
    }
  } catch (error) {
    console.error('Failed to delete credit card:', error);
    throw error;
  }
}
