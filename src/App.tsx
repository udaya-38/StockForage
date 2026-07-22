import { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/Auth/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { ProductsPage } from './pages/Products/ProductsPage';
import { ProductDetailPage } from './pages/Products/ProductDetailPage';
import { ProductFormPage } from './pages/Products/ProductFormPage';
import { CategoriesPage } from './pages/Categories/CategoriesPage';
import { SuppliersPage } from './pages/Suppliers/SuppliersPage';
import { TransactionsPage } from './pages/Transactions/TransactionsPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { InsightsPage } from './pages/Insights/InsightsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { ToastContainer } from './components/ui/Modal';
import { useAuthStore } from './store/authStore';
import { useSettingsStore } from './store/uiStore';
import { seedData } from './data/seed';
import { Spinner } from './components/ui';

// Seed data and init auth on first load
function AppInitializer() {
  const initAuth = useAuthStore(s => s.initAuth);
  const loadSettings = useSettingsStore(s => s.loadSettings);

  useEffect(() => {
    seedData();     // No-op if already seeded
    loadSettings(); // Apply theme from localStorage
    initAuth();     // Restore session
  }, []);

  return null;
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-info-500 flex items-center justify-center animate-pulse">
          <Spinner size="sm" className="text-white" />
        </div>
        <p className="text-sm text-dark-400">Loading StockForge…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer />
      <ToastContainer />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — wrapped in AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
