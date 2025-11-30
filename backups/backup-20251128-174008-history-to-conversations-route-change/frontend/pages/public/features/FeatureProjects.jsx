import FeaturePageTemplate from "./FeaturePageTemplate";
import {
  Layout,
  CheckSquare,
  Users,
  BarChart,
  Calendar,
  Zap,
  Folder,
  MessageSquare,
  Target,
} from "lucide-react";

const FeatureProjects = () => {
  return (
    <FeaturePageTemplate
      title="Project Management"
      subtitle="Business Tools"
      description="Complete project management with tasks, workflows, and team collaboration. Replace ClickUp and save $50/month."
      icon={Layout}
      iconColor="#EBB207"
      iconBg="#EBB207"
      features={[
        {
          icon: CheckSquare,
          title: "Task Management",
          description:
            "Create, assign, and track tasks with deadlines and priorities.",
        },
        {
          icon: Users,
          title: "Team Collaboration",
          description:
            "Real-time collaboration with comments, mentions, and file sharing.",
        },
        {
          icon: BarChart,
          title: "Project Analytics",
          description:
            "Track progress, bottlenecks, and team performance metrics.",
        },
        {
          icon: Calendar,
          title: "Timeline View",
          description: "Gantt charts and timeline views for project planning.",
        },
        {
          icon: Zap,
          title: "Automated Workflows",
          description: "Automate repetitive tasks and project updates.",
        },
        {
          icon: Folder,
          title: "Project Templates",
          description:
            "Pre-built templates for common project types and workflows.",
        },
        {
          icon: MessageSquare,
          title: "Team Communication",
          description: "Built-in chat and discussion threads for each project.",
        },
        {
          icon: Target,
          title: "Goal Tracking",
          description: "Set and track project goals with OKRs and milestones.",
        },
      ]}
      benefits={[
        "Replace ClickUp and save $50/month",
        "Unlimited projects and tasks",
        "Real-time collaboration",
        "Advanced reporting and analytics",
        "Custom workflows and automations",
        "Time tracking integration",
        "Resource management",
        "Mobile apps for iOS and Android",
      ]}
      useCases={[
        {
          title: "Marketing Campaigns",
          description:
            "Plan and execute marketing campaigns with task dependencies.",
        },
        {
          title: "Product Development",
          description: "Manage sprints, backlogs, and product roadmaps.",
        },
        {
          title: "Client Projects",
          description:
            "Deliver client work on time with clear project tracking.",
        },
        {
          title: "Team Operations",
          description:
            "Streamline internal processes and improve team efficiency.",
        },
      ]}
    />
  );
};

export default FeatureProjects;
