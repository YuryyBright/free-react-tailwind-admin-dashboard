// src/components/chat/MessagesArea.tsx
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { MessageItem } from './MessageItem';
import { Message } from './types';
import { Button } from './ui/Button';
import { useMessageContext } from '../../context/MessageContext';
import { ChevronDown } from 'lucide-react';

const INITIAL_LOAD = 235;

export const MessagesArea: React.FC<{
  messages: Message[];
  readOnly?: boolean;
}> = ({ messages, readOnly = false }) => {
  const { state, dispatch } = useMessageContext();
  const { selectedChatId } = state;

  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef(0);
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [showScrollToUnread, setShowScrollToUnread] = useState(false);

  const unreadMessages = messages.filter(m => !m.isRead);
  const unreadIds = unreadMessages.map(m => m.id);
  const firstUnreadIndex = messages.findIndex(m => !m.isRead);
  const hasScrolledToUnread = useRef(false);

  // Визначаємо, скільки завантажити при першому відкритті
  useLayoutEffect(() => {
    if (messages.length === 0) return;

    hasScrolledToUnread.current = false;

    if (firstUnreadIndex === -1) {
      // Немає непрочитаних → завантажуємо останні 235
      setVisibleCount(Math.min(INITIAL_LOAD, messages.length));
    } else {
      // Є непрочитані → завантажуємо все до першого непрочитаного + 50 знизу
      const loadUntil = Math.min(firstUnreadIndex + 50, messages.length);
      setVisibleCount(loadUntil);
    }
  }, [messages.length, selectedChatId]);

  // Автоскрол до першого непрочитаного
  useLayoutEffect(() => {
    if (hasScrolledToUnread.current || !scrollRef.current) return;

    if (firstUnreadIndex === -1) {
      // Немає непрочитаних → скролимо вниз
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      hasScrolledToUnread.current = true;
      return;
    }

    const el = document.getElementById(unreadIds[0]);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasScrolledToUnread.current = true;
    }
  }, [visibleCount, unreadIds]);

  const scrollToFirstUnread = () => {
    const el = document.getElementById(unreadIds[0]);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasScrolledToUnread.current = true;
    }
  };

  // Напрямок скролу (звичайний: вгору = менше scrollTop)
  const lastScrollTop = useRef(0);
  const isScrollingDown = useRef(true);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const current = scrollRef.current.scrollTop;
      isScrollingDown.current = current > lastScrollTop.current;
      lastScrollTop.current = current;
    };
    const el = scrollRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver: читаємо ТІЛЬКИ при скролі вниз або при першому відкритті
  useEffect(() => {
    if (!selectedChatId || unreadIds.length === 0 || readOnly) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleIds = entries
          .filter(e => e.isIntersecting)
          .map(e => e.target.id);

        if (visibleIds.length === 0) return;

        const shouldMarkRead = isScrollingDown.current || !hasScrolledToUnread.current;

        if (shouldMarkRead) {
          dispatch({
            type: 'MARK_AS_READ',
            payload: { chatId: selectedChatId, messageIds: visibleIds },
          });
        }
      },
      {
        root: scrollRef.current,
        threshold: 0.8,
      }
    );

    unreadIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [unreadIds, selectedChatId, dispatch, readOnly]);

  // Плаваюча кнопка "вниз"
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 400;
      setShowScrollToUnread(unreadIds.length > 0 && !nearBottom);
    };
    scrollRef.current?.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => scrollRef.current?.removeEventListener('scroll', handleScroll);
  }, [unreadIds.length]);

  // Infinite scroll: підвантаження старих
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < messages.length) {
          prevHeightRef.current = scrollRef.current?.scrollHeight || 0;
          setVisibleCount(prev => Math.min(prev + 100, messages.length));
        }
      },
      { threshold: 0.1, root: scrollRef.current }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, messages.length]);

  // Збереження позиції при підвантаженні
  useLayoutEffect(() => {
    if (!scrollRef.current || visibleCount <= INITIAL_LOAD || prevHeightRef.current === 0) return;

    const newHeight = scrollRef.current.scrollHeight;
    const diff = newHeight - prevHeightRef.current;
    scrollRef.current.scrollTop += diff;
  }, [visibleCount]);

  const handleMarkAllAsRead = () => {
    if (!selectedChatId) return;
    dispatch({
      type: 'MARK_AS_READ',
      payload: { chatId: selectedChatId, messageIds: unreadIds },
    });
  };

  // Callback'и для MessageItem
  const handleStatusChange = (id: string, status: any) => {
    dispatch({
      type: 'UPDATE_MESSAGE_STATUS',
      payload: { id, status },
    });
  };

  const handleToggleBookmark = (id: string) => {
    dispatch({
      type: 'TOGGLE_BOOKMARK',
      payload: id,
    });
  };

  const visibleMessages = messages.slice(0, visibleCount);

  return (
    <div className="flex flex-col h-full relative">
      {/* Кнопки зверху */}
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

      {/* Плаваюча кнопка */}
      {showScrollToUnread && (
        <button
          onClick={scrollToFirstUnread}
          className="fixed bottom-24 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40 animate-bounce hover:bg-blue-700 transition"
        >
          <ChevronDown className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {unreadIds.length}
          </span>
        </button>
      )}

      {/* Список повідомлень */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 scrollbar-thin"
      >
        <div className="max-w-4xl mx-auto">
          {visibleMessages.map((msg, i) => {
            const prevMsg = visibleMessages[i - 1];
            const showAvatar = !prevMsg || prevMsg.isOutgoing !== msg.isOutgoing;
            const isUnread = !msg.isRead;

            return (
              <div
                key={msg.id}
                id={msg.id}
                className={`mb-3 transition-all ${isUnread ? 'bg-blue-50/70 dark:bg-blue-900/30 rounded-lg p-2 -mx-2' : ''}`}
              >
                <MessageItem
                  message={msg}
                  showAvatar={showAvatar}
                  isUnread={isUnread}
                  isSelected={state.selectedMessageIds.has(msg.id)}
                  onToggleSelect={(id) => dispatch({ type: 'TOGGLE_MESSAGE', payload: id })}
                  onStatusChange={handleStatusChange}
                  onToggleBookmark={handleToggleBookmark}
                  readOnly={readOnly}
                />
              </div>
            );
          })}
        </div>

        {/* Тригер для підвантаження */}
        {visibleCount < messages.length && (
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
            <span className="text-sm text-gray-500">Завантаження...</span>
          </div>
        )}
      </div>
    </div>
  );
};