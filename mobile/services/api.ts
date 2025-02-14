import { Transaction, UserProfile, ChartDataResponse } from '../types/api';
import Config from '../config';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = Config.API_URL;
const IS_MOCK = Config.IS_MOCK;

// Token Management
const TOKEN_KEY = 'userToken';

export const getToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    console.log('Retrieved token:', token ? 'exists' : 'not found');
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log('Token saved successfully');
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log('Token removed successfully');
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
};

// Mock user credentials
const MOCK_USER = {
  username: 'nick',
  password: 'nick123',
};

// Mock Data
const INITIAL_MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    name: 'Monthly Income',
    amount: 5000000,
    type: 'income',
    date: new Date(),
  },
  {
    id: '2',
    name: 'Groceries',
    amount: 1500000,
    type: 'expense',
    date: new Date(),
  },
  {
    id: '3',
    name: 'Project Bonus',
    amount: 2000000,
    type: 'income',
    date: '2024-03-17',
  },
];

let mockTransactions: Transaction[] = [...INITIAL_MOCK_TRANSACTIONS];

const resetMockData = () => {
  mockTransactions = [...INITIAL_MOCK_TRANSACTIONS];
};

const mockUserProfile: UserProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  joinDate: '2024-01-15',
  profileImage:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  stats: {
    totalTransactions: 156,
    totalIncome: 45000000,
    totalExpenses: 32000000,
    savingsRate: '28.9%',
  },
};

const mockChartData: ChartDataResponse = {
  all: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    income: [5000000, 6000000, 5500000, 7000000, 6500000, 7500000],
    expenses: [4000000, 4500000, 4000000, 5000000, 4800000, 5500000],
  },
  monthly: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    income: [3000000, 3500000, 4000000, 3800000],
    expenses: [2000000, 2500000, 2300000, 2700000],
  },
  weekly: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    income: [500000, 700000, 800000, 1200000, 900000, 600000, 400000],
    expenses: [300000, 400000, 300000, 900000, 600000, 300000, 200000],
  },
};

// Auth Functions
export const login = async (username: string, password: string) => {
  if (IS_MOCK) {
    // Validate mock credentials
    if (username === MOCK_USER.username && password === MOCK_USER.password) {
      const mockToken = 'mock_token_' + Date.now();
      await setToken(mockToken);
      resetMockData(); // Reset mock data to initial state on login
      return { token: mockToken, user: mockUserProfile };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (!data.token) {
      throw new Error('No token received');
    }

    console.log('Login successful, saving token');
    await setToken(data.token);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await removeToken();
    if (IS_MOCK) {
      mockTransactions.length = 0; // Clear data on logout
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const checkAuth = async () => {
  try {
    const token = await getToken();
    if (!token) {
      console.log('No token found');
      return false;
    }

    if (IS_MOCK) {
      return token.startsWith('mock_token_');
    }

    // Just check if we have a valid token format
    const isValidFormat = token.split('.').length === 3; // Simple JWT format check
    console.log('Token format:', isValidFormat ? 'valid' : 'invalid');

    if (!isValidFormat) {
      console.log('Removing invalid token');
      await removeToken();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    await removeToken();
    return false;
  }
};

// Helper function untuk request dengan auth header
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = await getToken();
  if (!token && !IS_MOCK) throw new Error('No authentication token');

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

// API Functions
export const getTransactions = async (filter?: {
  type?: 'expense' | 'income';
  search?: string;
}): Promise<Transaction[]> => {
  if (IS_MOCK) {
    let filtered = [...mockTransactions];
    if (filter?.type) {
      filtered = filtered.filter((t) => t.type === filter.type);
    }
    if (filter?.search) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(filter.search!.toLowerCase())
      );
    }
    return filtered;
  }

  try {
    const queryParams = new URLSearchParams();
    if (filter?.type) queryParams.append('type', filter.type);
    if (filter?.search) queryParams.append('search', filter.search);

    const response = await authenticatedFetch(
      `${BASE_URL}/transactions?${queryParams.toString()}`
    );
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const addTransaction = async (
  transaction: Omit<Transaction, 'id'>
): Promise<Transaction> => {
  if (IS_MOCK) {
    const newTransaction = {
      ...transaction,
      id: String(Date.now()),
    };
    mockTransactions.push(newTransaction);
    return newTransaction;
  }

  try {
    const response = await authenticatedFetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to add transaction');
    return await response.json();
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (
  id: string,
  transaction: Partial<Omit<Transaction, 'id'>>
): Promise<Transaction> => {
  if (IS_MOCK) {
    const index = mockTransactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Transaction not found');

    const updatedTransaction = {
      ...mockTransactions[index],
      ...transaction,
    };
    mockTransactions[index] = updatedTransaction;
    return updatedTransaction;
  }

  try {
    const response = await authenticatedFetch(
      `${BASE_URL}/transactions/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      }
    );
    if (!response.ok) throw new Error('Failed to update transaction');
    return await response.json();
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  if (IS_MOCK) {
    const index = mockTransactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Transaction not found');
    mockTransactions.splice(index, 1);
    return;
  }

  try {
    const response = await authenticatedFetch(
      `${BASE_URL}/transactions/${id}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) throw new Error('Failed to delete transaction');
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfile> => {
  if (IS_MOCK) {
    return mockUserProfile;
  }

  try {
    const response = await authenticatedFetch(`${BASE_URL}/profile`);
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const getChartData = async (): Promise<ChartDataResponse> => {
  if (IS_MOCK) {
    return mockChartData;
  }

  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No auth token found');
    }

    console.log('Fetching chart data with token:', token);

    const response = await fetch(`${BASE_URL}/profile/chart-data`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Chart data response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chart data error response:', errorText);
      throw new Error(errorText || 'Failed to fetch chart data');
    }

    const data = await response.json();
    console.log('Chart data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
};
