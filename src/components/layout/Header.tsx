import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Search, Bell, Sun, Moon, X,
  AlertTriangle, PackageX, RefreshCw, UserPlus, PackagePlus,
} from 'lucide-react';
import { cn, timeAgo } from '../../utils';
import { useSettingsStore, useNotificationStore } from '../../store/uiStore';
import { useProductStore } from '../../store/productStore';
import { useSupplierStore } from '../../store/supplierStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useDebounce, useKeyboard, useClickOutside } from '../../hooks';
import { NOTIFICATION_CONFIG } from '../../constants';
import type { SearchResult } from '../../types';

const NOTIF_ICONS = {
  'low-stock': AlertTriangle,
  'out-of-stock': PackageX,
  'new-supplier': UserPlus,
  'inventory-updated': RefreshCw,
  'new-product': PackagePlus,
};

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export function Header({ onMenuClick, sidebarCollapsed }: HeaderProps) {
  const navigate = useNavigate();
  const { settings, setTheme } = useSettingsStore();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { products } = useProductStore();
  const { suppliers } = useSupplierStore();
  const { categories } = useCategoryStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 200);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifsRef = useRef<HTMLDivElement>(null);

  useKeyboard('k', () => { setSearchOpen(true); }, true);
  useClickOutside(searchRef, () => { setSearchOpen(false); setSearchQuery(''); });
  useClickOutside(notifsRef, () => setShowNotifs(false));

  const unreadCount = notifications.filter(n => !n.read).length;

  // Build search results
  const searchResults: SearchResult[] = React.useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    const results: SearchResult[] = [];

    products
      .filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach(p => results.push({ type: 'product', id: p.id, title: p.name, subtitle: `SKU: ${p.sku}`, path: `/products/${p.id}` }));

    suppliers
      .filter(s => s.name.toLowerCase().includes(q) || s.company.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(s => results.push({ type: 'supplier', id: s.id, title: s.company, subtitle: s.name, path: `/suppliers` }));

    categories
      .filter(c => c.name.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(c => results.push({ type: 'category', id: c.id, title: c.name, subtitle: `${c.productCount} products`, path: `/categories` }));

    return results.slice(0, 8);
  }, [debouncedQuery, products, suppliers, categories]);

  const handleResultClick = useCallback((result: SearchResult) => {
    navigate(result.path);
    setSearchOpen(false);
    setSearchQuery('');
  }, [navigate]);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 z-10 flex items-center px-4 gap-3',
        'bg-white/90 dark:bg-dark-950/90 backdrop-blur-md border-b border-dark-100 dark:border-dark-800',
        'transition-all duration-300',
        sidebarCollapsed ? 'md:left-[68px]' : 'md:left-[260px]',
        'left-0'
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 dark:text-dark-400"
      >
        <Menu size={18} />
      </button>

      {/* Search trigger */}
      <button
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-dark-400 dark:text-dark-500 bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-800 hover:border-dark-300 dark:hover:border-dark-700 transition-all duration-150 min-w-[180px] md:min-w-[240px]"
      >
        <Search size={14} />
        <span>Search…</span>
        <kbd className="ml-auto text-[10px] font-mono bg-dark-100 dark:bg-dark-800 text-dark-400 px-1 rounded hidden md:block">⌘K</kbd>
      </button>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 dark:text-dark-400 transition-colors"
        title="Toggle theme"
      >
        {settings.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Notifications */}
      <div ref={notifsRef} className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 dark:text-dark-400 transition-colors"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 shadow-glass-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-100 dark:border-dark-700">
                <span className="text-sm font-semibold text-dark-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-brand-500 hover:text-brand-400"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-dark-50 dark:divide-dark-700">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-dark-400">No notifications</div>
                ) : (
                  notifications.slice(0, 8).map(notif => {
                    const cfg = NOTIFICATION_CONFIG[notif.type];
                    const Icon = NOTIF_ICONS[notif.type];
                    return (
                      <button
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors',
                          !notif.read && 'bg-brand-50/50 dark:bg-brand-500/5'
                        )}
                      >
                        <div className={cn('p-1.5 rounded-lg flex-shrink-0 mt-0.5', cfg.bg)}>
                          <Icon size={12} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs font-medium', !notif.read ? 'text-dark-900 dark:text-white' : 'text-dark-600 dark:text-dark-400')}>
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-dark-500 dark:text-dark-500 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-dark-400 mt-1">{timeAgo(notif.createdAt)}</p>
                        </div>
                        {!notif.read && <div className="w-1.5 h-1.5 bg-brand-500 rounded-full flex-shrink-0 mt-1.5" />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
            />
            <motion.div
              ref={searchRef}
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-900 rounded-2xl shadow-glass-lg border border-dark-100 dark:border-dark-800 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-100 dark:border-dark-800">
                <Search size={16} className="text-dark-400 flex-shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products, suppliers, categories…"
                  className="flex-1 bg-transparent text-sm text-dark-900 dark:text-white placeholder:text-dark-400 outline-none"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                  <X size={16} className="text-dark-400" />
                </button>
              </div>

              {searchQuery.trim() && (
                <div className="py-2 max-h-80 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="py-8 text-center text-sm text-dark-400">No results for "{searchQuery}"</div>
                  ) : (
                    searchResults.map(result => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 dark:hover:bg-dark-800 text-left transition-colors"
                      >
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-dark-100 dark:bg-dark-800 text-dark-500 dark:text-dark-400 uppercase flex-shrink-0">
                          {result.type}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-dark-900 dark:text-white">{result.title}</p>
                          <p className="text-xs text-dark-400">{result.subtitle}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {!searchQuery.trim() && (
                <div className="px-4 py-4 text-xs text-dark-400">
                  <p className="mb-2 font-medium">Quick navigation</p>
                  <div className="flex flex-wrap gap-2">
                    {['/dashboard', '/products', '/suppliers', '/transactions'].map(path => (
                      <button
                        key={path}
                        onClick={() => { navigate(path); setSearchOpen(false); }}
                        className="px-2.5 py-1 rounded-lg bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors capitalize"
                      >
                        {path.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
