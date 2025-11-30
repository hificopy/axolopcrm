/**
 * Master Search Service
 * Unified search across all CRM entities
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class MasterSearchService {
  /**
   * Search across all entities in the system
   * @param {string} userId - User ID
   * @param {string} query - Search query
   * @param {object} options - Search options (filters, limits, etc.)
   * @returns {object} Categorized search results
   */
  async search(userId, query, options = {}) {
    if (!query || query.trim().length < 2) {
      return {
        query,
        results: [],
        totalCount: 0,
        categories: {},
      };
    }

    const searchQuery = query.trim().toLowerCase();
    const limit = options.limit || 5; // Limit per category
    const categories = options.categories || ['all']; // Which categories to search

    const shouldSearch = (category) =>
      categories.includes('all') || categories.includes(category);

    // Execute searches in parallel
    const [
      leads,
      contacts,
      campaigns,
      secondBrainNodes,
      secondBrainMaps,
      secondBrainNotes,
      opportunities,
      activities,
      forms,
    ] = await Promise.all([
      shouldSearch('leads') ? this.searchLeads(userId, searchQuery, limit) : [],
      shouldSearch('contacts') ? this.searchContacts(userId, searchQuery, limit) : [],
      shouldSearch('campaigns') ? this.searchCampaigns(userId, searchQuery, limit) : [],
      shouldSearch('secondBrain') ? this.searchSecondBrainNodes(userId, searchQuery, limit) : [],
      shouldSearch('secondBrain') ? this.searchSecondBrainMaps(userId, searchQuery, limit) : [],
      shouldSearch('secondBrain') ? this.searchSecondBrainNotes(userId, searchQuery, limit) : [],
      shouldSearch('opportunities') ? this.searchOpportunities(userId, searchQuery, limit) : [],
      shouldSearch('activities') ? this.searchActivities(userId, searchQuery, limit) : [],
      shouldSearch('forms') ? this.searchForms(userId, searchQuery, limit) : [],
    ]);

    // Combine and categorize results
    const results = [
      ...leads.map(item => ({ ...item, category: 'leads', icon: 'UserPlus' })),
      ...contacts.map(item => ({ ...item, category: 'contacts', icon: 'Users' })),
      ...campaigns.map(item => ({ ...item, category: 'campaigns', icon: 'Mail' })),
      ...secondBrainNodes.map(item => ({ ...item, category: 'secondBrain', subCategory: 'nodes', icon: 'Brain' })),
      ...secondBrainMaps.map(item => ({ ...item, category: 'secondBrain', subCategory: 'maps', icon: 'Map' })),
      ...secondBrainNotes.map(item => ({ ...item, category: 'secondBrain', subCategory: 'notes', icon: 'FileText' })),
      ...opportunities.map(item => ({ ...item, category: 'opportunities', icon: 'TrendingUp' })),
      ...activities.map(item => ({ ...item, category: 'activities', icon: 'Activity' })),
      ...forms.map(item => ({ ...item, category: 'forms', icon: 'FileInput' })),
    ];

    // Sort by relevance (you can implement scoring here)
    const sortedResults = this.sortByRelevance(results, searchQuery);

    return {
      query,
      results: sortedResults,
      totalCount: sortedResults.length,
      categories: {
        leads: leads.length,
        contacts: contacts.length,
        campaigns: campaigns.length,
        secondBrain: secondBrainNodes.length + secondBrainMaps.length + secondBrainNotes.length,
        opportunities: opportunities.length,
        activities: activities.length,
        forms: forms.length,
      },
    };
  }

  /**
   * Search leads
   */
  async searchLeads(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, email, company, status, phone')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(lead => ({
        id: lead.id,
        title: lead.name,
        subtitle: lead.email || lead.company,
        description: lead.phone,
        url: `/app/leads`,
        metadata: { status: lead.status },
      }));
    } catch (error) {
      console.error('Error searching leads:', error);
      return [];
    }
  }

  /**
   * Search contacts
   */
  async searchContacts(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, company, phone, position')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%,phone.ilike.%${query}%,position.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(contact => ({
        id: contact.id,
        title: contact.name,
        subtitle: contact.position || contact.company,
        description: contact.email,
        url: `/app/contacts`,
        metadata: { company: contact.company },
      }));
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  }

  /**
   * Search email campaigns
   */
  async searchCampaigns(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, subject, status, sent_count, created_at')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,subject.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(campaign => ({
        id: campaign.id,
        title: campaign.name,
        subtitle: campaign.subject,
        description: `${campaign.status} • ${campaign.sent_count || 0} sent`,
        url: `/app/email-marketing`,
        metadata: { status: campaign.status, created_at: campaign.created_at },
      }));
    } catch (error) {
      console.error('Error searching campaigns:', error);
      return [];
    }
  }

  /**
   * Search Second Brain nodes
   */
  async searchSecondBrainNodes(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('second_brain_nodes')
        .select('id, label, type, description, tags')
        .eq('user_id', userId)
        .or(`label.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(node => ({
        id: node.id,
        title: node.label,
        subtitle: `${node.type} node`,
        description: node.description,
        url: `/app/second-brain`,
        locked: true,
        lockMessage: 'Coming in V1.2 - Second Brain with AI-powered knowledge management',
        metadata: { type: node.type, tags: node.tags },
      }));
    } catch (error) {
      console.error('Error searching second brain nodes:', error);
      return [];
    }
  }

  /**
   * Search Second Brain maps
   */
  async searchSecondBrainMaps(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('second_brain_maps')
        .select('id, name, description, created_at')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(map => ({
        id: map.id,
        title: map.name,
        subtitle: 'Map',
        description: map.description,
        url: `/app/second-brain`,
        locked: true,
        lockMessage: 'Coming in V1.2 - Mind Maps for visual planning',
        metadata: { created_at: map.created_at },
      }));
    } catch (error) {
      console.error('Error searching second brain maps:', error);
      return [];
    }
  }

  /**
   * Search Second Brain notes
   */
  async searchSecondBrainNotes(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('second_brain_notes')
        .select('id, title, content, folder, tags, starred')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(note => ({
        id: note.id,
        title: note.title,
        subtitle: note.folder || 'Note',
        description: note.content?.substring(0, 100),
        url: `/app/second-brain`,
        locked: true,
        lockMessage: 'Coming in V1.2 - Advanced note-taking with AI',
        metadata: { starred: note.starred, tags: note.tags },
      }));
    } catch (error) {
      console.error('Error searching second brain notes:', error);
      return [];
    }
  }

  /**
   * Search opportunities
   */
  async searchOpportunities(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('id, name, company, value, stage, probability')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,company.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(opp => ({
        id: opp.id,
        title: opp.name,
        subtitle: opp.company,
        description: `$${opp.value || 0} • ${opp.stage}`,
        url: `/app/opportunities`,
        metadata: { value: opp.value, stage: opp.stage, probability: opp.probability },
      }));
    } catch (error) {
      console.error('Error searching opportunities:', error);
      return [];
    }
  }

  /**
   * Search activities
   */
  async searchActivities(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('id, title, type, description, due_date, status')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(activity => ({
        id: activity.id,
        title: activity.title,
        subtitle: activity.type,
        description: activity.description,
        url: `/app/activities`,
        metadata: { type: activity.type, due_date: activity.due_date, status: activity.status },
      }));
    } catch (error) {
      console.error('Error searching activities:', error);
      return [];
    }
  }

  /**
   * Search forms
   */
  async searchForms(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('id, name, description, status, submission_count')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(form => ({
        id: form.id,
        title: form.name,
        subtitle: 'Form',
        description: `${form.submission_count || 0} submissions`,
        url: `/app/forms`,
        metadata: { status: form.status },
      }));
    } catch (error) {
      console.error('Error searching forms:', error);
      return [];
    }
  }

  /**
   * Sort results by relevance
   */
  sortByRelevance(results, query) {
    return results.sort((a, b) => {
      const aTitle = a.title?.toLowerCase() || '';
      const bTitle = b.title?.toLowerCase() || '';
      const lowerQuery = query.toLowerCase();

      // Exact match first
      const aExact = aTitle === lowerQuery ? 1 : 0;
      const bExact = bTitle === lowerQuery ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;

      // Starts with query
      const aStarts = aTitle.startsWith(lowerQuery) ? 1 : 0;
      const bStarts = bTitle.startsWith(lowerQuery) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;

      // Contains query
      const aContains = aTitle.includes(lowerQuery) ? 1 : 0;
      const bContains = bTitle.includes(lowerQuery) ? 1 : 0;
      return bContains - aContains;
    });
  }
}

export default new MasterSearchService();
