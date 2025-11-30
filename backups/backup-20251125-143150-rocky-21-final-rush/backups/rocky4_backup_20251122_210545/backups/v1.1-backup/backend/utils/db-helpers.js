// Database operations using Supabase
import { supabaseServer } from '../config/supabase-auth.js';

// Email Templates operations
export const emailTemplateDb = {
  getAll: async (params) => {
    let query = supabaseServer.from('email_templates');
    
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    if (params.category) {
      query = query.eq('category', params.category);
    }
    
    const { data, error } = await query
      .select('*')
      .range((params.page - 1) * params.limit, params.page * params.limit - 1)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  getById: async (id) => {
    const { data, error } = await supabaseServer
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  create: async (templateData) => {
    const { data, error } = await supabaseServer
      .from('email_templates')
      .insert([templateData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  update: async (id, templateData) => {
    const { data, error } = await supabaseServer
      .from('email_templates')
      .update(templateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id) => {
    const { error } = await supabaseServer
      .from('email_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Email Campaign operations
export const emailCampaignDb = {
  getAll: async (params) => {
    let query = supabaseServer.from('email_campaigns');
    
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    if (params.status) {
      query = query.eq('status', params.status);
    }
    if (params.type) {
      query = query.eq('type', params.type);
    }
    
    const { data, error } = await query
      .select('*')
      .range((params.page - 1) * params.limit, params.page * params.limit - 1)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  getById: async (id) => {
    const { data, error } = await supabaseServer
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  create: async (campaignData) => {
    const { data, error } = await supabaseServer
      .from('email_campaigns')
      .insert([campaignData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  update: async (id, campaignData) => {
    const { data, error } = await supabaseServer
      .from('email_campaigns')
      .update(campaignData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id) => {
    const { error } = await supabaseServer
      .from('email_campaigns')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Workflow operations
export const workflowDb = {
  getAll: async (params) => {
    let query = supabaseServer.from('automation_workflows');
    
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    if (params.isActive !== undefined) {
      query = query.eq('is_active', params.isActive);
    }
    
    const { data, error } = await query
      .select('*')
      .range((params.page - 1) * params.limit, params.page * params.limit - 1)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  getById: async (id) => {
    const { data, error } = await supabaseServer
      .from('automation_workflows')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  create: async (workflowData) => {
    const { data, error } = await supabaseServer
      .from('automation_workflows')
      .insert([workflowData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  update: async (id, workflowData) => {
    const { data, error } = await supabaseServer
      .from('automation_workflows')
      .update(workflowData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id) => {
    const { error } = await supabaseServer
      .from('automation_workflows')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};