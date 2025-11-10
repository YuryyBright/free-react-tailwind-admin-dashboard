// src/components/AnalysisSidebar.tsx
import { Bot, User, SearchIcon, Download, AlertCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AIAssistant } from './AIAssistant';

export const AnalysisSidebar: React.FC = () => {
  const [isAIOpen, setIsAIOpen] = useState(false);

  const actions = [
    { icon: Bot, label: 'AI-агент (чат)', color: 'blue', onClick: () => setIsAIOpen(true) },
    { icon: User, label: 'Профіль користувача', color: 'green' },
    { icon: SearchIcon, label: 'Пошук у чаті', color: 'purple' },
    { icon: Download, label: 'Експорт листування', color: 'gray' },
    { icon: AlertCircle, label: 'Аналіз ворожості', color: 'red' },
    { icon: Sparkles, label: 'AI-підсумок', color: 'yellow', onClick: () => setIsAIOpen(true) },
  ];

  return (
    <>
      <div className="w-16 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 space-y-4">
        {actions.map((action, i) => (
          <button
            key={i}
            className="p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition group relative"
            title={action.label}
            onClick={action.onClick || (() => alert(`${action.label} — заглушка`))}
          >
            <action.icon className={`w-5 h-5 text-${action.color}-600`} />
            <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </>
  );
};