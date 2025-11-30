import { supabase } from '../config/supabase-client.js';

class SupabaseContactService {
  constructor() {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }
  }

  // Create a new contact
  async createContact(contactData) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        throw new Error(`Could not create contact: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createContact:', error);
      throw error;
    }
  }

  // Get all contacts
  async getContacts(limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error getting contacts:', error);
        throw new Error(`Could not get contacts: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getContacts:', error);
      throw error;
    }
  }

  // Get a specific contact by ID
  async getContactById(id) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error getting contact by ID:', error);
        throw new Error(`Could not get contact: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getContactById:', error);
      throw error;
    }
  }

  // Update a contact
  async updateContact(id, contactData) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact:', error);
        throw new Error(`Could not update contact: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateContact:', error);
      throw error;
    }
  }

  // Delete a contact
  async deleteContact(id) {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact:', error);
        throw new Error(`Could not delete contact: ${error.message}`);
      }

      return { success: true, id };
    } catch (error) {
      console.error('Error in deleteContact:', error);
      throw error;
    }
  }
}

export default SupabaseContactService;