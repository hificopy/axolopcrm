import Bull from 'bull';
import config from '../config/app.config.js';
import logger from './logger.js';
import metrics from './metrics.js';

/**
 * Job queue system using Bull and Redis
 */

// Create queues
export const queues = {
  email: null,
  workflow: null,
  import: null,
  export: null,
  analytics: null,
};

/**
 * Initialize all queues
 */
export function initializeQueues(redis) {
  const queueOptions = {
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 200, // Keep last 200 failed jobs
    },
  };

  // Email queue
  queues.email = new Bull('email', queueOptions);
  setupQueueEventHandlers(queues.email, 'email');

  // Workflow queue
  queues.workflow = new Bull('workflow', queueOptions);
  setupQueueEventHandlers(queues.workflow, 'workflow');

  // Import queue
  queues.import = new Bull('import', queueOptions);
  setupQueueEventHandlers(queues.import, 'import');

  // Export queue
  queues.export = new Bull('export', queueOptions);
  setupQueueEventHandlers(queues.export, 'export');

  // Analytics queue
  queues.analytics = new Bull('analytics', queueOptions);
  setupQueueEventHandlers(queues.analytics, 'analytics');

  logger.info('Job queues initialized');

  return queues;
}

/**
 * Setup event handlers for a queue
 */
function setupQueueEventHandlers(queue, queueName) {
  queue.on('completed', (job, result) => {
    logger.info('Job completed', {
      queue: queueName,
      jobId: job.id,
      duration: Date.now() - job.timestamp,
    });
  });

  queue.on('failed', (job, err) => {
    logger.error('Job failed', {
      queue: queueName,
      jobId: job.id,
      error: err.message,
      attempts: job.attemptsMade,
    });
    metrics.recordError(`queue_${queueName}_failed`);
  });

  queue.on('stalled', (job) => {
    logger.warn('Job stalled', {
      queue: queueName,
      jobId: job.id,
    });
  });

  queue.on('error', (error) => {
    logger.error('Queue error', {
      queue: queueName,
      error: error.message,
    });
  });
}

/**
 * Add email to queue
 */
export async function queueEmail(emailData, options = {}) {
  if (!queues.email) {
    throw new Error('Email queue not initialized');
  }

  const job = await queues.email.add(emailData, {
    priority: options.priority || 5,
    delay: options.delay || 0,
    attempts: options.attempts || 3,
  });

  logger.debug('Email queued', {
    jobId: job.id,
    to: emailData.to,
  });

  return job;
}

/**
 * Add workflow execution to queue
 */
export async function queueWorkflow(workflowData, options = {}) {
  if (!queues.workflow) {
    throw new Error('Workflow queue not initialized');
  }

  const job = await queues.workflow.add(workflowData, {
    priority: options.priority || 5,
    delay: options.delay || 0,
    attempts: options.attempts || 3,
  });

  logger.debug('Workflow queued', {
    jobId: job.id,
    workflowId: workflowData.workflowId,
  });

  return job;
}

/**
 * Add import job to queue
 */
export async function queueImport(importData, options = {}) {
  if (!queues.import) {
    throw new Error('Import queue not initialized');
  }

  const job = await queues.import.add(importData, {
    priority: options.priority || 3,
    attempts: options.attempts || 1, // Don't retry imports
  });

  logger.debug('Import queued', {
    jobId: job.id,
    type: importData.type,
  });

  return job;
}

/**
 * Add export job to queue
 */
export async function queueExport(exportData, options = {}) {
  if (!queues.export) {
    throw new Error('Export queue not initialized');
  }

  const job = await queues.export.add(exportData, {
    priority: options.priority || 3,
  });

  logger.debug('Export queued', {
    jobId: job.id,
    type: exportData.type,
  });

  return job;
}

/**
 * Add analytics job to queue
 */
export async function queueAnalytics(analyticsData, options = {}) {
  if (!queues.analytics) {
    throw new Error('Analytics queue not initialized');
  }

  const job = await queues.analytics.add(analyticsData, {
    priority: options.priority || 7,
    delay: options.delay || 0,
  });

  logger.debug('Analytics job queued', {
    jobId: job.id,
    type: analyticsData.type,
  });

  return job;
}

/**
 * Get queue statistics
 */
export async function getQueueStats(queueName) {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    queue: queueName,
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

/**
 * Get all queue statistics
 */
export async function getAllQueueStats() {
  const stats = {};

  for (const queueName of Object.keys(queues)) {
    if (queues[queueName]) {
      stats[queueName] = await getQueueStats(queueName);
    }
  }

  return stats;
}

/**
 * Pause a queue
 */
export async function pauseQueue(queueName) {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  await queue.pause();
  logger.info('Queue paused', { queue: queueName });
}

/**
 * Resume a queue
 */
export async function resumeQueue(queueName) {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  await queue.resume();
  logger.info('Queue resumed', { queue: queueName });
}

/**
 * Clean completed jobs from queue
 */
export async function cleanQueue(queueName, grace = 3600000) {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  const cleaned = await queue.clean(grace, 'completed');
  logger.info('Queue cleaned', { queue: queueName, cleaned });

  return cleaned;
}

/**
 * Close all queues
 */
export async function closeQueues() {
  const promises = [];

  for (const queueName of Object.keys(queues)) {
    if (queues[queueName]) {
      promises.push(queues[queueName].close());
    }
  }

  await Promise.all(promises);
  logger.info('All queues closed');
}

export default {
  initializeQueues,
  queueEmail,
  queueWorkflow,
  queueImport,
  queueExport,
  queueAnalytics,
  getQueueStats,
  getAllQueueStats,
  pauseQueue,
  resumeQueue,
  cleanQueue,
  closeQueues,
  queues,
};
