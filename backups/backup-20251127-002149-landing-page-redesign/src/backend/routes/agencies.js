import express from 'express';
import { supabaseServer } from '../config/supabase-auth.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAgencyAdmin } from '../middleware/agency-access.js';
import seatManagementService from '../services/seat-management-service.js';
import { getUserType } from '../services/user-type-service.js';

const router = express.Router();

// ========================================
// AGENCY ROUTES
// ========================================

/**
 * GET /api/v1/agencies
 * Get all agencies for the current user
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get agencies using the helper function
    const { data: agencies, error } = await supabaseServer
      .rpc('get_user_agencies', { p_user_id: userId });

    if (error) {
      console.error('Error fetching user agencies:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch agencies'
      });
    }

    res.json({
      success: true,
      data: agencies || []
    });
  } catch (error) {
    console.error('Get agencies error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch agencies'
    });
  }
});

/**
 * GET /api/v1/agencies/me/user-type
 * Get current user's type, permissions, and agency access
 * NOTE: This must come BEFORE /:id route to prevent "me" from being treated as an ID
 */
router.get('/me/user-type', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const userType = await getUserType(userId, userEmail);

    res.json({
      success: true,
      data: userType
    });
  } catch (error) {
    console.error('Get user type error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user type'
    });
  }
});

/**
 * GET /api/v1/agencies/:id
 * Get a specific agency by ID
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.params.id;

    // Check if user is a member of this agency
    const { data: membership, error: memberError } = await supabaseServer
      .from('agency_members')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('user_id', userId)
      .eq('invitation_status', 'active')
      .single();

    if (memberError || !membership) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this agency'
      });
    }

    // Get agency details
    const { data: agency, error } = await supabaseServer
      .from('agencies')
      .select('*')
      .eq('id', agencyId)
      .single();

    if (error) {
      console.error('Error fetching agency:', error);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Agency not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...agency,
        user_role: membership.role,
        user_permissions: membership.permissions
      }
    });
  } catch (error) {
    console.error('Get agency error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch agency'
    });
  }
});

/**
 * POST /api/v1/agencies
 * Create a new agency (if user doesn't have one or subscription allows)
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { name, website, description, logo_url } = req.body;

    console.log('[Agencies] Creating agency for user:', { userId, userEmail, name });

    if (!name) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Agency name is required'
      });
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).substring(2, 8);

    // Determine subscription tier
    const tier = userEmail === 'axolopcrm@gmail.com' ? 'god_mode' : 'free';

    console.log('[Agencies] Inserting agency with slug:', slug, 'tier:', tier);

    // Create agency
    const { data: agency, error: agencyError } = await supabaseServer
      .from('agencies')
      .insert({
        name,
        slug,
        website,
        description,
        logo_url,
        subscription_tier: tier,
        is_active: true  // Explicitly set to true
      })
      .select()
      .single();

    if (agencyError) {
      console.error('[Agencies] Error creating agency:', agencyError);
      return res.status(400).json({
        error: 'Bad Request',
        message: `Failed to create agency: ${agencyError.message || 'Unknown error'}`,
        details: agencyError.details || agencyError.hint || null
      });
    }

    console.log('[Agencies] Agency created successfully:', agency.id);

    // Add user as admin
    const { data: membership, error: memberError } = await supabaseServer
      .from('agency_members')
      .insert({
        agency_id: agency.id,
        user_id: userId,
        role: 'admin',
        invitation_status: 'active',
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (memberError) {
      console.error('[Agencies] Error adding user as admin:', memberError);
      // Rollback agency creation
      await supabaseServer.from('agencies').delete().eq('id', agency.id);
      return res.status(400).json({
        error: 'Bad Request',
        message: `Failed to create agency membership: ${memberError.message || 'Unknown error'}`,
        details: memberError.details || memberError.hint || null
      });
    }

    console.log('[Agencies] Membership created:', membership?.id);

    res.status(201).json({
      success: true,
      message: 'Agency created successfully',
      data: agency
    });
  } catch (error) {
    console.error('[Agencies] Create agency error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: `Failed to create agency: ${error.message || 'Unknown error'}`
    });
  }
});

/**
 * PUT /api/v1/agencies/:id
 * Update agency details (admin only)
 */
router.put('/:id', authenticateUser, requireAgencyAdmin, async (req, res) => {
  try {
    const agencyId = req.params.id;

    // Fields that can be updated
    const allowedFields = ['name', 'logo_url', 'website', 'description', 'settings'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No valid fields to update'
      });
    }

    // Update agency
    const { data: agency, error } = await supabaseServer
      .from('agencies')
      .update(updates)
      .eq('id', agencyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating agency:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to update agency'
      });
    }

    res.json({
      success: true,
      message: 'Agency updated successfully',
      data: agency
    });
  } catch (error) {
    console.error('Update agency error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update agency'
    });
  }
});

/**
 * POST /api/v1/agencies/:id/logo
 * Upload agency logo (admin only)
 * Accepts either { logo_url } or { file_data, file_name, content_type }
 */
router.post('/:id/logo', authenticateUser, requireAgencyAdmin, async (req, res) => {
  try {
    const agencyId = req.params.id;
    const { logo_url, file_data, file_name, content_type } = req.body;

    let finalLogoUrl = logo_url;

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
        const uniqueFileName = `agency-logos/${agencyId}/${timestamp}-${randomString}.${extension}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseServer
          .storage
          .from('user-uploads')
          .upload(uniqueFileName, buffer, {
            contentType: content_type || 'image/png',
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading to storage:', uploadError);
          throw new Error('Failed to upload logo');
        }

        // Get public URL
        const { data: publicUrlData } = supabaseServer
          .storage
          .from('user-uploads')
          .getPublicUrl(uniqueFileName);

        finalLogoUrl = publicUrlData.publicUrl;

      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to upload logo image'
        });
      }
    }

    if (!finalLogoUrl) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either logo_url or file_data/file_name is required'
      });
    }

    // Update agency with new logo
    const { data: agency, error } = await supabaseServer
      .from('agencies')
      .update({
        logo_url: finalLogoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating agency logo:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to update agency logo'
      });
    }

    res.json({
      success: true,
      message: 'Agency logo updated successfully',
      data: {
        logo_url: agency.logo_url,
        agency_id: agencyId
      }
    });
  } catch (error) {
    console.error('Update agency logo error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update agency logo'
    });
  }
});

/**
 * DELETE /api/v1/agencies/:id
 * Delete agency (admin only, soft delete)
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.params.id;

    // Check if user is admin
    const { data: isAdmin } = await supabaseServer
      .rpc('is_agency_admin', {
        p_user_id: userId,
        p_agency_id: agencyId
      });

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only agency admins can delete the agency'
      });
    }

    // Soft delete
    const { error } = await supabaseServer
      .from('agencies')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString()
      })
      .eq('id', agencyId);

    if (error) {
      console.error('Error deleting agency:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to delete agency'
      });
    }

    res.json({
      success: true,
      message: 'Agency deleted successfully'
    });
  } catch (error) {
    console.error('Delete agency error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete agency'
    });
  }
});

/**
 * GET /api/v1/agencies/:id/settings
 * Get agency settings
 */
router.get('/:id/settings', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.params.id;

    // Check if user is a member
    const { data: membership, error: memberError } = await supabaseServer
      .from('agency_members')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('user_id', userId)
      .eq('invitation_status', 'active')
      .single();

    if (memberError || !membership) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this agency'
      });
    }

    // Get agency settings
    const { data: settings, error } = await supabaseServer
      .from('agency_settings')
      .select('*')
      .eq('agency_id', agencyId)
      .single();

    if (error) {
      console.error('Error fetching agency settings:', error);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Agency settings not found'
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get agency settings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch agency settings'
    });
  }
});

/**
 * PUT /api/v1/agencies/:id/settings
 * Update agency settings (admin only)
 */
router.put('/:id/settings', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.params.id;

    // Check if user is admin
    const { data: isAdmin } = await supabaseServer
      .rpc('is_agency_admin', {
        p_user_id: userId,
        p_agency_id: agencyId
      });

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only agency admins can update settings'
      });
    }

    // Update settings
    const { data: settings, error } = await supabaseServer
      .from('agency_settings')
      .update(req.body)
      .eq('agency_id', agencyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating agency settings:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to update agency settings'
      });
    }

    res.json({
      success: true,
      message: 'Agency settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update agency settings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update agency settings'
    });
  }
});

// ========================================
// SEAT MANAGEMENT ROUTES
// ========================================

/**
 * GET /api/v1/agencies/:id/seats
 * Get seat usage and pricing information
 */
router.get('/:id/seats', authenticateUser, requireAgencyAdmin, async (req, res) => {
  try {
    const agencyId = req.params.id;

    const result = await seatManagementService.getSeatInfo(agencyId);

    res.json(result);
  } catch (error) {
    console.error('Get seat info error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch seat information'
    });
  }
});

/**
 * POST /api/v1/agencies/:id/seats
 * Add a seat (invite a member) - Admin only
 */
router.post('/:id/seats', authenticateUser, requireAgencyAdmin, async (req, res) => {
  try {
    const agencyId = req.params.id;
    const userId = req.user.id;
    const { email, role = 'member' } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email is required'
      });
    }

    const result = await seatManagementService.addSeat(agencyId, userId, email, role);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Add seat error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to add seat'
    });
  }
});

/**
 * DELETE /api/v1/agencies/:id/seats/:userId
 * Remove a seat (remove a member) - Admin only
 */
router.delete('/:id/seats/:userId', authenticateUser, requireAgencyAdmin, async (req, res) => {
  try {
    const agencyId = req.params.id;
    const memberUserId = req.params.userId;
    const removedByUserId = req.user.id;

    const result = await seatManagementService.removeSeat(agencyId, memberUserId, removedByUserId);

    res.json(result);
  } catch (error) {
    console.error('Remove seat error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to remove seat'
    });
  }
});

/**
 * POST /api/v1/agencies/:id/seats/upgrade
 * Upgrade seats (increase max_users) - Admin only
 */
router.post('/:id/seats/upgrade', authenticateUser, requireAgencyAdmin, async (req, res) => {
  try {
    const agencyId = req.params.id;
    const { additionalSeats } = req.body;

    if (!additionalSeats || additionalSeats < 1) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'additionalSeats must be at least 1'
      });
    }

    const result = await seatManagementService.upgradeSeats(agencyId, additionalSeats);

    res.json(result);
  } catch (error) {
    console.error('Upgrade seats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to upgrade seats'
    });
  }
});

/**
 * POST /api/v1/agencies/:id/seats/downgrade
 * Downgrade seats (decrease max_users) - Admin only
 */
router.post('/:id/seats/downgrade', authenticateUser, requireAgencyAdmin, async (req, res) => {
  try {
    const agencyId = req.params.id;
    const { seatsToRemove } = req.body;

    if (!seatsToRemove || seatsToRemove < 1) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'seatsToRemove must be at least 1'
      });
    }

    const result = await seatManagementService.downgradeSeats(agencyId, seatsToRemove);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Downgrade seats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to downgrade seats'
    });
  }
});

/**
 * PUT /api/v1/agencies/:id/seats/:userId/role
 * Update member role - Admin only
 */
router.put('/:id/seats/:userId/role', authenticateUser, requireAgencyAdmin, async (req, res) => {
  try {
    const agencyId = req.params.id;
    const memberUserId = req.params.userId;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Role is required'
      });
    }

    const result = await seatManagementService.updateMemberRole(agencyId, memberUserId, role);

    res.json(result);
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to update member role'
    });
  }
});

// ========================================
// INVITE LINK ROUTES
// ========================================

/**
 * POST /api/v1/agencies/:id/invites
 * Create a new invite link for an agency (admin only)
 */
router.post('/:id/invites', authenticateUser, requireAgencyAdmin, async (req, res) => {
  try {
    const agencyId = req.params.id;
    const userId = req.user.id;
    const { role = 'member', max_uses = 1, expires_in_days = 7 } = req.body;

    console.log('[Agencies] Creating invite for agency:', agencyId, 'by user:', userId);

    // Use RPC function to create invite
    const { data, error } = await supabaseServer.rpc('create_agency_invite', {
      p_agency_id: agencyId,
      p_created_by: userId,
      p_role: role,
      p_max_uses: max_uses,
      p_expires_in_days: expires_in_days
    });

    if (error) {
      console.error('[Agencies] Error creating invite:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to create invite'
      });
    }

    const invite = data[0];
    console.log('[Agencies] Invite created:', invite);

    res.status(201).json({
      success: true,
      message: 'Invite created successfully',
      data: {
        invite_id: invite.invite_id,
        invite_code: invite.invite_code,
        invite_url: invite.invite_url,
        expires_at: invite.expires_at
      }
    });
  } catch (error) {
    console.error('[Agencies] Create invite error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to create invite'
    });
  }
});

/**
 * GET /api/v1/agencies/:id/invites
 * Get all invites for an agency (admin only)
 */
router.get('/:id/invites', authenticateUser, requireAgencyAdmin, async (req, res) => {
  try {
    const agencyId = req.params.id;
    const userId = req.user.id;

    const { data, error } = await supabaseServer.rpc('get_agency_invites', {
      p_agency_id: agencyId,
      p_user_id: userId
    });

    if (error) {
      console.error('[Agencies] Error fetching invites:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to fetch invites'
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('[Agencies] Get invites error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch invites'
    });
  }
});

/**
 * DELETE /api/v1/agencies/:id/invites/:inviteId
 * Deactivate an invite (admin only)
 */
router.delete('/:id/invites/:inviteId', authenticateUser, requireAgencyAdmin, async (req, res) => {
  try {
    const inviteId = req.params.inviteId;
    const userId = req.user.id;

    const { data, error } = await supabaseServer.rpc('deactivate_invite', {
      p_invite_id: inviteId,
      p_user_id: userId
    });

    if (error) {
      console.error('[Agencies] Error deactivating invite:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to deactivate invite'
      });
    }

    res.json({
      success: true,
      message: 'Invite deactivated successfully'
    });
  } catch (error) {
    console.error('[Agencies] Deactivate invite error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to deactivate invite'
    });
  }
});

/**
 * GET /api/v1/invites/:code
 * Validate an invite code and get agency info (public - but user must be authenticated)
 */
router.get('/invites/:code', authenticateUser, async (req, res) => {
  try {
    const inviteCode = req.params.code;

    console.log('[Agencies] Validating invite code:', inviteCode);

    const { data, error } = await supabaseServer.rpc('validate_invite_code', {
      p_invite_code: inviteCode.toUpperCase()
    });

    if (error) {
      console.error('[Agencies] Error validating invite:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to validate invite'
      });
    }

    const result = data[0];
    console.log('[Agencies] Validation result:', result);

    if (!result.is_valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Invite',
        message: result.error_message
      });
    }

    res.json({
      success: true,
      data: {
        agency_id: result.agency_id,
        agency_name: result.agency_name,
        agency_slug: result.agency_slug,
        agency_logo_url: result.agency_logo_url,
        role: result.invite_role
      }
    });
  } catch (error) {
    console.error('[Agencies] Validate invite error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to validate invite'
    });
  }
});

/**
 * POST /api/v1/invites/:code/join
 * Use an invite code to join an agency
 */
router.post('/invites/:code/join', authenticateUser, async (req, res) => {
  try {
    const inviteCode = req.params.code;
    const userId = req.user.id;

    console.log('[Agencies] User', userId, 'joining via invite code:', inviteCode);

    const { data, error } = await supabaseServer.rpc('use_invite_code', {
      p_invite_code: inviteCode.toUpperCase(),
      p_user_id: userId
    });

    if (error) {
      console.error('[Agencies] Error using invite:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to join agency'
      });
    }

    const result = data[0];
    console.log('[Agencies] Join result:', result);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Join Failed',
        message: result.error_message
      });
    }

    res.json({
      success: true,
      message: `Successfully joined ${result.agency_name}`,
      data: {
        agency_id: result.agency_id,
        agency_name: result.agency_name,
        role: result.user_role
      }
    });
  } catch (error) {
    console.error('[Agencies] Join agency error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to join agency'
    });
  }
});

/**
 * POST /api/v1/invites/parse-url
 * Parse an invite URL to extract the code
 */
router.post('/invites/parse-url', authenticateUser, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'URL is required'
      });
    }

    // Parse URL formats:
    // - axolop.com/invite/agencyslug/CODE
    // - https://axolop.com/invite/agencyslug/CODE
    // - Just the code: CODE
    let inviteCode = null;

    // Try to extract code from URL
    const urlPatterns = [
      /invite\/[^\/]+\/([A-Za-z0-9]+)$/i,  // Full URL with slug
      /^([A-Za-z0-9]{8})$/i                 // Just the code (8 chars)
    ];

    for (const pattern of urlPatterns) {
      const match = url.match(pattern);
      if (match) {
        inviteCode = match[1].toUpperCase();
        break;
      }
    }

    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL',
        message: 'Could not extract invite code from the provided URL'
      });
    }

    // Validate the extracted code
    const { data, error } = await supabaseServer.rpc('validate_invite_code', {
      p_invite_code: inviteCode
    });

    if (error) {
      console.error('[Agencies] Error validating parsed invite:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to validate invite'
      });
    }

    const result = data[0];

    if (!result.is_valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Invite',
        message: result.error_message
      });
    }

    res.json({
      success: true,
      data: {
        invite_code: inviteCode,
        agency_id: result.agency_id,
        agency_name: result.agency_name,
        agency_slug: result.agency_slug,
        agency_logo_url: result.agency_logo_url,
        role: result.invite_role
      }
    });
  } catch (error) {
    console.error('[Agencies] Parse URL error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to parse invite URL'
    });
  }
});

export default router;
