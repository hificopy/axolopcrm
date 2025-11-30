/**
 * Smart Email Validation Service
 * Detects fake, disposable, and invalid email addresses
 * Used across all forms in the CRM
 */

// List of common disposable/temporary email domains
const disposableDomains = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'throwaway.email',
  'getnada.com',
  'trashmail.com',
  'fakeinbox.com',
  'sharklasers.com',
  'maildrop.cc',
  'yopmail.com',
  'temp-mail.org',
  'mohmal.com',
  'mintemail.com',
  'getairmail.com',
  'dispostable.com',
  'emailondeck.com',
  'mytemp.email',
  'spamgourmet.com',
  'mailnesia.com'
];

// List of common typos in popular email domains
const commonDomainTypos = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'hotmial.com': 'hotmail.com',
  'htmail.com': 'hotmail.com',
  'live.co': 'live.com',
  'gmai.co': 'gmail.com'
};

// Popular legitimate email providers
const legitimateProviders = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'live.com',
  'aol.com',
  'protonmail.com',
  'zoho.com',
  'mail.com'
];

/**
 * Validate email format using regex
 */
function isValidEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if email domain is disposable/temporary
 */
function isDisposableEmail(email) {
  const domain = email.toLowerCase().split('@')[1];
  return disposableDomains.includes(domain);
}

/**
 * Check for common domain typos and suggest correction
 */
function checkDomainTypo(email) {
  const domain = email.toLowerCase().split('@')[1];

  if (commonDomainTypos[domain]) {
    return {
      hasTypo: true,
      suggestion: email.replace(domain, commonDomainTypos[domain]),
      originalDomain: domain,
      suggestedDomain: commonDomainTypos[domain]
    };
  }

  return { hasTypo: false };
}

/**
 * Check if email has suspicious patterns
 */
function hasSuspiciousPatterns(email) {
  const localPart = email.split('@')[0].toLowerCase();

  // Check for excessive numbers (likely fake)
  const numberCount = (localPart.match(/\d/g) || []).length;
  if (numberCount > 8) return true;

  // Check for random character patterns
  if (/^[a-z]{20,}$/.test(localPart)) return true; // Too long without numbers

  // Check for keyboard mashing patterns
  if (/qwerty|asdfgh|zxcvbn/.test(localPart)) return true;

  // Check for test/fake patterns
  if (/test|fake|temp|spam|trash|junk/.test(localPart)) return true;

  return false;
}

/**
 * Calculate email quality score (0-100)
 */
function calculateEmailScore(email) {
  let score = 100;

  // Format validation
  if (!isValidEmailFormat(email)) return 0;

  // Disposable email check
  if (isDisposableEmail(email)) score -= 80;

  // Domain check
  const domain = email.toLowerCase().split('@')[1];
  const isLegitProvider = legitimateProviders.includes(domain);
  const isBusinessDomain = !isLegitProvider && domain.split('.').length === 2;

  if (isLegitProvider) {
    score += 0; // No bonus or penalty for common providers
  } else if (isBusinessDomain) {
    score += 10; // Bonus for business domains
  }

  // Suspicious patterns check
  if (hasSuspiciousPatterns(email)) score -= 30;

  // Domain typo check
  const typoCheck = checkDomainTypo(email);
  if (typoCheck.hasTypo) score -= 20;

  // Email length check
  const localPart = email.split('@')[0];
  if (localPart.length < 3) score -= 10;
  if (localPart.length > 30) score -= 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Main validation function
 */
async function validateEmail(email) {
  if (!email) {
    return {
      valid: false,
      score: 0,
      reason: 'Email is required',
      suggestions: []
    };
  }

  // Format check
  if (!isValidEmailFormat(email)) {
    return {
      valid: false,
      score: 0,
      reason: 'Invalid email format',
      suggestions: []
    };
  }

  // Disposable email check
  if (isDisposableEmail(email)) {
    return {
      valid: false,
      score: 20,
      reason: 'Disposable/temporary email addresses are not allowed',
      suggestions: ['Please use a permanent email address']
    };
  }

  // Typo check
  const typoCheck = checkDomainTypo(email);
  const suggestions = [];

  if (typoCheck.hasTypo) {
    suggestions.push(`Did you mean ${typoCheck.suggestion}?`);
  }

  // Suspicious patterns check
  const isSuspicious = hasSuspiciousPatterns(email);

  // Calculate quality score
  const score = calculateEmailScore(email);

  // Determine if valid based on score
  const valid = score >= 50;

  let reason = '';
  if (!valid) {
    if (isSuspicious) {
      reason = 'Email appears to be invalid or fake';
    } else if (score < 50) {
      reason = 'Email quality score too low';
    }
  }

  return {
    valid,
    score,
    reason: reason || 'Email validated successfully',
    suggestions,
    typoCheck,
    isSuspicious,
    isDisposable: false
  };
}

/**
 * Batch validation for multiple emails
 */
async function validateEmails(emails) {
  return Promise.all(emails.map(email => validateEmail(email)));
}

/**
 * Domain reputation check (can be extended with external API)
 */
async function checkDomainReputation(domain) {
  // Basic check for now - can be extended with:
  // - DNS MX record validation
  // - SMTP verification
  // - Third-party reputation APIs (e.g., EmailRep, Hunter.io)

  const isLegitimate = legitimateProviders.includes(domain.toLowerCase());
  const isDisposable = disposableDomains.includes(domain.toLowerCase());

  return {
    domain,
    isLegitimate,
    isDisposable,
    hasMXRecord: null, // TODO: Add DNS check
    reputation: isLegitimate ? 'high' : (isDisposable ? 'low' : 'medium')
  };
}

module.exports = {
  validateEmail,
  validateEmails,
  isValidEmailFormat,
  isDisposableEmail,
  checkDomainTypo,
  hasSuspiciousPatterns,
  calculateEmailScore,
  checkDomainReputation
};
