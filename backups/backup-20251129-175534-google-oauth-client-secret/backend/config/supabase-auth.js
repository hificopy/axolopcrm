import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (two levels up from backend/config/)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Create Supabase client with authentication capabilities
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log(
  "🔑 Supabase Service Role Key:",
  supabaseServiceRoleKey
    ? "SET (" + supabaseServiceRoleKey.substring(0, 20) + "...)"
    : "NOT SET",
);
console.log("🔑 Supabase Anon Key:", supabaseAnonKey ? "SET" : "NOT SET");

// Verify the key by decoding the JWT payload (base64 middle section)
try {
  if (supabaseServiceRoleKey) {
    const payload = JSON.parse(
      Buffer.from(supabaseServiceRoleKey.split(".")[1], "base64").toString(),
    );
    console.log(
      "🔑 Service key role:",
      payload.role === "service_role"
        ? "service_role ✅"
        : `${payload.role} ❌ (should be service_role!)`,
    );
  }
} catch (e) {
  console.warn("🔑 Could not decode service key JWT:", e.message);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase environment variables not configured properly.");
  console.error(
    "   Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file",
  );
}

if (!supabaseServiceRoleKey) {
  console.error("⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is not set!");
  console.error("   Backend operations will be subject to RLS policies.");
  console.error(
    "   Get your service_role key from: Supabase Dashboard > Settings > API",
  );
}

// Create two clients:
// 1. Public client (anon key) - for client-side auth operations
// 2. Server client (service role) - for server-side operations with full access
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// CRITICAL: Service role key bypasses RLS - required for backend operations
// If not set, fall back to anon key (will hit RLS issues)
const supabaseServer =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : supabaseUrl && supabaseAnonKey
      ? createClient(supabaseUrl, supabaseAnonKey)
      : null;

// Function to get user from request (for middleware)
const getUserFromRequest = async (req) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);

    // Get user using server client (with service role key)
    if (supabaseServer) {
      const {
        data: { user },
        error,
      } = await supabaseServer.auth.getUser(token);

      console.log("[AUTH] Response:", {
        hasUser: !!user,
        userId: user?.id,
        hasError: !!error,
        errorMessage: error?.message,
        errorStatus: error?.status,
      });

      if (error || !user) {
        console.error("[AUTH] ❌ Authentication failed!");
        console.error("[AUTH] Error:", error?.message || "No user found");
        console.error("[AUTH] Error details:", JSON.stringify(error, null, 2));
        console.error(
          "[AUTH] Token (first 20 chars):",
          token?.substring(0, 20),
        );

        // When using service role key, we can verify access tokens directly
        // If token is invalid/expired, getUser will return an error
        return null;
      }

      console.log("[AUTH] ✅ User authenticated:", user.id);

      // Verify that the user object has necessary fields
      if (!user.id) {
        console.error(
          "Invalid user object: missing ID after successful authentication",
        );
        return null;
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || "USER",
      };

      return user;
    }

    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    // Provide a more general error response to avoid exposing internal details
    return null;
  }
};

// Optional authentication middleware (doesn't fail if no auth)
const optionalAuth = async (req, res, next) => {
  const user = await getUserFromRequest(req);
  if (user) {
    req.user = user;
  }
  next();
};

export { supabase, supabaseServer, getUserFromRequest, optionalAuth };
