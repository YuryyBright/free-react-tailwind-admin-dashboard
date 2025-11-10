// src/components/Sidebar.tsx
import { Search, Menu } from 'lucide-react';
import { Chat } from './types';
import { IconButton } from '../ui/icon/IconButton';
import { Input } from './ui/Input';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { useMessageContext } from '../../context/MessageContext';

export const Sidebar: React.FC<{
  chats: Chat[];
  selectedChat: Chat;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showSidebar: boolean;
  onToggleSidebar: () => void;
}> = ({ chats, selectedChat, searchQuery, onSearchChange, showSidebar, onToggleSidebar }) => {
  const { dispatch } = useMessageContext();

  const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectChat = (chat: Chat) => {
    dispatch({ type: 'SELECT_CHAT', payload: chat.id });
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
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleSelectChat(chat)}
            className={`flex items-center gap-3 p-3 cursor-pointer transition ${
              selectedChat.id === chat.id
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
                  chat.lastMessage
                )}
              </p>
            </div>

            {chat.unreadCount > 0 && (
              <Badge variant="primary">{chat.unreadCount}</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};