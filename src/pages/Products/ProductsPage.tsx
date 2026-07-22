import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Search, Download, Trash2, Edit3, Eye, Package, X,
} from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useSupplierStore } from '../../store/supplierStore';
import { useSettingsStore } from '../../store/uiStore';
import {
  Button, Card, EmptyState, Pagination,
} from '../../components/ui';
import { ConfirmDialog, toast } from '../../components/ui/Modal';
import { STOCK_STATUS } from '../../constants';
import { formatCurrency, getStockStatus, downloadCSV, cn } from '../../utils';
import { usePagination } from '../../hooks';
import type { Product } from '../../types';

// =========================================
// Stock Status Badge
// =========================================
function StockBadge({ qty, min }: { qty: number; min: number }) {
  const status = getStockStatus(qty, min);
  const cfg = STOCK_STATUS[status];
  return (
    <span className={cn('badge border text-[10px]', cfg.color)}>
      {cfg.label}
    </span>
  );
}

// =========================================
// Product Row
// =========================================
interface ProductRowProps {
  product: Product;
  categoryName: string;
  supplierName: string;
  currencySymbol: string;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

function ProductRow({
  product, categoryName, supplierName, currencySymbol,
  selected, onSelect, onEdit, onView, onDelete,
}: ProductRowProps) {
  const margin = ((product.sellingPrice - product.purchasePrice) / product.sellingPrice * 100).toFixed(0);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-dark-50 dark:border-dark-800/50 hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors group"
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(product.id)}
          className="w-3.5 h-3.5 rounded border-dark-300 dark:border-dark-600 text-brand-600 focus:ring-brand-500"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-dark-100 dark:bg-dark-800 flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/1e293b/475569?text=IMG'; }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-dark-900 dark:text-white truncate max-w-[180px]">{product.name}</p>
            <p className="text-xs text-dark-400">{product.sku}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-xs text-dark-600 dark:text-dark-400">{categoryName}</span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-dark-600 dark:text-dark-400 truncate max-w-[120px] block">{supplierName}</span>
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-dark-900 dark:text-white">{product.quantity}</p>
          <p className="text-xs text-dark-400">min: {product.minimumStock}</p>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <StockBadge qty={product.quantity} min={product.minimumStock} />
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <p className="text-sm font-medium text-dark-900 dark:text-white">{formatCurrency(product.sellingPrice, currencySymbol)}</p>
        <p className="text-xs text-success-500">+{margin}% margin</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(product.id)}
            className="p-1.5 rounded-lg hover:bg-brand-500/10 text-dark-400 hover:text-brand-500 transition-colors"
            title="View"
          >
            <Eye size={13} />
          </button>
          <button
            onClick={() => onEdit(product.id)}
            className="p-1.5 rounded-lg hover:bg-brand-500/10 text-dark-400 hover:text-brand-500 transition-colors"
            title="Edit"
          >
            <Edit3 size={13} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 rounded-lg hover:bg-danger-500/10 text-dark-400 hover:text-danger-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// =========================================
// Products Page
// =========================================
export function ProductsPage() {
  const navigate = useNavigate();
  const { products, filters, setFilters, resetFilters, deleteProduct, bulkDelete, getFilteredProducts, currentPage, pageSize, setPage } = useProductStore();
  const { categories, getCategoryById } = useCategoryStore();
  const { getSupplierById } = useSupplierStore();
  const { settings } = useSettingsStore();

  const [selected, setSelected] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const filtered = getFilteredProducts();
  const { paginatedItems, totalPages } = usePagination(filtered, pageSize, currentPage);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelected(prev => prev.length === paginatedItems.length ? [] : paginatedItems.map(p => p.id));
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteTarget(null);
    toast('Product deleted successfully', 'success');
  };

  const handleBulkDelete = () => {
    bulkDelete(selected);
    setSelected([]);
    setShowBulkConfirm(false);
    toast(`${selected.length} products deleted`, 'success');
  };

  const handleExport = () => {
    const rows = filtered.map(p => ({
      SKU: p.sku,
      Name: p.name,
      Barcode: p.barcode,
      Category: getCategoryById(p.categoryId)?.name ?? '',
      Supplier: getSupplierById(p.supplierId)?.company ?? '',
      'Purchase Price': p.purchasePrice,
      'Selling Price': p.sellingPrice,
      Quantity: p.quantity,
      'Min Stock': p.minimumStock,
      Status: p.status,
      Tags: p.tags.join(', '),
    }));
    downloadCSV(rows, 'products-export');
    toast('Products exported as CSV', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{filtered.length} of {products.length} products</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selected.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={() => setShowBulkConfirm(true)}
            >
              Delete ({selected.length})
            </Button>
          )}
          <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={handleExport}>Export</Button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => navigate('/products/new')}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="mb-4 p-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              value={filters.search}
              onChange={e => setFilters({ search: e.target.value })}
              placeholder="Search products, SKU, barcode…"
              className="w-full h-9 pl-9 pr-3 rounded-lg text-sm bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 text-dark-900 dark:text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Category */}
          <select
            value={filters.categoryId}
            onChange={e => setFilters({ categoryId: e.target.value })}
            className="h-9 px-3 rounded-lg text-sm bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Stock Status */}
          <select
            value={filters.stockStatus}
            onChange={e => setFilters({ stockStatus: e.target.value as typeof filters.stockStatus })}
            className="h-9 px-3 rounded-lg text-sm bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Stock</option>
            <option value="ok">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          {/* Sort */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={e => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
              setFilters({ sortBy, sortOrder });
            }}
            className="h-9 px-3 rounded-lg text-sm bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="quantity-asc">Qty: Low–High</option>
            <option value="quantity-desc">Qty: High–Low</option>
            <option value="sellingPrice-desc">Price: High–Low</option>
            <option value="sellingPrice-asc">Price: Low–High</option>
          </select>

          {/* Reset */}
          {(filters.search || filters.categoryId || filters.supplierId || filters.stockStatus !== 'all') && (
            <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={resetFilters}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="border-b border-dark-100 dark:border-dark-800">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === paginatedItems.length && paginatedItems.length > 0}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-dark-300 dark:border-dark-600 text-brand-600 focus:ring-brand-500"
                  />
                </th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 hidden md:table-cell">Category</th>
                <th className="px-4 py-3 hidden lg:table-cell">Supplier</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3 hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Price</th>
                <th className="px-4 py-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={<Package size={28} />}
                      title="No products found"
                      description="Try adjusting your filters or add a new product."
                      action={<Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => navigate('/products/new')}>Add Product</Button>}
                    />
                  </td>
                </tr>
              ) : (
                paginatedItems.map(product => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    categoryName={getCategoryById(product.categoryId)?.name ?? '—'}
                    supplierName={getSupplierById(product.supplierId)?.company ?? '—'}
                    currencySymbol={settings.currencySymbol}
                    selected={selected.includes(product.id)}
                    onSelect={toggleSelect}
                    onEdit={id => navigate(`/products/${id}/edit`)}
                    onView={id => navigate(`/products/${id}`)}
                    onDelete={id => setDeleteTarget(id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Product"
        message="This will permanently remove the product from your inventory. This action cannot be undone."
        confirmLabel="Delete"
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        open={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.length} Products`}
        message={`You are about to delete ${selected.length} products. This action cannot be undone.`}
        confirmLabel={`Delete ${selected.length} Products`}
      />
    </div>
  );
}
