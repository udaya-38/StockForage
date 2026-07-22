import { create } from 'zustand';
import type { Category } from '../types';
import { STORAGE_KEYS } from '../constants';
import { readStorage, writeStorage } from '../services/localStorage';

interface CategoryState {
  categories: Category[];
  loadCategories: () => void;
  addCategory: (cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  updateProductCount: (categoryId: string, delta: number) => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],

  loadCategories: () => {
    const categories = readStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    set({ categories });
  },

  addCategory: (data) => {
    const newCat: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const categories = [...get().categories, newCat];
    writeStorage(STORAGE_KEYS.CATEGORIES, categories);
    set({ categories });
  },

  updateCategory: (id, updates) => {
    const categories = get().categories.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    writeStorage(STORAGE_KEYS.CATEGORIES, categories);
    set({ categories });
  },

  deleteCategory: (id) => {
    const categories = get().categories.filter(c => c.id !== id);
    writeStorage(STORAGE_KEYS.CATEGORIES, categories);
    set({ categories });
  },

  getCategoryById: (id) => get().categories.find(c => c.id === id),

  updateProductCount: (categoryId, delta) => {
    const categories = get().categories.map(c =>
      c.id === categoryId ? { ...c, productCount: Math.max(0, c.productCount + delta) } : c
    );
    writeStorage(STORAGE_KEYS.CATEGORIES, categories);
    set({ categories });
  },
}));
