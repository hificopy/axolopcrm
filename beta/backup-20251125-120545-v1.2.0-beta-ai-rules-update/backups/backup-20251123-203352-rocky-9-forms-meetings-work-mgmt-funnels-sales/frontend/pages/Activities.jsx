import { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Download, Phone, Mail, Calendar, CheckSquare, MessageSquare, Video, FileText, X, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const ACTIVITY_TYPES = {
  CALL: { icon: Phone, label: 'Call', color: 'bg-blue-500' },
  EMAIL: { icon: Mail, label: 'Email', color: 'bg-green-500' },
  MEETING: { icon: Calendar, label: 'Meeting', color: 'bg-purple-500' },
  TASK: { icon: CheckSquare, label: 'Task', color: 'bg-orange-500' },
  NOTE: { icon: MessageSquare, label: 'Note', color: 'bg-gray-500' },
  VIDEO_CALL: { icon: Video, label: 'Video Call', color: 'bg-indigo-500' },
  OTHER: { icon: FileText, label: 'Other', color: 'bg-gray-400' },
};

export default function Activities() {
  const { toast } = useToast();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Fetch activities from API
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.get(`${API_BASE_URL}/api/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setActivities(response.data);
      setFilteredActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activities.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Filter activities based on search, type, and status
  useEffect(() => {
    let filtered = activities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(activity => activity.status === filterStatus);
    }

    setFilteredActivities(filtered);
  }, [searchTerm, filterType, filterStatus, activities]);

  const handleExport = () => {
    try {
      const csvHeaders = ['Type', 'Title', 'Description', 'Lead', 'Status', 'Due Date', 'Created'];
      const csvRows = activities.map(activity => [
        activity.type,
        activity.title,
        activity.description || '',
        activity.lead?.name || 'N/A',
        activity.status,
        activity.due_date || '',
        formatDate(activity.created_at),
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `activities-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${activities.length} activities to CSV.`,
      });
    } catch (error) {
      console.error('Error exporting activities:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export activities. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'secondary',
      'COMPLETED': 'success',
      'CANCELLED': 'destructive',
      'IN_PROGRESS': 'outline',
    };
    return colors[status] || 'default';
  };

  const calculateStats = () => {
    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.status === 'COMPLETED').length;
    const pendingActivities = activities.filter(a => a.status === 'PENDING').length;
    const todayActivities = activities.filter(a => {
      const activityDate = new Date(a.due_date || a.created_at);
      const today = new Date();
      return activityDate.toDateString() === today.toDateString();
    }).length;

    return { totalActivities, completedActivities, pendingActivities, todayActivities };
  };

  const stats = calculateStats();

  const ActivityIcon = ({ type }) => {
    const activityType = ACTIVITY_TYPES[type] || ACTIVITY_TYPES.OTHER;
    const Icon = activityType.icon;
    return (
      <div className={`p-2 rounded-lg ${activityType.color} text-white`}>
        <Icon className="h-4 w-4" />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col crm-page-wrapper bg-white">
      {/* Page Header */}
      <div className="relative bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Activities
              <span className="ml-3 text-[#791C14]">●</span>
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Track all sales activities including calls, emails, meetings, and tasks
            </p>
          </div>

          <div className="crm-button-group">
            <Button variant="outline" size="default" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button variant="default" size="default" className="gap-2 bg-[#791C14] hover:bg-[#6b1a12]">
              <Plus className="h-4 w-4" />
              <span>New Activity</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="crm-stats-grid mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-blue/10">
                <FileText className="h-5 w-5 text-primary-blue" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Activities</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{stats.totalActivities}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-green/10">
                <CheckSquare className="h-5 w-5 text-primary-green" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Completed</div>
                <div className="text-3xl font-bold text-emerald-600 mt-1">{stats.completedActivities}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-yellow/10">
                <Calendar className="h-5 w-5 text-primary-yellow" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Pending</div>
                <div className="text-3xl font-bold text-amber-600 mt-1">{stats.pendingActivities}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-[#791C14]/30 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#791C14]/10">
                <Calendar className="h-5 w-5 text-[#791C14]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#791C14] uppercase tracking-wide">Today</div>
                <div className="text-3xl font-bold text-[#791C14] mt-1">{stats.todayActivities}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mt-6">
          <div className="flex-1">
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#791C14]"
          >
            <option value="ALL">All Types</option>
            <option value="CALL">Calls</option>
            <option value="EMAIL">Emails</option>
            <option value="MEETING">Meetings</option>
            <option value="TASK">Tasks</option>
            <option value="NOTE">Notes</option>
            <option value="VIDEO_CALL">Video Calls</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#791C14]"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Activities List */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#791C14] mb-4"></div>
            <p className="text-gray-600 font-medium">Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="h-16 w-16 text-[#791C14]/30 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first activity'}
            </p>
            {!searchTerm && filterType === 'ALL' && filterStatus === 'ALL' && (
              <Button variant="default" size="default" className="gap-2 bg-[#791C14] hover:bg-[#6b1a12]">
                <Plus className="h-4 w-4" />
                <span>Add Your First Activity</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <Card
                key={activity.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedActivity(activity)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <ActivityIcon type={activity.type} />

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        </div>
                        <Badge variant={getStatusColor(activity.status)} className="ml-2">
                          {activity.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                        {activity.lead && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Lead:</span>
                            <span>{activity.lead.name}</span>
                          </div>
                        )}
                        {activity.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(activity.due_date)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Created:</span>
                          <span>{formatDate(activity.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Activity Detail Panel - Added pt-20 to avoid Chat/Tasks buttons overlap */}
      {selectedActivity && (
        <div className="fixed inset-0 sm:right-0 sm:left-auto sm:top-16 sm:bottom-0 w-full sm:w-96 bg-white dark:bg-[#1a1d24] border-l border-crm-border shadow-lg z-50 overflow-y-auto">
          <div className="p-6 pt-20">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-3">
                <ActivityIcon type={selectedActivity.type} />
                <div>
                  <h2 className="text-xl font-semibold">{selectedActivity.title}</h2>
                  <p className="text-sm text-crm-text-secondary">
                    {ACTIVITY_TYPES[selectedActivity.type]?.label || 'Activity'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedActivity(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                  Activity Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Status</span>
                    <Badge variant={getStatusColor(selectedActivity.status)}>
                      {selectedActivity.status}
                    </Badge>
                  </div>
                  {selectedActivity.due_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-crm-text-secondary">Due Date</span>
                      <span className="text-sm font-medium">{formatDate(selectedActivity.due_date)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Created</span>
                    <span className="text-sm font-medium">{formatDate(selectedActivity.created_at)}</span>
                  </div>
                  {selectedActivity.lead && (
                    <div className="flex justify-between">
                      <span className="text-sm text-crm-text-secondary">Associated Lead</span>
                      <span className="text-sm font-medium">{selectedActivity.lead.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedActivity.description && (
                <div>
                  <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                    Description
                  </h3>
                  <p className="text-sm">{selectedActivity.description}</p>
                </div>
              )}

              {selectedActivity.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                    Notes
                  </h3>
                  <p className="text-sm">{selectedActivity.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="default" className="flex-1">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
