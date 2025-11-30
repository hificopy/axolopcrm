import { z } from 'zod';

// Address schema
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
}).optional();

// Create lead schema
export const createLeadSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
    email: z.string().email('Invalid email address'),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    phone: z.string().optional(),
    type: z.enum(['B2B_COMPANY', 'B2C_CUSTOMER']).default('B2B_COMPANY'),
    status: z.enum(['NEW', 'QUALIFIED', 'CONTACTED', 'DISQUALIFIED']).default('NEW'),
    value: z.number().min(0, 'Value must be positive').optional(),
    address: addressSchema,
    custom_fields: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    lead_score: z.number().int().min(0).max(100).optional(),
    owner_id: z.string().uuid().optional(),
  }),
});

// Update lead schema
export const updateLeadSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional().or(z.literal('')),
    phone: z.string().optional(),
    type: z.enum(['B2B_COMPANY', 'B2C_CUSTOMER']).optional(),
    status: z.enum(['NEW', 'QUALIFIED', 'CONTACTED', 'DISQUALIFIED']).optional(),
    value: z.number().min(0).optional(),
    address: addressSchema,
    custom_fields: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    lead_score: z.number().int().min(0).max(100).optional(),
    owner_id: z.string().uuid().optional(),
  }),
});

// Get lead schema
export const getLeadSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
  }),
});

// Delete lead schema
export const deleteLeadSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
  }),
});

// List leads schema
export const listLeadsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    status: z.enum(['NEW', 'QUALIFIED', 'CONTACTED', 'DISQUALIFIED']).optional(),
    type: z.enum(['B2B_COMPANY', 'B2C_CUSTOMER']).optional(),
    search: z.string().optional(),
    sort: z.enum(['name', 'email', 'created_at', 'value', 'lead_score']).default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// Import leads schema
export const importLeadsSchema = z.object({
  body: z.object({
    mapping: z.record(z.string()),
    preset_id: z.string().uuid().optional(),
  }),
});
