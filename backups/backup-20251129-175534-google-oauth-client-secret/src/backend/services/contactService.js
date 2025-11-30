import { supabaseServer } from "../config/supabase-auth.js";

// Use the shared supabaseServer client (service role key) from config
const supabase = supabaseServer;

// Get all contacts for a user (with agency context)
const getContacts = async (userId, agencyId = null) => {
  let query = supabase.from("contacts").select("*").eq("user_id", userId);

  // If agency context exists, filter by agency
  if (agencyId) {
    query = query.eq("agency_id", agencyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase fetch contacts error:", error);
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }
  return data;
};

// Get a single contact by ID (with agency context)
const getContactById = async (userId, contactId, agencyId = null) => {
  let query = supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .eq("user_id", userId);

  // If agency context exists, filter by agency
  if (agencyId) {
    query = query.eq("agency_id", agencyId);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("Supabase fetch contact by ID error:", error);
    throw new Error(`Failed to fetch contact: ${error.message}`);
  }
  return data;
};

// Create a new contact (with agency context)
const createContact = async (userId, contactData, agencyId = null) => {
  const insertData = {
    user_id: userId,
    ...contactData,
  };

  // If agency context exists, include agency_id
  if (agencyId) {
    insertData.agency_id = agencyId;
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Supabase create contact error:", error);
    throw new Error(`Failed to create contact: ${error.message}`);
  }
  return data;
};

// Update an existing contact
const updateContact = async (userId, contactId, contactData) => {
  const { data, error } = await supabase
    .from("contacts")
    .update({ ...contactData, updated_at: new Date() })
    .eq("id", contactId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Supabase update contact error:", error);
    throw new Error(`Failed to update contact: ${error.message}`);
  }
  return data;
};

// Delete a contact
const deleteContact = async (userId, contactId) => {
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", contactId)
    .eq("user_id", userId);

  if (error) {
    console.error("Supabase delete contact error:", error);
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
  return true;
};

export default {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
