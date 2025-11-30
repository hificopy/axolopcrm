import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  TrendingUp,
  Users,
  Target,
  Clock,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

export default function ResultsTab({ form }) {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, all

  // Mock data - replace with real API calls
  const stats = {
    totalViews: 1234,
    totalStarts: 856,
    totalCompletions: 423,
    conversionRate: 49.4,
    avgCompletionTime: 245, // seconds
    avgLeadScore: 67.5,
    qualifiedLeads: 234,
    disqualifiedLeads: 89
  };

  const recentSubmissions = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      leadScore: 85,
      status: 'qualified',
      submittedAt: '2 hours ago',
      ending: 'Qualified Lead'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      leadScore: 45,
      status: 'neutral',
      submittedAt: '5 hours ago',
      ending: 'Standard Ending'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      leadScore: 15,
      status: 'disqualified',
      submittedAt: '1 day ago',
      ending: 'Not a Fit'
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-crm-text-primary mb-2">Results</h2>
            <p className="text-crm-text-secondary">
              Analytics and submissions for "{form.title}"
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center border border-crm-border rounded-lg overflow-hidden">
              {['7d', '30d', '90d', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-xs ${
                    timeRange === range
                      ? 'bg-primary text-white'
                      : 'bg-white text-crm-text-secondary hover:bg-gray-50'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range.toUpperCase()}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => alert('Export functionality is not yet implemented.')}>
              <Download className="h-4 w-4 mr-2" />
              Export (Placeholder)
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-crm-text-secondary">Total Views</p>
                  <p className="text-2xl font-bold text-crm-text-primary mt-1">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <Eye className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+12.5%</span>
                <span className="text-crm-text-secondary">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-crm-text-secondary">Completions</p>
                  <p className="text-2xl font-bold text-crm-text-primary mt-1">{stats.totalCompletions.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <span className="text-crm-text-secondary">
                  {stats.conversionRate}% conversion rate
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-crm-text-secondary">Avg Lead Score</p>
                  <p className="text-2xl font-bold text-crm-text-primary mt-1">{stats.avgLeadScore}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <span className="text-green-600">{stats.qualifiedLeads} qualified</span>
                <span className="text-crm-text-secondary">•</span>
                <span className="text-red-600">{stats.disqualifiedLeads} disqualified</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-crm-text-secondary">Avg Time</p>
                  <p className="text-2xl font-bold text-crm-text-primary mt-1">
                    {Math.floor(stats.avgCompletionTime / 60)}m {stats.avgCompletionTime % 60}s
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <span className="text-crm-text-secondary">Time to complete</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Submissions Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center text-crm-text-secondary">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chart visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Lead Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center text-crm-text-secondary">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chart visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Recent Submissions
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => alert('View All Submissions functionality is not yet implemented.')}>
                View All (Placeholder)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      submission.status === 'qualified' ? 'bg-green-100' :
                      submission.status === 'disqualified' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      {submission.status === 'qualified' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : submission.status === 'disqualified' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-crm-text-primary">{submission.name}</div>
                      <div className="text-sm text-crm-text-secondary">{submission.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-crm-text-secondary">Score</div>
                      <div className={`text-sm font-semibold ${
                        submission.leadScore >= 70 ? 'text-green-600' :
                        submission.leadScore >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {submission.leadScore}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-crm-text-secondary">Ending</div>
                      <div className="text-sm font-medium">{submission.ending}</div>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <div className="text-xs text-crm-text-secondary">{submission.submittedAt}</div>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => alert(`Viewing submission ${submission.id} is not yet implemented.`)}>
                      View (Placeholder)
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {recentSubmissions.length === 0 && (
              <div className="text-center py-12 text-crm-text-secondary">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No submissions yet</p>
                <p className="text-xs mt-1">Share your form to start collecting responses</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drop-off Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Question Drop-off Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {form.questions?.slice(0, 5).map((question, index) => {
                const dropoffRate = Math.random() * 30; // Mock data
                const completionRate = 100 - dropoffRate;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium text-crm-text-primary truncate max-w-md">
                        {index + 1}. {question.title || 'Untitled Question'}
                      </div>
                      <div className="text-sm text-crm-text-secondary">
                        {completionRate.toFixed(1)}% completion
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
