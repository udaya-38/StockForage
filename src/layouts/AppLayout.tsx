import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { useCategoryStore } from '../store/categoryStore';
import { useSupplierStore } from '../store/supplierStore';
import { useTransactionStore } from '../store/transactionStore';
import { useNotificationStore, useActivityStore, useSettingsStore } from '../store/uiStore';
import { cn } from '../utils';
import { pageVariants } from '../animations/variants';

export function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Load all data on mount
  const loadProducts = useProductStore(s => s.loadProducts);
  const loadCategories = useCategoryStore(s => s.loadCategories);
  const loadSuppliers = useSupplierStore(s => s.loadSuppliers);
  const loadTransactions = useTransactionStore(s => s.loadTransactions);
  const loadNotifications = useNotificationStore(s => s.loadNotifications);
  const loadActivities = useActivityStore(s => s.loadActivities);
  const loadSettings = useSettingsStore(s => s.loadSettings);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSuppliers();
    loadTransactions();
    loadNotifications();
    loadActivities();
    loadSettings();
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Header
        onMenuClick={() => setMobileOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main content area */}
      <main
        className={cn(
          'transition-all duration-300 pt-16',
          sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[260px]'
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-[calc(100vh-64px)] p-6"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
