export interface Bank {
  id: string;
  name: string;
  balance: number;
  user_id?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  currency: string;
  theme: "light" | "dark" | "system";
  notifications_enabled: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthSession {
  user: User | null;
  session: any;
  isLoading: boolean;
}

export interface Transaction {
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
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  monthly_limit?: number;
  user_id?: string;
  created_at?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  balance: number;
  created_at: string;
}

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  month: string;
  user_id?: string;
  created_at?: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category_id?: string;
  is_completed: boolean;
  user_id?: string;
  created_at?: string;
}

export interface Investment {
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
}

export interface InvestmentAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  user_id?: string;
  created_at?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: "expense" | "income" | "transfer";
  category_id?: string;
  bank_id: string;
  to_bank_id?: string;
  user_id?: string;
  created_at?: string;
}

export type TabType = 
  | "dashboard" 
  | "accounts" 
  | "categories" 
  | "transactions" 
  | "budgets" 
  | "goals" 
  | "investments" 
  | "reports";

export type ReportType = "spending" | "income" | "categories" | "networth";

export interface CategorySpending {
  spent: number;
  limit: number;
} 