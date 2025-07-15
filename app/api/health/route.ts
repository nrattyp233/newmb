import { NextResponse } from 'next/server';
import { NeonDB } from '@/lib/neon';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test database connection
    const dbTest = await NeonDB.testConnection();
    const dbLatency = Date.now() - startTime;
    
    // System health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: {
          status: dbTest.success ? 'healthy' : 'unhealthy',
          latency: dbLatency,
          message: dbTest.message,
          error: dbTest.error || null
        },
        api: {
          status: 'healthy',
          latency: Date.now() - startTime
        }
      }
    };

    // If any service is unhealthy, return 503
    const isUnhealthy = Object.values(health.services).some(
      service => service.status === 'unhealthy'
    );

    if (isUnhealthy) {
      health.status = 'unhealthy';
      return NextResponse.json(health, { status: 503 });
    }

    return NextResponse.json(health, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Health check failed'
    }, { status: 500 });
  }
}

// Also respond to HEAD requests for monitoring
export async function HEAD() {
  try {
    const dbTest = await NeonDB.testConnection();
    
    if (dbTest.success) {
      return new Response(null, { status: 200 });
    } else {
      return new Response(null, { status: 503 });
    }
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}
