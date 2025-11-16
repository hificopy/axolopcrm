import express from 'express';
import { supabaseServer } from '../config/supabase-auth.js';
import FormCampaignIntegrationService from '../services/form-campaign-integration-service.js';

const router = express.Router();
const formCampaignService = new FormCampaignIntegrationService();

// Utility: Calculate lead score from responses
function calculateLeadScore(questions, responses) {
  let total = 0;
  const breakdown = {};

  questions.forEach(question => {
    if (!question.lead_scoring_enabled || !question.lead_scoring) {
      return;
    }

    const response = responses[question.id];
    if (response === undefined || response === null) {
      return;
    }

    let questionScore = 0;

    if (Array.isArray(response)) {
      // Multiple selections (checkboxes)
      response.forEach(value => {
        const score = question.lead_scoring[value] || 0;
        questionScore += score;
      });
    } else {
      // Single selection
      const scoreKey = question.type === 'rating' ? `rating-${response}` : response;
      questionScore = question.lead_scoring[scoreKey] || 0;
    }

    if (questionScore !== 0) {
      breakdown[question.id] = {
        title: question.title,
        score: questionScore,
        response: response
      };
    }

    total += questionScore;
  });

  return {
    total,
    breakdown,
    qualified: total > 0
  };
}

// Utility: Update form statistics
async function updateFormStats(formId) {
  // Calculate total responses
  const responsesResult = await supabaseServer
    .from('form_responses')
    .select('id', { count: 'exact', head: true })
    .eq('form_id', formId);

  const totalResponses = responsesResult.count || 0;

  // Calculate average lead score
  const scoreResult = await supabaseServer
    .from('form_responses')
    .select('lead_score')
    .eq('form_id', formId)
    .gt('lead_score', 0);

  let avgScore = 0;
  if (scoreResult.data && scoreResult.data.length > 0) {
    const totalScore = scoreResult.data.reduce((sum, resp) => sum + resp.lead_score, 0);
    avgScore = totalScore / scoreResult.data.length;
  }

  // Update form statistics
  const { error } = await supabaseServer
    .from('forms')
    .update({
      total_responses: totalResponses,
      average_lead_score: avgScore,
      updated_at: new Date().toISOString()
    })
    .eq('id', formId);

  if (error) {
    console.error('Error updating form stats:', error);
    throw error;
  }
}

// ============================================================================
// FORM CRUD ENDPOINTS
// ============================================================================

/**
 * GET /api/forms
 * List all forms for the current user
 */
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    // Build query with Supabase
    let query = supabaseServer
      .from('forms')
      .select(`
        id, title, description, settings,
        is_active, is_published,
        total_responses, conversion_rate, average_lead_score,
        public_url, created_at, updated_at
      `)
      .is('deleted_at', null) // Only non-deleted forms
      .order('updated_at', { ascending: false });

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active');
    }

    // Search filter
    if (search) {
      query = query.or(`title.ilike.${search},description.ilike.${search}`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      forms: data
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch forms',
      message: error.message
    });
  }
});

/**
 * GET /api/forms/:id
 * Get a single form by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseServer
      .from('forms')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found error code in Supabase
        return res.status(404).json({
          success: false,
          error: 'Form not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      form: data
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch form',
      message: error.message
    });
  }
});

/**
 * POST /api/forms
 * Create a new form
 */
router.post('/', async (req, res) => {
  try {
    const {
      title = 'Untitled Form',
      description = '',
      questions = [],
      settings = {
        branding: true,
        analytics: true,
        notifications: true,
        mode: 'standard',
        theme: 'default',
        create_contact: false
      }
    } = req.body;

    const { data, error } = await supabaseServer
      .from('forms')
      .insert([{
        title,
        description,
        questions,
        settings,
        is_active: false,
        is_published: false
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      form: data,
      message: 'Form created successfully'
    });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create form',
      message: error.message
    });
  }
});

/**
 * PUT /api/forms/:id
 * Update an existing form
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    // Build update object
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.questions !== undefined) updates.questions = req.body.questions;
    if (req.body.settings !== undefined) updates.settings = req.body.settings;
    if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;
    if (req.body.is_published !== undefined) updates.is_published = req.body.is_published;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseServer
      .from('forms')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found error code in Supabase
        return res.status(404).json({
          success: false,
          error: 'Form not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      form: data,
      message: 'Form updated successfully'
    });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update form',
      message: error.message
    });
  }
});

/**
 * DELETE /api/forms/:id
 * Soft delete a form
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseServer
      .from('forms')
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
        is_published: false
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select('id, title')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found error code in Supabase
        return res.status(404).json({
          success: false,
          error: 'Form not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      message: 'Form deleted successfully',
      form: data
    });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete form',
      message: error.message
    });
  }
});

/**
 * POST /api/forms/:id/duplicate
 * Duplicate an existing form
 */
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the original form
    const { data: form, error: fetchError } = await supabaseServer
      .from('forms')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // Record not found error code in Supabase
        return res.status(404).json({
          success: false,
          error: 'Form not found'
        });
      }
      throw fetchError;
    }

    // Create duplicate
    const { data, error: insertError } = await supabaseServer
      .from('forms')
      .insert([{
        title: `${form.title} (Copy)`,
        description: form.description,
        questions: form.questions,
        settings: form.settings,
        is_active: false,
        is_published: false
      }])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    res.status(201).json({
      success: true,
      form: data,
      message: 'Form duplicated successfully'
    });
  } catch (error) {
    console.error('Error duplicating form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to duplicate form',
      message: error.message
    });
  }
});

// ============================================================================
// FORM SUBMISSION ENDPOINTS
// ============================================================================

/**
 * POST /api/forms/:id/submit
 * Submit a form response
 */
router.post('/:id/submit', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id: formId } = req.params;
    const {
      responses = {},
      metadata = {}
    } = req.body;

    // Get the form to calculate lead score
    const formResult = await client.query(
      'SELECT id, title, questions FROM forms WHERE id = $1 AND deleted_at IS NULL',
      [formId]
    );

    if (formResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }

    const form = formResult.rows[0];
    const questions = typeof form.questions === 'string' ? JSON.parse(form.questions) : form.questions;

    // Calculate lead score
    const scoreResult = calculateLeadScore(questions, responses);

    // Extract contact info from responses
    let contactEmail = null;
    let contactName = null;
    let contactPhone = null;

    questions.forEach(q => {
      const response = responses[q.id];
      if (!response) return;

      if (q.type === 'email') contactEmail = response;
      else if (q.type === 'phone') contactPhone = response;
      else if (q.type === 'short-text' && q.title?.toLowerCase().includes('name')) contactName = response;
    });

    // Check if form is configured to create contacts
    const formSettings = typeof form.settings === 'string' ? JSON.parse(form.settings) : form.settings;
    const shouldCreateContact = formSettings.create_contact === true;

    // Insert response
    const insertResult = await client.query(
      `INSERT INTO form_responses (
        form_id, responses,
        lead_score, lead_score_breakdown, is_qualified,
        contact_email, contact_name, contact_phone,
        ip_address, user_agent, referrer,
        utm_source, utm_medium, utm_campaign
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        formId,
        JSON.stringify(responses),
        scoreResult.total,
        JSON.stringify(scoreResult.breakdown),
        scoreResult.qualified,
        contactEmail,
        contactName,
        contactPhone,
        metadata.ip_address || null,
        metadata.user_agent || null,
        metadata.referrer || null,
        metadata.utm_source || null,
        metadata.utm_medium || null,
        metadata.utm_campaign || null
      ]
    );

    // If form is configured to create contacts, create them now
    let contactId = null;
    let leadId = null;
    if (shouldCreateContact && (contactEmail || contactName)) {
      // Check if contact already exists
      let existingContactResult = await client.query(
        'SELECT id, lead_id FROM contacts WHERE email = $1',
        [contactEmail]
      );

      if (existingContactResult.rows.length > 0) {
        // Update existing contact
        contactId = existingContactResult.rows[0].id;
        leadId = existingContactResult.rows[0].lead_id;

        await client.query(
          `UPDATE contacts
           SET first_name = COALESCE($1, first_name),
               last_name = COALESCE($2, last_name),
               phone = COALESCE($3, phone),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [
            contactName ? contactName.split(' ')[0] : null,
            contactName ? contactName.split(' ').slice(1).join(' ') : null,
            contactPhone,
            contactId
          ]
        );
      } else {
        // Create new contact
        const nameParts = contactName ? contactName.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const contactResult = await client.query(
          `INSERT INTO contacts (first_name, last_name, email, phone)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [firstName, lastName, contactEmail, contactPhone]
        );
        
        contactId = contactResult.rows[0].id;
      }

      // If no lead exists for this contact, create one
      if (!leadId) {
        const leadResult = await client.query(
          `INSERT INTO leads (name, email, phone, status, value)
           VALUES ($1, $2, $3, 'NEW', $4)
           RETURNING id`,
          [contactName || contactEmail, contactEmail, contactPhone, scoreResult.total || 0]
        );
        
        leadId = leadResult.rows[0].id;
        
        // Update contact to link to the new lead
        await client.query(
          'UPDATE contacts SET lead_id = $1 WHERE id = $2',
          [leadId, contactId]
        );
      }
    }

    // Update form analytics
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    await client.query(
      `INSERT INTO form_analytics (form_id, date, hour, completions, qualified_leads)
       VALUES ($1, $2, $3, 1, $4)
       ON CONFLICT (form_id, date, hour)
       DO UPDATE SET
         completions = form_analytics.completions + 1,
         qualified_leads = form_analytics.qualified_leads + $4,
         updated_at = CURRENT_TIMESTAMP`,
      [formId, today, currentHour, scoreResult.qualified ? 1 : 0]
    );

    // Update question analytics
    for (const [questionId, answer] of Object.entries(responses)) {
      await client.query(
        `INSERT INTO question_analytics (form_id, question_id, answers)
         VALUES ($1, $2, 1)
         ON CONFLICT (form_id, question_id)
         DO UPDATE SET
           answers = question_analytics.answers + 1,
           updated_at = CURRENT_TIMESTAMP`,
        [formId, questionId]
      );
    }

    await client.query('COMMIT');

    // Update form stats (async, don't wait)
    updateFormStats(formId).catch(err => console.error('Error updating form stats:', err));

    // Process form submission with campaign integrations
    const contactInfo = {
      email: contactEmail,
      name: contactName,
      phone: contactPhone
    };
    
    formCampaignService.processFormSubmissionWithCampaigns(formId, responses, contactInfo)
      .catch(err => console.error('Error processing form campaign integrations:', err));

    res.status(201).json({
      success: true,
      response: insertResult.rows[0],
      leadScore: scoreResult,
      contactId: contactId,
      leadId: leadId,
      message: 'Form submitted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit form',
      message: error.message
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/forms/:id/responses
 * Get all responses for a form
 */
router.get('/:id/responses', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100, offset = 0, qualified, disqualified } = req.query;

    let query = supabaseServer
      .from('form_responses')
      .select('*', { count: 'exact' })
      .eq('form_id', id)
      .order('submitted_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (qualified !== undefined) {
      query = query.eq('is_qualified', qualified === 'true');
    }

    if (disqualified !== undefined) {
      query = query.eq('is_disqualified', disqualified === 'true');
    }

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      responses: data,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch responses',
      message: error.message
    });
  }
});

/**
 * GET /api/forms/:id/analytics
 * Get analytics for a form
 */
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Get form info
    const { data: form, error: formError } = await supabaseServer
      .from('forms')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (formError || !form) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }

    // Get analytics data
    let analyticsQuery = supabaseServer
      .from('form_analytics')
      .select('*')
      .eq('form_id', id)
      .order('date', { ascending: false })
      .order('hour', { ascending: false });

    if (startDate) {
      analyticsQuery = analyticsQuery.gte('date', startDate);
    }
    if (endDate) {
      analyticsQuery = analyticsQuery.lte('date', endDate);
    }

    const { data: analyticsData, error: analyticsError } = await analyticsQuery;

    if (analyticsError) {
      throw analyticsError;
    }

    // Get question analytics
    const { data: questionAnalytics, error: questionAnalyticsError } = await supabaseServer
      .from('question_analytics')
      .select('*')
      .eq('form_id', id);

    if (questionAnalyticsError) {
      throw questionAnalyticsError;
    }

    // Get response summary
    const { count: totalResponses, error: countError } = await supabaseServer
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', id);

    if (countError) {
      throw countError;
    }

    // Get qualified leads count
    const { count: qualifiedLeads, error: qualifiedError } = await supabaseServer
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', id)
      .eq('is_qualified', true);

    if (qualifiedError) {
      throw qualifiedError;
    }

    // Get disqualified leads count
    const { count: disqualifiedLeads, error: disqualifiedError } = await supabaseServer
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', id)
      .eq('is_disqualified', true);

    if (disqualifiedError) {
      throw disqualifiedError;
    }

    // Get average lead score
    const { data: avgScoreResult, error: avgScoreError } = await supabaseServer
      .from('form_responses')
      .select('lead_score')
      .eq('form_id', id);

    if (avgScoreError) {
      throw avgScoreError;
    }

    let avgLeadScore = 0;
    let maxLeadScore = 0;
    let minLeadScore = 0;

    if (avgScoreResult && avgScoreResult.length > 0) {
      const scores = avgScoreResult.map(r => r.lead_score).filter(s => s !== null);
      if (scores.length > 0) {
        avgLeadScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        maxLeadScore = Math.max(...scores);
        minLeadScore = Math.min(...scores);
      }
    }

    res.json({
      success: true,
      form: form,
      analytics: analyticsData,
      questionAnalytics: questionAnalytics,
      summary: {
        total_responses: totalResponses || 0,
        qualified_leads: qualifiedLeads || 0,
        disqualified_leads: disqualifiedLeads || 0,
        avg_lead_score: avgLeadScore,
        max_lead_score: maxLeadScore,
        min_lead_score: minLeadScore
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

/**
 * GET /api/forms/:id/export
 * Export form responses as JSON/CSV
 */
router.get('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;

    // Get form responses with form information
    const { data: responses, error: responsesError } = await supabaseServer
      .from('form_responses')
      .select(`
        *,
        form:title
      `)
      .eq('form_id', id)
      .order('submitted_at', { ascending: false });

    if (responsesError) {
      throw responsesError;
    }

    if (format === 'csv') {
      // Convert to CSV
      if (responses.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No responses found'
        });
      }

      // Get form details to access questions
      const { data: formData, error: formError } = await supabaseServer
        .from('forms')
        .select('title, questions')
        .eq('id', id)
        .single();

      if (formError) {
        console.warn('Could not fetch form data for CSV headers:', formError);
      }

      // Build CSV headers from first response
      const headers = ['ID', 'Submitted At', 'Lead Score', 'Qualified', 'Email', 'Name', 'Phone'];
      const questions = formData?.questions || [];
      questions.forEach(q => headers.push(q.title));

      // Build CSV rows
      const csvRows = [headers.join(',')];
      responses.forEach(row => {
        const values = [
          row.id,
          row.submitted_at,
          row.lead_score,
          row.is_qualified,
          row.contact_email || '',
          row.contact_name || '',
          row.contact_phone || ''
        ];

        questions.forEach(q => {
          const answer = row.responses[q.id] || '';
          values.push(Array.isArray(answer) ? answer.join('; ') : answer);
        });

        csvRows.push(values.map(v => `"${v}"`).join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="form-${id}-responses.csv"`);
      res.send(csvRows.join('\n'));
    } else {
      // Return as JSON
      res.json({
        success: true,
        responses: responses,
        total: responses.length
      });
    }
  } catch (error) {
    console.error('Error exporting responses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export responses',
      message: error.message
    });
  }
});

// ============================================================================
// FORM INTEGRATIONS ENDPOINTS
// ============================================================================

/**
 * GET /api/forms/:id/integrations
 * Get all integrations for a form
 */
router.get('/:id/integrations', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseServer
      .from('form_integrations')
      .select('*')
      .eq('form_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      integrations: data
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integrations',
      message: error.message
    });
  }
});

/**
 * POST /api/forms/:id/integrations
 * Add a new integration to a form
 */
router.post('/:id/integrations', async (req, res) => {
  try {
    const { id: formId } = req.params;
    const {
      integration_type,
      config = {},
      webhook_url,
      webhook_method = 'POST',
      webhook_headers = {},
      notification_email,
      email_template
    } = req.body;

    const { data, error } = await supabaseServer
      .from('form_integrations')
      .insert([{
        form_id: formId,
        integration_type,
        config,
        webhook_url,
        webhook_method,
        webhook_headers,
        notification_email,
        email_template
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      integration: data,
      message: 'Integration added successfully'
    });
  } catch (error) {
    console.error('Error adding integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add integration',
      message: error.message
    });
  }
});

/**
 * PUT /api/forms/:formId/integrations/:integrationId
 * Update an integration
 */
router.put('/:formId/integrations/:integrationId', async (req, res) => {
  try {
    const { integrationId } = req.params;
    const updates = { ...req.body };
    
    // Remove protected fields that shouldn't be updated
    delete updates.id;
    delete updates.form_id;
    delete updates.created_at;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseServer
      .from('form_integrations')
      .update(updates)
      .eq('id', integrationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found error code in Supabase
        return res.status(404).json({
          success: false,
          error: 'Integration not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      integration: data,
      message: 'Integration updated successfully'
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update integration',
      message: error.message
    });
  }
});

/**
 * DELETE /api/forms/:formId/integrations/:integrationId
 * Delete an integration
 */
router.delete('/:formId/integrations/:integrationId', async (req, res) => {
  try {
    const { integrationId } = req.params;

    const { data, error } = await supabaseServer
      .from('form_integrations')
      .delete()
      .eq('id', integrationId)
      .select('id, integration_type')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found error code in Supabase
        return res.status(404).json({
          success: false,
          error: 'Integration not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      message: 'Integration deleted successfully',
      integration: data
    });
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete integration',
      message: error.message
    });
  }
});

export default router;
