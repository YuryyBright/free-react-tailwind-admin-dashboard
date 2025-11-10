import { FileText, Download } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { IconButton } from '../ui/icon/IconButton';
export const Documents: React.FC = () => {
  const docs = Array.from({ length: 10 }, (_, i) => ({
    name: `Документ_${i + 1}.pdf`,
    size: `${(Math.random() * 10).toFixed(1)} MB`,
    date: ['Сьогодні', 'Вчора', '2 дні тому'][Math.floor(Math.random() * 3)],
  }));

  return (
    <div className="p-4 space-y-3 overflow-y-auto h-full bg-gray-50 dark:bg-gray-900">
      {docs.map((doc, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-medium">{doc.name}</p>
              <p className="text-xs text-gray-500">{doc.size} • {doc.date}</p>
            </div>
          </div>
          <IconButton
            icon={<Download className="w-4 h-4" />}
            onClick={() => alert(`Завантажити ${doc.name} (заглушка)`)}
            title="Завантажити"
          />
        </div>
      ))}
    </div>
  );
};