import { create } from 'zustand';
import type { User, UserRole } from '../types';
import { DEMO_USERS, STORAGE_KEYS } from '../constants';
import { readStorage, writeStorage, removeStorage } from '../services/localStorage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => { success: boolean; error?: string };
  logout: () => void;
  initAuth: () => void;
  hasPermission: (module: string) => boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'products', 'categories', 'suppliers', 'transactions', 'reports', 'insights', 'settings'],
  manager: ['dashboard', 'products', 'suppliers', 'reports', 'insights'],
  warehouse: ['products', 'transactions'],
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  initAuth: () => {
    const saved = readStorage<User | null>(STORAGE_KEYS.AUTH, null);
    if (saved) {
      set({ user: saved, isAuthenticated: true });
    }
  },

  login: (email, password, remember) => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!found) {
      return { success: false, error: 'Invalid email or password.' };
    }
    const user: User = { id: found.id, name: found.name, email: found.email, role: found.role };
    set({ user, isAuthenticated: true });
    if (remember) {
      writeStorage(STORAGE_KEYS.AUTH, user);
    }
    return { success: true };
  },

  logout: () => {
    removeStorage(STORAGE_KEYS.AUTH);
    set({ user: null, isAuthenticated: false });
  },

  hasPermission: (module) => {
    const { user } = get();
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(module) ?? false;
  },
}));
