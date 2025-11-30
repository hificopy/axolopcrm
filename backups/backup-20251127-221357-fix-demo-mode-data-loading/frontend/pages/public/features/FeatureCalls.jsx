import FeaturePageTemplate from "./FeaturePageTemplate";
import {
  Phone,
  Mic,
  BarChart,
  Users,
  Zap,
  Shield,
  MessageSquare,
  FileText,
} from "lucide-react";

const FeatureCalls = () => {
  return (
    <FeaturePageTemplate
      title="Sales Dialer & Calls"
      subtitle="Sales Tools"
      description="Professional sales dialer with call recording, transcription, and AI-powered insights. Replace Aircall and Close CRM."
      icon={Phone}
      iconColor="#CA4238"
      iconBg="#CA4238"
      features={[
        {
          icon: Phone,
          title: "Click-to-Call",
          description:
            "Call leads directly from CRM with one click. No dialing required.",
        },
        {
          icon: Mic,
          title: "Call Recording",
          description:
            "Automatically record all calls for training and compliance.",
        },
        {
          icon: FileText,
          title: "AI Transcription",
          description:
            "Get accurate transcriptions of every call using OpenAI Whisper.",
        },
        {
          icon: BarChart,
          title: "Call Analytics",
          description: "Track call duration, outcomes, and conversion rates.",
        },
        {
          icon: Zap,
          title: "Power Dialer",
          description:
            "Automatically dial through lead lists with customizable settings.",
        },
        {
          icon: Users,
          title: "Call Routing",
          description:
            "Route calls to the right agents based on skill and availability.",
        },
        {
          icon: MessageSquare,
          title: "Live Call Coaching",
          description:
            "Real-time whisper coaching and objection handling support.",
        },
        {
          icon: Shield,
          title: "Compliance Tools",
          description:
            "TCPA compliance, call scrubbing, and consent management.",
        },
      ]}
      benefits={[
        "Replace Aircall and save $95/month",
        "Unlimited calling and recording",
        "AI-powered call insights",
        "Local phone numbers included",
        "Voicemail drop campaigns",
        "Call scoring and quality monitoring",
        "Integration with CRM pipeline",
        "Mobile app for on-the-go calling",
      ]}
      useCases={[
        {
          title: "Sales Teams",
          description:
            "High-volume outbound calling with automated dialing and lead management.",
        },
        {
          title: "Customer Support",
          description:
            "Inbound call handling with routing and quality assurance.",
        },
        {
          title: "Call Centers",
          description:
            "Enterprise-grade calling with advanced analytics and compliance.",
        },
      ]}
    />
  );
};

export default FeatureCalls;
