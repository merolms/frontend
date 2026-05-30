import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-9 w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary shadow-sm transition-colors',
      'placeholder:text-text-muted',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-[80px] w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary shadow-sm transition-colors',
      'placeholder:text-text-muted',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
    {...props}
  />
));
Label.displayName = 'Label';

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-9 w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary shadow-sm',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-primary-light text-primary',
    success: 'bg-success-light text-text-primary',
    warning: 'bg-warning-light text-text-primary',
    error: 'bg-error-light text-text-primary',
    outline: 'border border-border text-text-secondary',
  };
  return (
    <div
      ref={ref}
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

const Separator = React.forwardRef(({ className, orientation = 'horizontal', ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation={orientation}
    className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
    {...props}
  />
));
Separator.displayName = 'Separator';

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div ref={ref} className={cn('relative h-2 w-full overflow-hidden rounded-full bg-bg-secondary', className)} {...props}>
    <div className="h-full bg-primary transition-all" style={{ width: `${value || 0}%` }} />
  </div>
));
Progress.displayName = 'Progress';

const Avatar = React.forwardRef(({ className, src, alt, fallback, ...props }, ref) => (
  <div ref={ref} className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props}>
    {src ? (
      <img src={src} alt={alt} className="aspect-square h-full w-full object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-bg-secondary text-sm font-medium text-text-muted">
        {fallback || '?'}
      </div>
    )}
  </div>
));
Avatar.displayName = 'Avatar';

export { Input, Textarea, Label, Select, Badge, Separator, Progress, Avatar };
