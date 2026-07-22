import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, Edit3, Trash2, TrendingUp,
  AlertTriangle, CheckCircle2, Tag, Barcode,
} from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useSupplierStore } from '../../store/supplierStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useSettingsStore } from '../../store/uiStore';
import { Button, Card } from '../../components/ui';
import { ConfirmDialog, toast } from '../../components/ui/Modal';
import { TAG_CONFIG, TRANSACTION_CONFIG } from '../../constants';
import { formatCurrency, formatDate, getStockStatus, profitMargin, cn } from '../../utils';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, deleteProduct } = useProductStore();
  const { getCategoryById } = useCategoryStore();
  const { getSupplierById } = useSupplierStore();
  const { getTransactionsByProduct } = useTransactionStore();
  const { settings } = useSettingsStore();
  const [showDelete, setShowDelete] = useState(false);

  const product = id ? getProductById(id) : undefined;

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <Package size={40} className="mx-auto text-dark-300 mb-4" />
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">Product not found</h2>
        <Button variant="primary" onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  const category = getCategoryById(product.categoryId);
  const supplier = getSupplierById(product.supplierId);
  const stockHistory = getTransactionsByProduct(product.id).slice(0, 10);
  const status = getStockStatus(product.quantity, product.minimumStock);
  const margin = profitMargin(product.purchasePrice, product.sellingPrice);

  const statusConfig = {
    out: { label: 'Out of Stock', icon: AlertTriangle, color: 'text-danger-500', bg: 'bg-danger-500/10' },
    low: { label: 'Low Stock', icon: AlertTriangle, color: 'text-warning-500', bg: 'bg-warning-500/10' },
    ok: { label: 'In Stock', icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-500/10' },
    over: { label: 'Overstock', icon: TrendingUp, color: 'text-info-500', bg: 'bg-info-500/10' },
  };
  const statusCfg = statusConfig[status];
  const StatusIcon = statusCfg.icon;

  const handleDelete = () => {
    deleteProduct(product.id);
    toast('Product deleted', 'success');
    navigate('/products');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-1.5 text-sm text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white mb-5 transition-colors"
      >
        <ArrowLeft size={14} /> Products
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-dark-100 dark:bg-dark-800 flex-shrink-0 shadow-sm">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/1e293b/475569?text=IMG'; }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark-900 dark:text-white font-display">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-dark-500 dark:text-dark-400 font-mono">{product.sku}</span>
              {product.tags.map(tag => {
                const cfg = TAG_CONFIG[tag];
                return (
                  <span key={tag} className={cn('badge border text-[10px]', cfg.color)}>{cfg.label}</span>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" icon={<Edit3 size={14} />} onClick={() => navigate(`/products/${id}/edit`)}>Edit</Button>
          <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setShowDelete(true)}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stock Status */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white">Stock Status</h2>
              <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', statusCfg.bg, statusCfg.color)}>
                <StatusIcon size={12} />
                {statusCfg.label}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl bg-dark-50 dark:bg-dark-800">
                <p className="text-2xl font-bold font-display text-dark-900 dark:text-white">{product.quantity}</p>
                <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">Current Stock</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-dark-50 dark:bg-dark-800">
                <p className="text-2xl font-bold font-display text-warning-500">{product.minimumStock}</p>
                <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">Min Stock</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-dark-50 dark:bg-dark-800">
                <p className="text-2xl font-bold font-display text-success-500">{margin.toFixed(1)}%</p>
                <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">Profit Margin</p>
              </div>
            </div>

            {/* Stock progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-dark-400 mb-1">
                <span>Stock Level</span>
                <span>{product.quantity} / {product.minimumStock * 3}</span>
              </div>
              <div className="h-2 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (product.quantity / (product.minimumStock * 3)) * 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', status === 'out' ? 'bg-danger-500' : status === 'low' ? 'bg-warning-500' : 'bg-success-500')}
                />
              </div>
            </div>
          </Card>

          {/* Pricing */}
          <Card>
            <h2 className="text-sm font-semibold text-dark-900 dark:text-white mb-4">Pricing & Value</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Purchase Price</p>
                <p className="text-lg font-bold text-dark-900 dark:text-white">{formatCurrency(product.purchasePrice, settings.currencySymbol)}</p>
              </div>
              <div>
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Selling Price</p>
                <p className="text-lg font-bold text-dark-900 dark:text-white">{formatCurrency(product.sellingPrice, settings.currencySymbol)}</p>
              </div>
              <div>
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Profit per Unit</p>
                <p className="text-lg font-bold text-success-500">{formatCurrency(product.sellingPrice - product.purchasePrice, settings.currencySymbol)}</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-success-500/5 border border-success-500/10">
              <p className="text-xs text-dark-500 dark:text-dark-400">Total Inventory Value</p>
              <p className="text-xl font-bold text-dark-900 dark:text-white mt-0.5">
                {formatCurrency(product.quantity * product.purchasePrice, settings.currencySymbol)}
              </p>
              <p className="text-xs text-success-500 mt-0.5">
                Potential Revenue: {formatCurrency(product.quantity * product.sellingPrice, settings.currencySymbol)}
              </p>
            </div>
          </Card>

          {/* Description */}
          {product.description && (
            <Card>
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white mb-2">Description</h2>
              <p className="text-sm text-dark-600 dark:text-dark-400 leading-relaxed">{product.description}</p>
            </Card>
          )}

          {/* Transaction History */}
          <Card>
            <h2 className="text-sm font-semibold text-dark-900 dark:text-white mb-4">Stock History</h2>
            {stockHistory.length === 0 ? (
              <p className="text-sm text-dark-400 py-4 text-center">No transaction history found.</p>
            ) : (
              <div className="space-y-2">
                {stockHistory.map(tx => {
                  const cfg = TRANSACTION_CONFIG[tx.type];
                  return (
                    <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors">
                      <div className={cn('p-1.5 rounded-lg flex-shrink-0', cfg.bg)}>
                        <TrendingUp size={11} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
                          <span className="text-xs text-dark-400">{tx.reason}</span>
                        </div>
                        <p className="text-xs text-dark-400">{tx.performedBy}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn('text-sm font-semibold', tx.type === 'stock-in' ? 'text-success-500' : 'text-danger-500')}>
                          {tx.type === 'stock-in' || tx.type === 'transfer' ? '+' : '-'}{tx.quantity}
                        </p>
                        <p className="text-[10px] text-dark-400">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* Product Image */}
          <Card>
            <div className="aspect-square rounded-xl overflow-hidden bg-dark-100 dark:bg-dark-800">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/1e293b/475569?text=No+Image'; }}
              />
            </div>
          </Card>

          {/* Details */}
          <Card>
            <h2 className="text-sm font-semibold text-dark-900 dark:text-white mb-3">Details</h2>
            <div className="space-y-3">
              {[
                { label: 'SKU', value: product.sku },
                { label: 'Barcode', value: product.barcode },
                { label: 'Category', value: category?.name ?? '—' },
                { label: 'Supplier', value: supplier?.company ?? '—' },
                { label: 'Status', value: product.status },
                { label: 'Created', value: formatDate(product.createdAt) },
                { label: 'Updated', value: formatDate(product.updatedAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-dark-500 dark:text-dark-400 flex-shrink-0">{label}</span>
                  <span className="text-xs font-medium text-dark-900 dark:text-white text-right truncate">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Barcode Display */}
          <Card>
            <h2 className="text-sm font-semibold text-dark-900 dark:text-white mb-3 flex items-center gap-2">
              <Barcode size={14} /> Barcode
            </h2>
            <div className="bg-white dark:bg-dark-800 rounded-xl p-4 text-center">
              {/* Visual barcode representation */}
              <div className="flex items-end justify-center gap-[2px] h-12 mb-2">
                {product.barcode.split('').map((char, i) => (
                  <div
                    key={i}
                    className="bg-dark-900 dark:bg-white rounded-[1px]"
                    style={{
                      width: Math.random() > 0.7 ? 3 : 2,
                      height: 20 + (parseInt(char) || 5) * 4,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs font-mono text-dark-600 dark:text-dark-400 tracking-widest">{product.barcode}</p>
            </div>
          </Card>

          {/* Tags */}
          {product.tags.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white mb-3 flex items-center gap-2">
                <Tag size={14} /> Tags
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map(tag => {
                  const cfg = TAG_CONFIG[tag];
                  return (
                    <span key={tag} className={cn('badge border text-xs', cfg.color)}>{cfg.label}</span>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
