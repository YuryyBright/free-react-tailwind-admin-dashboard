// src/components/chat/AnalysisSidebar.tsx
import { Bot, User, SearchIcon, Download, AlertCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AIAssistant } from './AIAssistant';
import { useMessageContext } from '../../context/MessageContext';

export const AnalysisSidebar: React.FC = () => {
  const { state } = useMessageContext();
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Отримуємо повідомлення поточного чату
  const currentMessages = state.selectedChatId 
    ? state.messages[state.selectedChatId] || []
    : [];

  const actions = [
    { 
      icon: Bot, 
      label: 'AI-агент (чат)', 
      color: 'blue', 
      onClick: () => setIsAIOpen(true) 
    },
    { 
      icon: User, 
      label: 'Профіль користувача', 
      color: 'green',
      onClick: () => alert('Профіль користувача — заглушка')
    },
    { 
      icon: SearchIcon, 
      label: 'Пошук у чаті', 
      color: 'purple',
      onClick: () => alert('Пошук у чаті — заглушка')
    },
    { 
      icon: Download, 
      label: 'Експорт листування', 
      color: 'gray',
      onClick: () => alert('Експорт листування — заглушка')
    },
    { 
      icon: AlertCircle, 
      label: 'Аналіз ворожості', 
      color: 'red',
      onClick: () => alert('Аналіз ворожості — заглушка')
    },
    { 
      icon: Sparkles, 
      label: 'AI-підсумок', 
      color: 'yellow', 
      onClick: () => setIsAIOpen(true) 
    },
  ];

  return (
    <>
      <div className="w-16 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 space-y-4">
        {actions.map((action, i) => (
          <button
            key={i}
            className="p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition group relative"
            title={action.label}
            onClick={action.onClick}
          >
            <action.icon className={`w-5 h-5 text-${action.color}-600`} />
            <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      <AIAssistant 
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)}
        messages={currentMessages}
        selectedMessageIds={state.selectedMessageIds}
      />
    </>
  );
};