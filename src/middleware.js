import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. 抓取使用者想去的路徑
  const path = request.nextUrl.pathname;

  // 2. 如果他想去的地方是 /admin 開頭的 (後台)
  if (path.startsWith('/admin')) {
    
    // 3. 檢查身上有沒有 'admin_token' 這張通行證
    const token = request.cookies.get('admin_token');

    // 4. 如果沒有通行證，就把他踢到 /login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 其他情況直接放行
  return NextResponse.next();
}

// 設定守門員要守哪些路口 (這裡只守 /admin)
export const config = {
  matcher: '/admin/:path*',
}