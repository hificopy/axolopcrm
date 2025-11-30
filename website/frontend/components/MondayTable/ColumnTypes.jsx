import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import StatusDropdown from './StatusDropdown';
import PriorityDropdown from './PriorityDropdown';

/**
 * Group Cell Renderer with colored dot indicator
 */
function GroupCell({ value }) {
  if (!value) return <span className="text-gray-400">-</span>;

  // Generate consistent color from string
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 55%)`;
  };

  const color = stringToColor(value);

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="font-medium text-gray-700 text-sm">{value}</span>
    </div>
  );
}

/**
 * Status Cell with interactive dropdown
 */
function StatusCell({ value, editable, onChange, columnKey }) {
  if (!editable) {
    const normalizedValue = value?.toString().toLowerCase() || 'not started';
    const statusColors = {
      done: '#00c875',
      completed: '#00c875',
      'working on it': '#fdab3d',
      'in progress': '#fdab3d',
      stuck: '#e44258',
      'not started': '#c4c4c4',
      published: '#0073ea',
      pending: '#ffcb00',
    };

    const color = statusColors[normalizedValue] || '#c4c4c4';
    const label = value || 'Not Started';

    return (
      <Badge
        className="font-medium px-3 py-1.5 rounded-md text-sm"
        style={{
          backgroundColor: color,
          color: normalizedValue === 'pending' ? '#333' : 'white',
        }}
      >
        {label}
      </Badge>
    );
  }

  return (
    <StatusDropdown
      value={value}
      onChange={(newValue) => onChange(columnKey, newValue)}
    />
  );
}

/**
 * Priority Cell with interactive dropdown
 */
function PriorityCell({ value, editable, onChange, columnKey }) {
  if (!editable) {
    const normalizedValue = value?.toString().toLowerCase() || 'medium';
    const priorityConfig = {
      critical: { bg: '#3F0D28', text: 'white', label: 'Critical', icon: '⚠️' },
      high: { bg: '#e44258', text: 'white', label: 'High', icon: null },
      medium: { bg: '#fdab3d', text: 'white', label: 'Medium', icon: null },
      low: { bg: '#2563eb', text: 'white', label: 'Low', icon: null },
      tof: { bg: '#ff5ac4', text: 'white', label: 'TOF', icon: null },
      mof: { bg: '#00d1ff', text: 'white', label: 'MOF', icon: null },
      bof: { bg: '#c59217', text: 'white', label: 'BOF (off grid)', icon: null },
    };

    const config = priorityConfig[normalizedValue] || priorityConfig.medium;

    return (
      <Badge
        className="font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 w-fit text-sm"
        style={{
          backgroundColor: config.bg,
          color: config.text,
        }}
      >
        {config.icon && <span>{config.icon}</span>}
        {config.label}
      </Badge>
    );
  }

  return (
    <PriorityDropdown
      value={value}
      onChange={(newValue) => onChange(columnKey, newValue)}
    />
  );
}

/**
 * Date Cell with overdue indicator
 */
function DateCell({ value }) {
  if (!value) return <span className="text-gray-400 text-sm">-</span>;

  const formattedDate = formatDate(value);
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = date < today && !isNaN(date);

  return (
    <div className="flex items-center gap-2">
      {isOverdue && (
        <AlertTriangle className="h-3.5 w-3.5 text-[#3F0D28] flex-shrink-0" />
      )}
      <span className={cn(
        'text-sm',
        isOverdue ? 'text-[#3F0D28] font-medium' : 'text-gray-700'
      )}>
        {formattedDate}
      </span>
    </div>
  );
}

/**
 * Person Cell with avatar
 */
function PersonCell({ value }) {
  if (!value) return <span className="text-gray-400 text-sm">-</span>;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 55%)`;
  };

  const initials = getInitials(value);
  const bgColor = stringToColor(value);

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm"
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </div>
      <span className="text-gray-700 font-medium text-sm truncate">{value}</span>
    </div>
  );
}

/**
 * Text Cell with inline editing
 */
function TextCell({ value, editable, onChange, columnKey }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');

  if (!editable) {
    return <span className="text-gray-700 text-sm font-medium">{value || '-'}</span>;
  }

  if (isEditing) {
    return (
      <Input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          setIsEditing(false);
          if (editValue !== value) {
            onChange(columnKey, editValue);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setIsEditing(false);
            if (editValue !== value) {
              onChange(columnKey, editValue);
            }
          } else if (e.key === 'Escape') {
            setEditValue(value || '');
            setIsEditing(false);
          }
        }}
        autoFocus
        className="h-8 px-2 text-sm border-[#3F0D28] focus:ring-[#3F0D28]"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span
      className="text-gray-700 text-sm font-medium cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors -ml-2"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {value || 'Click to edit'}
    </span>
  );
}

/**
 * Board Cell - simple text label
 */
function BoardCell({ value }) {
  return (
    <span className="text-gray-600 text-sm font-medium">
      {value || '-'}
    </span>
  );
}

/**
 * Comments Cell with icon and count
 */
function CommentsCell({ value, onClick }) {
  const count = parseInt(value) || 0;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "p-1.5 rounded-md transition-all relative group",
        count > 0 ? "hover:bg-gray-100" : "opacity-40"
      )}
    >
      <MessageSquare className="h-4 w-4 text-gray-600" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#3F0D28] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}

/**
 * Number Badge Cell - for items with count indicators
 */
function NumberBadgeCell({ value }) {
  if (!value || value <= 1) return null;

  return (
    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-gray-600 bg-gray-100 rounded border border-gray-300">
      {value}
    </span>
  );
}

/**
 * Main cell renderer
 */
export function renderCell(row, column, onChange, onCommentClick) {
  const value = row[column.key];
  const cellProps = {
    value,
    editable: column.editable,
    onChange,
    columnKey: column.key,
    onClick: onCommentClick,
  };

  switch (column.type) {
    case 'status':
      return <StatusCell {...cellProps} />;
    case 'priority':
      return <PriorityCell {...cellProps} />;
    case 'group':
      return <GroupCell {...cellProps} />;
    case 'date':
      return <DateCell {...cellProps} />;
    case 'person':
      return <PersonCell {...cellProps} />;
    case 'board':
      return <BoardCell {...cellProps} />;
    case 'comments':
      return <CommentsCell {...cellProps} />;
    case 'numberBadge':
      return <NumberBadgeCell {...cellProps} />;
    case 'text':
    default:
      return <TextCell {...cellProps} />;
  }
}

// Export individual cell components
export {
  StatusCell,
  PriorityCell,
  GroupCell,
  DateCell,
  PersonCell,
  TextCell,
  BoardCell,
  CommentsCell,
  NumberBadgeCell,
};
