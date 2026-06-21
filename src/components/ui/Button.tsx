import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5",
    "rounded-md font-medium",
    "transition-all duration-200",
    "cursor-pointer",
    "whitespace-nowrap",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring",
    "focus-visible:ring-offset-2",
    "active:scale-95",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",

        default:
          "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80",

        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",

        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        ghost: "hover:bg-accent hover:text-accent-foreground",

        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        link: "text-primary underline-offset-4 hover:underline",

        success: "bg-success text-success-foreground hover:bg-success/90",

        warning: "bg-warning text-warning-foreground hover:bg-warning/90",

        info: "bg-info text-info-foreground hover:bg-info/90",

        purple: "bg-purple-600 text-white hover:bg-purple-700",

        pink: "bg-pink-600 text-white hover:bg-pink-700",

        dark: "bg-slate-900 text-white hover:bg-slate-800",

        light: "bg-slate-100 text-slate-900 hover:bg-slate-200",

        soft: "bg-primary/10 text-primary hover:bg-primary/20",

        "soft-success":
          "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400",

        "soft-danger":
          "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400",

        "soft-warning":
          "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",

        gradient:
          "bg-gradient-to-r from-primary to-primary/70 text-primary-foreground hover:opacity-90",

        glass: "border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
      },

      size: {
        xs: "h-7 px-2 text-[11px]",
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-11 px-8 text-base",
        xl: "h-12 px-10 text-lg",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },

      fullWidth: {
        true: "w-full",
        false: "",
      },
    },

    compoundVariants: [
      {
        variant: "ghost",
        size: "icon",
        className: "rounded-full",
      },
      {
        variant: "danger",
        size: "icon",
        className: "rounded-full",
      },
      {
        variant: "glass",
        size: "icon",
        className: "rounded-full",
      },
    ],

    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
          }),
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
