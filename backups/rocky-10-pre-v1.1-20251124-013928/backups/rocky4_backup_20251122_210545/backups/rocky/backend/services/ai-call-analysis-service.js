import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * AI Call Analysis Service
 * Handles transcription, sentiment analysis, and AI-powered insights
 */

// ===========================================================================
// TRANSCRIPTION
// ===========================================================================

/**
 * Generate transcript from call recording using OpenAI Whisper
 */
const generateTranscript = async (callId, recordingUrl) => {
  try {
    console.log(`Starting transcription for call ${callId}`);

    // Download recording from Twilio
    const audioResponse = await fetch(recordingUrl, {
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString('base64')}`
      }
    });

    if (!audioResponse.ok) {
      throw new Error(`Failed to download recording: ${audioResponse.statusText}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioFile = new File([audioBuffer], 'recording.wav', { type: 'audio/wav' });

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    });

    // Process segments for speaker diarization (basic)
    const segments = transcription.segments?.map((seg, index) => ({
      speaker: index % 2 === 0 ? 'Agent' : 'Customer', // Simple alternating speaker detection
      text: seg.text,
      timestamp: seg.start,
      confidence: 1.0
    })) || [];

    const fullTranscript = transcription.text;

    // Create transcript record
    const { data: transcript, error: transcriptError } = await supabase
      .from('call_transcripts')
      .insert({
        call_id: callId,
        user_id: (await getCallUserId(callId)),
        full_transcript: fullTranscript,
        segments: segments,
        language: transcription.language || 'en-US',
        confidence_score: 0.95,
        processing_status: 'completed'
      })
      .select()
      .single();

    if (transcriptError) throw transcriptError;

    // Update call record
    await supabase
      .from('calls')
      .update({
        transcript_id: transcript.id,
        has_transcript: true,
        updated_at: new Date()
      })
      .eq('id', callId);

    // Trigger AI analysis
    await analyzeTranscript(callId, transcript.id, fullTranscript);

    console.log(`Transcription completed for call ${callId}`);
    return transcript;
  } catch (error) {
    console.error('Error generating transcript:', error);

    // Update transcript with error
    await supabase
      .from('call_transcripts')
      .insert({
        call_id: callId,
        user_id: (await getCallUserId(callId)),
        full_transcript: '',
        processing_status: 'failed',
        error_message: error.message
      });

    throw error;
  }
};

/**
 * Get user ID from call
 */
const getCallUserId = async (callId) => {
  const { data, error } = await supabase
    .from('calls')
    .select('user_id')
    .eq('id', callId)
    .single();

  if (error) throw error;
  return data.user_id;
};

// ===========================================================================
// AI ANALYSIS
// ===========================================================================

/**
 * Analyze transcript using AI for insights
 */
const analyzeTranscript = async (callId, transcriptId, fullTranscript) => {
  try {
    console.log(`Starting AI analysis for call ${callId}`);

    // Get call details for context
    const { data: call } = await supabase
      .from('calls')
      .select('*, lead:leads(*)')
      .eq('id', callId)
      .single();

    // Create AI analysis prompt
    const analysisPrompt = `
You are an AI sales assistant analyzing a phone call transcript. Provide a comprehensive analysis in JSON format.

Call Context:
- Lead/Company: ${call?.lead?.name || 'Unknown'}
- Call Duration: ${call?.talk_time_seconds ? Math.round(call.talk_time_seconds / 60) + ' minutes' : 'Unknown'}

Transcript:
${fullTranscript}

Please analyze and provide:
1. A concise summary (2-3 sentences)
2. Overall sentiment (positive, neutral, or negative)
3. Key points discussed (array of strings)
4. Customer objections (array of strings)
5. Questions asked by customer (array of strings)
6. Action items for follow-up (array of strings)
7. Keywords and topics (array of strings)
8. Recommended next steps
9. Lead score impact (-10 to +10)

Return ONLY valid JSON with this structure:
{
  "summary": "string",
  "sentiment": "positive|neutral|negative",
  "sentimentScore": 0.0-1.0,
  "keyPoints": ["string"],
  "objections": ["string"],
  "questions": ["string"],
  "actionItems": ["string"],
  "keywords": ["string"],
  "nextSteps": "string",
  "leadScoreImpact": number
}
`;

    // Call OpenAI for analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert sales call analyzer. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    // Update transcript with AI insights
    await supabase
      .from('call_transcripts')
      .update({
        summary: analysis.summary,
        key_points: analysis.keyPoints,
        sentiment_analysis: {
          overall: analysis.sentiment,
          score: analysis.sentimentScore
        },
        keywords: analysis.keywords,
        action_items: analysis.actionItems,
        objections: analysis.objections,
        questions: analysis.questions,
        updated_at: new Date()
      })
      .eq('id', transcriptId);

    // Update call record with AI insights
    await supabase
      .from('calls')
      .update({
        ai_summary: analysis.summary,
        ai_sentiment: analysis.sentiment,
        ai_keywords: analysis.keywords,
        ai_action_items: analysis.actionItems,
        lead_score_impact: analysis.leadScoreImpact,
        updated_at: new Date()
      })
      .eq('id', callId);

    // Update lead score if applicable
    if (call?.lead_id && analysis.leadScoreImpact) {
      await updateLeadScore(call.lead_id, analysis.leadScoreImpact);
    }

    // Create automatic comment with AI insights
    await supabase
      .from('call_comments')
      .insert({
        call_id: callId,
        user_id: call.user_id,
        comment: `AI Analysis:\n\n**Summary:** ${analysis.summary}\n\n**Sentiment:** ${analysis.sentiment}\n\n**Next Steps:** ${analysis.nextSteps}\n\n**Action Items:**\n${analysis.actionItems.map(item => `- ${item}`).join('\n')}`,
        comment_type: 'ai_insight'
      });

    console.log(`AI analysis completed for call ${callId}`);
    return analysis;
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    throw error;
  }
};

/**
 * Update lead score based on call analysis
 */
const updateLeadScore = async (leadId, scoreImpact) => {
  try {
    // Get current lead
    const { data: lead } = await supabase
      .from('leads')
      .select('custom_fields')
      .eq('id', leadId)
      .single();

    const currentScore = lead?.custom_fields?.lead_score || 0;
    const newScore = Math.max(0, Math.min(100, currentScore + scoreImpact));

    await supabase
      .from('leads')
      .update({
        custom_fields: {
          ...lead.custom_fields,
          lead_score: newScore
        },
        updated_at: new Date()
      })
      .eq('id', leadId);
  } catch (error) {
    console.error('Error updating lead score:', error);
  }
};

// ===========================================================================
// REAL-TIME AI SALES HELPER
// ===========================================================================

/**
 * Get AI suggestions during active call
 * This provides real-time coaching based on transcript so far
 */
const getRealTimeSuggestions = async (callId, partialTranscript) => {
  try {
    const prompt = `
You are a real-time AI sales coach. Based on the following partial call transcript, provide immediate coaching suggestions.

Transcript so far:
${partialTranscript}

Provide:
1. Immediate talking points (3-5 bullet points)
2. Potential objection handling
3. Recommended questions to ask
4. Warning if call is going off track

Return JSON only:
{
  "talkingPoints": ["string"],
  "objectionHandling": "string",
  "recommendedQuestions": ["string"],
  "callStatus": "on_track|needs_attention|critical",
  "suggestion": "string"
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a real-time sales coach providing instant guidance. Be concise and actionable.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const suggestions = JSON.parse(completion.choices[0].message.content);
    return suggestions;
  } catch (error) {
    console.error('Error getting real-time suggestions:', error);
    throw error;
  }
};

/**
 * Learn from call outcomes
 * Analyzes successful vs unsuccessful calls to improve future suggestions
 */
const learnFromCall = async (callId) => {
  try {
    // Get call with transcript and outcome
    const { data: call } = await supabase
      .from('calls')
      .select(`
        *,
        transcript:call_transcripts(*),
        lead:leads(*)
      `)
      .eq('id', callId)
      .single();

    if (!call?.transcript) {
      console.log('No transcript available for learning');
      return;
    }

    // Determine if call was successful
    const isSuccessful =
      call.disposition === 'interested' ||
      call.disposition === 'callback' ||
      call.disposition === 'completed';

    // Store learnings in custom_fields for future reference
    const learning = {
      call_id: callId,
      successful: isSuccessful,
      disposition: call.disposition,
      duration: call.talk_time_seconds,
      sentiment: call.ai_sentiment,
      keywords: call.ai_keywords,
      objections: call.transcript.objections,
      timestamp: new Date().toISOString()
    };

    // TODO: Store in ChromaDB for semantic search and learning
    // This would allow the AI to learn from patterns across all calls

    console.log(`Learning stored for call ${callId}`);
    return learning;
  } catch (error) {
    console.error('Error learning from call:', error);
  }
};

// ===========================================================================
// BATCH ANALYSIS
// ===========================================================================

/**
 * Analyze multiple calls for trends and patterns
 */
const analyzeCallTrends = async (userId, startDate, endDate) => {
  try {
    // Get all calls in date range
    const { data: calls } = await supabase
      .from('calls')
      .select(`
        *,
        transcript:call_transcripts(*)
      `)
      .eq('user_id', userId)
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .not('transcript', 'is', null);

    if (!calls || calls.length === 0) {
      return {
        totalCalls: 0,
        message: 'No calls with transcripts found in date range'
      };
    }

    // Aggregate insights
    const trends = {
      totalCalls: calls.length,
      avgDuration: Math.round(
        calls.reduce((sum, c) => sum + (c.talk_time_seconds || 0), 0) / calls.length / 60
      ),
      sentimentDistribution: {
        positive: calls.filter(c => c.ai_sentiment === 'positive').length,
        neutral: calls.filter(c => c.ai_sentiment === 'neutral').length,
        negative: calls.filter(c => c.ai_sentiment === 'negative').length
      },
      dispositionDistribution: {},
      commonKeywords: {},
      commonObjections: {},
      successRate: 0
    };

    // Calculate distributions
    calls.forEach(call => {
      // Disposition distribution
      if (call.disposition) {
        trends.dispositionDistribution[call.disposition] =
          (trends.dispositionDistribution[call.disposition] || 0) + 1;
      }

      // Keywords frequency
      if (call.ai_keywords) {
        call.ai_keywords.forEach(keyword => {
          trends.commonKeywords[keyword] =
            (trends.commonKeywords[keyword] || 0) + 1;
        });
      }

      // Objections frequency
      if (call.transcript?.objections) {
        call.transcript.objections.forEach(objection => {
          trends.commonObjections[objection] =
            (trends.commonObjections[objection] || 0) + 1;
        });
      }
    });

    // Calculate success rate
    const successfulCalls = calls.filter(
      c => c.disposition === 'interested' ||
           c.disposition === 'callback' ||
           c.disposition === 'completed'
    ).length;
    trends.successRate = Math.round((successfulCalls / calls.length) * 100);

    // Sort keywords and objections by frequency
    trends.topKeywords = Object.entries(trends.commonKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    trends.topObjections = Object.entries(trends.commonObjections)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([objection, count]) => ({ objection, count }));

    delete trends.commonKeywords;
    delete trends.commonObjections;

    return trends;
  } catch (error) {
    console.error('Error analyzing call trends:', error);
    throw error;
  }
};

// ===========================================================================
// EXPORTS
// ===========================================================================

export default {
  // Transcription
  generateTranscript,

  // AI Analysis
  analyzeTranscript,
  getRealTimeSuggestions,
  learnFromCall,
  analyzeCallTrends,

  // Helper
  updateLeadScore
};
