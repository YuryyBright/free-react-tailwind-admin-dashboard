// src/components/MessagesArea.tsx
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { MessageItem } from './MessageItem';
import { Message, MessageStatus } from './types';
import { Button } from './ui/Button';
import { useMessageContext } from '../../context/MessageContext';
import { ChevronDown } from 'lucide-react';

export const MessagesArea: React.FC<{
  messages: Message[];
}> = ({ messages }) => {
  const { state, dispatch } = useMessageContext();
  const { selectedChatId, selectedMessageIds } = state;
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const [showScrollToUnread, setShowScrollToUnread] = useState(false);

  const visibleMessages = messages.slice(messages.length - visibleCount);

  const unreadIds = messages
    .filter(m => !m.isOutgoing && !m.isRead)
    .map(m => m.id);

  const hasScrolledToUnread = useRef(false);

  // Прокрутка до першого непрочитаного
  const scrollToFirstUnread = () => {
    if (unreadIds.length === 0) return;
    const el = document.getElementById(unreadIds[0]);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Якщо непрочитане не в visible, завантажити більше
      setVisibleCount(messages.length);
    }
  };

  useEffect(() => {
    if (unreadIds.length > 0 && !hasScrolledToUnread.current) {
      setTimeout(scrollToFirstUnread, 300);
      hasScrolledToUnread.current = true;
    }
  }, [unreadIds.length]);

  // IntersectionObserver — автопрочитання
  useEffect(() => {
    if (!selectedChatId || unreadIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .map(e => e.target.id);

        if (visible.length > 0) {
          dispatch({
            type: 'MARK_AS_READ',
            payload: { chatId: selectedChatId, messageIds: visible },
          });
        }
      },
      { root: scrollRef.current, threshold: 0.8 }
    );

    unreadIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [unreadIds, selectedChatId, dispatch]);

  // Показувати кнопку прокрутки вниз до непрочитаних
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
      setShowScrollToUnread(unreadIds.length > 0 && !isNearBottom);
    };

    scrollRef.current?.addEventListener('scroll', handleScroll);
    return () => scrollRef.current?.removeEventListener('scroll', handleScroll);
  }, [unreadIds.length]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && visibleCount < messages.length) {
          prevHeightRef.current = scrollRef.current?.scrollHeight || 0;
          setVisibleCount(prev => Math.min(prev + 5, messages.length));
        }
      },
      { threshold: 0.1, root: scrollRef.current }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [visibleCount, messages.length]);

  // Adjust scroll position after loading more
  useLayoutEffect(() => {
    if (scrollRef.current && visibleCount > 5) { // After initial
      const newHeight = scrollRef.current.scrollHeight;
      const heightDiff = newHeight - prevHeightRef.current;
      scrollRef.current.scrollTop += heightDiff;
    }
  }, [visibleCount]);

  // Initial scroll to bottom
  useEffect(() => {
    if (scrollRef.current && visibleCount === 5) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMarkAllAsRead = () => {
    if (!selectedChatId) return;
    dispatch({
      type: 'MARK_AS_READ',
      payload: { chatId: selectedChatId, messageIds: unreadIds },
    });
  };

  const handleToggleSelect = (id: string) => {
    dispatch({ type: 'TOGGLE_MESSAGE', payload: id });
  };

  const handleToggleBookmark = (id: string) => {
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: id });
  };

  const handleStatusChange = (id: string, status: MessageStatus) => {
    dispatch({ type: 'UPDATE_MESSAGE_STATUS', payload: { id, status } });
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Кнопка "Прочитати всі" */}
      {unreadIds.length > 0 && (
        <div className="sticky top-0 z-10 p-3 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/30 flex justify-center gap-3">
          <Button onClick={handleMarkAllAsRead} variant="primary" size="sm">
            Прочитати всі ({unreadIds.length})
          </Button>
          <Button onClick={scrollToFirstUnread} variant="secondary" size="sm">
            Прокрутити до нових
          </Button>
        </div>
      )}

      {/* Кнопка прокрутки до непрочитаних */}
      {showScrollToUnread && (
        <button
          onClick={scrollToFirstUnread}
          className="fixed bottom-24 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40 animate-bounce"
        >
          <ChevronDown className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {unreadIds.length}
          </span>
        </button>
      )}

      {/* Повідомлення */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 scrollbar-thin flex flex-col-reverse">
        <div className="flex flex-col">
          {visibleMessages.map((msg, i) => {
            // Since slice(-n), [0] is oldest visible, [end] newest
            const showAvatar = i === 0 || visibleMessages[i - 1].isOutgoing !== msg.isOutgoing;
            const isUnread = !msg.isOutgoing && !msg.isRead;
            const isSelected = selectedMessageIds.has(msg.id);

            return (
              <div
                key={msg.id}
                id={msg.id}
                className={`mb-3 transition-all ${isUnread ? 'bg-blue-50/70 dark:bg-blue-900/30 rounded-lg p-2 -mx-2' : ''}`}
              >
                <MessageItem
                  message={msg}
                  showAvatar={showAvatar}
                  onStatusChange={handleStatusChange}
                  isUnread={isUnread}
                  isSelected={isSelected}
                  onToggleSelect={() => handleToggleSelect(msg.id)}
                  onToggleBookmark={() => handleToggleBookmark(msg.id)}
                />
              </div>
            );
          })}
        </div>
        <div ref={loadMoreRef} style={{ height: '10px' }} />
      </div>

      {/* Підказка про вибір */}
      {selectedMessageIds.size > 0 && (
        <div className="p-3 bg-blue-600 text-white text-center font-medium">
          Вибрано повідомлень: {selectedMessageIds.size} → Відкрийте AI-асистента → "Вибрані"
        </div>
      )}
    </div>
  );
};