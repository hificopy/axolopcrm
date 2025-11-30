import FeaturePageTemplate from "./FeaturePageTemplate";
import {
  BarChart,
  TrendingUp,
  PieChart,
  Target,
  Users,
  DollarSign,
  Activity,
  Zap,
  BarChart3,
} from "lucide-react";

const FeatureReports = () => {
  return (
    <FeaturePageTemplate
      title="Advanced Reports & Analytics"
      subtitle="Business Tools"
      description="Comprehensive reporting and analytics dashboard. Get insights that drive business growth and decision-making."
      icon={BarChart}
      iconColor="#CA4238"
      iconBg="#CA4238"
      features={[
        {
          icon: BarChart3,
          title: "Custom Report Builder",
          description:
            "Build any report you need with drag-and-drop interface.",
        },
        {
          icon: TrendingUp,
          title: "Real-Time Analytics",
          description: "Live data updates and real-time performance metrics.",
        },
        {
          icon: PieChart,
          title: "Visual Dashboards",
          description:
            "Create custom dashboards with charts, KPIs, and widgets.",
        },
        {
          icon: Target,
          title: "Goal Tracking",
          description: "Set and track business goals with progress indicators.",
        },
        {
          icon: Users,
          title: "Team Performance",
          description: "Monitor individual and team performance metrics.",
        },
        {
          icon: DollarSign,
          title: "Revenue Analytics",
          description: "Track revenue, profit margins, and financial metrics.",
        },
        {
          icon: Activity,
          title: "Funnel Analytics",
          description: "Analyze conversion rates and customer journey.",
        },
        {
          icon: Zap,
          title: "Automated Reports",
          description: "Schedule and automatically send reports via email.",
        },
      ]}
      benefits={[
        "Data-driven decision making",
        "Unlimited custom reports",
        "Real-time data synchronization",
        "Advanced filtering and segmentation",
        "Export to Excel, PDF, CSV",
        "Scheduled report delivery",
        "White-label reporting",
        "API access for custom integrations",
      ]}
      useCases={[
        {
          title: "Executive Dashboards",
          description: "C-level dashboards for strategic business insights.",
        },
        {
          title: "Sales Performance",
          description:
            "Track sales metrics, conversion rates, and team performance.",
        },
        {
          title: "Marketing Analytics",
          description: "Measure campaign ROI and marketing effectiveness.",
        },
        {
          title: "Financial Reporting",
          description: "Generate financial reports and business metrics.",
        },
      ]}
    />
  );
};

export default FeatureReports;
