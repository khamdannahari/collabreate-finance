export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  date: string | Date;
  imageUri?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  profileImage?: string;
  stats: {
    totalTransactions: number;
    totalIncome: number;
    totalExpenses: number;
    savingsRate: string;
  };
}

export interface ChartData {
  labels: string[];
  income: number[];
  expenses: number[];
}

export interface ChartDataResponse {
  all: ChartData;
  monthly: ChartData;
  weekly: ChartData;
}
