import { Paperclip, Smile, Send } from 'lucide-react';

interface InputAreaProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
}

export default function InputArea({ value, onChange, onSend }: InputAreaProps) {
  return (
    <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">

    </div>
  );
}