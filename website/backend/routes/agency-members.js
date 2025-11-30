import express from 'express';
import { supabaseServer } from '../config/supabase-auth.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// ========================================
// AGENCY MEMBERS ROUTES
// ========================================

/**
 * GET /api/v1/agencies/:agencyId/members
 * Get all members of an agency with pagination support
 * Query params:
 *  - page: Page number (default: 1)
 *  - limit: Items per page (default: 50, max: 100)
 *  - search: Search by email or name
 *  - role: Filter by role
 *  - status: Filter by invitation_status
 */
router.get('/:agencyId/members', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.params.agencyId;

    // Parse pagination params
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;
    const search = req.query.search?.trim().toLowerCase();
    const roleFilter = req.query.role;
    const statusFilter = req.query.status || 'active';

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

    // Build query for members
    let query = supabaseServer
      .from('agency_members')
      .select(`
        *,
        user:user_id (
          id,
          email,
          raw_user_meta_data
        )
      `, { count: 'exact' })
      .eq('agency_id', agencyId);

    // Apply filters
    if (statusFilter) {
      query = query.eq('invitation_status', statusFilter);
    }
    if (roleFilter) {
      query = query.eq('role', roleFilter);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: members, error, count } = await query;

    if (error) {
      console.error('Error fetching agency members:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch agency members'
      });
    }

    // Format response
    let formattedMembers = members.map(member => ({
      id: member.id,
      user_id: member.user_id,
      email: member.user?.email,
      name: member.user?.raw_user_meta_data?.name || member.user?.raw_user_meta_data?.full_name,
      profile_picture: member.user?.raw_user_meta_data?.avatar_url || member.user?.raw_user_meta_data?.picture,
      role: member.role,
      member_type: member.member_type,
      permissions: member.permissions,
      invitation_status: member.invitation_status,
      joined_at: member.joined_at,
      invited_at: member.invited_at
    }));

    // Apply search filter (client-side for user metadata)
    if (search) {
      formattedMembers = formattedMembers.filter(member =>
        member.email?.toLowerCase().includes(search) ||
        member.name?.toLowerCase().includes(search)
      );
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: formattedMembers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get agency members error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch agency members'
    });
  }
});

/**
 * POST /api/v1/agencies/:agencyId/members
 * Invite a new member to the agency (admin only)
 */
router.post('/:agencyId/members', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.params.agencyId;
    const { email, role = 'member', permissions } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email is required'
      });
    }

    // Check if user is admin
    const { data: isAdmin } = await supabaseServer
      .rpc('is_agency_admin', {
        p_user_id: userId,
        p_agency_id: agencyId
      });

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only agency admins can invite members'
      });
    }

    // Check agency limits
    const { data: agency, error: agencyError } = await supabaseServer
      .from('agencies')
      .select('max_users, current_users_count')
      .eq('id', agencyId)
      .single();

    if (agencyError || !agency) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Agency not found'
      });
    }

    if (agency.current_users_count >= agency.max_users) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Agency has reached maximum user limit (${agency.max_users} users)`
      });
    }

    // Find user by email
    const { data: invitedUser, error: userError } = await supabaseServer
      .auth.admin.getUserByEmail(email);

    if (userError || !invitedUser) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User with this email not found'
      });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseServer
      .from('agency_members')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('user_id', invitedUser.user.id)
      .single();

    if (existingMember) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User is already a member of this agency'
      });
    }

    // Create member
    const { data: member, error: memberError } = await supabaseServer
      .from('agency_members')
      .insert({
        agency_id: agencyId,
        user_id: invitedUser.user.id,
        role,
        permissions,
        invitation_status: 'active',
        invited_by: userId,
        invited_at: new Date().toISOString()
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error creating agency member:', memberError);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to invite member'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Member invited successfully',
      data: member
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to invite member'
    });
  }
});

/**
 * PUT /api/v1/agencies/:agencyId/members/:memberId
 * Update a member's role or permissions (admin only)
 */
router.put('/:agencyId/members/:memberId', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.params.agencyId;
    const memberId = req.params.memberId;
    const { role, permissions } = req.body;

    // Check if user is admin
    const { data: isAdmin } = await supabaseServer
      .rpc('is_agency_admin', {
        p_user_id: userId,
        p_agency_id: agencyId
      });

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only agency admins can update member details'
      });
    }

    // Get member to check they're not trying to demote themselves
    const { data: member } = await supabaseServer
      .from('agency_members')
      .select('user_id')
      .eq('id', memberId)
      .eq('agency_id', agencyId)
      .single();

    if (!member) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Member not found'
      });
    }

    // Prevent admin from demoting themselves
    if (member.user_id === userId && role && role !== 'admin') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'You cannot change your own admin role'
      });
    }

    // Update member
    const updates = {};
    if (role) updates.role = role;
    if (permissions) updates.permissions = permissions;

    const { data: updatedMember, error } = await supabaseServer
      .from('agency_members')
      .update(updates)
      .eq('id', memberId)
      .eq('agency_id', agencyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating member:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to update member'
      });
    }

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: updatedMember
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update member'
    });
  }
});

/**
 * DELETE /api/v1/agencies/:agencyId/members/:memberId
 * Remove a member from the agency (admin only)
 */
router.delete('/:agencyId/members/:memberId', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.params.agencyId;
    const memberId = req.params.memberId;

    // Check if user is admin
    const { data: isAdmin } = await supabaseServer
      .rpc('is_agency_admin', {
        p_user_id: userId,
        p_agency_id: agencyId
      });

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only agency admins can remove members'
      });
    }

    // Get member to check they're not trying to remove themselves
    const { data: member } = await supabaseServer
      .from('agency_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('agency_id', agencyId)
      .single();

    if (!member) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Member not found'
      });
    }

    // Prevent admin from removing themselves
    if (member.user_id === userId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'You cannot remove yourself from the agency'
      });
    }

    // Check if this is the last admin
    if (member.role === 'admin') {
      const { data: adminCount } = await supabaseServer
        .from('agency_members')
        .select('id', { count: 'exact' })
        .eq('agency_id', agencyId)
        .eq('role', 'admin')
        .eq('invitation_status', 'active');

      if (adminCount && adminCount.length <= 1) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Cannot remove the last admin from the agency'
        });
      }
    }

    // Remove member
    const { error } = await supabaseServer
      .from('agency_members')
      .delete()
      .eq('id', memberId)
      .eq('agency_id', agencyId);

    if (error) {
      console.error('Error removing member:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to remove member'
      });
    }

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove member'
    });
  }
});

/**
 * GET /api/v1/agencies/:agencyId/members/me/permissions
 * Get current user's permissions in the agency
 */
router.get('/:agencyId/members/me/permissions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.params.agencyId;

    const { data: member, error } = await supabaseServer
      .from('agency_members')
      .select('role, permissions')
      .eq('agency_id', agencyId)
      .eq('user_id', userId)
      .eq('invitation_status', 'active')
      .single();

    if (error || !member) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this agency'
      });
    }

    res.json({
      success: true,
      data: {
        role: member.role,
        permissions: member.permissions
      }
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch permissions'
    });
  }
});

export default router;
