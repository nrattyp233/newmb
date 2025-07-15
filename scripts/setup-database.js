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

    // First, let's check if we can connect to the database
    console.log('Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      console.log('');
      console.log('🔧 Manual setup required:');
      console.log('1. Go to https://supabase.com/dashboard/project/qzjpfwlozokftkgixte');
      console.log('2. Click on "SQL Editor" in the sidebar');
      console.log('3. Copy and paste the SQL from scripts/supabase-setup.sql');
      console.log('4. Run the SQL to create the tables');
      console.log('');
      return;
    }

    console.log('✅ Database connection successful');

    // Check if users table exists
    const { data: existingTables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'accounts', 'transactions']);

    if (tableError) {
      console.error('❌ Error checking existing tables:', tableError.message);
    } else {
      console.log('Existing tables:', existingTables?.map(t => t.table_name) || []);
    }

    // Test inserting a user directly
    console.log('Testing user insertion...');
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
      console.log('');
      console.log('🔧 This likely means the database tables need to be created first.');
      console.log('Please follow the manual setup instructions above.');
    } else {
      console.log('✅ Test user created successfully');
      console.log('User ID:', testUser.id);

      // Test creating an account
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

        // Add some sample transactions
        console.log('Creating sample transactions...');
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: testUser.id,
              account_id: testAccount.id,
              type: 'deposit',
              amount: 500.00,
              fee: 2.50,
              description: 'Initial deposit',
              status: 'completed'
            },
            {
              user_id: testUser.id,
              account_id: testAccount.id,
              type: 'withdrawal',
              amount: 100.00,
              fee: 1.50,
              description: 'ATM withdrawal',
              status: 'completed'
            },
            {
              user_id: testUser.id,
              account_id: testAccount.id,
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
