'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(false);

    // 呼叫剛剛寫的 API
    const res = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      // 登入成功，跳轉回後台
      router.push('/admin');
      router.refresh(); // 重新整理狀態
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">🔐 管理員登入</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="請輸入後台密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded text-white focus:border-blue-500 outline-none"
          />
          
          {error && <p className="text-red-500 text-sm text-center">密碼錯誤，請再試一次</p>}
          
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition">
            登入
          </button>
        </form>
      </div>
    </div>
  );
}