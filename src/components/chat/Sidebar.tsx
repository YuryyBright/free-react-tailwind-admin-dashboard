import { Search, Menu } from 'lucide-react';
import { Chat } from './types';

interface SidebarProps {
  chats: Chat[];
  selectedChat: Chat;
  onSelectChat: (chat: Chat) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showSidebar: boolean;
  onToggleSidebar: () => void;
}

export default function Sidebar({
  chats,
  selectedChat,
  onSelectChat,
  searchQuery,
  onSearchChange,
  showSidebar,
  onToggleSidebar,
}: SidebarProps) {
  const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Чати</h1>
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Пошук..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {totalUnread > 0 && (
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            Непрочитані: {totalUnread}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`flex items-center gap-3 p-3 cursor-pointer transition ${
              selectedChat.id === chat.id
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="relative">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {chat.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium truncate">{chat.name}</h3>
                <span className="text-xs text-gray-500">
                  {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {chat.isTyping ? (
                  <span className="italic">печатає...</span>
                ) : (
                  chat.lastMessage
                )}
              </p>
            </div>

            {chat.unreadCount > 0 && (
              <div className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {chat.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}