/**
 * Activity Log Component
 * Displays audit trail of agency activities
 */

import { useState, useEffect, useCallback } from 'react';
import { useAgency } from '../../context/AgencyContext';
import api from '../../lib/api';
import {
  Activity,
  User,
  Building2,
  Shield,
  UserPlus,
  UserMinus,
  Settings,
  Mail,
  Phone,
  Calendar,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  ChevronDown,
  Search
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Action icons mapping
const ACTION_ICONS = {
  agency_created: Building2,
  agency_updated: Settings,
  agency_deleted: Building2,
  member_invited: UserPlus,
  member_joined: UserPlus,
  member_removed: UserMinus,
  member_role_changed: Shield,
  role_created: Shield,
  role_updated: Shield,
  role_deleted: Shield,
  role_assigned: Shield,
  lead_created: TrendingUp,
  lead_updated: TrendingUp,
  lead_deleted: TrendingUp,
  contact_created: User,
  contact_updated: User,
  opportunity_created: TrendingUp,
  opportunity_won: CheckCircle,
  opportunity_lost: AlertCircle,
  email_sent: Mail,
  call_made: Phone,
  meeting_scheduled: Calendar,
  form_created: FileText,
  user_login: User,
  default: Activity
};

// Severity colors
const SEVERITY_COLORS = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  critical: 'bg-red-200 text-red-900'
};

// Action colors
const ACTION_COLORS = {
  created: 'text-green-600',
  updated: 'text-blue-600',
  deleted: 'text-red-600',
  joined: 'text-green-600',
  removed: 'text-red-600',
  won: 'text-green-600',
  lost: 'text-red-600',
  default: 'text-gray-600'
};

function getActionColor(action) {
  const actionParts = action.split('_');
  const lastPart = actionParts[actionParts.length - 1];
  return ACTION_COLORS[lastPart] || ACTION_COLORS.default;
}

function getActionIcon(action) {
  return ACTION_ICONS[action] || ACTION_ICONS.default;
}

function formatAction(action) {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ActivityLog({ limit = 50, compact = false, showFilters = true }) {
  const { currentAgency } = useAgency();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    severity: '',
    startDate: '',
    endDate: ''
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = useCallback(async () => {
    if (!currentAgency?.id) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('limit', limit);
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entity_type', filters.entityType);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);

      const response = await api.get(`/api/v1/audit/logs?${params.toString()}`, {
        headers: { 'X-Agency-ID': currentAgency.id }
      });

      if (response.data.success) {
        setLogs(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [currentAgency?.id, limit, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(query) ||
      log.entity_name?.toLowerCase().includes(query) ||
      log.entity_type?.toLowerCase().includes(query) ||
      log.user?.full_name?.toLowerCase().includes(query) ||
      log.user?.email?.toLowerCase().includes(query)
    );
  });

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchLogs}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'bg-white rounded-lg border border-gray-200'}>
      {/* Header */}
      {!compact && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
            </div>
            <div className="flex items-center gap-2">
              {showFilters && (
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border ${
                    showFilterPanel ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
                </button>
              )}
              <button
                onClick={fetchLogs}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Action</label>
                  <select
                    value={filters.action}
                    onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
                  >
                    <option value="">All Actions</option>
                    <option value="member_invited">Member Invited</option>
                    <option value="member_joined">Member Joined</option>
                    <option value="member_removed">Member Removed</option>
                    <option value="role_assigned">Role Assigned</option>
                    <option value="agency_updated">Agency Updated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Entity Type</label>
                  <select
                    value={filters.entityType}
                    onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
                  >
                    <option value="">All Types</option>
                    <option value="agency">Agency</option>
                    <option value="member">Member</option>
                    <option value="role">Role</option>
                    <option value="invite">Invite</option>
                    <option value="lead">Lead</option>
                    <option value="contact">Contact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
                  >
                    <option value="">All Levels</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setFilters({ action: '', entityType: '', severity: '', startDate: '', endDate: '' })}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity List */}
      <div className={compact ? '' : 'divide-y divide-gray-100'}>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No activity logs found</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const ActionIcon = getActionIcon(log.action);
            const actionColor = getActionColor(log.action);

            return (
              <div
                key={log.id}
                className={`flex items-start gap-3 ${compact ? 'py-3' : 'px-6 py-4 hover:bg-gray-50'}`}
              >
                {/* Icon */}
                <div className={`p-2 rounded-lg bg-gray-100 ${actionColor}`}>
                  <ActionIcon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${actionColor}`}>
                      {formatAction(log.action)}
                    </span>
                    {log.severity && log.severity !== 'info' && (
                      <span className={`px-1.5 py-0.5 text-xs rounded ${SEVERITY_COLORS[log.severity]}`}>
                        {log.severity}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-0.5">
                    {log.entity_name && (
                      <span className="font-medium">{log.entity_name}</span>
                    )}
                    {log.entity_type && (
                      <span className="text-gray-400"> ({log.entity_type})</span>
                    )}
                  </p>

                  {/* Details */}
                  {log.details && Object.keys(log.details).length > 0 && !compact && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                      {Object.entries(log.details).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          <span className="text-gray-400">{key}:</span> {String(value)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* User and Time */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {log.user && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.user.full_name || log.user.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {!compact && filteredLogs.length >= limit && (
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Load more activities
          </button>
        </div>
      )}
    </div>
  );
}
