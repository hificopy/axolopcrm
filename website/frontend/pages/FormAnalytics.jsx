import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Clock,
  Target,
  Award,
  BarChart,
  PieChart,
  Download,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data function
const getMockAnalytics = () => ({
  totalResponses: 1247,
  completionRate: 68.5,
  averageTime: 142, // seconds
  conversionRate: 23.4,
  responsesByDay: [
    { date: '2025-11-01', count: 24 },
    { date: '2025-11-02', count: 18 },
    { date: '2025-11-03', count: 31 },
    { date: '2025-11-04', count: 22 },
    { date: '2025-11-05', count: 29 },
    { date: '2025-11-06', count: 35 },
    { date: '2025-11-07', count: 42 },
    { date: '2025-11-08', count: 38 },
    { date: '2025-11-09', count: 29 },
    { date: '2025-11-10', count: 31 },
  ],
  questionPerformance: [
    { question: 'What is your name?', responses: 1247, completion: 100 },
    { question: 'What is your email?', responses: 1201, completion: 96.3 },
    { question: 'How did you hear about us?', responses: 1156, completion: 92.7 },
    { question: 'How satisfied are you?', responses: 1089, completion: 87.3 },
    { question: 'What can we improve?', responses: 723, completion: 57.9 },
  ],
  topResponses: [
    { option: 'Google Search', count: 423, percentage: 34.2 },
    { option: 'Social Media', count: 312, percentage: 25.1 },
    { option: 'Friend Recommendation', count: 287, percentage: 23.1 },
    { option: 'Advertisement', count: 125, percentage: 10.1 },
  ],
  satisfactionDistribution: [
    { rating: 5, count: 312, percentage: 25.1 },
    { rating: 4, count: 287, percentage: 23.1 },
    { rating: 3, count: 198, percentage: 15.9 },
    { rating: 2, count: 145, percentage: 11.6 },
    { rating: 1, count: 105, percentage: 8.4 },
  ]
});

const getMockForm = (formId) => ({
  id: formId,
  name: 'Customer Feedback Survey',
  createdAt: new Date('2025-10-15'),
  status: 'active'
});

export default function FormAnalytics() {
  const { formId } = useParams();
  const [selectedForm, setSelectedForm] = useState(getMockForm(formId));
  const [analytics, setAnalytics] = useState(getMockAnalytics());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from API
    // formsApi.getFormAnalytics(formId)
    //   .then(data => {
    //     setAnalytics(data);
    //     formsApi.getForm(formId).then(setSelectedForm);
    //   })
    //   .catch(setError)
    //   .finally(() => setLoading(false));

    // For demo purposes, using mock data
    setSelectedForm(getMockForm(formId));
    setAnalytics(getMockAnalytics());
    setLoading(false);
  }, [formId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Use analytics data or fallback to mock data if not loaded yet
  const displayAnalytics = analytics || getMockAnalytics();
  const displayForm = selectedForm || getMockForm(formId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-crm-text-secondary">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error loading analytics: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#1a1d24] border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">
              Analytics: {displayForm?.name}
            </h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Track form performance and response insights
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="default" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" size="default" className="gap-2">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-crm-text-secondary">Total Responses</div>
                  <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                    {displayAnalytics.totalResponses?.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-green/10">
                  <TrendingUp className="h-5 w-5 text-primary-green" />
                </div>
                <div>
                  <div className="text-sm text-crm-text-secondary">Completion Rate</div>
                  <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                    {displayAnalytics.completionRate}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-yellow/10">
                  <Clock className="h-5 w-5 text-primary-yellow" />
                </div>
                <div>
                  <div className="text-sm text-crm-text-secondary">Avg. Time</div>
                  <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                    {formatTime(displayAnalytics.averageTime)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-crm-text-secondary">Conversion Rate</div>
                  <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                    {displayAnalytics.conversionRate}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Responses Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Responses Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {displayAnalytics.responsesByDay?.map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-primary rounded-t hover:bg-red-600 transition-colors"
                      style={{ height: `${(day.count / Math.max(...displayAnalytics.responsesByDay.map(d => d.count))) * 80}%` }}
                    ></div>
                    <div className="text-xs text-crm-text-secondary mt-2">
                      {new Date(day.date).getDate()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Question Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Question Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayAnalytics.questionPerformance?.map((qp, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{qp.question}</span>
                      <span>{qp.completion}% completion</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${qp.completion}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Responses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayAnalytics.topResponses?.map((option, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="font-medium">{option.option}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-crm-text-secondary">
                        {option.count} ({option.percentage}%)
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${option.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Satisfaction Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Satisfaction Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {displayAnalytics.satisfactionDistribution?.map((rating, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg font-bold text-crm-text-primary">{rating.rating}★</div>
                    <div className="text-2xl font-bold text-primary my-1">
                      {rating.count}
                    </div>
                    <div className="text-xs text-crm-text-secondary">
                      {rating.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Response Data */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-crm-text-secondary">Date</th>
                    <th className="text-left py-2 text-sm font-medium text-crm-text-secondary">Response ID</th>
                    <th className="text-left py-2 text-sm font-medium text-crm-text-secondary">Time Spent</th>
                    <th className="text-left py-2 text-sm font-medium text-crm-text-secondary">Status</th>
                    <th className="text-right py-2 text-sm font-medium text-crm-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <tr key={item} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-3 text-sm">Nov 10, 2025</td>
                      <td className="py-3 text-sm">RESP-{1000 + item}</td>
                      <td className="py-3 text-sm">{formatTime(120 + item * 10)}</td>
                      <td className="py-3 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary-green/10 text-primary-green">
                          Completed
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="outline" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}