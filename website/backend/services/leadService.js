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

// Function to import leads from CSV
const importLeadsFromCsv = async (userId, csvBuffer, presetId = null, dynamicMapping = null) => {
  const records = await parseCsv(csvBuffer);
  const leadsToInsert = [];

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
    // Assumes CSV headers are 'Name', 'Email', 'Website'
    mapping = {
      'Name': 'name',
      'Email': 'email',
      'Website': 'website'
    };
  }

  for (const record of records) {
    const lead = {
      user_id: userId,
      name: record[Object.keys(mapping).find(key => mapping[key] === 'name')] || record['Name'],
      email: record[Object.keys(mapping).find(key => mapping[key] === 'email')] || record['Email'],
      website: record[Object.keys(mapping).find(key => mapping[key] === 'website')] || record['Website'],
      custom_fields: {}
    };

    // Map custom fields
    for (const csvHeader in record) {
      if (!Object.keys(mapping).includes(csvHeader) && record[csvHeader]) {
        lead.custom_fields[csvHeader] = record[csvHeader];
      }
    }
    leadsToInsert.push(lead);
  }

  // Insert leads into Supabase
  const { data, error } = await supabase
    .from('leads')
    .insert(leadsToInsert)
    .select(); // Return the inserted data

  if (error) {
    console.error('Supabase insert error:', error);
    throw new Error(`Failed to insert leads into database: ${error.message}`);
  }

  return data;
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
};
