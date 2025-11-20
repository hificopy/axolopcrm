import { createClient } from '@supabase/supabase-js';
import csv from 'csv-parser';
import { Readable } from 'stream';
import industryMappings from '../config/industry-icp-mappings.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to parse CSV buffer
const parseCsv = (csvBuffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const readableStream = new Readable();
    readableStream.push(csvBuffer);
    readableStream.push(null);

    readableStream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Helper function to create a contact
const createContact = async (userId, leadId, firstName, lastName, email, phone, title, isPrimaryContact, customFields) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      user_id: userId,
      lead_id: leadId,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      title: title,
      is_primary_contact: isPrimaryContact,
      custom_fields: customFields,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase create contact error:', error);
    throw new Error(`Failed to create contact: ${error.message}`);
  }
  return data;
};

// Get all leads for a user
const getLeads = async (userId) => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase fetch leads error:', error);
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }
  return data;
};

// Get a single lead by ID
const getLeadById = async (userId, leadId) => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Supabase fetch lead by ID error:', error);
    throw new Error(`Failed to fetch lead: ${error.message}`);
  }
  return data;
};

// Create a new lead
const createLead = async (userId, leadData) => {
  const { data, error } = await supabase
    .from('leads')
    .insert({ user_id: userId, ...leadData })
    .select()
    .single();

  if (error) {
    console.error('Supabase create lead error:', error);
    throw new Error(`Failed to create lead: ${error.message}`);
  }
  return data;
};

// Update an existing lead
const updateLead = async (userId, leadId, leadData) => {
  const { data, error } = await supabase
    .from('leads')
    .update({ ...leadData, updated_at: new Date() })
    .eq('id', leadId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Supabase update lead error:', error);
    throw new Error(`Failed to update lead: ${error.message}`);
  }
  return data;
};

// Delete a lead
const deleteLead = async (userId, leadId) => {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase delete lead error:', error);
    throw new Error(`Failed to delete lead: ${error.message}`);
  }
  return true;
};

// Function to import leads from CSV
const importLeadsFromCsv = async (userId, csvBuffer, presetId = null, dynamicMapping = null) => {
  const records = await parseCsv(csvBuffer);
  const leadsToInsert = [];
  const contactsToInsert = [];

  let mapping = {};
  if (presetId) {
    const { data: preset, error } = await supabase
      .from('lead_import_presets')
      .select('mapping')
      .eq('id', presetId)
      .eq('user_id', userId)
      .single();

    if (error || !preset) {
      throw new Error('Preset not found or not authorized');
    }
    mapping = preset.mapping;
  } else if (dynamicMapping) {
    mapping = dynamicMapping;
  } else {
    // Default mapping if no preset or dynamic mapping is provided
    mapping = {
      'Name': 'name',
      'Email': 'email',
      'Website': 'website',
      'Phone': 'phone',
      'Address': 'address',
      'Type': 'type',
      'Status': 'status',
      'Value': 'value',
      'Owner Email': 'owner_email'
    };
  }

  for (const record of records) {
    const lead = {
      user_id: userId,
      name: record[Object.keys(mapping).find(key => mapping[key] === 'name')] || record['Name'],
      email: record[Object.keys(mapping).find(key => mapping[key] === 'email')] || record['Email'],
      website: record[Object.keys(mapping).find(key => mapping[key] === 'website')] || record['Website'],
      phone: record[Object.keys(mapping).find(key => mapping[key] === 'phone')] || record['Phone'],
      address: record[Object.keys(mapping).find(key => mapping[key] === 'address')] ? JSON.parse(record[Object.keys(mapping).find(key => mapping[key] === 'address')]) : null,
      type: record[Object.keys(mapping).find(key => mapping[key] === 'type')] || 'B2B_COMPANY',
      status: record[Object.keys(mapping).find(key => mapping[key] === 'status')] || 'NEW',
      value: record[Object.keys(mapping).find(key => mapping[key] === 'value')] ? parseFloat(record[Object.keys(mapping).find(key => mapping[key] === 'value')]) : 0,
      custom_fields: {}
    };

    // Resolve owner_id from owner_email if provided
    const ownerEmail = record[Object.keys(mapping).find(key => mapping[key] === 'owner_email')] || record['Owner Email'];
    if (ownerEmail) {
      const { data: ownerData, error: ownerError } = await supabase
        .from('users')
        .select('id')
        .eq('email', ownerEmail)
        .single();
      if (ownerData) {
        lead.owner_id = ownerData.id;
      } else {
        console.warn(`Owner with email ${ownerEmail} not found for lead ${lead.name}`);
      }
    } else {
      lead.owner_id = userId;
    }

    // Map custom fields
    for (const csvHeader in record) {
      if (!Object.values(mapping).includes(csvHeader) && record[csvHeader]) {
        lead.custom_fields[csvHeader] = record[csvHeader];
      }
    }
    leadsToInsert.push(lead);
  }

  // Insert leads into Supabase
  const { data: insertedLeads, error: leadsError } = await supabase
    .from('leads')
    .insert(leadsToInsert)
    .select();

  if (leadsError) {
    console.error('Supabase insert leads error:', leadsError);
    throw new Error(`Failed to insert leads into database: ${leadsError.message}`);
  }

  // For B2C_CUSTOMER leads, create a corresponding contact
  for (const insertedLead of insertedLeads) {
    if (insertedLead.type === 'B2C_CUSTOMER') {
      const [firstName, ...lastNameParts] = insertedLead.name.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      contactsToInsert.push({
        user_id: userId,
        lead_id: insertedLead.id,
        first_name: firstName,
        last_name: lastName,
        email: insertedLead.email,
        phone: insertedLead.phone,
        title: 'Customer',
        is_primary_contact: true,
        custom_fields: insertedLead.custom_fields,
      });
    }
  }

  if (contactsToInsert.length > 0) {
    const { data: insertedContacts, error: contactsError } = await supabase
      .from('contacts')
      .insert(contactsToInsert)
      .select();

    if (contactsError) {
      console.error('Supabase insert contacts error:', contactsError);
      console.warn('Failed to insert some contacts for B2C leads.');
    }
  }

  return insertedLeads;
};

// Function to get lead import presets for a user
const getLeadImportPresets = async (userId) => {
  const { data, error } = await supabase
    .from('lead_import_presets')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase fetch presets error:', error);
    throw new Error(`Failed to fetch presets: ${error.message}`);
  }
  return data;
};

// Function to create a new lead import preset
const createLeadImportPreset = async (userId, presetName, source, mapping) => {
  const { data, error } = await supabase
    .from('lead_import_presets')
    .insert({ user_id: userId, preset_name: presetName, source, mapping })
    .select()
    .single();

  if (error) {
    console.error('Supabase create preset error:', error);
    throw new Error(`Failed to create preset: ${error.message}`);
  }
  return data;
};

// Function to update an existing lead import preset
const updateLeadImportPreset = async (userId, presetId, presetName, source, mapping) => {
  const { data, error } = await supabase
    .from('lead_import_presets')
    .update({ preset_name: presetName, source, mapping, updated_at: new Date() })
    .eq('id', presetId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Supabase update preset error:', error);
    throw new Error(`Failed to update preset: ${error.message}`);
  }
  return data;
};

// Function to delete a lead import preset
const deleteLeadImportPreset = async (userId, presetId) => {
  const { error } = await supabase
    .from('lead_import_presets')
    .delete()
    .eq('id', presetId)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase delete preset error:', error);
    throw new Error(`Failed to delete preset: ${error.message}`);
  }
  return true;
};

// Industry-specific CSV import with validation and history tracking
const importLeadsWithIndustry = async (userId, csvBuffer, industryId, mapping) => {
  const industry = industryMappings.getIndustryById(industryId);
  if (!industry) {
    throw new Error('Invalid industry ID');
  }

  const records = await parseCsv(csvBuffer);
  const leadsToInsert = [];
  const errors = [];
  let successCount = 0;

  // Validate each record against industry requirements
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const lead = {
      user_id: userId,
      industry_id: industryId,
      custom_fields: {},
    };

    // Map CSV columns to lead fields
    for (const csvHeader in mapping) {
      const crmField = mapping[csvHeader];
      if (crmField && record[csvHeader]) {
        lead[crmField] = record[csvHeader];
      }
    }

    // For B2B leads, use company_name as name
    if (industry.category === 'B2B') {
      lead.name = lead.company_name || lead.facility_name || 'Unknown Company';
      lead.type = 'B2B_COMPANY';
    } else {
      // For B2C leads, combine first_name and last_name
      lead.name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown';
      lead.type = 'B2C_CUSTOMER';
    }

    // Set default values
    lead.status = lead.status || 'NEW';
    lead.value = lead.value ? parseFloat(lead.value) : 0;
    lead.owner_id = userId;

    // Validate required fields
    const validation = industryMappings.validateLeadData(industryId, lead);
    if (!validation.valid) {
      errors.push({
        row: i + 2, // +2 because CSV rows start at 2 (1 is header)
        errors: validation.errors,
        data: record
      });
      continue;
    }

    // Move unmapped fields to custom_fields
    for (const csvHeader in record) {
      if (!mapping[csvHeader] && record[csvHeader]) {
        lead.custom_fields[csvHeader] = record[csvHeader];
      }
    }

    leadsToInsert.push(lead);
  }

  // Insert valid leads
  let insertedLeads = [];
  if (leadsToInsert.length > 0) {
    const { data, error } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select();

    if (error) {
      console.error('Supabase insert leads error:', error);
      throw new Error(`Failed to insert leads: ${error.message}`);
    }

    insertedLeads = data || [];
    successCount = insertedLeads.length;

    // For B2C leads, create corresponding contacts
    if (industry.category === 'B2C') {
      const contactsToInsert = insertedLeads.map(lead => ({
        user_id: userId,
        lead_id: lead.id,
        first_name: lead.first_name || lead.name.split(' ')[0],
        last_name: lead.last_name || lead.name.split(' ').slice(1).join(' '),
        email: lead.email,
        phone: lead.phone,
        title: 'Customer',
        is_primary_contact: true,
        custom_fields: lead.custom_fields,
      }));

      const { error: contactsError } = await supabase
        .from('contacts')
        .insert(contactsToInsert);

      if (contactsError) {
        console.warn('Failed to create contacts for B2C leads:', contactsError);
      }
    }
  }

  // Track import history
  await trackImportHistory(userId, {
    industry_id: industryId,
    total_rows: records.length,
    success_count: successCount,
    error_count: errors.length,
    errors: errors.slice(0, 100), // Store first 100 errors
    mapping: mapping,
  });

  return {
    success: true,
    imported: insertedLeads,
    successCount,
    errorCount: errors.length,
    errors: errors.slice(0, 10), // Return first 10 errors to user
  };
};

// Track import/export history
const trackImportHistory = async (userId, importData) => {
  const { error } = await supabase
    .from('lead_import_history')
    .insert({
      user_id: userId,
      industry_id: importData.industry_id,
      total_rows: importData.total_rows,
      success_count: importData.success_count,
      error_count: importData.error_count,
      errors: importData.errors,
      mapping: importData.mapping,
      created_at: new Date(),
    });

  if (error) {
    console.error('Failed to track import history:', error);
  }
};

// Get import history for a user
const getImportHistory = async (userId) => {
  const { data, error } = await supabase
    .from('lead_import_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Supabase fetch import history error:', error);
    throw new Error(`Failed to fetch import history: ${error.message}`);
  }
  return data;
};

// Generate CSV template for an industry
const generateIndustryTemplate = (industryId) => {
  const template = industryMappings.generateCsvTemplate(industryId);
  if (!template) {
    throw new Error('Invalid industry ID');
  }

  const csvContent = [
    template.headers.join(','),
    template.exampleRow.join(',')
  ].join('\n');

  return csvContent;
};

// Get all industries
const getAllIndustries = () => {
  return {
    b2b: industryMappings.getIndustriesByCategory('B2B'),
    b2c: industryMappings.getIndustriesByCategory('B2C'),
  };
};

// ESM default export
export default {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  importLeadsFromCsv,
  importLeadsWithIndustry,
  getLeadImportPresets,
  createLeadImportPreset,
  updateLeadImportPreset,
  deleteLeadImportPreset,
  getImportHistory,
  generateIndustryTemplate,
  getAllIndustries,
  createContact,
};
