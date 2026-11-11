import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const testKey = 'test:ping';
    const testVal = { ping: 'pong', timestamp: Date.now() };
    
    // Test write
    await redis.set(testKey, JSON.stringify(testVal), { ex: 30 });
    
    // Test read
    const readVal = await redis.get(testKey);
    
    return NextResponse.json({
      success: true,
      message: 'Redis connection successful!',
      written: testVal,
      read: readVal
    });
  } catch (error: any) {
    console.error('Redis test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
