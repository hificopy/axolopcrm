/**
 * Create Test User Script
 * Creates a test user with email test@test.com and password in Supabase
 * This user will always go through onboarding every time they log out
 */

import { createClient } from "@supabase/supabase-js";

// Load environment variables
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://fuclpfhitgwugxogxkmw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "sb_secret_Y0pdE6KRUTcbDmFe1lqWFw_JapIHko3";

async function createTestUser() {
  console.log("🔐 Creating test user for Axolop CRM...\n");

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required",
    );
    console.log("📋 Please set SUPABASE_SERVICE_ROLE_KEY in your .env file");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const email = "test@test.com";
  const password = "TestPassword123!";

  try {
    // Check if user already exists
    console.log(`🔍 Checking if user ${email} already exists...`);
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .single();

    if (existingUser && !existingUserError) {
      console.log(
        `✅ User ${email} already exists with ID: ${existingUser.id}`,
      );
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      console.log(
        `🔄 This user will always go through onboarding every time they log out`,
      );
      return;
    }

    // Create the user account with Supabase Auth
    console.log(`🔐 Creating Supabase Auth user...`);
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Skip email confirmation for testing
        user_metadata: {
          full_name: "Test User",
          first_name: "Test",
          last_name: "User",
        },
      });

    if (authError) {
      console.error("❌ Error creating auth user:", authError.message);
      process.exit(1);
    }

    const userId = authData.user.id;
    console.log(`✅ Auth user created successfully with ID: ${userId}`);

    // Insert user profile data into the users table
    console.log(`📋 Adding user profile to database...`);
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          email: email,
          name: "Test User",
          first_name: "Test",
          last_name: "User",
          email_verified: true,
        },
      ])
      .select()
      .single();

    if (profileError && profileError.code !== "23505") {
      // 23505 is unique violation, which we can ignore
      console.error("❌ Error creating user profile:", profileError.message);
      process.exit(1);
    }

    console.log(`✅ User profile created successfully!`);

    // Update the user to ensure onboarding is not completed
    const { data: updatedData, error: updateError } = await supabase
      .from("users")
      .update({
        onboarding_completed: false,
        onboarding_completed_at: null,
      })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error updating user profile:", updateError.message);
      process.exit(1);
    }

    console.log("\n🎉 Test user created successfully!");
    console.log("----------------------------------------");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(
      `🔄 This user will always go through onboarding every time they log out`,
    );
    console.log("----------------------------------------");
    console.log("\n💡 Tip: Use these credentials to test onboarding flows");
    console.log("   Every logout will reset the onboarding status");
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    process.exit(1);
  }
}

// Run the function if this file is executed directly
createTestUser();

export default createTestUser;
