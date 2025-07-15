import { NextResponse } from 'next/server';
import { NeonDB } from '@/lib/neon';
import { withErrorHandling, AppError } from '@/lib/error-handler';

export const GET = withErrorHandling(async (request: Request) => {
  console.log('Testing Neon database connection...');
  
  // Test basic connection
  const connectionTest = await NeonDB.testConnection();
  if (!connectionTest.success) {
    throw new AppError(
      connectionTest.error || 'Database connection failed',
      503,
      'DATABASE_CONNECTION_ERROR'
    );
  }

  console.log('Connection successful, initializing schema...');
  
  // Initialize database schema
  const schemaResult = await NeonDB.initializeSchema();
  if (!schemaResult.success) {
    throw new AppError(
      schemaResult.error || 'Failed to initialize database schema',
      500,
      'DATABASE_SCHEMA_ERROR'
    );
  }

  console.log('Schema initialized, seeding test data...');
  
  // Seed test data
  const seedResult = await NeonDB.seedTestData();
  if (!seedResult.success) {
    throw new AppError(
      seedResult.error || 'Failed to seed test data',
      500,
      'DATABASE_SEED_ERROR'
    );
  }

  // Fetch test data
  const users = await NeonDB.getUsers(5);
  const transactions = await NeonDB.getTransactions(10);

  if (!users || !transactions) {
    throw new AppError(
      'Failed to fetch test data',
      500,
      'DATABASE_FETCH_ERROR'
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Neon database setup completed successfully!',
    data: {
      connectionTime: connectionTest.data?.current_time,
      schemaMessage: schemaResult.message,
      seedMessage: seedResult.message,
      users,
      transactions,
      userCount: users.length,
      transactionCount: transactions.length
    }
  });
});

export const POST = withErrorHandling(async (request: Request) => {
  // Force re-initialization of schema and data
  const schemaResult = await NeonDB.initializeSchema();
  const seedResult = await NeonDB.seedTestData();

  if (!schemaResult.success) {
    throw new AppError(
      schemaResult.error || 'Failed to re-initialize schema',
      500,
      'DATABASE_SCHEMA_ERROR'
    );
  }

  if (!seedResult.success) {
    throw new AppError(
      seedResult.error || 'Failed to re-seed data',
      500,
      'DATABASE_SEED_ERROR'
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Database re-initialized successfully',
    schemaResult,
    seedResult
  });
});
