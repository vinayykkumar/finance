/*
  # Finance Tracker Schema

  1. New Tables
    - `banks`
      - `id` (uuid, primary key)
      - `name` (text)
      - `balance` (decimal)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `color` (text)
      - `icon` (text)
      - `user_id` (uuid, foreign key)
      - `preferred_bank_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `fixed_expenses`
      - `id` (uuid, primary key)
      - `name` (text)
      - `amount` (decimal)
      - `category_id` (uuid, foreign key)
      - `bank_id` (uuid, foreign key)
      - `due_day` (integer)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `description` (text)
      - `amount` (decimal)
      - `type` (text)
      - `category_id` (uuid, foreign key)
      - `bank_id` (uuid, foreign key)
      - `date` (date)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `monthly_budgets`
      - `id` (uuid, primary key)
      - `month` (date)
      - `category_id` (uuid, foreign key)
      - `amount` (decimal)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create banks table
CREATE TABLE IF NOT EXISTS banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  balance decimal NOT NULL DEFAULT 0,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  icon text NOT NULL,
  monthly_limit decimal DEFAULT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  preferred_bank_id uuid REFERENCES banks(id),
  created_at timestamptz DEFAULT now()
);

-- Create fixed_expenses table
CREATE TABLE IF NOT EXISTS fixed_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount decimal NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id),
  bank_id uuid NOT NULL REFERENCES banks(id),
  due_day integer NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount decimal NOT NULL,
  type text NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  category_id uuid REFERENCES categories(id),
  bank_id uuid NOT NULL REFERENCES banks(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create monthly_budgets table
CREATE TABLE IF NOT EXISTS monthly_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id),
  amount decimal NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own banks"
  ON banks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own fixed expenses"
  ON fixed_expenses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own monthly budgets"
  ON monthly_budgets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);