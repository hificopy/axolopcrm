/**
 * Batch Operations Utility
 * Eliminates N+1 query patterns with efficient batch processing
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Batch fetch related records to avoid N+1 queries
 * @param {string} table - Table name to fetch from
 * @param {string} foreignKey - Foreign key field name
 * @param {Array} ids - Array of IDs to fetch
 * @param {Array} selectFields - Fields to select (default: '*')
 * @returns {Promise<Map>} Map of ID -> array of related records
 */
export const batchFetchRelated = async (
  table,
  foreignKey,
  ids,
  selectFields = ["*"],
) => {
  if (!ids || ids.length === 0) {
    return new Map();
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .select(selectFields.join(", "))
      .in(foreignKey, ids);

    if (error) {
      console.error(`Batch fetch error for ${table}:`, error);
      return new Map();
    }

    // Group by foreign key
    const groupedData = new Map();
    (data || []).forEach((record) => {
      const key = record[foreignKey];
      if (!groupedData.has(key)) {
        groupedData.set(key, []);
      }
      groupedData.get(key).push(record);
    });

    return groupedData;
  } catch (error) {
    console.error(`Batch fetch failed for ${table}:`, error);
    return new Map();
  }
};

/**
 * Batch fetch users by emails to avoid N+1 queries
 * @param {Array} emails - Array of email addresses
 * @returns {Promise<Map>} Map of email -> user object
 */
export const batchFetchUsersByEmail = async (emails) => {
  if (!emails || emails.length === 0) {
    return new Map();
  }

  const uniqueEmails = [...new Set(emails.filter(Boolean))];

  if (uniqueEmails.length === 0) {
    return new Map();
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, avatar_url")
      .in("email", uniqueEmails);

    if (error) {
      console.error("Batch fetch users error:", error);
      return new Map();
    }

    const userMap = new Map();
    (data || []).forEach((user) => {
      userMap.set(user.email, user);
    });

    return userMap;
  } catch (error) {
    console.error("Batch fetch users failed:", error);
    return new Map();
  }
};

/**
 * Batch count records for multiple entities
 * @param {string} table - Table name
 * @param {string} foreignKey - Foreign key field
 * @param {Array} ids - Array of IDs to count for
 * @returns {Promise<Map>} Map of ID -> count
 */
export const batchCountRelated = async (table, foreignKey, ids) => {
  if (!ids || ids.length === 0) {
    return new Map();
  }

  try {
    // Use RPC for efficient counting if available, otherwise fetch and count
    const { data, error } = await supabase
      .from(table)
      .select(foreignKey)
      .in(foreignKey, ids);

    if (error) {
      console.error(`Batch count error for ${table}:`, error);
      return new Map();
    }

    const countMap = new Map();
    (data || []).forEach((record) => {
      const key = record[foreignKey];
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    // Ensure all IDs have a count (even if zero)
    ids.forEach((id) => {
      if (!countMap.has(id)) {
        countMap.set(id, 0);
      }
    });

    return countMap;
  } catch (error) {
    console.error(`Batch count failed for ${table}:`, error);
    return new Map();
  }
};

/**
 * Enrich entities with related data in batch
 * @param {Array} entities - Array of entities to enrich
 * @param {Object} enrichmentConfig - Configuration for enrichment
 * @returns {Promise<Array>} Enriched entities
 */
export const batchEnrichEntities = async (entities, enrichmentConfig) => {
  if (!entities || entities.length === 0) {
    return [];
  }

  const enrichedEntities = [...entities];
  const enrichmentPromises = [];

  // Prepare batch fetch operations
  for (const [key, config] of Object.entries(enrichmentConfig)) {
    const ids = entities
      .map((entity) => entity[config.localKey || "id"])
      .filter(Boolean);

    if (ids.length === 0) {
      continue;
    }

    switch (config.type) {
      case "related":
        enrichmentPromises.push(
          batchFetchRelated(
            config.table,
            config.foreignKey,
            ids,
            config.fields,
          ).then((result) => ({ key, result })),
        );
        break;

      case "users":
        const emails = entities
          .map((entity) => entity[config.emailField])
          .filter(Boolean);
        enrichmentPromises.push(
          batchFetchUsersByEmail(emails).then((result) => ({ key, result })),
        );
        break;

      case "count":
        enrichmentPromises.push(
          batchCountRelated(config.table, config.foreignKey, ids).then(
            (result) => ({ key, result }),
          ),
        );
        break;
    }
  }

  // Execute all batch operations in parallel
  const enrichmentResults = await Promise.all(enrichmentPromises);

  // Apply enrichment results to entities
  enrichmentResults.forEach(({ key, result }) => {
    const config = enrichmentConfig[key];
    enrichedEntities.forEach((entity) => {
      const entityId = entity[config.localKey || "id"];

      switch (config.type) {
        case "related":
          entity[key] = result.get(entityId) || [];
          break;

        case "users":
          const email = entity[config.emailField];
          entity[key] = email ? result.get(email) || null : null;
          break;

        case "count":
          entity[key] = result.get(entityId) || 0;
          break;
      }
    });
  });

  return enrichedEntities;
};

/**
 * Optimized bulk insert with chunking to avoid limits
 * @param {string} table - Table name
 * @param {Array} records - Records to insert
 * @param {number} chunkSize - Size of each chunk (default: 1000)
 * @returns {Promise<Array>} All inserted records
 */
export const bulkInsert = async (table, records, chunkSize = 1000) => {
  if (!records || records.length === 0) {
    return [];
  }

  const allInsertedRecords = [];
  const chunks = [];

  // Split records into chunks
  for (let i = 0; i < records.length; i += chunkSize) {
    chunks.push(records.slice(i, i + chunkSize));
  }

  // Insert chunks sequentially to avoid overwhelming the database
  for (const chunk of chunks) {
    try {
      const { data, error } = await supabase.from(table).insert(chunk).select();

      if (error) {
        console.error(`Bulk insert error for ${table}:`, error);
        throw new Error(`Failed to insert records: ${error.message}`);
      }

      if (data) {
        allInsertedRecords.push(...data);
      }
    } catch (error) {
      console.error(`Chunk insert failed for ${table}:`, error);
      throw error;
    }
  }

  return allInsertedRecords;
};

/**
 * Batch update records with different values
 * @param {string} table - Table name
 * @param {Array} updates - Array of { id, data } objects
 * @returns {Promise<Array>} Updated records
 */
export const batchUpdate = async (table, updates) => {
  if (!updates || updates.length === 0) {
    return [];
  }

  const updatedRecords = [];

  // Process updates in parallel where possible
  const updatePromises = updates.map(async ({ id, data }) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update({ ...data, updated_at: new Date() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Batch update error for ${table} ID ${id}:`, error);
        return null;
      }

      return result;
    } catch (error) {
      console.error(`Batch update failed for ${table} ID ${id}:`, error);
      return null;
    }
  });

  const results = await Promise.all(updatePromises);

  // Filter out null results (failed updates)
  results.forEach((result) => {
    if (result) {
      updatedRecords.push(result);
    }
  });

  return updatedRecords;
};

export default {
  batchFetchRelated,
  batchFetchUsersByEmail,
  batchCountRelated,
  batchEnrichEntities,
  bulkInsert,
  batchUpdate,
};
