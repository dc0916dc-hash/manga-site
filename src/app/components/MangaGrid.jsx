import React from 'react';

const MangaGrid = () => {
  const comics = [
    { id: 1, title: "勇者傳說", cover: "https://placehold.co/300x450/333/FFF?text=Hero", update: "第 12 話" },
    { id: 2, title: "辦公室戀曲", cover: "https://placehold.co/300x450/844/FFF?text=Love", update: "完結" },
    { id: 3, title: "程式設計師小林", cover: "https://placehold.co/300x450/448/FFF?text=Code", update: "連載中" },
    { id: 4, title: "異世界冒險", cover: "https://placehold.co/300x450/255/FFF?text=Fantasy", update: "第 5 話" },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen text-gray-800">
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-600 pl-3">
        最新更新
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {comics.map((comic) => (
          <div key={comic.id} className="group cursor-pointer">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300">
              <img 
                src={comic.cover} 
                alt={comic.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-2 py-1 rounded-tl-md">
                {comic.update}
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-sm md:text-base font-bold truncate group-hover:text-blue-600">
                {comic.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MangaGrid;