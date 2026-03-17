import { api } from './axios';
import { Language } from '../types/auth';

export const languagesApi = {
  list: () => api.get<Language[]>('/languages'),
};
