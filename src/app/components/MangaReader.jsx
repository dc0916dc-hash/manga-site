'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Menu, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const MangaReader = ({ comicId }) => {
  // --- 狀態變數 ---
  const [chapters, setChapters] = useState([]); // 所有章節
  const [currentChapterId, setCurrentChapterId] = useState(null); // 改用 ID 來鎖定目前章節
  const [pages, setPages] = useState([]); // 圖片
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(true);

  // 1. 初始化：抓取這本漫畫的「所有章節」
  useEffect(() => {
    if (comicId) {
      fetchChapters();
    }
  }, [comicId]);

  // 2. 當「章節 ID」改變時，去抓圖片
  useEffect(() => {
    if (currentChapterId) {
      fetchPages(currentChapterId);
    }
  }, [currentChapterId]);

  // --- 抓取所有章節 ---
  async function fetchChapters() {
    try {
      setLoading(true);
      console.log("正在抓取漫畫 ID:", comicId);

      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('comic_id', comicId)
        .order('chapter_number', { ascending: true }); // 照話數排序

      if (error) throw error;
      
      console.log("抓到的章節列表:", data);

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }
      setChapters(data);
      
      // 預設選中第一話 (如果還沒選過的話)
      if (!currentChapterId) {
        setCurrentChapterId(data[0].id);
      }

    } catch (error) {
      console.error("抓章節失敗:", error);
      alert("讀取章節失敗，請看控制台");
    } finally {
      setLoading(false);
    }
  }

  // --- 抓取特定章節的圖片 ---
  async function fetchPages(chapterId) {
    try {
      setLoading(true);
      setPages([]); // 切換前先清空舊圖，避免混淆
      console.log("正在抓取章節 ID 的圖片:", chapterId);

      const { data, error } = await supabase
        .from('pages')
        .select('image_url')
        .eq('chapter_id', chapterId)
        .order('page_number', { ascending: true });

      if (error) throw error;

      console.log(`抓到 ${data.length} 張圖片`);

      const urls = data.map(p => p.image_url);
      setPages(urls);
    } catch (error) {
      console.error("抓圖片失敗:", error);
    } finally {
      setLoading(false);
      window.scrollTo(0, 0); // 回到頂部
    }
  }

  // --- 計算目前的索引 (為了上一話/下一話按鈕) ---
  // 這裡用 ID 反查它是陣列裡的第幾個
  const currentIndex = chapters.findIndex(ch => ch.id === currentChapterId);
  const currentChapter = chapters[currentIndex];

  // --- 切換章節 (下拉選單) ---
  const handleChapterChange = (e) => {
    // e.target.value 拿到的會是 ID (字串)，要轉成數字比較保險(看資料庫設定，如果是uuid就不用轉)
    // 這裡直接用 value 即可
    const newId = Number(e.target.value); 
    console.log("切換到章節 ID:", newId);
    setCurrentChapterId(newId);
  };

  const nextChapter = () => {
    if (currentIndex < chapters.length - 1) {
      const nextId = chapters[currentIndex + 1].id;
      setCurrentChapterId(nextId);
    } else {
      alert("已經是最新一話囉！");
    }
  };

  const prevChapter = () => {
    if (currentIndex > 0) {
      const prevId = chapters[currentIndex - 1].id;
      setCurrentChapterId(prevId);
    } else {
      alert("這是第一話！");
    }
  };

  const toggleMenu = () => setShowMenu(!showMenu);

  if (loading && chapters.length === 0) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">載入中...🚀</div>;
  }

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
                value={currentChapterId || ''}
                onChange={handleChapterChange}
                className="w-full bg-gray-800 text-white text-sm p-2 rounded appearance-none border border-gray-700 focus:border-blue-500 outline-none text-center font-bold"
              >
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title} (第 {ch.chapter_number} 話)
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm">無章節</span>
            )}
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
        className="w-full max-w-2xl bg-black min-h-screen cursor-pointer pb-20 pt-16" 
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
          <div className="p-20 text-center text-gray-500 flex flex-col gap-4">
            <p className="text-xl">⚠️ 這裡沒有圖片</p>
            <p className="text-sm text-gray-400">
              可能是上傳時出了問題，或者資料庫沒對應到。<br/>
              請按 F12 看 Console 的除錯訊息。
            </p>
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
              className={`px-6 py-2 rounded transition ${currentIndex === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
              disabled={currentIndex === 0}
            >
              上一話
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextChapter(); }}
              className={`px-6 py-2 rounded transition font-bold ${currentIndex === chapters.length - 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
              disabled={currentIndex === chapters.length - 1}
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