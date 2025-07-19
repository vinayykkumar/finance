import { localDB } from './local-storage-db';
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
    const categories = localDB.findAll<CategoryType>('categories');
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Failed to load categories:', error);
    throw error;
  }
}

export async function createCategory(category: Partial<CategoryType>, userId?: string): Promise<CategoryType> {
  try {
    const newCategory = localDB.create<CategoryType>('categories', {
      name: category.name!,
      color: category.color!,
      icon: category.icon!,
      monthly_limit: category.monthly_limit,
      user_id: userId,
    });

    return newCategory;
  } catch (error) {
    console.error('Failed to create category:', error);
    throw error;
  }
}

export async function updateCategory(categoryId: string, updates: Partial<CategoryType>): Promise<CategoryType> {
  try {
    const updatedCategory = localDB.update<CategoryType>('categories', categoryId, updates);
    if (!updatedCategory) {
      throw new Error('Category not found');
    }

    return updatedCategory;
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error;
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const deleted = localDB.delete('categories', categoryId);
    if (!deleted) {
      throw new Error('Category not found');
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

    // Get all transactions for this category
    const transactions = localDB.findWhere('transactions', (tx: any) => 
      tx.category_id === categoryId && 
      tx.type === 'expense' &&
      new Date(tx.date) >= monthStart &&
      new Date(tx.date) <= monthEnd
    );

    // Sum up all expenses
    const totalExpense = transactions.reduce((sum, transaction: any) => sum + transaction.amount, 0);
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
  const category = localDB.findById<CategoryType>('categories', categoryId);
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
