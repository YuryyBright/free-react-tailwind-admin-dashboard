// src/components/InputArea.tsx
import { Send, Paperclip, Mic } from 'lucide-react';
import { useState } from 'react';
import { IconButton } from './ui/IconButton';
import { Button } from './ui/Button';

type InputAreaProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

const InputArea: React.FC<InputAreaProps> = ({ value, onChange, onSend }) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(prev => !prev);
    // Тут логіка для запису голосу (заглушка)
    alert(isRecording ? 'Запис зупинено' : 'Запис розпочато');
  };

  const handleAttach = () => {
    // Заглушка для attachments
    alert('Додати файл');
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <IconButton
          icon={<Paperclip className="w-5 h-5" />}
          onClick={handleAttach}
          title="Додати файл"
        />
        
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишіть повідомлення..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        
        <IconButton
          icon={<Mic className={`w-5 h-5 ${isRecording ? 'text-red-600' : ''}`} />}
          onClick={toggleRecording}
          title={isRecording ? 'Зупинити запис' : 'Голосове повідомлення'}
        />
        
        <Button 
          onClick={onSend} 
          disabled={!value.trim()}
          className="px-6"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default InputArea;