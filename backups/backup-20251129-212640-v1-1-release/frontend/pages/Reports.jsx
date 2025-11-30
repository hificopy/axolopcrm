import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BarChart3, TrendingUp, Activity, Filter } from "lucide-react";

export default function Reports() {
  const navigate = useNavigate();

  const reports = [
    {
      id: "activity-overview",
      title: "Activity Overview",
      description: "View comprehensive activity metrics and trends",
      icon: Activity,
      path: "/app/reports/activity-overview",
    },
    {
      id: "activity-comparison",
      title: "Activity Comparison",
      description: "Compare activities across different time periods",
      icon: BarChart3,
      path: "/app/reports/activity-comparison",
    },
    {
      id: "opportunity-funnels",
      title: "Opportunity Funnels",
      description: "Analyze your sales funnel and conversion rates",
      icon: TrendingUp,
      path: "/app/reports/opportunity-funnels",
    },
    {
      id: "status-changes",
      title: "Status Changes",
      description: "Track status changes across your pipeline",
      icon: Filter,
      path: "/app/reports/status-changes",
    },
    {
      id: "explorer",
      title: "Data Explorer",
      description: "Explore and analyze your data with custom queries",
      icon: BarChart3,
      path: "/app/reports/explorer",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">
            Analyze your business performance with detailed reports and insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => navigate(report.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(report.path);
                    }}
                  >
                    View Report
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
