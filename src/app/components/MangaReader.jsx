'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // 引入大腦
import { ChevronLeft, Menu, Settings } from 'lucide-react';
import Link from 'next/link';

const MangaReader = ({ comicId }) => {
  const [pages, setPages] = useState([]); // 存圖片網址
  const [chapterTitle, setChapterTitle] = useState('載入中...');
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(true);

  // 當元件載入，或 comicId 改變時，執行抓資料
  useEffect(() => {
    if (comicId) {
      fetchChapterAndPages();
    }
  }, [comicId]);

  async function fetchChapterAndPages() {
    try {
      setLoading(true);

      // 1. 先抓這本漫畫的「第一話」 (依照章節數字排序)
      const { data: chapters, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('comic_id', comicId)
        .order('chapter_number', { ascending: true })
        .limit(1); // 只抓第一章

      if (chapterError) throw chapterError;
      
      if (!chapters || chapters.length === 0) {
        setChapterTitle("目前還沒有章節 😅");
        setLoading(false);
        return;
      }

      const firstChapter = chapters[0];
      setChapterTitle(firstChapter.title);

      // 2. 抓這個章節的所有「圖片」 (依照頁數排序)
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('image_url')
        .eq('chapter_id', firstChapter.id)
        .order('page_number', { ascending: true });

      if (pageError) throw pageError;

      // 把抓到的資料轉成純網址陣列
      const urls = pageData.map(p => p.image_url);
      setPages(urls);

    } catch (error) {
      console.error(error);
      setChapterTitle("讀取錯誤");
    } finally {
      setLoading(false);
    }
  }

  const toggleMenu = () => setShowMenu(!showMenu);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">載入漫畫中...🚀</div>;
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white flex flex-col items-center">
      
      {/* 頂部選單 */}
      <div className={`fixed top-0 left-0 w-full bg-black/80 p-4 transition-transform duration-300 z-50 ${showMenu ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          {/* 返回首頁按鈕 */}
          <Link href="/" className="flex items-center text-gray-300 hover:text-white">
            <ChevronLeft size={20} />
            <span className="ml-1">返回書櫃</span>
          </Link>
          
          <h1 className="text-sm font-bold truncate mx-4">{chapterTitle}</h1>
          
          <button className="text-gray-300 hover:text-white">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* 漫畫圖片區 */}
      <div 
        className="w-full max-w-2xl bg-black min-h-screen cursor-pointer pb-20"
        onClick={toggleMenu}
      >
        {pages.length > 0 ? (
          pages.map((url, index) => (
            <img 
              key={index}
              src={url} 
              alt={`Page ${index + 1}`}
              className="w-full h-auto block" // 消除白邊
              loading="lazy"
            />
          ))
        ) : (
          <div className="p-10 text-center text-gray-500">這一話還沒有圖片喔</div>
        )}
        
        {/* 底部按鈕區 */}
        <div className="p-8 text-center space-y-4 bg-gray-800 mt-4">
          <p className="text-gray-400">本話結束</p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600 transition" disabled>上一話</button>
            <button className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-500 transition font-bold">下一話</button>
          </div>
        </div>
      </div>

      {/* 底部頁碼 */}
      <div className={`fixed bottom-0 left-0 w-full bg-black/80 p-4 transition-transform duration-300 ${showMenu ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-gray-400">
           <span>共 {pages.length} 頁</span>
           <Menu size={20} />
        </div>
      </div>
    </div>
  );
};

export default MangaReader;