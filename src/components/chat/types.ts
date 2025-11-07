export type MessageType = "text" | "image" | "video" | "voice" | "document";

interface BaseMessage {
  id: string;
  type: MessageType;
  timestamp: Date;
  isOutgoing: boolean;
  isRead?: boolean;
  reactions?: string[];
}

export interface TextMessage extends BaseMessage {
  type: "text";
  content: string;
}

export interface MediaMessage extends BaseMessage {
  type: "image" | "video";
  url: string;
  caption?: string;
}

export interface VoiceMessage extends BaseMessage {
  type: "voice";
  duration: number;
  url: string;
}

export interface DocumentMessage extends BaseMessage {
  type: "document";
  fileName: string;
  fileSize: string;
  url: string;
}

export type MessageStatus = 'none' | 'interesting' | 'prepared' | 'considered';

export interface Message {
  id: string;
  type: MessageType;
  content?: string;
  url?: string;
  caption?: string;
  duration?: number;
  fileName?: string;
  fileSize?: string;
  timestamp: Date;
  isOutgoing: boolean;
  isRead?: boolean;
  reactions?: string[];
  status: MessageStatus; // ← НОВЕ
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isOnline: boolean;
  isTyping?: boolean;
}

