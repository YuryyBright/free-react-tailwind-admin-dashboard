import { PhoneOff } from 'lucide-react';
import { Chat } from './types';
import { Avatar } from './ui/Avatar';
import { useState, useEffect } from 'react';

type CallType = 'audio' | 'video' | null;

const CallModal: React.FC<{
  callType: CallType;
  chat: Chat;
  onEndCall: () => void;
}> = ({ callType, chat, onEndCall }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!callType) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="text-center text-white">
        <Avatar src={chat.avatar} alt={chat.name} size="lg" />
        <h2 className="text-2xl font-bold mt-4">{chat.name}</h2>
        <p className="text-lg mt-2 text-gray-300">{formatDuration(duration)}</p>
        <p className="mt-2 text-gray-400">
          {callType === 'audio' ? 'Аудіо дзвінок' : 'Відео дзвінок'}
        </p>

        {callType === 'video' && (
          <div className="mt-8 w-96 h-64 bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Відео (демо)</p>
          </div>
        )}

        <button
          onClick={onEndCall}
          className="mt-8 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full flex items-center gap-2 mx-auto"
        >
          <PhoneOff className="w-5 h-5" />
          Завершити дзвінок
        </button>
      </div>
    </div>
  );
};

export default CallModal;