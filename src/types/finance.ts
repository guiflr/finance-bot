export interface FinanceMessage {
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    date: Date;
    phoneNumber: string;
  }
  