-- Create a function to create the goals table if it doesn't exist
CREATE OR REPLACE FUNCTION create_goals_table()
RETURNS void AS $$
BEGIN
  -- Check if the goals table exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'goals'
  ) THEN
    -- Create the goals table
    CREATE TABLE public.goals (
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
    
    RAISE NOTICE 'Goals table created successfully!';
  ELSE
    RAISE NOTICE 'Goals table already exists.';
  END IF;
END;
$$ LANGUAGE plpgsql;
