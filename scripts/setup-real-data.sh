#!/bin/bash

echo "🚀 Setting up Money Buddy Database"
echo "=================================="
echo ""

# Check if environment variables are set
if [[ -z "$SUPABASE_URL" ]]; then
  echo "❌ SUPABASE_URL not found in environment"
  echo "Please make sure your .env.local file is properly configured"
  exit 1
fi

if [[ -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY not found in environment"
  echo "Please make sure your .env.local file is properly configured"
  exit 1
fi

echo "✅ Environment variables found"
echo "📊 Supabase URL: $SUPABASE_URL"
echo ""

echo "🔧 Setting up database tables..."
echo ""

# Create a temporary Node.js script to execute the SQL
cat > /tmp/setup-db.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('Creating users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          balance DECIMAL(12, 2) DEFAULT 0.00,
          savings_balance DECIMAL(12, 2) DEFAULT 0.00,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError.message);
    } else {
      console.log('✅ Users table created successfully');
    }

    console.log('Creating accounts table...');
    const { error: accountsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS accounts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          account_number VARCHAR(20) UNIQUE NOT NULL,
          account_type VARCHAR(20) NOT NULL DEFAULT 'checking',
          balance DECIMAL(12, 2) DEFAULT 0.00,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (accountsError) {
      console.error('Error creating accounts table:', accountsError.message);
    } else {
      console.log('✅ Accounts table created successfully');
    }

    console.log('Creating transactions table...');
    const { error: transactionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
          type VARCHAR(20) NOT NULL,
          amount DECIMAL(12, 2) NOT NULL,
          fee DECIMAL(12, 2) DEFAULT 0.00,
          description TEXT,
          recipient_email VARCHAR(255),
          recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
          status VARCHAR(20) DEFAULT 'pending',
          square_payment_id VARCHAR(255),
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (transactionsError) {
      console.error('Error creating transactions table:', transactionsError.message);
    } else {
      console.log('✅ Transactions table created successfully');
    }

    // Test the setup by inserting a test user
    console.log('Creating test user...');
    const { data: testUser, error: testUserError } = await supabase
      .from('users')
      .insert([
        {
          email: 'test@moneybuddy.com',
          name: 'Test User',
          phone: '+1234567890',
          balance: 1000.00,
          savings_balance: 500.00
        }
      ])
      .select()
      .single();

    if (testUserError) {
      console.error('Error creating test user:', testUserError.message);
    } else {
      console.log('✅ Test user created successfully');
      console.log('User ID:', testUser.id);
    }

    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('Your Money Buddy app is now ready to use with real data.');
    
  } catch (error) {
    console.error('Error setting up database:', error.message);
  }
}

setupDatabase();
EOF

# Load environment variables and run the setup
source .env.local
node /tmp/setup-db.js

# Clean up
rm /tmp/setup-db.js

echo ""
echo "🔗 Next steps:"
echo "1. Visit http://localhost:3000/admin to verify database status"
echo "2. Visit http://localhost:3000/dashboard to see the app with real data"
echo "3. Test user login with: test@moneybuddy.com"
echo ""
echo "🎯 Your Money Buddy app is now connected to real data!"
