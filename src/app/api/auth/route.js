import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  
  // 檢查密碼是否正確 (比對環境變數)
  if (body.password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    
    // 如果正確，設定一個叫做 'admin_token' 的 Cookie，有效期 1 天
    response.cookies.set('admin_token', 'true', {
      httpOnly: true, // 安全設定：JS 無法讀取
      path: '/',
      maxAge: 60 * 60 * 24, // 1天
    });
    
    return response;
  }

  // 密碼錯誤
  return NextResponse.json({ success: false }, { status: 401 });
}