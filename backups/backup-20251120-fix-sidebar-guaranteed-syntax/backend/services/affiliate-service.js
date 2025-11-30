// backend/services/affiliate-service.js
import { supabaseServer } from '../config/supabase-auth.js';
import crypto from 'crypto';

class AffiliateService {
  /**
   * Generate a unique referral code
   */
  generateReferralCode(length = 8) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
    let code = '';
    const bytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      code += characters[bytes[i] % characters.length];
    }

    return code;
  }

  /**
   * Create a new affiliate account
   */
  async createAffiliate(userId, affiliateData = {}) {
    console.log('\n🏭 === AFFILIATE SERVICE: createAffiliate ===');
    console.log('👤 User ID:', userId);
    console.log('📝 Affiliate Data:', JSON.stringify(affiliateData, null, 2));

    try {
      console.log('\n🔍 Step A: Checking for existing affiliate account...');
      // Check if user already has an affiliate account
      const { data: existing, error: selectError } = await supabaseServer
        .from('affiliates')
        .select('id, referral_code')
        .eq('user_id', userId)
        .maybeSingle();

      // Check if the error is due to missing table
      if (selectError && (selectError.code === '42P01' || selectError.message?.includes('does not exist'))) {
        console.error('❌ Step A FAILED: Affiliate table does not exist');
        console.error('   - Error Code:', selectError.code);
        console.error('   - Error Message:', selectError.message);
        throw new Error('Affiliate tables are not set up. Please run the database migration first.');
      }

      if (selectError) {
        console.error('❌ Step A FAILED: Database error');
        console.error('   - Error:', JSON.stringify(selectError, null, 2));
        throw selectError;
      }

      if (existing) {
        console.log('ℹ️  Step A: User already has affiliate account');
        console.log('   - Existing Code:', existing.referral_code);
        return {
          success: true,
          data: existing,
          message: 'Affiliate account already exists',
        };
      }

      console.log('✅ Step A SUCCESS: No existing account found');

      // Generate unique referral code
      console.log('\n🎲 Step B: Generating unique referral code...');
      let referralCode;
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        referralCode = this.generateReferralCode();
        console.log(`   - Attempt ${attempts + 1}: Generated code "${referralCode}"`);

        const { data: codeCheck, error: codeCheckError } = await supabaseServer
          .from('affiliates')
          .select('id')
          .eq('referral_code', referralCode)
          .maybeSingle(); // Use maybeSingle instead of single

        // Check if the error is due to missing table
        if (codeCheckError && (codeCheckError.code === '42P01' || codeCheckError.message?.includes('does not exist'))) {
          console.error('❌ Step B FAILED: Affiliate table does not exist');
          throw new Error('Affiliate tables are not set up. Please run the database migration first.');
        }

        if (codeCheckError) {
          console.error('   - Error checking code:', codeCheckError);
        }

        // If no error and no data found, the code is unique
        if (!codeCheckError && !codeCheck) {
          console.log(`   - Code "${referralCode}" is unique! ✅`);
          isUnique = true;
        } else if (codeCheck) {
          console.log(`   - Code "${referralCode}" already exists, retrying...`);
        }
        attempts++;
      }

      if (!isUnique) {
        console.error('❌ Step B FAILED: Could not generate unique code after 10 attempts');
        throw new Error('Failed to generate unique referral code');
      }

      console.log('✅ Step B SUCCESS: Unique code generated:', referralCode);

      // Create affiliate record
      console.log('\n💾 Step C: Inserting affiliate record into database...');
      console.log('   - User ID:', userId);
      console.log('   - Referral Code:', referralCode);
      console.log('   - Commission Rate:', affiliateData.commission_rate || 40.00);

      const { data, error: insertError } = await supabaseServer
        .from('affiliates')
        .insert([{
          user_id: userId,
          referral_code: referralCode,
          commission_rate: affiliateData.commission_rate || 40.00,
          payment_method: affiliateData.payment_method || null,
          payment_email: affiliateData.payment_email || null,
          status: 'active',
        }])
        .select()
        .single();

      // Check if the error is due to missing table
      if (insertError && (insertError.code === '42P01' || insertError.message?.includes('does not exist'))) {
        console.error('❌ Step C FAILED: Affiliate table does not exist');
        throw new Error('Affiliate tables are not set up. Please run the database migration first.');
      }

      if (insertError) {
        console.error('❌ Step C FAILED: Insert error');
        console.error('   - Error:', JSON.stringify(insertError, null, 2));
        throw insertError;
      }

      console.log('✅ Step C SUCCESS: Affiliate record created');
      console.log('   - Record ID:', data.id);
      console.log('✅ === AFFILIATE SERVICE COMPLETED ===\n');

      return {
        success: true,
        data,
        message: 'Affiliate account created successfully',
      };
    } catch (error) {
      console.error('\n❌ === AFFILIATE SERVICE ERROR ===');
      console.error('❌ Error:', error.message);
      console.error('❌ Stack:', error.stack);
      console.error('=== END SERVICE DEBUG ===\n');

      // If it's specifically a table missing error, provide a more helpful message
      if (error.message?.includes('Affiliate tables are not set up')) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Regenerate affiliate referral code (invalidates old code)
   */
  async regenerateAffiliateCode(userId) {
    console.log('\n🔄 === REGENERATE CODE SERVICE ===');
    console.log('👤 User ID:', userId);

    try {
      // Check if user has an affiliate account
      const existing = await this.getAffiliateByUserId(userId);

      if (!existing) {
        console.error('❌ No affiliate account found');
        return {
          success: false,
          message: 'No affiliate account found. Please join the program first.',
        };
      }

      console.log('📋 Current code:', existing.referral_code);
      console.log('🎲 Generating new code...');

      // Generate new unique referral code
      let newReferralCode;
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        newReferralCode = this.generateReferralCode();
        console.log(`   - Attempt ${attempts + 1}: Generated code "${newReferralCode}"`);

        const { data: codeCheck, error: codeCheckError } = await supabaseServer
          .from('affiliates')
          .select('id')
          .eq('referral_code', newReferralCode)
          .maybeSingle();

        if (codeCheckError) {
          console.error('   - Error checking code:', codeCheckError);
        }

        if (!codeCheckError && !codeCheck) {
          console.log(`   - Code "${newReferralCode}" is unique! ✅`);
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Failed to generate unique referral code');
      }

      console.log('💾 Updating affiliate record...');

      // Update the affiliate record with new code
      const { data, error: updateError } = await supabaseServer
        .from('affiliates')
        .update({
          referral_code: newReferralCode,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Update failed:', updateError);
        throw updateError;
      }

      console.log('✅ Code regenerated successfully');
      console.log('   - Old code:', existing.referral_code, '(invalidated)');
      console.log('   - New code:', newReferralCode);
      console.log('=== SERVICE COMPLETE ===\n');

      return {
        success: true,
        data,
        message: 'Referral code regenerated successfully. Your old link is no longer valid.',
      };
    } catch (error) {
      console.error('\n❌ === REGENERATION ERROR ===');
      console.error('❌ Error:', error.message);
      console.error('=== END SERVICE DEBUG ===\n');
      throw error;
    }
  }

  /**
   * Get affiliate by user ID
   */
  async getAffiliateByUserId(userId) {
    try {
      const { data, error } = await supabaseServer
        .from('affiliates')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Check if the error is due to missing table
      if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
        console.error('Affiliate table does not exist:', error.message);
        return null; // Return null instead of throwing for missing table
      }

      if (error && error.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      console.error('Error fetching affiliate:', error);
      throw error;
    }
  }

  /**
   * Get affiliate by referral code
   */
  async getAffiliateByCode(referralCode) {
    try {
      const { data, error } = await supabaseServer
        .from('affiliates')
        .select('*')
        .eq('referral_code', referralCode)
        .single();

      // Check if the error is due to missing table
      if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
        console.error('Affiliate table does not exist:', error.message);
        return null; // Return null instead of throwing for missing table
      }

      if (error && error.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      console.error('Error fetching affiliate by code:', error);
      throw error;
    }
  }

  /**
   * Track affiliate click
   */
  async trackClick(referralCode, clickData) {
    try {
      const affiliate = await this.getAffiliateByCode(referralCode);

      if (!affiliate) {
        return { success: false, message: 'Invalid referral code' };
      }

      const { data, error } = await supabaseServer
        .from('affiliate_clicks')
        .insert([{
          affiliate_id: affiliate.id,
          referral_code: referralCode,
          ip_address: clickData.ip_address,
          user_agent: clickData.user_agent,
          referer_url: clickData.referer_url,
          landing_page: clickData.landing_page,
          utm_source: clickData.utm_source,
          utm_medium: clickData.utm_medium,
          utm_campaign: clickData.utm_campaign,
          utm_content: clickData.utm_content,
          utm_term: clickData.utm_term,
        }])
        .select()
        .single();

      // Check if the error is due to missing table
      if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
        console.error('Affiliate clicks table does not exist:', error.message);
        // Return success with empty data to avoid breaking the flow
        return { success: true, data: null, message: 'Affiliate tracking is not available - database not set up' };
      }

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error tracking click:', error);
      // If it's a table-related error, return a success-like response to avoid breaking the user experience
      if (error.message?.includes('does not exist')) {
        return { success: true, data: null, message: 'Affiliate tracking is not available - database not set up' };
      }
      throw error;
    }
  }

  /**
   * Create a referral when someone signs up via affiliate link
   */
  async createReferral(referralCode, referredUserId, referralData = {}) {
    try {
      const affiliate = await this.getAffiliateByCode(referralCode);

      if (!affiliate) {
        return { success: false, message: 'Invalid referral code' };
      }

      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30); // 30-day trial

      const { data, error } = await supabaseServer
        .from('affiliate_referrals')
        .insert([{
          affiliate_id: affiliate.id,
          referred_user_id: referredUserId,
          referral_code: referralCode,
          ip_address: referralData.ip_address,
          user_agent: referralData.user_agent,
          source_url: referralData.source_url,
          utm_source: referralData.utm_source,
          utm_medium: referralData.utm_medium,
          utm_campaign: referralData.utm_campaign,
          status: 'trial',
          conversion_date: new Date().toISOString(),
          trial_start_date: trialStartDate.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
        }])
        .select()
        .single();

      // Check if the error is due to missing table
      if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
        console.error('Affiliate referrals table does not exist:', error.message);
        // Return success to avoid breaking signup flow, but with a message
        return { success: true, data: null, message: 'Referral tracking is not available - database not set up' };
      }

      if (error) throw error;

      // Update affiliate stats
      const updateResult = await supabaseServer
        .from('affiliates')
        .update({
          total_referrals: (affiliate.total_referrals || 0) + 1,
        })
        .eq('id', affiliate.id);

      // Check if the update failed due to missing table
      if (updateResult.error && (updateResult.error.code === '42P01' || updateResult.error.message?.includes('does not exist'))) {
        console.error('Affiliates table does not exist for update:', updateResult.error.message);
        // Don't throw error, just continue
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creating referral:', error);
      // If it's a table-related error, return a success-like response to avoid breaking signup flow
      if (error.message?.includes('does not exist')) {
        return { success: true, data: null, message: 'Referral tracking is not available - database not set up' };
      }
      throw error;
    }
  }

  /**
   * Activate trial for a user who signed up via affiliate link
   */
  async activateTrialForUser(userId) {
    try {
      // Find the referral record for this user
      const { data: referral, error } = await supabaseServer
        .from('affiliate_referrals')
        .select('*')
        .eq('referred_user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (referral) {
        // Update referral status to 'active' and set trial dates
        const { error: updateError } = await supabaseServer
          .from('affiliate_referrals')
          .update({
            status: 'active',
            conversion_date: new Date().toISOString(),
          })
          .eq('id', referral.id);

        if (updateError) throw updateError;

        // Record the signup bonus commission for the affiliate
        const commissionAmount = 10.00; // Fixed bonus for signup
        await this.recordCommission(referral.affiliate_id, {
          referral_id: referral.id,
          type: 'signup_bonus',
          amount: commissionAmount,
          status: 'pending',
          description: `Signup bonus for referring user ${userId}`,
          metadata: {
            referred_user_id: userId,
            referral_code: referral.referral_code
          }
        });
      }

      return { success: true, message: 'Trial activated successfully' };
    } catch (error) {
      console.error('Error activating trial:', error);
      throw error;
    }
  }

  /**
   * Record a commission
   */
  async recordCommission(affiliateId, commissionData) {
    try {
      const { data, error } = await supabaseServer
        .from('affiliate_commissions')
        .insert([{
          affiliate_id: affiliateId,
          referral_id: commissionData.referral_id,
          type: commissionData.type,
          amount: commissionData.amount,
          status: 'pending',
          subscription_id: commissionData.subscription_id,
          payment_period_start: commissionData.payment_period_start,
          payment_period_end: commissionData.payment_period_end,
          description: commissionData.description,
          metadata: commissionData.metadata,
        }])
        .select()
        .single();

      if (error) throw error;

      // Update affiliate earnings
      const { data: affiliate } = await supabaseServer
        .from('affiliates')
        .select('pending_earnings, total_earnings')
        .eq('id', affiliateId)
        .single();

      await supabaseServer
        .from('affiliates')
        .update({
          pending_earnings: (affiliate.pending_earnings || 0) + parseFloat(commissionData.amount),
          total_earnings: (affiliate.total_earnings || 0) + parseFloat(commissionData.amount),
        })
        .eq('id', affiliateId);

      return { success: true, data };
    } catch (error) {
      console.error('Error recording commission:', error);
      throw error;
    }
  }

  /**
   * Get affiliate dashboard stats
   */
  async getAffiliateDashboard(userId) {
    try {
      const affiliate = await this.getAffiliateByUserId(userId);

      if (!affiliate) {
        return { success: false, message: 'No affiliate account found' };
      }

      // Get referrals stats - handle missing table gracefully
      let referrals = [];
      try {
        const { data: referralsData, error: referralsError } = await supabaseServer
          .from('affiliate_referrals')
          .select('*')
          .eq('affiliate_id', affiliate.id);

        if (referralsError && (referralsError.code === '42P01' || referralsError.message?.includes('does not exist'))) {
          console.error('Affiliate referrals table does not exist:', referralsError.message);
        } else if (!referralsError) {
          referrals = referralsData || [];
        }
      } catch (error) {
        console.error('Error fetching referrals:', error);
        if (error.message?.includes('does not exist')) {
          // Continue without referrals data
        } else {
          throw error; // Re-throw if it's not a table issue
        }
      }

      // Get commissions - handle missing table gracefully
      let commissions = [];
      try {
        const { data: commissionsData, error: commissionsError } = await supabaseServer
          .from('affiliate_commissions')
          .select('*')
          .eq('affiliate_id', affiliate.id)
          .order('created_at', { ascending: false });

        if (commissionsError && (commissionsError.code === '42P01' || commissionsError.message?.includes('does not exist'))) {
          console.error('Affiliate commissions table does not exist:', commissionsError.message);
        } else if (!commissionsError) {
          commissions = commissionsData || [];
        }
      } catch (error) {
        console.error('Error fetching commissions:', error);
        if (error.message?.includes('does not exist')) {
          // Continue without commissions data
        } else {
          throw error; // Re-throw if it's not a table issue
        }
      }

      // Get recent clicks - handle missing table gracefully
      let recentClicks = [];
      try {
        const { data: clicksData, error: clicksError } = await supabaseServer
          .from('affiliate_clicks')
          .select('*')
          .eq('affiliate_id', affiliate.id)
          .order('clicked_at', { ascending: false })
          .limit(100);

        if (clicksError && (clicksError.code === '42P01' || clicksError.message?.includes('does not exist'))) {
          console.error('Affiliate clicks table does not exist:', clicksError.message);
        } else if (!clicksError) {
          recentClicks = clicksData || [];
        }
      } catch (error) {
        console.error('Error fetching clicks:', error);
        if (error.message?.includes('does not exist')) {
          // Continue without clicks data
        } else {
          throw error; // Re-throw if it's not a table issue
        }
      }

      // Calculate stats
      const totalClicks = recentClicks?.length || 0;
      const activeReferrals = referrals?.filter(r => r.status === 'active').length || 0;
      const pendingCommissions = commissions?.filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0;
      const paidCommissions = commissions?.filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0;

      // Get monthly stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const monthlyClicks = recentClicks?.filter(
        c => new Date(c.clicked_at) > thirtyDaysAgo
      ).length || 0;

      const monthlyReferrals = referrals?.filter(
        r => new Date(r.created_at) > thirtyDaysAgo
      ).length || 0;

      const monthlyEarnings = commissions?.filter(
        c => new Date(c.created_at) > thirtyDaysAgo
      ).reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0;

      return {
        success: true,
        data: {
          affiliate,
          stats: {
            total_clicks: totalClicks,
            total_referrals: affiliate.total_referrals,
            active_referrals: activeReferrals,
            successful_referrals: affiliate.successful_referrals,
            total_earnings: affiliate.total_earnings,
            pending_earnings: affiliate.pending_earnings,
            paid_earnings: affiliate.paid_earnings,
            commission_rate: affiliate.commission_rate,
          },
          monthly: {
            clicks: monthlyClicks,
            referrals: monthlyReferrals,
            earnings: monthlyEarnings,
          },
          recent_commissions: commissions?.slice(0, 10) || [],
          recent_clicks: recentClicks?.slice(0, 20) || [],
          referrals: referrals || [],
        },
      };
    } catch (error) {
      console.error('Error fetching affiliate dashboard:', error);
      // If it's a table-related error, return a basic response to avoid breaking the UI
      if (error.message?.includes('does not exist')) {
        return {
          success: true,
          data: {
            affiliate,
            stats: {
              total_clicks: 0,
              total_referrals: 0,
              active_referrals: 0,
              successful_referrals: 0,
              total_earnings: 0,
              pending_earnings: 0,
              paid_earnings: 0,
              commission_rate: 0,
            },
            monthly: {
              clicks: 0,
              referrals: 0,
              earnings: 0,
            },
            recent_commissions: [],
            recent_clicks: [],
            referrals: [],
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get marketing materials
   */
  async getMarketingMaterials() {
    try {
      const { data, error } = await supabaseServer
        .from('affiliate_materials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching marketing materials:', error);
      throw error;
    }
  }

  /**
   * Update affiliate payment details
   */
  async updatePaymentDetails(userId, paymentData) {
    try {
      const affiliate = await this.getAffiliateByUserId(userId);

      if (!affiliate) {
        return { success: false, message: 'No affiliate account found' };
      }

      const { data, error } = await supabaseServer
        .from('affiliates')
        .update({
          payment_method: paymentData.payment_method,
          payment_email: paymentData.payment_email,
          payment_details: paymentData.payment_details,
        })
        .eq('id', affiliate.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error updating payment details:', error);
      throw error;
    }
  }

  /**
   * Get referral performance report
   */
  async getReferralReport(userId, startDate, endDate) {
    try {
      const affiliate = await this.getAffiliateByUserId(userId);

      if (!affiliate) {
        return { success: false, message: 'No affiliate account found' };
      }

      let query = supabaseServer
        .from('affiliate_referrals')
        .select('*')
        .eq('affiliate_id', affiliate.id);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching referral report:', error);
      throw error;
    }
  }

  /**
   * Request payout
   */
  async requestPayout(userId, amount) {
    try {
      const affiliate = await this.getAffiliateByUserId(userId);

      if (!affiliate) {
        return { success: false, message: 'No affiliate account found' };
      }

      if (affiliate.pending_earnings < amount) {
        return { success: false, message: 'Insufficient pending earnings' };
      }

      if (!affiliate.payment_method) {
        return { success: false, message: 'Please set up your payment method first' };
      }

      // Create payout request
      const { data, error } = await supabaseServer
        .from('affiliate_payouts')
        .insert([{
          affiliate_id: affiliate.id,
          amount: amount,
          status: 'pending',
          payment_method: affiliate.payment_method,
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error requesting payout:', error);
      throw error;
    }
  }
}

export default new AffiliateService();
