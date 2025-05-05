import { supabase } from './supabase';
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
    let query = supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
      
    // Filter by user_id if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to load categories:', error);
    throw error;
  }
}

export async function createCategory(category: Partial<CategoryType>, userId?: string): Promise<CategoryType> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          name: category.name,
          color: category.color,
          icon: category.icon,
          monthly_limit: category.monthly_limit || null,
          user_id: userId
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create category:', error);
    throw error;
  }
}

export async function updateCategory(categoryId: string, updates: Partial<CategoryType>): Promise<CategoryType> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: updates.name,
        color: updates.color,
        icon: updates.icon,
        monthly_limit: updates.monthly_limit,
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error;
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
}

export async function getCategoryExpenses(categoryId: string, date: Date, userId?: string): Promise<number> {
  try {
    // Get month start and end dates
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Format dates for Supabase query
    const startDate = monthStart.toISOString().split('T')[0];
    const endDate = monthEnd.toISOString().split('T')[0];

    // Build query
    let query = supabase
      .from('transactions')
      .select('amount')
      .eq('category_id', categoryId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);
      
    // Filter by user_id if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching category expenses:', error);
      throw error;
    }

    // Sum up all expenses
    const totalExpense = data.reduce((sum, transaction) => sum + transaction.amount, 0);
    return totalExpense;
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
  // Get category details
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('monthly_limit')
    .eq('id', categoryId)
    .single();

  if (categoryError) throw categoryError;
  if (!category?.monthly_limit) return { isOverLimit: false, currentTotal: 0 };

  // Get current month's expenses
  const currentTotal = await getCategoryExpenses(categoryId, new Date());
  const newTotal = currentTotal + amount;

  return {
    isOverLimit: newTotal > category.monthly_limit,
    currentTotal: newTotal,
    limit: category.monthly_limit
  };
}
