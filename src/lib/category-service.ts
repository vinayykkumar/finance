import { supabase } from './supabase';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  monthly_limit?: number;
  user_id?: string;
  created_at: string;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    throw error; // Throw error instead of returning empty array for consistency
  }
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  try {
    // Log the category data we're trying to insert
    console.log('Creating category:', {
      ...category,
    });

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        color: category.color,
        icon: category.icon,
        monthly_limit: category.monthly_limit || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create category:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert');
    }

    console.log('Category created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw error;
  }
}

export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<Category> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from update');
    }

    return data;
  } catch (error) {
    console.error('Error in updateCategory:', error);
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function getCategoryExpenses(categoryId: string, month: Date): Promise<number> {
  // Get total expenses for this category in the given month
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('category_id', categoryId)
    .eq('type', 'expense')
    .gte('date', startOfMonth.toISOString().split('T')[0])
    .lte('date', endOfMonth.toISOString().split('T')[0]);

  if (error) throw error;
  
  // Sum up all expenses
  return (data || []).reduce((total, tx) => total + Number(tx.amount), 0);
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
