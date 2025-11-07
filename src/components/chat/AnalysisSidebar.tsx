import { Bot, User, Search, Download, AlertCircle, Sparkles } from 'lucide-react';

export default function AnalysisSidebar({ chatId }: { chatId: string }) {
  const actions = [
    { icon: Bot, label: 'AI-агент (чат)', color: 'blue' },
    { icon: User, label: 'Профіль користувача', color: 'green' },
    { icon: Search, label: 'Пошук у чаті', color: 'purple' },
    { icon: Download, label: 'Експорт листування', color: 'gray' },
    { icon: AlertCircle, label: 'Аналіз ворожості', color: 'red' },
    { icon: Sparkles, label: 'AI-підсумок', color: 'yellow' },
  ];

  return (
    <div className="w-16 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 space-y-4">
      {actions.map((action, i) => (
        <button
          key={i}
          className={`p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition group relative`}
          title={action.label}
        >
          <action.icon className={`w-5 h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
          <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}