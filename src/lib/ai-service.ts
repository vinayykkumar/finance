import { apiClient, handleApiResponse } from './api-client';

export interface SpendingPrediction {
  category_id: string;
  predicted_amount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
}

export interface FinancialInsight {
  type: 'warning' | 'tip' | 'achievement';
  title: string;
  message: string;
  action_items: string[];
  priority: number;
}

export interface CategorySuggestion {
  category_id: string | null;
  category_name: string | null;
  confidence: number;
  reason: string;
}

export interface SpendingAnomaly {
  category_id: string;
  category_name: string;
  unusual_amount: number;
  average_amount: number;
  deviation_percentage: number;
  message: string;
}

export interface BudgetRecommendation {
  category_id: string;
  category_name: string;
  recommended_budget: number;
  average_spending: number;
  recent_trend: 'increasing' | 'decreasing' | 'stable';
  reason: string;
  confidence: number;
}

export interface SpendingAnalysis {
  spending_by_day_of_week: Record<string, {
    total: number;
    average: number;
    transaction_count: number;
  }>;
  spending_by_time_of_month: Record<string, number>;
  average_transaction_size: Record<string, number>;
  spending_velocity: {
    average_days_between_transactions: number;
    transactions_per_week: number;
    spending_frequency: 'high' | 'medium' | 'low';
  };
  recommendations: string[];
}

export interface SmartTransactionResult {
  suggested_category: CategorySuggestion;
  insights: string[];
  anomaly_detected: boolean;
  recommendations: string[];
}

// AI Service Functions
export async function getSpendingPredictions(): Promise<SpendingPrediction[]> {
  try {
    const response = await apiClient.get<SpendingPrediction[]>('/ai/predict-spending');
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to get spending predictions:', error);
    throw error;
  }
}

export async function suggestCategory(description: string, amount: number): Promise<CategorySuggestion> {
  try {
    const response = await apiClient.post<CategorySuggestion>('/ai/suggest-category', {
      description,
      amount
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to get category suggestion:', error);
    throw error;
  }
}

export async function getFinancialInsights(): Promise<FinancialInsight[]> {
  try {
    const response = await apiClient.get<FinancialInsight[]>('/ai/insights');
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to get financial insights:', error);
    throw error;
  }
}

export async function detectSpendingAnomalies(): Promise<SpendingAnomaly[]> {
  try {
    const response = await apiClient.get<SpendingAnomaly[]>('/ai/anomalies');
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to detect spending anomalies:', error);
    throw error;
  }
}

export async function getAIBudgetRecommendations(year: number, month: number): Promise<BudgetRecommendation[]> {
  try {
    const response = await apiClient.get<BudgetRecommendation[]>(`/ai/budget-recommendations?year=${year}&month=${month}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to get AI budget recommendations:', error);
    throw error;
  }
}

export async function analyzeSpendingHabits(): Promise<SpendingAnalysis> {
  try {
    const response = await apiClient.get<SpendingAnalysis>('/ai/spending-analysis');
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to analyze spending habits:', error);
    throw error;
  }
}

export async function createSmartTransaction(description: string, amount: number): Promise<SmartTransactionResult> {
  try {
    const response = await apiClient.post<SmartTransactionResult>('/ai/smart-transaction', {
      description,
      amount
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to create smart transaction:', error);
    throw error;
  }
}