import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign,
  PackagePlus, UserPlus, ArrowUpRight,
  Clock, CheckCircle2, Info,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useActivityStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useAnimatedCounter } from '../../hooks';
import { formatCurrency, formatNumber, timeAgo, cn } from '../../utils';
import { containerVariants, cardVariants } from '../../animations/variants';
import { Card } from '../../components/ui';
import type { BusinessInsight } from '../../types';

// =========================================
// Animated KPI Card
// =========================================
interface KPICardProps {
  label: string;
  value: number;
  displayValue?: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function KPICard({ label, value, displayValue, change, icon, color, bgColor }: KPICardProps) {
  const animatedValue = useAnimatedCounter(value, 1200);
  const isPositive = change >= 0;

  return (
    <motion.div variants={cardVariants} className="stat-card group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl', bgColor)}>
          <div className={color}>{icon}</div>
        </div>
        <span className={cn(
          'flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full',
          isPositive ? 'bg-success-500/10 text-success-600 dark:text-success-400' : 'bg-danger-500/10 text-danger-600 dark:text-danger-400'
        )}>
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {Math.abs(change)}%
        </span>
      </div>
      <p className="text-2xl font-bold font-display text-dark-900 dark:text-white">
        {displayValue ?? formatNumber(animatedValue)}
      </p>
      <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">{label}</p>
    </motion.div>
  );
}

// =========================================
// Quick Action Card
// =========================================
interface QuickActionProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onClick: () => void;
}

function QuickActionCard({ label, description, icon, color, bgColor, onClick }: QuickActionProps) {
  return (
    <motion.button
      variants={cardVariants}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="stat-card text-left group w-full hover:shadow-glass transition-all duration-200"
    >
      <div className={cn('p-2.5 rounded-xl w-fit mb-3', bgColor, 'group-hover:scale-105 transition-transform duration-150')}>
        <div className={color}>{icon}</div>
      </div>
      <p className="text-sm font-semibold text-dark-900 dark:text-white">{label}</p>
      <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">{description}</p>
    </motion.button>
  );
}

// =========================================
// Activity Item
// =========================================
function ActivityItem({ title, description, createdAt, status }: {
  type: string; title: string; description: string; createdAt: string; status: string;
}) {
  const statusIcons = {
    success: <CheckCircle2 size={13} className="text-success-500" />,
    warning: <AlertTriangle size={13} className="text-warning-500" />,
    info: <Info size={13} className="text-brand-500" />,
  };
  const statusColors = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    info: 'bg-brand-500',
  };

  return (
    <div className="flex items-start gap-3 group">
      <div className="flex flex-col items-center flex-shrink-0 mt-1">
        <div className={cn('w-2 h-2 rounded-full', statusColors[status as keyof typeof statusColors] ?? 'bg-dark-400')} />
        <div className="w-px flex-1 bg-dark-100 dark:bg-dark-800 mt-1 min-h-[24px]" />
      </div>
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex items-center gap-2">
          {statusIcons[status as keyof typeof statusIcons]}
          <span className="text-xs font-semibold text-dark-900 dark:text-white">{title}</span>
        </div>
        <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5 truncate">{description}</p>
        <p className="text-[10px] text-dark-400 dark:text-dark-600 mt-0.5">{timeAgo(createdAt)}</p>
      </div>
    </div>
  );
}

// =========================================
// Business Insight Card
// =========================================
function InsightCard({ insight }: { insight: BusinessInsight }) {
  const colors = {
    info: 'border-brand-500/20 bg-brand-500/5',
    warning: 'border-warning-500/20 bg-warning-500/5',
    success: 'border-success-500/20 bg-success-500/5',
    danger: 'border-danger-500/20 bg-danger-500/5',
  };
  const textColors = {
    info: 'text-brand-600 dark:text-brand-400',
    warning: 'text-warning-600 dark:text-warning-400',
    success: 'text-success-600 dark:text-success-400',
    danger: 'text-danger-600 dark:text-danger-400',
  };

  return (
    <div className={cn('p-3.5 rounded-xl border', colors[insight.type])}>
      {insight.metric && (
        <p className={cn('text-lg font-bold font-display', textColors[insight.type])}>{insight.metric}</p>
      )}
      <p className="text-xs font-semibold text-dark-900 dark:text-white mt-0.5">{insight.title}</p>
      <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">{insight.description}</p>
    </div>
  );
}

// =========================================
// Custom Tooltip for Charts
// =========================================
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-3 shadow-glass text-xs">
      <p className="text-dark-300 font-medium mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-dark-400 capitalize">{p.name}:</span>
          <span className="text-white font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// =========================================
// Dashboard Page
// =========================================
export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { products, getLowStockProducts, getOutOfStockProducts } = useProductStore();
  const { categories } = useCategoryStore();
  const { getMonthlyData } = useTransactionStore();
  const { activities } = useActivityStore();

  const lowStock = getLowStockProducts();
  const outOfStock = getOutOfStockProducts();
  const monthlyData = getMonthlyData();

  // KPI computations
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.purchasePrice, 0);
  const revenueEstimate = products.reduce((sum, p) => sum + p.quantity * p.sellingPrice, 0);
  const totalProducts = products.length;
  const lowStockCount = lowStock.length;

  // Category distribution for pie chart
  const categoryDist = categories.map((cat, i) => ({
    name: cat.name,
    value: products.filter(p => p.categoryId === cat.id).reduce((s, p) => s + p.quantity * p.purchasePrice, 0),
    color: ['#6172f5', '#14b8a6', '#22c55e', '#f59e0b', '#f43f5e', '#a855f7', '#ec4899', '#f97316', '#06b6d4', '#e11d48'][i % 10],
  })).filter(c => c.value > 0).slice(0, 6);

  // Business insights from actual data
  const insights: BusinessInsight[] = [
    {
      id: 'i1',
      type: lowStockCount > 10 ? 'danger' : 'warning',
      title: 'Low Stock Alert',
      description: `${lowStockCount} products are below minimum stock level and need restocking.`,
      metric: `${lowStockCount} items`,
      icon: 'AlertTriangle',
    },
    {
      id: 'i2',
      type: 'success',
      title: 'Inventory Value',
      description: 'Total inventory value based on purchase prices across all active products.',
      metric: formatCurrency(totalValue),
      icon: 'TrendingUp',
    },
    {
      id: 'i3',
      type: 'info',
      title: 'Top Category',
      description: `Electronics contributes the highest inventory value in your stock.`,
      metric: `${((categoryDist[0]?.value ?? 0) / (totalValue || 1) * 100).toFixed(0)}% share`,
      icon: 'BarChart3',
    },
    {
      id: 'i4',
      type: outOfStock.length > 0 ? 'danger' : 'success',
      title: outOfStock.length > 0 ? 'Out of Stock Items' : 'Stock Health Good',
      description: outOfStock.length > 0
        ? `${outOfStock.length} products have zero stock — immediate action required.`
        : 'All products have available stock. Keep monitoring low-stock items.',
      metric: outOfStock.length > 0 ? `${outOfStock.length} critical` : '✓ Healthy',
      icon: 'Package',
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">{greeting}, {user?.name.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your inventory today.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-dark-400 dark:text-dark-500">
          <Clock size={12} />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <KPICard
          label="Inventory Value"
          value={totalValue}
          displayValue={formatCurrency(totalValue)}
          change={12}
          icon={<DollarSign size={18} />}
          color="text-brand-500"
          bgColor="bg-brand-500/10"
        />
        <KPICard
          label="Total Products"
          value={totalProducts}
          change={5}
          icon={<Package size={18} />}
          color="text-success-500"
          bgColor="bg-success-500/10"
        />
        <KPICard
          label="Low Stock Items"
          value={lowStockCount}
          change={-8}
          icon={<AlertTriangle size={18} />}
          color="text-warning-500"
          bgColor="bg-warning-500/10"
        />
        <KPICard
          label="Revenue Estimate"
          value={revenueEstimate}
          displayValue={formatCurrency(revenueEstimate)}
          change={9}
          icon={<TrendingUp size={18} />}
          color="text-info-500"
          bgColor="bg-info-500/10"
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Stock Movement Area Chart */}
        <motion.div variants={cardVariants} initial="hidden" animate="show" className="lg:col-span-2">
          <Card padding={false}>
            <div className="p-5 border-b border-dark-100 dark:border-dark-800">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Stock Movement — Last 6 Months</h2>
              <p className="text-xs text-dark-400 mt-0.5">Stock in vs stock out trends</p>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6172f5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6172f5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,192,0.1)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="stockIn" name="Stock In" stroke="#6172f5" strokeWidth={2} fill="url(#gradIn)" />
                  <Area type="monotone" dataKey="stockOut" name="Stock Out" stroke="#f43f5e" strokeWidth={2} fill="url(#gradOut)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Category Distribution Pie */}
        <motion.div variants={cardVariants} initial="hidden" animate="show">
          <Card padding={false} className="h-full">
            <div className="p-5 border-b border-dark-100 dark:border-dark-800">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Inventory by Category</h2>
              <p className="text-xs text-dark-400 mt-0.5">Value distribution</p>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} strokeWidth={2} stroke="transparent">
                    {categoryDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v as number)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryDist.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-dark-500 dark:text-dark-400 flex-1 truncate">{c.name}</span>
                    <span className="text-dark-700 dark:text-dark-300 font-medium">{((c.value / totalValue) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-dark-900 dark:text-white mb-3">Quick Actions</h2>
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
            <QuickActionCard
              label="Add Product"
              description="Add new inventory item"
              icon={<PackagePlus size={18} />}
              color="text-brand-500"
              bgColor="bg-brand-500/10"
              onClick={() => navigate('/products/new')}
            />
            <QuickActionCard
              label="Stock In"
              description="Record stock receipt"
              icon={<TrendingUp size={18} />}
              color="text-success-500"
              bgColor="bg-success-500/10"
              onClick={() => navigate('/transactions?action=stock-in')}
            />
            <QuickActionCard
              label="Stock Out"
              description="Record stock dispatch"
              icon={<TrendingDown size={18} />}
              color="text-danger-500"
              bgColor="bg-danger-500/10"
              onClick={() => navigate('/transactions?action=stock-out')}
            />
            <QuickActionCard
              label="Add Supplier"
              description="Register new supplier"
              icon={<UserPlus size={18} />}
              color="text-info-500"
              bgColor="bg-info-500/10"
              onClick={() => navigate('/suppliers?action=new')}
            />
          </motion.div>
        </div>

        {/* Activity Timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Recent Activity</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 transition-colors"
            >
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <Card padding={false}>
            <div className="p-4 max-h-[280px] overflow-y-auto no-scrollbar">
              {activities.slice(0, 8).map(activity => (
                <ActivityItem key={activity.id} {...activity} />
              ))}
            </div>
          </Card>
        </div>

        {/* Business Insights */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Business Insights</h2>
            <button
              onClick={() => navigate('/insights')}
              className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 transition-colors"
            >
              More <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {insights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
