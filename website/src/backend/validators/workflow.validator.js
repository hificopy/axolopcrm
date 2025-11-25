import { z } from 'zod';

// Workflow node schema
const nodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.any()),
});

// Workflow edge schema
const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  type: z.string().optional(),
});

// Create workflow schema
export const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().optional(),
    trigger_type: z.string().optional(),
    trigger_config: z.record(z.any()).optional(),
    nodes: z.array(nodeSchema).default([]),
    edges: z.array(edgeSchema).default([]),
    is_active: z.boolean().default(false),
    execution_mode: z.enum(['sequential', 'parallel']).default('sequential'),
    max_concurrent_executions: z.number().int().min(1).max(1000).default(100),
    max_retries: z.number().int().min(0).max(10).default(3),
  }),
});

// Update workflow schema
export const updateWorkflowSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workflow ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    trigger_type: z.string().optional(),
    trigger_config: z.record(z.any()).optional(),
    nodes: z.array(nodeSchema).optional(),
    edges: z.array(edgeSchema).optional(),
    is_active: z.boolean().optional(),
    is_paused: z.boolean().optional(),
    execution_mode: z.enum(['sequential', 'parallel']).optional(),
    max_concurrent_executions: z.number().int().min(1).max(1000).optional(),
    max_retries: z.number().int().min(0).max(10).optional(),
  }),
});

// Execute workflow schema
export const executeWorkflowSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workflow ID'),
  }),
  body: z.object({
    trigger_entity_id: z.string().uuid().optional(),
    trigger_entity_type: z.string().optional(),
    trigger_data: z.record(z.any()).optional(),
  }),
});

// Get workflow schema
export const getWorkflowSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid workflow ID'),
  }),
});

// List workflows schema
export const listWorkflowsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    is_active: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    trigger_type: z.string().optional(),
    search: z.string().optional(),
  }),
});
