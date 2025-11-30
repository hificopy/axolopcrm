import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSortOrderColumn() {
  try {
    console.log("🔧 Adding sort_order column to user_todos table...");

    // Add the sort_order column if it doesn't exist
    const { error: addColumnError } = await supabase.rpc("exec_sql", {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_todos' 
            AND column_name = 'sort_order'
            AND table_schema = 'public'
          ) THEN
            ALTER TABLE public.user_todos 
            ADD COLUMN sort_order INTEGER DEFAULT 0;
            
            CREATE INDEX IF NOT EXISTS idx_user_todos_sort_order 
            ON public.user_todos(user_id, sort_order);
            
            RAISE NOTICE 'sort_order column added successfully';
          ELSE
            RAISE NOTICE 'sort_order column already exists';
          END IF;
        END $$;
      `,
    });

    if (addColumnError) {
      console.error("❌ Error adding column:", addColumnError);

      // Try alternative approach - just run the ALTER TABLE directly
      console.log("🔄 Trying alternative approach...");
      const { error: altError } = await supabase.rpc("exec_sql", {
        sql: `ALTER TABLE public.user_todos ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;`,
      });

      if (altError) {
        console.error("❌ Alternative approach also failed:", altError);
      } else {
        console.log(
          "✅ sort_order column added successfully (alternative approach)!",
        );
      }
    } else {
      console.log("✅ sort_order column check completed successfully!");
    }

    // Verify the column exists
    console.log("🔍 Verifying table structure...");
    const { data: columns, error: checkError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", "user_todos")
      .eq("table_schema", "public")
      .order("ordinal_position");

    if (checkError) {
      console.error("❌ Error checking columns:", checkError);
    } else {
      console.log("📋 Current table structure:");
      columns.forEach((col) => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      });
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

addSortOrderColumn();
