// src/context/MessageContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { Message, Chat, MessageStatus } from '../components/chat/types';

type State = {
  chats: Chat[];
  messages: Record<string, Message[]>; // chatId → messages
  selectedChatId: string | null;
  selectedMessageIds: Set<string>;
  searchQuery: string;
};

type Action =
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'SET_MESSAGES'; payload: { chatId: string; messages: Message[] } }
  | { type: 'SELECT_CHAT'; payload: string }
  | { type: 'TOGGLE_MESSAGE'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'MARK_AS_READ'; payload: { chatId: string; messageIds: string[] } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { id: string; status: MessageStatus } }
  | { type: 'TOGGLE_BOOKMARK'; payload: string }
  | { type: 'LOAD_STATE'; payload: State };

const initialState: State = {
  chats: [],
  messages: {},
  selectedChatId: null,
  selectedMessageIds: new Set(),
  searchQuery: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: { ...state.messages, [action.payload.chatId]: action.payload.messages },
      };
    case 'SELECT_CHAT':
      return { ...state, selectedChatId: action.payload, selectedMessageIds: new Set() };
    case 'TOGGLE_MESSAGE':
  return {
    ...state,
    selectedMessageIds: state.selectedMessageIds.has(action.payload)
      ? new Set([...state.selectedMessageIds].filter(id => id !== action.payload))
      : new Set([...state.selectedMessageIds, action.payload]),
  };
    case 'CLEAR_SELECTION':
      return { ...state, selectedMessageIds: new Set() };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'MARK_AS_READ':
      const { chatId, messageIds } = action.payload;
      const updatedMessages = state.messages[chatId]?.map(m =>
        messageIds.includes(m.id) ? { ...m, isRead: true } : m
      ) || [];

      const markedCount = messageIds.length;

      const updatedChats = state.chats.map(chat =>
        chat.id === chatId
          ? { ...chat, unreadCount: Math.max(0, chat.unreadCount - markedCount) }
          : chat
      );

      return {
        ...state,
        messages: { ...state.messages, [chatId]: updatedMessages },
        chats: updatedChats,
      };
    case 'ADD_MESSAGE':
      const chatIdAdd = action.payload.isOutgoing
        ? state.selectedChatId
        : state.chats.find(c => c.id === action.payload.id.split('-')[0])?.id;
      if (!chatIdAdd) return state;
      const newMsgs = [...(state.messages[chatIdAdd] || []), action.payload];
      return {
        ...state,
        messages: { ...state.messages, [chatIdAdd]: newMsgs },
      };
    case 'UPDATE_MESSAGE_STATUS':
      return {
        ...state,
        messages: Object.fromEntries(
          Object.entries(state.messages).map(([id, msgs]) => [
            id,
            msgs.map(m => (m.id === action.payload.id ? { ...m, status: action.payload.status } : m)),
          ])
        ),
      };
    case 'TOGGLE_BOOKMARK':
      return {
        ...state,
        messages: Object.fromEntries(
          Object.entries(state.messages).map(([id, msgs]) => [
            id,
            msgs.map(m => (m.id === action.payload ? { ...m, isBookmarked: !m.isBookmarked } : m)),
          ])
        ),
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

const MessageContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  // Завантаження з localStorage при старті
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = localStorage.getItem('chatState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // відновлюємо Set
        parsed.selectedMessageIds = new Set(parsed.selectedMessageIds);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) {
        console.warn('Не вдалося завантажити стан');
      }
    }
  }, []);

  // Збереження при зміні
  useEffect(() => {
    if (!initialized.current) return;
    const toSave = {
      ...state,
      selectedMessageIds: Array.from(state.selectedMessageIds),
    };
    localStorage.setItem('chatState', JSON.stringify(toSave));
  }, [state]);

  return (
    <MessageContext.Provider value={{ state, dispatch }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => useContext(MessageContext);