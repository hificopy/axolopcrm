import FeaturePageTemplate from "./FeaturePageTemplate";
import {
  Link,
  Zap,
  Shield,
  Globe,
  Code,
  Database,
  Key,
  RefreshCw,
  Settings,
} from "lucide-react";

const FeatureIntegrations = () => {
  return (
    <FeaturePageTemplate
      title="Integrations & API"
      subtitle="Business Tools"
      description="Connect all your favorite tools and build custom integrations. Seamless data flow across your entire tech stack."
      icon={Link}
      iconColor="#E92C92"
      iconBg="#E92C92"
      features={[
        {
          icon: Zap,
          title: "One-Click Integrations",
          description: "Connect 100+ popular apps with pre-built integrations.",
        },
        {
          icon: Code,
          title: "REST API",
          description:
            "Full-featured API for custom integrations and workflows.",
        },
        {
          icon: Shield,
          title: "Webhooks",
          description: "Real-time data sync with webhook endpoints.",
        },
        {
          icon: Database,
          title: "Data Sync",
          description: "Two-way synchronization with connected applications.",
        },
        {
          icon: Key,
          title: "OAuth Authentication",
          description: "Secure authentication with industry-standard OAuth.",
        },
        {
          icon: RefreshCw,
          title: "Automated Workflows",
          description: "Trigger actions in connected apps based on events.",
        },
        {
          icon: Settings,
          title: "Integration Builder",
          description: "Visual interface for building custom integrations.",
        },
        {
          icon: Globe,
          title: "Global Infrastructure",
          description: "Worldwide API endpoints for low-latency connections.",
        },
      ]}
      benefits={[
        "Connect your entire tech stack",
        "No more data silos",
        "Automated workflows across platforms",
        "Enterprise-grade security",
        "99.9% uptime guarantee",
        "Comprehensive documentation",
        "Developer support",
        "Custom integration services",
      ]}
      useCases={[
        {
          title: "Marketing Stack",
          description:
            "Connect email, social media, and advertising platforms.",
        },
        {
          title: "Sales Tools",
          description: "Sync with sales engagement and prospecting tools.",
        },
        {
          title: "Accounting Software",
          description:
            "Integrate with QuickBooks, Xero, and other accounting systems.",
        },
        {
          title: "E-commerce Platforms",
          description:
            "Connect Shopify, WooCommerce, and other shopping carts.",
        },
      ]}
    />
  );
};

export default FeatureIntegrations;
