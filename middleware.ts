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

  // 3. Log Response
  let resBodyStr = "";
  try {
    // Clone response để có thể đọc stream mà không ảnh hưởng tới client
    const clonedRes = response.clone();
    const text = await clonedRes.text();
    try {
      // Ép kiểu format JSON cho đẹp nếu có thể
      resBodyStr = JSON.stringify(JSON.parse(text));
    } catch {
      resBodyStr = text;
    }
  } catch (e) {
    resBodyStr = "[Cannot read response body]";
  }

  console.log(`[${timestamp}] ⬅️ RESPONSE: ${method} ${url} | Status: ${response.status} | Body: ${resBodyStr}`);
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
