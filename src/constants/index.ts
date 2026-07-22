import type { User } from '../types';

// =========================================
// Demo Users (Role-Based Auth)
// =========================================
export const DEMO_USERS: (User & { password: string })[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'admin@inventoryflow.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'user-2',
    name: 'Sarah Mitchell',
    email: 'manager@inventoryflow.com',
    password: 'manager123',
    role: 'manager',
  },
  {
    id: 'user-3',
    name: 'Raj Kumar',
    email: 'warehouse@inventoryflow.com',
    password: 'warehouse123',
    role: 'warehouse',
  },
];

// =========================================
// Role-Based Navigation Permissions
// =========================================
export const ROLE_PERMISSIONS = {
  admin: ['dashboard', 'products', 'categories', 'suppliers', 'transactions', 'reports', 'insights', 'settings'],
  manager: ['dashboard', 'products', 'suppliers', 'reports', 'insights'],
  warehouse: ['products', 'transactions'],
} as const;

// =========================================
// App Config
// =========================================
export const APP_NAME = 'StockForge';
export const APP_TAGLINE = 'Smart Inventory. Smarter Business.';

export const DEFAULT_SETTINGS = {
  companyName: 'StockForge Inc.',
  companyLogo: '',
  currency: 'INR',
  currencySymbol: '₹',
  language: 'en',
  theme: 'dark' as const,
  lowStockThreshold: 10,
  notificationsEnabled: true,
  emailNotifications: false,
};

// =========================================
// Category Icons & Colors
// =========================================
export const CATEGORY_ICONS = [
  'Monitor', 'Smartphone', 'Package', 'Shirt', 'Utensils',
  'BookOpen', 'Dumbbell', 'Car', 'Wrench', 'Zap',
  'Headphones', 'Camera', 'Watch', 'ShoppingBag', 'Cpu',
];

export const CATEGORY_COLORS = [
  'bg-brand-500/10 text-brand-500',
  'bg-info-500/10 text-info-500',
  'bg-success-500/10 text-success-500',
  'bg-warning-500/10 text-warning-500',
  'bg-danger-500/10 text-danger-500',
  'bg-purple-500/10 text-purple-500',
  'bg-pink-500/10 text-pink-500',
  'bg-orange-500/10 text-orange-500',
  'bg-cyan-500/10 text-cyan-500',
  'bg-rose-500/10 text-rose-500',
];

// =========================================
// Product Tag Config
// =========================================
export const TAG_CONFIG = {
  'new': { label: 'New', color: 'bg-brand-500/10 text-brand-500 border-brand-500/20' },
  'popular': { label: 'Popular', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  'low-stock': { label: 'Low Stock', color: 'bg-warning-500/10 text-warning-500 border-warning-500/20' },
  'best-seller': { label: 'Best Seller', color: 'bg-success-500/10 text-success-500 border-success-500/20' },
  'imported': { label: 'Imported', color: 'bg-info-500/10 text-info-500 border-info-500/20' },
  'featured': { label: 'Featured', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
} as const;

// =========================================
// Stock Status Config
// =========================================
export const STOCK_STATUS = {
  out: { label: 'Out of Stock', color: 'bg-danger-500/10 text-danger-500 border-danger-500/20' },
  low: { label: 'Low Stock', color: 'bg-warning-500/10 text-warning-500 border-warning-500/20' },
  ok: { label: 'In Stock', color: 'bg-success-500/10 text-success-500 border-success-500/20' },
  over: { label: 'Overstock', color: 'bg-info-500/10 text-info-500 border-info-500/20' },
} as const;

// =========================================
// Transaction Type Config
// =========================================
export const TRANSACTION_CONFIG = {
  'stock-in': { label: 'Stock In', color: 'text-success-500', bg: 'bg-success-500/10', icon: 'TrendingUp' },
  'stock-out': { label: 'Stock Out', color: 'text-danger-500', bg: 'bg-danger-500/10', icon: 'TrendingDown' },
  'transfer': { label: 'Transfer', color: 'text-brand-500', bg: 'bg-brand-500/10', icon: 'ArrowLeftRight' },
  'adjustment': { label: 'Adjustment', color: 'text-warning-500', bg: 'bg-warning-500/10', icon: 'SlidersHorizontal' },
} as const;

// =========================================
// Notification Type Config
// =========================================
export const NOTIFICATION_CONFIG = {
  'low-stock': { icon: 'AlertTriangle', color: 'text-warning-500', bg: 'bg-warning-500/10' },
  'out-of-stock': { icon: 'PackageX', color: 'text-danger-500', bg: 'bg-danger-500/10' },
  'new-supplier': { icon: 'UserPlus', color: 'text-brand-500', bg: 'bg-brand-500/10' },
  'inventory-updated': { icon: 'RefreshCw', color: 'text-info-500', bg: 'bg-info-500/10' },
  'new-product': { icon: 'PackagePlus', color: 'text-success-500', bg: 'bg-success-500/10' },
} as const;

// =========================================
// Storage Keys
// =========================================
export const STORAGE_KEYS = {
  AUTH: 'sf_auth',
  PRODUCTS: 'sf_products',
  CATEGORIES: 'sf_categories',
  SUPPLIERS: 'sf_suppliers',
  TRANSACTIONS: 'sf_transactions',
  NOTIFICATIONS: 'sf_notifications',
  ACTIVITIES: 'sf_activities',
  SETTINGS: 'sf_settings',
  SEEDED: 'sf_seeded',
} as const;

// =========================================
// Pagination
// =========================================
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;
