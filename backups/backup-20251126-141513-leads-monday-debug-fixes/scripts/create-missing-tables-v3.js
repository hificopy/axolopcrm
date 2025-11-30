import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});

async function createMissingTables() {
  try {
    console.log("🔧 Creating missing database tables...");

    // Teams table
    console.log("Creating teams table...");
    const { error: teamsError } = await supabase
      .from("teams")
      .select("id")
      .limit(1);

    if (teamsError && teamsError.code !== "PGRST116") {
      console.log("Teams table already exists");
    } else {
      const { error: createTeamsError } = await supabase.from("teams").insert({
        id: crypto.randomUUID(),
        organization_id: crypto.randomUUID(),
        name: "Default Team",
        description: "Default team for organization",
        created_at: new Date().toISOString(),
      });

      if (createTeamsError) {
        console.error("Error creating teams table:", createTeamsError);
      } else {
        console.log("✅ Teams table created successfully");
      }
    }

    // Team members table
    console.log("Creating team_members table...");
    const { error: teamMembersError } = await supabase
      .from("team_members")
      .select("id")
      .limit(1);

    if (teamMembersError && teamMembersError.code !== "PGRST116") {
      console.log("Team members table already exists");
    } else {
      const { error: createTeamMembersError } = await supabase
        .from("team_members")
        .insert({
          id: crypto.randomUUID(),
          user_id: crypto.randomUUID(),
          team_id: crypto.randomUUID(),
          role: "member",
          permissions: [],
          joined_at: new Date().toISOString(),
        });

      if (createTeamMembersError) {
        console.error(
          "Error creating team_members table:",
          createTeamMembersError,
        );
      } else {
        console.log("✅ Team members table created successfully");
      }
    }

    // Roles table
    console.log("Creating roles table...");
    const { error: rolesError } = await supabase
      .from("roles")
      .select("id")
      .limit(1);

    if (rolesError && rolesError.code !== "PGRST116") {
      console.log("Roles table already exists");
    } else {
      const { error: createRolesError } = await supabase.from("roles").insert({
        id: crypto.randomUUID(),
        organization_id: crypto.randomUUID(),
        name: "Admin",
        description: "Administrator role with full permissions",
        permissions: ["all"],
        is_system_role: true,
        created_at: new Date().toISOString(),
      });

      if (createRolesError) {
        console.error("Error creating roles table:", createRolesError);
      } else {
        console.log("✅ Roles table created successfully");
      }
    }

    // Permissions table
    console.log("Creating permissions table...");
    const { error: permissionsError } = await supabase
      .from("permissions")
      .select("id")
      .limit(1);

    if (permissionsError && permissionsError.code !== "PGRST116") {
      console.log("Permissions table already exists");
    } else {
      const { error: createPermissionsError } = await supabase
        .from("permissions")
        .insert({
          id: crypto.randomUUID(),
          name: "read",
          resource: "all",
          action: "read",
          description: "Read access to all resources",
          created_at: new Date().toISOString(),
        });

      if (createPermissionsError) {
        console.error(
          "Error creating permissions table:",
          createPermissionsError,
        );
      } else {
        console.log("✅ Permissions table created successfully");
      }
    }

    console.log("🎉 Missing tables creation completed!");
  } catch (error) {
    console.error("❌ Error creating missing tables:", error);
  }
}

createMissingTables();
