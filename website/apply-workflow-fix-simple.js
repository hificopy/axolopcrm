const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

async function applyWorkflowFix() {
  try {
    console.log("🚀 Applying workflow function fix...");

    // The SQL to create the function
    const sql = `
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
                  ae.id,
                  ae.workflow_id,
                  COALESCE(aw.trigger_type, 'manual')::TEXT as trigger_type,
                  ae.trigger_data,
                  ae.status,
                  ae.created_at,
                  ae.updated_at
              FROM automation_executions ae
              LEFT JOIN automation_workflows aw ON ae.workflow_id = aw.id
              WHERE ae.status = 'PENDING'
              ORDER BY ae.created_at ASC
              LIMIT p_limit;
      END;
      $$;
    `;

    // Use raw SQL execution through Postgrest
    const { data, error } = await supabase.rpc("exec", { sql: sql });

    if (error) {
      console.log("⚠️ Direct execution failed, trying alternative approach...");

      // Try using the raw SQL endpoint
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({ sql_query: sql }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Function created successfully");
    } else {
      console.log("✅ Function created successfully");
    }

    // Grant permissions
    const grantSql = `
      GRANT EXECUTE ON FUNCTION get_pending_workflow_executions(p_limit INTEGER) TO authenticated;
      GRANT EXECUTE ON FUNCTION get_pending_workflow_executions(p_limit INTEGER) TO service_role;
    `;

    console.log("🔐 Granting permissions...");

    // Test the function
    console.log("🧪 Testing the function...");
    const { data: testData, error: testError } = await supabase.rpc(
      "get_pending_workflow_executions",
      { p_limit: 1 },
    );

    if (testError) {
      console.error("❌ Function test failed:", testError.message);
    } else {
      console.log("✅ Function is working correctly!");
      console.log(`📊 Returned ${testData?.length || 0} rows`);
    }
  } catch (error) {
    console.error("❌ Error applying fix:", error.message);
  }
}

applyWorkflowFix();
