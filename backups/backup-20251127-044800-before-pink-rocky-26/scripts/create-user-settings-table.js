import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});

async function createUserSettingsTable() {
  try {
    console.log("Creating user_settings table...");

    // Create the table
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
          email_notifications BOOLEAN DEFAULT TRUE,
          push_notifications BOOLEAN DEFAULT TRUE,
          sms_notifications BOOLEAN DEFAULT FALSE,
          marketing_emails BOOLEAN DEFAULT FALSE,
          call_reminders BOOLEAN DEFAULT TRUE,
          meeting_reminders BOOLEAN DEFAULT TRUE,
          language TEXT DEFAULT 'English',
          timezone TEXT DEFAULT 'America/New_York',
          date_format TEXT DEFAULT 'MM/DD/YYYY',
          time_format TEXT DEFAULT '12 hour',
          two_factor_enabled BOOLEAN DEFAULT FALSE,
          auto_logout BOOLEAN DEFAULT TRUE,
          auto_logout_minutes INTEGER DEFAULT 30,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id)
        );
        
        ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete own settings" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);
        
        CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
      `,
    });

    if (error) {
      console.error("Error creating user_settings table:", error);
    } else {
      console.log("✅ user_settings table created successfully");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

createUserSettingsTable();
