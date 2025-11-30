import { PostHog } from 'posthog-node';
import config from '../config/app.config.js';
import logger from '../utils/logger.js';

class PostHogService {
  constructor() {
    this.enabled = config.posthog.enabled && config.posthog.apiKey && config.posthog.apiKey !== 'your_posthog_api_key';
    
    if (this.enabled) {
      this.client = new PostHog(
        config.posthog.apiKey,
        { 
          host: config.posthog.host,
          flushAt: 1, // Send events immediately in development, increase in production
          flushInterval: 30000 // 30 seconds
        }
      );
      logger.info('✅ PostHog client initialized');
    } else {
      logger.warn('⚠️ PostHog is not configured or disabled');
      this.client = null;
    }
  }

  /**
   * Capture an event
   */
  captureEvent(userId, event, properties = {}, options = {}) {
    if (!this.enabled || !this.client) {
      return;
    }

    try {
      const eventPayload = {
        distinctId: userId || 'anonymous',
        event,
        properties: {
          ...properties,
          environment: config.env,
          source: 'backend',
          ...options
        }
      };

      this.client.capture(eventPayload);
    } catch (error) {
      logger.error('Error capturing PostHog event:', error);
    }
  }

  /**
   * Identify a user
   */
  identifyUser(userId, properties = {}) {
    if (!this.enabled || !this.client) {
      return;
    }

    try {
      this.client.identify({
        distinctId: userId,
        properties: {
          ...properties,
          environment: config.env,
          source: 'backend'
        }
      });
    } catch (error) {
      logger.error('Error identifying PostHog user:', error);
    }
  }

  /**
   * Capture page view (for API endpoints)
   */
  capturePageView(userId, page, properties = {}) {
    this.captureEvent(userId, 'page_view', {
      page,
      ...properties
    });
  }

  /**
   * Capture API request
   */
  captureApiRequest(userId, endpoint, method, properties = {}) {
    this.captureEvent(userId, 'api_request', {
      endpoint,
      method,
      ...properties
    });
  }

  /**
   * Capture user signup
   */
  captureSignup(userId, properties = {}) {
    this.captureEvent(userId, 'user_signed_up', {
      ...properties
    });
  }

  /**
   * Capture user login
   */
  captureLogin(userId, properties = {}) {
    this.captureEvent(userId, 'user_logged_in', {
      ...properties
    });
  }

  /**
   * Capture user logout
   */
  captureLogout(userId, properties = {}) {
    this.captureEvent(userId, 'user_logged_out', {
      ...properties
    });
  }

  /**
   * Capture form submission
   */
  captureFormSubmission(userId, formId, properties = {}) {
    this.captureEvent(userId, 'form_submitted', {
      form_id: formId,
      ...properties
    });
  }

  /**
   * Capture email campaign interaction
   */
  captureEmailInteraction(userId, campaignId, interactionType, properties = {}) {
    this.captureEvent(userId, 'email_interaction', {
      campaign_id: campaignId,
      interaction_type: interactionType,
      ...properties
    });
  }

  /**
   * Capture AI feature usage
   */
  captureAIUsage(userId, feature, properties = {}) {
    this.captureEvent(userId, 'ai_feature_used', {
      feature,
      ...properties
    });
  }

  /**
   * Capture workflow execution
   */
  captureWorkflowExecution(userId, workflowId, properties = {}) {
    this.captureEvent(userId, 'workflow_executed', {
      workflow_id: workflowId,
      ...properties
    });
  }

  /**
   * Flush all pending events
   */
  async flush() {
    if (this.client) {
      try {
        await this.client.flush();
      } catch (error) {
        logger.error('Error flushing PostHog events:', error);
      }
    }
  }

  /**
   * Close the PostHog client
   */
  async close() {
    if (this.client) {
      try {
        await this.flush();
        this.client.shutdown();
      } catch (error) {
        logger.error('Error closing PostHog client:', error);
      }
    }
  }
}

export default new PostHogService();