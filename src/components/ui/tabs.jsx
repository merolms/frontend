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
    className={cn(
      "bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1",
      className
    )}
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
        "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        ctx.value === value ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
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
