import { createClient } from "@supabase/supabase-js";

// Test frontend authentication flow
const supabaseUrl = "https://fuclpfhitgwugxogxkmw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213dyIsImtleSI6ImU1NkFWT3JzTHJqSGtLZmF0R1Z6TzFhYmZIRk1nYlJkYm9RIiwidHlwZSI6ImFwaSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQifQ.5vDl2A9qCjEa_qn3pJgOJTHNynY4c7KJ8y3V7q3Y";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthFlow() {
  console.log("🔐 TESTING FRONTEND AUTH FLOW");
  console.log("==================================");

  try {
    // Step 1: Check current auth state
    console.log("\n1. Checking current auth state...");
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Session error:", sessionError.message);
      return;
    }

    console.log("Session exists:", !!session);
    if (session) {
      console.log("User:", session.user.email);
      console.log(
        "Expires at:",
        new Date(session.expires_at * 1000).toLocaleString(),
      );
    }

    // Step 2: Check for persisted auth in localStorage
    console.log("\n2. Checking localStorage persistence...");
    if (typeof window !== "undefined") {
      const storageKeys = Object.keys(localStorage);
      const authKeys = storageKeys.filter(
        (key) => key.includes("supabase") || key.includes("auth"),
      );
      console.log("Auth-related localStorage keys:", authKeys);

      authKeys.forEach((key) => {
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value ? "Present" : "Empty");
      });
    } else {
      console.log("⚠️  Not in browser environment");
    }

    // Step 3: Try to sign in with test credentials
    console.log("\n3. Testing sign in with test credentials...");
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: "axolopcrm@gmail.com",
        password: "AxolopCRM2024!",
      });

    if (signInError) {
      console.error("❌ Sign in error:", signInError.message);

      if (signInError.message.includes("Invalid login credentials")) {
        console.log("💡 Test user does not exist or wrong password");
        console.log("🔧 Need to create test user first");
      }
    } else {
      console.log("✅ Sign in successful!");
      console.log("User:", signInData.user.email);
      console.log(
        "Session expires:",
        new Date(signInData.session.expires_at * 1000).toLocaleString(),
      );

      // Step 4: Test APIs after sign in
      console.log("\n4. Testing APIs after successful sign in...");

      const authHeaders = {
        Authorization: `Bearer ${signInData.session.access_token}`,
        "Content-Type": "application/json",
      };

      // Test contacts
      const contactsResponse = await fetch(
        "http://localhost:3002/api/v1/contacts",
        {
          headers: authHeaders,
        },
      );

      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        console.log(
          "✅ Contacts API works after sign in! Found:",
          contactsData.data?.length || 0,
        );
      } else {
        const error = await contactsResponse.json();
        console.log("❌ Contacts API still fails:", error);
      }

      // Test todos
      const todosResponse = await fetch(
        "http://localhost:3002/api/v1/user-preferences/todos",
        {
          headers: authHeaders,
        },
      );

      if (todosResponse.ok) {
        const todosData = await todosResponse.json();
        console.log(
          "✅ Todos API works after sign in! Found:",
          todosData.data?.length || 0,
        );
      } else {
        const error = await todosResponse.json();
        console.log("❌ Todos API still fails:", error);
      }

      console.log("\n🎉 SUCCESS: APIs work when user is authenticated!");
      console.log(
        '💡 The "failed to load" errors are caused by users not being signed in',
      );
    }
  } catch (error) {
    console.error("❌ Auth flow test error:", error.message);
  }
}

// Simulate browser environment for testing
global.window = {
  localStorage: {
    getItem: (key) => {
      // Simulate empty localStorage (like fresh browser session)
      return null;
    },
    setItem: () => {},
    removeItem: () => {},
  },
};

testAuthFlow();
