import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Mail, 
  Eye, 
  MousePointerClick,
  Users,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

const EmailAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalCampaigns: 24,
    totalSent: 12458,
    totalDelivered: 12345,
    totalOpened: 3508,
    totalClicked: 1245,
    avgOpenRate: 28.2,
    avgClickRate: 10.0,
    topPerformers: [
      { id: 1, name: 'Welcome Series', openRate: 45.2, clickRate: 15.3, sent: 1245 },
      { id: 2, name: 'Product Update', openRate: 38.7, clickRate: 12.1, sent: 890 },
      { id: 3, name: 'Monthly Newsletter', openRate: 32.4, clickRate: 8.7, sent: 2100 }
    ],
    performanceOverTime: [
      { date: '2025-01-01', sent: 450, opened: 120, clicked: 45 },
      { date: '2025-01-08', sent: 520, opened: 145, clicked: 52 },
      { date: '2025-01-15', sent: 680, opened: 180, clicked: 68 },
      { date: '2025-01-22', sent: 590, opened: 165, clicked: 58 },
      { date: '2025-01-29', sent: 720, opened: 210, clicked: 75 }
    ],
    performanceByType: {
      ONE_TIME: { count: 12, totalSent: 6500, totalOpened: 1820, totalClicked: 780 },
      DRIP: { count: 6, totalSent: 2800, totalOpened: 840, totalClicked: 280 },
      SEQUENCE: { count: 4, totalSent: 2100, totalOpened: 630, totalClicked: 150 },
      AB_TEST: { count: 2, totalSent: 1058, totalOpened: 218, totalClicked: 35 }
    }
  });

  const [dateRange, setDateRange] = useState('last-30-days');
  const [campaignType, setCampaignType] = useState('all');

  // Simulate API call to get analytics
  useEffect(() => {
    // In a real implementation, we would call the API here based on filters
    console.warn('Fetching analytics with filters:', { dateRange, campaignType });
  }, [dateRange, campaignType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-crm-text-primary">Email Analytics</h1>
          <p className="text-crm-text-secondary mt-1">
            Track and analyze your email marketing performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last-7-days">Last 7 days</SelectItem>
              <SelectItem value="last-30-days">Last 30 days</SelectItem>
              <SelectItem value="last-90-days">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Select value={campaignType} onValueChange={setCampaignType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ONE_TIME">One-time</SelectItem>
              <SelectItem value="DRIP">Drip Campaign</SelectItem>
              <SelectItem value="SEQUENCE">Sequence</SelectItem>
              <SelectItem value="AB_TEST">A/B Test</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Mail className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-crm-text-secondary">Campaigns Sent</p>
              <p className="text-2xl font-bold text-crm-text-primary">{analytics.totalCampaigns}</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                12.4% vs last period
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-crm-text-secondary">Total Opened</p>
              <p className="text-2xl font-bold text-crm-text-primary">{analytics.totalOpened}</p>
              <p className="text-xs text-green-600">Avg: {analytics.avgOpenRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MousePointerClick className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-crm-text-secondary">Total Clicked</p>
              <p className="text-2xl font-bold text-crm-text-primary">{analytics.totalClicked}</p>
              <p className="text-xs text-green-600">Avg: {analytics.avgClickRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-crm-text-secondary">Engagement Rate</p>
              <p className="text-2xl font-bold text-crm-text-primary">22.8%</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                5.2% vs last period
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-crm-text-secondary">Performance chart would show opens/clicks over time</p>
                <div className="mt-4 flex justify-center gap-8">
                  {analytics.performanceOverTime.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-lg font-bold text-crm-text-primary">{day.opened}</div>
                      <div className="text-xs text-crm-text-secondary">{day.date.split('-')[2]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance by Campaign Type */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.performanceByType).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-crm-text-primary">{type.replace('_', ' ')}</div>
                    <div className="text-sm text-crm-text-secondary">{data.count} campaigns</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-crm-text-primary">{data.totalSent}</div>
                    <div className="text-sm text-crm-text-secondary">
                      {((data.totalOpened / data.totalSent) * 100).toFixed(1)}% open
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-crm-text-secondary">Campaign</th>
                  <th className="text-left py-3 px-4 font-medium text-crm-text-secondary">Sent</th>
                  <th className="text-left py-3 px-4 font-medium text-crm-text-secondary">Open Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-crm-text-secondary">Click Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-crm-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topPerformers.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-crm-bg-light">
                    <td className="py-3 px-4">
                      <div className="font-medium text-crm-text-primary">{campaign.name}</div>
                    </td>
                    <td className="py-3 px-4 text-crm-text-primary">{campaign.sent}</td>
                    <td className="py-3 px-4 text-crm-text-primary">{campaign.openRate}%</td>
                    <td className="py-3 px-4 text-crm-text-primary">{campaign.clickRate}%</td>
                    <td className="py-3 px-4">
                      <Badge variant="success">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAnalytics;