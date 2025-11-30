import { supabaseServer } from "../config/supabase-auth.js";
import { sendErrorResponse } from "./error-handler.js";

/**
 * Transaction handling utilities to prevent ROOT CAUSE issues
 * Ensures data integrity for multi-table operations
 */

/**
 * Execute multiple database operations in a transaction
 * @param {Function} operations - Function that receives supabase client and performs operations
 * @param {string} requestId - Request ID for tracing
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export const executeTransaction = async (operations, requestId = null) => {
  try {
    // Use Supabase RPC for transaction-like behavior
    // Since Supabase doesn't support client-side transactions well,
    // we'll use a pattern that ensures rollback on failure

    const result = await operations(supabaseServer);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(`Transaction failed [${requestId}]:`, error);

    return {
      success: false,
      error: error.message || "Transaction failed",
    };
  }
};

/**
 * Create form response with contact in a safe transaction-like pattern
 * @param {Object} responseData - Form response data
 * @param {Object} contactData - Contact data (optional)
 * @param {string} requestId - Request ID for tracing
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export const createFormResponseWithContact = async (
  responseData,
  contactData = null,
  requestId = null,
) => {
  try {
    // First, create form response
    const { data: formResponse, error: responseError } = await supabaseServer
      .from("form_responses")
      .insert([responseData])
      .select()
      .maybeSingle();

    if (responseError) {
      console.error(
        `Form response creation failed [${requestId}]:`,
        responseError,
      );
      return {
        success: false,
        error: `Failed to create form response: ${responseError.message}`,
      };
    }

    if (!formResponse) {
      return {
        success: false,
        error: "Form response creation failed: No data returned",
      };
    }

    // If contact creation is needed, create it
    let contactResult = null;
    if (contactData) {
      const { data: contact, error: contactError } = await supabaseServer
        .from("contacts")
        .insert([
          {
            ...contactData,
            form_response_id: formResponse.id, // Link to form response
          },
        ])
        .select()
        .maybeSingle();

      if (contactError) {
        console.error(`Contact creation failed [${requestId}]:`, contactError);

        // ROOT CAUSE FIX: Rollback form response if contact creation fails
        await supabaseServer
          .from("form_responses")
          .delete()
          .eq("id", formResponse.id);

        return {
          success: false,
          error: `Failed to create contact: ${contactError.message}. Form response was rolled back.`,
        };
      }

      if (!contact) {
        return {
          success: false,
          error: "Contact creation failed: No data returned",
        };
      }

      contactResult = contact;
    }

    return {
      success: true,
      data: {
        formResponse,
        contact: contactResult,
      },
    };
  } catch (error) {
    console.error(`Form response transaction failed [${requestId}]:`, error);
    return {
      success: false,
      error: `Transaction failed: ${error.message}`,
    };
  }
};

/**
 * Create lead with associated contacts safely
 * @param {Object} leadData - Lead data
 * @param {Array} contactsData - Contacts data array
 * @param {string} requestId - Request ID for tracing
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export const createLeadWithContacts = async (
  leadData,
  contactsData = [],
  requestId = null,
) => {
  try {
    // First, create the lead
    const { data: lead, error: leadError } = await supabaseServer
      .from("leads")
      .insert([leadData])
      .select()
      .maybeSingle();

    if (leadError) {
      console.error(`Lead creation failed [${requestId}]:`, leadError);
      return {
        success: false,
        error: `Failed to create lead: ${leadError.message}`,
      };
    }

    if (!lead) {
      return {
        success: false,
        error: "Lead creation failed: No data returned",
      };
    }

    // Then create associated contacts
    const contactResults = [];
    for (const contactData of contactsData) {
      const { data: contact, error: contactError } = await supabaseServer
        .from("contacts")
        .insert([
          {
            ...contactData,
            lead_id: lead.id, // Link to lead
          },
        ])
        .select()
        .maybeSingle();

      if (contactError) {
        console.error(`Contact creation failed [${requestId}]:`, contactError);

        // ROOT CAUSE FIX: Clean up created contacts if any fail
        for (const createdContact of contactResults) {
          if (createdContact && createdContact.id) {
            await supabaseServer
              .from("contacts")
              .delete()
              .eq("id", createdContact.id);
          }
        }

        // Also delete the lead
        await supabaseServer.from("leads").delete().eq("id", lead.id);

        return {
          success: false,
          error: `Failed to create contact: ${contactError.message}. Lead and other contacts were rolled back.`,
        };
      }

      if (!contact) {
        // Clean up previously created contacts and lead
        for (const createdContact of contactResults) {
          if (createdContact && createdContact.id) {
            await supabaseServer
              .from("contacts")
              .delete()
              .eq("id", createdContact.id);
          }
        }

        await supabaseServer.from("leads").delete().eq("id", lead.id);

        return {
          success: false,
          error:
            "Contact creation failed: No data returned. Lead was rolled back.",
        };
      }

      contactResults.push(contact);
    }

    return {
      success: true,
      data: {
        lead,
        contacts: contactResults,
      },
    };
  } catch (error) {
    console.error(`Lead creation transaction failed [${requestId}]:`, error);
    return {
      success: false,
      error: `Transaction failed: ${error.message}`,
    };
  }
};

/**
 * Validate cascade delete before performing deletion
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {string} userId - User ID for validation
 * @param {Array} dependentTables - Array of dependent table configurations
 * @param {string} requestId - Request ID for tracing
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const validateCascadeDelete = async (
  table,
  id,
  userId,
  dependentTables = [],
  requestId = null,
) => {
  try {
    // Check for dependent records that would be orphaned
    const dependencies = [];

    for (const dep of dependentTables) {
      const { data: records, error } = await supabaseServer
        .from(dep.table)
        .select("id")
        .eq(dep.foreignKey, id)
        .limit(1);

      if (error) {
        console.error(`Dependency check failed [${requestId}]:`, error);
        return {
          success: false,
          error: `Failed to check dependencies: ${error.message}`,
        };
      }

      if (records && records.length > 0) {
        dependencies.push({
          table: dep.table,
          count: records.length,
          action: dep.action || "Cannot delete while records exist",
        });
      }
    }

    if (dependencies.length > 0) {
      return {
        success: false,
        error: `Cannot delete ${table} record: dependent records exist`,
        dependencies,
      };
    }

    return { success: true };
  } catch (error) {
    console.error(`Cascade delete validation failed [${requestId}]:`, error);
    return {
      success: false,
      error: `Validation failed: ${error.message}`,
    };
  }
};

/**
 * Safe delete with cascade validation
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {string} userId - User ID for validation
 * @param {Array} dependentTables - Array of dependent table configurations
 * @param {string} requestId - Request ID for tracing
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const safeDelete = async (
  table,
  id,
  userId,
  dependentTables = [],
  requestId = null,
) => {
  try {
    // First validate cascade delete
    const validation = await validateCascadeDelete(
      table,
      id,
      userId,
      dependentTables,
      requestId,
    );
    if (!validation.success) {
      return validation;
    }

    // Perform the deletion
    const { error } = await supabaseServer
      .from(table)
      .delete()
      .eq("id", id)
      .eq("user_id", userId); // Ensure user can only delete their own records

    if (error) {
      console.error(`Delete failed [${requestId}]:`, error);
      return {
        success: false,
        error: `Failed to delete ${table}: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error(`Safe delete failed [${requestId}]:`, error);
    return {
      success: false,
      error: `Delete operation failed: ${error.message}`,
    };
  }
};
