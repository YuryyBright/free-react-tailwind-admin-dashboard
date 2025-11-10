// src/ChatLayout.tsx
import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MessagesArea } from './MessagesArea';
import { ChatHeader } from './ChatHeader';
import { Tabs } from './Tabs';
import { AnalysisSidebar } from './AnalysisSidebar';
import InputArea from './InputArea';
import CallModal from './CallModall';
import { useMessageContext } from '../../context/MessageContext';
import { mockChats } from './mockData';
import { generateMessages } from './types';
export default function ChatApp() {
  const { state, dispatch } = useMessageContext();
  const { selectedChatId, messages, searchQuery } = state;
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'gallery' | 'documents'>('messages');
  const [inputValue, setInputValue] = useState('');
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);

  const selectedChat = mockChats.find(c => c.id === selectedChatId) || mockChats[0];
  const currentMessages = selectedChatId ? messages[selectedChatId] || [] : [];

  useEffect(() => {
    if (selectedChatId) {
      dispatch({ type: 'SET_MESSAGES', payload: { chatId: selectedChatId, messages: generateMessages(selectedChatId) } });
    }
  }, [selectedChatId, dispatch]);

  useEffect(() => {
    dispatch({ type: 'SET_CHATS', payload: mockChats });
  }, [dispatch]);

  const handleSend = () => {
    if (!inputValue.trim() || !selectedChatId) return;
    const newMessage = {
      id: `msg-${Date.now()}`,
      type: 'text' as const,
      content: inputValue,
      timestamp: new Date(),
      isOutgoing: true,
      isRead: false,
      status: 'none' as const,
      isBookmarked: false,
    };
    dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
    setInputValue('');
  };

  const unreadCount = currentMessages.filter(m => !m.isOutgoing && !m.isRead).length;

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Sidebar
          chats={mockChats}
          selectedChat={selectedChat}
          searchQuery={searchQuery}
          onSearchChange={q => dispatch({ type: 'SET_SEARCH', payload: q })}
          showSidebar={showSidebar}
          onToggleSidebar={() => setShowSidebar(v => !v)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <ChatHeader
            chat={selectedChat}
            unreadCount={unreadCount}
            onToggleSidebar={() => setShowSidebar(v => !v)}
            onCall={setCallType}
          />

          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 min-w-0">
              {activeTab === 'messages' && <MessagesArea messages={currentMessages} />}
              {/* інші таби */}
            </div>

            {activeTab === 'messages' && <AnalysisSidebar />}
          </div>

          {activeTab === 'messages' && (
            <InputArea value={inputValue} onChange={setInputValue} onSend={handleSend} />
          )}
        </div>
      </div>

      {callType && (
        <CallModal callType={callType} chat={selectedChat} onEndCall={() => setCallType(null)} />
      )}
    </>
  );
}