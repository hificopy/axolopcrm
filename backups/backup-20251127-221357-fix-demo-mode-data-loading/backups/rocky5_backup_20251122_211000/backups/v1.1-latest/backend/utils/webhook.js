import axios from 'axios';
import crypto from 'crypto';
import logger from './logger.js';
import { supabase } from '../config/supabase-auth.js';

/**
 * Webhook delivery system
 */
class WebhookService {
  constructor() {
    this.defaultTimeout = 10000; // 10 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Generate webhook signature for verification
   */
  generateSignature(payload, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload, signature, secret) {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Send webhook with retry logic
   */
  async sendWebhook(url, payload, options = {}) {
    const {
      secret = null,
      timeout = this.defaultTimeout,
      retries = this.maxRetries,
      headers = {},
    } = options;

    let lastError = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const webhookPayload = {
          event: payload.event,
          data: payload.data,
          timestamp: new Date().toISOString(),
          id: crypto.randomUUID(),
        };

        const requestHeaders = {
          'Content-Type': 'application/json',
          'User-Agent': 'Axolop-CRM-Webhook/1.0',
          ...headers,
        };

        // Add signature if secret provided
        if (secret) {
          requestHeaders['X-Webhook-Signature'] = this.generateSignature(webhookPayload, secret);
        }

        const startTime = Date.now();

        const response = await axios.post(url, webhookPayload, {
          headers: requestHeaders,
          timeout,
          validateStatus: (status) => status >= 200 && status < 300,
        });

        const duration = Date.now() - startTime;

        logger.info('Webhook delivered successfully', {
          url,
          event: payload.event,
          attempt,
          duration,
          status: response.status,
        });

        // Log successful delivery
        await this.logWebhookDelivery({
          url,
          event: payload.event,
          payload: webhookPayload,
          status: 'success',
          status_code: response.status,
          attempt,
          duration,
        });

        return {
          success: true,
          status: response.status,
          data: response.data,
          attempt,
          duration,
        };
      } catch (error) {
        lastError = error;

        logger.warn('Webhook delivery failed', {
          url,
          event: payload.event,
          attempt,
          error: error.message,
          willRetry: attempt < retries,
        });

        // Wait before retry
        if (attempt < retries) {
          await this.sleep(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    // All retries failed
    logger.error('Webhook delivery failed after all retries', {
      url,
      event: payload.event,
      retries,
      error: lastError.message,
    });

    // Log failed delivery
    await this.logWebhookDelivery({
      url,
      event: payload.event,
      payload,
      status: 'failed',
      error: lastError.message,
      attempt: retries,
    });

    return {
      success: false,
      error: lastError.message,
      attempt: retries,
    };
  }

  /**
   * Log webhook delivery attempt
   */
  async logWebhookDelivery(data) {
    try {
      await supabase.from('webhook_deliveries').insert({
        url: data.url,
        event: data.event,
        payload: data.payload,
        status: data.status,
        status_code: data.status_code,
        error: data.error,
        attempt: data.attempt,
        duration: data.duration,
        delivered_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to log webhook delivery', { error: error.message });
    }
  }

  /**
   * Trigger webhook for an event
   */
  async trigger(event, data, webhookUrls = []) {
    if (!webhookUrls || webhookUrls.length === 0) {
      return;
    }

    const payload = { event, data };
    const results = [];

    for (const webhookConfig of webhookUrls) {
      const { url, secret, enabled = true } = webhookConfig;

      if (!enabled) continue;

      const result = await this.sendWebhook(url, payload, { secret });
      results.push({ url, ...result });
    }

    return results;
  }

  /**
   * Get webhook subscriptions for an event
   */
  async getSubscriptions(event) {
    try {
      const { data, error } = await supabase
        .from('webhook_subscriptions')
        .select('*')
        .eq('event', event)
        .eq('enabled', true);

      if (error) {
        logger.error('Failed to get webhook subscriptions', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error getting webhook subscriptions', { error: error.message });
      return [];
    }
  }

  /**
   * Subscribe to webhook
   */
  async subscribe(userId, event, url, secret = null) {
    try {
      const { data, error } = await supabase
        .from('webhook_subscriptions')
        .insert({
          user_id: userId,
          event,
          url,
          secret,
          enabled: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('Webhook subscription created', {
        userId,
        event,
        url,
        subscriptionId: data.id,
      });

      return data;
    } catch (error) {
      logger.error('Failed to create webhook subscription', { error: error.message });
      throw error;
    }
  }

  /**
   * Unsubscribe from webhook
   */
  async unsubscribe(subscriptionId) {
    try {
      const { error } = await supabase
        .from('webhook_subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) {
        throw error;
      }

      logger.info('Webhook subscription deleted', { subscriptionId });
      return true;
    } catch (error) {
      logger.error('Failed to delete webhook subscription', { error: error.message });
      throw error;
    }
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const webhookService = new WebhookService();

export default webhookService;

/**
 * Trigger webhook for an event
 */
export async function triggerWebhook(event, data) {
  const subscriptions = await webhookService.getSubscriptions(event);

  if (subscriptions.length === 0) {
    return;
  }

  return webhookService.trigger(event, data, subscriptions);
}
