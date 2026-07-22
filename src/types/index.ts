// =========================================
// Core Entity Types
// =========================================

export type UserRole = 'admin' | 'manager' | 'warehouse';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;          // Lucide icon name
  color: string;         // Tailwind color class
  description: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export type SupplierRating = 1 | 2 | 3 | 4 | 5;

export interface Supplier {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  gstNumber: string;
  rating: SupplierRating;
  status: 'active' | 'inactive';
  productsSupplied: number;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductTag = 'new' | 'popular' | 'low-stock' | 'best-seller' | 'imported' | 'featured';
export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  description: string;
  categoryId: string;
  supplierId: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minimumStock: number;
  image: string;
  status: ProductStatus;
  tags: ProductTag[];
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'stock-in' | 'stock-out' | 'transfer' | 'adjustment';

export interface Transaction {
  id: string;
  productId: string;
  type: TransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  notes: string;
  referenceId?: string;
  performedBy: string;
  createdAt: string;
}

export type NotificationType = 'low-stock' | 'out-of-stock' | 'new-supplier' | 'inventory-updated' | 'new-product';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export type ActivityType =
  | 'product-added'
  | 'product-updated'
  | 'stock-in'
  | 'stock-out'
  | 'supplier-created'
  | 'category-updated'
  | 'transaction-completed'
  | 'user-login';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
  status: 'success' | 'warning' | 'info';
}

export interface AppSettings {
  companyName: string;
  companyLogo: string;
  currency: string;
  currencySymbol: string;
  language: string;
  theme: 'dark' | 'light';
  lowStockThreshold: number;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
}

// =========================================
// Dashboard / Analytics Types
// =========================================

export interface KPICard {
  label: string;
  value: string | number;
  change: number;        // percentage change
  changeLabel: string;
  icon: string;
  color: 'brand' | 'success' | 'warning' | 'danger' | 'info';
}

export interface ChartDataPoint {
  month: string;
  stockIn: number;
  stockOut: number;
  value: number;
}

export interface BusinessInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  title: string;
  description: string;
  metric?: string;
  icon: string;
}

// =========================================
// Filter / Search Types
// =========================================

export interface ProductFilters {
  search: string;
  categoryId: string;
  supplierId: string;
  status: ProductStatus | 'all';
  stockStatus: 'all' | 'low' | 'out' | 'ok';
  sortBy: 'name' | 'quantity' | 'sellingPrice' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
  tags: ProductTag[];
}

export interface SearchResult {
  type: 'product' | 'supplier' | 'category' | 'transaction';
  id: string;
  title: string;
  subtitle: string;
  path: string;
}
