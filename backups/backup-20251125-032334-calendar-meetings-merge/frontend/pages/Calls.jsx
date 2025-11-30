import React, { useState, useEffect } from 'react';
import {
  Phone, Search, Filter, Calendar, Clock, User,
  CheckCircle, XCircle, AlertCircle, Play, Plus,
  BarChart3, List, Grid, Download, RefreshCw
} from 'lucide-react';
import CallDialer from '../components/CallDialer';
import { useAgency } from '@/hooks/useAgency';
import ViewOnlyBadge from '@/components/ui/view-only-badge';

/**
 * Calls Page - Main interface for live calls feature
 * Insurance agent support with comprehensive call management
 */

const Calls = () => {
  const { isReadOnly, canCreate } = useAgency();

  // State
  const [activeView, setActiveView] = useState('dialer'); // dialer, history, queue, analytics
  const [calls, setCalls] = useState([]);
  const [callQueue, setCallQueue] = useState([]);
  const [currentQueueItem, setCurrentQueueItem] = useState(null);
  const [currentLead, setCurrentLead] = useState(null);
  const [currentContact, setCurrentContact] = useState(null);
  const [currentScript, setCurrentScript] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    disposition: 'all',
    dateRange: 'today',
    searchTerm: ''
  });
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadTodayStats();
    loadRecentCalls();
    loadCallQueue();
  }, []);

  // Load today's stats
  const loadTodayStats = async () => {
    try {
      const response = await fetch('/api/calls/stats/today');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTodayStats(data);
    } catch (error) {
      console.error('Error loading today stats:', error);
    }
  };

  // Load recent calls
  const loadRecentCalls = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        limit: 50,
        ...filters
      });

      const response = await fetch(`/api/calls?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCalls(data);
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load call queue
  const loadCallQueue = async () => {
    try {
      const response = await fetch('/api/call-queue/items?status=pending&limit=20');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCallQueue(data);
    } catch (error) {
      console.error('Error loading call queue:', error);
    }
  };

  // Get next call from queue
  const handleGetNextCall = async () => {
    try {
      const response = await fetch('/api/call-queue/next');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const queueItem = await response.json();

      if (!queueItem) {
        alert('No more calls in queue');
        return;
      }

      // Get recommended script
      const scriptResponse = await fetch(
        `/api/sales-scripts/recommended?leadId=${queueItem.lead_id}&scenario=default`
      );
      if (!scriptResponse.ok) {
        console.warn('Could not load recommended script');
      }
      const script = scriptResponse.ok ? await scriptResponse.json() : null;

      setCurrentQueueItem(queueItem);
      setCurrentLead(queueItem.lead);
      setCurrentContact(queueItem.contact);
      setCurrentScript(script);
      setActiveView('dialer');
    } catch (error) {
      console.error('Error getting next call:', error);
      alert('Failed to get next call');
    }
  };

  // Handle call end
  const handleCallEnd = () => {
    setCurrentQueueItem(null);
    setCurrentLead(null);
    setCurrentContact(null);
    setCurrentScript(null);
    loadTodayStats();
    loadRecentCalls();
    loadCallQueue();
  };

  // Handle disposition
  const handleDisposition = async (disposition, notes) => {
    // Reload data after disposition
    await loadTodayStats();
    await loadRecentCalls();
    await loadCallQueue();

    // Auto-load next call if in queue mode
    if (currentQueueItem) {
      setTimeout(() => {
        handleGetNextCall();
      }, 1000);
    }
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Get disposition badge color
  const getDispositionColor = (disposition) => {
    const colors = {
      interested: 'bg-green-100 text-green-800',
      not_interested: 'bg-red-100 text-red-800',
      callback: 'bg-blue-100 text-blue-800',
      voicemail: 'bg-yellow-100 text-yellow-800',
      no_answer: 'bg-gray-100 text-gray-800',
      busy: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[disposition] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Live Calls</h1>
              {isReadOnly() && <ViewOnlyBadge />}
            </div>
            <p className="text-gray-600 mt-1">
              {isReadOnly() ? 'View call history and analytics - Read-only access' : 'Manage your calls and call queue'}
            </p>
          </div>

          {canCreate() && (
            <button
              onClick={handleGetNextCall}
              className="px-6 py-3 bg-[#761B14] text-white rounded-lg hover:bg-[#5a1410] flex items-center space-x-2 shadow-lg transform hover:scale-105 transition-all"
            >
              <Play size={20} />
              <span className="font-semibold">Next Call</span>
            </button>
          )}
        </div>

        {/* Today's Stats */}
        {todayStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{todayStats.total_calls}</p>
                </div>
                <Phone className="text-gray-400" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Answered</p>
                  <p className="text-2xl font-bold text-green-600">{todayStats.answered_calls}</p>
                </div>
                <CheckCircle className="text-green-400" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Talk Time</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {todayStats.total_talk_time_minutes}m
                  </p>
                </div>
                <Clock className="text-blue-400" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Interested</p>
                  <p className="text-2xl font-bold text-green-600">{todayStats.interested_count}</p>
                </div>
                <User className="text-green-400" size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Callbacks</p>
                  <p className="text-2xl font-bold text-blue-600">{todayStats.callback_count}</p>
                </div>
                <Calendar className="text-blue-400" size={24} />
              </div>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setActiveView('dialer')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeView === 'dialer'
                ? 'text-[#761B14] border-b-2 border-[#761B14]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Phone size={18} className="inline mr-2" />
            Dialer
          </button>
          <button
            onClick={() => setActiveView('queue')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeView === 'queue'
                ? 'text-[#761B14] border-b-2 border-[#761B14]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List size={18} className="inline mr-2" />
            Queue ({callQueue.length})
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeView === 'history'
                ? 'text-[#761B14] border-b-2 border-[#761B14]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock size={18} className="inline mr-2" />
            History
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeView === 'analytics'
                ? 'text-[#761B14] border-b-2 border-[#761B14]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 size={18} className="inline mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2">
          {/* Dialer View */}
          {activeView === 'dialer' && (
            <div>
              {currentLead ? (
                <CallDialer
                  lead={currentLead}
                  contact={currentContact}
                  queueItem={currentQueueItem}
                  scriptTemplate={currentScript}
                  onCallEnd={handleCallEnd}
                  onDisposition={handleDisposition}
                />
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Phone size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Active Call
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Click "Next Call" to start calling from your queue
                  </p>
                  <button
                    onClick={handleGetNextCall}
                    className="px-6 py-3 bg-[#761B14] text-white rounded-lg hover:bg-[#5a1410] inline-flex items-center space-x-2"
                  >
                    <Play size={20} />
                    <span>Start Calling</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Queue View */}
          {activeView === 'queue' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-lg">Call Queue</h3>
              </div>

              <div className="divide-y divide-gray-200">
                {callQueue.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No items in call queue
                  </div>
                ) : (
                  callQueue.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.lead?.name || 'Unknown Lead'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.contact?.first_name} {item.contact?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.lead?.phone || 'No phone'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Attempts: {item.attempts}/{item.max_attempts}
                          </p>
                          {item.priority > 0 && (
                            <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              Priority
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* History View */}
          {activeView === 'history' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Call History</h3>
                <button
                  onClick={loadRecentCalls}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw size={16} className="inline mr-1" />
                  Refresh
                </button>
              </div>

              {/* Filters */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Search calls..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#761B14] focus:border-transparent"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  />
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#761B14] focus:border-transparent"
                    value={filters.disposition}
                    onChange={(e) => setFilters({ ...filters, disposition: e.target.value })}
                  >
                    <option value="all">All Dispositions</option>
                    <option value="interested">Interested</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="callback">Callback</option>
                    <option value="voicemail">Voicemail</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {calls.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No calls found
                  </div>
                ) : (
                  calls.map((call) => (
                    <div key={call.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {call.lead?.name || 'Unknown'}
                            </h4>
                            {call.disposition && (
                              <span className={`px-2 py-1 rounded text-xs ${getDispositionColor(call.disposition)}`}>
                                {call.disposition.replace('_', ' ')}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600">
                            {call.phone_number}
                          </p>

                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>
                              <Clock size={12} className="inline mr-1" />
                              {formatDuration(call.talk_time_seconds || 0)}
                            </span>
                            <span>
                              {new Date(call.started_at).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {call.has_recording && (
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                              <Play size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {call.ai_summary && (
                        <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-gray-700">
                          <p className="font-medium text-blue-900 mb-1">AI Summary:</p>
                          {call.ai_summary}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Analytics View */}
          {activeView === 'analytics' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-lg mb-4">Call Analytics</h3>
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Today's Meetings/Callbacks */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar size={18} className="mr-2 text-[#761B14]" />
              Today's Callbacks
            </h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 text-center py-4">
                No callbacks scheduled
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {todayStats && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Today's Performance</h3>
              <div className="space-y-3">
                {Object.entries(todayStats.dispositions || {}).map(([disp, count]) => (
                  <div key={disp} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {disp.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales Script Preview */}
          {currentScript && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                Active Script
              </h3>
              <p className="text-sm text-gray-700 font-medium mb-2">
                {currentScript.name}
              </p>
              <p className="text-xs text-gray-600">
                {currentScript.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calls;
