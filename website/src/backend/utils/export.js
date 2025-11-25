import { Parser } from 'json2csv';
import logger from './logger.js';
import { supabase } from '../config/supabase-auth.js';

/**
 * Data export utilities
 */

/**
 * Export data to CSV
 */
export function exportToCSV(data, fields = null) {
  try {
    const opts = fields ? { fields } : {};
    const parser = new Parser(opts);
    return parser.parse(data);
  } catch (error) {
    logger.error('CSV export error', { error: error.message });
    throw new Error('CSV export failed');
  }
}

/**
 * Export data to JSON
 */
export function exportToJSON(data, pretty = true) {
  try {
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  } catch (error) {
    logger.error('JSON export error', { error: error.message });
    throw new Error('JSON export failed');
  }
}

/**
 * Export leads to CSV
 */
export async function exportLeads(userId, filters = {}) {
  try {
    let query = supabase.from('leads').select('*').eq('user_id', userId);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const fields = [
      'id',
      'name',
      'email',
      'phone',
      'website',
      'type',
      'status',
      'value',
      'lead_score',
      'created_at',
      'updated_at',
    ];

    return exportToCSV(data, fields);
  } catch (error) {
    logger.error('Lead export error', { error: error.message });
    throw new Error('Lead export failed');
  }
}

/**
 * Export contacts to CSV
 */
export async function exportContacts(userId, filters = {}) {
  try {
    let query = supabase.from('contacts').select('*').eq('user_id', userId);

    if (filters.leadId) {
      query = query.eq('lead_id', filters.leadId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const fields = [
      'id',
      'first_name',
      'last_name',
      'email',
      'phone',
      'title',
      'lead_id',
      'is_primary_contact',
      'created_at',
      'updated_at',
    ];

    return exportToCSV(data, fields);
  } catch (error) {
    logger.error('Contact export error', { error: error.message });
    throw new Error('Contact export failed');
  }
}

/**
 * Export opportunities to CSV
 */
export async function exportOpportunities(userId, filters = {}) {
  try {
    let query = supabase.from('opportunities').select('*').eq('user_id', userId);

    if (filters.stage) {
      query = query.eq('stage', filters.stage);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const fields = [
      'id',
      'name',
      'lead_id',
      'stage',
      'amount',
      'close_date',
      'description',
      'created_at',
      'updated_at',
    ];

    return exportToCSV(data, fields);
  } catch (error) {
    logger.error('Opportunity export error', { error: error.message });
    throw new Error('Opportunity export failed');
  }
}

/**
 * Export email campaign data
 */
export async function exportCampaign(campaignId) {
  try {
    const { data, error } = await supabase
      .from('campaign_emails')
      .select('*')
      .eq('campaign_id', campaignId);

    if (error) {
      throw error;
    }

    const fields = [
      'id',
      'email_address',
      'status',
      'sent_at',
      'delivered_at',
      'opened_at',
      'clicked_at',
      'bounced_at',
      'open_count',
      'click_count',
    ];

    return exportToCSV(data, fields);
  } catch (error) {
    logger.error('Campaign export error', { error: error.message });
    throw new Error('Campaign export failed');
  }
}

/**
 * Create data export package
 */
export async function createExportPackage(userId, exportType = 'all') {
  try {
    const exports = {};

    if (exportType === 'all' || exportType === 'leads') {
      exports.leads = await exportLeads(userId);
    }

    if (exportType === 'all' || exportType === 'contacts') {
      exports.contacts = await exportContacts(userId);
    }

    if (exportType === 'all' || exportType === 'opportunities') {
      exports.opportunities = await exportOpportunities(userId);
    }

    logger.info('Export package created', { userId, exportType });

    return exports;
  } catch (error) {
    logger.error('Export package error', { error: error.message });
    throw new Error('Export package creation failed');
  }
}

/**
 * Format data for Excel export
 */
export function formatForExcel(data) {
  // Convert dates to Excel-friendly format
  return data.map((row) => {
    const formatted = { ...row };

    for (const key in formatted) {
      if (formatted[key] instanceof Date) {
        formatted[key] = formatted[key].toISOString().split('T')[0];
      } else if (typeof formatted[key] === 'string' && formatted[key].match(/^\d{4}-\d{2}-\d{2}/)) {
        formatted[key] = new Date(formatted[key]).toISOString().split('T')[0];
      }
    }

    return formatted;
  });
}

export default {
  exportToCSV,
  exportToJSON,
  exportLeads,
  exportContacts,
  exportOpportunities,
  exportCampaign,
  createExportPackage,
  formatForExcel,
};
