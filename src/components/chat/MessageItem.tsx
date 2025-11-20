// src/components/chat/MessageItem.tsx
import { Check, CheckCheck, Volume2, FileText, Image as ImageIcon, MoreVertical } from 'lucide-react';
import { Message, MessageStatus } from './types';
import { useState } from 'react';
import { Avatar } from './ui/Avatar';
import { IconButton } from './ui/IconButton';
import { BookmarkCheck, Bookmark } from 'lucide-react';

export const MessageItem: React.FC<{
  message: Message;
  showAvatar: boolean;
  onStatusChange: (id: string, status: MessageStatus) => void;
  onToggleBookmark: (id: string) => void;
  isUnread?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  readOnly?: boolean;
}> = ({ 
  message, 
  showAvatar, 
  onStatusChange, 
  onToggleBookmark, 
  isUnread, 
  isSelected, 
  onToggleSelect,
  readOnly = false 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isOutgoing = message.isOutgoing;

  const statusConfig: Record<MessageStatus, { label: string; icon: string }> = {
    none: { label: '', icon: '' },
    interesting: { label: 'Цікаве', icon: '⭐' },
    prepared: { label: 'Підготовлене', icon: '📋' },
    considered: { label: 'Враховане', icon: '✅' },
  };

  return (
    <div className={`flex gap-2 group ${isOutgoing ? 'flex-row-reverse' : ''}`}>
      {!isOutgoing && showAvatar && (
        <Avatar src={message.avatar || "https://i.pravatar.cc/150?img=1"} alt="" size="sm" />
      )}
      {!isOutgoing && !showAvatar && <div className="w-8" />}

      <div className="relative max-w-xs lg:max-w-md">
        <div 
          className={`px-4 py-2 rounded-2xl relative cursor-pointer ${
            isSelected ? 'ring-2 ring-blue-600' : ''
          } ${isOutgoing ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          onClick={() => onToggleSelect?.(message.id)}
        >
          {message.type === 'text' && <p className="break-words">{message.content}</p>}

          {message.type === 'image' && (
            <div>
              <img src={message.url} alt={message.caption} className="rounded-lg max-w-full" />
              {message.caption && <p className="text-sm mt-1 opacity-80">{message.caption}</p>}
            </div>
          )}

          {message.type === 'document' && (
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 opacity-70" />
              <div>
                <p className="text-sm font-medium">{message.fileName}</p>
                <p className="text-xs opacity-70">{message.fileSize}</p>
              </div>
            </div>
          )}

          {message.type === 'voice' && (
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5" />
              <span className="text-sm">Голосове повідомлення ({message.duration}s)</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-1 text-xs opacity-70 gap-2">
            <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="flex items-center gap-1">
              {message.isBookmarked && <BookmarkCheck className="w-3 h-3" />}
              {isOutgoing && (message.isRead ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />)}
            </div>
          </div>

          {isUnread && (
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
          )}
        </div>

        {/* Кнопки закладки та меню */}
        {!readOnly && (
          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <IconButton
              icon={message.isBookmarked ? <BookmarkCheck className="w-4 h-4 text-yellow-600" /> : <Bookmark className="w-4 h-4" />}
              onClick={() => onToggleBookmark(message.id)}
              className="bg-white dark:bg-gray-800 shadow-md"
              title="Закладка"
            />
            <IconButton
              icon={<MoreVertical className="w-4 h-4" />}
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white dark:bg-gray-800 shadow-md"
            />
          </div>
        )}

        {showMenu && !readOnly && (
          <div className={`absolute ${isOutgoing ? 'left-0' : 'right-0'} top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-10 min-w-max`}>
            {(['interesting', 'prepared', 'considered'] as const).map((s) => {
              const cfg = statusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => { onStatusChange(message.id, s); setShowMenu(false); }}
                  className="w-full text-left px-3 py-1.5 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <span>{cfg.icon}</span> {cfg.label}
                </button>
              );
            })}
            <button
              onClick={() => { onStatusChange(message.id, 'none'); setShowMenu(false); }}
              className="w-full text-left px-3 py-1.5 rounded text-sm hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600"
            >
              Очистити
            </button>
          </div>
        )}
      </div>
    </div>
  );
};