import { apiClient, handleApiResponse } from './api-client';
import { Category as CategoryType } from '../types';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  monthly_limit?: number;
  user_id?: string;
  created_at: string;
}

export async function getCategories(userId?: string): Promise<CategoryType[]> {
  try {
    const response = await apiClient.get<CategoryType[]>('/categories');
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to load categories:', error);
    throw error;
  }
}

export async function createCategory(category: Partial<CategoryType>, userId?: string): Promise<CategoryType> {
  try {
    const response = await apiClient.post<CategoryType>('/categories', {
      name: category.name!,
      color: category.color!,
      icon: category.icon!,
      monthly_limit: category.monthly_limit,
      user_id: userId,
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to create category:', error);
    throw error;
  }
}

export async function updateCategory(categoryId: string, updates: Partial<CategoryType>): Promise<CategoryType> {
  try {
    const response = await apiClient.patch<CategoryType>(`/categories/${categoryId}`, updates);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error;
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const response = await apiClient.delete(`/categories/${categoryId}`);
    handleApiResponse(response);
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
}

export async function getCategoryExpenses(categoryId: string, date: Date, userId?: string): Promise<number> {
  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const response = await apiClient.get<{ total_expenses: number }>(`/categories/${categoryId}/expenses?year=${year}&month=${month}`);
    const result = handleApiResponse(response);
    
    return result.total_expenses || 0;
  } catch (error) {
    console.error('Failed to get category expenses:', error);
    throw error;
  }
}

export async function checkCategoryLimit(categoryId: string, amount: number): Promise<{
  isOverLimit: boolean;
  currentTotal: number;
  limit?: number;
}> {
  try {
    const response = await apiClient.post<{
      isOverLimit: boolean;
      currentTotal: number;
      limit?: number;
    }>(`/categories/${categoryId}/check-limit`, { amount });
    
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to check category limit:', error);
    // Return safe defaults on error
    return { isOverLimit: false, currentTotal: 0 };
  }
}