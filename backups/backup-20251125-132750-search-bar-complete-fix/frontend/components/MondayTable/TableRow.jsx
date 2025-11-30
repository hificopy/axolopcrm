import { cn } from '@/lib/utils';
import { renderCell } from './ColumnTypes';
import RowActionsMenu from './RowActionsMenu';
import { Check } from 'lucide-react';

/**
 * Production-ready table row with perfect visuals matching Monday.com
 */
export default function TableRow({
  row,
  columns,
  onRowClick,
  onCellEdit,
  onCommentClick,
  onDuplicate,
  onDelete,
  onArchive,
  selected = false,
  onSelect,
  showActions = true,
  showCheckbox = true,
}) {
  const handleClick = () => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleCellEdit = (columnKey, value) => {
    if (onCellEdit) {
      onCellEdit(row.id, columnKey, value);
    }
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onSelect?.(row.id);
  };

  return (
    <div
      className={cn(
        'group flex items-stretch border-b border-gray-100 transition-all duration-150',
        'hover:bg-gray-50/80',
        selected && 'bg-blue-50/50 hover:bg-blue-50/70',
        onRowClick && 'cursor-pointer'
      )}
      onClick={handleClick}
    >
      {/* Checkbox column */}
      {showCheckbox && (
        <div className="flex items-center justify-center px-3 border-r border-gray-100">
          <button
            onClick={handleCheckboxClick}
            className={cn(
              'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
              'hover:border-[#761B14]',
              selected
                ? 'bg-[#761B14] border-[#761B14]'
                : 'border-gray-300 bg-white'
            )}
          >
            {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </button>
        </div>
      )}

      {/* Data columns */}
      {columns.map((column, index) => (
        <div
          key={column.key}
          className={cn(
            'flex items-center px-4 py-2.5 border-r border-gray-100',
            column.width ? `w-[${column.width}px] flex-shrink-0` : 'flex-1 min-w-[120px]'
          )}
          style={column.width ? { width: column.width } : {}}
          onClick={(e) => {
            // Prevent row click when interacting with editable cells
            if (column.editable || column.type === 'comments') {
              e.stopPropagation();
            }
          }}
        >
          {renderCell(row, column, handleCellEdit, onCommentClick)}
        </div>
      ))}

      {/* Row actions menu */}
      {showActions && (
        <div className="flex items-center justify-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <RowActionsMenu
            onDuplicate={onDuplicate ? () => onDuplicate(row) : null}
            onDelete={onDelete ? () => onDelete(row) : null}
            onArchive={onArchive ? () => onArchive(row) : null}
            onOpen={onRowClick ? () => onRowClick(row) : null}
          />
        </div>
      )}
    </div>
  );
}
