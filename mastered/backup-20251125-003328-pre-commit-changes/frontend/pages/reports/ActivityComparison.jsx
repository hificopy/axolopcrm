import { useState } from 'react';
import { BarChart3, Calendar, Users } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

export default function ActivityComparison() {
  const [timeRange, setTimeRange] = useState('This Month');
  const [selectedUsers, setSelectedUsers] = useState('All Users');

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Activity Comparison</h1>
          <Button
            variant="outline"
            size="default"
            className="bg-[#761B14] hover:bg-[#6b1a12] text-white border-none"
          >
            Export Data
          </Button>
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
            <Users className="h-4 w-4 text-gray-500" />
            <select
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#761B14]"
            >
              <option>All Users</option>
              <option>Active Users</option>
              <option>Top Performers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Card className="bg-white">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#761B14]" />
              Activity Comparison Chart
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <BarChart3 className="h-24 w-24 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No data available yet</h3>
              <p className="text-gray-600 max-w-md">
                Activity comparison charts will appear here once you have activity data to compare across different time periods or users.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
