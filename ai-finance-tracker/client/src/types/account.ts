export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'LOAN' | 'CASH';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  isPlaid: boolean;
  plaidAccountId?: string;
  plaidItem?: { institutionName: string };
  createdAt: string;
}
