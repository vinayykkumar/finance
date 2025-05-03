-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  target_date DATE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access
CREATE POLICY "Allow full access to goals table" 
ON goals FOR ALL 
USING (true);

-- Add goals to public schema for access
GRANT ALL ON goals TO anon, authenticated, service_role;

-- Insert sample goals data
INSERT INTO goals (name, target_amount, current_amount, target_date, category_id, is_completed)
VALUES
  ('Emergency Fund', 300000, 150000, NOW() + INTERVAL '6 months', NULL, FALSE),
  ('New Car', 1200000, 400000, NOW() + INTERVAL '2 years', (SELECT id FROM categories WHERE name = 'Shopping' LIMIT 1), FALSE),
  ('Vacation Fund', 150000, 150000, NOW() - INTERVAL '1 month', (SELECT id FROM categories WHERE name = 'Travel' LIMIT 1), TRUE);
