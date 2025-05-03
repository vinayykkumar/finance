import { supabase } from './supabase';

export interface InvestmentAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  created_at: string;
}

export interface Investment {
  id: string;
  account_id: string;
  name: string;
  symbol?: string;
  purchase_price: number;
  current_price: number;
  quantity: number;
  purchase_date: string;
  created_at: string;
}

export async function getInvestmentAccounts(): Promise<InvestmentAccount[]> {
  try {
    const { data, error } = await supabase
      .from('investment_accounts')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching investment accounts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getInvestmentAccounts:', error);
    throw error;
  }
}

export async function createInvestmentAccount(account: Omit<InvestmentAccount, 'id' | 'created_at'>): Promise<InvestmentAccount> {
  try {
    const { data, error } = await supabase
      .from('investment_accounts')
      .insert({
        name: account.name,
        type: account.type,
        balance: account.balance || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating investment account:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert');
    }

    return data;
  } catch (error) {
    console.error('Error in createInvestmentAccount:', error);
    throw error;
  }
}

export async function updateInvestmentAccount(id: string, updates: Partial<Omit<InvestmentAccount, 'id' | 'created_at'>>): Promise<InvestmentAccount> {
  try {
    const { data, error } = await supabase
      .from('investment_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating investment account:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from update');
    }

    return data;
  } catch (error) {
    console.error('Error in updateInvestmentAccount:', error);
    throw error;
  }
}

export async function deleteInvestmentAccount(id: string): Promise<void> {
  try {
    // First delete all investments in this account
    const { error: investmentsError } = await supabase
      .from('investments')
      .delete()
      .eq('account_id', id);

    if (investmentsError) {
      console.error('Error deleting investments:', investmentsError);
      throw investmentsError;
    }

    // Then delete the account
    const { error } = await supabase
      .from('investment_accounts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting investment account:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteInvestmentAccount:', error);
    throw error;
  }
}

export async function getInvestments(accountId?: string): Promise<Investment[]> {
  try {
    let query = supabase
      .from('investments')
      .select('*')
      .order('name');

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching investments:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getInvestments:', error);
    throw error;
  }
}

export async function createInvestment(investment: Omit<Investment, 'id' | 'created_at'>): Promise<Investment> {
  try {
    const { data, error } = await supabase
      .from('investments')
      .insert({
        account_id: investment.account_id,
        name: investment.name,
        symbol: investment.symbol,
        purchase_price: investment.purchase_price,
        current_price: investment.current_price,
        quantity: investment.quantity,
        purchase_date: investment.purchase_date
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating investment:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert');
    }

    // Update the account balance
    const totalValue = Number(investment.current_price) * Number(investment.quantity);
    await updateInvestmentAccountBalance(investment.account_id, totalValue);

    return data;
  } catch (error) {
    console.error('Error in createInvestment:', error);
    throw error;
  }
}

export async function updateInvestment(id: string, updates: Partial<Omit<Investment, 'id' | 'created_at'>>): Promise<Investment> {
  try {
    // Get the current investment to calculate balance change
    const { data: currentInvestment, error: fetchError } = await supabase
      .from('investments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching investment:', fetchError);
      throw fetchError;
    }

    if (!currentInvestment) {
      throw new Error('Investment not found');
    }

    // Update the investment
    const { data, error } = await supabase
      .from('investments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating investment:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from update');
    }

    // Calculate balance change and update account balance
    if (updates.current_price || updates.quantity) {
      const oldValue = Number(currentInvestment.current_price) * Number(currentInvestment.quantity);
      const newValue = Number(updates.current_price || currentInvestment.current_price) * 
                       Number(updates.quantity || currentInvestment.quantity);
      const balanceChange = newValue - oldValue;
      
      await updateInvestmentAccountBalance(currentInvestment.account_id, balanceChange);
    }

    return data;
  } catch (error) {
    console.error('Error in updateInvestment:', error);
    throw error;
  }
}

export async function deleteInvestment(id: string): Promise<void> {
  try {
    // Get the investment to calculate balance change
    const { data: investment, error: fetchError } = await supabase
      .from('investments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching investment:', fetchError);
      throw fetchError;
    }

    if (!investment) {
      throw new Error('Investment not found');
    }

    // Delete the investment
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting investment:', error);
      throw error;
    }

    // Update the account balance
    const valueToRemove = -(Number(investment.current_price) * Number(investment.quantity));
    await updateInvestmentAccountBalance(investment.account_id, valueToRemove);
  } catch (error) {
    console.error('Error in deleteInvestment:', error);
    throw error;
  }
}

// Helper function to update investment account balance
async function updateInvestmentAccountBalance(accountId: string, amountChange: number): Promise<void> {
  try {
    // Get current balance
    const { data: account, error: fetchError } = await supabase
      .from('investment_accounts')
      .select('balance')
      .eq('id', accountId)
      .single();

    if (fetchError) {
      console.error('Error fetching account balance:', fetchError);
      throw fetchError;
    }

    if (!account) {
      throw new Error('Account not found');
    }

    // Update balance
    const { error } = await supabase
      .from('investment_accounts')
      .update({ balance: Number(account.balance) + amountChange })
      .eq('id', accountId);

    if (error) {
      console.error('Error updating account balance:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateInvestmentAccountBalance:', error);
    throw error;
  }
}
