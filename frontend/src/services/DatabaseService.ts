/**
 * Database Service
 * 
 * This service is the entry point for all database operations.
 * It provides access to all models and handles common operations.
 */

import { BankModel } from '../db/models/BankModel';
import { CategoryModel } from '../db/models/CategoryModel';
import { TransactionModel } from '../db/models/TransactionModel';

class DatabaseService {
  private static instance: DatabaseService;
  
  // Model instances
  public banks: BankModel;
  public categories: CategoryModel;
  public transactions: TransactionModel;
  
  private constructor() {
    // Initialize all models
    this.banks = new BankModel();
    this.categories = new CategoryModel();
    this.transactions = new TransactionModel();
  }
  
  /**
   * Get the singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    
    return DatabaseService.instance;
  }
  
  /**
   * Get a financial summary for a specific month
   */
  async getMonthlyFinancialSummary(year: number, month: number) {
    try {
      // Get income, expenses, and categories in parallel
      const [
        totalIncome,
        totalExpenses,
        categoriesWithSpending
      ] = await Promise.all([
        this.transactions.getTotalIncomeByMonth(year, month),
        this.transactions.getTotalExpensesByMonth(year, month),
        this.categories.getCategoriesWithSpending(year, month)
      ]);
      
      // Get total balance
      const totalBalance = await this.banks.getTotalBalance();
      
      // Calculate savings rate
      const savingsRate = totalIncome > 0 
        ? ((totalIncome - totalExpenses) / totalIncome) * 100 
        : 0;
      
      return {
        totalIncome,
        totalExpenses,
        netCashflow: totalIncome - totalExpenses,
        totalBalance,
        savingsRate,
        categoriesWithSpending
      };
    } catch (error) {
      console.error('Error getting monthly financial summary:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const db = DatabaseService.getInstance(); 