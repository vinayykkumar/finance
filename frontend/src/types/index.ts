import { apiClient, handleApiResponse } from './api-client';
import { Transaction as TransactionType } from '../types';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  category_id?: string;
  bank_id: string;
  to_bank_id?: string; // For transfer transactions
  date: string;
  user_id?: string;
  created_at: string;
}

export async function createTransaction(transaction: TransactionType | Omit<TransactionType, 'id' | 'created_at'>): Promise<TransactionType> {
  try {
    // Input validation
    if (isNaN(transaction.amount) || transaction.amount <= 0) {
      throw new Error('Transaction amount must be a positive number');
    }
    
    if (!transaction.bank_id) {
      throw new Error('Bank account is required');
    }
    
    if (transaction.type === 'transfer' && !transaction.to_bank_id) {
      throw new Error('Destination account is required for transfers');
    }

    const response = await apiClient.post<TransactionType>('/transactions', {
      description: transaction.description || '',
      amount: transaction.amount,
      type: transaction.type,
      category_id: transaction.category_id,
      date: transaction.date,
      bank_id: transaction.bank_id,
      to_bank_id: transaction.to_bank_id,
      user_id: transaction.user_id,
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to create transaction:', error);
    throw error;
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  try {
    console.log('Deleting transaction with ID:', id);

    const response = await apiClient.delete(`/transactions/${id}`);
    handleApiResponse(response);

    console.log('Transaction deleted successfully');
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      throw error;
    } else if (typeof error === 'object' && error !== null) {
      throw new Error(JSON.stringify(error));
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}

export async function getTransactions(userId?: string): Promise<TransactionType[]> {
  try {
    const response = await apiClient.get<TransactionType[]>('/transactions');
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to load transactions:', error);
    throw error;
  }
}

export async function getTransactionsByMonth(year: number, month: number, userId?: string): Promise<TransactionType[]> {
  try {
    const response = await apiClient.get<TransactionType[]>(`/transactions?year=${year}&month=${month}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to load transactions by month:', error);
    throw error;
  }
}