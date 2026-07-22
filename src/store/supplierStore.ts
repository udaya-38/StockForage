import { create } from 'zustand';
import type { Supplier } from '../types';
import { STORAGE_KEYS } from '../constants';
import { readStorage, writeStorage } from '../services/localStorage';

interface SupplierState {
  suppliers: Supplier[];
  searchQuery: string;
  loadSuppliers: () => void;
  addSupplier: (sup: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'productsSupplied' | 'totalOrders'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  setSearchQuery: (q: string) => void;
  getSupplierById: (id: string) => Supplier | undefined;
  getFilteredSuppliers: () => Supplier[];
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
  suppliers: [],
  searchQuery: '',

  loadSuppliers: () => {
    const suppliers = readStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    set({ suppliers });
  },

  addSupplier: (data) => {
    const newSup: Supplier = {
      ...data,
      id: `sup-${Date.now()}`,
      productsSupplied: 0,
      totalOrders: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const suppliers = [...get().suppliers, newSup];
    writeStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
    set({ suppliers });
  },

  updateSupplier: (id, updates) => {
    const suppliers = get().suppliers.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    writeStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
    set({ suppliers });
  },

  deleteSupplier: (id) => {
    const suppliers = get().suppliers.filter(s => s.id !== id);
    writeStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
    set({ suppliers });
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  getSupplierById: (id) => get().suppliers.find(s => s.id === id),

  getFilteredSuppliers: () => {
    const { suppliers, searchQuery } = get();
    if (!searchQuery) return suppliers;
    const q = searchQuery.toLowerCase();
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  },
}));
