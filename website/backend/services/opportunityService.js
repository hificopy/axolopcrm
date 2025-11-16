const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all opportunities for a user
const getOpportunities = async (userId) => {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase fetch opportunities error:', error);
    throw new Error(`Failed to fetch opportunities: ${error.message}`);
  }
  return data;
};

// Get a single opportunity by ID
const getOpportunityById = async (userId, opportunityId) => {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Supabase fetch opportunity by ID error:', error);
    throw new Error(`Failed to fetch opportunity: ${error.message}`);
  }
  return data;
};

// Create a new opportunity
const createOpportunity = async (userId, opportunityData) => {
  const { data, error } = await supabase
    .from('opportunities')
    .insert({ user_id: userId, ...opportunityData })
    .select()
    .single();

  if (error) {
    console.error('Supabase create opportunity error:', error);
    throw new Error(`Failed to create opportunity: ${error.message}`);
  }
  return data;
};

// Update an existing opportunity
const updateOpportunity = async (userId, opportunityId, opportunityData) => {
  const { data, error } = await supabase
    .from('opportunities')
    .update({ ...opportunityData, updated_at: new Date() })
    .eq('id', opportunityId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Supabase update opportunity error:', error);
    throw new Error(`Failed to update opportunity: ${error.message}`);
  }
  return data;
};

// Delete an opportunity
const deleteOpportunity = async (userId, opportunityId) => {
  const { error } = await supabase
    .from('opportunities')
    .delete()
    .eq('id', opportunityId)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase delete opportunity error:', error);
    throw new Error(`Failed to delete opportunity: ${error.message}`);
  }
  return true;
};

module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
};
