import express from 'express';
import { supabaseServer } from '../config/supabase-auth.js';
import { authenticateUser } from '../middleware/auth.js';

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
    const { name, website, description } = req.body;

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
    const tier = req.user.email === 'axolopcrm@gmail.com' ? 'god_mode' : 'free';

    // Create agency
    const { data: agency, error: agencyError } = await supabaseServer
      .from('agencies')
      .insert({
        name,
        slug,
        website,
        description,
        subscription_tier: tier
      })
      .select()
      .single();

    if (agencyError) {
      console.error('Error creating agency:', agencyError);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to create agency'
      });
    }

    // Add user as admin
    const { error: memberError } = await supabaseServer
      .from('agency_members')
      .insert({
        agency_id: agency.id,
        user_id: userId,
        role: 'admin',
        invitation_status: 'active'
      });

    if (memberError) {
      console.error('Error adding user as admin:', memberError);
      // Rollback agency creation
      await supabaseServer.from('agencies').delete().eq('id', agency.id);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to create agency membership'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Agency created successfully',
      data: agency
    });
  } catch (error) {
    console.error('Create agency error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create agency'
    });
  }
});

/**
 * PUT /api/v1/agencies/:id
 * Update agency details (admin only)
 */
router.put('/:id', authenticateUser, async (req, res) => {
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
        message: 'Only agency admins can update agency details'
      });
    }

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

export default router;
