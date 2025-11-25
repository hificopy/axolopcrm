import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('Key available:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     Axolop CRM V1 - Database Setup             ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');

  try {
    console.log('📦 Creating core CRM tables...');

    // Create leads table
    const { error: leadsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          website TEXT,
          phone TEXT,
          address JSONB,
          type TEXT NOT NULL DEFAULT 'B2B_COMPANY',
          status TEXT NOT NULL DEFAULT 'NEW',
          value NUMERIC DEFAULT 0,
          owner_id UUID,
          custom_fields JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    if (leadsError && !leadsError.message?.includes('already exists')) {
      console.log('⚠️  Leads table:', leadsError.message);
    } else {
      console.log('✅ Leads table ready');
    }

    // Create contacts table
    const { error: contactsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.contacts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          title TEXT,
          lead_id UUID,
          is_primary_contact BOOLEAN DEFAULT FALSE,
          custom_fields JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    if (contactsError && !contactsError.message?.includes('already exists')) {
      console.log('⚠️  Contacts table:', contactsError.message);
    } else {
      console.log('✅ Contacts table ready');
    }

    // Create deals table
    const { error: dealsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.deals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          lead_id UUID,
          name TEXT NOT NULL,
          stage TEXT NOT NULL DEFAULT 'NEW',
          amount NUMERIC DEFAULT 0,
          currency TEXT DEFAULT 'USD',
          probability INTEGER DEFAULT 10,
          expected_close_date DATE,
          status TEXT DEFAULT 'OPEN',
          closed_at TIMESTAMP WITH TIME ZONE,
          won_at TIMESTAMP WITH TIME ZONE,
          lost_at TIMESTAMP WITH TIME ZONE,
          closed_reason TEXT,
          description TEXT,
          owner_id UUID,
          product_type TEXT,
          tags TEXT[],
          notes TEXT,
          custom_fields JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    if (dealsError && !dealsError.message?.includes('already exists')) {
      console.log('⚠️  Deals table:', dealsError.message);
    } else {
      console.log('✅ Deals table ready');
    }

    console.log('');
    console.log('📝 Creating forms tables...');

    // Since RPC might not work, let's use direct table creation
    // We'll check if tables exist by querying them

    const tables = [
      {
        name: 'forms',
        check: async () => {
          const { data, error } = await supabase.from('forms').select('id').limit(1);
          return !error;
        }
      },
      {
        name: 'form_responses',
        check: async () => {
          const { data, error } = await supabase.from('form_responses').select('id').limit(1);
          return !error;
        }
      },
      {
        name: 'contacts',
        check: async () => {
          const { data, error } = await supabase.from('contacts').select('id').limit(1);
          return !error;
        }
      },
      {
        name: 'leads',
        check: async () => {
          const { data, error } = await supabase.from('leads').select('id').limit(1);
          return !error;
        }
      },
      {
        name: 'deals',
        check: async () => {
          const { data, error } = await supabase.from('deals').select('id').limit(1);
          return !error;
        }
      }
    ];

    for (const table of tables) {
      const exists = await table.check();
      if (exists) {
        console.log(`✅ ${table.name} table exists`);
      } else {
        console.log(`❌ ${table.name} table missing - needs manual creation`);
      }
    }

    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  Database verification complete!               ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. If any tables are missing, run the SQL script manually');
    console.log('   2. Open Supabase dashboard SQL editor');
    console.log('   3. Run: supabase-v1-deployment.sql');
    console.log('');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
