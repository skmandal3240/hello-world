import { api } from './axios';
import { Transaction, TxType } from '../types/transaction';

export interface TxFilters {
  from?: string; to?: string; categoryId?: string; accountId?: string;
  type?: TxType; q?: string; page?: number; limit?: number;
}

export const transactionsApi = {
  list: (filters?: TxFilters) =>
    api.get<{ transactions: Transaction[]; total: number; page: number; pages: number }>('/transactions', { params: filters }),
  create: (data: Omit<Transaction, 'id' | 'createdAt' | 'category' | 'account'>) =>
    api.post<Transaction>('/transactions', data),
  update: (id: string, data: Partial<Transaction>) => api.patch<Transaction>(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
  importCsv: (accountId: string, rows: object[]) =>
    api.post<{ imported: number }>('/transactions/import/csv', { accountId, rows }),
  categorize: (descriptions: { id: string; description: string }[], categories: { id: string; name: string }[]) =>
    api.post('/transactions/categorize', { descriptions, categories }),
};
