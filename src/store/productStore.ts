import { create } from 'zustand';
import type { Product, ProductFilters } from '../types';
import { STORAGE_KEYS, DEFAULT_PAGE_SIZE } from '../constants';
import { readStorage, writeStorage } from '../services/localStorage';

interface ProductState {
  products: Product[];
  filters: ProductFilters;
  currentPage: number;
  pageSize: number;

  // Actions
  loadProducts: () => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkDelete: (ids: string[]) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Computed
  getFilteredProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  getLowStockProducts: () => Product[];
  getOutOfStockProducts: () => Product[];
}

const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  categoryId: '',
  supplierId: '',
  status: 'all',
  stockStatus: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  tags: [],
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  filters: DEFAULT_FILTERS,
  currentPage: 1,
  pageSize: DEFAULT_PAGE_SIZE,

  loadProducts: () => {
    const products = readStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    set({ products });
  },

  addProduct: (data) => {
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const products = [...get().products, newProduct];
    writeStorage(STORAGE_KEYS.PRODUCTS, products);
    set({ products });
    return newProduct;
  },

  updateProduct: (id, updates) => {
    const products = get().products.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    writeStorage(STORAGE_KEYS.PRODUCTS, products);
    set({ products });
  },

  deleteProduct: (id) => {
    const products = get().products.filter(p => p.id !== id);
    writeStorage(STORAGE_KEYS.PRODUCTS, products);
    set({ products });
  },

  bulkDelete: (ids) => {
    const products = get().products.filter(p => !ids.includes(p.id));
    writeStorage(STORAGE_KEYS.PRODUCTS, products);
    set({ products });
  },

  setFilters: (newFilters) => {
    set(state => ({ filters: { ...state.filters, ...newFilters }, currentPage: 1 }));
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS, currentPage: 1 });
  },

  setPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),

  getFilteredProducts: () => {
    const { products, filters } = get();
    let result = [...products];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q)
      );
    }

    // Category filter
    if (filters.categoryId) {
      result = result.filter(p => p.categoryId === filters.categoryId);
    }

    // Supplier filter
    if (filters.supplierId) {
      result = result.filter(p => p.supplierId === filters.supplierId);
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(p => p.status === filters.status);
    }

    // Stock status filter
    if (filters.stockStatus !== 'all') {
      result = result.filter(p => {
        if (filters.stockStatus === 'out') return p.quantity === 0;
        if (filters.stockStatus === 'low') return p.quantity > 0 && p.quantity <= p.minimumStock;
        if (filters.stockStatus === 'ok') return p.quantity > p.minimumStock;
        return true;
      });
    }

    // Tag filter
    if (filters.tags.length > 0) {
      result = result.filter(p => filters.tags.some(tag => p.tags.includes(tag)));
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];
      const dir = filters.sortOrder === 'asc' ? 1 : -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
      return String(aVal).localeCompare(String(bVal)) * dir;
    });

    return result;
  },

  getProductById: (id) => get().products.find(p => p.id === id),

  getLowStockProducts: () =>
    get().products.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock),

  getOutOfStockProducts: () =>
    get().products.filter(p => p.quantity === 0),
}));
