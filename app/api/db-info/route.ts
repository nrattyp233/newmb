import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    console.log('Checking PostgreSQL version and extensions...');
    
    // Check PostgreSQL version
    const versionResult = await sql`SELECT version()`;
    console.log('PostgreSQL version:', versionResult[0].version);

    // Check available extensions
    const extensionsResult = await sql`SELECT * FROM pg_available_extensions WHERE name LIKE '%uuid%'`;
    console.log('UUID extensions:', extensionsResult);

    // Check if gen_random_uuid is available
    try {
      const uuidTest = await sql`SELECT gen_random_uuid() as test_uuid`;
      console.log('gen_random_uuid works:', uuidTest[0].test_uuid);
    } catch (error) {
      console.log('gen_random_uuid not available:', error);
    }

    return NextResponse.json({
      success: true,
      version: versionResult[0].version,
      extensions: extensionsResult,
      message: 'Database info retrieved successfully'
    });

  } catch (error) {
    console.error('Database info error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to get database info'
    }, { status: 500 });
  }
}
