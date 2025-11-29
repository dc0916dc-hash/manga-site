'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  // --- 狀態變數 ---
  const [comics, setComics] = useState([]); // 漫畫列表 (給下拉選單用)
  const [loading, setLoading] = useState(false);
  
  // 新增漫畫用的
  const comicFileRef = useRef(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  // 上傳章節用的
  const chapterFilesRef = useRef(null);
  const [selectedComicId, setSelectedComicId] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');

  // --- 初始化：抓取現有的漫畫列表 ---
  useEffect(() => {
    fetchComics();
  }, []);

  async function fetchComics() {
    const { data } = await supabase.from('comics').select('*').order('created_at', { ascending: false });
    if (data) setComics(data);
  }

  // --- 功能 1: 新增一本漫畫 (跟之前一樣) ---
  const handleCreateComic = async (e) => {
    e.preventDefault();
    if (!comicFileRef.current?.files[0]) return alert("請選封面！");
    
    setLoading(true);
    try {
      const file = comicFileRef.current.files[0];
      // 上傳封面
      const res = await fetch(`/api/upload?filename=${file.name}`, { method: 'POST', body: file });
      const { url } = await res.json();

      // 寫入資料庫
      const { error } = await supabase.from('comics').insert([{ title, author, cover_url: url }]);
      if (error) throw error;

      alert('🎉 漫畫建立成功！');
      setTitle(''); setAuthor(''); comicFileRef.current.value = '';
      fetchComics(); // 重新抓列表
    } catch (err) {
      alert('失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 功能 2: 上傳章節與內頁 (大魔王關卡) ---
  const handleUploadChapter = async (e) => {
    e.preventDefault();
    const files = chapterFilesRef.current?.files;
    
    if (!selectedComicId) return alert("請選擇一本漫畫！");
    if (!files || files.length === 0) return alert("請選擇漫畫圖片！");

    setLoading(true);
    try {
      // 1. 先建立「章節」
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .insert([{ 
          comic_id: selectedComicId, 
          title: chapterTitle, 
          chapter_number: chapterNumber 
        }])
        .select() // 為了拿回剛建立的 ID
        .single();

      if (chapterError) throw chapterError;
      const chapterId = chapterData.id;

      // 2. 迴圈上傳每一張圖片 (這是最花時間的地方)
      // 我們用 Array.from 把 FileList 轉成陣列來跑迴圈
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // A. 上傳到 Vercel Blob
        const res = await fetch(`/api/upload?filename=${file.name}`, { method: 'POST', body: file });
        const { url } = await res.json();

        // B. 寫入 Pages 資料庫 (記得把 page_number 設為 i + 1)
        await supabase.from('pages').insert([{
          chapter_id: chapterId,
          image_url: url,
          page_number: i + 1
        }]);
      }

      alert(`🎉 成功上傳 ${files.length} 頁！`);
      setChapterTitle(''); setChapterNumber(''); chapterFilesRef.current.value = '';

    } catch (err) {
      console.error(err);
      alert('發生錯誤：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">漫畫管理員後台</h1>
      
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
        
        {/* 左邊：新增漫畫 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">Step 1. 建立新漫畫</h2>
          <form onSubmit={handleCreateComic} className="space-y-4">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="漫畫標題" className="w-full p-2 bg-gray-900 rounded border border-gray-600" required />
            <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="作者" className="w-full p-2 bg-gray-900 rounded border border-gray-600" required />
            <div>
              <p className="text-xs text-gray-400 mb-1">封面圖片</p>
              <input ref={comicFileRef} type="file" accept="image/*" className="text-sm" required />
            </div>
            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold">
              {loading ? '處理中...' : '建立漫畫'}
            </button>
          </form>
        </div>

        {/* 右邊：上傳章節 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">Step 2. 上傳章節內頁</h2>
          <form onSubmit={handleUploadChapter} className="space-y-4">
            
            {/* 下拉選單：選擇漫畫 */}
            <select 
              value={selectedComicId} 
              onChange={e=>setSelectedComicId(e.target.value)} 
              className="w-full p-2 bg-gray-900 rounded border border-gray-600 text-white"
              required
            >
              <option value="">-- 請選擇要更新的漫畫 --</option>
              {comics.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <input value={chapterTitle} onChange={e=>setChapterTitle(e.target.value)} placeholder="章節標題 (例: 第一話)" className="flex-1 p-2 bg-gray-900 rounded border border-gray-600" required />
              <input value={chapterNumber} onChange={e=>setChapterNumber(e.target.value)} type="number" placeholder="話數" className="w-20 p-2 bg-gray-900 rounded border border-gray-600" required />
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">選擇內頁 (可多選)</p>
              {/* 這裡加了 multiple 屬性，可以一次選多張 */}
              <input ref={chapterFilesRef} type="file" multiple accept="image/*" className="text-sm" required />
            </div>

            <button disabled={loading} className="w-full bg-green-600 hover:bg-green-500 py-2 rounded font-bold">
              {loading ? '上傳中 (請耐心等待)...' : '上傳所有頁面'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}