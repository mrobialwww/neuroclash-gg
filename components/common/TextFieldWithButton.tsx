"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MainButton } from "@/components/common/MainButton";

export interface TextFieldWithButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onSubmit'> {
  buttonContent: React.ReactNode;
  onSubmit?: (value: string) => void;
  wrapperClassName?: string;
}

const TextFieldWithButton = React.forwardRef<HTMLInputElement, TextFieldWithButtonProps>(
  ({ className, wrapperClassName, buttonContent, onSubmit, ...props }, ref) => {

    // Handler internal untuk mengurus FormEvent
    const handleInternalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const value = formData.get(props.name || "") as string;

      if (onSubmit && value?.trim() !== "") {
        onSubmit(value);
      }
    };

    return (
      <div
        className={cn(
          "flex items-center bg-white rounded-xl p-1.5 border border-gray-300 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all shadow-sm",
          wrapperClassName,
        )}
      >
        <input
          ref={ref}
          className={cn(
            "flex-1 min-w-0 bg-transparent px-4 py-2 outline-none text-gray-700 font-semibold placeholder-gray-300 text-sm md:text-base truncate",
            className,
          )}
          {...props}
        />
        <MainButton
          type="submit"
          variant="blue"
          className="shrink-0 rounded-lg px-4 md:px-8 h-8 md:h-10 text-sm md:text-base font-bold"
          disabled={props.disabled}
        >
          {buttonContent}
        </MainButton>
      </div>
    );
  },
);

TextFieldWithButton.displayName = "TextFieldWithButton";

export { TextFieldWithButton };