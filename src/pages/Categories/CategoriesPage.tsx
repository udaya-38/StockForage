import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Tag, Package } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useCategoryStore } from '../../store/categoryStore';
import { useProductStore } from '../../store/productStore';
import { Button, Card, Input, EmptyState } from '../../components/ui';
import { Modal, ConfirmDialog, toast } from '../../components/ui/Modal';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../../constants';
import { cn } from '../../utils';
import { containerVariants, cardVariants } from '../../animations/variants';

function CategoryForm({ initial, onSubmit, onCancel, loading }: {
  initial?: { name: string; description: string; icon: string; color: string };
  onSubmit: (data: { name: string; description: string; icon: string; color: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    icon: initial?.icon ?? 'Package',
    color: initial?.color ?? CATEGORY_COLORS[0],
  });

  return (
    <div className="space-y-4">
      <Input
        label="Category Name"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        placeholder="e.g. Electronics"
      />
      <Input
        label="Description"
        value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        placeholder="Brief description of this category"
      />
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Icon</label>
        <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto pr-1">
          {CATEGORY_ICONS.map(iconName => {
            const Icon = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName];
            if (!Icon) return null;
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => setForm(f => ({ ...f, icon: iconName }))}
                className={cn(
                  'p-2.5 rounded-xl flex items-center justify-center transition-all',
                  form.icon === iconName
                    ? 'bg-brand-600 text-white'
                    : 'bg-dark-100 dark:bg-dark-800 text-dark-500 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
                )}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Color Theme</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setForm(f => ({ ...f, color }))}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                color,
                form.color === color ? 'ring-2 ring-brand-500 ring-offset-2' : 'border-transparent'
              )}
            >
              Sample
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button variant="primary" loading={loading} onClick={() => onSubmit(form)} className="flex-1" disabled={!form.name.trim()}>
          {initial ? 'Save Changes' : 'Add Category'}
        </Button>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { products } = useProductStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (data: { name: string; description: string; icon: string; color: string }) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    addCategory(data);
    setShowAdd(false);
    setLoading(false);
    toast('Category added', 'success');
  };

  const handleEdit = async (data: { name: string; description: string; icon: string; color: string }) => {
    if (!editTarget) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    updateCategory(editTarget, data);
    setEditTarget(null);
    setLoading(false);
    toast('Category updated', 'success');
  };

  const handleDelete = (id: string) => {
    const hasProducts = products.some(p => p.categoryId === id);
    if (hasProducts) {
      toast('Cannot delete: category has products assigned', 'error');
      setDeleteTarget(null);
      return;
    }
    deleteCategory(id);
    setDeleteTarget(null);
    toast('Category deleted', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} categories managing your product catalog</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<Tag size={28} />}
          title="No categories yet"
          description="Add categories to organize your products."
          action={<Button variant="primary" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>Add Category</Button>}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {categories.map(cat => {
            const IconComp = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[cat.icon] ?? Package;
            const catProducts = products.filter(p => p.categoryId === cat.id);
            const totalValue = catProducts.reduce((s, p) => s + p.quantity * p.purchasePrice, 0);

            return (
              <motion.div key={cat.id} variants={cardVariants}>
                <Card hover className="group">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('p-2.5 rounded-xl', cat.color)}>
                      <IconComp size={18} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditTarget(cat.id)}
                        className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-brand-500 transition-colors"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat.id)}
                        className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-danger-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-dark-900 dark:text-white">{cat.name}</h3>
                  <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5 line-clamp-2">{cat.description}</p>

                  <div className="mt-3 pt-3 border-t border-dark-100 dark:border-dark-800 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-lg font-bold text-dark-900 dark:text-white">{catProducts.length}</p>
                      <p className="text-[10px] text-dark-400">Products</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark-900 dark:text-white">
                        {totalValue > 100000 ? `₹${(totalValue / 100000).toFixed(1)}L` : `₹${(totalValue / 1000).toFixed(0)}K`}
                      </p>
                      <p className="text-[10px] text-dark-400">Stock Value</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Category" size="md">
        <CategoryForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} loading={loading} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Category" size="md">
        {editTarget && (
          <CategoryForm
            initial={categories.find(c => c.id === editTarget)}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            loading={loading}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Category"
        message="This will permanently delete the category. Products in this category will become uncategorized."
      />
    </div>
  );
}
