import * as React from "react";
import { cn } from "@/lib/utils";

interface SimpleRadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const SimpleRadioGroup = React.forwardRef<HTMLDivElement, SimpleRadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    const handleChange = (newValue: string) => {
      onValueChange?.(newValue);
    };

    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        role="radiogroup"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              // @ts-ignore
              selected: child.props.value === value,
              // @ts-ignore
              onSelect: () => handleChange(child.props.value),
            });
          }
          return child;
        })}
      </div>
    );
  }
);

SimpleRadioGroup.displayName = "SimpleRadioGroup";

interface SimpleRadioItemProps {
  value: string;
  id?: string;
  className?: string;
  selected?: boolean;
  onSelect?: () => void;
  children?: React.ReactNode;
}

export const SimpleRadioItem = React.forwardRef<HTMLDivElement, SimpleRadioItemProps>(
  ({ className, value, id, selected, onSelect, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        id={id}
        className={cn(
          "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
          selected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50",
          className
        )}
        onClick={onSelect}
        role="radio"
        aria-checked={selected}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.();
          }
        }}
        {...props}
      >
        <div
          className={cn(
            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
            selected ? "border-primary" : "border-gray-300"
          )}
        >
          {selected && (
            <div className="w-2 h-2 rounded-full bg-primary" />
          )}
        </div>
        {children}
      </div>
    );
  }
);

SimpleRadioItem.displayName = "SimpleRadioItem";