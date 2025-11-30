// Temporary endpoint to execute workflow function fix
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

router.post("/fix-workflow-function", async (req, res) => {
  try {
    console.log("🚀 Applying workflow function fix...");

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

    // Try to execute via raw SQL (this might not work due to Supabase restrictions)
    try {
      const { data, error } = await supabaseAdmin
        .from("pg_temp")
        .select("*")
        .limit(1);

      // If we get here, try a different approach
      console.log("📝 SQL execution requires Supabase Dashboard access");

      return res.json({
        success: false,
        message: "Direct SQL execution not available through API",
        sql: sql,
        instructions: [
          "1. Go to Supabase Dashboard > SQL Editor",
          "2. Paste and run the SQL above",
          "3. Then run: GRANT EXECUTE ON FUNCTION get_pending_workflow_executions(p_limit INTEGER) TO authenticated, service_role;",
        ],
      });
    } catch (err) {
      return res.json({
        success: false,
        message: "SQL execution not available",
        sql: sql,
        error: err.message,
      });
    }
  } catch (error) {
    console.error("❌ Error in fix endpoint:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test endpoint to check if function exists
router.get("/test-workflow-function", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.rpc(
      "get_pending_workflow_executions",
      { p_limit: 1 },
    );

    if (error) {
      return res.json({
        exists: false,
        error: error.message,
      });
    }

    res.json({
      exists: true,
      count: data?.length || 0,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      exists: false,
      error: error.message,
    });
  }
});

export default router;
