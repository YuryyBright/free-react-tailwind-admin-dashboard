// src/components/MessagesArea.tsx
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { MessageItem } from './MessageItem';
import { Message } from './types';
import { Button } from './ui/Button';
import { useMessageContext } from '../../context/MessageContext';
import { ChevronDown } from 'lucide-react';

export const MessagesArea: React.FC<{
  messages: Message[];
  readOnly?: boolean;
}> = ({ messages, readOnly = false }) => {
  const { state, dispatch } = useMessageContext();
  const { selectedChatId } = state;
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef(0);
  const [visibleCount, setVisibleCount] = useState(30);
  const [showScrollToUnread, setShowScrollToUnread] = useState(false);

  const visibleMessages = messages.slice(-visibleCount);

  const unreadIds = messages.filter(m => !m.isRead).map(m => m.id);
  const hasScrolledToUnread = useRef(false);

  // Скидаємо прапорець при зміні чату
  useEffect(() => {
    hasScrolledToUnread.current = false;
  }, [selectedChatId]);

  // Автоматична прокрутка до першого непрочитаного при завантаженні чату
  useLayoutEffect(() => {
    if (hasScrolledToUnread.current) return;

    const firstUnreadId = unreadIds[0];

    if (!firstUnreadId) {
      // Немає непрочитаних — скролимо вниз
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      return;
    }

    const el = document.getElementById(firstUnreadId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasScrolledToUnread.current = true;
    } else {
      // Якщо елемент ще не в DOM — підвантажуємо всі повідомлення
      setVisibleCount(messages.length);
    }
  }, [messages.length, selectedChatId, unreadIds]);

  // Функція ручного скролінгу (для кнопки)
  const scrollToFirstUnread = () => {
    if (unreadIds.length === 0) return;
    const el = document.getElementById(unreadIds[0]);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasScrolledToUnread.current = true;
    } else {
      setVisibleCount(messages.length);
    }
  };

  // Автоматичне позначення як прочитаних
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

  // Показ кнопки "Прокрутити до нових"
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
      setShowScrollToUnread(unreadIds.length > 0 && !isNearBottom);
    };

    scrollRef.current?.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => scrollRef.current?.removeEventListener('scroll', handleScroll);
  }, [unreadIds.length]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && visibleCount < messages.length) {
          prevHeightRef.current = scrollRef.current?.scrollHeight || 0;
          setVisibleCount(prev => Math.min(prev + 30, messages.length));
        }
      },
      { threshold: 0.1, root: scrollRef.current }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, messages.length]);

  // Збереження позиції при підвантаженні старих повідомлень + повторна перевірка скролінгу до непрочитаного
  useLayoutEffect(() => {
    if (!scrollRef.current) return;

    // Зберігаємо позицію при підвантаженні старих
    if (visibleCount > 30 && prevHeightRef.current > 0) {
      const newHeight = scrollRef.current.scrollHeight;
      const diff = newHeight - prevHeightRef.current;
      scrollRef.current.scrollTop += diff;
    }

    // Якщо ще не скролили до непрочитаного — спробуємо ще раз (після підвантаження)
    if (!hasScrolledToUnread.current && unreadIds.length > 0) {
      const firstUnreadId = unreadIds[0];
      const el = document.getElementById(firstUnreadId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          hasScrolledToUnread.current = true;
        }, 100);
      }
    }
  }, [visibleCount]);

  // Початкова прокрутка вниз (якщо немає непрочитаних)
  useEffect(() => {
    if (scrollRef.current && visibleCount === 30 && unreadIds.length === 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount, unreadIds.length]);

  const handleMarkAllAsRead = () => {
    if (!selectedChatId) return;
    dispatch({
      type: 'MARK_AS_READ',
      payload: { chatId: selectedChatId, messageIds: unreadIds },
    });
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Кнопка "Прочитати всі" + "Прокрутити до нових" */}
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

      {/* Плаваюча кнопка прокрутки */}
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
        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 scrollbar-thin flex flex-col-reverse"
      >
        <div className="flex flex-col">
          {visibleMessages.map((msg, i) => {
            const showAvatar = i === 0 || visibleMessages[i - 1].isOutgoing !== msg.isOutgoing;
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
                  isSelected={false}
                  onToggleSelect={() => {}}
                  onToggleBookmark={() => {}}
                  readOnly={readOnly}
                />
              </div>
            );
          })}
        </div>
        <div ref={loadMoreRef} style={{ height: '10px' }} />
      </div>
    </div>
  );
};