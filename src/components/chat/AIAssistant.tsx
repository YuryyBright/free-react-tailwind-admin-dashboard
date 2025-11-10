// src/components/AIAssistant.tsx
import { Bot, Send, X, Sparkles, AlertTriangle, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { AIMessage, Message } from './types';
import { useMessageContext } from '../../context/MessageContext';

const mockAIStream = async function* (text: string) {
  const words = text.split(' ');
  for (let i = 0; i <= words.length; i++) {
    await new Promise(r => setTimeout(r, 40));
    yield words.slice(0, i).join(' ') + (i < words.length ? '...' : '');
  }
};

export const AIAssistant: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { state } = useMessageContext();
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [aiMessages, streamingText]);

  const currentMessages = state.selectedChatId ? state.messages[state.selectedChatId] || [] : [];

  const extractThemes = (msgs: Message[]): string[] => {
    const text = msgs.map(m => m.content || '').join(' ').toLowerCase();
    const map: Record<string, string[]> = {
      'проект': ['проект', 'таск', 'завдання'],
      'зустріч': ['зустріч', 'дзвінок', 'мітинг'],
      'дедлайн': ['дедлайн', 'термін', 'сьогодні', 'завтра'],
    };
    return Object.keys(map).filter(t => map[t].some(k => text.includes(k))).slice(0, 3);
  };

  const analyze = async (type: 'all' | 'new' | 'selected') => {
    let target: Message[] = [];
    if (type === 'new') target = currentMessages.filter(m => !m.isOutgoing && !m.isRead);
    else if (type === 'selected') target = currentMessages.filter(m => state.selectedMessageIds.has(m.id));
    else target = currentMessages;

    if (target.length === 0) {
      addMessage('assistant', 'Немає повідомлень для аналізу.');
      return;
    }

    const userMsg: AIMessage = {
      id: `ai-${Date.now()}`,
      role: 'user',
      content: `Проаналізуй ${type === 'new' ? 'нові' : type === 'selected' ? 'вибрані' : 'всі'} повідомлення (${target.length})`,
      timestamp: new Date(),
    };
    setAiMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const incoming = target.filter(m => !m.isOutgoing).length;
    const unread = target.filter(m => !m.isRead && !m.isOutgoing).length;
    const urgent = target.filter(m => !m.isOutgoing && !m.isRead && /терміново|швидко|сьогодні|до \d{2}:\d{2}/i.test(m.content || '')).length;

    const response = `**Аналіз ${target.length} повідомлень**

**Статистика:**
• Вхідних: ${incoming}
• Непрочитаних: ${unread} ${unread > 0 ? 'Warning' : 'Checkmark'}

**Теми:** ${extractThemes(target).join(', ') || 'немає чітких'}

${urgent > 0 ? `**${urgent} термінових повідомлень!**\n` : ''}
${target.some(m => m.type === 'document') ? 'Є документи\n' : ''}
${target.some(m => m.type === 'image') ? 'Є фото' : ''}

**Рекомендація:** ${unread > 2 ? 'Переглянь нові повідомлення.' : 'Все під контролем.'}`;

    await streamResponse(response);
    setIsLoading(false);
  };

  const streamResponse = async (text: string) => {
    setStreamingText('');
    for await (const chunk of mockAIStream(text)) {
      setStreamingText(chunk);
    }
    const final: AIMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: text,
      timestamp: new Date(),
    };
    setAiMessages(prev => [...prev, final]);
    setStreamingText('');
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setAiMessages(prev => [...prev, { id: `ai-${Date.now()}`, role, content, timestamp: new Date() }]);
  };

  const sendCustom = async () => {
    if (!inputValue.trim()) return;
    addMessage('user', inputValue);
    setInputValue('');
    setIsLoading(true);

    const lower = inputValue.toLowerCase();
    let reply = '';
    if (lower.includes('підсумок')) reply = 'Коротко: обговорили проєкт, заплановано зустріч на пʼятницю, 3 термінові повідомлення.';
    else if (lower.includes('термінове')) reply = 'Warning Знайдено 3 термінові: "до 15:00", "підписати", "дзвінок 14:30".';
    else reply = `Ви запитали: "${inputValue}".\n\nЦе демо AI. У реальності тут буде відповідь від Grok/OpenAI.`;

    await streamResponse(reply);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-purple-600" />
            <h2 className="text-xl font-bold">AI Асистент</h2>
          </div>
          <IconButton icon={<X className="w-6 h-6" />} onClick={onClose} />
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
          <Button size="sm" onClick={() => analyze('new')} disabled={isLoading}>
            <AlertTriangle className="w-4 h-4 mr-1" /> Нові
          </Button>
          <Button size="sm" variant="secondary" onClick={() => analyze('selected')} disabled={isLoading}>
            Вибрані ({state.selectedMessageIds.size})
          </Button>
          <Button size="sm" variant="secondary" onClick={() => analyze('all')} disabled={isLoading}>
            <FileText className="w-4 h-4 mr-1" /> Всі
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {aiMessages.length === 0 && !streamingText && (
            <div className="text-center text-gray-500 mt-16">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg">Привіт! Я ваш AI-асистент.</p>
              <p className="text-sm mt-2">Оберіть дію або напишіть запит.</p>
            </div>
          )}

          {aiMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700">
                <p className="whitespace-pre-wrap text-sm">{streamingText}</p>
              </div>
            </div>
          )}

          {isLoading && !streamingText && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl">
                <p className="text-sm">Аналізую...<span className="animate-pulse">...</span></p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendCustom()}
              placeholder="Запитайте про чат..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
              disabled={isLoading}
            />
            <Button onClick={sendCustom} disabled={isLoading || !inputValue.trim()}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};