export interface Expense {
  id: string;
  amount: number;
  note: string;
  tags: string[];
  timestamp: number;
  currency: string;
}

export interface ParsedInput {
  amount: number | null;
  note: string;
  tags: string[];
}

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export const STORAGE_KEY = 'roti-expenses';
export const CURRENCY_KEY = 'roti-currency';
