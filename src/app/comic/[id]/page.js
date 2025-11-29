import MangaReader from "../../components/MangaReader";

export default async function ComicPage({ params }) {
  // 在 Next.js 新版中，網址參數 params 需要被 await (等待)
  const resolvedParams = await params;
  const comicId = resolvedParams.id;

  return (
    <main>
      {/* 我們把抓到的 ID (例如 1) 傳給閱讀器元件 */}
      <MangaReader comicId={comicId} />
    </main>
  );
}