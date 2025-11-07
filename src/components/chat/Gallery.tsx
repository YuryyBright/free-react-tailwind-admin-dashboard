import { useState, useEffect, useRef } from 'react';

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      const newImgs = Array.from({ length: 12 }, (_, i) => 
        `https://picsum.photos/300/300?random=${Date.now() + i}`
      );
      setImages(prev => [...prev, ...newImgs]);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadMore();
  }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: '200px' }
    );
    const target = document.getElementById('gallery-sentinel');
    if (target) observer.current.observe(target);
    return () => observer.current?.disconnect();
  }, [loading]);

  return (
    <div className="p-4 grid grid-cols-3 gap-2 overflow-y-auto h-full">
      {images.map((src, i) => (
        <img key={i} src={src} alt="" className="rounded-lg object-cover w-full h-32 hover:opacity-80 cursor-pointer transition" />
      ))}
      <div id="gallery-sentinel" className="col-span-3 h-1"></div>
      {loading && <div className="col-span-3 text-center py-4">Завантаження...</div>}
    </div>
  );
}