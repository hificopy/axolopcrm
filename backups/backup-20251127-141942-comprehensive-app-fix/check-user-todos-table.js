import { supabase } from "/app/config/supabase-client.js";

async function checkAndFixTable() {
  try {
    console.log("Checking user_todos table structure...");

    // Use raw SQL query to check table structure
    const { data: tableInfo, error: tableError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'user_todos' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `,
      },
    );

    if (tableError) {
      console.log("Error checking table:", tableError);

      // Try direct approach - assume table doesn't exist and try to create it
      console.log("Attempting to create user_todos table...");

      const { error: createError } = await supabase.rpc("exec_sql", {
        sql: `
            CREATE TABLE IF NOT EXISTS user_todos (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
              title TEXT NOT NULL,
              description TEXT,
              completed BOOLEAN DEFAULT FALSE,
              priority INTEGER DEFAULT 1,
              sort_order INTEGER DEFAULT 0,
              category TEXT DEFAULT 'general',
              due_date TIMESTAMPTZ,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_user_todos_user_id ON user_todos(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_todos_completed ON user_todos(completed);
            CREATE INDEX IF NOT EXISTS idx_user_todos_sort_order ON user_todos(user_id, sort_order);
          `,
      });

      if (createError) {
        console.log("Error creating table:", createError);

        // If table exists but missing sort_order, add it
        console.log("Attempting to add sort_order column...");

        const { error: addColumnError } = await supabase.rpc("exec_sql", {
          sql: `
              ALTER TABLE user_todos 
              ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
              
              CREATE INDEX IF NOT EXISTS idx_user_todos_sort_order ON user_todos(user_id, sort_order);
            `,
        });

        if (addColumnError) {
          console.log("Error adding column:", addColumnError);
        } else {
          console.log("sort_order column added successfully!");
        }
      } else {
        console.log("Table user_todos created successfully!");
      }
    } else {
      console.log("Table exists. Current structure:", tableInfo);
    }

    // Test the todos API endpoint
    console.log("\nTesting todos API...");
    const testResponse = await fetch("http://localhost:3002/api/todos", {
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json",
      },
    });

    if (testResponse.ok) {
      console.log("✅ Todos API is working!");
    } else {
      console.log("❌ Todos API returned error:", testResponse.status);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkAndFixTable();
