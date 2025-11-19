// src/components/AIAssistant.tsx

import { Bot, Send, X, Sparkles, AlertTriangle, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { AIMessage } from './types';
import { useMessageContext } from '../../context/MessageContext';

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
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, streamingText]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const currentMessages = state.selectedChatId
    ? state.messages[state.selectedChatId] || []
    : [];

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setAiMessages(prev => [
      ...prev,
      {
        id: `ai-${Date.now()}-${Math.random()}`,
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const streamResponse = async (prompt: string, retryAttempt = 0) => {
    // Скасовуємо попередній запит
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStreamingText('');
    let accumulatedText = '';
    let lastActivityTime = Date.now();

    try {
      const apiUrl = window.location.origin + '/generate/stream';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          model: 'Llama-3.2-3B-Instruct-Q4_K_M',
          prompt,
          stream: true,
          temperature: 0.7,
          max_tokens: 2048,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Невідома помилка');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Відповідь не містить body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      // Таймаут на бездіяльність (60 секунд)
      const inactivityTimeout = setInterval(() => {
        if (Date.now() - lastActivityTime > 600000) {
          clearInterval(inactivityTimeout);
          controller.abort();
        }
      }, 1000);

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          clearInterval(inactivityTimeout);
          break;
        }

        lastActivityTime = Date.now();
        buffer += decoder.decode(value, { stream: true });
        
        // Обробляємо всі повні рядки в буфері
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Зберігаємо неповний рядок

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Пропускаємо порожні рядки та heartbeat коментарі
          if (!trimmedLine || trimmedLine.startsWith(':')) continue;
          
          if (!trimmedLine.startsWith('data: ')) continue;

          const data = trimmedLine.slice(6).trim();
          if (!data || data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              clearInterval(inactivityTimeout);
              throw new Error(parsed.error);
            }

            if (parsed.text) {
              accumulatedText += parsed.text;
              setStreamingText(accumulatedText);
            }

            if (parsed.done) {
              clearInterval(inactivityTimeout);
              if (accumulatedText.trim()) {
                addMessage('assistant', accumulatedText.trim());
              }
              setStreamingText('');
              setIsLoading(false);
              retryCountRef.current = 0;
              return;
            }
          } catch (parseError) {
            console.warn('Не вдалося розпарсити JSON:', data, parseError);
          }
        }
      }

      // Якщо цикл завершився, але є накопичений текст
      if (accumulatedText.trim()) {
        addMessage('assistant', accumulatedText.trim());
      } else if (!controller.signal.aborted) {
        addMessage('assistant', 'Відповідь не отримано. Спробуйте ще раз.');
      }

    } catch (err: any) {
      console.error('Помилка стрімінгу:', err);
      
      if (err.name === 'AbortError') {
        if (accumulatedText.trim()) {
          addMessage('assistant', accumulatedText.trim() + '\n\n[Запит скасовано]');
        } else {
          addMessage('assistant', 'Запит скасовано або таймаут (60 сек).');
        }
      } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        // Проблема з мережею - пробуємо повторити
        if (retryAttempt < 2) {
          console.log(`Повторна спроба ${retryAttempt + 1}/2...`);
          retryCountRef.current = retryAttempt + 1;
          await new Promise(resolve => setTimeout(resolve, 1000));
          return streamResponse(prompt, retryAttempt + 1);
        } else {
          addMessage('assistant', 'Помилка з\'єднання. Перевірте:\n• Чи запущений сервер\n• Чи правильний URL API\n• Налаштування CORS');
        }
      } else {
        addMessage('assistant', `Помилка: ${err.message || 'Немає з\'єднання з сервером'}`);
      }
    } finally {
      setIsLoading(false);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  };

  const analyze = async (type: 'all' | 'new' | 'selected') => {
    let target = currentMessages;

    if (type === 'new')
      target = currentMessages.filter(m => !m.isOutgoing && !m.isRead);
    else if (type === 'selected')
      target = currentMessages.filter(m => state.selectedMessageIds.has(m.id));

    if (target.length === 0) {
      addMessage('assistant', 'Немає повідомлень для аналізу.');
      return;
    }

    // Захист від переповнення контексту
    if (target.length > 120) {
      addMessage('assistant', `Занадто багато повідомлень (${target.length}). Аналізую лише останні 100.`);
      target = target.slice(-100);
    }

    const userMsg: AIMessage = {
      id: `ai-${Date.now()}`,
      role: 'user',
      content: `Аналізую ${type === 'new' ? 'нові' : type === 'selected' ? 'вибрані' : 'всі'} повідомлення (${target.length} шт.)`,
      timestamp: new Date(),
    };
    setAiMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const prompt = `Ти — військовий аналітик. Проаналізуй повідомлення з чату.

Звертай особливу увагу на:
• підготовку до дій
• місця зберігання техніки
• координацію
• термінові повідомлення (ключі: "терміново", "збір", "операція", "негайно")
• переміщення, маршрути, координати

Формат відповіді — Markdown, українською.

Повідомлення:
${target
  .map((m, i) => `${i + 1}. ${m.isOutgoing ? 'Я' : 'Співрозмовник'}: ${m.content || '[файл/фото]'}`)
  .join('\n')}

Висновок:`;

    await streamResponse(prompt);
  };

  const sendCustom = async () => {
    if (!inputValue.trim()) return;

    addMessage('user', inputValue);
    setInputValue('');
    setIsLoading(true);

    const recent = currentMessages.slice(-10);
    const context = recent
      .map(m => `${m.isOutgoing ? 'Я' : 'Співрозмовник'}: ${m.content || '[медіа]'}`)
      .join('\n');

    const prompt = `Контекст чату (останні повідомлення):
${context}

Запит користувача: ${inputValue}

Відповідай українською, чітко, у Markdown. Якщо є військова/оперативна інформація — виділи її.`;

    await streamResponse(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl">
        {/* Заголовок */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-purple-600" />
            <h2 className="text-xl font-bold">AI Асистент</h2>
            {retryCountRef.current > 0 && (
              <span className="text-xs text-yellow-600">Спроба {retryCountRef.current}/2</span>
            )}
          </div>
          <IconButton icon={<X className="w-6 h-6" />} onClick={onClose} />
        </div>

        {/* Кнопки швидкого аналізу */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
          <Button size="sm" onClick={() => analyze('new')} disabled={isLoading}>
            <AlertTriangle className="w-4 h-4 mr-1" /> Нові
          </Button>
          <Button size="sm" variant="secondary" onClick={() => analyze('selected')} disabled={isLoading}>
            Вибрані ({state.selectedMessageIds.size})
          </Button>
          <Button size="sm" variant="secondary" onClick={() => analyze('all')} disabled={isLoading}>
            <FileText className="w-4 h-4 mr-1" /> Всі (останні 100)
          </Button>
        </div>

        {/* Повідомлення */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {aiMessages.length === 0 && !streamingText && !isLoading && (
            <div className="text-center text-gray-500 mt-16">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg">Привіт! Я аналізую чат на військову тематику.</p>
              <p className="text-sm mt-2">Натисни кнопку або напиши запит.</p>
            </div>
          )}

          {aiMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
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
                <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></span>
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

        {/* Поле вводу */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendCustom()}
              placeholder="Запитай про чат..."
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