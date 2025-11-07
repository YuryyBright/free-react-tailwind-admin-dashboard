import { Menu, MoreVertical } from 'lucide-react';
import { Chat } from './types';

interface ChatHeaderProps {
  chat: Chat;
  onToggleSidebar: () => void;
}

export default function ChatHeader({ chat, onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <img
          src={chat.avatar}
          alt={chat.name}
          className="w-10 h-10 rounded-full"
        />

        <div>
          <h2 className="font-semibold">{chat.name}</h2>
          <p className="text-xs text-gray-500">
            {chat.isTyping
              ? 'печатає...'
              : chat.isOnline
              ? 'В мережі'
              : 'Був(ла) нещодавно'}
          </p>
        </div>
      </div>

      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  );
}