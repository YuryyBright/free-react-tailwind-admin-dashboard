import { useEffect, useRef, useState } from 'react';
import MessageItem from './MessageItem';
import { Message } from './types';

interface MessagesAreaProps {
  messages: Message[];
  onStatusChange: (id: string, status: Message['status']) => void;
}

export default function MessagesArea({ messages, onStatusChange }: MessagesAreaProps) {
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      // Симуляція завантаження старих повідомлень
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (!scrollRef.current) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '100px' }
    );

    const target = scrollRef.current.querySelector(':first-child');
    if (target) observer.current.observe(target);

    return () => observer.current?.disconnect();
  }, [messages]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
      {loading && (
        <div className="text-center py-4 text-gray-500">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}
      {messages.map((msg, i) => {
        const showAvatar = i === 0 || messages[i - 1].isOutgoing !== msg.isOutgoing;
        return (
          <MessageItem
            key={msg.id}
            message={msg}
            showAvatar={showAvatar}
            onStatusChange={onStatusChange}
          />
        );
      })}
    </div>
  );
}