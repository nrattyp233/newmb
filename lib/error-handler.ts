import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle known AppError instances
  if (error instanceof AppError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.details : undefined,
      timestamp: new Date().toISOString()
    }, { status: error.status });
  }

  // Handle database connection errors
  if (error instanceof Error && error.message.includes('database')) {
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      code: 'DATABASE_ERROR',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }

  // Handle rate limiting errors
  if (error instanceof Error && error.message.includes('rate limit')) {
    return NextResponse.json({
      success: false,
      error: 'Rate limit exceeded',
      code: 'RATE_LIMIT',
      timestamp: new Date().toISOString()
    }, { status: 429 });
  }

  // Handle validation errors
  if (error instanceof Error && error.message.includes('validation')) {
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  const isProduction = process.env.NODE_ENV === 'production';

  return NextResponse.json({
    success: false,
    error: isProduction ? 'Internal server error' : message,
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    stack: isProduction ? undefined : error instanceof Error ? error.stack : undefined
  }, { status: 500 });
}

export function validateEnvironment() {
  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_STACK_PROJECT_ID',
    'STACK_SECRET_SERVER_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new AppError(
      `Missing required environment variables: ${missingVars.join(', ')}`,
      500,
      'ENVIRONMENT_ERROR'
    );
  }
}

export function createRateLimiter(requests: number, windowMs: number) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, value] of requestCounts) {
      if (value.resetTime < windowStart) {
        requestCounts.delete(key);
      }
    }

    const current = requestCounts.get(identifier);
    
    if (!current) {
      requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (current.resetTime < now) {
      requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (current.count >= requests) {
      return false;
    }

    current.count++;
    return true;
  };
}

// Rate limiter for API endpoints
export const rateLimiter = createRateLimiter(100, 60000); // 100 requests per minute

export function withErrorHandling(handler: (request: Request) => Promise<NextResponse>) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      // Environment validation
      validateEnvironment();

      // Rate limiting
      const clientIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      
      if (!rateLimiter(clientIp)) {
        throw new AppError('Rate limit exceeded', 429, 'RATE_LIMIT');
      }

      return await handler(request);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
