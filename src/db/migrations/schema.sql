-- Finance Application Database Schema

-- Banks table to store banking accounts
CREATE TABLE IF NOT EXISTS banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table for transaction categorization
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  monthly_limit NUMERIC,
  user_id UUID REFERENCES auth.users(id),
  preferred_bank_id UUID REFERENCES banks(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table for financial transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  category_id UUID REFERENCES categories(id),
  bank_id UUID NOT NULL REFERENCES banks(id),
  to_bank_id UUID REFERENCES banks(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit cards table
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  limit NUMERIC NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets table for category-based budgeting
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id),
  amount NUMERIC NOT NULL,
  month TEXT NOT NULL, -- Format: YYYY-MM
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table for financial goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  target_date DATE NOT NULL,
  category_id UUID REFERENCES categories(id),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment accounts table
CREATE TABLE IF NOT EXISTS investment_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments table for individual investments
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES investment_accounts(id),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  purchase_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  quantity NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction templates for recurring transactions
CREATE TABLE IF NOT EXISTS transaction_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  category_id UUID REFERENCES categories(id),
  bank_id UUID NOT NULL REFERENCES banks(id),
  to_bank_id UUID REFERENCES banks(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Views for monthly analysis
CREATE OR REPLACE VIEW monthly_spending AS
  SELECT 
    TO_CHAR(date, 'YYYY-MM') AS month,
    category_id,
    SUM(amount) AS total_amount
  FROM transactions
  WHERE type = 'expense'
  GROUP BY month, category_id;

CREATE OR REPLACE VIEW monthly_income AS
  SELECT 
    TO_CHAR(date, 'YYYY-MM') AS month,
    SUM(amount) AS total_amount
  FROM transactions
  WHERE type = 'income'
  GROUP BY month;

-- Function to update bank balance atomically
CREATE OR REPLACE FUNCTION update_bank_balance(bank_id UUID, amount_change NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE banks
  SET balance = balance + amount_change
  WHERE id = bank_id;
END;
$$ LANGUAGE plpgsql; 