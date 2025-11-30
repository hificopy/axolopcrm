import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTodosTable() {
  try {
    console.log("🔧 Creating user_todos table...");

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), "CREATE_USER_TODOS_TABLE.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Execute the SQL using Supabase SQL editor approach
    // Since we can't use rpc directly for DDL, we'll use a different approach
    console.log("📝 SQL file loaded, attempting to execute...");

    // First, let's check if table exists
    const { data: existingTable, error: checkError } = await supabase
      .from("user_todos")
      .select("id")
      .limit(1);

    if (checkError && checkError.code === "PGRST116") {
      console.log("📋 Table user_todos does not exist, creating...");

      // Try to execute SQL directly using raw SQL if available
      // For now, let's create the table structure manually
      const { error: createError } = await supabase.rpc("exec_sql", {
        sql: `
            CREATE TABLE IF NOT EXISTS public.user_todos (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
              title VARCHAR(500) NOT NULL,
              description TEXT,
              completed BOOLEAN DEFAULT false,
              priority VARCHAR(20) DEFAULT 'medium',
              due_date TIMESTAMP WITH TIME ZONE,
              category VARCHAR(100),
              tags JSONB DEFAULT '[]'::jsonb,
              sort_order INTEGER DEFAULT 0,
              completed_at TIMESTAMP WITH TIME ZONE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY IF NOT EXISTS "Users can view own todos"
              ON public.user_todos
              FOR SELECT
              USING (auth.uid() = user_id);
              
            CREATE POLICY IF NOT EXISTS "Users can insert own todos"
              ON public.user_todos
              FOR INSERT
              WITH CHECK (auth.uid() = user_id);
              
            CREATE POLICY IF NOT EXISTS "Users can update own todos"
              ON public.user_todos
              FOR UPDATE
              USING (auth.uid() = user_id);
              
            CREATE POLICY IF NOT EXISTS "Users can delete own todos"
              ON public.user_todos
              FOR DELETE
              USING (auth.uid() = user_id);
              
            GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_todos TO authenticated;
          `,
      });

      if (createError) {
        console.error("❌ Error creating table:", createError);
        console.log(
          "⚠️  You may need to manually execute the SQL file in Supabase dashboard",
        );
        console.log("📁 SQL file location:", sqlPath);
      } else {
        console.log("✅ user_todos table created successfully!");
      }
    } else if (checkError) {
      console.error("❌ Error checking table existence:", checkError);
    } else {
      console.log("✅ user_todos table already exists");
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

createTodosTable();
