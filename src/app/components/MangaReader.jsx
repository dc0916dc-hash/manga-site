'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Menu, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const MangaReader = ({ comicId }) => {
  // --- 狀態變數 ---
  const [chapters, setChapters] = useState([]); // 所有章節列表
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0); // 目前在看第幾個章節 (索引)
  
  const [pages, setPages] = useState([]); // 目前章節的圖片
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(true);

  // 1. 初始化：抓取這本漫畫的「所有章節」
  useEffect(() => {
    if (comicId) {
      fetchChapters();
    }
  }, [comicId]);

  // 2. 當章節切換時，抓取該章節的「圖片」
  useEffect(() => {
    if (chapters.length > 0) {
      fetchPages(chapters[currentChapterIndex].id);
    }
  }, [currentChapterIndex, chapters]);

  // --- 抓取所有章節 ---
  async function fetchChapters() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('comic_id', comicId)
        .order('chapter_number', { ascending: true }); // 依照話數排序

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }
      setChapters(data);
      // 預設選中第一話 (index 0)
      setCurrentChapterIndex(0);

    } catch (error) {
      console.error("抓章節失敗:", error);
      setLoading(false);
    }
  }

  // --- 抓取特定章節的圖片 ---
  async function fetchPages(chapterId) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('image_url')
        .eq('chapter_id', chapterId)
        .order('page_number', { ascending: true });

      if (error) throw error;

      const urls = data.map(p => p.image_url);
      setPages(urls);
    } catch (error) {
      console.error("抓圖片失敗:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- 切換章節 ---
  const handleChapterChange = (e) => {
    const newIndex = parseInt(e.target.value);
    setCurrentChapterIndex(newIndex);
    window.scrollTo(0, 0); // 切換後回到頂部
  };

  const nextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      window.scrollTo(0, 0);
    } else {
      alert("已經是最新一話囉！");
    }
  };

  const prevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      window.scrollTo(0, 0);
    } else {
      alert("這是第一話！");
    }
  };

  const toggleMenu = () => setShowMenu(!showMenu);

  if (loading && chapters.length === 0) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">載入中...🚀</div>;
  }

  // 目前顯示的章節物件
  const currentChapter = chapters[currentChapterIndex];

  return (
    <div className="relative min-h-screen bg-gray-900 text-white flex flex-col items-center">
      
      {/* --- 頂部選單 --- */}
      <div className={`fixed top-0 left-0 w-full bg-black/90 p-3 transition-transform duration-300 z-50 ${showMenu ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          
          <Link href="/" className="text-gray-300 hover:text-white flex items-center">
            <ChevronLeft size={24} />
          </Link>
          
          {/* 章節切換下拉選單 */}
          <div className="flex-1 mx-4 max-w-xs relative">
            {chapters.length > 0 ? (
              <select 
                value={currentChapterIndex}
                onChange={handleChapterChange}
                className="w-full bg-gray-800 text-white text-sm p-2 rounded appearance-none border border-gray-700 focus:border-blue-500 outline-none text-center font-bold"
              >
                {chapters.map((ch, index) => (
                  <option key={ch.id} value={index}>
                    {ch.title} (第 {ch.chapter_number} 話)
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm">無章節</span>
            )}
            {/* 下拉箭頭裝飾 */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <ChevronDown size={14} />
            </div>
          </div>

          <button className="text-gray-300 hover:text-white">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* --- 漫畫圖片區 --- */}
      <div 
        className="w-full max-w-2xl bg-black min-h-screen cursor-pointer pb-20 pt-16" // pt-16 避免被頂部選單擋住
        onClick={toggleMenu}
      >
        {pages.length > 0 ? (
          pages.map((url, index) => (
            <img 
              key={index}
              src={url} 
              alt={`Page ${index + 1}`}
              className="w-full h-auto block"
              loading="lazy"
            />
          ))
        ) : (
          <div className="p-20 text-center text-gray-500">
            {chapters.length === 0 ? "還沒有上傳章節" : "這一話還沒有圖片"}
          </div>
        )}
        
        {/* --- 底部按鈕區 --- */}
        <div className="p-8 text-center space-y-4 bg-gray-900 mt-4">
          <p className="text-gray-400 text-sm">
            {currentChapter ? `--- ${currentChapter.title} 結束 ---` : '---'}
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); prevChapter(); }}
              className={`px-6 py-2 rounded transition ${currentChapterIndex === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
              disabled={currentChapterIndex === 0}
            >
              上一話
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextChapter(); }}
              className={`px-6 py-2 rounded transition font-bold ${currentChapterIndex === chapters.length - 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
              disabled={currentChapterIndex === chapters.length - 1}
            >
              下一話
            </button>
          </div>
        </div>
      </div>

      {/* --- 底部頁碼顯示 --- */}
      <div className={`fixed bottom-0 left-0 w-full bg-black/90 p-3 transition-transform duration-300 ${showMenu ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-gray-400">
           <span>本話共 {pages.length} 頁</span>
           <Menu size={20} />
        </div>
      </div>
    </div>
  );
};

export default MangaReader;