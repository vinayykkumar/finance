/**
 * Database Schema Types
 * 
 * This file defines TypeScript types that represent the database schema.
 * It provides a central reference for all database tables and their relationships.
 */

import { Database } from '@supabase/supabase-js';

export type Tables = {
  banks: {
    id: string;
    name: string;
    balance: number;
    user_id?: string;
    created_at: string;
  };
  
  categories: {
    id: string;
    name: string;
    color: string;
    icon: string;
    monthly_limit?: number;
    user_id?: string;
    preferred_bank_id?: string;
    created_at?: string;
  };
  
  transactions: {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: "expense" | "income" | "transfer";
    category_id?: string;
    bank_id: string;
    to_bank_id?: string;
    user_id?: string;
    created_at: string;
  };
  
  credit_cards: {
    id: string;
    name: string;
    limit: number;
    balance: number;
    user_id?: string;
    created_at: string;
  };
  
  budgets: {
    id: string;
    category_id: string;
    amount: number;
    month: string;
    user_id?: string;
    created_at?: string;
  };
  
  goals: {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    target_date: string;
    category_id?: string;
    is_completed: boolean;
    user_id?: string;
    created_at?: string;
  };
  
  investment_accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
    user_id?: string;
    created_at?: string;
  };
  
  investments: {
    id: string;
    account_id: string;
    name: string;
    symbol: string;
    purchase_price: number;
    current_price: number;
    quantity: number;
    purchase_date: string;
    user_id?: string;
    created_at?: string;
  };
  
  transaction_templates: {
    id: string;
    name: string;
    description?: string;
    amount: number;
    type: "expense" | "income" | "transfer";
    category_id?: string;
    bank_id: string;
    to_bank_id?: string;
    user_id?: string;
    created_at?: string;
  };
}

// Define view types
export type Views = {
  monthly_spending: {
    month: string;
    category_id: string;
    total_amount: number;
  };
  
  monthly_income: {
    month: string;
    total_amount: number;
  };
}

// Define function types
export type Functions = {
  update_bank_balance: {
    Args: {
      bank_id: string;
      amount_change: number;
    };
    Returns: void;
  };
}

// Define the database schema type
export type Schema = {
  Tables: Tables;
  Views: Views;
  Functions: Functions;
}

// Define the full database type to be used with Supabase
export type DatabaseDefinition = Database<Schema>; 