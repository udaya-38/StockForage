import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils';
import { fadeScale } from '../../animations/variants';
import { Button } from './index';

// =========================================
// Modal
// =========================================
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children, size = 'md', footer }: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            variants={fadeScale}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn(
              'relative w-full rounded-2xl shadow-glass-lg',
              'bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800',
              'max-h-[90vh] flex flex-col',
              sizes[size]
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex items-start justify-between p-5 border-b border-dark-100 dark:border-dark-800 flex-shrink-0">
                <div>
                  <h2 className="text-base font-semibold text-dark-900 dark:text-white">{title}</h2>
                  {description && <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="text-dark-400 hover:text-dark-700 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-2 p-5 border-t border-dark-100 dark:border-dark-800 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// =========================================
// Confirm Dialog
// =========================================
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', variant = 'danger', loading,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm text-dark-600 dark:text-dark-400">{message}</p>
    </Modal>
  );
}

// =========================================
// Dropdown Menu
// =========================================
interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-1.5 w-44 rounded-xl shadow-glass-lg py-1',
              'bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => { item.onClick(); setOpen(false); }}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left',
                  'transition-colors duration-100',
                  item.variant === 'danger'
                    ? 'text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10'
                    : 'text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700',
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================================
// Toast / Notification
// =========================================
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  const colors = {
    success: 'border-l-success-500 bg-success-50 dark:bg-success-500/10 text-success-700 dark:text-success-400',
    error: 'border-l-danger-500 bg-danger-50 dark:bg-danger-500/10 text-danger-700 dark:text-danger-400',
    info: 'border-l-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400',
    warning: 'border-l-warning-500 bg-warning-50 dark:bg-warning-500/10 text-warning-700 dark:text-warning-400',
  };

  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 shadow-glass min-w-[260px] max-w-sm text-sm font-medium',
        colors[type]
      )}
    >
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// =========================================
// Toast Container (simple global)
// =========================================
let toastCallback: ((msg: string, type?: ToastProps['type']) => void) | null = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastProps['type'] }>>([]);

  useEffect(() => {
    toastCallback = (message, type = 'success') => {
      const id = `toast-${Date.now()}`;
      setToasts(prev => [...prev, { id, message, type }]);
    };
    return () => { toastCallback = null; };
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function toast(message: string, type?: ToastProps['type']) {
  toastCallback?.(message, type);
}

// =========================================
// Pagination
// =========================================
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    pages.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-dark-500 dark:text-dark-400">
        {start}–{end} of {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-dark-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                currentPage === p
                  ? 'bg-brand-600 text-white'
                  : 'hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  );
}
