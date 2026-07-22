import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { useActivityStore } from '../../store/uiStore';
import { Button, Card, Select, EmptyState, Pagination } from '../../components/ui';
import { Modal, toast } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui';
import { TRANSACTION_CONFIG } from '../../constants';
import { timeAgo, cn } from '../../utils';
import { usePagination } from '../../hooks';
import { containerVariants, listItemVariants } from '../../animations/variants';
import type { TransactionType } from '../../types';

// =========================================
// Transaction Form
// =========================================
function TransactionForm({ type, onSubmit, onCancel, loading }: {
  type: TransactionType;
  onSubmit: (data: { productId: string; quantity: number; reason: string; notes: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const { products } = useProductStore();
  const [form, setForm] = useState({ productId: '', quantity: 1, reason: '', notes: '' });
  const cfg = TRANSACTION_CONFIG[type];

  const REASONS: Record<TransactionType, string[]> = {
    'stock-in': ['Purchase Order', 'Supplier Delivery', 'Return from Customer', 'Transfer In'],
    'stock-out': ['Customer Sale', 'Damaged Goods', 'Transfer Out', 'Sample', 'Returned to Supplier'],
    'transfer': ['Warehouse Transfer', 'Branch Transfer', 'Stock Rebalancing'],
    'adjustment': ['Physical Count', 'Shrinkage', 'Data Correction', 'Audit Adjustment'],
  };

  const selectedProduct = products.find(p => p.id === form.productId);

  return (
    <div className="space-y-4">
      <div className={cn('p-3 rounded-xl text-sm font-medium flex items-center gap-2', cfg.bg, cfg.color)}>
        <TrendingUp size={14} />
        {cfg.label} Transaction
      </div>

      <Select
        label="Product"
        value={form.productId}
        onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
        options={[
          { value: '', label: 'Select a product' },
          ...products.map(p => ({ value: p.id, label: `${p.name} (${p.sku}) — Stock: ${p.quantity}` })),
        ]}
      />

      {selectedProduct && (
        <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800 text-xs text-dark-500 dark:text-dark-400">
          Current stock: <strong className="text-dark-900 dark:text-white">{selectedProduct.quantity}</strong> units
          {type === 'stock-out' && form.quantity > selectedProduct.quantity && (
            <span className="text-danger-500 ml-2">⚠ Insufficient stock</span>
          )}
        </div>
      )}

      <Input
        label="Quantity"
        type="number"
        min="1"
        value={form.quantity}
        onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
      />

      <Select
        label="Reason"
        value={form.reason}
        onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
        options={[
          { value: '', label: 'Select reason' },
          ...REASONS[type].map(r => ({ value: r, label: r })),
        ]}
      />

      <Textarea
        label="Notes (optional)"
        rows={2}
        value={form.notes}
        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
        placeholder="Additional notes…"
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button
          variant="primary"
          loading={loading}
          className="flex-1"
          disabled={!form.productId || !form.reason || form.quantity < 1}
          onClick={() => onSubmit(form)}
        >
          Record {cfg.label}
        </Button>
      </div>
    </div>
  );
}

// =========================================
// Transaction Item
// =========================================
function TransactionItem({ tx }: { tx: ReturnType<typeof useTransactionStore.getState>['transactions'][0] }) {
  const { getProductById } = useProductStore();
  const product = getProductById(tx.productId);
  const cfg = TRANSACTION_CONFIG[tx.type];
  const isIn = tx.type === 'stock-in' || tx.type === 'transfer';

  return (
    <motion.div
      variants={listItemVariants}
      className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
    >
      <div className={cn('p-2 rounded-xl flex-shrink-0', cfg.bg)}>
        {isIn ? (
          <ArrowUpRight size={14} className={cfg.color} />
        ) : (
          <ArrowDownRight size={14} className={cfg.color} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dark-900 dark:text-white truncate">
          {product?.name ?? 'Unknown Product'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
          <span className="text-xs text-dark-400">·</span>
          <span className="text-xs text-dark-500 dark:text-dark-400">{tx.reason}</span>
        </div>
        <p className="text-[10px] text-dark-400 mt-0.5">{tx.performedBy} · {timeAgo(tx.createdAt)}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={cn('text-base font-bold', isIn ? 'text-success-500' : 'text-danger-500')}>
          {isIn ? '+' : '-'}{tx.quantity}
        </p>
        <p className="text-[10px] text-dark-400">{tx.previousQuantity} → {tx.newQuantity}</p>
      </div>
    </motion.div>
  );
}

// =========================================
// Transactions Page
// =========================================
export function TransactionsPage() {
  const [searchParams] = useSearchParams();
  const { addActivity } = useActivityStore();
  const {
    transactions, filterType, setFilterType, getFilteredTransactions,
    addTransaction, currentPage, pageSize, setPage,
  } = useTransactionStore();
  const { updateProduct, getProductById } = useProductStore();
  const { user } = useAuthStore();

  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-open modal from URL param
  useEffect(() => {
    const action = searchParams.get('action');
    if (action && ['stock-in', 'stock-out', 'transfer', 'adjustment'].includes(action)) {
      setModalType(action as TransactionType);
    }
  }, [searchParams]);

  const filtered = getFilteredTransactions();
  const { paginatedItems, totalPages } = usePagination(filtered, pageSize, currentPage);

  const handleTransaction = async (data: { productId: string; quantity: number; reason: string; notes: string }) => {
    if (!modalType) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const product = getProductById(data.productId);
    if (!product) return;

    const prevQty = product.quantity;
    let newQty = prevQty;

    if (modalType === 'stock-in' || modalType === 'transfer') {
      newQty = prevQty + data.quantity;
    } else if (modalType === 'stock-out') {
      newQty = Math.max(0, prevQty - data.quantity);
    } else {
      newQty = Math.max(0, prevQty - data.quantity);
    }

    addTransaction({
      productId: data.productId,
      type: modalType,
      quantity: data.quantity,
      previousQuantity: prevQty,
      newQuantity: newQty,
      reason: data.reason,
      notes: data.notes,
      performedBy: user?.name ?? 'System',
    });

    updateProduct(data.productId, { quantity: newQty });

    addActivity({
      type: modalType === 'stock-in' ? 'stock-in' : 'stock-out',
      title: TRANSACTION_CONFIG[modalType].label,
      description: `${data.quantity} units of ${product.name} — ${data.reason}`,
      status: modalType === 'stock-in' ? 'success' : 'info',
    });

    toast(`${TRANSACTION_CONFIG[modalType].label} recorded successfully`, 'success');
    setModalType(null);
    setLoading(false);
  };

  // Stats
  const stockIn = transactions.filter(t => t.type === 'stock-in').reduce((s, t) => s + t.quantity, 0);
  const stockOut = transactions.filter(t => t.type === 'stock-out').reduce((s, t) => s + t.quantity, 0);
  const transfers = transactions.filter(t => t.type === 'transfer').length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{transactions.length} total stock movements recorded</p>
        </div>
        <div className="flex items-center gap-2">
          {(['stock-in', 'stock-out', 'transfer', 'adjustment'] as TransactionType[]).map(type => {
            const cfg = TRANSACTION_CONFIG[type];
            return (
              <Button
                key={type}
                variant="secondary"
                size="sm"
                icon={<Plus size={13} />}
                onClick={() => setModalType(type)}
              >
                {cfg.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-success-500/10"><TrendingUp size={16} className="text-success-500" /></div>
            <div>
              <p className="text-xl font-bold text-dark-900 dark:text-white">{stockIn.toLocaleString()}</p>
              <p className="text-xs text-dark-400">Units In</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-danger-500/10"><TrendingDown size={16} className="text-danger-500" /></div>
            <div>
              <p className="text-xl font-bold text-dark-900 dark:text-white">{stockOut.toLocaleString()}</p>
              <p className="text-xs text-dark-400">Units Out</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/10"><ArrowLeftRight size={16} className="text-brand-500" /></div>
            <div>
              <p className="text-xl font-bold text-dark-900 dark:text-white">{transfers}</p>
              <p className="text-xs text-dark-400">Transfers</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        {['all', 'stock-in', 'stock-out', 'transfer', 'adjustment'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type as typeof filterType)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filterType === type
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-400 hover:border-brand-500/50'
            )}
          >
            {type === 'all' ? 'All' : TRANSACTION_CONFIG[type as TransactionType]?.label ?? type}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <Card padding={false}>
        <div className="divide-y divide-dark-50 dark:divide-dark-800/50 p-2">
          {paginatedItems.length === 0 ? (
            <EmptyState
              icon={<ArrowLeftRight size={24} />}
              title="No transactions found"
              description="Record your first stock movement using the buttons above."
            />
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show">
              {paginatedItems.map(tx => <TransactionItem key={tx.id} tx={tx} />)}
            </motion.div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-dark-100 dark:border-dark-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={filtered.length}
              pageSize={pageSize}
            />
          </div>
        )}
      </Card>

      {/* Transaction Modal */}
      {modalType && (
        <Modal
          open={true}
          onClose={() => setModalType(null)}
          title={`Record ${TRANSACTION_CONFIG[modalType].label}`}
          size="md"
        >
          <TransactionForm
            type={modalType}
            onSubmit={handleTransaction}
            onCancel={() => setModalType(null)}
            loading={loading}
          />
        </Modal>
      )}
    </div>
  );
}
