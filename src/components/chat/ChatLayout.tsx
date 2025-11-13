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

export default function ChatApp({ readOnly = false }: { readOnly?: boolean }) {
  const { state, dispatch } = useMessageContext();
  const { selectedChatId, messages, searchQuery } = state;
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'gallery' | 'documents'>('messages');
  const [inputValue, setInputValue] = useState('');
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);

  const selectedChat = (state.chats || mockChats).find(c => c.id === selectedChatId) || mockChats[0];
  const currentMessages = selectedChatId ? messages[selectedChatId] || [] : [];

  useEffect(() => {
    dispatch({ type: 'SET_CHATS', payload: mockChats });

    mockChats.forEach(chat => {
      const generated = generateMessages(chat.id);

      // У режимі readOnly — всі повідомлення спочатку НЕ прочитані
      if (readOnly) {
        generated.forEach(msg => {
          msg.isRead = false;
        });
      }

      dispatch({
        type: 'SET_MESSAGES',
        payload: { chatId: chat.id, messages: generated },
      });
    });
  }, [dispatch, readOnly]);

  const handleSend = () => {
    if (!inputValue.trim() || !selectedChatId || readOnly) return;
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

  const unreadCount = currentMessages.filter(m => !m.isRead).length;

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Sidebar
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
            onCall={readOnly ? undefined : setCallType} // блокуємо дзвінки в readOnly
          />

          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 min-w-0">
              {activeTab === 'messages' && (
                <MessagesArea messages={currentMessages} readOnly={readOnly} />
              )}
              {/* інші таби */}
            </div>

            {activeTab === 'messages' && !readOnly && <AnalysisSidebar />}
          </div>

          {/* Поле вводу тільки в звичайному режимі */}
          {activeTab === 'messages' && !readOnly && (
            <InputArea value={inputValue} onChange={setInputValue} onSend={handleSend} />
          )}
        </div>
      </div>

      {/* Дзвінки тільки в звичайному режимі */}
      {!readOnly && callType && (
        <CallModal callType={callType} chat={selectedChat} onEndCall={() => setCallType(null)} />
      )}
    </>
  );
}