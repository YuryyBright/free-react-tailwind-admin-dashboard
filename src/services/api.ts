import axios from 'axios';
import { Account, Chat, Alert } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',  // Ваш бекенд URL
});

// Інтерсептор для автоматичного додавання JWT в заголовки
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock data (як раніше, для тестування)
const mockAccounts: Account[] = [
  { id: '1', username: 'admin', password: 'password', /* інші поля */ },
  // ... інші аккаунти
];
const mockChats: { [key: string]: Chat[] } = { /* ... */ };
const mockAlerts: Alert[] = [ /* ... */ ];

export const fetchAccounts = async (): Promise<Account[]> => {
  // Для реального: return (await api.get('/accounts')).data;
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockAccounts;
};

export const fetchChats = async (accountId: string): Promise<Chat[]> => {
  // Для реального: return (await api.get(`/accounts/${accountId}/chats`)).data;
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockChats[accountId] || [];
};

export const fetchAlerts = async (): Promise<Alert[]> => {
  // Для реального: return (await api.get('/alerts')).data;
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockAlerts;
};

export const loginUser = async (username: string, password: string): Promise<{ token: string }> => {
  // Для реального: const { data } = await api.post('/login', { username, password }); return data;

  // Mock логін
  await new Promise(resolve => setTimeout(resolve, 1000)); // Імітація затримки

  // Приклад простої перевірки (замініть на свої credentials або інтегруйте з mockAccounts)
  if (username === 'admin' && password === 'password') {
    return { token: 'fake-jwt-token-123456' }; // Фейковий токен
  } else {
    throw new Error('Неправильні дані для входу'); // Помилка, як в вашому коді
  }
};

