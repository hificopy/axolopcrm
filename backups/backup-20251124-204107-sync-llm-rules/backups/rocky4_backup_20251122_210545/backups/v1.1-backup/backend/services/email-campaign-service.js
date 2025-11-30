import { createClient } from '@supabase/supabase-js';
import EmailService from './email-service.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role for backend operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const emailService = new EmailService();

class EmailCampaignService {
  async createCampaign(campaignData) {
    try {
      const { data: campaign, error } = await supabase
        .from('email_campaigns')
        .insert([campaignData])
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign:', error);
        throw error;
      }

      return campaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  async sendCampaign(campaignId, options = {}) {
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          template:email_templates(*)
        `)
        .eq('id', campaignId)
        .single();

      if (campaignError) {
        console.error('Error fetching campaign:', campaignError);
        throw new Error(`Campaign ${campaignId} not found`);
      }

      // Get target recipients based on segmentation
      const recipients = await this.getTargetRecipients(campaign);

      // If this is an A/B test, split recipients among variants
      if (campaign.is_ab_test && campaign.ab_test_variants) {
        await this.sendABTestCampaign(campaign, recipients);
      } else {
        // Send regular campaign
        await this.sendRegularCampaign(campaign, recipients);
      }

      // Update campaign status
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          status: 'SENT',
          sent_at: new Date(),
          total_sent: recipients.length
        })
        .eq('id', campaignId);

      if (updateError) {
        console.error('Error updating campaign status:', updateError);
      }

      return { success: true, recipientsSent: recipients.length };
    } catch (error) {
      console.error('Error sending campaign:', error);
      const { error: statusUpdateError } = await supabase
        .from('email_campaigns')
        .update({ status: 'FAILED' })
        .eq('id', campaignId);

      if (statusUpdateError) {
        console.error('Error updating campaign status to failed:', statusUpdateError);
      }
      
      throw error;
    }
  }

  async getTargetRecipients(campaign) {
    try {
      const segment = campaign.target_segment;
      const leadFilters = {};
      const contactFilters = {};

      // Apply segmentation rules to both leads and contacts
      if (segment.tags && segment.tags.length > 0) {
        leadFilters.tags = `cs.{${segment.tags.join(',')}}`;
        contactFilters.tags = `cs.{${segment.tags.join(',')}}`;
      }

      if (segment.status) {
        leadFilters.status = segment.status;
        // For contacts, we don't have a direct status field, but we could use other criteria
        if (segment.status === 'ACTIVE') {
          contactFilters.is_active = true;
        }
      }

      if (segment.dateRange) {
        leadFilters.created_at = {
          gte: new Date(segment.dateRange.from).toISOString(),
          lte: new Date(segment.dateRange.to).toISOString()
        };
        contactFilters.created_at = {
          gte: new Date(segment.dateRange.from).toISOString(),
          lte: new Date(segment.dateRange.to).toISOString()
        };
      }

      if (segment.minScore !== undefined) {
        leadFilters.score = { gte: segment.minScore };
      }

      if (segment.industries && segment.industries.length > 0) {
        leadFilters.industry = { in: segment.industries };
        contactFilters.industry = { in: segment.industries };
      }

      if (segment.companySize) {
        leadFilters.company_size = segment.companySize;
        contactFilters.company_size = segment.companySize;
      }

      // Get leads that match the criteria
      let query = supabase.from('leads').select(`
        id,
        email,
        name,
        first_name,
        last_name,
        company,
        title,
        phone,
        website,
        industry,
        company_size,
        custom_fields
      `);

      if (Object.keys(leadFilters).length > 0) {
        for (const [key, value] of Object.entries(leadFilters)) {
          if (typeof value === 'object') {
            // Handle complex filters like hasSome, in, etc.
            if (value.hasSome) {
              query = query.contains(key, value.hasSome);
            } else if (value.in) {
              query = query.in(key, value.in);
            } else if (value.gte || value.lte) {
              if (value.gte) query = query.gte(key, value.gte);
              if (value.lte) query = query.lte(key, value.lte);
            }
          } else {
            query = query.eq(key, value);
          }
        }
      }

      const { data: leads, error: leadsError } = await query;

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        throw leadsError;
      }

      // Get contacts that match the criteria
      query = supabase.from('contacts').select(`
        id,
        email,
        name,
        first_name,
        last_name,
        company,
        title,
        phone,
        mobile_phone,
        linkedin_url,
        industry,
        company_size,
        custom_fields
      `);

      if (Object.keys(contactFilters).length > 0) {
        for (const [key, value] of Object.entries(contactFilters)) {
          if (typeof value === 'object') {
            // Handle complex filters like hasSome, in, etc.
            if (value.hasSome) {
              query = query.contains(key, value.hasSome);
            } else if (value.in) {
              query = query.in(key, value.in);
            } else if (value.gte || value.lte) {
              if (value.gte) query = query.gte(key, value.gte);
              if (value.lte) query = query.lte(key, value.lte);
            }
          } else {
            query = query.eq(key, value);
          }
        }
      }

      const { data: contacts, error: contactsError } = await query;

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        throw contactsError;
      }

      // Combine and return recipients
      return [
        ...leads.map(lead => ({ ...lead, type: 'lead' })),
        ...contacts.map(contact => ({ ...contact, type: 'contact' }))
      ];
    } catch (error) {
      console.error('Error getting target recipients:', error);
      throw error;
    }
  }

  // Get all contacts and leads for segmentation
  async getAllRecipients(filters = {}) {
    try {
      const { search, tags, status, industry, companySize, dateRange } = filters;

      let leadQuery = supabase.from('leads').select(`
        id,
        email,
        name,
        first_name,
        last_name,
        company,
        status,
        tags,
        industry,
        company_size,
        created_at
      `);

      let contactQuery = supabase.from('contacts').select(`
        id,
        email,
        name,
        first_name,
        last_name,
        company,
        tags,
        industry,
        company_size,
        created_at
      `);

      if (search) {
        // For leads
        leadQuery = leadQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
        // For contacts
        contactQuery = contactQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
      }

      if (tags && tags.length > 0) {
        leadQuery = leadQuery.contains('tags', tags);
        contactQuery = contactQuery.contains('tags', tags);
      }

      if (status) {
        leadQuery = leadQuery.eq('status', status);
        if (status === 'ACTIVE') {
          contactQuery = contactQuery.eq('is_active', true);
        }
      }

      if (industry) {
        leadQuery = leadQuery.eq('industry', industry);
        contactQuery = contactQuery.eq('industry', industry);
      }

      if (companySize) {
        leadQuery = leadQuery.eq('company_size', companySize);
        contactQuery = contactQuery.eq('company_size', companySize);
      }

      if (dateRange) {
        const fromDate = new Date(dateRange.from).toISOString();
        const toDate = new Date(dateRange.to).toISOString();
        leadQuery = leadQuery.gte('created_at', fromDate).lte('created_at', toDate);
        contactQuery = contactQuery.gte('created_at', fromDate).lte('created_at', toDate);
      }

      const [leadsResponse, contactsResponse] = await Promise.all([
        leadQuery,
        contactQuery
      ]);

      const { data: leads, error: leadsError } = leadsResponse;
      const { data: contacts, error: contactsError } = contactsResponse;

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        throw leadsError;
      }

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        throw contactsError;
      }

      // Combine and format results
      const allRecipients = [
        ...leads.map(lead => ({
          ...lead,
          type: 'lead',
          fullName: lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
        })),
        ...contacts.map(contact => ({
          ...contact,
          type: 'contact',
          fullName: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
        }))
      ];

      // Sort by creation date descending
      allRecipients.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return allRecipients;
    } catch (error) {
      console.error('Error getting all recipients:', error);
      throw error;
    }
  }

  async sendRegularCampaign(campaign, recipients) {
    try {
      const emailPromises = recipients.map(recipient =>
        emailService.sendCampaignEmail(
          campaign.id,
          recipient,
          recipient.type === 'lead' ? recipient.id : null,
          recipient.type === 'contact' ? recipient.id : null
        ).catch(error => {
          console.error(`Error sending email to ${recipient.email}:`, error);
        })
      );

      await Promise.all(emailPromises);
    } catch (error) {
      console.error('Error in regular campaign sending:', error);
      throw error;
    }
  }

  async sendABTestCampaign(campaign, recipients) {
    try {
      const variants = campaign.ab_test_variants;
      if (!variants || variants.length < 2) {
        throw new Error('A/B test must have at least 2 variants');
      }

      // Split recipients into groups
      const groupSize = Math.ceil(recipients.length / variants.length);
      const groups = [];

      for (let i = 0; i < variants.length; i++) {
        const start = i * groupSize;
        const end = Math.min(start + groupSize, recipients.length);
        groups.push({
          recipients: recipients.slice(start, end),
          variant: variants[i]
        });
      }

      // Send each group a different variant
      const emailPromises = [];
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const variant = group.variant;

        // Temporarily update campaign with variant content
        const originalSubject = campaign.subject;
        const originalHtml = campaign.html_content;
        const originalText = campaign.text_content;

        const updatedCampaign = {
          ...campaign,
          subject: variant.subject || originalSubject,
          html_content: variant.html_content || originalHtml,
          text_content: variant.text_content || originalText
        };

        const groupPromises = group.recipients.map(recipient =>
          emailService.sendCampaignEmail(
            campaign.id,
            { ...recipient, variantId: variant.id },
            recipient.type === 'lead' ? recipient.id : null,
            recipient.type === 'contact' ? recipient.id : null
          ).catch(error => {
            console.error(`Error sending A/B variant to ${recipient.email}:`, error);
          })
        );

        emailPromises.push(...groupPromises);
      }

      await Promise.all(emailPromises);
    } catch (error) {
      console.error('Error in A/B test campaign sending:', error);
      throw error;
    }
  }

  async scheduleCampaign(campaignId, scheduledAt) {
    try {
      const { data: campaign, error } = await supabase
        .from('email_campaigns')
        .update({
          scheduled_at: new Date(scheduledAt).toISOString(),
          status: 'SCHEDULED'
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) {
        console.error('Error scheduling campaign:', error);
        throw error;
      }

      return campaign;
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      throw error;
    }
  }

  async runScheduledCampaigns() {
    try {
      const now = new Date().toISOString();
      const { data: campaigns, error: campaignsError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('status', 'SCHEDULED')
        .lte('scheduled_at', now);

      if (campaignsError) {
        console.error('Error fetching scheduled campaigns:', campaignsError);
        throw campaignsError;
      }

      for (const campaign of campaigns) {
        try {
          await this.sendCampaign(campaign.id);
        } catch (error) {
          console.error(`Error sending scheduled campaign ${campaign.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error running scheduled campaigns:', error);
      throw error;
    }
  }

  async getCampaignStats(campaignId) {
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          emails:campaign_emails!inner(*)
        `)
        .eq('id', campaignId)
        .single();

      if (campaignError) {
        console.error('Error fetching campaign:', campaignError);
        throw new Error(`Campaign ${campaignId} not found`);
      }

      const totalSent = campaign.emails.filter(email => 
        email.status !== 'FAILED' && email.sent_at
      ).length;
      const totalOpened = campaign.emails.filter(email => email.opened_at).length;
      const totalClicked = campaign.emails.filter(email => email.clicked_at).length;

      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

      return {
        totalSent,
        totalOpened,
        totalClicked,
        openRate,
        clickRate,
        bounces: campaign.total_bounced || 0,
        unsubscribes: campaign.total_unsubscribed || 0
      };
    } catch (error) {
      console.error('Error getting campaign stats:', error);
      throw error;
    }
  }

  async updateCampaignStats(campaignId) {
    try {
      const stats = await this.getCampaignStats(campaignId);

      const { error } = await supabase
        .from('email_campaigns')
        .update({
          total_sent: stats.totalSent,
          total_opened: stats.totalOpened,
          total_clicked: stats.totalClicked
        })
        .eq('id', campaignId);

      if (error) {
        console.error('Error updating campaign stats:', error);
        throw error;
      }

      return stats;
    } catch (error) {
      console.error('Error updating campaign stats:', error);
      throw error;
    }
  }

  async getCampaignAnalytics(filters = {}) {
    try {
      let query = supabase
        .from('email_campaigns')
        .select(`
          *,
          emails:campaign_emails!inner(*),
          created_by:users!inner(*)
        `);

      if (filters.dateRange) {
        query = query.gte('created_at', new Date(filters.dateRange.from).toISOString())
                .lte('created_at', new Date(filters.dateRange.to).toISOString());
      }

      if (filters.campaignType) {
        query = query.eq('type', filters.campaignType);
      }

      const { data: campaigns, error: campaignsError } = await query;

      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
        throw campaignsError;
      }

      // Calculate overall analytics
      const analytics = {
        totalCampaigns: campaigns.length,
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
        totalUnsubscribed: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
        topPerformers: [],
        performanceByType: {},
        performanceOverTime: []
      };

      for (const campaign of campaigns) {
        const sent = campaign.emails.filter(email => email.sent_at).length;
        const delivered = campaign.emails.filter(email => !email.bounced_at).length;
        const opened = campaign.emails.filter(email => email.opened_at).length;
        const clicked = campaign.emails.filter(email => email.clicked_at).length;
        const bounced = campaign.emails.filter(email => email.bounced_at).length;
        const unsubscribed = campaign.emails.filter(email => email.unsubscribed_at).length;

        analytics.totalSent += sent;
        analytics.totalDelivered += delivered;
        analytics.totalOpened += opened;
        analytics.totalClicked += clicked;
        analytics.totalBounced += bounced;
        analytics.totalUnsubscribed += unsubscribed;

        // Calculate rates
        const openRate = sent > 0 ? (opened / sent) * 100 : 0;
        const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;

        // Add to top performers
        if (opened > 0) {
          analytics.topPerformers.push({
            id: campaign.id,
            name: campaign.name,
            openRate,
            clickRate,
            sent,
            opened,
            clicked
          });
        }

        // Group by type
        if (!analytics.performanceByType[campaign.type]) {
          analytics.performanceByType[campaign.type] = {
            count: 0,
            totalSent: 0,
            totalOpened: 0,
            totalClicked: 0
          };
        }

        analytics.performanceByType[campaign.type].count++;
        analytics.performanceByType[campaign.type].totalSent += sent;
        analytics.performanceByType[campaign.type].totalOpened += opened;
        analytics.performanceByType[campaign.type].totalClicked += clicked;

        // Add to performance over time
        const dateKey = new Date(campaign.created_at).toISOString().split('T')[0];
        analytics.performanceOverTime.push({
          date: dateKey,
          campaignName: campaign.name,
          type: campaign.type,
          sent,
          opened,
          clicked
        });
      }

      // Calculate averages
      if (campaigns.length > 0) {
        analytics.avgOpenRate = analytics.totalSent > 0 ?
          (analytics.totalOpened / analytics.totalSent) * 100 : 0;
        analytics.avgClickRate = analytics.totalSent > 0 ?
          (analytics.totalClicked / analytics.totalSent) * 100 : 0;
      }

      // Sort top performers by open rate
      analytics.topPerformers.sort((a, b) => b.openRate - a.openRate);
      analytics.topPerformers = analytics.topPerformers.slice(0, 10); // Top 10

      return analytics;
    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      throw error;
    }
  }

  async getContactEngagementAnalytics() {
    try {
      // Get engagement data for contacts - this query might need to be simplified
      // as complex nested queries might not be supported in all cases
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id, name, email');

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        throw contactsError;
      }

      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, email');

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        throw leadsError;
      }

      // For engagement analytics, we need to count email interactions
      // This would typically require a separate table for interactions
      const { data: emailInteractions, error: interactionsError } = await supabase
        .from('interactions')
        .select('id, contact_id, lead_id, type, occurred_at')
        .eq('type', 'EMAIL');

      if (interactionsError) {
        console.error('Error fetching email interactions:', interactionsError);
        // Continue with partial data
      }

      // Calculate engagement metrics
      const engagementStats = {
        totalContacts: contacts.length,
        totalLeads: leads.length,
        emailInteractions: emailInteractions ? emailInteractions.length : 0,
        mostEngaged: [],
        engagementTrends: []
      };

      return engagementStats;
    } catch (error) {
      console.error('Error getting contact engagement analytics:', error);
      throw error;
    }
  }
}

export default EmailCampaignService;