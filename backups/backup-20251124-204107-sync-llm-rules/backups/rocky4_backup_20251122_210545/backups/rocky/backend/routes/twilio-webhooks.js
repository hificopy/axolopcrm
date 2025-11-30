import express from 'express';
import twilio from 'twilio';
import callService from '../services/call-service.js';
import aiCallAnalysisService from '../services/ai-call-analysis-service.js';

const router = express.Router();

// Twilio webhook validation middleware
const validateTwilioRequest = (req, res, next) => {
  const twilioSignature = req.headers['x-twilio-signature'];
  const url = `${process.env.BACKEND_URL}${req.originalUrl}`;

  // Skip validation in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const valid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    twilioSignature,
    url,
    req.body
  );

  if (!valid) {
    return res.status(403).json({ error: 'Invalid Twilio signature' });
  }

  next();
};

/**
 * Twilio Webhook Handlers
 * Handle callbacks from Twilio for voice calls, status updates, and recordings
 */

// ===========================================================================
// VOICE WEBHOOK
// ===========================================================================

/**
 * POST /api/webhooks/twilio/voice/:callId
 * Handles incoming Twilio voice webhook
 * Returns TwiML to control the call
 */
router.post('/voice/:callId', validateTwilioRequest, async (req, res) => {
  try {
    const { callId } = req.params;
    const { CallSid, From, To, CallStatus } = req.body;

    console.log(`Voice webhook for call ${callId}:`, { CallSid, From, To, CallStatus });

    // Generate TwiML response
    const twiml = new twilio.twiml.VoiceResponse();

    // Simple greeting (you can customize this)
    twiml.say(
      { voice: 'alice', language: 'en-US' },
      'Please hold while we connect your call.'
    );

    // Connect to agent (in real implementation, this would connect to WebRTC)
    // For now, we'll just hang up after greeting
    twiml.pause({ length: 2 });

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling voice webhook:', error);

    // Return error TwiML
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('An error occurred. Please try again later.');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// ===========================================================================
// STATUS CALLBACK WEBHOOK
// ===========================================================================

/**
 * POST /api/webhooks/twilio/status/:callId
 * Handles call status updates from Twilio
 */
router.post('/status/:callId', validateTwilioRequest, async (req, res) => {
  try {
    const { callId } = req.params;
    const {
      CallSid,
      CallStatus,
      CallDuration,
      From,
      To,
      Direction,
      AnsweredBy
    } = req.body;

    console.log(`Status webhook for call ${callId}:`, {
      CallSid,
      CallStatus,
      CallDuration,
      Direction,
      AnsweredBy
    });

    // Map Twilio status to our status
    const statusMap = {
      'queued': 'initiated',
      'initiated': 'initiated',
      'ringing': 'ringing',
      'in-progress': 'answered',
      'completed': 'ended',
      'busy': 'failed',
      'no-answer': 'failed',
      'canceled': 'failed',
      'failed': 'failed'
    };

    const ourStatus = statusMap[CallStatus] || 'initiated';

    // Update call status in database
    const updateData = {
      status: ourStatus,
      provider_call_id: CallSid
    };

    // Set answered time if call was answered
    if (CallStatus === 'in-progress' && !req.body.AnsweredTime) {
      updateData.answeredAt = new Date();
    }

    // Set end time and duration if call completed
    if (CallStatus === 'completed') {
      updateData.endedAt = new Date();
      updateData.durationSeconds = parseInt(CallDuration) || 0;
      updateData.talkTimeSeconds = parseInt(CallDuration) || 0;

      // Set disposition based on answered by
      if (AnsweredBy === 'machine_start' || AnsweredBy === 'machine_end_beep') {
        updateData.disposition = 'voicemail';
      } else if (AnsweredBy === 'human') {
        // Leave disposition for agent to set
      }
    }

    // Set disposition for failed calls
    if (['busy', 'no-answer', 'canceled', 'failed'].includes(CallStatus)) {
      if (CallStatus === 'busy') {
        updateData.disposition = 'busy';
      } else if (CallStatus === 'no-answer') {
        updateData.disposition = 'no_answer';
      } else {
        updateData.disposition = 'failed';
      }
    }

    await callService.updateCallStatus(callId, updateData);

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling status webhook:', error);
    // Don't fail the webhook - Twilio will retry
    res.status(200).send('OK');
  }
});

// ===========================================================================
// RECORDING CALLBACK WEBHOOK
// ===========================================================================

/**
 * POST /api/webhooks/twilio/recording/:callId
 * Handles recording completion from Twilio
 */
router.post('/recording/:callId', validateTwilioRequest, async (req, res) => {
  try {
    const { callId } = req.params;
    const {
      RecordingSid,
      RecordingUrl,
      RecordingDuration,
      CallSid
    } = req.body;

    console.log(`Recording webhook for call ${callId}:`, {
      RecordingSid,
      RecordingUrl,
      RecordingDuration
    });

    // Process recording
    const recordingData = {
      recordingSid: RecordingSid,
      recordingUrl: RecordingUrl,
      duration: RecordingDuration
    };

    await callService.processCallRecording(callId, recordingData);

    // Trigger transcript generation if enabled
    if (process.env.ENABLE_AI_TRANSCRIPTION === 'true') {
      // Generate transcript asynchronously
      setTimeout(async () => {
        try {
          await aiCallAnalysisService.generateTranscript(callId, RecordingUrl);
        } catch (error) {
          console.error('Error generating transcript:', error);
        }
      }, 1000);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling recording webhook:', error);
    // Don't fail the webhook - Twilio will retry
    res.status(200).send('OK');
  }
});

// ===========================================================================
// FALLBACK WEBHOOK
// ===========================================================================

/**
 * POST /api/webhooks/twilio/fallback
 * Handles Twilio fallback webhook when errors occur
 */
router.post('/fallback', validateTwilioRequest, async (req, res) => {
  try {
    console.error('Twilio fallback webhook triggered:', req.body);

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('We are experiencing technical difficulties. Please try again later.');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling fallback webhook:', error);
    res.status(500).send('Error');
  }
});

// ===========================================================================
// TEST ENDPOINT (Development only)
// ===========================================================================

/**
 * POST /api/webhooks/twilio/test
 * Test endpoint to simulate webhooks in development
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test/:type/:callId', async (req, res) => {
    try {
      const { type, callId } = req.params;

      switch (type) {
        case 'status':
          await router.handle(
            { ...req, url: `/status/${callId}`, originalUrl: `/api/webhooks/twilio/status/${callId}` },
            res,
            () => {}
          );
          break;

        case 'recording':
          await router.handle(
            { ...req, url: `/recording/${callId}`, originalUrl: `/api/webhooks/twilio/recording/${callId}` },
            res,
            () => {}
          );
          break;

        default:
          res.status(400).json({ error: 'Invalid test type' });
      }
    } catch (error) {
      console.error('Error in test endpoint:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

export default router;
