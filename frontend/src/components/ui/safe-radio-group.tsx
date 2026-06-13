import * as React from "react";
import { RadioGroup, RadioGroupItem } from "./radio-group";

interface SafeRadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroup> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const SafeRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroup>,
  SafeRadioGroupProps
>(({ value, onValueChange, children, ...props }, ref) => {
  // Ensure value is always a string
  const safeValue = value?.toString() || "";
  
  // Wrap onValueChange to handle any errors
  const safeOnValueChange = React.useCallback((newValue: string) => {
    try {
      onValueChange?.(newValue);
    } catch (error) {
      console.warn('SafeRadioGroup: Error in onValueChange:', error);
    }
  }, [onValueChange]);

  return (
    <RadioGroup
      ref={ref}
      value={safeValue}
      onValueChange={safeOnValueChange}
      {...props}
    >
      {children}
    </RadioGroup>
  );
});

SafeRadioGroup.displayName = "SafeRadioGroup";

export { SafeRadioGroup, RadioGroupItem };