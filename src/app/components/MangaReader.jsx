'use client';

import React, { useState } from 'react';
import { ChevronLeft, Menu, Settings } from 'lucide-react';

const MangaReader = () => {
  // 模擬漫畫頁面 (先用假圖)
  const pages = [1, 2, 3, 4, 5];
  const [showMenu, setShowMenu] = useState(true);

  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white flex flex-col items-center">
      
      {/* 頂部選單 */}
      <div className={`fixed top-0 left-0 w-full bg-black/80 p-4 transition-transform duration-300 z-50 ${showMenu ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <button className="flex items-center text-gray-300 hover:text-white">
            <ChevronLeft size={20} />
            <span className="ml-1">返回目錄</span>
          </button>
          <h1 className="text-sm font-bold truncate mx-4">第一話：冒險的開始</h1>
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
        {pages.map((p, index) => (
          <img 
            key={index}
            src={`https://placehold.co/600x900/222/999?text=Page+${index+1}`} 
            alt={`Page ${index + 1}`}
            className="w-full h-auto block border-b border-gray-800"
            loading="lazy"
          />
        ))}
        
        {/* 底部按鈕區 */}
        <div className="p-8 text-center space-y-4 bg-gray-800 mt-4">
          <p className="text-gray-400">本話結束</p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600 transition">上一話</button>
            <button className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-500 transition font-bold">下一話</button>
          </div>
        </div>
      </div>

      {/* 底部頁碼 */}
      <div className={`fixed bottom-0 left-0 w-full bg-black/80 p-4 transition-transform duration-300 ${showMenu ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-gray-400">
           <span>1 / {pages.length} 頁</span>
           <Menu size={20} />
        </div>
      </div>
    </div>
  );
};

export default MangaReader;