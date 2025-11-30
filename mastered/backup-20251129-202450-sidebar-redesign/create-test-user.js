// Create test user for health testing
import { createClient } from "@supabase/supabase-js";
import config from "./backend/config/app.config.js";

const supabase = createClient(config.supabase.url, config.supabase.anonKey);

async function createTestUser() {
  try {
    console.log("🔧 Creating test user for health testing...");

    const testUser = {
      email: "healthtest@example.com",
      password: "HealthTest123!",
      options: {
        data: {
          first_name: "Health",
          last_name: "Test",
          role: "admin",
        },
      },
    };

    // Try to create user
    const { data, error } = await supabase.auth.signUp(testUser);

    if (error) {
      if (error.message.includes("already registered")) {
        console.log("✅ Test user already exists");

        // Try to sign in to get token
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: testUser.email,
            password: testUser.password,
          });

        if (signInError) {
          console.log("❌ Test user sign in failed:", signInError.message);
          return null;
        }

        console.log("✅ Test user signed in successfully");
        return signInData.session.access_token;
      } else {
        console.log("❌ Test user creation failed:", error.message);
        return null;
      }
    }

    console.log("✅ Test user created successfully");
    return data.session.access_token;
  } catch (error) {
    console.error("❌ Error creating test user:", error.message);
    return null;
  }
}

createTestUser().then((token) => {
  if (token) {
    console.log("🎉 Test user token:", token.substring(0, 20) + "...");
  } else {
    console.log("❌ Failed to get test user token");
  }
});
