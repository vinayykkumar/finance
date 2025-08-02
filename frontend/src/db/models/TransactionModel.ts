/**
 * Transaction Model
 * 
 * Handles operations related to the transactions table in the database.
 */

import { Tables } from '../schemas/schema';
import { BaseModel } from './BaseModel';
import { supabase } from '../../lib/supabase';

type Transaction = Tables['transactions'];

export class TransactionModel extends BaseModel<Transaction> {
  constructor() {
    super('transactions');
  }

  /**
   * Get transactions for a specific month
   */
  async getByMonth(year: number, month: number): Promise<Transaction[]> {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions by month:', error);
      throw error;
    }
    
    return data as Transaction[];
  }

  /**
   * Get transactions by category
   */
  async getByCategory(categoryId: string): Promise<Transaction[]> {
    return this.findBy('category_id', categoryId);
  }

  /**
   * Get transactions by bank
   */
  async getByBank(bankId: string): Promise<Transaction[]> {
    return this.findBy('bank_id', bankId);
  }

  /**
   * Get total income for a specific month
   */
  async getTotalIncomeByMonth(year: number, month: number): Promise<number> {
    const transactions = await this.getByMonth(year, month);
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Get total expenses for a specific month
   */
  async getTotalExpensesByMonth(year: number, month: number): Promise<number> {
    const transactions = await this.getByMonth(year, month);
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Create a transaction and update bank balances
   */
  async createWithBalanceUpdate(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    // Start a database transaction
    const { data, error } = await supabase.from(this.tableName)
      .insert(transaction)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
    
    // Update bank balances
    try {
      // For regular transactions, update the source bank
      if (transaction.type === 'expense') {
        await supabase.rpc('update_bank_balance', {
          bank_id: transaction.bank_id,
          amount_change: -transaction.amount
        });
      } else if (transaction.type === 'income') {
        await supabase.rpc('update_bank_balance', {
          bank_id: transaction.bank_id,
          amount_change: transaction.amount
        });
      } else if (transaction.type === 'transfer' && transaction.to_bank_id) {
        // For transfers, update both source and destination banks
        await supabase.rpc('update_bank_balance', {
          bank_id: transaction.bank_id,
          amount_change: -transaction.amount
        });
        
        await supabase.rpc('update_bank_balance', {
          bank_id: transaction.to_bank_id,
          amount_change: transaction.amount
        });
      }
    } catch (error) {
      console.error('Error updating bank balances:', error);
      // Consider rollback if possible
      throw error;
    }
    
    return data as Transaction;
  }
} 