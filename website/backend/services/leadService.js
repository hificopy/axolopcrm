const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const { Readable } = require('stream');

// Initialize Supabase client (replace with your actual Supabase client setup)
// This is a placeholder. In a real app, you'd likely import a pre-configured client.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for backend operations
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to parse CSV buffer
const parseCsv = (csvBuffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const readableStream = new Readable();
    readableStream.push(csvBuffer);
    readableStream.push(null); // No more data

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
    // Assumes CSV headers are 'Name', 'Email', 'Website', 'Phone', 'Address', 'Type', 'Status', 'Value', 'Owner Email'
    mapping = {
      'Name': 'name',
      'Email': 'email',
      'Website': 'website',
      'Phone': 'phone',
      'Address': 'address',
      'Type': 'type',
      'Status': 'status',
      'Value': 'value',
      'Owner Email': 'owner_email' // Assuming owner is identified by email for import
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
        .from('users') // Assuming 'users' table in public schema or auth.users
        .select('id')
        .eq('email', ownerEmail)
        .single();
      if (ownerData) {
        lead.owner_id = ownerData.id;
      } else {
        console.warn(`Owner with email ${ownerEmail} not found for lead ${lead.name}`);
      }
    } else {
      lead.owner_id = userId; // Default to the user importing the lead
    }


    // Map custom fields
    for (const csvHeader in record) {
      if (!Object.values(mapping).includes(csvHeader) && record[csvHeader]) { // Check if not already mapped to a standard field
        lead.custom_fields[csvHeader] = record[csvHeader];
      }
    }
    leadsToInsert.push(lead);
  }

  // Insert leads into Supabase
  const { data: insertedLeads, error: leadsError } = await supabase
    .from('leads')
    .insert(leadsToInsert)
    .select(); // Return the inserted data

  if (leadsError) {
    console.error('Supabase insert leads error:', leadsError);
    throw new Error(`Failed to insert leads into database: ${leadsError.message}`);
  }

  // For B2C_CUSTOMER leads, create a corresponding contact
  for (const insertedLead of insertedLeads) {
    if (insertedLead.type === 'B2C_CUSTOMER') {
      // Assuming for B2C, lead name is customer name, and email is customer email
      const [firstName, ...lastNameParts] = insertedLead.name.split(' ');
      const lastName = lastNameParts.join(' ') || firstName; // If only one name, use it for both

      contactsToInsert.push({
        user_id: userId,
        lead_id: insertedLead.id,
        first_name: firstName,
        last_name: lastName,
        email: insertedLead.email,
        phone: insertedLead.phone,
        title: 'Customer', // Default title for B2C customer
        is_primary_contact: true,
        custom_fields: insertedLead.custom_fields, // Inherit custom fields from lead
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
      // Decide whether to rollback leads or just log and continue
      // For now, we'll just log and let leads be inserted
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

module.exports = {
  importLeadsFromCsv,
  getLeadImportPresets,
  createLeadImportPreset,
  updateLeadImportPreset,
  deleteLeadImportPreset,
  createContact, // Export createContact for potential use in other services
};