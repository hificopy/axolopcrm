import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'done', label: 'Done', color: '#00c875' },
  { value: 'completed', label: 'Completed', color: '#00c875' },
  { value: 'working on it', label: 'Working on it', color: '#fdab3d' },
  { value: 'in progress', label: 'In Progress', color: '#fdab3d' },
  { value: 'stuck', label: 'Stuck', color: '#e44258' },
  { value: 'not started', label: 'Not Started', color: '#c4c4c4' },
  { value: 'published', label: 'Published', color: '#0073ea' },
  { value: 'pending', label: 'Pending', color: '#ffcb00' },
];

export default function StatusDropdown({ value, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const normalizedValue = value?.toString().toLowerCase() || 'not started';
  const currentStatus = STATUS_OPTIONS.find(s => s.value === normalizedValue) || STATUS_OPTIONS[5];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={cn(
          "px-3 py-1.5 rounded-md font-medium text-sm transition-all",
          "hover:opacity-90 hover:shadow-sm",
          !disabled && "cursor-pointer",
          disabled && "cursor-default opacity-60"
        )}
        style={{
          backgroundColor: currentStatus.color,
          color: currentStatus.value === 'pending' ? '#333' : 'white',
        }}
      >
        {currentStatus.label}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option);
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-sm font-medium transition-colors",
                "hover:bg-gray-50 flex items-center justify-between group"
              )}
            >
              <span
                className="px-3 py-1 rounded-md flex-1 text-center transition-all group-hover:shadow-sm"
                style={{
                  backgroundColor: option.color,
                  color: option.value === 'pending' ? '#333' : 'white',
                }}
              >
                {option.label}
              </span>
              {option.value === normalizedValue && (
                <Check className="h-4 w-4 text-[#761B14] ml-2 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
