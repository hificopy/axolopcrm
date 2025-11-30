import FeaturePageTemplate from "./FeaturePageTemplate";
import {
  MessageSquare,
  Hash,
  Users,
  FileText,
  Video,
  Search,
  Database,
  Smartphone,
  Bell,
  Lock,
  Zap,
  Globe,
} from "lucide-react";

const FeatureChat = () => {
  return (
    <FeaturePageTemplate
      title="Team Chat & Collaboration"
      subtitle="Business Tools"
      description="Replace Slack with seamless team communication built directly into your CRM. Real-time messaging, channels, direct messages, file sharing, and voice calls—all connected to your customer data."
      icon={MessageSquare}
      iconColor="#EBB207"
      iconBg="#d97706"
      features={[
        {
          icon: MessageSquare,
          title: "Real-time Team Messaging",
          description:
            "Instant communication with typing indicators, emoji reactions, and threaded conversations for organized discussions.",
        },
        {
          icon: Hash,
          title: "Organized Channels",
          description:
            "Create public or private channels for projects, teams, departments, or topics. Keep conversations focused and searchable.",
        },
        {
          icon: Users,
          title: "Direct Messages",
          description:
            "Private 1-on-1 conversations or group DMs for sensitive discussions. Share files, links, and collaborate securely.",
        },
        {
          icon: FileText,
          title: "File Sharing & Storage",
          description:
            "Share documents, images, and files securely. Automatic previews, version history, and unlimited storage included.",
        },
        {
          icon: Video,
          title: "Voice & Video Calls",
          description:
            "Start instant voice or video calls without switching apps. Screen sharing, recording, and meeting notes built-in.",
        },
        {
          icon: Search,
          title: "Universal Message Search",
          description:
            "Find any message, file, or conversation instantly. Advanced filters by date, person, channel, or file type.",
        },
        {
          icon: Database,
          title: "CRM Integration",
          description:
            "See customer context directly in conversations. Link chats to leads, deals, and contacts automatically.",
        },
        {
          icon: Smartphone,
          title: "Mobile & Desktop Apps",
          description:
            "Stay connected on any device. Native apps for iOS, Android, Windows, and Mac with push notifications.",
        },
      ]}
      benefits={[
        "Replace Slack and save $8.75/user/month",
        "No more context switching between apps",
        "Customer data directly in conversations",
        "Unified search across messages AND CRM",
        "Unlimited message history (no 90-day limit)",
        "Built-in file storage with no limits",
        "Voice & video calls without Zoom/Meet",
        "Privacy-first—your data stays yours",
        "Threaded conversations for clarity",
        "Custom notifications and quiet hours",
      ]}
      useCases={[
        {
          title: "Agency Teams",
          description:
            "Coordinate client work with full customer context. Tag team members, share assets, and track deliverables all in one place.",
        },
        {
          title: "Sales Teams",
          description:
            "Discuss deals with pipeline visibility. Share customer insights, coordinate handoffs, and celebrate wins together.",
        },
        {
          title: "Support Teams",
          description:
            "Collaborate on tickets with customer history at your fingertips. Escalate issues and share solutions across the team.",
        },
        {
          title: "Remote Teams",
          description:
            "Stay connected across time zones with async messaging, status updates, and scheduled messages for better work-life balance.",
        },
      ]}
    />
  );
};

export default FeatureChat;
