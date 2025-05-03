import { supabase } from './supabase';

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  month: string;
  created_at: string;
}

export interface BudgetSummaryItem {
  category_id: string;
  budget_amount: number;
  spent_amount: number;
  remaining: number;
  percentage: number;
}

// Local fallback data
const localBudgetData: Budget[] = [];

export async function getBudgets(month: Date): Promise<Budget[]> {
  try {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const formattedMonth = startOfMonth.toISOString().split('T')[0];

    // Check if budgets table exists
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('month', formattedMonth);

      if (error) {
        // If the error is about the table not existing, return local data
        if (error.message.includes('does not exist')) {
          console.error('Budgets table does not exist:', error);
          return localBudgetData;
        }
        console.error('Error fetching budgets:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBudgets:', error);
      // Return empty array as fallback
      return localBudgetData;
    }
  } catch (error) {
    console.error('Error in getBudgets:', error);
    return localBudgetData;
  }
}

export async function createBudget(categoryId: string, amount: number, month: Date): Promise<Budget> {
  try {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const formattedMonth = startOfMonth.toISOString().split('T')[0];

    // First check if a budget already exists for this category and month
    const { data: existingBudget, error: checkError } = await supabase
      .from('budgets')
      .select('*')
      .eq('category_id', categoryId)
      .eq('month', formattedMonth)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing budget:', checkError);
      throw checkError;
    }

    let result;

    if (existingBudget) {
      // If budget exists, update it
      const { data: updatedData, error: updateError } = await supabase
        .from('budgets')
        .update({ amount })
        .eq('id', existingBudget.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating existing budget:', updateError);
        throw updateError;
      }

      result = updatedData;
    } else {
      // If no budget exists, create a new one
      const { data: newData, error: insertError } = await supabase
        .from('budgets')
        .insert({
          category_id: categoryId,
          amount,
          month: formattedMonth
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating new budget:', insertError);
        throw insertError;
      }

      result = newData;
    }

    if (!result) {
      throw new Error('No data returned from operation');
    }

    return result;
  } catch (error) {
    console.error('Error in createBudget:', error);
    throw error;
  }
}

export async function updateBudget(id: string, amount: number): Promise<Budget> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .update({ amount })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from update');
    }

    return data;
  } catch (error) {
    console.error('Error in updateBudget:', error);
    throw error;
  }
}

export async function deleteBudget(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteBudget:', error);
    throw error;
  }
}

export async function getBudgetSummary(month: Date): Promise<BudgetSummaryItem[]> {
  try {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = endOfMonth.toISOString().split('T')[0];
    const formattedMonth = startOfMonth.toISOString().split('T')[0];

    // Get all budgets for the month
    let budgets: { id: string; category_id: string; amount: number }[] = [];
    try {
      const { data: budgetsData, error: budgetError } = await supabase
        .from('budgets')
        .select('id, category_id, amount')
        .eq('month', formattedMonth);

      if (budgetError) {
        // If the error is about the table not existing, use empty array
        if (budgetError.message.includes('does not exist')) {
          console.error('Budgets table does not exist:', budgetError);
          budgets = [];
        } else {
          console.error('Error fetching budgets:', budgetError);
          throw budgetError;
        }
      } else {
        budgets = budgetsData || [];
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
      budgets = [];
    }

    // Get all expense transactions for the month grouped by category
    let expenses: { category_id: string; amount: number }[] = [];
    try {
      const { data: expensesData, error: expenseError } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate)
        .not('category_id', 'is', null);

      if (expenseError) {
        console.error('Error fetching expenses:', expenseError);
        throw expenseError;
      }
      expenses = expensesData || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      expenses = [];
    }

    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {};
    expenses.forEach(expense => {
      if (expense.category_id) {
        spendingByCategory[expense.category_id] = (spendingByCategory[expense.category_id] || 0) + Number(expense.amount);
      }
    });

    // Create summary
    const summary = budgets.map(budget => {
      const spent = spendingByCategory[budget.category_id] || 0;
      const remaining = Number(budget.amount) - spent;
      const percentage = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0;

      return {
        category_id: budget.category_id,
        budget_amount: Number(budget.amount),
        spent_amount: spent,
        remaining: remaining,
        percentage: percentage
      };
    });

    return summary;
  } catch (error) {
    console.error('Error in getBudgetSummary:', error);
    return [];
  }
}

// Get budget analytics with trends compared to previous months
export async function getBudgetAnalytics(month: Date, numberOfMonths: number = 3): Promise<{
  totalBudget: number;
  totalSpent: number;
  topCategories: { category_id: string; percentage: number }[];
  monthlyTrend: { month: string; budget: number; spent: number }[];
}> {
  try {
    // Current month data
    const currentMonthSummary = await getBudgetSummary(month);
    
    // Calculate total budget and spent for current month
    const totalBudget = currentMonthSummary.reduce((sum, item) => sum + item.budget_amount, 0);
    const totalSpent = currentMonthSummary.reduce((sum, item) => sum + item.spent_amount, 0);
    
    // Get top spending categories
    const topCategories = currentMonthSummary
      .sort((a, b) => b.spent_amount - a.spent_amount)
      .slice(0, 3)
      .map(item => ({
        category_id: item.category_id,
        percentage: totalSpent > 0 ? (item.spent_amount / totalSpent) * 100 : 0
      }));
    
    // Get trend data for previous months
    const monthlyTrend: { month: string; budget: number; spent: number }[] = [];
    
    // Add current month to trend
    monthlyTrend.push({
      month: month.toLocaleString('default', { month: 'short', year: 'numeric' }),
      budget: totalBudget,
      spent: totalSpent
    });
    
    // Get data for previous months
    for (let i = 1; i < numberOfMonths; i++) {
      const previousMonth = new Date(month);
      previousMonth.setMonth(month.getMonth() - i);
      
      const monthSummary = await getBudgetSummary(previousMonth);
      const monthBudget = monthSummary.reduce((sum, item) => sum + item.budget_amount, 0);
      const monthSpent = monthSummary.reduce((sum, item) => sum + item.spent_amount, 0);
      
      monthlyTrend.push({
        month: previousMonth.toLocaleString('default', { month: 'short', year: 'numeric' }),
        budget: monthBudget,
        spent: monthSpent
      });
    }
    
    // Reverse to get chronological order
    monthlyTrend.reverse();
    
    return {
      totalBudget,
      totalSpent,
      topCategories,
      monthlyTrend
    };
  } catch (error) {
    console.error('Error in getBudgetAnalytics:', error);
    throw error;
  }
}

// Get budget recommendations based on spending patterns
export async function getBudgetRecommendations(month: Date): Promise<{
  category_id: string;
  current_budget: number;
  recommended_budget: number;
  reason: string;
}[]> {
  try {
    // Get current month's budget summary
    const currentMonthSummary = await getBudgetSummary(month);
    
    // Get previous month for comparison
    const previousMonth = new Date(month);
    previousMonth.setMonth(month.getMonth() - 1);
    const previousMonthSummary = await getBudgetSummary(previousMonth);
    
    // Get average spending for categories over the past 3 months
    const threeMonthsAgo = new Date(month);
    threeMonthsAgo.setMonth(month.getMonth() - 3);
    
    const startDate = threeMonthsAgo.toISOString().split('T')[0];
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0];
    
    // Get all expense transactions for the past 3 months grouped by category
    const { data: expenses, error: expenseError } = await supabase
      .from('transactions')
      .select('category_id, amount, date')
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)
      .not('category_id', 'is', null);
    
    if (expenseError) {
      console.error('Error fetching expenses:', expenseError);
      throw expenseError;
    }
    
    // Group expenses by category and month
    const expensesByCategory: Record<string, { total: number; count: number }> = {};
    
    expenses?.forEach(expense => {
      if (expense.category_id) {
        if (!expensesByCategory[expense.category_id]) {
          expensesByCategory[expense.category_id] = { total: 0, count: 0 };
        }
        expensesByCategory[expense.category_id].total += Number(expense.amount);
        expensesByCategory[expense.category_id].count += 1;
      }
    });
    
    // Generate recommendations
    const recommendations: {
      category_id: string;
      current_budget: number;
      recommended_budget: number;
      reason: string;
    }[] = [];
    
    currentMonthSummary.forEach(budgetItem => {
      const categoryId = budgetItem.category_id;
      const currentBudget = budgetItem.budget_amount;
      const currentSpending = budgetItem.spent_amount;
      
      // Skip if no historical data
      if (!expensesByCategory[categoryId]) return;
      
      const avgMonthlySpending = expensesByCategory[categoryId].total / 3;
      let recommendedBudget = currentBudget;
      let reason = '';
      
      // If consistently overspending
      if (currentSpending > currentBudget && avgMonthlySpending > currentBudget) {
        recommendedBudget = Math.ceil(avgMonthlySpending * 1.1 / 100) * 100; // Round up to nearest 100
        reason = 'Consistent overspending in this category';
      }
      // If consistently underspending by a significant amount
      else if (currentSpending < currentBudget * 0.7 && avgMonthlySpending < currentBudget * 0.7) {
        recommendedBudget = Math.ceil(avgMonthlySpending * 1.2 / 100) * 100; // Round up to nearest 100
        reason = 'Significantly under budget in this category';
      }
      
      // Only add if there's a recommendation to change
      if (recommendedBudget !== currentBudget) {
        recommendations.push({
          category_id: categoryId,
          current_budget: currentBudget,
          recommended_budget: recommendedBudget,
          reason
        });
      }
    });
    
    return recommendations;
  } catch (error) {
    console.error('Error in getBudgetRecommendations:', error);
    throw error;
  }
}
