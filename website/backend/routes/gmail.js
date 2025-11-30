import express from 'express';
import crypto from 'crypto';
import gmailService from '../services/gmailService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Secret key for signing OAuth state (use env var in production)
const STATE_SECRET = process.env.OAUTH_STATE_SECRET || process.env.JWT_SECRET || 'oauth-state-secret-key';

/**
 * Generate a signed OAuth state token
 * Format: userId:timestamp:signature
 */
function generateSignedState(userId) {
  const timestamp = Date.now();
  const data = `${userId}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', STATE_SECRET)
    .update(data)
    .digest('hex')
    .substring(0, 16); // Use first 16 chars for brevity
  return `${data}:${signature}`;
}

/**
 * Verify and extract userId from signed state token
 * Returns userId if valid, null if invalid
 */
function verifySignedState(state) {
  try {
    const parts = state.split(':');
    if (parts.length !== 3) return null;

    const [userId, timestamp, providedSignature] = parts;

    // Check timestamp isn't too old (15 minutes max)
    const stateAge = Date.now() - parseInt(timestamp);
    const maxAge = 15 * 60 * 1000; // 15 minutes
    if (stateAge > maxAge) {
      console.warn('OAuth state token expired');
      return null;
    }

    // Verify signature
    const data = `${userId}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', STATE_SECRET)
      .update(data)
      .digest('hex')
      .substring(0, 16);

    if (providedSignature !== expectedSignature) {
      console.warn('OAuth state signature mismatch');
      return null;
    }

    return userId;
  } catch (error) {
    console.error('Error verifying OAuth state:', error);
    return null;
  }
}

// Route to initiate Gmail OAuth flow
router.get('/auth', protect, (req, res) => {
  try {
    const userId = req.user.id;
    // Generate signed state token instead of just userId
    const signedState = generateSignedState(userId);
    const authUrl = gmailService.getAuthUrl(signedState);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Gmail OAuth:', error);
    res.status(500).json({ message: 'Failed to initiate Gmail OAuth', error: error.message });
  }
});

// Route to handle Gmail OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).json({ message: 'Authorization code or state missing.' });
    }

    // Verify signed state and extract userId
    const userId = verifySignedState(state);
    if (!userId) {
      console.warn('Invalid or expired OAuth state token');
      return res.status(400).json({ message: 'Invalid or expired OAuth state. Please try again.' });
    }

    await gmailService.handleOAuthCallback(code, userId);

    // Redirect back to frontend, perhaps to a success page or the inbox
    res.redirect(`${process.env.FRONTEND_URL}/inbox?gmail_auth_success=true`);
  } catch (error) {
    console.error('Error handling Gmail OAuth callback:', error);
    res.status(500).json({ message: 'Failed to handle Gmail OAuth callback', error: error.message });
  }
});

// Route to get Gmail profile (e.g., email address)
router.get('/profile', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await gmailService.getGmailProfile(userId);
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching Gmail profile:', error);
    res.status(500).json({ message: 'Failed to fetch Gmail profile', error: error.message });
  }
});

// Route to get Gmail signature
router.get('/signature', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const signature = await gmailService.getGmailSignature(userId);
    res.status(200).json({ signature });
  } catch (error) {
    console.error('Error fetching Gmail signature:', error);
    res.status(500).json({ message: 'Failed to fetch Gmail signature', error: error.message });
  }
});

export default router;
