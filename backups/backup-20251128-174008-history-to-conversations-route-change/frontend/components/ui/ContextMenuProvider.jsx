import { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import ContextMenuContent from "./ContextMenuContent";
import { createMenuItem, createDivider, createHeader } from "./ContextMenu";
import {
  Eye,
  Edit,
  Target,
  User,
  Mail,
  Phone,
  CheckSquare,
  Copy,
  Archive,
  Trash2,
  DollarSign,
  FileText,
  RefreshCw,
  Download,
  Share,
  Play,
  ArrowRight,
} from "lucide-react";

const ContextMenuContext = createContext(null);

/**
 * Global Context Menu Provider
 * Manages context menus across the entire application
 */
export function ContextMenuProvider({ children }) {
  const [activeMenu, setActiveMenu] = useState(null);

  const showContextMenu = useCallback((config) => {
    setActiveMenu({
      id: Date.now() + Math.random(),
      ...config,
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setActiveMenu(null);
  }, []);

  const contextValue = {
    showContextMenu,
    hideContextMenu,
    isActive: !!activeMenu,
  };

  const menuContent = activeMenu
    ? createPortal(
        <div
          style={{
            position: "fixed",
            left: activeMenu.position?.x || 0,
            top: activeMenu.position?.y || 0,
            zIndex: 9999,
          }}
        >
          <ContextMenuContent
            items={activeMenu.items}
            onClose={hideContextMenu}
            menuClassName={activeMenu.menuClassName}
          />
        </div>,
        document.body,
      )
    : null;

  return (
    <ContextMenuContext.Provider value={contextValue}>
      {children}
      {menuContent}
    </ContextMenuContext.Provider>
  );
}

/**
 * Hook to use context menu functionality
 */
export function useContextMenu() {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error("useContextMenu must be used within ContextMenuProvider");
  }

  return context;
}

/**
 * Higher-order component to add context menu to any element
 */
export function withContextMenu(Component, menuConfig) {
  return function ContextMenuWrapper(props) {
    const { showContextMenu } = useContextMenu();

    const handleContextMenu = useCallback(
      (event, data) => {
        event.preventDefault();

        const items =
          typeof menuConfig === "function"
            ? menuConfig(data, props)
            : menuConfig;

        showContextMenu({
          items,
          position: { x: event.clientX, y: event.clientY },
          data,
          ...props,
        });
      },
      [showContextMenu, props],
    );

    return (
      <div onContextMenu={handleContextMenu}>
        <Component {...props} />
      </div>
    );
  };
}

/**
 * Pre-built menu configurations for common CRM actions
 */
export const CRMMenuConfigs = {
  // Lead-specific context menu
  lead: (
    lead,
    {
      onEdit,
      onDelete,
      onDuplicate,
      onArchive,
      onConvert,
      onEmail,
      onCall,
      onAddTask,
    },
  ) => [
    createHeader("Lead Actions"),
    createMenuItem({
      key: "view",
      label: "View Details",
      icon: Eye,
      action: () => onEdit?.(lead),
    }),
    createMenuItem({
      key: "edit",
      label: "Edit Lead",
      icon: Edit,
      action: () => onEdit?.(lead),
      shortcut: "E",
    }),
    createDivider(),
    createMenuItem({
      key: "convert",
      label: "Convert to Opportunity",
      description: "Create opportunity from this lead",
      icon: Target,
      action: () => onConvert?.(lead),
      badge: "Pro",
      badgeVariant: "info",
    }),
    createMenuItem({
      key: "contact",
      label: "Create Contact",
      description: "Add as contact",
      icon: User,
      action: () => onConvert?.(lead, "contact"),
    }),
    createDivider(),
    createMenuItem({
      key: "email",
      label: "Send Email",
      icon: Mail,
      action: () => onEmail?.(lead),
      shortcut: "M",
    }),
    createMenuItem({
      key: "call",
      label: "Log Call",
      icon: Phone,
      action: () => onCall?.(lead),
    }),
    createMenuItem({
      key: "task",
      label: "Add Task",
      icon: CheckSquare,
      action: () => onAddTask?.(lead),
    }),
    createDivider(),
    createMenuItem({
      key: "duplicate",
      label: "Duplicate Lead",
      icon: Copy,
      action: () => onDuplicate?.(lead),
    }),
    createMenuItem({
      key: "archive",
      label: "Archive Lead",
      icon: Archive,
      action: () => onArchive?.(lead),
    }),
    createDivider(),
    createMenuItem({
      key: "delete",
      label: "Delete Lead",
      description: "This action cannot be undone",
      icon: Trash2,
      action: () => onDelete?.(lead),
      variant: "destructive",
      shortcut: "⌘⌫",
    }),
  ],

  // Contact-specific context menu
  contact: (
    contact,
    { onEdit, onDelete, onDuplicate, onEmail, onCall, onAddTask, onViewDeals },
  ) => [
    createHeader("Contact Actions"),
    createMenuItem({
      key: "view",
      label: "View Details",
      icon: Eye,
      action: () => onEdit?.(contact),
    }),
    createMenuItem({
      key: "edit",
      label: "Edit Contact",
      icon: Edit,
      action: () => onEdit?.(contact),
      shortcut: "E",
    }),
    createDivider(),
    createMenuItem({
      key: "deals",
      label: "View Deals",
      description: `See all deals for ${contact.first_name}`,
      icon: DollarSign,
      action: () => onViewDeals?.(contact),
      badge: contact.deal_count || "0",
    }),
    createDivider(),
    createMenuItem({
      key: "email",
      label: "Send Email",
      icon: Mail,
      action: () => onEmail?.(contact),
      shortcut: "M",
    }),
    createMenuItem({
      key: "call",
      label: "Log Call",
      icon: Phone,
      action: () => onCall?.(contact),
    }),
    createMenuItem({
      key: "task",
      label: "Add Task",
      icon: CheckSquare,
      action: () => onAddTask?.(contact),
    }),
    createDivider(),
    createMenuItem({
      key: "duplicate",
      label: "Duplicate Contact",
      icon: Copy,
      action: () => onDuplicate?.(contact),
    }),
    createDivider(),
    createMenuItem({
      key: "delete",
      label: "Delete Contact",
      description: "This action cannot be undone",
      icon: Trash2,
      action: () => onDelete?.(contact),
      variant: "destructive",
      shortcut: "⌘⌫",
    }),
  ],

  // Deal/Opportunity-specific context menu
  deal: (
    deal,
    { onEdit, onDelete, onDuplicate, onMoveStage, onViewActivities, onAddNote },
  ) => [
    createHeader("Deal Actions"),
    createMenuItem({
      key: "view",
      label: "View Details",
      icon: Eye,
      action: () => onEdit?.(deal),
    }),
    createMenuItem({
      key: "edit",
      label: "Edit Deal",
      icon: Edit,
      action: () => onEdit?.(deal),
      shortcut: "E",
    }),
    createDivider(),
    createMenuItem({
      key: "move-stage",
      label: "Move to Stage",
      description: "Change deal stage",
      icon: ArrowRight,
      action: () => onMoveStage?.(deal),
    }),
    createMenuItem({
      key: "activities",
      label: "View Activities",
      description: "See all activities and notes",
      icon: FileText,
      action: () => onViewActivities?.(deal),
    }),
    createMenuItem({
      key: "add-note",
      label: "Add Note",
      icon: FileText,
      action: () => onAddNote?.(deal),
      shortcut: "N",
    }),
    createDivider(),
    createMenuItem({
      key: "duplicate",
      label: "Duplicate Deal",
      icon: Copy,
      action: () => onDuplicate?.(deal),
    }),
    createDivider(),
    createMenuItem({
      key: "delete",
      label: "Delete Deal",
      description: "This action cannot be undone",
      icon: Trash2,
      action: () => onDelete?.(deal),
      variant: "destructive",
      shortcut: "⌘⌫",
    }),
  ],

  // Dashboard widget context menu
  widget: (widget, { onEdit, onDuplicate, onRemove, onExport, onRefresh }) => [
    createHeader("Widget Actions"),
    createMenuItem({
      key: "edit",
      label: "Edit Widget",
      icon: Edit,
      action: () => onEdit?.(widget),
      shortcut: "E",
    }),
    createMenuItem({
      key: "refresh",
      label: "Refresh Data",
      icon: RefreshCw,
      action: () => onRefresh?.(widget),
      shortcut: "R",
    }),
    createMenuItem({
      key: "export",
      label: "Export Data",
      icon: Download,
      action: () => onExport?.(widget),
    }),
    createDivider(),
    createMenuItem({
      key: "duplicate",
      label: "Duplicate Widget",
      icon: Copy,
      action: () => onDuplicate?.(widget),
    }),
    createMenuItem({
      key: "remove",
      label: "Remove Widget",
      description: "Remove from dashboard",
      icon: Trash2,
      action: () => onRemove?.(widget),
      variant: "destructive",
    }),
  ],

  // Form-specific context menu
  form: (
    form,
    { onEdit, onDelete, onDuplicate, onPreview, onShare, onViewSubmissions },
  ) => [
    createHeader("Form Actions"),
    createMenuItem({
      key: "edit",
      label: "Edit Form",
      icon: Edit,
      action: () => onEdit?.(form),
      shortcut: "E",
    }),
    createMenuItem({
      key: "preview",
      label: "Preview Form",
      icon: Eye,
      action: () => onPreview?.(form),
      shortcut: "P",
    }),
    createMenuItem({
      key: "share",
      label: "Share Form",
      icon: Share,
      action: () => onShare?.(form),
      shortcut: "S",
    }),
    createDivider(),
    createMenuItem({
      key: "submissions",
      label: "View Submissions",
      description: `See ${form.submission_count || 0} submissions`,
      icon: FileText,
      action: () => onViewSubmissions?.(form),
      badge: form.submission_count || "0",
    }),
    createDivider(),
    createMenuItem({
      key: "duplicate",
      label: "Duplicate Form",
      icon: Copy,
      action: () => onDuplicate?.(form),
    }),
    createDivider(),
    createMenuItem({
      key: "delete",
      label: "Delete Form",
      description: "This action cannot be undone",
      icon: Trash2,
      action: () => onDelete?.(form),
      variant: "destructive",
      shortcut: "⌘⌫",
    }),
  ],
};

// Re-export helper functions for convenience
export { createMenuItem, createDivider, createHeader };

export default ContextMenuProvider;
