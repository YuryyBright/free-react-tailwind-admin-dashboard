// src/components/Sidebar.tsx
import { Search, Menu } from 'lucide-react';
import { IconButton } from '../ui/icon/IconButton';
import { Input } from './ui/Input';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { useMessageContext } from '../../context/MessageContext';

export const Sidebar: React.FC<{
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showSidebar: boolean;
  onToggleSidebar: () => void;
}> = ({ searchQuery, onSearchChange, showSidebar, onToggleSidebar }) => {
  const { state, dispatch } = useMessageContext();
  const { chats, messages, selectedChatId } = state;

  // Підрахунок загальних непрочитаних (тільки вхідні)
  const totalUnread = chats.reduce((sum, chat) => {
    return sum + chat.unreadCount;
  }, 0);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectChat = (chatId: string) => {
    dispatch({ type: 'SELECT_CHAT', payload: chatId });
  };

  return (
    <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Чати</h1>
          <IconButton
            icon={<Menu className="w-5 h-5" />}
            onClick={onToggleSidebar}
            className="lg:hidden"
          />
        </div>

        <Input
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Пошук..."
          icon={<Search className="w-4 h-4" />}
        />

        {totalUnread > 0 && (
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            Непрочитані: {totalUnread}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => {
          const unread = chat.unreadCount;

          return (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition ${
                selectedChatId === chat.id
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Avatar src={chat.avatar} alt={chat.name} isOnline={chat.isOnline} size="lg" />

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
                    chat.lastMessage || 'Немає повідомлень'
                  )}
                </p>
              </div>

              {unread > 0 && (
                <Badge variant="primary">{unread}</Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};