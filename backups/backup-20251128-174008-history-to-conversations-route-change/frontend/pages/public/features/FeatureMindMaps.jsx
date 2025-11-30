import FeaturePageTemplate from "./FeaturePageTemplate";
import {
  Network,
  Brain,
  Zap,
  Users,
  MessageSquare,
  Star,
  GitBranch,
  Sparkles,
} from "lucide-react";

const FeatureMindMaps = () => {
  return (
    <FeaturePageTemplate
      title="Mind Maps & Visual Planning"
      subtitle="AI Tools"
      description="Visual brainstorming and strategic planning with AI-powered mind maps. Replace Miro and save $50/month."
      icon={Network}
      iconColor="#1A777B"
      iconBg="#1A777B"
      features={[
        {
          icon: Brain,
          title: "AI-Generated Mind Maps",
          description:
            "Create mind maps automatically from notes, documents, and ideas.",
        },
        {
          icon: Network,
          title: "Infinite Canvas",
          description:
            "Unlimited workspace for complex visual planning and brainstorming.",
        },
        {
          icon: Users,
          title: "Real-Time Collaboration",
          description:
            "Work together simultaneously with cursors and live updates.",
        },
        {
          icon: Zap,
          title: "Smart Connections",
          description:
            "AI suggests connections between ideas and concepts automatically.",
        },
        {
          icon: MessageSquare,
          title: "Sticky Notes & Comments",
          description:
            "Add sticky notes, comments, and annotations anywhere on canvas.",
        },
        {
          icon: GitBranch,
          title: "Flowcharts & Diagrams",
          description: "Create professional flowcharts and process diagrams.",
        },
        {
          icon: Star,
          title: "Template Library",
          description:
            "Pre-built templates for common business processes and strategies.",
        },
        {
          icon: Sparkles,
          title: "Presentation Mode",
          description:
            "Present your mind maps and diagrams with professional transitions.",
        },
      ]}
      benefits={[
        "Replace Miro and save $50/month",
        "AI-powered idea generation",
        "Unlimited canvas and collaborators",
        "Real-time synchronization",
        "Advanced export options",
        "Version history and rollback",
        "Integration with CRM data",
        "Mobile and tablet support",
      ]}
      useCases={[
        {
          title: "Strategic Planning",
          description:
            "Map out business strategies and visualize complex relationships.",
        },
        {
          title: "Brainstorming Sessions",
          description: "Collaborative ideation with AI-powered suggestions.",
        },
        {
          title: "Process Mapping",
          description: "Document and optimize business processes visually.",
        },
        {
          title: "Project Planning",
          description:
            "Plan projects with visual task dependencies and timelines.",
        },
      ]}
    />
  );
};

export default FeatureMindMaps;
