import React from 'react';
import { cn } from '../../utils';

// =========================================
// Button
// =========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, children, className, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm shadow-brand-600/25',
      secondary: 'bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 text-dark-900 dark:text-white',
      ghost: 'hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300',
      danger: 'bg-danger-600 hover:bg-danger-500 text-white shadow-sm shadow-danger-600/25',
      outline: 'border border-dark-200 dark:border-dark-700 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300',
    };
    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-5 text-sm gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);
Button.displayName = 'Button';

// =========================================
// Input
// =========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 7)}`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-9 px-3 rounded-lg text-sm transition-colors duration-150',
              'bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700',
              'text-dark-900 dark:text-white placeholder:text-dark-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
              error && 'border-danger-500 focus:ring-danger-500',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-dark-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// =========================================
// Select
// =========================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 7)}`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full h-9 px-3 rounded-lg text-sm transition-colors duration-150',
            'bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700',
            'text-dark-900 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            error && 'border-danger-500',
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// =========================================
// Textarea
// =========================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const areaId = id || `textarea-${Math.random().toString(36).slice(2, 7)}`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={areaId} className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={cn(
            'w-full px-3 py-2 rounded-lg text-sm transition-colors duration-150',
            'bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700',
            'text-dark-900 dark:text-white placeholder:text-dark-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            'resize-none',
            error && 'border-danger-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// =========================================
// Badge
// =========================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variants = {
    brand: 'bg-brand-500/10 text-brand-500 dark:bg-brand-500/15',
    success: 'bg-success-500/10 text-success-600 dark:text-success-400 dark:bg-success-500/15',
    warning: 'bg-warning-500/10 text-warning-600 dark:text-warning-400 dark:bg-warning-500/15',
    danger: 'bg-danger-500/10 text-danger-600 dark:text-danger-400 dark:bg-danger-500/15',
    info: 'bg-info-500/10 text-info-600 dark:text-info-400 dark:bg-info-500/15',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/15',
    default: 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400',
  };
  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
  };

  return (
    <span className={cn('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}

// =========================================
// Card
// =========================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}

export function Card({ children, className, hover, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-dark-900/80 border border-dark-100 dark:border-dark-800 rounded-2xl shadow-sm',
        hover && 'hover:shadow-md hover:border-dark-200 dark:hover:border-dark-700 transition-all duration-200 cursor-pointer',
        padding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

// =========================================
// Skeleton
// =========================================
interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-dark-100 dark:bg-dark-800 rounded-lg',
            className
          )}
        />
      ))}
    </>
  );
}

// =========================================
// Empty State
// =========================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 p-4 rounded-2xl bg-dark-100 dark:bg-dark-800 text-dark-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-dark-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1 text-sm text-dark-500 dark:text-dark-400 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// =========================================
// Avatar
// =========================================
interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold flex-shrink-0 select-none',
      'bg-gradient-to-br from-brand-500 to-info-500 text-white',
      sizes[size],
      className
    )}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

// =========================================
// Divider
// =========================================
export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-dark-100 dark:border-dark-800', className)} />;
}

// =========================================
// Spinner
// =========================================
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <svg className={cn('animate-spin text-brand-500', sizes[size], className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// =========================================
// Toggle Switch
// =========================================
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  const toggleId = id || `toggle-${Math.random().toString(36).slice(2, 7)}`;
  return (
    <div className="flex items-center gap-2.5">
      <button
        id={toggleId}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          checked ? 'bg-brand-600' : 'bg-dark-300 dark:bg-dark-600'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
      {label && (
        <label htmlFor={toggleId} className="text-sm text-dark-700 dark:text-dark-300 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
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
