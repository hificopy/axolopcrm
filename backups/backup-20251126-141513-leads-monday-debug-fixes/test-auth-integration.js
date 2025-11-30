import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fuclpfhitgwugxogxkmw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213dyIsImtleSI6ImU1NkFWT3JzTHJqSGtLZmF0R1Z6TzFhYmZIRk1nYlJkYm9RIiwidHlwZSI6ImFwaSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQifQ.5vDl2A9qCjEa_qn3pJgOJTHNynY4c7KJ8y3V7q3Y";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWithAuth() {
  console.log("🔐 Testing with authenticated session...");

  try {
    // Test 1: Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Session error:", sessionError.message);
      return;
    }

    if (!session) {
      console.log("⚠️  No active session found");
      console.log(
        "💡 To test with authentication, please sign in at http://localhost:3000/signin",
      );
      return;
    }

    console.log("✅ Session found for user:", session.user.email);
    console.log(
      "🔑 Token preview:",
      session.access_token.substring(0, 20) + "...",
    );

    // Test 2: Test APIs with the session token
    const authHeaders = {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };

    console.log("\n📋 Testing Todos API with auth...");
    const todosResponse = await fetch(
      "http://localhost:3002/api/v1/user-preferences/todos",
      {
        headers: authHeaders,
      },
    );

    if (todosResponse.ok) {
      const todosData = await todosResponse.json();
      console.log(
        "✅ Todos API working! Found",
        todosData.data?.length || 0,
        "todos",
      );
    } else {
      const error = await todosResponse.json();
      console.log("❌ Todos API error:", error.error || error.message);
    }

    console.log("\n👥 Testing Contacts API with auth...");
    const contactsResponse = await fetch(
      "http://localhost:3002/api/v1/contacts",
      {
        headers: authHeaders,
      },
    );

    if (contactsResponse.ok) {
      const contactsData = await contactsResponse.json();
      console.log(
        "✅ Contacts API working! Found",
        contactsData.data?.length || 0,
        "contacts",
      );
    } else {
      const error = await contactsResponse.json();
      console.log("❌ Contacts API error:", error.error || error.message);
    }

    console.log("\n🎉 Authentication test complete!");
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

testWithAuth();
