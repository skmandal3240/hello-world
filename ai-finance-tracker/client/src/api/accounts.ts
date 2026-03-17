import { api } from './axios';
import { Account, AccountType } from '../types/account';

export const accountsApi = {
  list: () => api.get<Account[]>('/accounts'),
  create: (data: { name: string; type: AccountType; balance: number; currency?: string }) =>
    api.post<Account>('/accounts', data),
  update: (id: string, data: { name?: string; balance?: number }) =>
    api.patch<Account>(`/accounts/${id}`, data),
  delete: (id: string) => api.delete(`/accounts/${id}`),
  createLinkToken: () => api.post<{ link_token: string }>('/plaid/link-token'),
  exchangePlaidToken: (publicToken: string) => api.post('/plaid/exchange', { publicToken }),
  syncPlaid: () => api.post('/plaid/sync'),
};
