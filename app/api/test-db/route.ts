import { NextResponse } from 'next/server';
import Database from '@/lib/neon';

export async function GET() {
  try {
    // First, check if environment variables are loaded
    const envCheck = {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'Found' : 'Missing',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Found' : 'Missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing'
    };

    console.log('Environment variables check:', envCheck);
    console.log('Supabase URL:', process.env.SUPABASE_URL);

    // Create a fresh client with service role key for testing
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test basic connection first
    console.log('Testing basic database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (connectionError) {
      console.error('Connection error:', connectionError);
      return NextResponse.json({ 
        success: false, 
        error: connectionError.message,
        message: 'Basic database connection failed',
        envCheck,
        details: connectionError
      }, { status: 500 });
    }

    console.log('Basic connection successful, testing users table...');

    // Test database connection by trying to fetch users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      return NextResponse.json({ 
        success: false, 
        error: usersError.message,
        message: 'Database connection failed - tables may not exist',
        envCheck
      }, { status: 500 });
    }

    // Test transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .limit(5);

    if (transactionsError) {
      return NextResponse.json({ 
        success: false, 
        error: transactionsError.message,
        message: 'Transactions table not accessible'
      }, { status: 500 });
    }

    // Test accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .limit(5);

    if (accountsError) {
      return NextResponse.json({ 
        success: false, 
        error: accountsError.message,
        message: 'Accounts table not accessible'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        users: users || [],
        transactions: transactions || [],
        accounts: accounts || [],
        userCount: users?.length || 0,
        transactionCount: transactions?.length || 0,
        accountCount: accounts?.length || 0
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database connection failed'
    }, { status: 500 });
  }
}
