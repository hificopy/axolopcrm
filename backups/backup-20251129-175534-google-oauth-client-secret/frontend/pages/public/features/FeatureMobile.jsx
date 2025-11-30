import FeaturePageTemplate from "./FeaturePageTemplate";
import {
  Smartphone,
  Bell,
  Shield,
  Zap,
  Users,
  MessageSquare,
  Settings,
  BarChart,
} from "lucide-react";

const FeatureMobile = () => {
  return (
    <FeaturePageTemplate
      title="Mobile App"
      subtitle="Business Tools"
      description="Full-featured mobile app for iOS and Android. Manage your business from anywhere with complete functionality."
      icon={Smartphone}
      iconColor="#1A777B"
      iconBg="#1A777B"
      features={[
        {
          icon: Smartphone,
          title: "Native iOS & Android",
          description:
            "Dedicated mobile apps built for performance and user experience.",
        },
        {
          icon: Users,
          title: "Full CRM Access",
          description:
            "Complete access to contacts, leads, and deals on mobile.",
        },
        {
          icon: MessageSquare,
          title: "Real-Time Communication",
          description: "Chat, email, and calling capabilities on the go.",
        },
        {
          icon: BarChart,
          title: "Mobile Analytics",
          description:
            "View reports and dashboards optimized for mobile screens.",
        },
        {
          icon: Bell,
          title: "Push Notifications",
          description: "Instant alerts for important updates and tasks.",
        },
        {
          icon: Zap,
          title: "Offline Mode",
          description: "Work offline and sync when connection is restored.",
        },
        {
          icon: Shield,
          title: "Biometric Security",
          description:
            "Face ID and fingerprint authentication for secure access.",
        },
        {
          icon: Settings,
          title: "Mobile Customization",
          description: "Customize mobile interface for your workflow.",
        },
      ]}
      benefits={[
        "Manage business from anywhere",
        "Never miss important updates",
        "Complete feature parity with desktop",
        "Offline productivity",
        "Enterprise-grade security",
        "Automatic data synchronization",
        "Intuitive mobile interface",
        "Regular updates and improvements",
      ]}
      useCases={[
        {
          title: "Field Sales Teams",
          description: "Access CRM and update deals while meeting clients.",
        },
        {
          title: "Remote Work",
          description: "Stay productive and connected from anywhere.",
        },
        {
          title: "Executive Dashboard",
          description: "Monitor business metrics and performance on the go.",
        },
        {
          title: "Customer Support",
          description:
            "Respond to support tickets and customer inquiries instantly.",
        },
      ]}
    />
  );
};

export default FeatureMobile;
