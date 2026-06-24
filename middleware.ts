import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const method = request.method;
  const url = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  // 1. Log Request
  let reqBodyStr = "";
  if (method !== "GET" && method !== "HEAD") {
    try {
      const clonedReq = request.clone(); 
      const body = await clonedReq.json();
      reqBodyStr = ` | Body: ${JSON.stringify(body)}`;
    } catch(e) {
      reqBodyStr = " | Body: [Empty or Not JSON]";
    }
  }
  
  console.log(`[${timestamp}] ➡️ REQUEST: ${method} ${url}${reqBodyStr}`);

  // 2. Chuyển tiếp Request tới API routes và lấy Response
  const response = await NextResponse.next();

  console.log(`[${timestamp}] ⬅️ RESPONSE: ${method} ${url} | Status: ${response.status}`);
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
