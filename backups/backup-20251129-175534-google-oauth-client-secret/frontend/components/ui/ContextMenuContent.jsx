import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { createMenuItem, createDivider, createHeader } from "./ContextMenu";

/**
 * Context Menu Content Component
 * Renders the actual menu content without positioning logic
 * Used by ContextMenuProvider
 */
export default function ContextMenuContent({
  items = [],
  onClose,
  menuClassName = "",
}) {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    const focusableElements = menuRef.current?.querySelectorAll(
      'button, [tabindex]:not([tabindex="-1"])',
    );

    if (!focusableElements?.length) return;

    const currentIndex = Array.from(focusableElements).indexOf(
      document.activeElement,
    );
    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        nextIndex =
          currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        focusableElements[nextIndex]?.focus();
        break;
      case "Enter":
        event.preventDefault();
        document.activeElement?.click();
        break;
    }
  }, []);

  const handleAction = useCallback(
    (action, item, event) => {
      event?.stopPropagation();
      action?.(item);
      onClose?.();
    },
    [onClose],
  );

  return (
    <div
      ref={menuRef}
      className={cn(
        // Base styles
        "min-w-[180px] max-w-[300px]",
        // Apple-inspired design
        "bg-white/95 backdrop-blur-xl border border-gray-200/50",
        "shadow-2xl shadow-gray-900/10",
        "rounded-lg overflow-hidden",
        // Smooth animations
        "animate-in fade-in slide-in-from-top-2 duration-200 ease-out",
        // Custom styles
        menuClassName,
      )}
      onKeyDown={handleKeyDown}
    >
      <div className="py-1">
        {items.map((item, index) => {
          if (item.type === "divider") {
            return (
              <div
                key={`divider-${index}`}
                className="my-1 h-px bg-gray-200/60 mx-2"
              />
            );
          }

          if (item.type === "header") {
            return (
              <div
                key={`header-${index}`}
                className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {item.label}
              </div>
            );
          }

          const Icon = item.icon;
          const isDestructive = item.variant === "destructive";
          const isDisabled = item.disabled;

          return (
            <button
              key={item.key || index}
              onClick={(e) => handleAction(item.action, item, e)}
              disabled={isDisabled}
              className={cn(
                // Base button styles
                "w-full px-3 py-2 text-left text-sm font-medium",
                "flex items-center gap-3 transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset",
                // Default state
                "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900",
                // Disabled state
                isDisabled && "text-gray-400 cursor-not-allowed opacity-50",
                // Destructive state
                isDestructive &&
                  !isDisabled &&
                  "text-red-600 hover:bg-red-50/80 hover:text-red-700",
                // Active state
                "active:scale-[0.98]",
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isDisabled && "text-gray-400",
                    isDestructive && !isDisabled && "text-red-500",
                  )}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {item.description}
                  </div>
                )}
              </div>
              {item.shortcut && (
                <div className="text-xs text-gray-400 font-mono">
                  {item.shortcut}
                </div>
              )}
              {item.badge && (
                <div
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full",
                    item.badgeVariant === "success" &&
                      "bg-green-100 text-green-700",
                    item.badgeVariant === "warning" &&
                      "bg-yellow-100 text-yellow-700",
                    item.badgeVariant === "error" && "bg-red-100 text-red-700",
                    item.badgeVariant === "info" && "bg-blue-100 text-blue-700",
                    !item.badgeVariant && "bg-gray-100 text-gray-700",
                  )}
                >
                  {item.badge}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
