import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Universal Context Menu Component
 * Apple-inspired design with white background, black text, smooth animations
 * Works across all CRM pages with context-aware actions
 */
export default function ContextMenu({
  children,
  items = [],
  trigger = "right-click",
  disabled = false,
  className = "",
  menuClassName = "",
  onOpen,
  onClose,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const containerRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  // Adjust position if menu goes off-screen
  const adjustPosition = useCallback((x, y) => {
    if (!menuRef.current) return { x, y };

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 8;
    }
    if (adjustedX < 8) {
      adjustedX = 8;
    }

    // Adjust vertical position
    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 8;
    }
    if (adjustedY < 8) {
      adjustedY = 8;
    }

    return { x: adjustedX, y: adjustedY };
  }, []);

  const openMenu = useCallback(
    (clientX, clientY) => {
      if (disabled) return;

      const adjustedPosition = adjustPosition(clientX, clientY);
      setPosition(adjustedPosition);
      setIsOpen(true);
      onOpen?.();
    },
    [disabled, adjustPosition, onOpen],
  );

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const handleContextMenu = useCallback(
    (event) => {
      if (trigger === "right-click") {
        event.preventDefault();
        openMenu(event.clientX, event.clientY);
      }
    },
    [trigger, openMenu],
  );

  const handleClick = useCallback(
    (event) => {
      if (trigger === "click") {
        event.preventDefault();
        openMenu(event.clientX, event.clientY);
      }
    },
    [trigger, openMenu],
  );

  const handleAction = useCallback(
    (action, item) => {
      event?.stopPropagation();
      action?.(item);
      closeMenu();
    },
    [closeMenu],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event) => {
      if (!isOpen) return;

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
            currentIndex === 0
              ? focusableElements.length - 1
              : currentIndex - 1;
          focusableElements[nextIndex]?.focus();
          break;
        case "Enter":
          event.preventDefault();
          document.activeElement?.click();
          break;
      }
    },
    [isOpen],
  );

  const menuContent = isOpen
    ? createPortal(
        <div
          ref={menuRef}
          className={cn(
            // Base styles
            "fixed z-[9999] min-w-[180px] max-w-[300px]",
            // Apple-inspired design
            "bg-white/95 backdrop-blur-xl border border-gray-200/50",
            "shadow-2xl shadow-gray-900/10",
            "rounded-lg overflow-hidden",
            // Smooth animations
            "animate-in fade-in slide-in-from-top-2 duration-200 ease-out",
            // Custom styles
            menuClassName,
          )}
          style={{
            left: position.x,
            top: position.y,
          }}
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
                  onClick={(e) => handleAction(item.action, item)}
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
                        item.badgeVariant === "error" &&
                          "bg-red-100 text-red-700",
                        item.badgeVariant === "info" &&
                          "bg-blue-100 text-blue-700",
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
        </div>,
        document.body,
      )
    : null;

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block", className)}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      <div ref={triggerRef}>{children}</div>
      {menuContent}
    </div>
  );
}

// Helper function to create common menu items
export const createMenuItem = (config) => ({
  key: config.key,
  label: config.label,
  description: config.description,
  icon: config.icon,
  action: config.action,
  disabled: config.disabled,
  variant: config.variant,
  shortcut: config.shortcut,
  badge: config.badge,
  badgeVariant: config.badgeVariant,
});

// Helper function to create divider
export const createDivider = () => ({ type: "divider" });

// Helper function to create header
export const createHeader = (label) => ({ type: "header", label });
