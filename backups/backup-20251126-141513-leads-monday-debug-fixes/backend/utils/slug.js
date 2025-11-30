/**
 * Slug Utility Functions
 * Generate URL-friendly slugs from text
 */

/**
 * Generate a slug from text
 * @param {string} text - The text to convert to a slug
 * @returns {string} URL-friendly slug
 */
export function generateSlug(text) {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a random suffix
 * @param {string} text - The text to convert to a slug
 * @param {number} suffixLength - Length of random suffix (default: 4)
 * @returns {string} Unique URL-friendly slug
 */
export function generateUniqueSlug(text, suffixLength = 4) {
  const baseSlug = generateSlug(text);
  const randomSuffix = Math.random()
    .toString(36)
    .substring(2, 2 + suffixLength);

  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Validate a slug format
 * @param {string} slug - The slug to validate
 * @returns {boolean} True if valid slug format
 */
export function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// Alias for backwards compatibility
export const validateSlug = isValidSlug;

export default {
  generateSlug,
  generateUniqueSlug,
  isValidSlug,
  validateSlug
};
