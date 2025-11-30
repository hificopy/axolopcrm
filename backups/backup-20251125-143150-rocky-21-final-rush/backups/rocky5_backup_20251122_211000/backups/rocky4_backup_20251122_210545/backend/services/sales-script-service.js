import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Sales Script Service
 * Manages sales scripts, templates, and voicemail drops
 */

// ===========================================================================
// SALES SCRIPT TEMPLATES
// ===========================================================================

/**
 * Get all script templates for a user
 */
const getScriptTemplates = async (userId, filters = {}) => {
  let query = supabase
    .from('sales_script_templates')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.scriptType) {
    query = query.eq('script_type', filters.scriptType);
  }
  if (filters.industry) {
    query = query.eq('industry', filters.industry);
  }
  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Get script template by ID
 */
const getScriptTemplateById = async (userId, templateId) => {
  const { data, error } = await supabase
    .from('sales_script_templates')
    .select('*')
    .eq('id', templateId)
    .or(`user_id.eq.${userId},user_id.is.null`)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create a new script template
 */
const createScriptTemplate = async (userId, templateData) => {
  const {
    name,
    scriptType,
    content,
    description,
    industry,
    isDefault,
    isActive,
    tags,
    variables
  } = templateData;

  const { data, error } = await supabase
    .from('sales_script_templates')
    .insert({
      user_id: userId,
      name,
      script_type: scriptType || 'default',
      content,
      description,
      industry,
      is_default: isDefault || false,
      is_active: isActive !== undefined ? isActive : true,
      tags: tags || [],
      variables: variables || {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a script template
 */
const updateScriptTemplate = async (userId, templateId, templateData) => {
  const {
    name,
    scriptType,
    content,
    description,
    industry,
    isDefault,
    isActive,
    tags,
    variables
  } = templateData;

  const updateData = {
    updated_at: new Date()
  };

  if (name !== undefined) updateData.name = name;
  if (scriptType !== undefined) updateData.script_type = scriptType;
  if (content !== undefined) updateData.content = content;
  if (description !== undefined) updateData.description = description;
  if (industry !== undefined) updateData.industry = industry;
  if (isDefault !== undefined) updateData.is_default = isDefault;
  if (isActive !== undefined) updateData.is_active = isActive;
  if (tags !== undefined) updateData.tags = tags;
  if (variables !== undefined) updateData.variables = variables;

  const { data, error } = await supabase
    .from('sales_script_templates')
    .update(updateData)
    .eq('id', templateId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a script template
 */
const deleteScriptTemplate = async (userId, templateId) => {
  const { error } = await supabase
    .from('sales_script_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};

/**
 * Get script template for specific scenario
 * Automatically selects the best template based on lead data
 */
const getRecommendedScript = async (userId, leadId, scenario = 'default') => {
  try {
    // Get lead information
    const { data: lead } = await supabase
      .from('leads')
      .select('*, custom_fields')
      .eq('id', leadId)
      .single();

    const industry = lead?.custom_fields?.industry || null;

    // Get matching script template
    let query = supabase
      .from('sales_script_templates')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('script_type', scenario)
      .eq('is_active', true);

    // Prefer industry-specific templates
    if (industry) {
      const { data: industryScripts } = await query.eq('industry', industry);
      if (industryScripts && industryScripts.length > 0) {
        return industryScripts[0];
      }
    }

    // Fall back to general templates
    const { data: generalScripts } = await query.is('industry', null);
    if (generalScripts && generalScripts.length > 0) {
      return generalScripts[0];
    }

    // Return default if no match found
    const { data: defaultScript } = await supabase
      .from('sales_script_templates')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('script_type', 'default')
      .eq('is_active', true)
      .limit(1)
      .single();

    return defaultScript;
  } catch (error) {
    console.error('Error getting recommended script:', error);
    return null;
  }
};

/**
 * Populate script template with lead data
 */
const populateScriptTemplate = async (templateId, leadId, contactId = null) => {
  try {
    // Get template
    const { data: template } = await supabase
      .from('sales_script_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) throw new Error('Template not found');

    // Get lead data
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    // Get contact data if provided
    let contact = null;
    if (contactId) {
      const { data: contactData } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();
      contact = contactData;
    }

    // Replace variables in script content
    let populatedContent = template.content;

    // Define variable replacements
    const replacements = {
      '{lead_name}': lead?.name || '[Company Name]',
      '{company_name}': process.env.COMPANY_NAME || '[Your Company]',
      '{agent_name}': '[Agent Name]', // Will be replaced with actual agent name in frontend
      '{agent_phone}': process.env.COMPANY_PHONE || '[Your Phone]',
      '{contact_name}': contact ? `${contact.first_name} ${contact.last_name}` : '[Contact Name]',
      '{first_name}': contact?.first_name || '[First Name]',
      '{insurance_type}': lead?.custom_fields?.insurance_type || '[Insurance Type]',
      '{last_contact_date}': '[Last Contact Date]', // Will be calculated in frontend
      '{time_slot}': '[Time Slot]', // Will be filled during call
      '{timeframe}': '[Timeframe]' // Will be filled during call
    };

    // Replace all variables
    Object.entries(replacements).forEach(([variable, value]) => {
      populatedContent = populatedContent.replace(new RegExp(variable, 'g'), value);
    });

    return {
      ...template,
      populated_content: populatedContent,
      lead_context: {
        lead_name: lead?.name,
        contact_name: contact ? `${contact.first_name} ${contact.last_name}` : null,
        industry: lead?.custom_fields?.industry,
        status: lead?.status
      }
    };
  } catch (error) {
    console.error('Error populating script template:', error);
    throw error;
  }
};

// ===========================================================================
// VOICEMAIL TEMPLATES
// ===========================================================================

/**
 * Get all voicemail templates for a user
 */
const getVoicemailTemplates = async (userId, filters = {}) => {
  let query = supabase
    .from('voicemail_templates')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('created_at', { ascending: false });

  if (filters.industry) {
    query = query.eq('industry', filters.industry);
  }
  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Get voicemail template by ID
 */
const getVoicemailTemplateById = async (userId, templateId) => {
  const { data, error } = await supabase
    .from('voicemail_templates')
    .select('*')
    .eq('id', templateId)
    .or(`user_id.eq.${userId},user_id.is.null`)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create a new voicemail template
 */
const createVoicemailTemplate = async (userId, templateData) => {
  const {
    name,
    script,
    audioUrl,
    durationSeconds,
    industry,
    isActive
  } = templateData;

  const { data, error } = await supabase
    .from('voicemail_templates')
    .insert({
      user_id: userId,
      name,
      script,
      audio_url: audioUrl,
      duration_seconds: durationSeconds,
      industry,
      is_active: isActive !== undefined ? isActive : true,
      usage_count: 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a voicemail template
 */
const updateVoicemailTemplate = async (userId, templateId, templateData) => {
  const {
    name,
    script,
    audioUrl,
    durationSeconds,
    industry,
    isActive
  } = templateData;

  const updateData = {
    updated_at: new Date()
  };

  if (name !== undefined) updateData.name = name;
  if (script !== undefined) updateData.script = script;
  if (audioUrl !== undefined) updateData.audio_url = audioUrl;
  if (durationSeconds !== undefined) updateData.duration_seconds = durationSeconds;
  if (industry !== undefined) updateData.industry = industry;
  if (isActive !== undefined) updateData.is_active = isActive;

  const { data, error } = await supabase
    .from('voicemail_templates')
    .update(updateData)
    .eq('id', templateId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a voicemail template
 */
const deleteVoicemailTemplate = async (userId, templateId) => {
  const { error } = await supabase
    .from('voicemail_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};

/**
 * Populate voicemail template with lead data
 */
const populateVoicemailTemplate = async (templateId, leadId, contactId = null) => {
  try {
    // Get template
    const { data: template } = await supabase
      .from('voicemail_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) throw new Error('Template not found');

    // Get lead data
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    // Get contact data if provided
    let contact = null;
    if (contactId) {
      const { data: contactData } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();
      contact = contactData;
    }

    // Replace variables in voicemail script
    let populatedScript = template.script;

    const replacements = {
      '{lead_name}': contact?.first_name || lead?.name || '[Name]',
      '{company_name}': process.env.COMPANY_NAME || '[Your Company]',
      '{agent_name}': '[Agent Name]',
      '{agent_phone}': process.env.COMPANY_PHONE || '[Your Phone]',
      '{insurance_type}': lead?.custom_fields?.insurance_type || 'insurance'
    };

    Object.entries(replacements).forEach(([variable, value]) => {
      populatedScript = populatedScript.replace(new RegExp(variable, 'g'), value);
    });

    return {
      ...template,
      populated_script: populatedScript
    };
  } catch (error) {
    console.error('Error populating voicemail template:', error);
    throw error;
  }
};

// ===========================================================================
// EXPORTS
// ===========================================================================

export default {
  // Script templates
  getScriptTemplates,
  getScriptTemplateById,
  createScriptTemplate,
  updateScriptTemplate,
  deleteScriptTemplate,
  getRecommendedScript,
  populateScriptTemplate,

  // Voicemail templates
  getVoicemailTemplates,
  getVoicemailTemplateById,
  createVoicemailTemplate,
  updateVoicemailTemplate,
  deleteVoicemailTemplate,
  populateVoicemailTemplate
};
