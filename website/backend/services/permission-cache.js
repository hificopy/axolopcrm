/**
 * Permission Cache Service
 *
 * Provides in-memory caching for permission resolutions to improve performance.
 * Permissions are cached per member with TTL and automatic invalidation.
 */

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000; // Maximum entries

// In-memory cache store
const permissionCache = new Map();
const cacheTimestamps = new Map();

/**
 * Generate cache key for a member's permissions
 */
function getCacheKey(memberId, agencyId) {
  return `${memberId}:${agencyId}`;
}

/**
 * Check if cache entry is still valid
 */
function isValidCacheEntry(key) {
  const timestamp = cacheTimestamps.get(key);
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_TTL_MS;
}

/**
 * Clean up expired entries and enforce size limit
 */
function cleanupCache() {
  const now = Date.now();
  const expiredKeys = [];

  for (const [key, timestamp] of cacheTimestamps) {
    if (now - timestamp >= CACHE_TTL_MS) {
      expiredKeys.push(key);
    }
  }

  // Remove expired entries
  for (const key of expiredKeys) {
    permissionCache.delete(key);
    cacheTimestamps.delete(key);
  }

  // Enforce size limit (remove oldest entries if over limit)
  if (permissionCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cacheTimestamps.entries())
      .sort((a, b) => a[1] - b[1]);

    const toRemove = entries.slice(0, permissionCache.size - MAX_CACHE_SIZE);
    for (const [key] of toRemove) {
      permissionCache.delete(key);
      cacheTimestamps.delete(key);
    }
  }
}

/**
 * Get cached permissions for a member
 * @param {string} memberId - Member ID
 * @param {string} agencyId - Agency ID
 * @returns {Object|null} Cached permissions or null if not found/expired
 */
export function getCachedPermissions(memberId, agencyId) {
  const key = getCacheKey(memberId, agencyId);

  if (isValidCacheEntry(key)) {
    return permissionCache.get(key);
  }

  // Remove stale entry
  permissionCache.delete(key);
  cacheTimestamps.delete(key);

  return null;
}

/**
 * Cache permissions for a member
 * @param {string} memberId - Member ID
 * @param {string} agencyId - Agency ID
 * @param {Object} permissions - Permissions object to cache
 */
export function setCachedPermissions(memberId, agencyId, permissions) {
  const key = getCacheKey(memberId, agencyId);

  permissionCache.set(key, { ...permissions });
  cacheTimestamps.set(key, Date.now());

  // Periodically clean up
  if (permissionCache.size % 100 === 0) {
    cleanupCache();
  }
}

/**
 * Invalidate cache for a specific member
 * @param {string} memberId - Member ID
 * @param {string} agencyId - Agency ID (optional, invalidates all if not provided)
 */
export function invalidateMemberCache(memberId, agencyId = null) {
  if (agencyId) {
    const key = getCacheKey(memberId, agencyId);
    permissionCache.delete(key);
    cacheTimestamps.delete(key);
  } else {
    // Invalidate all entries for this member
    for (const key of permissionCache.keys()) {
      if (key.startsWith(`${memberId}:`)) {
        permissionCache.delete(key);
        cacheTimestamps.delete(key);
      }
    }
  }
}

/**
 * Invalidate all cache entries for an agency
 * @param {string} agencyId - Agency ID
 */
export function invalidateAgencyCache(agencyId) {
  for (const key of permissionCache.keys()) {
    if (key.endsWith(`:${agencyId}`)) {
      permissionCache.delete(key);
      cacheTimestamps.delete(key);
    }
  }
}

/**
 * Invalidate all cache entries for a role
 * Use when a role's permissions are updated
 * @param {string} roleId - Role ID
 * @param {Array<string>} memberIds - Member IDs with this role
 * @param {string} agencyId - Agency ID
 */
export function invalidateRoleCache(roleId, memberIds, agencyId) {
  for (const memberId of memberIds) {
    invalidateMemberCache(memberId, agencyId);
  }
}

/**
 * Clear entire cache
 */
export function clearCache() {
  permissionCache.clear();
  cacheTimestamps.clear();
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
export function getCacheStats() {
  cleanupCache();
  return {
    size: permissionCache.size,
    maxSize: MAX_CACHE_SIZE,
    ttlMs: CACHE_TTL_MS,
    entries: Array.from(cacheTimestamps.keys())
  };
}

export default {
  getCachedPermissions,
  setCachedPermissions,
  invalidateMemberCache,
  invalidateAgencyCache,
  invalidateRoleCache,
  clearCache,
  getCacheStats
};
