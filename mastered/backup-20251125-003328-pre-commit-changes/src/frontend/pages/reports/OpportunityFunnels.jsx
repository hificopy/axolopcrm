import { useState } from 'react';
import { TrendingUp, Calendar, Filter } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

export default function OpportunityFunnels() {
  const [timeRange, setTimeRange] = useState('This Quarter');

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Opportunity Funnels</h1>
          <Button
            variant="outline"
            size="default"
            className="bg-[#761B14] hover:bg-[#6b1a12] text-white border-none"
          >
            Export Report
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
              <option>This Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Card className="bg-white">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#761B14]" />
              Sales Funnel Visualization
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                {/* Funnel Visualization */}
                <svg width="300" height="250" viewBox="0 0 300 250">
                  <path d="M 50 20 L 250 20 L 200 80 L 100 80 Z" fill="#e0e7ff" stroke="#761B14" strokeWidth="2" />
                  <path d="M 100 80 L 200 80 L 175 140 L 125 140 Z" fill="#c7d2fe" stroke="#761B14" strokeWidth="2" />
                  <path d="M 125 140 L 175 140 L 160 200 L 140 200 Z" fill="#a5b4fc" stroke="#761B14" strokeWidth="2" />
                  <text x="150" y="50" textAnchor="middle" fill="#374151" fontSize="14">Leads: 0</text>
                  <text x="150" y="110" textAnchor="middle" fill="#374151" fontSize="14">Qualified: 0</text>
                  <text x="150" y="170" textAnchor="middle" fill="#374151" fontSize="14">Closed: 0</text>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No funnel data available yet</h3>
              <p className="text-gray-600 max-w-md">
                Opportunity funnel visualization will appear here once you have opportunities moving through your sales stages.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
