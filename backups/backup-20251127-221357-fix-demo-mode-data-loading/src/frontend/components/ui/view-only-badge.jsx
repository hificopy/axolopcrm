import { Eye } from 'lucide-react';

export default function ViewOnlyBadge({ className = '', size = 'default' }) {
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    default: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-2'
  };

  const iconSizes = {
    small: 'h-3 w-3',
    default: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-gray-700/50 text-gray-300 border border-gray-600 rounded font-medium ${sizeClasses[size]} ${className}`}
      title="You have read-only access to this page"
    >
      <Eye className={iconSizes[size]} />
      View Only
    </span>
  );
}
