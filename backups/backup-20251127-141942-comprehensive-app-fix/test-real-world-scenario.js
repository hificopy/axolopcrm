import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fuclpfhitgwugxogxkmw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213dyIsImtleSI6ImU1NkFWT3JzTHJqSGtLZmF0R1Z6TzFhYmZIRk1nYlJkYm9RIiwidHlwZSI6ImFwaSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQifQ.5vDl2A9qCjEa_qn3pJgOJTHNynY4c7KJ8y3V7q3Y";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealWorldScenario() {
  console.log("🌍 REAL WORLD SCENARIO TEST");
  console.log("================================");

  try {
    // Step 1: Try to get current session (like frontend does)
    console.log("\n1. Checking for existing session...");
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
      console.log("💡 This simulates a user who is not signed in");
      console.log(
        "📝 Expected behavior: Should get auth errors when trying to access contacts/todos",
      );

      // Test what happens when frontend tries to access contacts without auth
      console.log(
        "\n2. Testing contacts API without auth (simulating frontend)...",
      );
      const contactsResponse = await fetch(
        "http://localhost:3002/api/v1/contacts",
      );

      if (contactsResponse.ok) {
        console.log("❌ UNEXPECTED: Contacts API worked without auth!");
      } else {
        const error = await contactsResponse.json();
        console.log("✅ EXPECTED: Contacts API properly requires auth");
        console.log("   Error:", error.error);
      }

      console.log(
        "\n3. Testing todos API without auth (simulating frontend)...",
      );
      const todosResponse = await fetch(
        "http://localhost:3002/api/v1/user-preferences/todos",
      );

      if (todosResponse.ok) {
        console.log("❌ UNEXPECTED: Todos API worked without auth!");
      } else {
        const error = await todosResponse.json();
        console.log("✅ EXPECTED: Todos API properly requires auth");
        console.log("   Error:", error.error);
      }

      console.log(
        "\n💡 SOLUTION: User needs to sign in at http://localhost:3000/signin",
      );
      console.log("🔗 Then the frontend will have a valid session token");
    } else {
      console.log("✅ Session found for user:", session.user.email);
      console.log(
        "🔑 Token preview:",
        session.access_token.substring(0, 20) + "...",
      );

      // Test with valid session
      const authHeaders = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };

      console.log("\n2. Testing contacts API WITH valid auth...");
      const contactsAuthResponse = await fetch(
        "http://localhost:3002/api/v1/contacts",
        {
          headers: authHeaders,
        },
      );

      if (contactsAuthResponse.ok) {
        const contactsData = await contactsAuthResponse.json();
        console.log("✅ SUCCESS: Contacts API works with auth!");
        console.log("   Found", contactsData.data?.length || 0, "contacts");
        console.log("   Response structure:", Object.keys(contactsData));

        if (contactsData.data && contactsData.data.length > 0) {
          console.log("   Sample contact:", {
            id: contactsData.data[0].id,
            name: `${contactsData.data[0].first_name} ${contactsData.data[0].last_name}`,
            email: contactsData.data[0].email,
          });
        }
      } else {
        const error = await contactsAuthResponse.json();
        console.log("❌ FAILED: Contacts API error with valid auth:", error);
      }

      console.log("\n3. Testing todos API WITH valid auth...");
      const todosAuthResponse = await fetch(
        "http://localhost:3002/api/v1/user-preferences/todos",
        {
          headers: authHeaders,
        },
      );

      if (todosAuthResponse.ok) {
        const todosData = await todosAuthResponse.json();
        console.log("✅ SUCCESS: Todos API works with auth!");
        console.log("   Found", todosData.data?.length || 0, "todos");
        console.log("   Response structure:", Object.keys(todosData));
      } else {
        const error = await todosAuthResponse.json();
        console.log("❌ FAILED: Todos API error with valid auth:", error);
      }
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

testRealWorldScenario();
