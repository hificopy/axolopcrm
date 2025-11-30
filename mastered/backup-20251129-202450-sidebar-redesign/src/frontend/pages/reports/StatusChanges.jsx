import { useState } from 'react';
import { History, Calendar, Filter } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

export default function StatusChanges() {
  const [timeRange, setTimeRange] = useState('This Month');

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Status Changes</h1>
          <Button
            variant="outline"
            size="default"
            className="bg-[#761B14] hover:bg-[#6b1a12] text-white border-none"
          >
            Export Log
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
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Card className="bg-white">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#761B14]" />
              Status Change History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <History className="h-24 w-24 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No status changes recorded yet</h3>
              <p className="text-gray-600 max-w-md">
                When leads or opportunities change status, their history will appear here for tracking and analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
