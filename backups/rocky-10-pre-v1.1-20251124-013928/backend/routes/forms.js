import express from 'express';
import { supabaseServer } from '../config/supabase-auth.js';
import FormCampaignIntegrationService from '../services/form-campaign-integration-service.js';
import { authenticateUser } from '../middleware/auth.js';

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
router.get('/', authenticateUser, async (req, res) => {
  console.log('🔥🔥🔥 [FORMS ROUTE] GET / hit! Query:', req.query, 'User:', req.user?.id);
  try {
    const { status, search } = req.query;
    const userId = req.user.id;

    // Validate that we have a user ID after authentication
    if (!userId) {
      console.error('🔥🔥🔥 [FORMS ROUTE] Authentication validation failed: userId is missing after authenticateUser middleware');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User ID not found in request'
      });
    }

    // Build query with Supabase - filter by user_id
    let query = supabaseServer
      .from('forms')
      .select(`
        id, title, description, settings,
        is_active, is_published,
        total_responses, conversion_rate, average_lead_score,
        public_url, created_at, updated_at
      `)
      .eq('user_id', userId) // Only user's own forms
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
      console.error('Supabase error fetching forms:', error); // Added detailed logging
      throw error;
    }

    // Return the forms array directly (not wrapped in an object)
    res.json(data);
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
 * Get a single form by ID (authenticated - for editing)
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabaseServer
      .from('forms')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId) // Only user's own form
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

    // Return the form directly (not wrapped in an object)
    res.json(data);
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
 * GET /api/forms/:id/public
 * Get a form for public viewing (no auth required) - for preview, embed
 */
router.get('/:id/public', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseServer
      .from('forms')
      .select('id, title, description, questions, settings, is_active, is_published')
      .eq('id', id)
      .eq('is_published', true) // Only published forms
      .eq('is_active', true) // Only active forms
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found error code in Supabase
        return res.status(404).json({
          success: false,
          error: 'Form not found or not published'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      form: data
    });
  } catch (error) {
    console.error('Error fetching public form:', error);
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
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
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
        user_id: userId, // Associate form with user
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

    // Return the form directly (not wrapped in an object)
    res.status(201).json(data);
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
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
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
      .eq('user_id', userId) // Only update user's own form
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

    // Return the form directly (not wrapped in an object)
    res.json(data);
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
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabaseServer
      .from('forms')
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
        is_published: false
      })
      .eq('id', id)
      .eq('user_id', userId) // Only delete user's own form
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
router.post('/:id/duplicate', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get the original form (must be user's own form)
    const { data: form, error: fetchError } = await supabaseServer
      .from('forms')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId) // Only duplicate user's own form
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
        user_id: userId, // Associate duplicate with user
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
 * POST /api/forms/:id/auto-capture
 * Auto-capture lead data as user types (without submit)
 * Creates a DRAFT lead associated with the form creator
 */
router.post('/:id/auto-capture', async (req, res) => {
  try {
    const { id: formId } = req.params;
    const {
      responses = {},
      draftLeadId = null, // If provided, update existing draft lead
      sessionId = null // Track unique form sessions
    } = req.body;

    // Get the form to retrieve its creator (user_id)
    const { data: form, error: formError } = await supabaseServer
      .from('forms')
      .select('id, user_id, title, questions, settings')
      .eq('id', formId)
      .is('deleted_at', null)
      .single();

    if (formError || !form) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }

    const formCreatorUserId = form.user_id; // The form creator, NOT the respondent

    // Extract contact info from responses
    let contactEmail = null;
    let contactName = null;
    let contactPhone = null;
    const questions = form.questions;

    for (const q of questions) {
      const response = responses[q.id];
      if (!response) continue;

      if (q.type === 'email') {
        contactEmail = response;
      } else if (q.type === 'phone') {
        contactPhone = response;
      } else if (q.type === 'short-text' && q.title?.toLowerCase().includes('name')) {
        contactName = response;
      }
    }

    // If we don't have at least an email or name, don't create a lead yet
    if (!contactEmail && !contactName) {
      return res.json({
        success: true,
        message: 'Insufficient data for lead capture',
        draftLeadId: null
      });
    }

    // Check if we're updating an existing draft lead
    if (draftLeadId) {
      const { data: existingLead, error: fetchError } = await supabaseServer
        .from('leads')
        .select('id, user_id')
        .eq('id', draftLeadId)
        .eq('user_id', formCreatorUserId) // Ensure lead belongs to form creator
        .eq('status', 'DRAFT')
        .single();

      if (!fetchError && existingLead) {
        // Update existing draft lead
        const { data: updatedLead, error: updateError } = await supabaseServer
          .from('leads')
          .update({
            name: contactName || contactEmail || 'Draft Lead',
            email: contactEmail,
            phone: contactPhone,
            custom_fields: {
              form_responses: responses,
              form_id: formId,
              session_id: sessionId,
              last_captured_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', draftLeadId)
          .eq('user_id', formCreatorUserId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating draft lead:', updateError);
          throw updateError;
        }

        return res.json({
          success: true,
          message: 'Draft lead updated',
          draftLeadId: updatedLead.id,
          lead: updatedLead
        });
      }
    }

    // Create new draft lead
    const { data: newLead, error: createError } = await supabaseServer
      .from('leads')
      .insert([{
        user_id: formCreatorUserId, // Associate with form creator
        name: contactName || contactEmail || 'Draft Lead',
        email: contactEmail,
        phone: contactPhone,
        status: 'DRAFT', // Mark as draft
        source: `Form: ${form.title}`,
        type: 'B2C_CUSTOMER', // Default type
        value: 0,
        custom_fields: {
          form_responses: responses,
          form_id: formId,
          session_id: sessionId,
          captured_at: new Date().toISOString()
        }
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating draft lead:', createError);
      throw createError;
    }

    res.json({
      success: true,
      message: 'Draft lead created',
      draftLeadId: newLead.id,
      lead: newLead
    });
  } catch (error) {
    console.error('Error in auto-capture:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to auto-capture lead',
      message: error.message
    });
  }
});

/**
 * POST /api/forms/:id/submit
 * Submit a form response
 */
router.post('/:id/submit', async (req, res) => {
  try {
    const { id: formId } = req.params;
    const {
      responses = {},
      metadata = {},
      draftLeadId = null // If provided, convert draft lead to completed
    } = req.body;

    // Get the form to calculate lead score
    const { data: form, error: formError } = await supabaseServer
      .from('forms')
      .select('id, user_id, title, questions, settings')
      .eq('id', formId)
      .is('deleted_at', null)
      .single();

    if (formError || !form) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }

    const formCreatorUserId = form.user_id;
    const questions = form.questions;

    // Calculate lead score
    const scoreResult = calculateLeadScore(questions, responses);

    // Extract contact info from responses and validate emails
    let contactEmail = null;
    let contactName = null;
    let contactPhone = null;
    const emailValidationResults = {};

    for (const q of questions) {
      const response = responses[q.id];
      if (!response) continue;

      // Smart email validation
      if (q.type === 'email') {
        contactEmail = response;

        // Validate email if validation is enabled
        if (q.settings?.validateEmail) {
          const validation = await validateEmail(response);

          if (!validation.valid) {
            return res.status(400).json({
              success: false,
              error: validation.reason,
              suggestions: validation.suggestions,
              field: q.id,
              emailValidation: validation
            });
          }

          // Store validation results
          emailValidationResults[q.id] = validation;
        }
      } else if (q.type === 'phone') {
        contactPhone = response;
      } else if (q.type === 'short-text' && q.title?.toLowerCase().includes('name')) {
        contactName = response;
      }
    }

    // Check if form is configured to create contacts
    const formSettings = form.settings;
    const shouldCreateContact = formSettings?.create_contact === true;

    // Insert response
    const { data: formResponse, error: responseError } = await supabaseServer
      .from('form_responses')
      .insert([{
        form_id: formId,
        responses,
        lead_score: scoreResult.total,
        lead_score_breakdown: scoreResult.breakdown,
        is_qualified: scoreResult.qualified,
        contact_email: contactEmail,
        contact_name: contactName,
        contact_phone: contactPhone,
        ip_address: metadata.ip_address || null,
        user_agent: metadata.user_agent || null,
        referrer: metadata.referrer || null,
        utm_source: metadata.utm_source || null,
        utm_medium: metadata.utm_medium || null,
        utm_campaign: metadata.utm_campaign || null
      }])
      .select()
      .single();

    if (responseError) {
      throw responseError;
    }

    // If form is configured to create contacts, create them now
    let contactId = null;
    let leadId = null;
    if (shouldCreateContact && (contactEmail || contactName)) {
      // If we have a draft lead from auto-capture, convert it to a completed lead
      if (draftLeadId) {
        const { data: draftLead, error: draftError } = await supabaseServer
          .from('leads')
          .select('id, user_id')
          .eq('id', draftLeadId)
          .eq('user_id', formCreatorUserId)
          .eq('status', 'DRAFT')
          .single();

        if (!draftError && draftLead) {
          // Convert draft to completed lead
          const { data: convertedLead, error: convertError } = await supabaseServer
            .from('leads')
            .update({
              name: contactName || contactEmail,
              email: contactEmail,
              phone: contactPhone,
              status: scoreResult.qualified ? 'QUALIFIED' : 'NEW',
              value: scoreResult.total || 0,
              source: `Form: ${form.title}`,
              custom_fields: {
                ...draftLead.custom_fields,
                form_responses: responses,
                completed_at: new Date().toISOString(),
                lead_score: scoreResult.total,
                lead_score_breakdown: scoreResult.breakdown
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', draftLeadId)
            .eq('user_id', formCreatorUserId)
            .select()
            .single();

          if (!convertError && convertedLead) {
            leadId = convertedLead.id;
          }
        }
      }

      // Check if contact already exists
      const { data: existingContact } = await supabaseServer
        .from('contacts')
        .select('id, lead_id')
        .eq('email', contactEmail)
        .eq('user_id', formCreatorUserId) // Ensure contact belongs to form creator
        .single();

      if (existingContact) {
        // Update existing contact
        contactId = existingContact.id;
        if (!leadId) leadId = existingContact.lead_id;

        const nameParts = contactName ? contactName.split(' ') : [];
        const firstName = nameParts[0] || null;
        const lastName = nameParts.slice(1).join(' ') || null;

        await supabaseServer
          .from('contacts')
          .update({
            first_name: firstName || existingContact.first_name,
            last_name: lastName || existingContact.last_name,
            phone: contactPhone || existingContact.phone,
            lead_id: leadId || existingContact.lead_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', contactId)
          .eq('user_id', formCreatorUserId);
      } else {
        // Create new contact
        const nameParts = contactName ? contactName.split(' ') : [];
        const firstName = nameParts[0] || 'Contact';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data: newContact, error: contactError } = await supabaseServer
          .from('contacts')
          .insert([{
            user_id: formCreatorUserId, // Associate with form creator
            first_name: firstName,
            last_name: lastName,
            email: contactEmail,
            phone: contactPhone,
            lead_id: leadId
          }])
          .select()
          .single();

        if (!contactError && newContact) {
          contactId = newContact.id;
        }
      }

      // If no lead exists for this contact, create one
      if (!leadId && contactId) {
        const { data: newLead, error: leadError } = await supabaseServer
          .from('leads')
          .insert([{
            user_id: formCreatorUserId, // Associate with form creator
            name: contactName || contactEmail,
            email: contactEmail,
            phone: contactPhone,
            status: scoreResult.qualified ? 'QUALIFIED' : 'NEW',
            value: scoreResult.total || 0,
            source: `Form: ${form.title}`,
            type: 'B2C_CUSTOMER',
            custom_fields: {
              form_responses: responses,
              form_id: formId,
              completed_at: new Date().toISOString(),
              lead_score: scoreResult.total,
              lead_score_breakdown: scoreResult.breakdown
            }
          }])
          .select()
          .single();

        if (!leadError && newLead) {
          leadId = newLead.id;

          // Update contact to link to the new lead
          await supabaseServer
            .from('contacts')
            .update({ lead_id: leadId })
            .eq('id', contactId)
            .eq('user_id', formCreatorUserId);
        }
      }
    }

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
      response: formResponse,
      leadScore: scoreResult,
      contactId: contactId,
      leadId: leadId,
      message: 'Form submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit form',
      message: error.message
    });
  }
});

/**
 * GET /api/forms/:id/responses
 * Get all responses for a form
 */
router.get('/:id/responses', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { limit = 100, offset = 0, qualified, disqualified } = req.query;

    // First verify user owns this form
    const { data: form, error: formError } = await supabaseServer
      .from('forms')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (formError || !form) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }

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
router.get('/:id/analytics', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Get form info (verify ownership)
    const { data: form, error: formError } = await supabaseServer
      .from('forms')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
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
router.get('/:id/export', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { format = 'json' } = req.query;

    // First verify user owns this form
    const { data: form, error: formError } = await supabaseServer
      .from('forms')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (formError || !form) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }

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
router.get('/:id/integrations', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // First verify user owns this form
    const { data: form, error: formError } = await supabaseServer
      .from('forms')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (formError || !form) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }

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
router.post('/:id/integrations', authenticateUser, async (req, res) => {
  try {
    const { id: formId } = req.params;
    const userId = req.user.id;
    const {
      integration_type,
      config = {},
      webhook_url,
      webhook_method = 'POST',
      webhook_headers = {},
      notification_email,
      email_template
    } = req.body;

    // First verify user owns this form
    const { data: form, error: formError } = await supabaseServer
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('user_id', userId)
      .single();

    if (formError || !form) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }

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
router.put('/:formId/integrations/:integrationId', authenticateUser, async (req, res) => {
  try {
    const { formId, integrationId } = req.params;
    const userId = req.user.id;
    const updates = { ...req.body };

    // First verify user owns this form
    const { data: form, error: formError } = await supabaseServer
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('user_id', userId)
      .single();

    if (formError || !form) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }

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
      .eq('form_id', formId) // Ensure integration belongs to the form
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
router.delete('/:formId/integrations/:integrationId', authenticateUser, async (req, res) => {
  try {
    const { formId, integrationId } = req.params;
    const userId = req.user.id;

    // First verify user owns this form
    const { data: form, error: formError } = await supabaseServer
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('user_id', userId)
      .single();

    if (formError || !form) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }

    const { data, error } = await supabaseServer
      .from('form_integrations')
      .delete()
      .eq('id', integrationId)
      .eq('form_id', formId) // Ensure integration belongs to the form
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
