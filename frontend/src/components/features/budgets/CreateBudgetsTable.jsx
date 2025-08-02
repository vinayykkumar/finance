import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function CreateBudgetsTable() {
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function setupBudgetsTable() {
      try {
        setStatus('Checking if budgets table exists...');
        
        // Try to query the budgets table to see if it exists
        const { data, error: checkError } = await supabase
          .from('budgets')
          .select('id')
          .limit(1);
        
        // If no error, table exists
        if (!checkError) {
          setStatus('Budgets table already exists.');
          setSuccess(true);
          return;
        }
        
        setStatus('Creating budgets table...');
        
        // SQL to create the budgets table
        const sql = `
          CREATE TABLE IF NOT EXISTS budgets (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
            amount DECIMAL(12, 2) NOT NULL,
            month DATE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Enable Row Level Security
          ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
          
          -- Create policy for anonymous access
          DROP POLICY IF EXISTS "Allow full access to budgets table" ON budgets;
          CREATE POLICY "Allow full access to budgets table" 
          ON budgets FOR ALL 
          USING (true);
          
          -- Add budgets to public schema for access
          GRANT ALL ON budgets TO anon, authenticated, service_role;
        `;
        
        // Execute the SQL
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
        
        if (sqlError) {
          setStatus('Error creating budgets table: ' + sqlError.message);
          setError(sqlError);
          return;
        }
        
        setStatus('Verifying budgets table was created...');
        
        // Verify the table was created
        const { error: verifyError } = await supabase
          .from('budgets')
          .select('id')
          .limit(1);
        
        if (verifyError) {
          setStatus('Error verifying budgets table: ' + verifyError.message);
          setError(verifyError);
          return;
        }
        
        setStatus('Budgets table created successfully!');
        setSuccess(true);
        
      } catch (err) {
        setStatus('Error: ' + err.message);
        setError(err);
      }
    }
    
    setupBudgetsTable();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Create Budgets Table</h1>
      
      <div style={{ 
        padding: '15px', 
        borderRadius: '5px',
        backgroundColor: error ? '#ffebee' : success ? '#e8f5e9' : '#e3f2fd',
        marginBottom: '20px'
      }}>
        <h3>Status: {status}</h3>
        {error && (
          <div>
            <h4>Error Details:</h4>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
      </div>
      
      {!success && !error && (
        <div>
          <p>Creating the budgets table in your Supabase database...</p>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#e0e0e0' }}>
            <div style={{ 
              width: '30%', 
              height: '100%', 
              backgroundColor: '#2196f3',
              animation: 'progress 1.5s infinite ease-in-out'
            }} />
          </div>
          <style>{`
            @keyframes progress {
              0% { width: 0%; }
              50% { width: 50%; }
              100% { width: 100%; }
            }
          `}</style>
        </div>
      )}
      
      {success && (
        <div>
          <p>✅ The budgets table has been successfully created in your Supabase database.</p>
          <p>You can now use the Budget section of your application with full database support.</p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Return to Application
          </button>
        </div>
      )}
      
      {error && (
        <div>
          <p>❌ There was an error creating the budgets table.</p>
          <p>Please try the following manual steps:</p>
          <ol>
            <li>Go to the <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer">Supabase dashboard</a></li>
            <li>Select your project</li>
            <li>Go to the SQL Editor</li>
            <li>Run the following SQL:</li>
          </ol>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            overflowX: 'auto'
          }}>
{`CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  month DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access
DROP POLICY IF EXISTS "Allow full access to budgets table" ON budgets;
CREATE POLICY "Allow full access to budgets table" 
ON budgets FOR ALL 
USING (true);

-- Add budgets to public schema for access
GRANT ALL ON budgets TO anon, authenticated, service_role;`}
          </pre>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '20px'
            }}
          >
            Return to Application
          </button>
        </div>
      )}
    </div>
  );
}
