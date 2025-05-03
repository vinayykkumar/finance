-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own banks" ON banks;
DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;
DROP POLICY IF EXISTS "Users can manage their own fixed expenses" ON fixed_expenses;
DROP POLICY IF EXISTS "Users can manage their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage their own monthly budgets" ON monthly_budgets;

-- Disable RLS on all tables
ALTER TABLE banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_budgets DISABLE ROW LEVEL SECURITY;

-- Make user_id nullable
ALTER TABLE banks ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE categories ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE fixed_expenses ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE transactions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE monthly_budgets ALTER COLUMN user_id DROP NOT NULL;
