import express from 'express';
import { supabaseServer } from '../config/supabase-auth.js';
import { authenticateUser } from '../middleware/auth.js';
import userPreferencesService from '../services/userPreferencesService.js';

const router = express.Router();

// ========================================
// USER PROFILE ROUTES
// ========================================

/**
 * GET /api/v1/users/me
 * Get current user's profile
 */
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile from database
    const { data: user, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return res.status(404).json({
        error: 'Not Found',
        message: 'User profile not found'
      });
    }

    // Don't send sensitive data
    const { password, ...safeUser } = user;

    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user profile'
    });
  }
});

/**
 * PUT /api/v1/users/me
 * Update current user's profile
 */
router.put('/me', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Fields that can be updated
    const allowedFields = [
      'name',
      'first_name',
      'last_name',
      'profile_picture',
      'phone',
      'company',
      'job_title',
      'timezone',
      'language',
      'bio'
    ];

    // Filter to only allowed fields
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Add updated_at timestamp
    filteredUpdates.updated_at = new Date().toISOString();

    // Update user profile
    const { data: user, error } = await supabaseServer
      .from('users')
      .update(filteredUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to update profile'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update profile'
    });
  }
});

/**
 * GET /api/v1/users/me/settings
 * Get current user's settings
 */
router.get('/me/settings', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: settings, error } = await supabaseServer
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching user settings:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch settings'
      });
    }

    // Return default settings if none exist
    if (!settings) {
      return res.json({
        success: true,
        data: {
          user_id: userId,
          email_notifications: true,
          push_notifications: true,
          marketing_emails: false,
          two_factor_enabled: false,
          theme: 'system',
          language: 'en'
        }
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch settings'
    });
  }
});

/**
 * PUT /api/v1/users/me/settings
 * Update current user's settings
 */
router.put('/me/settings', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Upsert settings (insert or update)
    const { data: settings, error } = await supabaseServer
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating user settings:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to update settings'
      });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update settings'
    });
  }
});

/**
 * POST /api/v1/users/me/avatar
 * Upload user avatar
 * Accepts either { avatar_url } or { file_data, file_name, content_type }
 */
router.post('/me/avatar', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar_url, file_data, file_name, content_type } = req.body;

    let finalAvatarUrl = avatar_url;

    // If file data is provided, upload to Supabase Storage
    if (file_data && file_name) {
      try {
        // Convert base64 to buffer if needed
        let buffer;
        if (file_data.startsWith('data:')) {
          // Extract base64 data from data URL
          const base64Data = file_data.split(',')[1];
          buffer = Buffer.from(base64Data, 'base64');
        } else {
          buffer = Buffer.from(file_data, 'base64');
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const extension = file_name.split('.').pop();
        const uniqueFileName = `avatars/${userId}/${timestamp}-${randomString}.${extension}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseServer
          .storage
          .from('user-uploads')
          .upload(uniqueFileName, buffer, {
            contentType: content_type || 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading to storage:', uploadError);
          throw new Error('Failed to upload image');
        }

        // Get public URL
        const { data: publicUrlData } = supabaseServer
          .storage
          .from('user-uploads')
          .getPublicUrl(uniqueFileName);

        finalAvatarUrl = publicUrlData.publicUrl;

      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to upload avatar image'
        });
      }
    }

    if (!finalAvatarUrl) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either avatar_url or file_data/file_name is required'
      });
    }

    // Update user profile with new avatar - try auth.users table first
    try {
      // Update Supabase Auth user metadata
      const { data: authUser, error: authError } = await supabaseServer.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            avatar_url: finalAvatarUrl,
            picture: finalAvatarUrl
          }
        }
      );

      if (authError) {
        console.error('Error updating auth user:', authError);
      }
    } catch (authUpdateError) {
      console.error('Auth update error:', authUpdateError);
    }

    // Also update users table if it exists
    const { data: user, error } = await supabaseServer
      .from('users')
      .update({
        profile_picture: finalAvatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    // If users table doesn't exist or update failed, that's okay
    // The auth.users metadata update is what matters
    if (error) {
      console.log('Note: users table update skipped (may not exist):', error.message);
    }

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        profile_picture: finalAvatarUrl,
        user_id: userId
      }
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update avatar'
    });
  }
});

/**
 * DELETE /api/v1/users/me
 * Delete current user's account
 */
router.delete('/me', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Soft delete - mark as deleted instead of removing
    const { error } = await supabaseServer
      .from('users')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to delete account'
      });
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete account'
    });
  }
});

/**
 * GET /api/v1/users/me/activity
 * Get current user's recent activity
 */
router.get('/me/activity', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const { data: activities, error } = await supabaseServer
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user activity:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch activity'
      });
    }

    res.json({
      success: true,
      data: activities || []
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch activity'
    });
  }
});

/**
 * POST /api/v1/users/me/verify-email
 * Request email verification
 */
router.post('/me/verify-email', authenticateUser, async (req, res) => {
  try {
    const { email } = req.user;

    // Use Supabase to send verification email
    const { error } = await supabaseServer.auth.admin.generateLink({
      type: 'signup',
      email: email
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to send verification email'
    });
  }
});

/**
 * POST /api/v1/users/me/onboarding
 * Complete user onboarding and save data
 */
router.post('/me/onboarding', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const onboardingData = req.body;

    console.log('Onboarding data received:', { userId, data: onboardingData });

    // Call the database function to complete onboarding
    const { data, error } = await supabaseServer
      .rpc('complete_user_onboarding', {
        p_user_id: userId,
        p_onboarding_data: onboardingData
      });

    if (error) {
      console.error('Error completing onboarding:', error);

      // Fallback: manually update users table
      const { error: updateError } = await supabaseServer
        .from('users')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to complete onboarding'
        });
      }

      return res.json({
        success: true,
        message: 'Onboarding completed (fallback mode)',
        data: { user_id: userId }
      });
    }

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: data
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to complete onboarding'
    });
  }
});

/**
 * GET /api/v1/users/me/onboarding-status
 * Check if user has completed onboarding
 */
router.get('/me/onboarding-status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabaseServer
      .from('users')
      .select('onboarding_completed, onboarding_completed_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching onboarding status:', error);
      // Return false by default if table doesn't exist
      return res.json({
        success: true,
        onboarding_completed: false
      });
    }

    res.json({
      success: true,
      onboarding_completed: user?.onboarding_completed || false,
      onboarding_completed_at: user?.onboarding_completed_at
    });
  } catch (error) {
    console.error('Onboarding status error:', error);
    res.json({
      success: true,
      onboarding_completed: false
    });
  }
});

// ========================================
// SIDEBAR MENU PREFERENCES ROUTES
// ========================================

/**
 * GET /api/v1/users/me/sidebar-menu
 * Get user's sidebar menu button preferences
 */
router.get('/me/sidebar-menu', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userPreferencesService.getSidebarMenuButtons(userId);

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get sidebar menu buttons error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch sidebar menu preferences'
    });
  }
});

/**
 * PUT /api/v1/users/me/sidebar-menu
 * Update user's sidebar menu button preferences
 */
router.put('/me/sidebar-menu', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { buttons } = req.body;

    if (!Array.isArray(buttons)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'buttons must be an array'
      });
    }

    if (buttons.length > 12) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Maximum 12 sidebar menu buttons allowed'
      });
    }

    const result = await userPreferencesService.updateSidebarMenuButtons(userId, buttons);

    res.json({
      success: true,
      message: 'Sidebar menu preferences updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Update sidebar menu buttons error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to update sidebar menu preferences'
    });
  }
});

// ========================================
// PINNED QUICK ACTIONS ROUTES
// ========================================

/**
 * GET /api/v1/users/me/pinned-actions
 * Get user's pinned quick action preferences
 */
router.get('/me/pinned-actions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userPreferencesService.getPinnedQuickActions(userId);

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get pinned quick actions error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch pinned quick actions'
    });
  }
});

/**
 * PUT /api/v1/users/me/pinned-actions
 * Update user's pinned quick action preferences
 */
router.put('/me/pinned-actions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { buttons } = req.body;

    if (!Array.isArray(buttons)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'buttons must be an array'
      });
    }

    if (buttons.length > 4) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Maximum 4 pinned quick action buttons allowed'
      });
    }

    const result = await userPreferencesService.updatePinnedQuickActions(userId, buttons);

    res.json({
      success: true,
      message: 'Pinned quick actions updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Update pinned quick actions error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to update pinned quick actions'
    });
  }
});

export default router;
