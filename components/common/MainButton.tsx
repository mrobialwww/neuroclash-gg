import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const mainButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        blue: "bg-[#256AF4] text-white hover:bg-[#3269d6]",
        white: "bg-white text-[#256AF4] hover:bg-gray-50",
      },
      size: {
        default: "h-12 px-8 py-3 text-lg",
        sm: "h-10 px-6 text-base",
        lg: "h-14 px-10 py-4 text-xl",
        icon: "h-12 w-12",
      },
      hasShadow: {
        true: "",
        false: "shadow-none",
      },
    },
    compoundVariants: [
      {
        variant: "blue",
        hasShadow: true,
        className:
          "shadow-[0_8px_20px_rgba(61,121,243,0.3)] hover:shadow-[0_10px_25px_rgba(61,121,243,0.4)] hover:-translate-y-0.5",
      },
      {
        variant: "white",
        hasShadow: true,
        className:
          "shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.12)] border border-gray-100 hover:-translate-y-0.5",
      },
    ],
    defaultVariants: {
      variant: "blue",
      size: "default",
      hasShadow: false,
    },
  },
);

export interface MainButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mainButtonVariants> {
  asChild?: boolean;
}

const MainButton = React.forwardRef<HTMLButtonElement, MainButtonProps>(
  ({ className, variant, size, hasShadow, type = "button", ...props }, ref) => {
    return (
      <button
        type={type}
        className={cn(
          mainButtonVariants({ variant, size, hasShadow, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
MainButton.displayName = "MainButton";

export { MainButton, mainButtonVariants };
