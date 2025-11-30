import FeaturePageTemplate from "./FeaturePageTemplate";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Link,
  Bell,
  Globe,
  Mail,
  BarChart,
} from "lucide-react";

const FeatureCalendar = () => {
  return (
    <FeaturePageTemplate
      title="Calendar & Scheduling"
      subtitle="Sales Tools"
      description="Smart scheduling and calendar management. Replace Calendly and save $97/month with integrated booking links."
      icon={Calendar}
      iconColor="#1A777B"
      iconBg="#1A777B"
      features={[
        {
          icon: Link,
          title: "Booking Links",
          description:
            "Share personalized booking links that sync with your calendar.",
        },
        {
          icon: Clock,
          title: "Time Zone Detection",
          description:
            "Automatic timezone conversion for global teams and clients.",
        },
        {
          icon: Video,
          title: "Video Integration",
          description:
            "Auto-add Zoom, Google Meet, or Teams links to meetings.",
        },
        {
          icon: Users,
          title: "Round-Robin Scheduling",
          description:
            "Distribute meetings evenly across team members automatically.",
        },
        {
          icon: Bell,
          title: "Automated Reminders",
          description: "Send email and SMS reminders to reduce no-shows.",
        },
        {
          icon: Globe,
          title: "Custom Availability",
          description: "Set working hours, buffer times, and blackout dates.",
        },
        {
          icon: Mail,
          title: "Email Confirmations",
          description:
            "Automatic confirmations and calendar invites for attendees.",
        },
        {
          icon: BarChart,
          title: "Meeting Analytics",
          description: "Track meeting metrics, attendance rates, and outcomes.",
        },
      ]}
      benefits={[
        "Replace Calendly and save $97/month",
        "Unlimited booking links and events",
        "Team scheduling and coordination",
        "CRM integration for automatic contact creation",
        "Custom branding and domains",
        "Group and one-on-one meetings",
        "Recurring meeting support",
        "Mobile app for on-the-go scheduling",
      ]}
      useCases={[
        {
          title: "Sales Meetings",
          description:
            "Book demos and discovery calls with qualified leads automatically.",
        },
        {
          title: "Team Collaboration",
          description:
            "Schedule internal meetings and coordinate team availability.",
        },
        {
          title: "Client Appointments",
          description:
            "Let clients book consultations and follow-up sessions 24/7.",
        },
        {
          title: "Webinar Scheduling",
          description:
            "Manage webinar registrations and send calendar invites automatically.",
        },
      ]}
    />
  );
};

export default FeatureCalendar;
