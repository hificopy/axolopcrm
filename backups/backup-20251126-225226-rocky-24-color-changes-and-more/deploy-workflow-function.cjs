const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

async function deployWorkflowFunction() {
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
    process.exit(1);
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    console.log("🔧 Deploying get_pending_workflow_executions function...");

    // First, let's check if workflow_executions table exists and create it if needed
    const { data: tables, error: tableError } = await serviceClient
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "workflow_executions");

    if (tableError) {
      console.error("Error checking tables:", tableError);
      return;
    }

    if (tables.length === 0) {
      console.log("Creating workflow_executions table...");
      const { error: createError } = await serviceClient.rpc("exec_sql", {
        sql: `
            CREATE TABLE workflow_executions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                workflow_id UUID NOT NULL,
                trigger_type TEXT NOT NULL,
                trigger_data JSONB,
                status TEXT DEFAULT 'pending',
                started_at TIMESTAMP WITH TIME ZONE,
                completed_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
            CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
            CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at ON workflow_executions(created_at);
            
            ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
            
            GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_executions TO authenticated;
          `,
      });

      if (createError) {
        console.error("Error creating table:", createError);
      } else {
        console.log("✅ workflow_executions table created");
      }
    }

    // Now deploy the function
    const { data, error } = await serviceClient.rpc("exec_sql", {
      sql: `
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
          AS \$\$
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
          \$\;
          
          GRANT EXECUTE ON FUNCTION get_pending_workflow_executions(p_limit INTEGER) TO authenticated;
        `,
    });

    if (error) {
      console.error("❌ Error deploying function:", error);
    } else {
      console.log(
        "✅ get_pending_workflow_executions function deployed successfully",
      );
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
  }
}

deployWorkflowFunction();
