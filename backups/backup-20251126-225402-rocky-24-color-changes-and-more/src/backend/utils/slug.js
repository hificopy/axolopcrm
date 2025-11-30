/**
 * Slug Generation Utility
 * Converts strings to URL-friendly slugs
 */

/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
export function generateSlug(text) {
  if (!text || typeof text !== 'string') {
    return 'form';
  }

  let slug = text
    .toLowerCase()
    .trim()
    // Remove special characters except spaces and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  // Limit length to 100 characters
  if (slug.length > 100) {
    slug = slug.substring(0, 100);
    // Remove trailing hyphen if truncation created one
    slug = slug.replace(/-$/, '');
  }

  // If slug is empty after processing, use default
  if (!slug) {
    slug = 'form';
  }

  return slug;
}

/**
 * Check if a slug is unique for a user
 * @param {object} supabase - Supabase client
 * @param {string} slug - Slug to check
 * @param {string} userId - User ID
 * @param {string} excludeFormId - Form ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if slug is unique
 */
export async function isSlugUnique(supabase, slug, userId, excludeFormId = null) {
  let query = supabase
    .from('forms')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('published_slug', slug)
    .is('deleted_at', null);

  if (excludeFormId) {
    query = query.neq('id', excludeFormId);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error checking slug uniqueness:', error);
    return false;
  }

  return count === 0;
}

/**
 * Generate a unique slug for a form
 * @param {object} supabase - Supabase client
 * @param {string} title - Form title
 * @param {string} userId - User ID
 * @param {string} excludeFormId - Form ID to exclude from check (for updates)
 * @returns {Promise<string>} Unique slug
 */
export async function generateUniqueSlug(supabase, title, userId, excludeFormId = null) {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 0;

  // Keep trying until we find a unique slug
  while (!(await isSlugUnique(supabase, slug, userId, excludeFormId))) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

/**
 * Validate a slug format
 * @param {string} slug - Slug to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Slug is required' };
  }

  // Check length
  if (slug.length < 1 || slug.length > 100) {
    return { valid: false, error: 'Slug must be between 1 and 100 characters' };
  }

  // Check format (only lowercase letters, numbers, and hyphens)
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
  }

  // Check for leading/trailing hyphens
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug cannot start or end with a hyphen' };
  }

  // Check for multiple consecutive hyphens
  if (/--/.test(slug)) {
    return { valid: false, error: 'Slug cannot contain consecutive hyphens' };
  }

  // Check for reserved slugs that might conflict with app routes
  const reservedSlugs = [
    'api', 'admin', 'dashboard', 'forms', 'login', 'signup', 'auth',
    'settings', 'profile', 'help', 'support', 'contact', 'about',
    'terms', 'privacy', 'embed', 'preview', 'public'
  ];

  if (reservedSlugs.includes(slug)) {
    return { valid: false, error: 'This slug is reserved and cannot be used' };
  }

  return { valid: true };
}

/**
 * Generate agency alias from user name or email
 * @param {string} name - User name
 * @param {string} email - User email
 * @returns {string} Agency alias
 */
export function generateAgencyAlias(name, email) {
  let alias = '';

  // Try name first, fallback to email username
  if (name && name.trim()) {
    alias = name.trim();
  } else if (email) {
    alias = email.split('@')[0];
  }

  // Convert to URL-friendly format
  alias = alias
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Limit length
  if (alias.length > 50) {
    alias = alias.substring(0, 50).replace(/-$/, '');
  }

  return alias || 'agency';
}

export default {
  generateSlug,
  isSlugUnique,
  generateUniqueSlug,
  validateSlug,
  generateAgencyAlias
};
