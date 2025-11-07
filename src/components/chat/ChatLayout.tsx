import { useState, useEffect } from 'react';
import { Search, Menu, MoreVertical } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';
import Tabs from './Tabs';
import MessagesArea from './MessagesArea';
import Gallery from './Gallery';
import Documents from './Documents';
import InputArea from './InputArea';
import AnalysisSidebar from './AnalysisSidebar'; // ← Додай, якщо використовуєш
import { Chat, Message, MessageStatus } from './types';

// === MOCK CHATS ===
const baseMockChats: Chat[] = [
  {
    id: "1",
    name: "Олена Коваленко",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    lastMessage: "Дякую за інформацію!",
    timestamp: new Date(Date.now() - 5 * 60000),
    unreadCount: 3,
    isOnline: true,
    isTyping: false,
  },
  {
    id: "2",
    name: "Андрій Шевченко",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    lastMessage: "Коли зустрічаємось?",
    timestamp: new Date(Date.now() - 30 * 60000),
    unreadCount: 0,
    isOnline: false,
    isTyping: false,
  },
  {
    id: "3",
    name: "Марія Петренко",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    lastMessage: "Надіслала документи",
    timestamp: new Date(Date.now() - 2 * 3600000),
    unreadCount: 5,
    isOnline: true,
    isTyping: true,
  },
];

// Додаємо ще 7 чатів
const additionalChats = Array.from({ length: 7 }, (_, i) => ({
  id: `${i + 4}`,
  name: `Користувач ${i + 4}`,
  avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 10}.jpg`,
  lastMessage: i % 2 === 0 ? "Так, звісно!" : "Окей, домовились",
  timestamp: new Date(Date.now() - (i + 5) * 3600000),
  unreadCount: i % 3 === 0 ? 1 : 0,
  isOnline: i % 4 === 0,
  isTyping: false,
}));

const mockChats: Chat[] = [...baseMockChats, ...additionalChats];

// === MOCK MESSAGES ===
const generateMockMessages = (chatId: string): Message[] => {
  const types: Message['type'][] = ['text', 'image', 'voice', 'document'];
  const messages: Message[] = [];

  for (let i = 0; i < 35; i++) {
    const isOutgoing = Math.random() > 0.4;
    const type = types[Math.floor(Math.random() * types.length)];
    const base = {
      id: `msg-${chatId}-${i}`,
      timestamp: new Date(Date.now() - i * 180000),
      isOutgoing,
      isRead: isOutgoing ? Math.random() > 0.3 : true,
      reactions: isOutgoing && i % 6 === 0 ? ['❤️', '👍'] : [],
      status: 'none' as MessageStatus,
    };

    if (type === 'image') {
      messages.push({
        ...base,
        type: 'image',
        url: `https://picsum.photos/400/300?random=${i + chatId}`,
        caption: Math.random() > 0.6 ? 'Красиво, правда?' : undefined,
      });
    } else if (type === 'voice') {
      messages.push({
        ...base,
        type: 'voice',
        duration: Math.floor(Math.random() * 60) + 10,
        url: '#',
      });
    } else if (type === 'document') {
      messages.push({
        ...base,
        type: 'document',
        fileName: `файл_${i}.pdf`,
        fileSize: `${(Math.random() * 5).toFixed(1)} MB`,
        url: '#',
      });
    } else {
      const texts = [
        'Привіт! Як справи?',
        'Все добре, дякую!',
        'Можна зустрітися завтра?',
        'Надішли, будь ласка, файл',
        'Супер! 👍',
        'Не можу зараз говорити',
        'Окей, зрозумів',
        'Ха-ха, смішно 😄',
      ];
      messages.push({
        ...base,
        type: 'text',
        content: texts[Math.floor(Math.random() * texts.length)],
      });
    }
  }
  return messages.reverse();
};

// === MAIN APP ===
export default function ModernChatApp() {
  const [selectedChat, setSelectedChat] = useState<Chat>(mockChats[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'gallery' | 'documents'>('messages');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMessages(generateMockMessages(selectedChat.id));
  }, [selectedChat]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: `msg-new-${Date.now()}`,
      type: "text",
      content: inputValue,
      timestamp: new Date(),
      isOutgoing: true,
      isRead: false,
      status: 'none',
    };
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
  };

  const handleStatusChange = (id: string, status: MessageStatus) => {
    setMessages(prev =>
      prev.map(m => m.id === id ? { ...m, status } : m)
    );
  };

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <Sidebar
        chats={filteredChats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader
          chat={selectedChat}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
        />

        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex overflow-hidden">
          {/* Content */}
          <div className="flex-1">
            {activeTab === 'messages' && (
              <MessagesArea
                messages={messages}
                onStatusChange={handleStatusChange}
              />
            )}
            {activeTab === 'gallery' && <Gallery />}
            {activeTab === 'documents' && <Documents />}
          </div>

          {/* Analysis Sidebar (тільки для повідомлень) */}
          {activeTab === 'messages' && <AnalysisSidebar chatId={selectedChat.id} />}
        </div>

        {/* Input */}
        {activeTab === 'messages' && (
          <InputArea
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
          />
        )}
      </div>
    </div>
  );
}