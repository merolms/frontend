import React, { createContext, useContext } from "react";

import { cn } from "@/lib/utils";

const TabsContext = createContext(null);

const Tabs = ({ defaultValue, value, onValueChange, children, className }) => {
  const [internalVal, setInternalVal] = React.useState(defaultValue);
  const current = value !== undefined ? value : internalVal;
  const setCurrent = (v) => {
    if (value === undefined) setInternalVal(v);
    if (onValueChange) onValueChange(v);
  };
  return (
    <TabsContext.Provider value={{ value: current, setValue: setCurrent }}>
      <div className={cn("space-y-3", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-border flex items-center gap-1 rounded-lg border p-1", className)}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs");
  return (
    <button
      ref={ref}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        ctx.value === value ? "bg-primary text-white" : "text-text-muted hover:text-text-primary",
        className
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within Tabs");
  if (ctx.value !== value) return null;
  return (
    <div ref={ref} className={cn("mt-2", className)} {...props}>
      {children}
    </div>
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsContent, TabsList, TabsTrigger };
