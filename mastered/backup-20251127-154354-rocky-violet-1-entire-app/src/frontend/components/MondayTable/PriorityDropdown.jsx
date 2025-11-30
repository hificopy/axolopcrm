import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: '#761B14', icon: '⚠️' },
  { value: 'high', label: 'High', color: '#e44258', icon: null },
  { value: 'medium', label: 'Medium', color: '#fdab3d', icon: null },
  { value: 'low', label: 'Low', color: '#2563eb', icon: null },
  { value: 'tof', label: 'TOF', color: '#ff5ac4', icon: null },
  { value: 'mof', label: 'MOF', color: '#00d1ff', icon: null },
  { value: 'bof', label: 'BOF (off grid)', color: '#c59217', icon: null },
];

export default function PriorityDropdown({ value, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const normalizedValue = value?.toString().toLowerCase() || 'medium';
  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === normalizedValue) || PRIORITY_OPTIONS[2];

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
          "px-3 py-1.5 rounded-md font-medium text-sm transition-all flex items-center gap-1.5",
          "hover:opacity-90 hover:shadow-sm",
          !disabled && "cursor-pointer",
          disabled && "cursor-default opacity-60"
        )}
        style={{
          backgroundColor: currentPriority.color,
          color: 'white',
        }}
      >
        {currentPriority.icon && <span>{currentPriority.icon}</span>}
        {currentPriority.label}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
          {PRIORITY_OPTIONS.map((option) => (
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
                className="px-3 py-1 rounded-md flex items-center gap-1.5 flex-1 justify-center transition-all group-hover:shadow-sm"
                style={{
                  backgroundColor: option.color,
                  color: 'white',
                }}
              >
                {option.icon && <span>{option.icon}</span>}
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
