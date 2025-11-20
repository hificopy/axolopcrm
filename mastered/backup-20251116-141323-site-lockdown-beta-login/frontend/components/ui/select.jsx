import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from 'lucide-react';

const Select = ({ children, value, onValueChange, defaultValue, ...props }) => {
  const [currentValue, setCurrentValue] = React.useState(defaultValue || '');
  
  const contextValue = {
    value: value || currentValue,
    onValueChange: onValueChange || setCurrentValue,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectContext = React.createContext();

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-crm-border bg-white px-3 py-2 text-sm",
        "ring-offset-white placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children || <span className="text-gray-400">Select an option</span>}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-crm-border bg-white shadow-md",
        "animate-in fade-in-80",
        className
      )}
      {...props}
    >
      <div className="relative p-1">{children}</div>
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, value: itemValue, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "hover:bg-gray-100 focus:bg-gray-100",
        className
      )}
      onClick={() => {
        if (context && context.onValueChange) {
          context.onValueChange(itemValue);
        }
      }}
      {...props}
    >
      <span className="block truncate pl-2">{children}</span>
    </div>
  );
});
SelectItem.displayName = "SelectItem";

const SelectValue = ({ className, ...props }) => {
  const context = React.useContext(SelectContext);
  
  return (
    <span className={className} {...props}>
      {context?.value || props.placeholder}
    </span>
  );
};
SelectValue.displayName = "SelectValue";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };