import { apiClient, handleApiResponse } from './api-client';
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
    const response = await apiClient.get<MonthlySpending[]>(`/reports/monthly-spending?months=${months}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in getMonthlySpending:', error);
    throw error;
  }
}

export async function getMonthlyIncome(months: number = 6): Promise<MonthlyIncome[]> {
  try {
    const response = await apiClient.get<MonthlyIncome[]>(`/reports/monthly-income?months=${months}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in getMonthlyIncome:', error);
    throw error;
  }
}

export async function getCategorySpending(month: Date): Promise<CategorySpending[]> {
  try {
    const year = month.getFullYear();
    const monthNum = month.getMonth() + 1;
    
    const response = await apiClient.get<CategorySpending[]>(`/reports/category-spending?year=${year}&month=${monthNum}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in getCategorySpending:', error);
    throw error;
  }
}

export async function getNetWorthData(months: number = 12): Promise<NetWorthData[]> {
  try {
    const response = await apiClient.get<NetWorthData[]>(`/reports/net-worth?months=${months}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in getNetWorthData:', error);
    throw error;
  }
}