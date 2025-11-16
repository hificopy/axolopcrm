/**
 * Route Validation Utilities
 * Prevents 404 errors by validating routes before navigation
 */

// Define all valid routes in the application
export const VALID_ROUTES = {
  public: [
    '/',
    '/password',
  ],
  protected: [
    '/inbox',
    '/leads',
    '/contacts',
    '/pipeline',
    '/profile',
    '/settings',
    '/settings/account',
    '/settings/billing',
    '/settings/organization',
    '/settings/organization/general',
    '/settings/organization/team',
    '/settings/organization/permissions',
    '/settings/communication',
    '/settings/communication/email',
    '/settings/communication/phone',
    '/settings/communication/dialer',
    '/settings/communication/outcomes',
    '/settings/communication/notetaker',
    '/settings/communication/templates',
    '/settings/communication/sendas',
    '/settings/customization',
    '/settings/customization/fields',
    '/settings/customization/links',
    '/settings/customization/scheduling',
    '/settings/customization/statuses',
    '/settings/customization/ai',
    '/settings/integrations',
    '/settings/integrations/integrations',
    '/settings/integrations/accounts',
    '/settings/integrations/developer',
    '/forms',
    '/tickets',
    '/knowledge-base',
    '/customer-portal',
    '/support-analytics',
    '/email-marketing',
  ],
  dynamic: [
    '/forms/builder/:formId?',
    '/forms/preview/:formId',
    '/forms/analytics/:formId',
    '/forms/integrations/:formId',
    '/email-marketing/workflows/create',
    '/email-marketing/workflows/:workflowId',
    '/email-marketing/campaigns/create',
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
    console.log(`[Navigation ${timestamp}] ${status} ${from} → ${to}`);

    if (!success) {
      const suggestions = getSuggestedRoutes(to);
      if (suggestions.length > 0) {
        console.log('Did you mean:', suggestions);
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
