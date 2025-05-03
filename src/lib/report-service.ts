import { supabase } from './supabase';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export interface MonthlySpending {
  month: string;
  category_id: string;
  total_amount: number;
}

export interface MonthlyIncome {
  month: string;
  total_amount: number;
}

export interface CategorySpending {
  category_id: string;
  category_name: string;
  total_amount: number;
  percentage: number;
}

export interface NetWorthData {
  date: string;
  bank_assets: number;
  investment_assets: number;
  credit_card_debt: number;
  net_worth: number;
}

export async function getMonthlySpending(months: number = 6): Promise<MonthlySpending[]> {
  try {
    const endDate = new Date();
    const startDate = subMonths(endDate, months);
    
    const { data, error } = await supabase
      .from('monthly_spending')
      .select('*')
      .gte('month', format(startDate, 'yyyy-MM-dd'))
      .lte('month', format(endDate, 'yyyy-MM-dd'))
      .order('month', { ascending: false });

    if (error) {
      console.error('Error fetching monthly spending:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMonthlySpending:', error);
    throw error;
  }
}

export async function getMonthlyIncome(months: number = 6): Promise<MonthlyIncome[]> {
  try {
    const endDate = new Date();
    const startDate = subMonths(endDate, months);
    
    const { data, error } = await supabase
      .from('monthly_income')
      .select('*')
      .gte('month', format(startDate, 'yyyy-MM-dd'))
      .lte('month', format(endDate, 'yyyy-MM-dd'))
      .order('month', { ascending: false });

    if (error) {
      console.error('Error fetching monthly income:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMonthlyIncome:', error);
    throw error;
  }
}

export async function getCategorySpending(month: Date): Promise<CategorySpending[]> {
  try {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    // Get all transactions for the month
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('amount, category_id')
      .eq('type', 'expense')
      .gte('date', format(start, 'yyyy-MM-dd'))
      .lte('date', format(end, 'yyyy-MM-dd'))
      .not('category_id', 'is', null);
      
    if (txError) {
      console.error('Error fetching transactions:', txError);
      throw txError;
    }
    
    // Get all categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name');
      
    if (catError) {
      console.error('Error fetching categories:', catError);
      throw catError;
    }
    
    // Create a map of category IDs to names
    const categoryMap = new Map();
    categories?.forEach(cat => {
      categoryMap.set(cat.id, cat.name);
    });
    
    // Group transactions by category and calculate totals
    const spendingByCategory: Record<string, number> = {};
    let totalSpending = 0;
    
    transactions?.forEach(tx => {
      if (tx.category_id) {
        spendingByCategory[tx.category_id] = (spendingByCategory[tx.category_id] || 0) + Number(tx.amount);
        totalSpending += Number(tx.amount);
      }
    });
    
    // Create the result array
    const result: CategorySpending[] = Object.entries(spendingByCategory).map(([categoryId, amount]) => ({
      category_id: categoryId,
      category_name: categoryMap.get(categoryId) || 'Unknown',
      total_amount: amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
    }));
    
    // Sort by amount descending
    return result.sort((a, b) => b.total_amount - a.total_amount);
  } catch (error) {
    console.error('Error in getCategorySpending:', error);
    throw error;
  }
}

export async function getNetWorthData(months: number = 12): Promise<NetWorthData[]> {
  try {
    const result: NetWorthData[] = [];
    const today = new Date();
    
    // Generate data for each month
    for (let i = 0; i < months; i++) {
      const date = subMonths(today, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthLabel = format(monthStart, 'yyyy-MM-dd');
      
      // Get bank balances for the month
      const { data: banks, error: bankError } = await supabase
        .from('banks')
        .select('balance')
        .lte('created_at', format(monthEnd, 'yyyy-MM-dd'));
        
      if (bankError) {
        console.error('Error fetching banks:', bankError);
        throw bankError;
      }
      
      // Get investment account balances for the month
      const { data: investments, error: invError } = await supabase
        .from('investment_accounts')
        .select('balance')
        .lte('created_at', format(monthEnd, 'yyyy-MM-dd'));
        
      if (invError) {
        console.error('Error fetching investments:', invError);
        throw invError;
      }
      
      // Get credit card balances for the month
      const { data: creditCards, error: ccError } = await supabase
        .from('credit_cards')
        .select('balance')
        .lte('created_at', format(monthEnd, 'yyyy-MM-dd'));
        
      if (ccError) {
        console.error('Error fetching credit cards:', ccError);
        throw ccError;
      }
      
      // Calculate totals
      const bankAssets = banks?.reduce((sum, bank) => sum + Number(bank.balance), 0) || 0;
      const investmentAssets = investments?.reduce((sum, inv) => sum + Number(inv.balance), 0) || 0;
      const creditCardDebt = creditCards?.reduce((sum, cc) => sum + Number(cc.balance), 0) || 0;
      const netWorth = bankAssets + investmentAssets - creditCardDebt;
      
      result.push({
        date: monthLabel,
        bank_assets: bankAssets,
        investment_assets: investmentAssets,
        credit_card_debt: creditCardDebt,
        net_worth: netWorth
      });
    }
    
    // Sort by date ascending
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error in getNetWorthData:', error);
    throw error;
  }
}
