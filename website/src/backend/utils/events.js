import EventEmitter from 'events';
import logger from './logger.js';

/**
 * Internal event system for decoupled application events
 */
class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Increase limit for many listeners
  }

  /**
   * Emit event with logging
   */
  emitEvent(eventName, data) {
    logger.debug('Event emitted', { event: eventName, data });
    this.emit(eventName, data);
  }

  /**
   * Subscribe to event with error handling
   */
  subscribe(eventName, handler) {
    this.on(eventName, async (...args) => {
      try {
        await handler(...args);
      } catch (error) {
        logger.error('Event handler error', {
          event: eventName,
          error: error.message,
        });
      }
    });
  }
}

// Create singleton instance
const events = new AppEventEmitter();

// Define event types
export const EventTypes = {
  // Lead events
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_DELETED: 'lead.deleted',
  LEAD_STATUS_CHANGED: 'lead.status_changed',
  LEAD_SCORE_CHANGED: 'lead.score_changed',
  LEAD_ASSIGNED: 'lead.assigned',

  // Contact events
  CONTACT_CREATED: 'contact.created',
  CONTACT_UPDATED: 'contact.updated',
  CONTACT_DELETED: 'contact.deleted',

  // Opportunity events
  OPPORTUNITY_CREATED: 'opportunity.created',
  OPPORTUNITY_UPDATED: 'opportunity.updated',
  OPPORTUNITY_STAGE_CHANGED: 'opportunity.stage_changed',
  OPPORTUNITY_WON: 'opportunity.won',
  OPPORTUNITY_LOST: 'opportunity.lost',

  // Email events
  EMAIL_SENT: 'email.sent',
  EMAIL_DELIVERED: 'email.delivered',
  EMAIL_OPENED: 'email.opened',
  EMAIL_CLICKED: 'email.clicked',
  EMAIL_BOUNCED: 'email.bounced',
  EMAIL_COMPLAINED: 'email.complained',
  EMAIL_UNSUBSCRIBED: 'email.unsubscribed',

  // Workflow events
  WORKFLOW_STARTED: 'workflow.started',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_FAILED: 'workflow.failed',
  WORKFLOW_STEP_COMPLETED: 'workflow.step_completed',

  // Campaign events
  CAMPAIGN_CREATED: 'campaign.created',
  CAMPAIGN_STARTED: 'campaign.started',
  CAMPAIGN_COMPLETED: 'campaign.completed',
  CAMPAIGN_PAUSED: 'campaign.paused',

  // Form events
  FORM_SUBMITTED: 'form.submitted',
  FORM_CREATED: 'form.created',

  // User events
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',
  USER_REGISTERED: 'user.registered',

  // System events
  SYSTEM_ERROR: 'system.error',
  SYSTEM_WARNING: 'system.warning',
  CACHE_CLEARED: 'cache.cleared',
  DATABASE_ERROR: 'database.error',
};

/**
 * Set up default event handlers
 */
function setupDefaultHandlers() {
  // Log all lead events
  events.subscribe(EventTypes.LEAD_CREATED, (lead) => {
    logger.info('Lead created', { leadId: lead.id, email: lead.email });
  });

  events.subscribe(EventTypes.LEAD_STATUS_CHANGED, ({ lead, oldStatus, newStatus }) => {
    logger.info('Lead status changed', {
      leadId: lead.id,
      oldStatus,
      newStatus,
    });
  });

  // Email event handlers
  events.subscribe(EventTypes.EMAIL_SENT, ({ email, campaignId }) => {
    logger.info('Email sent', { email, campaignId });
  });

  events.subscribe(EventTypes.EMAIL_OPENED, ({ email, campaignId }) => {
    logger.info('Email opened', { email, campaignId });
    // Could trigger workflow or update lead score here
  });

  events.subscribe(EventTypes.EMAIL_CLICKED, ({ email, campaignId, url }) => {
    logger.info('Email link clicked', { email, campaignId, url });
    // Could increase lead score or trigger follow-up
  });

  // Workflow event handlers
  events.subscribe(EventTypes.WORKFLOW_STARTED, ({ workflowId, executionId }) => {
    logger.info('Workflow started', { workflowId, executionId });
  });

  events.subscribe(EventTypes.WORKFLOW_FAILED, ({ workflowId, executionId, error }) => {
    logger.error('Workflow failed', { workflowId, executionId, error });
  });

  // Form event handlers
  events.subscribe(EventTypes.FORM_SUBMITTED, ({ formId, submission }) => {
    logger.info('Form submitted', { formId, submissionId: submission.id });
    // Could trigger workflow or create lead
  });

  // System event handlers
  events.subscribe(EventTypes.SYSTEM_ERROR, (error) => {
    logger.error('System error', { error });
  });
}

// Initialize default handlers
setupDefaultHandlers();

export default events;

/**
 * Helper function to emit events
 */
export function emit(eventType, data) {
  events.emitEvent(eventType, data);
}

/**
 * Helper function to subscribe to events
 */
export function on(eventType, handler) {
  events.subscribe(eventType, handler);
}

/**
 * Helper function to subscribe once
 */
export function once(eventType, handler) {
  events.once(eventType, async (...args) => {
    try {
      await handler(...args);
    } catch (error) {
      logger.error('Event handler error (once)', {
        event: eventType,
        error: error.message,
      });
    }
  });
}

/**
 * Remove event listener
 */
export function off(eventType, handler) {
  events.off(eventType, handler);
}
