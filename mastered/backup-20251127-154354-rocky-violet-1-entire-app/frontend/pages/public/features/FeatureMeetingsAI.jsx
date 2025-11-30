import FeaturePageTemplate from './FeaturePageTemplate';
import { Video, Mic, FileText, Clock, Users, Search, Sparkles, Calendar } from 'lucide-react';

const FeatureMeetingsAI = () => {
  return (
    <FeaturePageTemplate
      title="Meetings AI"
      subtitle="AI Tools"
      description="Never miss a detail from your meetings again. AI-powered transcription, summaries, and action items from every conversation."
      icon={Video}
      iconColor="#f59e0b"
      iconBg="#d97706"
      features={[
        {
          icon: Mic,
          title: 'Auto Transcription',
          description: 'Accurate transcriptions for calls and video meetings.',
        },
        {
          icon: FileText,
          title: 'Meeting Summaries',
          description: 'AI generates concise summaries of every meeting.',
        },
        {
          icon: Clock,
          title: 'Action Items',
          description: 'Automatically extract and assign action items.',
        },
        {
          icon: Search,
          title: 'Searchable History',
          description: 'Search across all your meeting transcripts.',
        },
        {
          icon: Users,
          title: 'Speaker Detection',
          description: 'Identify who said what with speaker diarization.',
        },
        {
          icon: Calendar,
          title: 'Calendar Sync',
          description: 'Automatically join and record scheduled meetings.',
        },
      ]}
      benefits={[
        'Focus on conversation, not note-taking',
        'Share meeting insights with absent team members',
        'Hold everyone accountable to action items',
        'Reference exact quotes and decisions',
        'Coach sales reps with call reviews',
        'Works with Zoom, Meet, and Teams',
      ]}
      useCases={[
        {
          title: 'Sales Calls',
          description: 'Record and analyze sales conversations for coaching.',
        },
        {
          title: 'Client Meetings',
          description: 'Capture requirements and decisions accurately.',
        },
        {
          title: 'Team Syncs',
          description: 'Keep everyone aligned with shared meeting notes.',
        },
      ]}
    />
  );
};

export default FeatureMeetingsAI;
