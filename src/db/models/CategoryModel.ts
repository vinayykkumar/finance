/**
 * Category Model
 * 
 * Handles operations related to the categories table in the database.
 */

import { Tables } from '../schemas/schema';
import { BaseModel } from './BaseModel';
import { supabase } from '../../lib/supabase';

type Category = Tables['categories'];

export class CategoryModel extends BaseModel<Category> {
  constructor() {
    super('categories');
  }

  /**
   * Get categories with their spending amounts for a given month
   */
  async getCategoriesWithSpending(year: number, month: number): Promise<(Category & { total_spent: number })[]> {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    // First get all categories
    const categories = await this.findAll({ column: 'name' });
    
    // Then get all transactions for the month
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
    
    // Calculate spending for each category
    return categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.category_id === category.id);
      const total_spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...category,
        total_spent
      };
    });
  }

  /**
   * Get spending by category for a specific month
   */
  async getMonthlySpending(year: number, month: number): Promise<{ categoryId: string, categoryName: string, amount: number }[]> {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
      // We'll use a more efficient query with joins
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          categories (
            id,
            name
          )
        `)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate)
        .not('category_id', 'is', null);
      
      if (error) {
        throw error;
      }
      
      // Process the data to aggregate by category
      const spendingByCategory: Record<string, { categoryId: string, categoryName: string, amount: number }> = {};
      
      data.forEach((transaction: any) => {
        if (!transaction.categories) return;
        
        const categoryId = transaction.categories.id;
        const categoryName = transaction.categories.name;
        
        if (!spendingByCategory[categoryId]) {
          spendingByCategory[categoryId] = {
            categoryId,
            categoryName,
            amount: 0
          };
        }
        
        spendingByCategory[categoryId].amount += transaction.amount;
      });
      
      return Object.values(spendingByCategory);
    } catch (error) {
      console.error('Error getting monthly spending by category:', error);
      throw error;
    }
  }
} 