// lib/neon.ts
import { neon } from '@neondatabase/serverless';

// Database connection
const sql = neon(process.env.DATABASE_URL!); // This should now correctly pull from Vercel's DATABASE_URL

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_type: 'checking' | 'savings';
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal' | 'transfer';
  description: string;
  created_at: string;
}

export class NeonDB {
  static async testConnection() {
    try {
      const result = await sql`SELECT NOW() as current_time`;
      return {
        success: true,
        data: result[0],
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        message: 'Database connection failed'
      };
    }
  }

  // --- NEW METHOD: Get a specific user by ID ---
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await sql`
        SELECT * FROM users
        WHERE id = ${userId}
        LIMIT 1
      `;
      return result.length > 0 ? result[0] as User : null;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      return null;
    }
  }

  // --- NEW METHOD: Get accounts for a specific user ---
  static async getAccountsByUserId(userId: string): Promise<Account[] | null> {
    try {
      const result = await sql`
        SELECT * FROM accounts
        WHERE user_id = ${userId}
        ORDER BY account_type DESC
      `;
      return result as Account[];
    } catch (error) {
      console.error(`Error fetching accounts for user ID ${userId}:`, error);
      return null;
    }
  }

  // --- MODIFIED: Get transactions for a specific user ---
  static async getTransactionsByUserId(userId: string, limit: number = 10): Promise<Transaction[] | null> {
    try {
      const result = await sql`
        SELECT t.*, u.name as user_name
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE t.user_id = ${userId}
        ORDER BY t.created_at DESC
        LIMIT ${limit}
      `;
      return result as Transaction[];
    } catch (error) {
      console.error(`Error fetching transactions for user ID ${userId}:`, error);
      return null;
    }
  }

  // Keep original getUsers if it's used elsewhere (or remove if only getUserById is needed)
  static async getUsers(limit: number = 10): Promise<User[] | null> {
    try {
      const result = await sql`
        SELECT * FROM users
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
      return result as User[];
    } catch (error) {
      console.error('Error fetching users:', error);
      return null;
    }
  }


  static async initializeSchema() {
    try {
      // Enable UUID extension first
      await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

      // Drop existing tables if they exist (for clean setup)
      await sql`DROP TABLE IF EXISTS transactions CASCADE`;
      await sql`DROP TABLE IF EXISTS accounts CASCADE`;
      await sql`DROP TABLE IF EXISTS users CASCADE`;

      // Create users table
      await sql`
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Create accounts table
      await sql`
        CREATE TABLE accounts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('checking', 'savings')),
          balance DECIMAL(15,2) DEFAULT 0.00,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Create transactions table
      await sql`
        CREATE TABLE transactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
          amount DECIMAL(15,2) NOT NULL,
          transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer')),
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Create indexes for better performance
      await sql`CREATE INDEX idx_users_email ON users(email)`;
      await sql`CREATE INDEX idx_accounts_user_id ON accounts(user_id)`;
      await sql`CREATE INDEX idx_transactions_user_id ON transactions(user_id)`;
      await sql`CREATE INDEX idx_transactions_account_id ON transactions(account_id)`;
      await sql`CREATE INDEX idx_transactions_created_at ON transactions(created_at)`;

      return {
        success: true,
        message: 'Database schema initialized successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Schema initialization failed',
        message: 'Failed to initialize database schema'
      };
    }
  }

  static async seedTestData() {
    try {
      // Check if data already exists
      const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
      if (existingUsers[0].count > 0) {
        return {
          success: true,
          message: 'Test data already exists, skipping seed'
        };
      }

      // Insert test users
      await sql`
        INSERT INTO users (email, name) VALUES
        ('john.doe@example.com', 'John Doe'),
        ('jane.smith@example.com', 'Jane Smith'),
        ('mike.johnson@example.com', 'Mike Johnson'),
        ('sarah.wilson@example.com', 'Sarah Wilson'),
        ('david.brown@example.com', 'David Brown')
      `;

      // Get user IDs
      const users = await sql`SELECT id FROM users ORDER BY created_at`;

      // Insert test accounts
      for (const user of users) {
        await sql`
          INSERT INTO accounts (user_id, account_type, balance) VALUES
          (${user.id}, 'checking', ${Math.floor(Math.random() * 5000) + 1000}),
          (${user.id}, 'savings', ${Math.floor(Math.random() * 10000) + 5000})
        `;
      }

      // Get account IDs
      const accounts = await sql`SELECT id, user_id FROM accounts`;

      // Insert test transactions
      const transactionTypes = ['deposit', 'withdrawal', 'transfer'];
      const descriptions = [
        'ATM Withdrawal',
        'Direct Deposit',
        'Online Transfer',
        'Mobile Check Deposit',
        'Bill Payment',
        'Grocery Store Purchase',
        'Gas Station Purchase',
        'Restaurant Payment'
      ];

      for (const account of accounts) {
        for (let i = 0; i < 5; i++) {
          const amount = Math.floor(Math.random() * 500) + 10;
          const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
          const description = descriptions[Math.floor(Math.random() * descriptions.length)];

          await sql`
            INSERT INTO transactions (user_id, account_id, amount, transaction_type, description)
            VALUES (${account.user_id}, ${account.id}, ${amount}, ${type}, ${description})
          `;
        }
      }

      return {
        success: true,
        message: 'Test data seeded successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Seeding failed',
        message: 'Failed to seed test data'
      };
    }
  }
}

export default NeonDB;
