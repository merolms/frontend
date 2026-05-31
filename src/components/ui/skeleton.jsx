import React from "react";
import { cn } from "@/lib/utils";

const Skeleton = ({ className, ...props }) => {
  return (
    <div className={cn("bg-bg-surface-active animate-pulse rounded-md", className)} {...props} />
  );
};

export { Skeleton };
