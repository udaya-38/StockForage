import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useSupplierStore } from '../../store/supplierStore';
import { useActivityStore, useNotificationStore } from '../../store/uiStore';
import { Button, Card, Input, Select, Textarea } from '../../components/ui';
import { toast } from '../../components/ui/Modal';
import { TAG_CONFIG } from '../../constants';
import type { ProductTag, ProductStatus } from '../../types';
import { cn } from '../../utils';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().default(''),
  categoryId: z.string().min(1, 'Please select a category'),
  supplierId: z.string().min(1, 'Please select a supplier'),
  purchasePrice: z.coerce.number().min(0, 'Must be positive'),
  sellingPrice: z.coerce.number().min(0, 'Must be positive'),
  quantity: z.coerce.number().min(0, 'Must be 0 or more'),
  minimumStock: z.coerce.number().min(0, 'Must be 0 or more'),
  image: z.string().default(''),
  status: z.enum(['active', 'inactive', 'discontinued']),
  tags: z.array(z.string()),
});

type ProductForm = z.infer<typeof productSchema>;

const ALL_TAGS: ProductTag[] = ['new', 'popular', 'low-stock', 'best-seller', 'imported', 'featured'];

export function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { addProduct, updateProduct, getProductById } = useProductStore();
  const { categories } = useCategoryStore();
  const { suppliers } = useSupplierStore();
  const { addActivity } = useActivityStore();
  const { addNotification } = useNotificationStore();

  const existingProduct = id ? getProductById(id) : undefined;

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: existingProduct ? {
      name: existingProduct.name,
      sku: existingProduct.sku,
      description: existingProduct.description ?? '',
      categoryId: existingProduct.categoryId,
      supplierId: existingProduct.supplierId,
      purchasePrice: existingProduct.purchasePrice,
      sellingPrice: existingProduct.sellingPrice,
      quantity: existingProduct.quantity,
      minimumStock: existingProduct.minimumStock,
      image: existingProduct.image ?? '',
      status: existingProduct.status,
      tags: existingProduct.tags,
    } : {
      name: '',
      sku: '',
      description: '',
      categoryId: '',
      supplierId: '',
      image: '',
      status: 'active',
      tags: [],
      quantity: 0,
      minimumStock: 5,
      purchasePrice: 0,
      sellingPrice: 0,
    },
  });

  const watchedTags = watch('tags') as string[];
  const purchasePrice = watch('purchasePrice') as number;
  const sellingPrice = watch('sellingPrice') as number;
  const margin = sellingPrice > 0 ? ((sellingPrice - purchasePrice) / sellingPrice * 100).toFixed(1) : '0.0';

  const toggleTag = (tag: string) => {
    const current = watchedTags || [];
    setValue('tags', current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag]);
  };

  const generateSKU = () => {
    const prefix = watch('categoryId') ? categories.find(c => c.id === watch('categoryId'))?.name?.slice(0, 3).toUpperCase() ?? 'PRD' : 'PRD';
    setValue('sku', `${prefix}-${Date.now().toString().slice(-5)}`);
  };

  const onSubmit = async (data: ProductForm) => {
    await new Promise(r => setTimeout(r, 300));

    const barcode = `8901${data.sku.replace(/[^0-9]/g, '').slice(0, 5).padStart(5, '0')}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;

    if (isEdit && existingProduct && id) {
      updateProduct(id, { ...data, tags: data.tags as ProductTag[], status: data.status as ProductStatus });
      addActivity({ type: 'product-updated', title: 'Product Updated', description: `${data.name} has been updated`, status: 'info' });
      toast('Product updated successfully', 'success');
    } else {
      addProduct({
        ...data,
        barcode,
        tags: data.tags as ProductTag[],
        status: data.status as ProductStatus,
        image: data.image || 'https://placehold.co/400x400/1e293b/475569?text=Product',
        description: data.description || '',
      });
      addActivity({ type: 'product-added', title: 'Product Added', description: `${data.name} added to inventory`, status: 'success' });
      addNotification({ type: 'new-product', title: 'New Product Added', message: `${data.name} has been added to inventory.`, read: false });
      toast('Product added successfully', 'success');
    }
    navigate('/products');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-1.5 text-sm text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white mb-5 transition-colors"
      >
        <ArrowLeft size={14} /> Products
      </button>

      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <p className="page-subtitle">{isEdit ? 'Update product details and inventory.' : 'Fill in the details to add a new product to inventory.'}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Info */}
            <Card>
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white mb-4">Basic Information</h2>
              <div className="space-y-3">
                <Input label="Product Name" placeholder="e.g. Samsung Galaxy S24" {...register('name')} error={errors.name?.message} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input label="SKU" placeholder="e.g. MOB-001" {...register('sku')} error={errors.sku?.message} />
                    <button type="button" onClick={generateSKU} className="text-xs text-brand-500 hover:text-brand-400 mt-1">Auto-generate SKU</button>
                  </div>
                  <Input label="Image URL" placeholder="https://..." {...register('image')} error={errors.image?.message} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Category"
                    {...register('categoryId')}
                    error={errors.categoryId?.message}
                    options={[
                      { value: '', label: 'Select category' },
                      ...categories.map(c => ({ value: c.id, label: c.name })),
                    ]}
                  />
                  <Select
                    label="Supplier"
                    {...register('supplierId')}
                    error={errors.supplierId?.message}
                    options={[
                      { value: '', label: 'Select supplier' },
                      ...suppliers.filter(s => s.status === 'active').map(s => ({ value: s.id, label: s.company })),
                    ]}
                  />
                </div>
                <Textarea label="Description" rows={3} placeholder="Product description…" {...register('description')} />
              </div>
            </Card>

            {/* Pricing */}
            <Card>
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white mb-4">Pricing</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Input label="Purchase Price (₹)" type="number" min="0" step="0.01" {...register('purchasePrice')} error={errors.purchasePrice?.message} />
                <Input label="Selling Price (₹)" type="number" min="0" step="0.01" {...register('sellingPrice')} error={errors.sellingPrice?.message} />
              </div>
              <div className={cn('p-3 rounded-xl text-sm', Number(margin) > 0 ? 'bg-success-500/5 border border-success-500/10' : 'bg-dark-50 dark:bg-dark-800')}>
                Profit Margin: <strong className={Number(margin) > 0 ? 'text-success-500' : 'text-dark-400'}>{margin}%</strong>
                {sellingPrice > 0 && purchasePrice > 0 && (
                  <span className="text-dark-400 text-xs ml-2">
                    (₹{(sellingPrice - purchasePrice).toFixed(0)} per unit)
                  </span>
                )}
              </div>
            </Card>

            {/* Stock */}
            <Card>
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white mb-4">Stock Management</h2>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Current Quantity" type="number" min="0" {...register('quantity')} error={errors.quantity?.message} />
                <Input label="Minimum Stock Level" type="number" min="0" {...register('minimumStock')} hint="Alert when stock falls below this" />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <Card>
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white mb-3">Status</h2>
              <Select
                {...register('status')}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'discontinued', label: 'Discontinued' },
                ]}
              />
            </Card>

            {/* Tags */}
            <Card>
              <h2 className="text-sm font-semibold text-dark-900 dark:text-white mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map(tag => {
                  const cfg = TAG_CONFIG[tag];
                  const isSelected = watchedTags?.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'badge border text-xs cursor-pointer transition-all',
                        isSelected ? cfg.color : 'bg-dark-50 dark:bg-dark-800 text-dark-500 border-dark-200 dark:border-dark-700'
                      )}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Submit */}
            <Button type="submit" variant="primary" className="w-full" loading={isSubmitting} icon={<Save size={14} />}>
              {isEdit ? 'Save Changes' : 'Add Product'}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/products')}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
