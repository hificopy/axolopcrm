import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency (USD)
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date relative to now (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format date (e.g., "Jan 15, 2025")
 */
export function formatDate(date, options = {}) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

/**
 * Get initials from name (for avatars)
 */
export function getInitials(name) {
  if (!name) return '??';

  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a random color for avatars
 */
export function generateAvatarColor(name) {
  const colors = [
    'bg-red-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Truncate text to specified length
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Validate email address
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }

  return phone;
}

/**
 * Sleep utility for delays
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get deal stage color
 */
export function getDealStageColor(stage) {
  const colors = {
    'New': 'badge-gray',
    'Contacted': 'badge-blue',
    'Qualified': 'badge-yellow',
    'Proposal': 'badge-blue',
    'Negotiation': 'badge-yellow',
    'Won': 'badge-green',
    'Lost': 'badge-red',
  };

  return colors[stage] || 'badge-gray';
}

/**
 * Get lead status color
 */
export function getLeadStatusColor(status) {
  const colors = {
    'NEW': 'badge-blue',
    'CONTACTED': 'badge-yellow',
    'QUALIFIED': 'badge-green',
    'UNQUALIFIED': 'badge-gray',
    'CONVERTED': 'badge-green',
  };

  return colors[status] || 'badge-gray';
}

/**
 * Calculate deal probability based on stage
 */
export function calculateDealProbability(stage) {
  const probabilities = {
    'New': 10,
    'Contacted': 20,
    'Qualified': 40,
    'Proposal': 60,
    'Negotiation': 80,
    'Won': 100,
    'Lost': 0,
  };

  return probabilities[stage] || 0;
}

/**
 * Get date range for dashboard based on time range
 */
export function getDateRange(timeRange) {
  const now = new Date();
  let startDate, endDate;

  switch (timeRange) {
    case 'week':
      // Get start of current week (Sunday)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);

      // Get end of current week (Saturday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'month':
      // Get start of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get end of current month
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'quarter': {
      // Get current quarter
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);

      // Get end of quarter
      endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    }

    case 'year':
      // Get start of current year
      startDate = new Date(now.getFullYear(), 0, 1);

      // Get end of current year
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  return { startDate, endDate };
}

/**
 * Format date range for display
 */
export function formatDateRange(timeRange) {
  const { startDate, endDate } = getDateRange(timeRange);
  const now = new Date();

  switch (timeRange) {
    case 'week':
      // "Nov 10 - Nov 16, 2024"
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
      } else {
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }

    case 'month':
      // "November 2024"
      return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    case 'quarter': {
      // "Q4 2024 (Oct - Dec)"
      const quarter = Math.floor(startDate.getMonth() / 3) + 1;
      const quarterMonths = `${startDate.toLocaleDateString('en-US', { month: 'short' })} - ${endDate.toLocaleDateString('en-US', { month: 'short' })}`;
      return `Q${quarter} ${startDate.getFullYear()} (${quarterMonths})`;
    }

    case 'year':
      // "2024"
      return startDate.getFullYear().toString();

    default:
      return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}

/**
 * Get period label for dashboard
 */
export function getPeriodLabel(timeRange) {
  switch (timeRange) {
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    case 'quarter':
      return 'This Quarter';
    case 'year':
      return 'This Year';
    default:
      return 'Current Period';
  }
}
