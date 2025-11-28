import MangaGrid from "./components/MangaGrid";
import MangaReader from "./components/MangaReader";

export default function Home() {
  return (
    <main>
      {/* 上半部：漫畫列表 */}
      <MangaGrid />

      {/* 分隔線 */}
      <div className="py-8 bg-gray-800 text-center text-white font-bold text-xl border-t-4 border-blue-500">
        ⬇️ 往下捲動預覽閱讀器效果 ⬇️
      </div>

      {/* 下半部：閱讀器 */}
      <MangaReader />
    </main>
  );
}