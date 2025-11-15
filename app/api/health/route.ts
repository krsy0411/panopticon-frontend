import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker healthcheck and monitoring
 * GET /api/health
 */
export async function GET() {
  try {
    // 기본 헬스체크 - 서버가 응답할 수 있는지 확인
    const healthcheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(healthcheck, { status: 200 });
  } catch (error) {
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}
