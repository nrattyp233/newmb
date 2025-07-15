import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test if we can make external requests at all
    const response = await fetch('https://httpbin.org/json');
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Network connectivity test successful',
      data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Network connectivity test failed'
    }, { status: 500 });
  }
}
