import * as React from "react";

import { cn } from "lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md px-3 py-2 text-sm",
          "bg-white dark:bg-zinc-950",
          "border border-zinc-200 dark:border-zinc-800",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "ring-offset-white focus-visible:ring-offset-2 dark:ring-offset-zinc-950",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950",
          "dark:focus-visible:ring-zinc-300",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
