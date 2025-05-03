import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250502_create_budgets_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying budgets table migration...');
    
    // Execute the SQL directly using the REST API
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error applying migration:', error);
      
      // If the exec_sql function doesn't exist, we need to create it first
      if (error.message.includes('function "exec_sql" does not exist')) {
        console.log('Creating exec_sql function first...');
        
        // Create the exec_sql function
        const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$;
          
          -- Grant execute permission to authenticated users
          GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
        `;
        
        const { error: funcError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
        
        if (funcError) {
          console.error('Error creating exec_sql function:', funcError);
          console.log('You may need to create the budgets table manually through the Supabase dashboard.');
          process.exit(1);
        }
        
        // Try applying the migration again
        const { error: retryError } = await supabase.rpc('exec_sql', { sql: migrationSQL });
        
        if (retryError) {
          console.error('Error applying migration after creating function:', retryError);
          process.exit(1);
        }
      } else {
        process.exit(1);
      }
    }
    
    console.log('Migration applied successfully!');
    console.log('The budgets table has been created in your Supabase database.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

applyMigration();
