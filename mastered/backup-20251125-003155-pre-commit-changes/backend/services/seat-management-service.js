/**
 * Seat Management Service
 * Handles agency seat allocation, billing, and member management
 *
 * Pricing Model:
 * - First 3 seats: FREE for all paying customers
 * - Additional seats: $12/month per seat
 * - Automatic billing through Stripe
 */

import { supabaseServer } from '../config/supabase-auth.js';
import { calculateSeatPricing } from './user-type-service.js';

const FREE_SEATS = 3;
const COST_PER_SEAT = 12; // $12/month

/**
 * Add a seat to an agency (invite a new member)
 * @param {string} agencyId - Agency ID
 * @param {string} invitedByUserId - User ID of admin inviting
 * @param {string} invitedUserEmail - Email of user to invite
 * @param {string} role - Role for the new member (default: 'member')
 * @returns {Promise<Object>} Result with new member info
 */
export async function addSeat(agencyId, invitedByUserId, invitedUserEmail, role = 'member') {
  try {
    // 1. Check current seat availability
    const { data: agency, error: agencyError } = await supabaseServer
      .from('agencies')
      .select('max_users, current_users_count, subscription_status')
      .eq('id', agencyId)
      .single();

    if (agencyError || !agency) {
      throw new Error('Agency not found');
    }

    if (agency.current_users_count >= agency.max_users) {
      return {
        success: false,
        error: 'No available seats',
        message: `Agency has reached maximum capacity (${agency.max_users} seats). Please upgrade to add more members.`,
        needsUpgrade: true,
        currentSeats: agency.current_users_count,
        maxSeats: agency.max_users
      };
    }

    // 2. Find user by email
    const { data: authUser, error: userError } = await supabaseServer
      .auth.admin.getUserByEmail(invitedUserEmail);

    if (userError || !authUser?.user) {
      throw new Error('User not found with this email');
    }

    const invitedUserId = authUser.user.id;

    // 3. Check if user is already a member
    const { data: existingMember } = await supabaseServer
      .from('agency_members')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('user_id', invitedUserId)
      .single();

    if (existingMember) {
      return {
        success: false,
        error: 'User already exists',
        message: 'This user is already a member of this agency'
      };
    }

    // 4. Calculate seat pricing
    const newSeatCount = agency.current_users_count + 1;
    const pricing = calculateSeatPricing(newSeatCount);

    // 5. Add member to agency
    const { data: newMember, error: memberError } = await supabaseServer
      .from('agency_members')
      .insert({
        agency_id: agencyId,
        user_id: invitedUserId,
        role: role,
        invitation_status: 'active',
        invited_by: invitedByUserId,
        invited_at: new Date().toISOString(),
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (memberError) {
      throw new Error(`Failed to add member: ${memberError.message}`);
    }

    // 6. Update agency user count
    const { error: updateError } = await supabaseServer
      .from('agencies')
      .update({
        current_users_count: newSeatCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId);

    if (updateError) {
      // Rollback member addition
      await supabaseServer
        .from('agency_members')
        .delete()
        .eq('id', newMember.id);
      throw new Error('Failed to update seat count');
    }

    return {
      success: true,
      message: 'Member added successfully',
      member: {
        id: newMember.id,
        userId: invitedUserId,
        email: invitedUserEmail,
        role: role,
        invitedAt: newMember.invited_at
      },
      seating: {
        currentSeats: newSeatCount,
        maxSeats: agency.max_users,
        availableSeats: agency.max_users - newSeatCount,
        pricing: pricing
      }
    };

  } catch (error) {
    console.error('Error adding seat:', error);
    throw error;
  }
}

/**
 * Remove a seat from an agency (remove a member)
 * @param {string} agencyId - Agency ID
 * @param {string} memberUserId - User ID to remove
 * @param {string} removedByUserId - User ID of admin removing
 * @returns {Promise<Object>} Result
 */
export async function removeSeat(agencyId, memberUserId, removedByUserId) {
  try {
    // 1. Get agency info
    const { data: agency, error: agencyError } = await supabaseServer
      .from('agencies')
      .select('current_users_count')
      .eq('id', agencyId)
      .single();

    if (agencyError || !agency) {
      throw new Error('Agency not found');
    }

    // 2. Check if member exists
    const { data: member, error: memberError } = await supabaseServer
      .from('agency_members')
      .select('id, role')
      .eq('agency_id', agencyId)
      .eq('user_id', memberUserId)
      .single();

    if (memberError || !member) {
      throw new Error('Member not found in this agency');
    }

    // 3. Prevent removing themselves if they're the last admin
    if (member.role === 'admin') {
      const { data: adminCount } = await supabaseServer
        .from('agency_members')
        .select('id', { count: 'exact' })
        .eq('agency_id', agencyId)
        .eq('role', 'admin')
        .eq('invitation_status', 'active');

      if (adminCount && adminCount.length <= 1) {
        throw new Error('Cannot remove the last admin from the agency');
      }
    }

    // 4. Remove member
    const { error: deleteError } = await supabaseServer
      .from('agency_members')
      .delete()
      .eq('id', member.id);

    if (deleteError) {
      throw new Error('Failed to remove member');
    }

    // 5. Update agency user count
    const newSeatCount = Math.max(0, agency.current_users_count - 1);
    const { error: updateError } = await supabaseServer
      .from('agencies')
      .update({
        current_users_count: newSeatCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId);

    if (updateError) {
      console.error('Failed to update seat count after removal:', updateError);
    }

    // 6. Calculate new pricing
    const pricing = calculateSeatPricing(newSeatCount);

    return {
      success: true,
      message: 'Member removed successfully',
      seating: {
        currentSeats: newSeatCount,
        pricing: pricing
      }
    };

  } catch (error) {
    console.error('Error removing seat:', error);
    throw error;
  }
}

/**
 * Upgrade agency seats (increase max_users)
 * @param {string} agencyId - Agency ID
 * @param {number} additionalSeats - Number of seats to add
 * @returns {Promise<Object>} Result with new pricing
 */
export async function upgradeSeats(agencyId, additionalSeats) {
  try {
    if (!additionalSeats || additionalSeats < 1) {
      throw new Error('Additional seats must be at least 1');
    }

    // 1. Get current agency info
    const { data: agency, error: agencyError } = await supabaseServer
      .from('agencies')
      .select('max_users, current_users_count, subscription_tier')
      .eq('id', agencyId)
      .single();

    if (agencyError || !agency) {
      throw new Error('Agency not found');
    }

    // 2. Calculate new limits
    const newMaxUsers = agency.max_users + additionalSeats;
    const pricing = calculateSeatPricing(newMaxUsers);

    // 3. Update agency
    const { error: updateError } = await supabaseServer
      .from('agencies')
      .update({
        max_users: newMaxUsers,
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId);

    if (updateError) {
      throw new Error('Failed to upgrade seats');
    }

    return {
      success: true,
      message: `Successfully added ${additionalSeats} seat(s)`,
      seating: {
        previousMaxSeats: agency.max_users,
        newMaxSeats: newMaxUsers,
        currentSeats: agency.current_users_count,
        availableSeats: newMaxUsers - agency.current_users_count,
        pricing: pricing
      }
    };

  } catch (error) {
    console.error('Error upgrading seats:', error);
    throw error;
  }
}

/**
 * Downgrade agency seats (decrease max_users)
 * Cannot go below current usage
 * @param {string} agencyId - Agency ID
 * @param {number} seatsToRemove - Number of seats to remove
 * @returns {Promise<Object>} Result
 */
export async function downgradeSeats(agencyId, seatsToRemove) {
  try {
    if (!seatsToRemove || seatsToRemove < 1) {
      throw new Error('Seats to remove must be at least 1');
    }

    // 1. Get current agency info
    const { data: agency, error: agencyError } = await supabaseServer
      .from('agencies')
      .select('max_users, current_users_count')
      .eq('id', agencyId)
      .single();

    if (agencyError || !agency) {
      throw new Error('Agency not found');
    }

    // 2. Calculate new max (cannot go below current usage)
    const newMaxUsers = agency.max_users - seatsToRemove;

    if (newMaxUsers < agency.current_users_count) {
      return {
        success: false,
        error: 'Cannot downgrade below current usage',
        message: `You currently have ${agency.current_users_count} members. Please remove members before downgrading.`,
        currentSeats: agency.current_users_count,
        requestedMaxSeats: newMaxUsers
      };
    }

    // Minimum of 1 seat
    if (newMaxUsers < 1) {
      throw new Error('Cannot downgrade to less than 1 seat');
    }

    // 3. Update agency
    const { error: updateError } = await supabaseServer
      .from('agencies')
      .update({
        max_users: newMaxUsers,
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId);

    if (updateError) {
      throw new Error('Failed to downgrade seats');
    }

    const pricing = calculateSeatPricing(newMaxUsers);

    return {
      success: true,
      message: `Successfully removed ${seatsToRemove} seat(s)`,
      seating: {
        previousMaxSeats: agency.max_users,
        newMaxSeats: newMaxUsers,
        currentSeats: agency.current_users_count,
        availableSeats: newMaxUsers - agency.current_users_count,
        pricing: pricing
      }
    };

  } catch (error) {
    console.error('Error downgrading seats:', error);
    throw error;
  }
}

/**
 * Get seat usage and pricing for an agency
 * @param {string} agencyId - Agency ID
 * @returns {Promise<Object>} Seat info and pricing
 */
export async function getSeatInfo(agencyId) {
  try {
    const { data: agency, error } = await supabaseServer
      .from('agencies')
      .select(`
        id,
        name,
        max_users,
        current_users_count,
        subscription_tier,
        subscription_status,
        created_at
      `)
      .eq('id', agencyId)
      .single();

    if (error || !agency) {
      throw new Error('Agency not found');
    }

    // Get all members
    const { data: members, error: membersError } = await supabaseServer
      .from('agency_members')
      .select(`
        id,
        user_id,
        role,
        invitation_status,
        joined_at,
        invited_at
      `)
      .eq('agency_id', agencyId)
      .eq('invitation_status', 'active');

    if (membersError) {
      console.error('Error fetching members:', membersError);
    }

    // Calculate pricing
    const pricing = calculateSeatPricing(agency.max_users);

    return {
      success: true,
      agency: {
        id: agency.id,
        name: agency.name,
        tier: agency.subscription_tier,
        status: agency.subscription_status
      },
      seating: {
        maxSeats: agency.max_users,
        currentSeats: agency.current_users_count,
        availableSeats: agency.max_users - agency.current_users_count,
        freeSeats: FREE_SEATS,
        paidSeats: Math.max(0, agency.max_users - FREE_SEATS),
        costPerSeat: COST_PER_SEAT
      },
      pricing: pricing,
      members: members || []
    };

  } catch (error) {
    console.error('Error getting seat info:', error);
    throw error;
  }
}

/**
 * Update member role
 * @param {string} agencyId - Agency ID
 * @param {string} memberUserId - User ID of member
 * @param {string} newRole - New role ('admin', 'member', 'viewer')
 * @returns {Promise<Object>} Result
 */
export async function updateMemberRole(agencyId, memberUserId, newRole) {
  try {
    const validRoles = ['admin', 'member', 'viewer'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Update the member role
    const { data, error } = await supabaseServer
      .from('agency_members')
      .update({
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('agency_id', agencyId)
      .eq('user_id', memberUserId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update member role');
    }

    return {
      success: true,
      message: 'Member role updated successfully',
      member: {
        id: data.id,
        userId: data.user_id,
        role: data.role
      }
    };

  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
}

export default {
  FREE_SEATS,
  COST_PER_SEAT,
  addSeat,
  removeSeat,
  upgradeSeats,
  downgradeSeats,
  getSeatInfo,
  updateMemberRole
};
