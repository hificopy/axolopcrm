import { supabase } from '../config/supabase-auth.js';
import logger from './logger.js';
import { DatabaseError } from './errors.js';

/**
 * Database utility functions for common operations
 */

/**
 * Execute a query with error handling and logging
 */
export async function executeQuery(tableName, operation, queryFn, options = {}) {
  const startTime = Date.now();

  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;

    if (result.error) {
      logger.error('Database query error', {
        table: tableName,
        operation,
        error: result.error,
        duration,
      });
      throw new DatabaseError(
        `${operation} failed on ${tableName}: ${result.error.message}`,
        result.error
      );
    }

    if (options.logSuccess) {
      logger.debug('Database query success', {
        table: tableName,
        operation,
        duration,
        count: result.data?.length || (result.count !== null ? result.count : 1),
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Database query exception', {
      table: tableName,
      operation,
      error: error.message,
      duration,
    });
    throw error;
  }
}

/**
 * Transaction helper (simulated with Supabase)
 */
export class Transaction {
  constructor() {
    this.operations = [];
    this.rollbackOperations = [];
  }

  /**
   * Add operation to transaction
   */
  add(operation, rollback) {
    this.operations.push(operation);
    if (rollback) {
      this.rollbackOperations.unshift(rollback); // Reverse order for rollback
    }
  }

  /**
   * Execute all operations
   */
  async execute() {
    const results = [];

    try {
      for (const operation of this.operations) {
        const result = await operation();
        results.push(result);
      }
      return results;
    } catch (error) {
      logger.error('Transaction failed, rolling back', { error: error.message });
      await this.rollback();
      throw error;
    }
  }

  /**
   * Rollback all operations
   */
  async rollback() {
    for (const rollback of this.rollbackOperations) {
      try {
        await rollback();
      } catch (error) {
        logger.error('Rollback operation failed', { error: error.message });
      }
    }
  }
}

/**
 * Paginated query helper
 */
export async function paginatedQuery(tableName, { page = 1, limit = 20, filters = {}, sort = {} }) {
  const offset = (page - 1) * limit;

  let query = supabase.from(tableName).select('*', { count: 'exact' });

  // Apply filters
  for (const [field, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(field, value);
    }
  }

  // Apply sorting
  if (sort.field) {
    query = query.order(sort.field, { ascending: sort.order === 'asc' });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const result = await executeQuery(tableName, 'SELECT (paginated)', () => query);

  return {
    data: result.data || [],
    pagination: {
      page,
      limit,
      total: result.count || 0,
      totalPages: Math.ceil((result.count || 0) / limit),
      hasNext: page < Math.ceil((result.count || 0) / limit),
      hasPrev: page > 1,
    },
  };
}

/**
 * Bulk insert with batching
 */
export async function bulkInsert(tableName, records, batchSize = 100) {
  const results = [];

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    const result = await executeQuery(
      tableName,
      `INSERT (batch ${i / batchSize + 1})`,
      () => supabase.from(tableName).insert(batch).select()
    );

    results.push(...(result.data || []));
  }

  return results;
}

/**
 * Bulk update with batching
 */
export async function bulkUpdate(tableName, updates, idField = 'id', batchSize = 50) {
  const results = [];

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);

    for (const update of batch) {
      const { [idField]: id, ...data } = update;

      const result = await executeQuery(
        tableName,
        'UPDATE',
        () => supabase.from(tableName).update(data).eq(idField, id).select()
      );

      if (result.data) {
        results.push(...result.data);
      }
    }
  }

  return results;
}

/**
 * Soft delete helper
 */
export async function softDelete(tableName, id, idField = 'id') {
  return executeQuery(
    tableName,
    'SOFT DELETE',
    () =>
      supabase
        .from(tableName)
        .update({ deleted_at: new Date().toISOString() })
        .eq(idField, id)
        .select()
  );
}

/**
 * Restore soft deleted record
 */
export async function restore(tableName, id, idField = 'id') {
  return executeQuery(
    tableName,
    'RESTORE',
    () =>
      supabase
        .from(tableName)
        .update({ deleted_at: null })
        .eq(idField, id)
        .select()
  );
}

/**
 * Check if record exists
 */
export async function exists(tableName, filters) {
  let query = supabase.from(tableName).select('id', { count: 'exact', head: true });

  for (const [field, value] of Object.entries(filters)) {
    query = query.eq(field, value);
  }

  const result = await query;
  return (result.count || 0) > 0;
}

/**
 * Get record by ID with relations
 */
export async function getById(tableName, id, relations = [], idField = 'id') {
  const selectFields = relations.length > 0 ? `*, ${relations.join(', ')}` : '*';

  const result = await executeQuery(tableName, 'SELECT BY ID', () =>
    supabase.from(tableName).select(selectFields).eq(idField, id).single()
  );

  return result.data;
}

/**
 * Upsert helper
 */
export async function upsert(tableName, data, onConflict = 'id') {
  return executeQuery(tableName, 'UPSERT', () =>
    supabase.from(tableName).upsert(data, { onConflict }).select()
  );
}

/**
 * Count records with filters
 */
export async function count(tableName, filters = {}) {
  let query = supabase.from(tableName).select('*', { count: 'exact', head: true });

  for (const [field, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(field, value);
    }
  }

  const result = await query;
  return result.count || 0;
}

/**
 * Search records with text matching
 */
export async function search(tableName, searchFields, searchTerm, options = {}) {
  const { limit = 20, filters = {} } = options;

  let query = supabase.from(tableName).select('*');

  // Apply filters
  for (const [field, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(field, value);
    }
  }

  // Add text search (using ILIKE for case-insensitive)
  if (searchFields.length > 0 && searchTerm) {
    const orConditions = searchFields
      .map(field => `${field}.ilike.%${searchTerm}%`)
      .join(',');
    query = query.or(orConditions);
  }

  query = query.limit(limit);

  const result = await executeQuery(tableName, 'SEARCH', () => query);
  return result.data || [];
}

/**
 * Get recent records
 */
export async function getRecent(tableName, limit = 10, dateField = 'created_at') {
  const result = await executeQuery(tableName, 'SELECT RECENT', () =>
    supabase.from(tableName).select('*').order(dateField, { ascending: false }).limit(limit)
  );

  return result.data || [];
}

/**
 * Get records created today
 */
export async function getToday(tableName, dateField = 'created_at') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await executeQuery(tableName, 'SELECT TODAY', () =>
    supabase.from(tableName).select('*').gte(dateField, today.toISOString())
  );

  return result.data || [];
}

/**
 * Get aggregate statistics
 */
export async function getStats(tableName, aggregations = []) {
  const stats = {};

  for (const agg of aggregations) {
    const { field, operation } = agg; // operation: 'count', 'sum', 'avg', 'min', 'max'

    // Note: Supabase doesn't support aggregations directly, would need RPC
    // This is a placeholder for the structure
    stats[`${operation}_${field}`] = 0;
  }

  return stats;
}

/**
 * Batch delete with filters
 */
export async function batchDelete(tableName, filters) {
  let query = supabase.from(tableName).delete();

  for (const [field, value] of Object.entries(filters)) {
    query = query.eq(field, value);
  }

  return executeQuery(tableName, 'BATCH DELETE', () => query);
}

/**
 * Clone record
 */
export async function clone(tableName, id, overrides = {}, idField = 'id') {
  // Get original record
  const original = await getById(tableName, id, [], idField);

  if (!original) {
    throw new DatabaseError(`Record not found: ${id}`);
  }

  // Remove ID and timestamps
  const { [idField]: _, created_at, updated_at, ...data } = original;

  // Apply overrides
  const newRecord = { ...data, ...overrides };

  // Insert new record
  const result = await executeQuery(tableName, 'CLONE', () =>
    supabase.from(tableName).insert(newRecord).select()
  );

  return result.data?.[0];
}

export default {
  executeQuery,
  Transaction,
  paginatedQuery,
  bulkInsert,
  bulkUpdate,
  softDelete,
  restore,
  exists,
  getById,
  upsert,
  count,
  search,
  getRecent,
  getToday,
  getStats,
  batchDelete,
  clone,
};
