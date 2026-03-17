export type TxType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  userId?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId?: string;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  type: TxType;
  isRecurring: boolean;
  plaidTxId?: string;
  createdAt: string;
  category?: Pick<Category, 'id' | 'name' | 'icon' | 'color'>;
  account?: { id: string; name: string; type: string };
}
