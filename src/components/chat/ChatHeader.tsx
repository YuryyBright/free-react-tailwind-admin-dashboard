import { Menu, MoreVertical, Phone, Video } from 'lucide-react';
import { Chat } from './types';
import { Avatar } from './ui/Avatar';
import { IconButton } from './ui/IconButton';
import { useState } from 'react';

export const ChatHeader: React.FC<{
  chat: Chat;
  unreadCount: number;
  onToggleSidebar: () => void;
  onCall: (type: 'audio' | 'video') => void;
}> = ({ chat, unreadCount, onToggleSidebar, onCall }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <IconButton
          icon={<Menu className="w-5 h-5" />}
          onClick={onToggleSidebar}
          className="lg:hidden"
        />

        <Avatar src={chat.avatar} alt={chat.name} isOnline={chat.isOnline} />

        <div className="min-w-0">
          <h2 className="font-semibold truncate">{chat.name}</h2>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            {chat.isTyping ? (
              <span className="italic">печатає...</span>
            ) : chat.isOnline ? (
              'В мережі'
            ) : (
              'Був(ла) нещодавно'
            )}
            {unreadCount > 0 && (
              <span className="ml-1 text-blue-600 dark:text-blue-400 font-medium">
                • {unreadCount} непрочитаних
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconButton
          icon={<Phone className="w-5 h-5" />}
          onClick={() => onCall('audio')}
          title="Аудіо дзвінок"
        />
        <IconButton
          icon={<Video className="w-5 h-5" />}
          onClick={() => onCall('video')}
          title="Відео дзвінок"
        />
        <div className="relative">
          <IconButton
            icon={<MoreVertical className="w-5 h-5" />}
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-20">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                Профіль
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                Вимкнути сповіщення
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-600">
                Видалити чат
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};