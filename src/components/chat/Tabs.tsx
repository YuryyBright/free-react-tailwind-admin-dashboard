interface TabsProps {
  activeTab: 'messages' | 'gallery' | 'documents';
  onTabChange: (tab: 'messages' | 'gallery' | 'documents') => void;
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700">
      {(['messages', 'gallery', 'documents'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 py-3 px-4 font-medium text-sm transition ${
            activeTab === tab
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          {tab === 'messages' && 'Повідомлення'}
          {tab === 'gallery' && 'Медіа'}
          {tab === 'documents' && 'Файли'}
        </button>
      ))}
    </div>
  );
}