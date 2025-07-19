import { apiClient, handleApiResponse } from './api-client';

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

export async function getBudgets(month: Date): Promise<Budget[]> {
  try {
    const year = month.getFullYear();
    const monthNum = month.getMonth() + 1;
    
    const response = await apiClient.get<Budget[]>(`/budgets?year=${year}&month=${monthNum}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in getBudgets:', error);
    throw error;
  }
}

export async function createBudget(categoryId: string, amount: number, month: Date): Promise<Budget> {
  try {
    const year = month.getFullYear();
    const monthNum = month.getMonth() + 1;

    const response = await apiClient.post<Budget>('/budgets', {
      category_id: categoryId,
      amount,
      year,
      month: monthNum,
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in createBudget:', error);
    throw error;
  }
}

export async function updateBudget(id: string, amount: number): Promise<Budget> {
  try {
    const response = await apiClient.patch<Budget>(`/budgets/${id}`, { amount });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in updateBudget:', error);
    throw error;
  }
}

export async function deleteBudget(id: string): Promise<void> {
  try {
    const response = await apiClient.delete(`/budgets/${id}`);
    handleApiResponse(response);
  } catch (error) {
    console.error('Error in deleteBudget:', error);
    throw error;
  }
}

export async function getBudgetSummary(month: Date): Promise<BudgetSummaryItem[]> {
  try {
    const year = month.getFullYear();
    const monthNum = month.getMonth() + 1;
    
    const response = await apiClient.get<BudgetSummaryItem[]>(`/budgets/summary?year=${year}&month=${monthNum}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in getBudgetSummary:', error);
    throw error;
  }
}

export async function getBudgetAnalytics(month: Date, numberOfMonths: number = 3): Promise<{
  totalBudget: number;
  totalSpent: number;
  topCategories: { category_id: string; percentage: number }[];
  monthlyTrend: { month: string; budget: number; spent: number }[];
}> {
  try {
    const year = month.getFullYear();
    const monthNum = month.getMonth() + 1;
    
    const response = await apiClient.get<{
      totalBudget: number;
      totalSpent: number;
      topCategories: { category_id: string; percentage: number }[];
      monthlyTrend: { month: string; budget: number; spent: number }[];
    }>(`/budgets/analytics?year=${year}&month=${monthNum}&months=${numberOfMonths}`);
    
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in getBudgetAnalytics:', error);
    throw error;
  }
}

export async function getBudgetRecommendations(month: Date): Promise<{
  category_id: string;
  current_budget: number;
  recommended_budget: number;
  reason: string;
}[]> {
  try {
    const year = month.getFullYear();
    const monthNum = month.getMonth() + 1;
    
    const response = await apiClient.get<{
      category_id: string;
      current_budget: number;
      recommended_budget: number;
      reason: string;
    }[]>(`/budgets/recommendations?year=${year}&month=${monthNum}`);
    
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in getBudgetRecommendations:', error);
    throw error;
  }
}