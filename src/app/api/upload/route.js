import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  // 修改重點：加上 addRandomSuffix: true
  // 這樣就算檔名重複 (例如都叫 page1.jpg)，系統也會自動改成 page1-xyz.jpg
  const blob = await put(filename, request.body, {
    access: 'public',
    addRandomSuffix: true, 
  });

  return NextResponse.json(blob);
}