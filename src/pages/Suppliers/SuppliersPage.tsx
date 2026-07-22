import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Star, Mail, Phone, MapPin, Edit3, Trash2, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useSupplierStore } from '../../store/supplierStore';
import { useProductStore } from '../../store/productStore';
import { Button, Card, Input, Select, EmptyState } from '../../components/ui';
import { Modal, ConfirmDialog, toast } from '../../components/ui/Modal';
import { cn } from '../../utils';
import { containerVariants, cardVariants } from '../../animations/variants';
import type { Supplier, SupplierRating } from '../../types';

function StarRating({ rating, onChange }: { rating: SupplierRating; onChange?: (r: SupplierRating) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star as SupplierRating)}
          className={cn('transition-colors', onChange ? 'cursor-pointer' : 'cursor-default')}
        >
          <Star
            size={14}
            className={star <= rating ? 'text-warning-500 fill-warning-500' : 'text-dark-300 dark:text-dark-600'}
          />
        </button>
      ))}
    </div>
  );
}

function SupplierForm({ initial, onSubmit, onCancel, loading }: {
  initial?: Partial<Supplier>;
  onSubmit: (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'productsSupplied' | 'totalOrders'>) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    company: initial?.company ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    address: initial?.address ?? '',
    city: initial?.city ?? '',
    state: initial?.state ?? '',
    gstNumber: initial?.gstNumber ?? '',
    rating: (initial?.rating ?? 3) as SupplierRating,
    status: initial?.status ?? 'active' as const,
  });

  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Contact Name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
        <Input label="Company Name" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Company Pvt Ltd" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@company.in" />
        <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
      </div>
      <Input label="Address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={form.city} onChange={e => set('city', e.target.value)} />
        <Input label="State" value={form.state} onChange={e => set('state', e.target.value)} />
      </div>
      <Input label="GST Number" value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} placeholder="29ABCDE1234F1Z5" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Rating</label>
          <StarRating rating={form.rating} onChange={r => set('rating', r)} />
        </div>
        <Select
          label="Status"
          value={form.status}
          onChange={e => set('status', e.target.value)}
          options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button variant="primary" loading={loading} onClick={() => onSubmit(form as Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'productsSupplied' | 'totalOrders'>)} className="flex-1" disabled={!form.company.trim()}>
          {initial?.id ? 'Save Changes' : 'Add Supplier'}
        </Button>
      </div>
    </div>
  );
}

export function SuppliersPage() {
  const { suppliers, searchQuery, setSearchQuery, addSupplier, updateSupplier, deleteSupplier, getFilteredSuppliers } = useSupplierStore();
  const { products } = useProductStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = getFilteredSuppliers();

  const handleAdd = async (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'productsSupplied' | 'totalOrders'>) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    addSupplier(data);
    setShowAdd(false);
    setLoading(false);
    toast('Supplier added', 'success');
  };

  const handleEdit = async (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'productsSupplied' | 'totalOrders'>) => {
    if (!editTarget) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    updateSupplier(editTarget, data);
    setEditTarget(null);
    setLoading(false);
    toast('Supplier updated', 'success');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSupplier(deleteTarget);
    setDeleteTarget(null);
    toast('Supplier deleted', 'success');
  };

  const activeCount = suppliers.filter(s => s.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">{activeCount} active suppliers out of {suppliers.length} total</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Add Supplier
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search suppliers…"
          className="w-full h-9 pl-9 pr-3 rounded-lg text-sm bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 text-dark-900 dark:text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No suppliers found"
          description="Add suppliers to manage your procurement."
          action={<Button variant="primary" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>Add Supplier</Button>}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filtered.map(supplier => {
            const suppliedProducts = products.filter(p => p.supplierId === supplier.id);
            return (
              <motion.div key={supplier.id} variants={cardVariants}>
                <Card hover className="group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-info-500/20 flex items-center justify-center text-brand-500 font-bold text-sm flex-shrink-0">
                        {supplier.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-dark-900 dark:text-white truncate">{supplier.company}</h3>
                        <p className="text-xs text-dark-500 dark:text-dark-400">{supplier.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => setEditTarget(supplier.id)} className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-brand-500 transition-colors">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => setDeleteTarget(supplier.id)} className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-danger-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-xs text-dark-500 dark:text-dark-400">
                      <Mail size={11} className="flex-shrink-0" /> <span className="truncate">{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-dark-500 dark:text-dark-400">
                      <Phone size={11} className="flex-shrink-0" /> {supplier.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-dark-500 dark:text-dark-400">
                      <MapPin size={11} className="flex-shrink-0" /> {supplier.city}, {supplier.state}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-dark-100 dark:border-dark-800">
                    <StarRating rating={supplier.rating} />
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'flex items-center gap-1 text-xs',
                        supplier.status === 'active' ? 'text-success-500' : 'text-dark-400'
                      )}>
                        {supplier.status === 'active' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        {supplier.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="text-center p-2 rounded-lg bg-dark-50 dark:bg-dark-800">
                      <p className="text-base font-bold text-dark-900 dark:text-white">{suppliedProducts.length}</p>
                      <p className="text-[10px] text-dark-400">Products</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-dark-50 dark:bg-dark-800">
                      <p className="text-base font-bold text-dark-900 dark:text-white">{supplier.totalOrders}</p>
                      <p className="text-[10px] text-dark-400">Orders</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Supplier" size="lg">
        <SupplierForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} loading={loading} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Supplier" size="lg">
        {editTarget && (
          <SupplierForm
            initial={suppliers.find(s => s.id === editTarget)}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            loading={loading}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Supplier"
        message="This will permanently remove the supplier. Products linked to this supplier will retain the reference."
      />
    </div>
  );
}
