import { FileText, Download } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const generateDocs = (start: number) => 
  Array.from({ length: 10 }, (_, i) => ({
    name: `Документ_${start + i}.pdf`,
    size: `${(Math.random() * 10).toFixed(1)} MB`,
    date: ['Сьогодні', 'Вчора', '2 дні тому', 'Тиждень тому'][Math.floor(Math.random() * 4)],
  }));

export default function Documents() {
  const [docs, setDocs] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setDocs(prev => [...prev, ...generateDocs(prev.length)]);
      setPage(p => p + 1);
      setLoading(false);
    }, 600);
  };

  useEffect(() => { loadMore(); }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: '100px' }
    );
    const target = document.getElementById('doc-sentinel');
    if (target) observer.current.observe(target);
    return () => observer.current?.disconnect();
  }, [loading]);

  return (
    <div className="p-4 space-y-3">
      {docs.map((doc, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-medium">{doc.name}</p>
              <p className="text-xs text-gray-500">{doc.size} • {doc.date}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full">
            <Download className="w-4 h-4" />
          </button>
        </div>
      ))}
      <div id="doc-sentinel" className="h-1"></div>
      {loading && <div className="text-center py-4 text-gray-500">Завантаження документів...</div>}
    </div>
  );
}