/**
 * Route Validation Utilities
 * Prevents 404 errors by validating routes before navigation
 */

// Define all valid routes in the application
export const VALID_ROUTES = {
  public: [
    '/',
    '/signin',
    '/signup',
    '/forgot-password',
    '/update-password',
    '/onboarding',
    '/about',
    '/pricing',
    '/contact',
    '/help',
    '/privacy-policy',
  ],
  protected: [
    '/app/home',
    '/app/inbox',
    '/app/leads',
    '/app/contacts',
    '/app/opportunities',
    '/app/pipeline',
    '/app/activities',
    '/app/history',
    '/app/calls',
    '/app/calendar',
    '/app/meetings',
    '/app/todos',
    '/app/second-brain',
    '/app/profile',
    '/app/email-marketing',
    '/app/workflows',
    '/app/forms',
    '/app/tickets',
    '/app/knowledge-base',
    '/app/customer-portal',
    '/app/support-analytics',
    '/app/affiliate',
    '/app/beta-access',
    '/app/settings',
    '/app/settings/account',
    '/app/settings/billing',
    '/app/settings/agency',
    '/app/settings/custom-fields',
    '/app/settings/organization',
    '/app/settings/organization/general',
    '/app/settings/organization/team',
    '/app/settings/organization/permissions',
    '/app/settings/communication',
    '/app/settings/communication/email',
    '/app/settings/communication/phone',
    '/app/settings/communication/dialer',
    '/app/settings/communication/outcomes',
    '/app/settings/communication/notetaker',
    '/app/settings/communication/templates',
    '/app/settings/communication/sendas',
    '/app/settings/customization',
    '/app/settings/customization/fields',
    '/app/settings/customization/links',
    '/app/settings/customization/scheduling',
    '/app/settings/customization/statuses',
    '/app/settings/customization/ai',
    '/app/settings/integrations',
    '/app/settings/integrations/integrations',
    '/app/settings/integrations/accounts',
    '/app/settings/integrations/developer',
  ],
  dynamic: [
    '/app/forms/builder/:formId?',
    '/app/forms/preview/:formId',
    '/app/forms/analytics/:formId',
    '/app/forms/integrations/:formId',
    '/app/email-marketing/create',
    '/app/workflows/builder/:workflowId?',
  ],
};

/**
 * Check if a route is valid
 * @param {string} path - The route path to validate
 * @returns {boolean} - True if route is valid
 */
export function isValidRoute(path) {
  // Remove query params and hash
  const cleanPath = path.split('?')[0].split('#')[0];

  // Check exact matches in public and protected routes
  const allStaticRoutes = [...VALID_ROUTES.public, ...VALID_ROUTES.protected];
  if (allStaticRoutes.includes(cleanPath)) {
    return true;
  }

  // Check dynamic routes
  return VALID_ROUTES.dynamic.some((pattern) => {
    const regex = new RegExp(
      '^' + pattern.replace(/:[^/]+\?/g, '([^/]*)').replace(/:[^/]+/g, '([^/]+)') + '$'
    );
    return regex.test(cleanPath);
  });
}

/**
 * Get the closest matching route for suggestions
 * @param {string} path - The invalid route path
 * @returns {string[]} - Array of suggested routes
 */
export function getSuggestedRoutes(path) {
  const allRoutes = [...VALID_ROUTES.public, ...VALID_ROUTES.protected];
  const cleanPath = path.toLowerCase();

  // Find routes that contain parts of the invalid path
  const suggestions = allRoutes.filter((route) => {
    const routeLower = route.toLowerCase();
    return (
      routeLower.includes(cleanPath) ||
      cleanPath.includes(routeLower) ||
      levenshteinDistance(routeLower, cleanPath) < 5
    );
  });

  // Return top 3 suggestions
  return suggestions.slice(0, 3);
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Edit distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Log navigation attempts for debugging
 * @param {string} from - Previous route
 * @param {string} to - Attempted route
 * @param {boolean} success - Whether navigation succeeded
 */
export function logNavigation(from, to, success) {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    const status = success ? '✅' : '❌';
    console.warn(`[Navigation ${timestamp}] ${status} ${from} → ${to}`);

    if (!success) {
      const suggestions = getSuggestedRoutes(to);
      if (suggestions.length > 0) {
        console.warn('Did you mean:', suggestions);
      }
    }
  }
}

/**
 * Validate and sanitize a route before navigation
 * @param {string} path - The route to validate
 * @returns {{ valid: boolean, path: string, suggestions: string[] }}
 */
export function validateRoute(path) {
  const cleanPath = path.split('?')[0].split('#')[0];
  const valid = isValidRoute(cleanPath);
  const suggestions = valid ? [] : getSuggestedRoutes(cleanPath);

  return {
    valid,
    path: cleanPath,
    suggestions,
  };
}

export default {
  VALID_ROUTES,
  isValidRoute,
  getSuggestedRoutes,
  logNavigation,
  validateRoute,
};
