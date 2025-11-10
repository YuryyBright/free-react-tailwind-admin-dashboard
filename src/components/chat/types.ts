// Auto-generated mock dataset: 8 chats × 200 messages each (~1600 messages)
// File generated programmatically. Timestamps use relative offsets via Date.now().
import { mockChats, messagesByChat } from './mockData'; // шлях до твого файлу з моками
export type MessageStatus = 'none' | 'interesting' | 'prepared' | 'considered';
export type MessageType = 'text' | 'image' | 'document' | 'voice';
export type Message = {
  id: string;
  type: MessageType;
  content?: string;
  url?: string;
  caption?: string;
  fileName?: string;
  fileSize?: string;
  duration?: number;
  timestamp: Date;
  isOutgoing: boolean;
  isRead: boolean;
  status: MessageStatus;
  isBookmarked: boolean;
  avatar?: string;
  reactions?: string[];
};

export type Chat = {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  isTyping?: boolean;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
};


export const generateMessages = (chatId: string): Message[] => {
  const rawMessages = messagesByChat[chatId] || [];

  const sortedMessages = [...rawMessages].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  return sortedMessages.map((msg, index) => {
    const chat = mockChats.find(c => c.id === chatId);

    // Гарантуємо, що timestamp — це Date
    const timestamp = msg.timestamp instanceof Date 
      ? msg.timestamp 
      : new Date(msg.timestamp);

    return {
      id: msg.id || `msg-${chatId}-${index}`,
      type: msg.type,
      content: msg.content,
      url: msg.url,
      caption: msg.caption,
      fileName: msg.fileName,
      fileSize: msg.fileSize,
      duration: msg.duration,
      timestamp,                         // тепер точно Date
      isOutgoing: msg.isOutgoing,
      isRead: msg.isRead ?? true,
      status: msg.status || 'none',
      avatar: msg.isOutgoing ? undefined : chat?.avatar,
      isBookmarked: msg.isBookmarked ?? false,
      reactions: msg.reactions || [],
    };
  });
};