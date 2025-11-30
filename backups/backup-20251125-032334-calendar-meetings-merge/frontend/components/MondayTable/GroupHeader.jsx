import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Polished collapsible group header matching Monday.com design
 */
export default function GroupHeader({ label, count, color = '#808080', isCollapsed, onToggle }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-white',
        'border-b border-gray-200 cursor-pointer transition-all duration-200',
        'hover:from-gray-100 hover:to-gray-50',
        'sticky top-0 z-10'
      )}
      onClick={onToggle}
    >
      {/* Expand/collapse chevron */}
      <button
        className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Group color indicator */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm"
        style={{ backgroundColor: color }}
      />

      {/* Group label */}
      <span className="font-semibold text-sm text-gray-800">
        {label}
      </span>

      {/* Item count */}
      <span className="text-xs text-gray-500 font-medium ml-1">
        {count} {count === 1 ? 'item' : 'items'}
      </span>
    </div>
  );
}
