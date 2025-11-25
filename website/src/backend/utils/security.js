import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/app.config.js';
import logger from './logger.js';

/**
 * Security and encryption utilities
 */

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password hash
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate secure random token
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate API key
 */
export function generateApiKey() {
  const prefix = 'axolop';
  const key = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${key}`;
}

/**
 * Encrypt data with AES-256
 */
export function encrypt(text) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto
      .createHash('sha256')
      .update(config.encryption.key)
      .digest('base64')
      .substring(0, 32);

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    logger.error('Encryption error', { error: error.message });
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt data with AES-256
 */
export function decrypt(encryptedData) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto
      .createHash('sha256')
      .update(config.encryption.key)
      .digest('base64')
      .substring(0, 32);

    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('Decryption error', { error: error.message });
    throw new Error('Decryption failed');
  }
}

/**
 * Generate JWT token
 */
export function generateJWT(payload, expiresIn = '24h') {
  return jwt.sign(payload, config.supabase.jwtSecret, { expiresIn });
}

/**
 * Verify JWT token
 */
export function verifyJWT(token) {
  try {
    return jwt.verify(token, config.supabase.jwtSecret);
  } catch (error) {
    logger.warn('JWT verification failed', { error: error.message });
    return null;
  }
}

/**
 * Hash data with SHA-256
 */
export function hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate HMAC signature
 */
export function generateHMAC(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(data, signature, secret) {
  const expectedSignature = generateHMAC(data, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone) {
  const phoneRegex = /^[\d\s()+-]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validate URL
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password) {
  const strength = {
    score: 0,
    issues: [],
  };

  if (password.length < 8) {
    strength.issues.push('Password must be at least 8 characters');
  } else {
    strength.score += 1;
  }

  if (!/[a-z]/.test(password)) {
    strength.issues.push('Password must contain lowercase letters');
  } else {
    strength.score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    strength.issues.push('Password must contain uppercase letters');
  } else {
    strength.score += 1;
  }

  if (!/\d/.test(password)) {
    strength.issues.push('Password must contain numbers');
  } else {
    strength.score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength.issues.push('Password must contain special characters');
  } else {
    strength.score += 1;
  }

  strength.level =
    strength.score <= 1
      ? 'weak'
      : strength.score <= 3
        ? 'medium'
        : strength.score <= 4
          ? 'strong'
          : 'very strong';

  return strength;
}

/**
 * Generate one-time password (OTP)
 */
export function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

/**
 * Rate limit key generator
 */
export function getRateLimitKey(req, prefix = 'rl') {
  const identifier = req.user?.id || req.ip;
  return `${prefix}:${identifier}`;
}

/**
 * Mask sensitive data
 */
export function maskEmail(email) {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (!domain) return email;

  const maskedUsername =
    username.length > 2
      ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
      : username;

  return `${maskedUsername}@${domain}`;
}

/**
 * Mask phone number
 */
export function maskPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;

  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
}

/**
 * Mask credit card
 */
export function maskCreditCard(cardNumber) {
  if (!cardNumber) return '';
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return cardNumber;

  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
}

/**
 * Check if IP is in whitelist
 */
export function isIPWhitelisted(ip, whitelist = []) {
  return whitelist.includes(ip);
}

/**
 * Check if IP is in blacklist
 */
export function isIPBlacklisted(ip, blacklist = []) {
  return blacklist.includes(ip);
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken() {
  return generateToken(32);
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token, sessionToken) {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken));
}

export default {
  hashPassword,
  verifyPassword,
  generateToken,
  generateApiKey,
  encrypt,
  decrypt,
  generateJWT,
  verifyJWT,
  hash,
  generateHMAC,
  verifyHMAC,
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidURL,
  checkPasswordStrength,
  generateOTP,
  getRateLimitKey,
  maskEmail,
  maskPhone,
  maskCreditCard,
  isIPWhitelisted,
  isIPBlacklisted,
  generateCSRFToken,
  verifyCSRFToken,
};
