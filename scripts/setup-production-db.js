#!/usr/bin/env node

/**
 * Production Database Setup Script
 * Run this after deployment to initialize the production database
 */

const { NeonDB } = require('../lib/neon');

async function setupProductionDatabase() {
  console.log('🚀 Starting production database setup...');
  
  try {
    // Test connection
    console.log('1. Testing database connection...');
    const connectionTest = await NeonDB.testConnection();
    if (!connectionTest.success) {
      throw new Error(`Database connection failed: ${connectionTest.error}`);
    }
    console.log('✅ Database connection successful');

    // Initialize schema
    console.log('2. Initializing database schema...');
    const schemaResult = await NeonDB.initializeSchema();
    if (!schemaResult.success) {
      throw new Error(`Schema initialization failed: ${schemaResult.error}`);
    }
    console.log('✅ Database schema initialized');

    // Check if we should seed data
    const users = await NeonDB.getUsers(1);
    if (!users || users.length === 0) {
      console.log('3. Seeding initial data...');
      const seedResult = await NeonDB.seedTestData();
      if (!seedResult.success) {
        throw new Error(`Data seeding failed: ${seedResult.error}`);
      }
      console.log('✅ Initial data seeded');
    } else {
      console.log('3. Database already contains data, skipping seed');
    }

    // Verify setup
    console.log('4. Verifying database setup...');
    const finalUsers = await NeonDB.getUsers(5);
    const finalTransactions = await NeonDB.getTransactions(5);
    
    console.log(`✅ Database setup complete!`);
    console.log(`   - Users: ${finalUsers ? finalUsers.length : 0}`);
    console.log(`   - Transactions: ${finalTransactions ? finalTransactions.length : 0}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupProductionDatabase();
}

module.exports = { setupProductionDatabase };
