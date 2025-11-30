/**
 * Agency Analytics Dashboard
 * Comprehensive analytics and health metrics for agencies
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgency } from '../context/AgencyContext';
import { useIsAdmin } from '../hooks/usePermission';
import api from '../lib/api';
import ActivityLog from '../components/agency/ActivityLog';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Target,
  Zap,
  Shield,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Health score colors
const HEALTH_COLORS = {
  excellent: { bg: 'bg-green-100', text: 'text-green-700', bar: '#22c55e' },
  good: { bg: 'bg-blue-100', text: 'text-blue-700', bar: '#3b82f6' },
  fair: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: '#eab308' },
  poor: { bg: 'bg-red-100', text: 'text-red-700', bar: '#ef4444' }
};

function getHealthCategory(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function getTrendIcon(trend) {
  switch (trend) {
    case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
    default: return <Minus className="h-4 w-4 text-gray-400" />;
  }
}

// Circular Progress component
function CircularProgress({ value, size = 120, strokeWidth = 10, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="transition-all duration-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

export default function AgencyAnalytics() {
  const navigate = useNavigate();
  const { currentAgency } = useAgency();
  const { isAdmin } = useIsAdmin();

  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [dateRange, setDateRange] = useState('30');

  const fetchData = useCallback(async () => {
    if (!currentAgency?.id) return;

    setLoading(true);
    try {
      const [healthRes, summaryRes, analyticsRes] = await Promise.all([
        api.get('/api/v1/audit/health', {
          headers: { 'X-Agency-ID': currentAgency.id }
        }),
        api.get(`/api/v1/audit/summary?days=${dateRange}`, {
          headers: { 'X-Agency-ID': currentAgency.id }
        }),
        api.get(`/api/v1/audit/analytics?days=${dateRange}`, {
          headers: { 'X-Agency-ID': currentAgency.id }
        })
      ]);

      if (healthRes.data.success) setHealth(healthRes.data.data);
      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [currentAgency?.id, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Prepare chart data
  const activityChartData = summary?.dailyActivity
    ? Object.entries(summary.dailyActivity)
        .map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          activities: count
        }))
        .slice(-14) // Last 14 days
    : [];

  const actionDistribution = summary?.actionCounts
    ? Object.entries(summary.actionCounts)
        .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    : [];

  const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading && !health) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const healthCategory = health ? getHealthCategory(health.overall_health) : 'fair';
  const healthColors = HEALTH_COLORS[healthCategory];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/agency-management')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Agency Management
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agency Analytics</h1>
              <p className="text-gray-600">
                Health metrics and activity insights for {currentAgency?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <button
                onClick={fetchData}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Health Score Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Health */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Agency Health</h3>
              <Heart className={`h-5 w-5 ${healthColors.text}`} />
            </div>
            <div className="flex items-center justify-center py-4">
              <CircularProgress
                value={health?.overall_health || 0}
                size={140}
                strokeWidth={12}
                color={healthColors.bar}
              />
            </div>
            <div className="text-center mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${healthColors.bg} ${healthColors.text}`}>
                {healthCategory.charAt(0).toUpperCase() + healthCategory.slice(1)}
              </span>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Activity Score */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Activity</span>
                  {getTrendIcon(health?.activity_trend)}
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {health?.activity_score || 0}
                  </span>
                  <span className="text-gray-400 text-sm mb-1">/100</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${health?.activity_score || 0}%` }}
                  />
                </div>
              </div>

              {/* Engagement Score */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Engagement</span>
                  {getTrendIcon(health?.engagement_trend)}
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {health?.engagement_score || 0}
                  </span>
                  <span className="text-gray-400 text-sm mb-1">/100</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${health?.engagement_score || 0}%` }}
                  />
                </div>
              </div>

              {/* Growth Score */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Growth</span>
                  {getTrendIcon(health?.growth_trend)}
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {health?.growth_score || 0}
                  </span>
                  <span className="text-gray-400 text-sm mb-1">/100</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${health?.growth_score || 0}%` }}
                  />
                </div>
              </div>

              {/* Retention Score */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Retention</span>
                  <Minus className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {health?.retention_score || 0}
                  </span>
                  <span className="text-gray-400 text-sm mb-1">/100</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${health?.retention_score || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Recommendations */}
        {(health?.alerts?.length > 0 || health?.recommendations?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Alerts */}
            {health?.alerts?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
                </div>
                <div className="space-y-3">
                  {health.alerts.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span className="text-sm text-yellow-800">{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {health?.recommendations?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-[#3F0D28]" />
                  <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {health.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-[#3F0D28] mt-0.5" />
                      <span className="text-sm text-blue-800">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Over Time */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Over Time</h3>
            {activityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={activityChartData}>
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="activities"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#activityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                No activity data available
              </div>
            )}
          </div>

          {/* Action Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Actions</h3>
            {actionDistribution.length > 0 ? (
              <div className="flex items-center">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={actionDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {actionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-1/2 space-y-2">
                  {actionDistribution.map((action, index) => (
                    <div key={action.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="text-sm text-gray-600 capitalize">{action.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{action.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                No action data available
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-[#3F0D28]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary?.totalActions || 0}</p>
                <p className="text-sm text-gray-500">Total Actions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.entityCounts?.member || 0}
                </p>
                <p className="text-sm text-gray-500">Member Actions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.entityCounts?.role || 0}
                </p>
                <p className="text-sm text-gray-500">Role Changes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{dateRange}</p>
                <p className="text-sm text-gray-500">Days Analyzed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button
                onClick={() => navigate('/app/activity-log')}
                className="flex items-center gap-1 text-sm text-[#3F0D28] hover:text-blue-800"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <ActivityLog limit={10} compact showFilters={false} />
        </div>
      </div>
    </div>
  );
}
