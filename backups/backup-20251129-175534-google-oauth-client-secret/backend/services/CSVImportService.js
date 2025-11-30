/**
 * Enhanced CSV Import Service
 * Provides better validation, preview, and error handling for CSV imports
 */

class CSVImportService {
  constructor() {
    this.requiredFields = ["name", "email"];
    this.optionalFields = [
      "phone",
      "company",
      "title",
      "website",
      "address",
      "value",
      "status",
      "type",
    ];
    this.fieldValidators = {
      email: (value) => {
        if (!value) return { valid: true }; // Email is optional for some imports
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          valid: emailRegex.test(value),
          error: !emailRegex.test(value) ? "Invalid email format" : null,
        };
      },
      phone: (value) => {
        if (!value) return { valid: true };
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return {
          valid: phoneRegex.test(value.replace(/\s/g, "")),
          error: !phoneRegex.test(value.replace(/\s/g, ""))
            ? "Invalid phone format"
            : null,
        };
      },
      value: (value) => {
        if (!value) return { valid: true };
        const numValue = parseFloat(value.toString().replace(/[^0-9.-]/g, ""));
        return {
          valid: !isNaN(numValue) && numValue >= 0,
          error: isNaN(numValue)
            ? "Invalid number format"
            : numValue < 0
              ? "Value must be positive"
              : null,
        };
      },
    };
  }

  /**
   * Parse CSV with enhanced error handling
   */
  parseCSV(csvText) {
    try {
      const lines = csvText.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        throw new Error("CSV file is empty");
      }

      // Detect delimiter
      const delimiter = this.detectDelimiter(lines[0]);

      // Parse headers
      const headers = this.parseLine(lines[0], delimiter);

      // Parse data rows
      const data = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          const values = this.parseLine(line, delimiter);

          // Skip empty rows
          if (values.every((val) => !val)) continue;

          // Create row object
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });

          data.push(row);
        } catch (error) {
          errors.push({
            row: i + 1,
            error: `Failed to parse row: ${error.message}`,
            data: line,
          });
        }
      }

      return {
        success: true,
        data,
        headers,
        errors,
        totalRows: lines.length - 1,
        validRows: data.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: [],
        headers: [],
        errors: [{ row: 0, error: error.message }],
      };
    }
  }

  /**
   * Detect CSV delimiter
   */
  detectDelimiter(firstLine) {
    const delimiters = [",", ";", "\t", "|"];
    let bestDelimiter = ",";
    let maxFields = 0;

    delimiters.forEach((delimiter) => {
      const fieldCount = firstLine.split(delimiter).length;
      if (fieldCount > maxFields) {
        maxFields = fieldCount;
        bestDelimiter = delimiter;
      }
    });

    return bestDelimiter;
  }

  /**
   * Parse a single CSV line
   */
  parseLine(line, delimiter) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Validate CSV structure and data
   */
  validateCSV(data, headers) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      missingRequiredFields: [],
      invalidFields: [],
      duplicateEmails: [],
      statistics: {
        totalRows: data.length,
        validRows: 0,
        invalidRows: 0,
        fieldsFound: headers.length,
      },
    };

    // Check for required fields
    this.requiredFields.forEach((field) => {
      if (!headers.includes(field)) {
        validation.missingRequiredFields.push(field);
        validation.isValid = false;
      }
    });

    // Validate each row
    const emailSet = new Set();

    data.forEach((row, index) => {
      let rowValid = true;
      const rowErrors = [];

      // Check required fields
      this.requiredFields.forEach((field) => {
        if (!row[field] || row[field].trim() === "") {
          rowErrors.push(`${field} is required`);
          rowValid = false;
        }
      });

      // Validate email format
      if (row.email) {
        const emailValidation = this.fieldValidators.email(row.email);
        if (!emailValidation.valid) {
          rowErrors.push(emailValidation.error);
          rowValid = false;
        }

        // Check for duplicate emails
        if (emailSet.has(row.email.toLowerCase())) {
          validation.duplicateEmails.push({
            row: index + 2, // +2 because of header row and 0-based index
            email: row.email,
          });
        } else {
          emailSet.add(row.email.toLowerCase());
        }
      }

      // Validate phone format
      if (row.phone) {
        const phoneValidation = this.fieldValidators.phone(row.phone);
        if (!phoneValidation.valid) {
          rowErrors.push(phoneValidation.error);
          rowValid = false;
        }
      }

      // Validate value
      if (row.value) {
        const valueValidation = this.fieldValidators.value(row.value);
        if (!valueValidation.valid) {
          rowErrors.push(valueValidation.error);
          rowValid = false;
        }
      }

      if (rowValid) {
        validation.statistics.validRows++;
      } else {
        validation.statistics.invalidRows++;
        validation.errors.push({
          row: index + 2,
          errors: rowErrors,
          data: row,
        });
      }
    });

    // Add warnings for common issues
    if (headers.length > 20) {
      validation.warnings.push(
        "Large number of columns detected (>20). Consider simplifying your data.",
      );
    }

    if (validation.duplicateEmails.length > 0) {
      validation.warnings.push(
        `${validation.duplicateEmails.length} duplicate email(s) found.`,
      );
    }

    return validation;
  }

  /**
   * Generate field mapping suggestions
   */
  generateMappingSuggestions(headers) {
    const suggestions = {};
    const commonFieldNames = {
      name: [
        "name",
        "full name",
        "contact name",
        "lead name",
        "prospect",
        "customer",
      ],
      email: ["email", "email address", "email address", "e-mail", "mail"],
      phone: ["phone", "phone number", "telephone", "mobile", "cell"],
      company: [
        "company",
        "company name",
        "organization",
        "business",
        "employer",
      ],
      title: ["title", "job title", "position", "role"],
      website: ["website", "web site", "url", "site"],
      address: ["address", "location", "street", "city"],
      value: ["value", "deal value", "amount", "revenue", "price"],
      status: ["status", "stage", "state", "lead status"],
      type: ["type", "category", "source", "lead type"],
    };

    headers.forEach((header) => {
      const normalizedHeader = header.toLowerCase().trim();

      // Find best match
      let bestMatch = null;
      let bestScore = 0;

      Object.entries(commonFieldNames).forEach(([field, variations]) => {
        variations.forEach((variation) => {
          const score = this.calculateStringSimilarity(
            normalizedHeader,
            variation,
          );
          if (score > bestScore && score > 0.7) {
            bestScore = score;
            bestMatch = field;
          }
        });
      });

      if (bestMatch) {
        suggestions[header] = bestMatch;
      }
    });

    return suggestions;
  }

  /**
   * Calculate string similarity (simple implementation)
   */
  calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;
    if (shorter.length === 0) return 0.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Clean and normalize data
   */
  cleanData(data) {
    return data.map((row) => {
      const cleanedRow = {};

      Object.keys(row).forEach((key) => {
        let value = row[key];

        // Trim whitespace
        if (typeof value === "string") {
          value = value.trim();
        }

        // Remove extra quotes
        if (
          typeof value === "string" &&
          value.startsWith('"') &&
          value.endsWith('"')
        ) {
          value = value.slice(1, -1);
        }

        cleanedRow[key] = value;
      });

      return cleanedRow;
    });
  }

  /**
   * Generate import preview
   */
  generatePreview(data, maxRows = 5) {
    return data.slice(0, maxRows).map((row, index) => ({
      rowNumber: index + 2, // +2 for header row and 0-based index
      data: row,
      isValid: this.validateRow(row),
    }));
  }

  /**
   * Validate a single row
   */
  validateRow(row) {
    if (!row.email) return false;

    const emailValidation = this.fieldValidators.email(row.email);
    return emailValidation.valid;
  }
}

export default CSVImportService;
