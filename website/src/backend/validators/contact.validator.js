import { z } from 'zod';

// Create contact schema
export const createContactSchema = z.object({
  body: z.object({
    first_name: z.string().min(1, 'First name is required').max(255),
    last_name: z.string().min(1, 'Last name is required').max(255),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    title: z.string().max(255).optional(),
    lead_id: z.string().uuid().optional(),
    is_primary_contact: z.boolean().default(false),
    custom_fields: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    assigned_to: z.string().uuid().optional(),
  }),
});

// Update contact schema
export const updateContactSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid contact ID'),
  }),
  body: z.object({
    first_name: z.string().min(1).max(255).optional(),
    last_name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    title: z.string().max(255).optional(),
    lead_id: z.string().uuid().optional(),
    is_primary_contact: z.boolean().optional(),
    custom_fields: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    assigned_to: z.string().uuid().optional(),
  }),
});

// Get contact schema
export const getContactSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid contact ID'),
  }),
});

// Delete contact schema
export const deleteContactSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid contact ID'),
  }),
});

// List contacts schema
export const listContactsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    lead_id: z.string().uuid().optional(),
    search: z.string().optional(),
    sort: z.enum(['first_name', 'last_name', 'email', 'created_at']).default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});
