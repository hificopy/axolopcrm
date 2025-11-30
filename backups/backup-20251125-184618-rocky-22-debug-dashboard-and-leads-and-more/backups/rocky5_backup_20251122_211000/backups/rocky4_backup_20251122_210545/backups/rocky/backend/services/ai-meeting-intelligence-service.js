import { supabase } from '../config/supabase-auth.js';
import OpenAI from 'openai';

/**
 * AI Meeting Intelligence Service
 * Provides AI-powered meeting prep, insights, outcome prediction, and learning
 */
class AIMeetingIntelligenceService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generate pre-meeting brief with AI
   * Analyzes contact history, deal context, previous meetings
   */
  async generatePreMeetingBrief(eventId, userId) {
    try {
      // Get event details
      const { data: event } = await supabase
        .from('calendar_events')
        .select(`
          *,
          contacts(*),
          opportunities(*),
          leads(*)
        `)
        .eq('id', eventId)
        .single();

      if (!event) throw new Error('Event not found');

      // Gather context
      const context = await this.gatherMeetingContext(event, userId);

      // Generate AI brief
      const prompt = this.buildPreMeetingPrompt(event, context);
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert sales assistant helping prepare for meetings.
            Provide actionable, specific insights and talking points based on the context provided.
            Focus on helping the sales rep have a successful meeting.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const aiInsights = completion.choices[0].message.content;

      // Parse and structure the response
      const structuredBrief = this.parseAIBrief(aiInsights, context);

      // Save to database
      const { data: intelligence, error } = await supabase
        .from('calendar_meeting_intelligence')
        .upsert({
          calendar_event_id: eventId,
          attendee_insights: structuredBrief.attendeeInsights,
          recommended_talking_points: structuredBrief.talkingPoints,
          potential_objections: structuredBrief.objections,
          suggested_agenda: structuredBrief.agenda,
          competitor_intel: structuredBrief.competitorIntel,
          extracted_at: new Date().toISOString(),
          extraction_source: 'ai_generated'
        }, {
          onConflict: 'calendar_event_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Update event with AI prep data
      await supabase
        .from('calendar_events')
        .update({
          ai_prep_data: structuredBrief
        })
        .eq('id', eventId);

      return structuredBrief;
    } catch (error) {
      console.error('Error generating pre-meeting brief:', error);
      throw error;
    }
  }

  /**
   * Gather all relevant context for meeting
   */
  async gatherMeetingContext(event, userId) {
    const context = {
      contact: null,
      deal: null,
      previousMeetings: [],
      recentCommunications: [],
      companyInfo: null,
      dealHistory: []
    };

    try {
      // Get contact history if contact linked
      if (event.contact_id) {
        const { data: contact } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', event.contact_id)
          .single();
        context.contact = contact;

        // Get previous meetings with this contact
        const { data: previousMeetings } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('contact_id', event.contact_id)
          .eq('status', 'completed')
          .order('start_time', { ascending: false })
          .limit(5);
        context.previousMeetings = previousMeetings || [];
      }

      // Get deal information if deal linked
      if (event.deal_id) {
        const { data: deal } = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', event.deal_id)
          .single();
        context.deal = deal;

        // Get deal activity history
        const { data: dealHistory } = await supabase
          .from('crm_activities')
          .select('*')
          .eq('opportunity_id', event.deal_id)
          .order('created_at', { ascending: false })
          .limit(10);
        context.dealHistory = dealHistory || [];
      }

      // Get recent email communications
      if (event.contact_id) {
        const { data: emails } = await supabase
          .from('emails')
          .select('*')
          .eq('contact_id', event.contact_id)
          .order('sent_at', { ascending: false })
          .limit(5);
        context.recentCommunications = emails || [];
      }

      return context;
    } catch (error) {
      console.error('Error gathering meeting context:', error);
      return context;
    }
  }

  /**
   * Build prompt for AI pre-meeting brief
   */
  buildPreMeetingPrompt(event, context) {
    let prompt = `I'm preparing for a ${event.event_type} meeting titled "${event.title}" scheduled for ${event.start_time}.\n\n`;

    if (context.contact) {
      prompt += `**Contact Information:**\n`;
      prompt += `Name: ${context.contact.first_name} ${context.contact.last_name}\n`;
      prompt += `Title: ${context.contact.title || 'Unknown'}\n`;
      prompt += `Company: ${context.contact.company || 'Unknown'}\n`;
      prompt += `Email: ${context.contact.email}\n\n`;
    }

    if (context.deal) {
      prompt += `**Deal Information:**\n`;
      prompt += `Deal: ${context.deal.name}\n`;
      prompt += `Value: $${context.deal.value}\n`;
      prompt += `Stage: ${context.deal.stage}\n`;
      prompt += `Probability: ${context.deal.probability}%\n`;
      prompt += `Close Date: ${context.deal.expected_close_date}\n\n`;
    }

    if (context.previousMeetings.length > 0) {
      prompt += `**Previous Meetings:**\n`;
      context.previousMeetings.forEach(meeting => {
        prompt += `- ${meeting.title} on ${meeting.start_time}: ${meeting.outcome_notes || 'No notes'}\n`;
      });
      prompt += `\n`;
    }

    if (context.dealHistory.length > 0) {
      prompt += `**Recent Activity:**\n`;
      context.dealHistory.slice(0, 3).forEach(activity => {
        prompt += `- ${activity.type}: ${activity.notes || 'No notes'}\n`;
      });
      prompt += `\n`;
    }

    prompt += `Please provide:\n`;
    prompt += `1. Key insights about the attendees and their needs\n`;
    prompt += `2. Recommended talking points for this meeting\n`;
    prompt += `3. Potential objections I should be prepared for\n`;
    prompt += `4. A suggested meeting agenda\n`;
    prompt += `5. Any competitive intelligence I should be aware of\n\n`;
    prompt += `Format your response in a structured way with clear sections.`;

    return prompt;
  }

  /**
   * Parse AI response into structured format
   */
  parseAIBrief(aiResponse, context) {
    // Simple parsing - in production, use more sophisticated NLP
    const sections = {
      attendeeInsights: {},
      talkingPoints: [],
      objections: [],
      agenda: [],
      competitorIntel: {}
    };

    try {
      // Extract sections using regex or simple string matching
      const lines = aiResponse.split('\n');
      let currentSection = null;

      lines.forEach(line => {
        const trimmed = line.trim();

        if (trimmed.toLowerCase().includes('key insights') || trimmed.toLowerCase().includes('attendee')) {
          currentSection = 'insights';
        } else if (trimmed.toLowerCase().includes('talking points')) {
          currentSection = 'talking';
        } else if (trimmed.toLowerCase().includes('objections')) {
          currentSection = 'objections';
        } else if (trimmed.toLowerCase().includes('agenda')) {
          currentSection = 'agenda';
        } else if (trimmed.toLowerCase().includes('competitive') || trimmed.toLowerCase().includes('competitor')) {
          currentSection = 'competitor';
        } else if (trimmed.startsWith('- ') || trimmed.match(/^\d+\./)) {
          const item = trimmed.replace(/^- /, '').replace(/^\d+\.\s*/, '');

          if (currentSection === 'talking') {
            sections.talkingPoints.push(item);
          } else if (currentSection === 'objections') {
            sections.objections.push(item);
          } else if (currentSection === 'agenda') {
            sections.agenda.push(item);
          }
        }
      });

      // Add context-based insights
      if (context.contact) {
        sections.attendeeInsights[context.contact.email] = {
          name: `${context.contact.first_name} ${context.contact.last_name}`,
          title: context.contact.title,
          previousMeetings: context.previousMeetings.length,
          lastInteraction: context.previousMeetings[0]?.start_time,
          engagement: context.previousMeetings.length > 3 ? 'high' : 'medium'
        };
      }

      return sections;
    } catch (error) {
      console.error('Error parsing AI brief:', error);
      return sections;
    }
  }

  /**
   * Predict meeting outcome using AI
   * Based on historical patterns and current context
   */
  async predictMeetingOutcome(eventId, userId) {
    try {
      const context = await this.gatherPredictionContext(eventId, userId);
      const patterns = await this.getHistoricalPatterns(userId);

      const prompt = `Based on the following context, predict the likely outcome of this meeting and suggest next steps:\n\n${JSON.stringify(context, null, 2)}\n\nHistorical patterns:\n${JSON.stringify(patterns, null, 2)}\n\nProvide a predicted outcome (won, lost, follow_up_needed, qualified) and suggested next steps.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a sales analytics expert predicting meeting outcomes based on historical data and current context.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 500
      });

      const prediction = completion.choices[0].message.content;

      // Update event with prediction
      await supabase
        .from('calendar_events')
        .update({
          ai_suggested_outcome: this.extractOutcome(prediction),
          ai_next_steps: this.extractNextSteps(prediction)
        })
        .eq('id', eventId);

      return {
        prediction,
        suggestedOutcome: this.extractOutcome(prediction),
        nextSteps: this.extractNextSteps(prediction),
        confidence: this.calculateConfidence(context, patterns)
      };
    } catch (error) {
      console.error('Error predicting meeting outcome:', error);
      throw error;
    }
  }

  /**
   * Learn from meeting outcomes to improve future predictions
   */
  async learnFromOutcome(eventId, userId, actualOutcome) {
    try {
      // Get event and prediction
      const { data: event } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!event) return;

      // Extract pattern from this meeting
      const pattern = {
        pattern_type: 'outcome_prediction',
        pattern_name: `${event.event_type}_${actualOutcome}`,
        pattern_data: {
          event_type: event.event_type,
          deal_stage: event.opportunities?.stage,
          meeting_duration: this.calculateDuration(event.start_time, event.end_time),
          predicted_outcome: event.ai_suggested_outcome,
          actual_outcome: actualOutcome,
          was_accurate: event.ai_suggested_outcome === actualOutcome
        },
        confidence_score: event.ai_suggested_outcome === actualOutcome ? 1.0 : 0.0,
        occurrence_count: 1,
        last_occurrence: new Date().toISOString(),
        context: {
          event_type: event.event_type,
          category: event.category
        },
        is_active: true
      };

      // Save or update pattern
      const { data: existingPattern } = await supabase
        .from('calendar_ai_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('pattern_type', 'outcome_prediction')
        .eq('pattern_name', pattern.pattern_name)
        .single();

      if (existingPattern) {
        // Update existing pattern
        await supabase
          .from('calendar_ai_patterns')
          .update({
            occurrence_count: existingPattern.occurrence_count + 1,
            confidence_score: this.updateConfidence(existingPattern, pattern.pattern_data.was_accurate),
            last_occurrence: new Date().toISOString(),
            pattern_data: this.mergePatternData(existingPattern.pattern_data, pattern.pattern_data)
          })
          .eq('id', existingPattern.id);
      } else {
        // Create new pattern
        await supabase
          .from('calendar_ai_patterns')
          .insert({
            user_id: userId,
            ...pattern
          });
      }

      return { success: true };
    } catch (error) {
      console.error('Error learning from outcome:', error);
      throw error;
    }
  }

  /**
   * Suggest event delegation based on learned patterns
   */
  async suggestDelegation(eventId, userId) {
    try {
      // Get event details
      const { data: event } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', eventId)
        .single();

      // Get delegation patterns
      const { data: patterns } = await supabase
        .from('calendar_ai_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('pattern_type', 'delegation_preference')
        .eq('is_active', true)
        .order('confidence_score', { ascending: false });

      if (!patterns || patterns.length === 0) {
        return { shouldDelegate: false, reason: 'No delegation patterns learned yet' };
      }

      // Check if this event matches delegation criteria
      for (const pattern of patterns) {
        if (this.matchesPattern(event, pattern)) {
          return {
            shouldDelegate: true,
            suggestedPerson: pattern.pattern_data.delegated_to,
            reason: pattern.pattern_data.reason,
            confidence: pattern.confidence_score
          };
        }
      }

      return { shouldDelegate: false };
    } catch (error) {
      console.error('Error suggesting delegation:', error);
      throw error;
    }
  }

  /**
   * Learn scheduling preferences (time of day, day of week, duration)
   */
  async learnSchedulingPreferences(userId) {
    try {
      // Get completed meetings
      const { data: meetings } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .not('outcome', 'is', null)
        .order('start_time', { ascending: false })
        .limit(100);

      if (!meetings || meetings.length === 0) return null;

      // Analyze patterns
      const preferences = {
        bestTimeOfDay: this.analyzeBestTimeOfDay(meetings),
        bestDayOfWeek: this.analyzeBestDayOfWeek(meetings),
        optimalDuration: this.analyzeOptimalDuration(meetings),
        preferredMeetingTypes: this.analyzePreferredTypes(meetings)
      };

      // Save as AI pattern
      await supabase
        .from('calendar_ai_patterns')
        .upsert({
          user_id: userId,
          pattern_type: 'scheduling_preference',
          pattern_name: 'user_scheduling_preferences',
          pattern_data: preferences,
          confidence_score: this.calculatePreferenceConfidence(meetings),
          occurrence_count: meetings.length,
          last_occurrence: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'user_id,pattern_type,pattern_name'
        });

      return preferences;
    } catch (error) {
      console.error('Error learning scheduling preferences:', error);
      throw error;
    }
  }

  /**
   * Generate AI suggestions for user
   */
  async generateSuggestions(userId) {
    try {
      const suggestions = [];

      // Get upcoming events
      const { data: upcomingEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'scheduled')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      for (const event of upcomingEvents || []) {
        // Suggest follow-up meetings
        if (event.event_type === 'demo' && !event.ai_prep_data) {
          suggestions.push({
            suggestion_type: 'create_event',
            title: 'Schedule follow-up call',
            description: `Based on patterns, demos typically need a follow-up call within 3 days`,
            reasoning: 'Historical data shows 70% of successful demos have a follow-up scheduled within 3 days',
            confidence_score: 0.85,
            suggested_data: {
              event_type: 'follow_up',
              duration: 30,
              days_after: 3,
              related_event_id: event.id
            },
            related_event_id: event.id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }

        // Suggest prep if meeting is tomorrow
        const hoursUntil = (new Date(event.start_time) - new Date()) / (1000 * 60 * 60);
        if (hoursUntil < 24 && hoursUntil > 0 && !event.ai_prep_data) {
          suggestions.push({
            suggestion_type: 'generate_prep',
            title: 'Generate meeting prep',
            description: `Get AI-powered insights for your meeting with ${event.title}`,
            reasoning: 'Meeting is in less than 24 hours',
            confidence_score: 1.0,
            suggested_data: {
              event_id: event.id
            },
            related_event_id: event.id,
            expires_at: event.start_time
          });
        }
      }

      // Save suggestions
      for (const suggestion of suggestions) {
        await supabase
          .from('calendar_ai_suggestions')
          .insert({
            user_id: userId,
            ...suggestion,
            status: 'pending'
          });
      }

      return suggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw error;
    }
  }

  // Helper methods
  calculateDuration(start, end) {
    return (new Date(end) - new Date(start)) / (1000 * 60); // minutes
  }

  extractOutcome(text) {
    const outcomes = ['won', 'lost', 'follow_up_needed', 'qualified', 'not_qualified'];
    for (const outcome of outcomes) {
      if (text.toLowerCase().includes(outcome.replace('_', ' '))) {
        return outcome;
      }
    }
    return 'follow_up_needed';
  }

  extractNextSteps(text) {
    // Simple extraction - look for numbered lists or bullet points
    const lines = text.split('\n');
    const steps = [];

    lines.forEach(line => {
      if (line.match(/^\d+\./) || line.match(/^-\s/)) {
        steps.push(line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim());
      }
    });

    return steps;
  }

  calculateConfidence(context, patterns) {
    // Calculate confidence based on amount of historical data
    const dataPoints = patterns.length + (context.previousMeetings?.length || 0);
    return Math.min(dataPoints / 10, 1.0);
  }

  async gatherPredictionContext(eventId, userId) {
    const { data: event } = await supabase
      .from('calendar_events')
      .select('*, opportunities(*), contacts(*)')
      .eq('id', eventId)
      .single();

    return {
      eventType: event.event_type,
      dealStage: event.opportunities?.stage,
      dealValue: event.opportunities?.value,
      contactEngagement: await this.getContactEngagement(event.contact_id)
    };
  }

  async getContactEngagement(contactId) {
    if (!contactId) return 'unknown';

    const { data: interactions } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('contact_id', contactId)
      .eq('status', 'completed');

    const count = interactions?.length || 0;
    if (count > 5) return 'high';
    if (count > 2) return 'medium';
    return 'low';
  }

  async getHistoricalPatterns(userId) {
    const { data } = await supabase
      .from('calendar_ai_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('pattern_type', 'outcome_prediction')
      .order('confidence_score', { ascending: false })
      .limit(10);

    return data || [];
  }

  updateConfidence(existingPattern, wasAccurate) {
    const total = existingPattern.occurrence_count + 1;
    const currentCorrect = existingPattern.confidence_score * existingPattern.occurrence_count;
    const newCorrect = currentCorrect + (wasAccurate ? 1 : 0);
    return newCorrect / total;
  }

  mergePatternData(existing, newData) {
    return {
      ...existing,
      recent_outcome: newData.actual_outcome,
      accuracy_rate: this.calculateAccuracyRate(existing, newData)
    };
  }

  calculateAccuracyRate(existing, newData) {
    // Calculate what % of predictions were accurate
    return existing.accuracy_rate || 0.5;
  }

  matchesPattern(event, pattern) {
    const eventContext = {
      event_type: event.event_type,
      category: event.category
    };

    const patternContext = pattern.context || {};

    return eventContext.event_type === patternContext.event_type &&
           eventContext.category === patternContext.category;
  }

  analyzeBestTimeOfDay(meetings) {
    const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
    const successful = { morning: 0, afternoon: 0, evening: 0 };

    meetings.forEach(meeting => {
      const hour = new Date(meeting.start_time).getHours();
      let slot;

      if (hour < 12) slot = 'morning';
      else if (hour < 17) slot = 'afternoon';
      else slot = 'evening';

      timeSlots[slot]++;
      if (meeting.outcome === 'won' || meeting.outcome === 'qualified') {
        successful[slot]++;
      }
    });

    let bestSlot = 'morning';
    let bestRate = 0;

    Object.keys(timeSlots).forEach(slot => {
      const rate = timeSlots[slot] > 0 ? successful[slot] / timeSlots[slot] : 0;
      if (rate > bestRate) {
        bestRate = rate;
        bestSlot = slot;
      }
    });

    return { slot: bestSlot, successRate: bestRate };
  }

  analyzeBestDayOfWeek(meetings) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts = new Array(7).fill(0);
    const successful = new Array(7).fill(0);

    meetings.forEach(meeting => {
      const dayIndex = new Date(meeting.start_time).getDay();
      counts[dayIndex]++;
      if (meeting.outcome === 'won' || meeting.outcome === 'qualified') {
        successful[dayIndex]++;
      }
    });

    let bestDay = 1; // Default to Monday
    let bestRate = 0;

    counts.forEach((count, index) => {
      if (count > 0) {
        const rate = successful[index] / count;
        if (rate > bestRate) {
          bestRate = rate;
          bestDay = index;
        }
      }
    });

    return { day: days[bestDay], dayIndex: bestDay, successRate: bestRate };
  }

  analyzeOptimalDuration(meetings) {
    const durations = meetings.map(m => this.calculateDuration(m.start_time, m.end_time));
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    return Math.round(avg / 15) * 15; // Round to nearest 15 minutes
  }

  analyzePreferredTypes(meetings) {
    const types = {};

    meetings.forEach(meeting => {
      types[meeting.event_type] = (types[meeting.event_type] || 0) + 1;
    });

    return Object.entries(types)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));
  }

  calculatePreferenceConfidence(meetings) {
    return Math.min(meetings.length / 50, 1.0);
  }
}

const aiMeetingIntelligenceService = new AIMeetingIntelligenceService();
export default aiMeetingIntelligenceService;
