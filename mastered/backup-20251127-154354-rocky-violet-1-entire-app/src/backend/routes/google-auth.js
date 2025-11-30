import express from 'express';
import googleAuthService from '../services/google-auth-service.js';
import { authenticateUser } from '../middleware/auth.js';
import config from '../config/app.config.js';
import logger from '../utils/logger.js';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);

/**
 * GET /api/v1/auth/google/url
 * Get Google OAuth consent URL
 */
router.get('/url', (req, res) => {
  try {
    if (!config.google.enabled) {
      return res.status(400).json({
        error: 'Google authentication is not configured',
        message: 'Please set up GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables'
      });
    }

    const authUrl = googleAuthService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    logger.error('Error generating Google auth URL:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate Google authentication URL'
    });
  }
});

/**
 * GET /api/v1/auth/google/callback
 * Google OAuth callback endpoint
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.status(400).json({
        error: 'OAuth Error',
        message: error
      });
    }

    if (!code) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Authorization code is missing'
      });
    }

    // Exchange code for tokens
    const tokens = await googleAuthService.exchangeCodeForTokens(code);

    // Authenticate user and create/update in Supabase
    const result = await googleAuthService.authenticateUser(tokens);

    // In a real implementation, you'd typically redirect to frontend with the token
    // For now, we'll send it in the response - in production, redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const token = Buffer.from(JSON.stringify(result)).toString('base64');

    // Redirect to frontend with the token
    res.redirect(`${frontendUrl}/auth/google/success?token=${encodeURIComponent(token)}`);
  } catch (error) {
    logger.error('Error in Google OAuth callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/google/error?message=${encodeURIComponent(error.message)}`);
  }
});

/**
 * POST /api/v1/auth/google/token
 * Exchange Google ID token for internal JWT token (alternative flow)
 */
router.post('/token', async (req, res) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'ID token is required'
      });
    }

    // This would require additional implementation to verify the ID token
    // and potentially create/update user in Supabase
    // For now, this is a placeholder for the token exchange flow

    res.status(501).json({
      error: 'Not Implemented',
      message: 'Google ID token verification endpoint not yet implemented'
    });
  } catch (error) {
    logger.error('Error in Google token exchange:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to exchange Google token'
    });
  }
});

/**
 * POST /api/v1/auth/google/revoke
 * Revoke Google tokens for current user
 */
router.post('/revoke', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    await googleAuthService.revokeTokens(userId);

    res.json({
      success: true,
      message: 'Google tokens revoked successfully'
    });
  } catch (error) {
    logger.error('Error revoking Google tokens:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to revoke Google tokens'
    });
  }
});

/**
 * GET /api/v1/auth/google/status
 * Check Google auth status for current user
 */
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has Google tokens in database
    const { data: user, error } = await supabase
      .from('users')
      .select('google_access_token, google_refresh_token, google_token_expires_at')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch Google auth status'
      });
    }

    const hasGoogleAuth = !!(user && user.google_access_token && user.google_refresh_token);

    res.json({
      success: true,
      data: {
        hasGoogleAuth,
        hasAccessToken: !!user?.google_access_token,
        hasRefreshToken: !!user?.google_refresh_token,
        tokenExpiresAt: user?.google_token_expires_at
      }
    });
  } catch (error) {
    logger.error('Error checking Google auth status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to check Google auth status'
    });
  }
});

export default router;