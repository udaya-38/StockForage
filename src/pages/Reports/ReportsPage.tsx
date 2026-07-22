import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileBarChart2, Download, Printer, TrendingUp, AlertTriangle,
  Package, Star, Clock, DollarSign,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useSupplierStore } from '../../store/supplierStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useSettingsStore } from '../../store/uiStore';
import { Button, Card } from '../../components/ui';
import { formatCurrency, formatDate, downloadCSV, cn } from '../../utils';

type ReportTab = 'valuation' | 'category' | 'supplier' | 'low-stock' | 'out-of-stock' | 'fast-moving' | 'slow-moving' | 'monthly';

const TABS: { id: ReportTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'valuation', label: 'Valuation', icon: DollarSign },
  { id: 'category', label: 'Category', icon: Package },
  { id: 'supplier', label: 'Supplier', icon: Star },
  { id: 'low-stock', label: 'Low Stock', icon: AlertTriangle },
  { id: 'out-of-stock', label: 'Out of Stock', icon: AlertTriangle },
  { id: 'fast-moving', label: 'Fast Moving', icon: TrendingUp },
  { id: 'slow-moving', label: 'Slow Moving', icon: Clock },
  { id: 'monthly', label: 'Monthly', icon: FileBarChart2 },
];

const CHART_COLORS = ['#6172f5', '#14b8a6', '#22c55e', '#f59e0b', '#f43f5e', '#a855f7', '#ec4899', '#f97316'];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-3 shadow-glass text-xs">
      <p className="text-dark-300 font-medium mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-dark-400">{p.name}:</span>
          <span className="text-white font-medium">
            {typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('valuation');
  const { products } = useProductStore();
  const { categories } = useCategoryStore();
  const { suppliers } = useSupplierStore();
  const { transactions, getMonthlyData } = useTransactionStore();
  const { settings } = useSettingsStore();

  const cs = settings.currencySymbol;

  // ---- Report data computations ----

  // Valuation
  const valuationData = products.map(p => ({
    name: p.name.slice(0, 20) + (p.name.length > 20 ? '…' : ''),
    purchaseValue: p.quantity * p.purchasePrice,
    sellingValue: p.quantity * p.sellingPrice,
    profit: p.quantity * (p.sellingPrice - p.purchasePrice),
  })).sort((a, b) => b.purchaseValue - a.purchaseValue).slice(0, 10);

  const totalPurchaseValue = products.reduce((s, p) => s + p.quantity * p.purchasePrice, 0);
  const totalSellingValue = products.reduce((s, p) => s + p.quantity * p.sellingPrice, 0);

  // Category
  const categoryData = categories.map(cat => {
    const catProducts = products.filter(p => p.categoryId === cat.id);
    const value = catProducts.reduce((s, p) => s + p.quantity * p.purchasePrice, 0);
    return { name: cat.name, value, count: catProducts.length };
  }).filter(c => c.count > 0).sort((a, b) => b.value - a.value);

  // Supplier
  const supplierData = suppliers.map(sup => {
    const supProducts = products.filter(p => p.supplierId === sup.id);
    const value = supProducts.reduce((s, p) => s + p.quantity * p.purchasePrice, 0);
    return { name: sup.company.slice(0, 18), value, count: supProducts.length, rating: sup.rating };
  }).filter(s => s.count > 0).sort((a, b) => b.value - a.value).slice(0, 10);

  // Low stock
  const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock);

  // Out of stock
  const outOfStockProducts = products.filter(p => p.quantity === 0);

  // Fast moving (most transactions)
  const txCountByProduct: Record<string, number> = {};
  transactions.filter(t => t.type === 'stock-out').forEach(t => {
    txCountByProduct[t.productId] = (txCountByProduct[t.productId] || 0) + t.quantity;
  });
  const fastMoving = products
    .map(p => ({ ...p, sold: txCountByProduct[p.id] ?? 0 }))
    .filter(p => p.sold > 0)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 10);

  // Slow moving (0 transactions in last 60 days)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const recentProductIds = new Set(
    transactions
      .filter(t => new Date(t.createdAt) > sixtyDaysAgo)
      .map(t => t.productId)
  );
  const slowMoving = products.filter(p => !recentProductIds.has(p.id) && p.quantity > 0);

  // Monthly
  const monthlyData = getMonthlyData();

  const handleExport = () => {
    const dataMap: Record<ReportTab, Record<string, unknown>[]> = {
      valuation: products.map(p => ({ SKU: p.sku, Name: p.name, Qty: p.quantity, PurchasePrice: p.purchasePrice, SellingPrice: p.sellingPrice, PurchaseValue: p.quantity * p.purchasePrice, SellingValue: p.quantity * p.sellingPrice })),
      category: categoryData.map(c => ({ Category: c.name, Products: c.count, Value: c.value })),
      supplier: supplierData.map(s => ({ Supplier: s.name, Products: s.count, Value: s.value, Rating: s.rating })),
      'low-stock': lowStockProducts.map(p => ({ SKU: p.sku, Name: p.name, Current: p.quantity, Min: p.minimumStock })),
      'out-of-stock': outOfStockProducts.map(p => ({ SKU: p.sku, Name: p.name, MinStock: p.minimumStock })),
      'fast-moving': fastMoving.map(p => ({ SKU: p.sku, Name: p.name, UnitsSold: p.sold })),
      'slow-moving': slowMoving.map(p => ({ SKU: p.sku, Name: p.name, Stock: p.quantity, LastMovement: formatDate(p.updatedAt) })),
      monthly: monthlyData.map(m => ({ Month: m.month, StockIn: m.stockIn, StockOut: m.stockOut })),
    };
    downloadCSV(dataMap[activeTab], `${activeTab}-report`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Business analytics and inventory reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={handleExport}>Export CSV</Button>
          <Button variant="outline" size="sm" icon={<Printer size={14} />} onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Card>
          <p className="text-xs text-dark-400 mb-1">Total Stock Value</p>
          <p className="text-xl font-bold text-dark-900 dark:text-white">{formatCurrency(totalPurchaseValue, cs)}</p>
        </Card>
        <Card>
          <p className="text-xs text-dark-400 mb-1">Potential Revenue</p>
          <p className="text-xl font-bold text-success-500">{formatCurrency(totalSellingValue, cs)}</p>
        </Card>
        <Card>
          <p className="text-xs text-dark-400 mb-1">Low Stock Items</p>
          <p className="text-xl font-bold text-warning-500">{lowStockProducts.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-dark-400 mb-1">Out of Stock</p>
          <p className="text-xl font-bold text-danger-500">{outOfStockProducts.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-5 pb-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-400 hover:border-brand-500/50'
              )}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {/* Valuation */}
        {activeTab === 'valuation' && (
          <div className="space-y-4">
            <Card padding={false}>
              <div className="p-5 border-b border-dark-100 dark:border-dark-800">
                <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Top 10 Products by Inventory Value</h2>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={valuationData} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,192,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="purchaseValue" name="Purchase Value" fill="#6172f5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sellingValue" name="Selling Value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Category Report */}
        {activeTab === 'category' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card padding={false}>
              <div className="p-4 border-b border-dark-100 dark:border-dark-800">
                <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Category Value Distribution</h2>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                      {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v as number)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card padding={false}>
              <div className="p-4 border-b border-dark-100 dark:border-dark-800">
                <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Category Summary</h2>
              </div>
              <div className="divide-y divide-dark-50 dark:divide-dark-800">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-sm text-dark-900 dark:text-white flex-1">{cat.name}</span>
                    <span className="text-xs text-dark-400">{cat.count} products</span>
                    <span className="text-sm font-semibold text-dark-900 dark:text-white">{formatCurrency(cat.value, cs)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Supplier Report */}
        {activeTab === 'supplier' && (
          <Card padding={false}>
            <div className="p-4 border-b border-dark-100 dark:border-dark-800">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Supplier Performance</h2>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={supplierData} layout="vertical" margin={{ left: 80, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,192,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Stock Value" fill="#6172f5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Low Stock */}
        {activeTab === 'low-stock' && (
          <Card padding={false}>
            <div className="p-4 border-b border-dark-100 dark:border-dark-800">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">
                Low Stock Items <span className="text-warning-500">({lowStockProducts.length})</span>
              </h2>
            </div>
            <div className="divide-y divide-dark-50 dark:divide-dark-800/50">
              {lowStockProducts.length === 0 ? (
                <div className="py-12 text-center text-sm text-dark-400">All products have sufficient stock 🎉</div>
              ) : (
                lowStockProducts.sort((a, b) => a.quantity - b.quantity).map(p => (
                  <div key={p.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-dark-100 dark:bg-dark-800 flex-shrink-0">
                      <img src={p.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/32x32/1e293b/475569?text=?'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-dark-400">{p.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-warning-500">{p.quantity} units</p>
                      <p className="text-xs text-dark-400">min: {p.minimumStock}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* Out of Stock */}
        {activeTab === 'out-of-stock' && (
          <Card padding={false}>
            <div className="p-4 border-b border-dark-100 dark:border-dark-800">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">
                Out of Stock <span className="text-danger-500">({outOfStockProducts.length})</span>
              </h2>
            </div>
            <div className="divide-y divide-dark-50 dark:divide-dark-800/50">
              {outOfStockProducts.length === 0 ? (
                <div className="py-12 text-center text-sm text-dark-400">No out-of-stock products 🎉</div>
              ) : (
                outOfStockProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-dark-100 dark:bg-dark-800 flex-shrink-0">
                      <img src={p.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/32x32/1e293b/475569?text=?'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-dark-400">{p.sku}</p>
                    </div>
                    <span className="badge border bg-danger-500/10 text-danger-500 border-danger-500/20 text-[10px]">Out of Stock</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* Fast Moving */}
        {activeTab === 'fast-moving' && (
          <Card padding={false}>
            <div className="p-4 border-b border-dark-100 dark:border-dark-800">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Fast Moving Products (by units sold)</h2>
            </div>
            <div className="divide-y divide-dark-50 dark:divide-dark-800/50">
              {fastMoving.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 px-4 py-3">
                  <span className="w-6 text-xs font-bold text-dark-400">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-dark-100 dark:bg-dark-800 flex-shrink-0">
                    <img src={p.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/32x32/1e293b/475569?text=?'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-dark-400">{p.sku}</p>
                  </div>
                  <p className="text-sm font-bold text-success-500">{p.sold} sold</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Slow Moving */}
        {activeTab === 'slow-moving' && (
          <Card padding={false}>
            <div className="p-4 border-b border-dark-100 dark:border-dark-800">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">
                Slow Moving Products — No movement in 60 days <span className="text-dark-400">({slowMoving.length})</span>
              </h2>
            </div>
            <div className="divide-y divide-dark-50 dark:divide-dark-800/50">
              {slowMoving.length === 0 ? (
                <div className="py-12 text-center text-sm text-dark-400">All products have recent movement</div>
              ) : (
                slowMoving.map(p => (
                  <div key={p.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-dark-400">{p.sku} · Last updated: {formatDate(p.updatedAt)}</p>
                    </div>
                    <p className="text-sm font-medium text-dark-600 dark:text-dark-400">{p.quantity} units</p>
                    <p className="text-sm font-medium text-dark-900 dark:text-white">{formatCurrency(p.quantity * p.purchasePrice, cs)}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* Monthly */}
        {activeTab === 'monthly' && (
          <Card padding={false}>
            <div className="p-4 border-b border-dark-100 dark:border-dark-800">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Monthly Inventory Summary — Last 6 Months</h2>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,192,0.1)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="stockIn" name="Stock In" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stockOut" name="Stock Out" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
