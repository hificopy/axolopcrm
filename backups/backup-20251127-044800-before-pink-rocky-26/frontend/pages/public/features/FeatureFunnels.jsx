import FeaturePageTemplate from "./FeaturePageTemplate";
import {
  Funnel,
  Layers,
  Zap,
  BarChart,
  Globe,
  Smartphone,
  CreditCard,
  Target,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
} from "lucide-react";

const FeatureFunnels = () => {
  return (
    <FeaturePageTemplate
      title="Sales Funnels"
      subtitle="Sales Tools"
      description="Build high-converting sales funnels that capture leads and close deals automatically. Replace ClickFunnels and save $297/month."
      icon={Funnel}
      iconColor="#761B14"
      iconBg="#761B14"
      features={[
        {
          icon: Layers,
          title: "Drag & Drop Builder",
          description:
            "Create funnels visually with our intuitive builder. No coding required.",
        },
        {
          icon: Zap,
          title: "Smart Automation",
          description:
            "Automate follow-ups, scoring, and routing based on user behavior.",
        },
        {
          icon: BarChart,
          title: "Real-time Analytics",
          description:
            "Track conversion rates, drop-off points, and revenue per visitor.",
        },
        {
          icon: Globe,
          title: "Multi-step Funnels",
          description:
            "Create complex funnels with upsells, downsells, and order bumps.",
        },
        {
          icon: Smartphone,
          title: "Mobile-Optimized",
          description:
            "All funnels work perfectly on desktop, tablet, and mobile devices.",
        },
        {
          icon: CreditCard,
          title: "Payment Integration",
          description:
            "Accept payments directly through your funnels with Stripe integration.",
        },
        {
          icon: Target,
          title: "A/B Testing",
          description:
            "Test different headlines, images, and offers to maximize conversions.",
        },
        {
          icon: TrendingUp,
          title: "Conversion Optimization",
          description:
            "AI-powered suggestions to improve your funnel performance.",
        },
      ]}
      benefits={[
        "Replace ClickFunnels and save $297/month",
        "Unlimited funnels and steps",
        "Built-in CRM integration",
        "No transaction fees",
        "Advanced split testing",
        "Custom domain support",
        "Email and SMS follow-up sequences",
        "Membership and course funnels",
      ]}
      useCases={[
        {
          title: "Lead Generation Funnels",
          description:
            "Capture leads with multi-step forms and automatic follow-up sequences.",
        },
        {
          title: "Product Launch Funnels",
          description:
            "Launch products with pre-launch, launch, and post-launch sequences.",
        },
        {
          title: "Webinar Funnels",
          description:
            "Register attendees for webinars and follow up with replay offers.",
        },
        {
          title: "Membership Funnels",
          description:
            "Create recurring revenue with membership sites and course delivery.",
        },
      ]}
    />
  );
};

export default FeatureFunnels;
