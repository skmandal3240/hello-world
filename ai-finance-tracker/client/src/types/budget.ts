import { Category } from './transaction';

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'>;
}
