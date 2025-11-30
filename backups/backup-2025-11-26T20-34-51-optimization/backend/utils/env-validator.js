import config from "../config/app.config.js";

/**
 * Environment variable validation to prevent ROOT CAUSE issues
 * Validates all critical environment variables at startup
 */

const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
  "JWT_SECRET",
  "NODE_ENV",
];

const optionalEnvVars = [
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_PASSWORD",
  "CHROMADB_URL",
  "CHROMADB_ENABLED",
  "GOD_MODE_EMAILS",
  "VITE_API_URL",
  "SENDGRID_API_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
];

/**
 * Validate required environment variables
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[] }
 */
export const validateEnvironmentVariables = () => {
  const errors = [];
  const warnings = [];
  const missing = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value) {
      missing.push(envVar);
    } else if (value.trim() === "") {
      errors.push(`${envVar} is empty`);
    } else if (envVar.includes("URL") && !isValidUrl(value)) {
      errors.push(`${envVar} is not a valid URL: ${value}`);
    } else if (envVar.includes("KEY") && value.length < 10) {
      errors.push(`${envVar} appears to be too short (minimum 10 characters)`);
    }
  }

  // Check optional variables
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar];
    if (value && value.trim() !== "") {
      if (envVar.includes("URL") && !isValidUrl(value)) {
        warnings.push(`${envVar} may not be a valid URL: ${value}`);
      }
      if (envVar.includes("PORT") && !isValidPort(value)) {
        warnings.push(`${envVar} is not a valid port: ${value}`);
      }
    }
  }

  // Validate specific configurations
  if (process.env.NODE_ENV === "production") {
    // Production-specific validations
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      errors.push("JWT_SECRET must be at least 32 characters in production");
    }

    if (process.env.REDIS_HOST === "localhost") {
      warnings.push(
        "Using localhost for Redis in production is not recommended",
      );
    }
  }

  // Check for default values that should be changed
  if (process.env.JWT_SECRET === "your-secret-key") {
    errors.push(
      "JWT_SECRET is using default value - must be changed in production",
    );
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.includes("example")) {
    errors.push(
      "SUPABASE_SERVICE_ROLE_KEY is using example value - must be set to real key",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missing,
  };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate port number
 * @param {string} port - Port to validate
 * @returns {boolean}
 */
function isValidPort(port) {
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
}

/**
 * Validate database connection configuration
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateDatabaseConfig = () => {
  const errors = [];

  if (!config.supabase?.url) {
    errors.push("Supabase URL is not configured");
  }

  if (!config.supabase?.serviceRoleKey) {
    errors.push("Supabase service role key is not configured");
  }

  if (config.supabase?.serviceRoleKey?.length < 20) {
    errors.push("Supabase service role key appears to be too short");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate Redis configuration
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateRedisConfig = () => {
  const errors = [];

  if (!config.redis?.host) {
    errors.push("Redis host is not configured");
  }

  if (!config.redis?.port) {
    errors.push("Redis port is not configured");
  }

  if (config.redis?.port && !isValidPort(config.redis.port.toString())) {
    errors.push(`Redis port is invalid: ${config.redis.port}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate ChromaDB configuration
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateChromaDBConfig = () => {
  const errors = [];

  if (config.chromadb?.enabled && !config.chromadb?.url) {
    errors.push("ChromaDB is enabled but URL is not configured");
  }

  if (config.chromadb?.url && !isValidUrl(config.chromadb.url)) {
    errors.push(`ChromaDB URL is invalid: ${config.chromadb.url}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Comprehensive startup validation
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[] }
 */
export const validateStartupConfig = () => {
  console.log("🔍 Validating startup configuration...");

  const envValidation = validateEnvironmentVariables();
  const dbValidation = validateDatabaseConfig();
  const redisValidation = validateRedisConfig();
  const chromaValidation = validateChromaDBConfig();

  const allErrors = [
    ...envValidation.errors,
    ...dbValidation.errors,
    ...redisValidation.errors,
    ...chromaValidation.errors,
  ];

  const allWarnings = [
    ...envValidation.warnings,
    ...dbValidation.errors,
    ...redisValidation.errors,
    ...chromaValidation.errors,
  ];

  if (allErrors.length > 0) {
    console.error("❌ CRITICAL: Configuration errors detected:");
    allErrors.forEach((error) => console.error(`   - ${error}`));
    console.error(
      "\n💥 Application cannot start safely with these configuration errors.",
    );
    console.error("Please fix the above issues before restarting.");

    return {
      valid: false,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  if (allWarnings.length > 0) {
    console.warn("⚠️  Configuration warnings detected:");
    allWarnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  console.log("✅ Configuration validation passed");
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `✅ Database: ${config.supabase?.url ? "Configured" : "Not configured"}`,
  );
  console.log(
    `✅ Redis: ${config.redis?.host ? `${config.redis.host}:${config.redis.port}` : "Not configured"}`,
  );
  console.log(
    `✅ ChromaDB: ${config.chromadb?.enabled ? "Enabled" : "Disabled"}`,
  );

  return {
    valid: true,
    errors: [],
    warnings: allWarnings,
  };
};

/**
 * Exit process if configuration is invalid
 * @param {Object} validation - Validation result
 */
export const exitOnInvalidConfig = (validation) => {
  if (!validation.valid) {
    console.error("\n🚨 EXITING: Configuration validation failed");
    process.exit(1);
  }
};
