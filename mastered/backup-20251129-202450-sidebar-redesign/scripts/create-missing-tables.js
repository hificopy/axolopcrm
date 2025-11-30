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
    const teamsSQL = `
      CREATE TABLE IF NOT EXISTS public.teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Team members can view own teams" ON public.teams FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()
        )
      );
      
      CREATE POLICY "Team admins can manage teams" ON public.teams FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.team_id = teams.id AND tm.user_id = auth.uid() AND tm.role IN ('admin', 'owner')
        )
      );
      
      CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON public.teams(organization_id);
    `;

    // Team members table
    const teamMembersSQL = `
      CREATE TABLE IF NOT EXISTS public.team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        permissions JSONB DEFAULT '[]',
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, team_id)
      );
      
      ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view own team memberships" ON public.team_members FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert own team memberships" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update own team memberships" ON public.team_members FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY "Users can delete own team memberships" ON public.team_members FOR DELETE USING (auth.uid() = user_id);
      
      CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
    `;

    // Roles table
    const rolesSQL = `
      CREATE TABLE IF NOT EXISTS public.roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        permissions JSONB DEFAULT '[]',
        is_system_role BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(organization_id, name)
      );
      
      ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view organization roles" ON public.roles FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.organization_id = roles.organization_id AND tm.user_id = auth.uid() AND tm.role IN ('admin', 'owner')
        )
      );
      
      CREATE POLICY "Organization admins can manage roles" ON public.roles FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.organization_id = roles.organization_id AND tm.user_id = auth.uid() AND tm.role IN ('admin', 'owner')
        )
      );
      
      CREATE INDEX IF NOT EXISTS idx_roles_organization_id ON public.roles(organization_id);
    `;

    // Permissions table
    const permissionsSQL = `
      CREATE TABLE IF NOT EXISTS public.permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        resource TEXT NOT NULL,
        action TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Authenticated users can view permissions" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');
      
      CREATE INDEX IF NOT EXISTS idx_permissions_resource ON public.permissions(resource);
      CREATE INDEX IF NOT EXISTS idx_permissions_action ON public.permissions(action);
    `;

    // Execute table creation
    const tables = [
      { name: "teams", sql: teamsSQL },
      { name: "team_members", sql: teamMembersSQL },
      { name: "roles", sql: rolesSQL },
      { name: "permissions", sql: permissionsSQL },
    ];

    for (const table of tables) {
      try {
        console.log(`Creating ${table.name} table...`);

        const { error } = await supabase.rpc("exec", {
          sql: table.sql,
        });

        if (error) {
          console.error(`❌ Error creating ${table.name} table:`, error);
        } else {
          console.log(`✅ ${table.name} table created successfully`);
        }
      } catch (error) {
        console.error(`❌ Error creating ${table.name} table:`, error);
      }
    }

    console.log("🎉 Missing tables creation completed!");
  } catch (error) {
    console.error("❌ Error creating missing tables:", error);
  }
}

createMissingTables();
