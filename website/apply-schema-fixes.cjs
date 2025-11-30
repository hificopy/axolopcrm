const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (
  !serviceRoleKey ||
  serviceRoleKey === "your_supabase_service_role_key_here"
) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env file");
  console.log(
    "Please update your .env file with the actual service role key from Supabase dashboard",
  );
  console.log(
    "Go to: https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/settings/api",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applySchemaFixes() {
  try {
    console.log("🔧 Applying database schema fixes...");

    // Fix 1: Create campaign_emails table if it doesn't exist
    console.log("Creating campaign_emails table...");
    const { data: existingTable, error: checkError } = await supabase
      .from("campaign_emails")
      .select("id")
      .limit(1);

    if (checkError && checkError.code === "PGRST116") {
      // Table doesn't exist, create it via raw SQL
      console.log("Table does not exist, creating...");

      // Use the database connection directly
      const { Client } = require("pg");
      const client = new Client(process.env.DATABASE_URL);

      await client.connect();

      // Create campaign_emails table
      await client.query(`
        CREATE TABLE IF NOT EXISTS campaign_emails (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
            template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
            email_to TEXT NOT NULL,
            subject TEXT,
            content TEXT,
            status TEXT DEFAULT 'pending',
            sent_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Create indexes
      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_campaign_emails_campaign_id ON campaign_emails(campaign_id);",
      );
      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_campaign_emails_status ON campaign_emails(status);",
      );
      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_campaign_emails_sent_at ON campaign_emails(sent_at);",
      );

      console.log("✅ campaign_emails table created");

      // Enable RLS
      await client.query(
        "ALTER TABLE campaign_emails ENABLE ROW LEVEL SECURITY;",
      );

      // Create RLS policies
      await client.query(`
        CREATE POLICY IF NOT EXISTS "Users can view their own campaign emails"
        ON campaign_emails FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM email_campaigns ec
                WHERE ec.id = campaign_emails.campaign_id
                AND ec.user_id = auth.uid()
            )
        );
      `);

      await client.query(`
        CREATE POLICY IF NOT EXISTS "Users can insert their own campaign emails"
        ON campaign_emails FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM email_campaigns ec
                WHERE ec.id = campaign_emails.campaign_id
                AND ec.user_id = auth.uid()
            )
        );
      `);

      await client.query(
        "GRANT SELECT, INSERT, UPDATE, DELETE ON campaign_emails TO authenticated;",
      );

      // Fix 2: Create workflow_executions function
      await client.query(`
        CREATE OR REPLACE FUNCTION get_pending_workflow_executions(p_limit INTEGER DEFAULT 100)
        RETURNS TABLE (
            id UUID,
            workflow_id UUID,
            trigger_type TEXT,
            trigger_data JSONB,
            status TEXT,
            created_at TIMESTAMP WITH TIME ZONE,
            updated_at TIMESTAMP WITH TIME ZONE
        )
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                we.id,
                we.workflow_id,
                we.trigger_type,
                we.trigger_data,
                we.status,
                we.created_at,
                we.updated_at
            FROM workflow_executions we
            WHERE we.status = 'pending'
            ORDER BY we.created_at ASC
            LIMIT p_limit;
        END;
        $$;
      `);

      await client.query(
        "GRANT EXECUTE ON FUNCTION get_pending_workflow_executions(p_limit INTEGER) TO authenticated;",
      );

      // Fix 3: Create workflow_executions table if needed
      await client.query(`
        CREATE TABLE IF NOT EXISTS workflow_executions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
            trigger_type TEXT NOT NULL,
            trigger_data JSONB,
            status TEXT DEFAULT 'pending',
            started_at TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);",
      );
      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);",
      );
      await client.query(
        "CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at ON workflow_executions(created_at);",
      );

      await client.query(
        "ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;",
      );

      await client.query(
        "GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_executions TO authenticated;",
      );

      await client.end();

      console.log("✅ All schema fixes applied successfully");
    } else {
      console.log("✅ Tables already exist, skipping creation");
    }
  } catch (error) {
    console.error("❌ Error applying schema fixes:", error.message);
    console.error("Full error:", error);
  }
}

applySchemaFixes();
