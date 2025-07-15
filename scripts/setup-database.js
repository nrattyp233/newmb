const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n').filter(line => line.includes('='));
  
  envVars.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').replace(/"/g, '');
    if (key && value) {
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Found' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Money Buddy Database');
    console.log('==================================');
    console.log('');
    console.log('✅ Environment variables loaded');
    console.log('📊 Supabase URL:', supabaseUrl);
    console.log('');

    // Create users table
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
      console.error('❌ Error creating users table:', usersError.message);
    } else {
      console.log('✅ Users table created successfully');
    }

    // Create accounts table
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
      console.error('❌ Error creating accounts table:', accountsError.message);
    } else {
      console.log('✅ Accounts table created successfully');
    }

    // Create transactions table
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
      console.error('❌ Error creating transactions table:', transactionsError.message);
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
      console.error('❌ Error creating test user:', testUserError.message);
    } else {
      console.log('✅ Test user created successfully');
      console.log('User ID:', testUser.id);
    }

    // Create a test account for the user
    if (testUser) {
      console.log('Creating test account...');
      const { data: testAccount, error: testAccountError } = await supabase
        .from('accounts')
        .insert([
          {
            user_id: testUser.id,
            account_number: '1234567890',
            account_type: 'checking',
            balance: 1000.00
          }
        ])
        .select()
        .single();

      if (testAccountError) {
        console.error('❌ Error creating test account:', testAccountError.message);
      } else {
        console.log('✅ Test account created successfully');
        console.log('Account ID:', testAccount.id);
      }

      // Add some sample transactions
      console.log('Creating sample transactions...');
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: testUser.id,
            account_id: testAccount?.id,
            type: 'deposit',
            amount: 500.00,
            fee: 2.50,
            description: 'Initial deposit',
            status: 'completed'
          },
          {
            user_id: testUser.id,
            account_id: testAccount?.id,
            type: 'withdrawal',
            amount: 100.00,
            fee: 1.50,
            description: 'ATM withdrawal',
            status: 'completed'
          },
          {
            user_id: testUser.id,
            account_id: testAccount?.id,
            type: 'transfer',
            amount: 200.00,
            fee: 0.00,
            description: 'Transfer to savings',
            status: 'completed'
          }
        ]);

      if (transactionError) {
        console.error('❌ Error creating sample transactions:', transactionError.message);
      } else {
        console.log('✅ Sample transactions created successfully');
      }
    }

    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('Your Money Buddy app is now ready to use with real data.');
    console.log('');
    console.log('🔗 Next steps:');
    console.log('1. Visit http://localhost:3000/admin to verify database status');
    console.log('2. Visit http://localhost:3000/dashboard to see the app with real data');
    console.log('3. Test user login with: test@moneybuddy.com');
    console.log('');
    console.log('🎯 Your Money Buddy app is now connected to real data!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
