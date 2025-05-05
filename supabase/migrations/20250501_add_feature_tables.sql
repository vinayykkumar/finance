-- Budget Planning
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  month DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);

-- Financial Goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  target_date DATE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments
CREATE TABLE IF NOT EXISTS investment_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g., stocks, mutual funds, crypto
  balance DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES investment_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  symbol TEXT,
  purchase_price DECIMAL(12, 2) NOT NULL,
  current_price DECIMAL(12, 2) NOT NULL,
  quantity DECIMAL(12, 4) NOT NULL,
  purchase_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction Templates
CREATE TABLE IF NOT EXISTS transaction_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  bank_id UUID REFERENCES banks(id) ON DELETE SET NULL,
  to_bank_id UUID REFERENCES banks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add views for financial reports
CREATE OR REPLACE VIEW monthly_spending AS
SELECT
  date_trunc('month', date::date) AS month,
  category_id,
  SUM(amount) AS total_amount
FROM transactions
WHERE type = 'expense'
GROUP BY month, category_id
ORDER BY month DESC, total_amount DESC;

CREATE OR REPLACE VIEW monthly_income AS
SELECT
  date_trunc('month', date::date) AS month,
  SUM(amount) AS total_amount
FROM transactions
WHERE type = 'income'
GROUP BY month
ORDER BY month DESC;

-- Add RPC function for updating bank balance (to prevent race conditions)
