import { useState } from 'react';
import { BarChart3, Phone, Mail, Calendar, DollarSign, TrendingUp, Users, Plus } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

export default function ActivityOverview() {
  const [timeRange, setTimeRange] = useState('This Week');
  const [compareMode, setCompareMode] = useState('');
  const [selectedLeads, setSelectedLeads] = useState('All Leads');
  const [selectedUsers, setSelectedUsers] = useState('All Users with data');

  // Mock data for demonstration
  const metrics = [
    { label: 'Leads', sublabel: 'CREATED', value: 0, icon: Users, color: 'text-gray-600' },
    { label: 'Outbound Calls', sublabel: 'ALL TYPES', value: 0, icon: Phone, color: 'text-gray-600' },
    { label: 'Inbound Calls', sublabel: 'ALL TYPES', value: 0, icon: Phone, color: 'text-gray-600' },
    { label: 'All Calls', sublabel: 'AVERAGE DURATION', value: '0s', icon: Phone, color: 'text-gray-600' },
    { label: 'Sent Emails', sublabel: 'ALL TYPES', value: 0, icon: Mail, color: 'text-gray-600' },
    { label: 'Received Emails', sublabel: 'ALL TYPES', value: 0, icon: Mail, color: 'text-gray-600' },
    { label: 'Opportunities', sublabel: 'CREATED', value: 0, icon: TrendingUp, color: 'text-gray-600' },
    { label: 'Opportunities', sublabel: 'WON', value: 0, icon: DollarSign, color: 'text-gray-600' },
    { label: 'Opportunities', sublabel: 'VALUE WON — ANNUALIZED', value: '$0', icon: DollarSign, color: 'text-gray-600' },
    { label: 'Opportunities', sublabel: 'VALUE LOST — ANNUALIZED', value: '$0', icon: DollarSign, color: 'text-gray-600' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">Activity Overview</h1>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ▼
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="default"
              className="bg-[#761B14] hover:bg-[#6b1a12] text-white border-none"
            >
              Save As...
            </Button>
            <Button variant="ghost" size="icon">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#761B14]"
            >
              <option>This Week</option>
              <option>This Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-500" />
            <select
              value={compareMode}
              onChange={(e) => setCompareMode(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#761B14]"
            >
              <option value="">Compare to</option>
              <option>Previous Period</option>
              <option>Previous Year</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <select
              value={selectedLeads}
              onChange={(e) => setSelectedLeads(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#761B14]"
            >
              <option>All Leads</option>
              <option>My Leads</option>
              <option>Team Leads</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <select
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#761B14]"
            >
              <option>All Users with data</option>
              <option>Active Users</option>
              <option>Top Performers</option>
            </select>
          </div>

          <Button variant="ghost" size="icon">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 mb-1">{metric.label}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{metric.sublabel}</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add a tile button */}
          <Card className="bg-white border-2 border-dashed border-gray-300 hover:border-[#761B14] hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[160px]">
              <Plus className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Add a tile</span>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="bg-white">
          <CardHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Leaderboard</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Opportunities</span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
                <span className="text-sm text-gray-600 ml-2">WON</span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="h-32 w-32 mb-4" viewBox="0 0 200 200">
                {/* Illustration of people with lightbulb */}
                <circle cx="60" cy="80" r="25" fill="#e5e7eb" />
                <rect x="45" y="105" width="30" height="40" fill="#3b82f6" />
                <circle cx="140" cy="80" r="25" fill="#e5e7eb" />
                <rect x="125" y="105" width="30" height="40" fill="#3b82f6" />
                <circle cx="100" cy="40" r="20" fill="#fbbf24" />
                <path d="M95 60 L105 60 L100 75 Z" fill="#fbbf24" />
              </svg>
              <p className="text-lg font-semibold text-gray-900 mb-2">Not enough data to display a leaderboard.</p>
              <p className="text-sm text-gray-600 mb-6">Here are a few things you can try:</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Expand the date range.</strong> The default is the past week to date.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Include more users.</strong> The default is all users with data (which can be none).</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
