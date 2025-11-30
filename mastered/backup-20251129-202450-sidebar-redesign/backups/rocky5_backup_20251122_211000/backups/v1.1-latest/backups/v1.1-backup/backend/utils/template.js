import Handlebars from 'handlebars';
import logger from './logger.js';

/**
 * Template rendering system with Handlebars
 */

// Register custom Handlebars helpers
Handlebars.registerHelper('formatDate', function (date, format) {
  if (!date) return '';
  const d = new Date(date);
  // Simple date formatting - could use date-fns for more advanced formatting
  return d.toLocaleDateString();
});

Handlebars.registerHelper('formatCurrency', function (amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
});

Handlebars.registerHelper('uppercase', function (str) {
  return str ? str.toUpperCase() : '';
});

Handlebars.registerHelper('lowercase', function (str) {
  return str ? str.toLowerCase() : '';
});

Handlebars.registerHelper('truncate', function (str, length = 50) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
});

Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifGreaterThan', function (arg1, arg2, options) {
  return arg1 > arg2 ? options.fn(this) : options.inverse(this);
});

/**
 * Email template renderer
 */
class TemplateRenderer {
  constructor() {
    this.compiledTemplates = new Map();
    this.baseTemplates = this.getBaseTemplates();
  }

  /**
   * Get base email templates
   */
  getBaseTemplates() {
    return {
      // Basic email template
      basic: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{companyName}}</h1>
    </div>
    <div class="content">
      {{{body}}}
    </div>
    <div class="footer">
      <p>{{companyName}} | {{companyAddress}}</p>
      <p><a href="{{unsubscribeLink}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,

      // Welcome email template
      welcome: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to {{companyName}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #007bff;">Welcome, {{firstName}}!</h1>
    <p>Thank you for joining {{companyName}}. We're excited to have you on board.</p>
    {{#if getStartedLink}}
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{getStartedLink}}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Get Started</a>
    </p>
    {{/if}}
    <p>If you have any questions, feel free to reach out to us.</p>
    <p>Best regards,<br>The {{companyName}} Team</p>
  </div>
</body>
</html>`,

      // Lead notification template
      leadNotification: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Lead: {{leadName}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #28a745;">New Lead Created</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{leadName}}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{leadEmail}}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{leadPhone}}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Source:</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{source}}</td>
      </tr>
    </table>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{leadLink}}" style="display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 4px;">View Lead</a>
    </p>
  </div>
</body>
</html>`,

      // Task reminder template
      taskReminder: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Task Reminder: {{taskTitle}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #ffc107;">Task Reminder</h2>
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <h3 style="margin-top: 0;">{{taskTitle}}</h3>
      <p>{{taskDescription}}</p>
      <p><strong>Due:</strong> {{formatDate dueDate}}</p>
      <p><strong>Priority:</strong> {{priority}}</p>
    </div>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{taskLink}}" style="display: inline-block; padding: 12px 24px; background: #ffc107; color: #333; text-decoration: none; border-radius: 4px;">View Task</a>
    </p>
  </div>
</body>
</html>`,

      // Invoice template
      invoice: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice #{{invoiceNumber}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
    <div style="text-align: right; margin-bottom: 30px;">
      <h1 style="color: #007bff; margin: 0;">INVOICE</h1>
      <p>Invoice #: {{invoiceNumber}}<br>Date: {{formatDate invoiceDate}}</p>
    </div>
    <div style="margin-bottom: 30px;">
      <h3>Bill To:</h3>
      <p>{{customerName}}<br>{{customerEmail}}<br>{{customerAddress}}</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
      <thead>
        <tr style="background: #f8f9fa;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Quantity</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">{{this.name}}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">{{this.quantity}}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">{{formatCurrency this.price}}</td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">{{formatCurrency this.total}}</td>
        </tr>
        {{/each}}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
          <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">{{formatCurrency total}}</td>
        </tr>
      </tfoot>
    </table>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{paymentLink}}" style="display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 4px;">Pay Now</a>
    </p>
  </div>
</body>
</html>`,
    };
  }

  /**
   * Compile template
   */
  compile(template) {
    const cacheKey = this.hashTemplate(template);

    if (this.compiledTemplates.has(cacheKey)) {
      return this.compiledTemplates.get(cacheKey);
    }

    const compiled = Handlebars.compile(template);
    this.compiledTemplates.set(cacheKey, compiled);

    return compiled;
  }

  /**
   * Render template with data
   */
  render(template, data) {
    try {
      const compiled = this.compile(template);
      return compiled(data);
    } catch (error) {
      logger.error('Template rendering error', { error: error.message });
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }

  /**
   * Render base template by name
   */
  renderBase(templateName, data) {
    const template = this.baseTemplates[templateName];

    if (!template) {
      throw new Error(`Base template '${templateName}' not found`);
    }

    return this.render(template, data);
  }

  /**
   * Hash template for caching
   */
  hashTemplate(template) {
    let hash = 0;
    for (let i = 0; i < template.length; i++) {
      const char = template.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  /**
   * Clear template cache
   */
  clearCache() {
    this.compiledTemplates.clear();
    logger.info('Template cache cleared');
  }
}

// Create singleton instance
const templateRenderer = new TemplateRenderer();

export default templateRenderer;

/**
 * Render email template
 */
export function renderEmail(templateName, data) {
  return templateRenderer.renderBase(templateName, data);
}

/**
 * Render custom template
 */
export function renderTemplate(template, data) {
  return templateRenderer.render(template, data);
}
