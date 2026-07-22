import { create } from 'zustand';
import type { Notification, Activity, AppSettings } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants';
import { readStorage, writeStorage } from '../services/localStorage';

// =========================================
// Notification Store
// =========================================
interface NotificationState {
  notifications: Notification[];
  loadNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt'>) => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  loadNotifications: () => {
    const notifications = readStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    set({ notifications });
  },

  markAsRead: (id) => {
    const notifications = get().notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    writeStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    set({ notifications });
  },

  markAllAsRead: () => {
    const notifications = get().notifications.map(n => ({ ...n, read: true }));
    writeStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    set({ notifications });
  },

  addNotification: (data) => {
    const newNotif: Notification = {
      ...data,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const notifications = [newNotif, ...get().notifications];
    writeStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    set({ notifications });
  },

  getUnreadCount: () => get().notifications.filter(n => !n.read).length,
}));

// =========================================
// Activity Store
// =========================================
interface ActivityState {
  activities: Activity[];
  loadActivities: () => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],

  loadActivities: () => {
    const activities = readStorage<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
    set({ activities });
  },

  addActivity: (data) => {
    const newActivity: Activity = {
      ...data,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    // Keep only last 50 activities
    const activities = [newActivity, ...get().activities].slice(0, 50);
    writeStorage(STORAGE_KEYS.ACTIVITIES, activities);
    set({ activities });
  },
}));

// =========================================
// Settings Store
// =========================================
interface SettingsState {
  settings: AppSettings;
  loadSettings: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  loadSettings: () => {
    const settings = readStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    set({ settings });
    // Apply theme to document
    const theme = settings.theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  updateSettings: (updates) => {
    const settings = { ...get().settings, ...updates };
    writeStorage(STORAGE_KEYS.SETTINGS, settings);
    set({ settings });
  },

  setTheme: (theme) => {
    const settings = { ...get().settings, theme };
    writeStorage(STORAGE_KEYS.SETTINGS, settings);
    set({ settings });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
}));
