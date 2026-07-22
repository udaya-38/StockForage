import { STORAGE_KEYS } from '../constants';

// Generic read/write helpers for localStorage

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to write to localStorage [${key}]:`, err);
  }
}

export function removeStorage(key: string): void {
  localStorage.removeItem(key);
}

export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
