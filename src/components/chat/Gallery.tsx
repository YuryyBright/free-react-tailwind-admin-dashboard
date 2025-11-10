import { useState, useEffect, useRef } from 'react';

export const Gallery: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const newImgs = Array.from({ length: 12 }, (_, i) => 
      `https://picsum.photos/300/300?random=${i}`
    );
    setImages(newImgs);
  }, []);

  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto h-full bg-gray-50 dark:bg-gray-900">
      {images.map((src, i) => (
        <img 
          key={i} 
          src={src} 
          alt="" 
          className="rounded-lg object-cover w-full h-32 hover:opacity-80 cursor-pointer transition"
          onClick={() => alert(`Перегляд зображення ${i + 1} (заглушка)`)}
        />
      ))}
    </div>
  );
};