'use client'; // <--- 因為要用 useEffect 抓資料，這行一定要加

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // 引入我們剛剛寫好的連線工具

const MangaGrid = () => {
  const [comics, setComics] = useState([]); // 用來存漫畫資料的狀態
  const [loading, setLoading] = useState(true); // 載入中的狀態

  useEffect(() => {
    fetchComics();
  }, []);

  async function fetchComics() {
    // 向 Supabase 的 'comics' 表格要資料
    const { data, error } = await supabase
      .from('comics')
      .select('*')
      .order('created_at', { ascending: false }); // 照建立時間排序

    if (error) {
      console.error('Error fetching comics:', error);
    } else {
      setComics(data);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">正在搬運漫畫中...📦</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen text-gray-800">
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-600 pl-3">
        最新更新 (來自資料庫)
      </h2>
      
      {/* 如果沒漫畫顯示提示 */}
      {comics.length === 0 && (
        <p className="text-gray-500">目前還沒有漫畫喔，快去後台新增吧！</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {comics.map((comic) => (
          <Link key={comic.id} href={`/comic/${comic.id}`} className="group cursor-pointer">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300">
              {/* 如果資料庫有 cover_url 就用，沒有就顯示預設圖 */}
              <img 
                src={comic.cover_url || "https://placehold.co/300x450?text=No+Cover"} 
                alt={comic.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="mt-2">
              <h3 className="text-sm md:text-base font-bold truncate group-hover:text-blue-600">
                {comic.title}
              </h3>
              <p className="text-xs text-gray-500">{comic.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MangaGrid;