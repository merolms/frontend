import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const AccordionContext = createContext(null);
const AccordionItemContext = createContext(null);

const Accordion = ({ type = 'multiple', defaultValue, value, onValueChange, children, className }) => {
  const [internalVal, setInternalVal] = useState(type === 'single' ? (defaultValue || '') : (defaultValue || []));
  const current = value !== undefined ? value : internalVal;

  const setValue = (v) => {
    if (value === undefined) setInternalVal(v);
    if (onValueChange) onValueChange(v);
  };

  const toggle = (itemValue) => {
    if (type === 'single') {
      setValue(current === itemValue ? '' : itemValue);
    } else {
      const arr = Array.isArray(current) ? current : [];
      setValue(arr.includes(itemValue) ? arr.filter((i) => i !== itemValue) : [...arr, itemValue]);
    }
  };

  return (
    <AccordionContext.Provider value={{ value: current, toggle }}>
      <div className={cn('space-y-1', className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

const AccordionItem = React.forwardRef(({ className, value, children, ...props }, ref) => {
  return (
    <AccordionItemContext.Provider value={value}>
      <div ref={ref} className={cn('border border-border rounded-lg overflow-hidden', className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
});
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const ctx = useContext(AccordionContext);
  const itemValue = useContext(AccordionItemContext);
  const isOpen = Array.isArray(ctx.value) ? ctx.value.includes(itemValue) : ctx.value === itemValue;

  return (
    <button
      ref={ref}
      onClick={() => ctx.toggle(itemValue)}
      className={cn('flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-text-primary hover:bg-bg-surface-hover transition-colors cursor-pointer', className)}
      {...props}
    >
      {children}
      <ChevronDown size={14} className={cn('text-text-muted transition-transform', isOpen && 'rotate-180')} />
    </button>
  );
});
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const ctx = useContext(AccordionContext);
  const itemValue = useContext(AccordionItemContext);
  const isOpen = Array.isArray(ctx.value) ? ctx.value.includes(itemValue) : ctx.value === itemValue;

  if (!isOpen) return null;
  return (
    <div ref={ref} className={cn('px-4 pb-3', className)} {...props}>
      {children}
    </div>
  );
});
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
