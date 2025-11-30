import FeaturePageTemplate from "./FeaturePageTemplate";
import {
  Shield,
  Lock,
  Key,
  Users,
  Eye,
  AlertTriangle,
  Database,
  Cloud,
  FileText,
} from "lucide-react";

const FeatureSecurity = () => {
  return (
    <FeaturePageTemplate
      title="Enterprise Security"
      subtitle="Business Tools"
      description="Bank-level security with enterprise-grade compliance. Your data is protected with the highest standards."
      icon={Shield}
      iconColor="#761B14"
      iconBg="#761B14"
      features={[
        {
          icon: Lock,
          title: "End-to-End Encryption",
          description:
            "All data encrypted in transit and at rest with AES-256.",
        },
        {
          icon: Key,
          title: "Two-Factor Authentication",
          description:
            "Required 2FA for all users with multiple authentication options.",
        },
        {
          icon: Users,
          title: "Role-Based Access Control",
          description: "Granular permissions and user roles for data access.",
        },
        {
          icon: Eye,
          title: "Audit Logs",
          description:
            "Complete audit trail of all user actions and data access.",
        },
        {
          icon: Database,
          title: "Data Backups",
          description: "Automated daily backups with point-in-time recovery.",
        },
        {
          icon: Cloud,
          title: "Secure Infrastructure",
          description:
            "SOC 2 Type II certified data centers with 99.9% uptime.",
        },
        {
          icon: FileText,
          title: "Compliance Standards",
          description: "GDPR, CCPA, HIPAA compliant with regular audits.",
        },
        {
          icon: AlertTriangle,
          title: "Threat Detection",
          description: "AI-powered threat detection and automated response.",
        },
      ]}
      benefits={[
        "Bank-level security standards",
        "SOC 2 Type II certified",
        "GDPR and CCPA compliant",
        "24/7 security monitoring",
        "Regular security audits",
        "Data residency options",
        "Incident response team",
        "Security training for staff",
      ]}
      useCases={[
        {
          title: "Enterprise Organizations",
          description:
            "Meet corporate security requirements and compliance standards.",
        },
        {
          title: "Healthcare",
          description: "HIPAA compliant handling of sensitive patient data.",
        },
        {
          title: "Financial Services",
          description:
            "Bank-level security for financial data and transactions.",
        },
        {
          title: "Government Agencies",
          description: "FedRAMP-compliant infrastructure for government use.",
        },
      ]}
    />
  );
};

export default FeatureSecurity;
