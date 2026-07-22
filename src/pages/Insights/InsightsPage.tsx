import { motion } from 'framer-motion';
import {
  Lightbulb, AlertTriangle, TrendingUp,
  BarChart3, Clock, Users, DollarSign, ArrowUpRight,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useSupplierStore } from '../../store/supplierStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useSettingsStore } from '../../store/uiStore';
import { formatCurrency, cn } from '../../utils';
import { containerVariants, cardVariants } from '../../animations/variants';

interface InsightCardData {
  id: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  title: string;
  description: string;
  metric?: string;
  icon: React.ReactNode;
  action?: { label: string; path: string };
}

export function InsightsPage() {
  const navigate = useNavigate();
  const { products } = useProductStore();
  const { categories } = useCategoryStore();
  const { suppliers } = useSupplierStore();
  const { transactions } = useTransactionStore();
  const { settings } = useSettingsStore();

  const cs = settings.currencySymbol;

  // ---- Compute real insights from data ----

  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock);
  const outOfStock = products.filter(p => p.quantity === 0);
  const totalValue = products.reduce((s, p) => s + p.quantity * p.purchasePrice, 0);
  const totalSellingValue = products.reduce((s, p) => s + p.quantity * p.sellingPrice, 0);

  // Top category by value
  const catValues = categories.map(cat => ({
    cat,
    value: products.filter(p => p.categoryId === cat.id).reduce((s, p) => s + p.quantity * p.purchasePrice, 0),
    count: products.filter(p => p.categoryId === cat.id).length,
  })).sort((a, b) => b.value - a.value);
  const topCat = catValues[0];

  // Top supplier
  const supCounts = suppliers.map(sup => ({
    sup,
    count: products.filter(p => p.supplierId === sup.id).length,
    value: products.filter(p => p.supplierId === sup.id).reduce((s, p) => s + p.quantity * p.purchasePrice, 0),
  })).sort((a, b) => b.count - a.count);
  const topSup = supCounts[0];

  // Dead stock (no movement in 60 days)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const recentProductIds = new Set(transactions.filter(t => new Date(t.createdAt) > sixtyDaysAgo).map(t => t.productId));
  const deadStockCount = products.filter(p => !recentProductIds.has(p.id) && p.quantity > 0).length;

  // Fast moving products
  const txCountByProduct: Record<string, number> = {};
  transactions.filter(t => t.type === 'stock-out').forEach(t => {
    txCountByProduct[t.productId] = (txCountByProduct[t.productId] || 0) + t.quantity;
  });
  const fastMovingCount = Object.keys(txCountByProduct).length;

  // Profit potential
  const profitPotential = totalSellingValue - totalValue;
  const avgMargin = products.length > 0
    ? products.reduce((s, p) => s + (p.sellingPrice - p.purchasePrice) / p.sellingPrice, 0) / products.length * 100
    : 0;

  // Active suppliers %
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const highRatedSuppliers = suppliers.filter(s => s.rating >= 4).length;

  // Category share of top cat
  const topCatShare = totalValue > 0 && topCat ? ((topCat.value / totalValue) * 100).toFixed(0) : '0';

  const insights: InsightCardData[] = [
    // Critical
    ...(outOfStock.length > 0 ? [{
      id: 'oos',
      type: 'danger' as const,
      title: 'Out of Stock — Immediate Action',
      description: `${outOfStock.length} product${outOfStock.length > 1 ? 's are' : ' is'} completely out of stock. Customers cannot be served for these items.`,
      metric: `${outOfStock.length} critical`,
      icon: <AlertTriangle size={18} />,
      action: { label: 'View Report', path: '/reports' },
    }] : []),

    // Low stock
    {
      id: 'low',
      type: lowStock.length > 10 ? 'danger' : lowStock.length > 5 ? 'warning' : 'info',
      title: 'Low Stock Alert',
      description: `${lowStock.length} product${lowStock.length !== 1 ? 's' : ''} ${lowStock.length !== 1 ? 'are' : 'is'} below the minimum stock threshold and need replenishment.`,
      metric: `${lowStock.length} items`,
      icon: <AlertTriangle size={18} />,
      action: { label: 'View Low Stock', path: '/reports' },
    },

    // Inventory value
    {
      id: 'value',
      type: 'success',
      title: 'Total Inventory Value',
      description: `Your current stock is worth ${formatCurrency(totalValue, cs)} at purchase price. Potential revenue if sold is ${formatCurrency(totalSellingValue, cs)}.`,
      metric: formatCurrency(totalValue, cs),
      icon: <DollarSign size={18} />,
    },

    // Profit potential
    {
      id: 'profit',
      type: 'success',
      title: 'Profit Potential',
      description: `If all current stock is sold at listed prices, you stand to earn ${formatCurrency(profitPotential, cs)} in gross profit (${avgMargin.toFixed(1)}% average margin).`,
      metric: formatCurrency(profitPotential, cs),
      icon: <TrendingUp size={18} />,
    },

    // Top category
    topCat ? {
      id: 'topcat',
      type: 'info' as const,
      title: `${topCat.cat.name} Leads Inventory`,
      description: `${topCat.cat.name} contributes ${topCatShare}% of total inventory value with ${topCat.count} products. It is your highest-value category.`,
      metric: `${topCatShare}% share`,
      icon: <BarChart3 size={18} />,
      action: { label: 'Category Report', path: '/reports' },
    } : null,

    // Top supplier
    topSup ? {
      id: 'topsup',
      type: 'info' as const,
      title: `${topSup.sup.company} is Top Supplier`,
      description: `${topSup.sup.company} supplies the most products (${topSup.count}) in your inventory, with a stock value of ${formatCurrency(topSup.value, cs)}.`,
      metric: `${topSup.count} products`,
      icon: <Users size={18} />,
      action: { label: 'View Suppliers', path: '/suppliers' },
    } : null,

    // Dead stock
    {
      id: 'dead',
      type: deadStockCount > 10 ? 'warning' : 'info',
      title: 'Slow Moving Inventory',
      description: `${deadStockCount} product${deadStockCount !== 1 ? 's have' : ' has'} had no stock movement in the last 60 days. Consider running promotions to free up capital.`,
      metric: `${deadStockCount} products`,
      icon: <Clock size={18} />,
      action: { label: 'Slow Moving Report', path: '/reports' },
    },

    // Fast movers
    {
      id: 'fast',
      type: 'success',
      title: 'Active Products',
      description: `${fastMovingCount} products have recorded sales transactions. Ensure these fast-moving products are well-stocked to avoid missed revenue.`,
      metric: `${fastMovingCount} active`,
      icon: <TrendingUp size={18} />,
    },

    // Supplier quality
    {
      id: 'sup-quality',
      type: highRatedSuppliers >= activeSuppliers * 0.6 ? 'success' : 'warning',
      title: 'Supplier Quality',
      description: `${highRatedSuppliers} out of ${activeSuppliers} active suppliers are rated 4 stars or above. ${highRatedSuppliers >= activeSuppliers * 0.6 ? 'Your supplier network is strong.' : 'Consider improving supplier relationships.'}`,
      metric: `${((highRatedSuppliers / activeSuppliers) * 100).toFixed(0)}% high-rated`,
      icon: <Users size={18} />,
    },
  ].filter(Boolean) as InsightCardData[];

  const colorMap = {
    info: { bg: 'bg-brand-500/5 border-brand-500/15', icon: 'bg-brand-500/10 text-brand-500', text: 'text-brand-600 dark:text-brand-400' },
    success: { bg: 'bg-success-500/5 border-success-500/15', icon: 'bg-success-500/10 text-success-500', text: 'text-success-600 dark:text-success-400' },
    warning: { bg: 'bg-warning-500/5 border-warning-500/15', icon: 'bg-warning-500/10 text-warning-500', text: 'text-warning-600 dark:text-warning-400' },
    danger: { bg: 'bg-danger-500/5 border-danger-500/15', icon: 'bg-danger-500/10 text-danger-500', text: 'text-danger-600 dark:text-danger-400' },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Lightbulb size={22} className="text-brand-500" />
          Business Insights
        </h1>
        <p className="page-subtitle">
          Intelligent observations generated from your inventory data — no AI required.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {insights.map(insight => {
          const colors = colorMap[insight.type];
          return (
            <motion.div key={insight.id} variants={cardVariants}>
              <div className={cn('p-4 rounded-2xl border transition-all', colors.bg)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn('p-2 rounded-xl flex-shrink-0', colors.icon)}>
                    {insight.icon}
                  </div>
                  {insight.metric && (
                    <div className="ml-auto">
                      <span className={cn('text-xl font-bold font-display', colors.text)}>
                        {insight.metric}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-dark-900 dark:text-white mb-1">{insight.title}</h3>
                <p className="text-xs text-dark-500 dark:text-dark-400 leading-relaxed">{insight.description}</p>

                {insight.action && (
                  <button
                    onClick={() => navigate(insight.action!.path)}
                    className={cn('flex items-center gap-1 text-xs font-medium mt-3 transition-colors', colors.text, 'hover:opacity-80')}
                  >
                    {insight.action.label} <ArrowUpRight size={11} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Context Note */}
      <div className="mt-6 p-4 rounded-xl bg-dark-100 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
        <p className="text-xs text-dark-500 dark:text-dark-400 flex items-start gap-2">
          <Info size={13} className="flex-shrink-0 mt-0.5 text-brand-500" />
          These insights are computed directly from your inventory data using business logic. They reflect real patterns in your stock levels, transactions, and supplier data — not simulated results.
        </p>
      </div>
    </div>
  );
}
