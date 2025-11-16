const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all contacts for a user
const getContacts = async (userId) => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase fetch contacts error:', error);
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }
  return data;
};

// Get a single contact by ID
const getContactById = async (userId, contactId) => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Supabase fetch contact by ID error:', error);
    throw new Error(`Failed to fetch contact: ${error.message}`);
  }
  return data;
};

// Create a new contact
const createContact = async (userId, contactData) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert({ user_id: userId, ...contactData })
    .select()
    .single();

  if (error) {
    console.error('Supabase create contact error:', error);
    throw new Error(`Failed to create contact: ${error.message}`);
  }
  return data;
};

// Update an existing contact
const updateContact = async (userId, contactId, contactData) => {
  const { data, error } = await supabase
    .from('contacts')
    .update({ ...contactData, updated_at: new Date() })
    .eq('id', contactId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Supabase update contact error:', error);
    throw new Error(`Failed to update contact: ${error.message}`);
  }
  return data;
};

// Delete a contact
const deleteContact = async (userId, contactId) => {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase delete contact error:', error);
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
  return true;
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
