import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Copy, Trash2, Archive, Edit, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RowActionsMenu({ onDuplicate, onDelete, onArchive, onEdit, onOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleAction = (action, e) => {
    e.stopPropagation();
    action?.();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "p-1.5 rounded-md transition-all",
          "hover:bg-gray-100 active:bg-gray-200",
          isOpen && "bg-gray-100"
        )}
      >
        <MoreHorizontal className="h-4 w-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-200">
          {onOpen && (
            <button
              onClick={(e) => handleAction(onOpen, e)}
              className="w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => handleAction(onEdit, e)}
              className="w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={(e) => handleAction(onDuplicate, e)}
              className="w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </button>
          )}
          {onArchive && (
            <button
              onClick={(e) => handleAction(onArchive, e)}
              className="w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Archive className="h-4 w-4" />
              Archive
            </button>
          )}
          {onDelete && (
            <>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={(e) => handleAction(onDelete, e)}
                className="w-full px-3 py-2 text-left text-sm font-medium text-[#761B14] hover:bg-[#761B14]/5 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
