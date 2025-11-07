import { Check, CheckCheck, Volume2, FileText, Image, MoreVertical } from 'lucide-react';
import { Message, MessageStatus } from './types';
import { useState } from 'react';

const statusConfig: Record<MessageStatus, { label: string; color: string; icon: string }> = {
  none: { label: '', color: '', icon: '' },
  interesting: { label: 'Цікаве', color: 'yellow', icon: '⭐' },
  prepared: { label: 'Підготовлене', color: 'blue', icon: '📋' },
  considered: { label: 'Враховане', color: 'green', icon: '✅' },
};

interface MessageItemProps {
  message: Message;
  showAvatar: boolean;
  onStatusChange: (id: string, status: MessageStatus) => void;
}

export default function MessageItem({ message, showAvatar, onStatusChange }: MessageItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isOutgoing = message.isOutgoing;
  const status = statusConfig[message.status];

  return (
    <div className={`flex gap-2 mb-3 group ${isOutgoing ? 'flex-row-reverse' : ''}`}>
      {!isOutgoing && showAvatar && (
        <img src={message.avatar || "https://randomuser.me/api/portraits/women/1.jpg"} alt="" className="w-8 h-8 rounded-full" />
      )}
      {!isOutgoing && !showAvatar && <div className="w-8" />}

      <div className={`relative max-w-xs lg:max-w-md`}>
        <div className={`px-4 py-2 rounded-2xl ${isOutgoing ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
          {/* Типи повідомлень */}
          {message.type === 'text' && <p>{message.content}</p>}
          {message.type === 'image' && (
            <div>
              <img src={message.url} alt="" className="rounded-lg max-w-full" />
              {message.caption && <p className="mt-1 text-sm opacity-90">{message.caption}</p>}
            </div>
          )}
          {message.type === 'voice' && (
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <div className="bg-white/30 h-8 w-32 rounded-full"></div>
              <span className="text-xs">{message.duration}s</span>
            </div>
          )}
          {message.type === 'document' && (
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <div>
                <p className="font-medium">{message.fileName}</p>
                <p className="text-xs opacity-75">{message.fileSize}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-1 text-xs opacity-70">
            <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {isOutgoing && (message.isRead ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />)}
          </div>

          {/* Статус */}
          {message.status !== 'none' && (
            <div className={`inline-flex items-center gap-1 mt-1 text-xs font-medium bg-${status.color}-500/20 text-${status.color}-700 dark:text-${status.color}-300 px-2 py-0.5 rounded-full`}>
              <span>{status.icon}</span>
              <span>{status.label}</span>
            </div>
          )}
        </div>

        {/* Кнопка меню */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Меню статусів */}
        {showMenu && (
          <div className={`absolute ${isOutgoing ? 'left-0' : 'right-0'} -top-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-10`}>
            {(['interesting', 'prepared', 'considered'] as MessageStatus[]).map((s) => {
              const cfg = statusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(message.id, s);
                    setShowMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                onStatusChange(message.id, 'none');
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 rounded text-sm hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600"
            >
              Очистити
            </button>
          </div>
        )}
      </div>
    </div>
  );
}