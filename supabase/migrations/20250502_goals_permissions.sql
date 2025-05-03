-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access
CREATE POLICY "Allow full access to goals table" 
ON goals FOR ALL 
USING (true);

-- Add goals to public schema for access
GRANT ALL ON goals TO anon, authenticated, service_role;
