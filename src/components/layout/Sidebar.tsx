import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, Users, ArrowLeftRight,
  FileBarChart2, Lightbulb, Settings, ChevronLeft,
  ChevronRight, Boxes, LogOut,
} from 'lucide-react';
import { cn } from '../../utils';
import { useAuthStore } from '../../store/authStore';
import { APP_NAME } from '../../constants';

const NAV_ITEMS = [
  { path: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard,  module: 'dashboard' },
  { path: '/products',     label: 'Products',       icon: Package,          module: 'products' },
  { path: '/categories',   label: 'Categories',     icon: Tag,              module: 'categories' },
  { path: '/suppliers',    label: 'Suppliers',      icon: Users,            module: 'suppliers' },
  { path: '/transactions', label: 'Transactions',   icon: ArrowLeftRight,   module: 'transactions' },
  { path: '/reports',      label: 'Reports',        icon: FileBarChart2,    module: 'reports' },
  { path: '/insights',     label: 'Insights',       icon: Lightbulb,        module: 'insights' },
  { path: '/settings',     label: 'Settings',       icon: Settings,         module: 'settings' },
] as const;

const ROLE_COLORS = {
  admin: 'bg-brand-500/10 text-brand-500',
  manager: 'bg-success-500/10 text-success-500',
  warehouse: 'bg-warning-500/10 text-warning-500',
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout, hasPermission } = useAuthStore();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 h-16 px-4 border-b border-dark-100 dark:border-dark-800 flex-shrink-0',
        collapsed && 'justify-center px-2'
      )}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-info-500 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
          <Boxes size={16} className="text-white" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm font-bold text-dark-900 dark:text-white font-display tracking-tight"
          >
            {APP_NAME}
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-0.5">
        {NAV_ITEMS.filter(item => hasPermission(item.module)).map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              cn(
                'sidebar-link relative',
                isActive && 'active',
                collapsed && 'justify-center px-2'
              )
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-brand-600/10 dark:bg-brand-500/10 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon size={16} className="relative z-10 flex-shrink-0" />
                {!collapsed && <span className="relative z-10">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 py-2 border-t border-dark-100 dark:border-dark-800">
        <button
          onClick={onToggle}
          className="w-full sidebar-link justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User Profile */}
      {user && (
        <div className={cn(
          'p-3 border-t border-dark-100 dark:border-dark-800',
          collapsed && 'flex justify-center'
        )}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-info-500 flex items-center justify-center text-white text-xs font-semibold">
              {user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-info-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-dark-900 dark:text-white truncate">{user.name}</p>
                <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize', ROLE_COLORS[user.role])}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-dark-400 hover:text-danger-500 transition-colors p-1 rounded"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-dark-900 border-r border-dark-100 dark:border-dark-800 z-40 md:hidden shadow-glass-lg"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 260 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        className="hidden md:block fixed left-0 top-0 bottom-0 bg-white dark:bg-dark-900 border-r border-dark-100 dark:border-dark-800 z-20 overflow-hidden shadow-sm"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
