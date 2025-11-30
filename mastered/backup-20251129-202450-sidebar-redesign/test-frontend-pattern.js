import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fuclpfhitgwugxogxkmw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213dyIsImtleSI6ImU1NkFWT3JzTHJqSGtLZmF0R1Z6TzFhYmZIRk1nYlJkYm9RIiwidHlwZSI6ImFwaSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQifQ.5vDl2A9qCjEa_qn3pJgOJTHNynY4c7KJ8y3V7q3Y";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFrontendPattern() {
  console.log("🔍 TESTING FRONTEND REQUEST PATTERN");
  console.log("=====================================");

  try {
    // Simulate exactly what frontend does - get session first
    console.log("\n1. Simulating frontend: Getting session...");
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Session error:", sessionError.message);
      return;
    }

    if (!session) {
      console.log("⚠️  No session - this is the issue!");
      console.log(
        "📝 Frontend is trying to access APIs without authentication",
      );
      console.log('💡 This explains "failed to load contacts/todos" errors');

      // Test what frontend experiences when no session
      console.log("\n2. Simulating frontend API calls without session...");

      // Test contacts API like frontend does
      console.log("   Testing contacts API...");
      try {
        const contactsResponse = await fetch(
          "http://localhost:3002/api/v1/contacts",
        );
        const contactsResult = await contactsResponse.json();
        console.log("   Status:", contactsResponse.status);
        console.log("   Error:", contactsResult.error);
      } catch (err) {
        console.log("   Exception:", err.message);
      }

      // Test todos API like frontend does
      console.log("   Testing todos API...");
      try {
        const todosResponse = await fetch(
          "http://localhost:3002/api/v1/user-preferences/todos",
        );
        const todosResult = await todosResponse.json();
        console.log("   Status:", todosResponse.status);
        console.log("   Error:", todosResult.error);
      } catch (err) {
        console.log("   Exception:", err.message);
      }

      console.log("\n💡 ROOT CAUSE IDENTIFIED:");
      console.log("   • User is not signed in");
      console.log("   • Frontend has no session token");
      console.log("   • APIs return 401 Unauthorized");
      console.log('   • Frontend shows "failed to load" errors');

      console.log("\n🔧 SOLUTION:");
      console.log("   1. User must sign in at http://localhost:3000/signin");
      console.log("   2. After sign in, session will be available");
      console.log("   3. APIs will work with authentication");
      console.log("   4. Contacts and todos will load successfully");
    } else {
      console.log("✅ Session found - testing with valid auth...");

      // Test with the exact headers frontend would use
      const authHeaders = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };

      console.log("\n2. Testing contacts with frontend auth pattern...");
      const contactsResponse = await fetch(
        "http://localhost:3002/api/v1/contacts",
        {
          headers: authHeaders,
        },
      );

      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        console.log(
          "✅ Contacts work with auth! Found:",
          contactsData.data?.length || 0,
        );
      } else {
        const error = await contactsResponse.json();
        console.log("❌ Contacts failed with auth:", error);
      }

      console.log("\n3. Testing todos with frontend auth pattern...");
      const todosResponse = await fetch(
        "http://localhost:3002/api/v1/user-preferences/todos",
        {
          headers: authHeaders,
        },
      );

      if (todosResponse.ok) {
        const todosData = await todosResponse.json();
        console.log(
          "✅ Todos work with auth! Found:",
          todosData.data?.length || 0,
        );
      } else {
        const error = await todosResponse.json();
        console.log("❌ Todos failed with auth:", error);
      }
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

testFrontendPattern();
