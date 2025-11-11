// src/components/AIAssistant.tsx
import { Bot, Send, X, Sparkles, AlertTriangle, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { AIMessage, Message } from './types';
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

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [aiMessages, streamingText]);

  const currentMessages = state.selectedChatId ? state.messages[state.selectedChatId] || [] : [];

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
    // Формуємо промпт для Ollama
   const prompt = `Проаналізуй наступні повідомлення з чату з акцентом на військову тематику: виявлення підготовки до будь-яких дій, місць зберігання техніки, координації операцій, потенційних загроз чи інших релевантних елементів. 

Вияви та покажи конкретні повідомлення (з номерами та цитатами), які стосуються цієї тематики. Надати статистику (кількість вхідних, непрочитаних, термінових повідомлень — терміновість визначай за ключовими словами як "терміново", "негайно", "операція", "збір"). Визнач основні теми, підтеми та рекомендації (наприклад, що робити з виявленими даними). 

Формат відповіді: markdown українською мовою. Структура: 
- **Статистика**
- **Виявлені повідомлення** (перелік з цитатами)
- **Теми та підтеми**
- **Рекомендації**

Повідомлення:
${target.map((m, i) => `${i+1}. ${m.isOutgoing ? 'Я:' : 'Інший:'} ${m.content || '[медіа]'}`).join('\n')}`;
    await streamOllamaResponse(prompt);
    setIsLoading(false);
  };

  const streamOllamaResponse = async (prompt: string) => {
  setStreamingText('');
  let accumulatedText = '';
  const timeoutDuration = 120000; // Збільште це значення, наприклад, до 120000 (2 хвилини) або більше

  const controller = new AbortController();
  const signal = controller.signal;

  const timeoutId = setTimeout(() => {
    controller.abort();
    console.error('Request timed out');
  }, timeoutDuration);

  try {
    console.log('Starting fetch to Ollama...');
    console.log('Prompt:', prompt);
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3', // Замініть на вашу модель
        prompt: prompt,
        stream: true,
      }),
      signal, // Додаємо сигнал для таймауту
    });

    clearTimeout(timeoutId); // Якщо запит успішний, скасовуємо таймаут

    console.log('Fetch response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response not OK:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      console.log('Received chunk:', chunk);
      const lines = chunk.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            accumulatedText += data.response;
            setStreamingText(accumulatedText + '...');
          }
          if (data.done) {
            break;
          }
        } catch (e) {
          console.error('Error parsing JSON:', e, 'Line:', line);
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId); // Скасовуємо таймаут у разі помилки
    console.error('Ollama error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.name === 'AbortError') {
        accumulatedText = 'Запит перервано через перевищення часу очікування. Спробуйте збільшити таймаут або перевірити Ollama.';
      } else {
        accumulatedText = 'Помилка зʼєднання з Ollama. Перевірте, чи запущено сервер.';
      }
    }
  }
  setStreamingText(accumulatedText);
  const final: AIMessage = {
    id: `ai-${Date.now()}`,
    role: 'assistant',
    content: accumulatedText,
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
    // Формуємо промпт з контекстом чату, якщо потрібно
    const context = currentMessages.slice(-5).map(m => `${m.isOutgoing ? 'Я:' : 'Інший:'} ${m.content || '[медіа]'}`).join('\n');
    const prompt = `Контекст чату (останні повідомлення):
${context}

Запит користувача: ${inputValue}

Аналізуй з акцентом на військову тематику: підготовка до дій, місця зберігання техніки, координація тощо. Якщо релевантно, покажи виявлені повідомлення з цитатами. Відповідай виключно українською мовою, використовуючи markdown для форматування.`;
    await streamOllamaResponse(prompt);
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