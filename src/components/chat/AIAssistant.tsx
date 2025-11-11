// src/components/AIAssistant.tsx
import { Bot, Send, X, Sparkles, AlertTriangle, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { AIMessage, Message } from './types';
import { useMessageContext } from '../../context/MessageContext';
import axios from 'axios';

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

  // Скасування запиту
  const cancelTokenRef = useRef<axios.CancelTokenSource | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, streamingText]);

  // Очищення при закритті
  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Компонент розмонтовано');
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

  const streamOllamaResponse = async (prompt: string) => {
    setStreamingText('');
    let accumulatedText = '';

    // Скасовуємо попередній запит, якщо є
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Новий запит');
    }

    const source = axios.CancelToken.source();
    cancelTokenRef.current = source;

    try {
      console.log('Відправляємо запит до Ollama...');
      console.log('Prompt:', prompt.substring(0, 200) + '...');

      await axios.post(
        '/api/generate',
        {
          model: 'qwen2:7b-instruct',
          prompt: prompt,
          stream: true,
        },
        {
          responseType: 'stream',
          cancelToken: source.token,
          timeout: 180000, // 3 хвилини
          headers: {
            'Content-Type': 'application/json',
          },
          onDownloadProgress: progressEvent => {
            const data = progressEvent.event.target.responseText;
            const newLines = data
              .split('\n')
              .filter((line: string) => line.trim() && line.startsWith('data:'));

            for (const rawLine of newLines) {
              try {
                const jsonStr = rawLine.replace(/^data:\s*/, '');
                if (jsonStr === '[DONE]') continue;

                const json = JSON.parse(jsonStr);
                if (json.response) {
                  accumulatedText += json.response;
                  setStreamingText(accumulatedText);
                }
                if (json.done) {
                  break;
                }
              } catch (e) {
                // Ігноруємо помилки парсингу окремих рядків
                console.warn('Помилка парсингу рядка:', rawLine);
              }
            }
          },
        }
      );
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Запит скасовано:', error.message);
        if (error.message !== 'Новий запит' && error.message !== 'Компонент розмонтовано') {
          accumulatedText = 'Запит скасовано через таймаут або вручну.';
        }
      } else {
        console.error('Помилка Ollama:', error);
        accumulatedText =
          error.code === 'ECONNABORTED'
            ? 'Таймаут запиту. Ollama не відповідає.'
            : 'Помилка з’єднання з Ollama. Перевірте, чи запущено сервер.';
      }
    } finally {
      // Завершуємо потік
      setStreamingText(accumulatedText);

      if (accumulatedText.trim()) {
        const final: AIMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: accumulatedText,
          timestamp: new Date(),
        };
        setAiMessages(prev => [...prev, final]);
      }

      setStreamingText('');
      cancelTokenRef.current = null;
    }
  };

  const analyze = async (type: 'all' | 'new' | 'selected') => {
    let target: Message[] = [];

    if (type === 'new')
      target = currentMessages.filter(m => !m.isOutgoing && !m.isRead);
    else if (type === 'selected')
      target = currentMessages.filter(m => state.selectedMessageIds.has(m.id));
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

    const prompt = `Проаналізуй наступні повідомлення з чату з акцентом на військову тематику: виявлення підготовки до дій, місць зберігання техніки, координації операцій, потенційних загроз тощо.

Вияви та покажи конкретні повідомлення (з номерами та цитатами), які стосуються цієї тематики.
Надати статистику (вхідні, непрочитані, термінові — ключові слова: "терміново", "негайно", "операція", "збір").
Визнач основні теми, підтеми та рекомендації.

Формат відповіді: markdown українською мовою.
Структура:
- **Статистика**
- **Виявлені повідомлення** (тільки критичні)
- **Теми та підтеми**
- **Рекомендації**

Повідомлення:
${target
  .map((m, i) => `${i + 1}. ${m.isOutgoing ? 'Я:' : 'Інший:'} ${m.content || '[медіа]'}`)
  .join('\n')}`;

    await streamOllamaResponse(prompt);
    setIsLoading(false);
  };

  const sendCustom = async () => {
    if (!inputValue.trim()) return;

    addMessage('user', inputValue);
    setInputValue('');
    setIsLoading(true);

    const context = currentMessages
      .slice(-5)
      .map(m => `${m.isOutgoing ? 'Я:' : 'Інший:'} ${m.content || '[медіа]'}`)
      .join('\n');

    const prompt = `Контекст чату (останні повідомлення):
${context}

Запит користувача: ${inputValue}

Аналізуй з акцентом на військову тематику: підготовка до дій, місця зберігання техніки, координація тощо.
Якщо релевантно — покажи виявлені повідомлення з цитатами.
Відповідай виключно українською мовою, використовуючи markdown.`;

    await streamOllamaResponse(prompt);
    setIsLoading(false);
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
          </div>
          <IconButton icon={<X className="w-6 h-6" />} onClick={onClose} />
        </div>

        {/* Кнопки швидкого аналізу */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
          <Button size="sm" onClick={() => analyze('new')} disabled={isLoading}>
            <AlertTriangle className="w-4 h-4 mr-1" /> Нові
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => analyze('selected')}
            disabled={isLoading}
          >
            Вибрані ({state.selectedMessageIds.size})
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => analyze('all')}
            disabled={isLoading}
          >
            <FileText className="w-4 h-4 mr-1" /> Всі
          </Button>
        </div>

        {/* Повідомлення */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {aiMessages.length === 0 && !streamingText && (
            <div className="text-center text-gray-500 mt-16">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg">Привіт! Я ваш AI-асистент.</p>
              <p className="text-sm mt-2">Оберіть дію або напишіть запит.</p>
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
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
                <p className="text-sm">
                  Аналізую...<span className="animate-pulse">...</span>
                </p>
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
              placeholder="Запитайте про чат..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
              disabled={isLoading}
            />
            <Button
              onClick={sendCustom}
              disabled={isLoading || !inputValue.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};