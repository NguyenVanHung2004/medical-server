import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Thêm timestamp và thông tin cơ bản của request
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${request.method} ${request.nextUrl.pathname}${request.nextUrl.search}`);
  
  return NextResponse.next();
}

export const config = {
  // Chỉ áp dụng middleware này cho các route bắt đầu bằng /api/
  matcher: '/api/:path*',
};
