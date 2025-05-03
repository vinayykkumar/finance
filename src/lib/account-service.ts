import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a Supabase client with anonymous access
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Don't persist auth state
  }
});

export type AccountType = 'bank' | 'credit';

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: AccountType;
  limit?: number; // Only for credit cards
  created_at: string;
}

export async function getAccounts(): Promise<Account[]> {
  try {
    // Get banks
    const { data: banks, error: bankError } = await supabase
      .from('banks')
      .select('*')
      .order('created_at', { ascending: true });

    if (bankError) {
      console.error('Error fetching banks:', bankError);
      throw bankError;
    }

    // Get credit cards
    const { data: creditCards, error: creditError } = await supabase
      .from('credit_cards')
      .select('*')
      .order('created_at', { ascending: true });

    if (creditError) {
      console.error('Error fetching credit cards:', creditError);
      throw creditError;
    }

    // Transform banks to Account type
    const bankAccounts: Account[] = (banks || []).map(bank => ({
      ...bank,
      type: 'bank' as const,
    }));

    // Transform credit cards to Account type
    const creditAccounts: Account[] = (creditCards || []).map(card => ({
      ...card,
      type: 'credit' as const,
    }));

    // Combine and return all accounts
    return [...bankAccounts, ...creditAccounts];
  } catch (error) {
    console.error('Failed to load accounts:', error);
    throw error;
  }
}

export async function addAccount(account: Omit<Account, 'id' | 'created_at'>): Promise<Account> {
  try {
    const table = account.type === 'bank' ? 'banks' : 'credit_cards';
    const { data, error } = await supabase
      .from(table)
      .insert([{
        name: account.name,
        balance: account.balance || 0,
        ...(account.type === 'credit' ? { limit: account.limit } : {})
      }])
      .select()
      .single();

    if (error) {
      console.error(`Error adding ${account.type}:`, error);
      throw error;
    }

    return {
      ...data,
      type: account.type
    };
  } catch (error) {
    console.error(`Failed to add ${account.type}:`, error);
    throw error;
  }
}

export async function updateAccountBalance(accountId: string, amount: number, accountType: AccountType): Promise<void> {
  const table = accountType === 'bank' ? 'banks' : 'credit_cards';
  
  // First get current balance
  const { data: account, error: fetchError } = await supabase
    .from(table)
    .select('balance')
    .eq('id', accountId)
    .single();

  if (fetchError) {
    console.error('Error fetching account:', fetchError);
    throw new Error(`Failed to fetch account: ${fetchError.message}`);
  }

  if (!account) {
    throw new Error('Account not found');
  }

  // Update with new balance
  const { error: updateError } = await supabase
    .from(table)
    .update({ balance: account.balance + amount })
    .eq('id', accountId);

  if (updateError) {
    console.error('Error updating account balance:', updateError);
    throw new Error(`Failed to update account balance: ${updateError.message}`);
  }
}

export async function deleteAccount(id: string, accountType: AccountType): Promise<void> {
  try {
    const table = accountType === 'bank' ? 'banks' : 'credit_cards';
    
    // For banks, we need to handle transactions
    if (accountType === 'bank') {
      // Delete associated transactions
      await deleteAllBankTransactions(id);
    }

    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw new Error(`Error deleting ${accountType}: ${deleteError.message}`);
    }
  } catch (error) {
    console.error('Detailed error:', error);
    throw error;
  }
}

// Helper function to delete all transactions associated with a bank
async function deleteAllBankTransactions(bankId: string): Promise<void> {
  // First delete transactions where this is the source bank
  const { error: sourceError } = await supabase
    .from('transactions')
    .delete()
    .eq('bank_id', bankId);
  
  if (sourceError) {
    throw new Error(`Error deleting source transactions: ${sourceError.message}`);
  }
  
  // Then delete transactions where this is the destination bank (transfers)
  const { error: destError } = await supabase
    .from('transactions')
    .delete()
    .eq('to_bank_id', bankId);
  
  if (destError) {
    throw new Error(`Error deleting destination transactions: ${destError.message}`);
  }
}