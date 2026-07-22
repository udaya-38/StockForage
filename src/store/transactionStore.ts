import { create } from 'zustand';
import type { Transaction, TransactionType } from '../types';
import { STORAGE_KEYS } from '../constants';
import { readStorage, writeStorage } from '../services/localStorage';

interface TransactionState {
  transactions: Transaction[];
  filterType: TransactionType | 'all';
  filterProductId: string;
  currentPage: number;
  pageSize: number;

  loadTransactions: () => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  setFilterType: (type: TransactionType | 'all') => void;
  setFilterProductId: (id: string) => void;
  setPage: (page: number) => void;
  getFilteredTransactions: () => Transaction[];
  getTransactionsByProduct: (productId: string) => Transaction[];
  getMonthlyData: () => { month: string; stockIn: number; stockOut: number; value: number }[];
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  filterType: 'all',
  filterProductId: '',
  currentPage: 1,
  pageSize: 25,

  loadTransactions: () => {
    const transactions = readStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    set({ transactions });
  },

  addTransaction: (data) => {
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const transactions = [newTx, ...get().transactions];
    writeStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    set({ transactions });
    return newTx;
  },

  setFilterType: (type) => set({ filterType: type, currentPage: 1 }),
  setFilterProductId: (id) => set({ filterProductId: id, currentPage: 1 }),
  setPage: (page) => set({ currentPage: page }),

  getFilteredTransactions: () => {
    const { transactions, filterType, filterProductId } = get();
    let result = transactions;
    if (filterType !== 'all') result = result.filter(t => t.type === filterType);
    if (filterProductId) result = result.filter(t => t.productId === filterProductId);
    return result;
  },

  getTransactionsByProduct: (productId) =>
    get().transactions.filter(t => t.productId === productId),

  getMonthlyData: () => {
    const { transactions } = get();
    const months: Record<string, { stockIn: number; stockOut: number; value: number }> = {};

    // Build last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months[key] = { stockIn: 0, stockOut: 0, value: 0 };
    }

    transactions.forEach(tx => {
      const d = new Date(tx.createdAt);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!months[key]) return;
      if (tx.type === 'stock-in') {
        months[key].stockIn += tx.quantity;
        months[key].value += tx.quantity * 1000; // approximate value
      } else if (tx.type === 'stock-out') {
        months[key].stockOut += tx.quantity;
      }
    });

    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  },
}));
