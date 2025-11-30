import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import config from '../config/app.config.js';
import logger from '../utils/logger.js';

class GoogleAuthService {
  constructor() {
    this.googleClientId = process.env.GOOGLE_CLIENT_ID;
    this.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/google/callback`;
    
    // Initialize Google OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      this.googleClientId,
      this.googleClientSecret,
      this.googleRedirectUri
    );

    // Initialize Supabase client
    this.supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
  }

  /**
   * Get Google OAuth consent URL
   */
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.readonly'
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    return authUrl;
  }

  /**
   * Exchange authorization code for Google tokens
   */
  async exchangeCodeForTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      return tokens;
    } catch (error) {
      logger.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Get user info from Google using access token
   */
  async getUserInfo(accessToken) {
    try {
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2'
      });

      // Set the access token temporarily to fetch user info
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const response = await oauth2.userinfo.get();
      return response.data;
    } catch (error) {
      logger.error('Error fetching user info from Google:', error);
      throw new Error('Failed to fetch user info from Google');
    }
  }

  /**
   * Authenticate user with Google and create/update user in Supabase
   */
  async authenticateUser(tokens) {
    try {
      // Get user info from Google
      const userInfo = await this.getUserInfo(tokens.access_token);
      
      if (!userInfo || !userInfo.email) {
        throw new Error('Invalid user information received from Google');
      }

      // Check if user already exists in Supabase
      let { data: existingUser, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', userInfo.email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw error;
      }

      let user;
      let isNewUser = false;

      if (existingUser) {
        // User exists, update their Google tokens
        const { data, error } = await this.supabase
          .from('users')
          .update({
            google_refresh_token: tokens.refresh_token,
            google_access_token: tokens.access_token,
            google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            profile_picture: userInfo.picture || existingUser.profile_picture,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        user = data;
      } else {
        // New user, create account
        const { data, error } = await this.supabase
          .from('users')
          .insert({
            email: userInfo.email,
            name: userInfo.name || userInfo.email.split('@')[0],
            first_name: userInfo.given_name || userInfo.email.split('@')[0],
            last_name: userInfo.family_name || '',
            profile_picture: userInfo.picture,
            google_id: userInfo.id,
            google_refresh_token: tokens.refresh_token,
            google_access_token: tokens.access_token,
            google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            is_active: true,
            email_verified: userInfo.verified_email || false
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        user = data;
        isNewUser = true;
      }

      // Create JWT token for the user
      const { data: { session }, error: tokenError } = await this.supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || ''
      });

      if (tokenError) {
        logger.error('Error creating session:', tokenError);
        // We'll continue without the session since we can still return user data
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          first_name: user.first_name,
          last_name: user.last_name,
          profile_picture: user.profile_picture,
          is_active: user.is_active,
          email_verified: user.email_verified
        },
        isNewUser,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
      };
    } catch (error) {
      logger.error('Error authenticating user with Google:', error);
      throw error;
    }
  }

  /**
   * Refresh Google access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const { credentials } = await this.oauth2Client.refreshToken(refreshToken);
      
      // Update tokens in database
      await this.supabase
        .from('users')
        .update({
          google_access_token: credentials.access_token,
          google_token_expires_at: new Date(Date.now() + credentials.expiry_date - Date.now()).toISOString()
        })
        .eq('google_refresh_token', refreshToken);

      return credentials;
    } catch (error) {
      logger.error('Error refreshing Google access token:', error);
      throw new Error('Failed to refresh Google access token');
    }
  }

  /**
   * Revoke Google tokens and deauthorize user
   */
  async revokeTokens(userId) {
    try {
      // Get user's Google tokens
      const { data: user, error } = await this.supabase
        .from('users')
        .select('google_access_token')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (user && user.google_access_token) {
        // Revoke the token with Google
        await this.oauth2Client.revokeToken(user.google_access_token);
      }

      // Clear tokens from database
      await this.supabase
        .from('users')
        .update({
          google_access_token: null,
          google_refresh_token: null,
          google_token_expires_at: null
        })
        .eq('id', userId);

      return { success: true, message: 'Google tokens revoked successfully' };
    } catch (error) {
      logger.error('Error revoking Google tokens:', error);
      throw new Error('Failed to revoke Google tokens');
    }
  }

  /**
   * Get access token for a user (refreshing if needed)
   */
  async getAccessTokenForUser(userId) {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('google_access_token, google_refresh_token, google_token_expires_at')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (!user) {
        throw new Error('User not found');
      }

      const tokenExpiry = new Date(user.google_token_expires_at);
      const now = new Date();
      
      // If token is expired or will expire in the next 5 minutes, refresh it
      if (tokenExpiry < new Date(now.getTime() + 5 * 60 * 1000)) {
        if (!user.google_refresh_token) {
          throw new Error('No refresh token available');
        }

        const refreshedTokens = await this.refreshAccessToken(user.google_refresh_token);
        return refreshedTokens.access_token;
      }

      return user.google_access_token;
    } catch (error) {
      logger.error('Error getting access token for user:', error);
      throw error;
    }
  }
}

export default new GoogleAuthService();