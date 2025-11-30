/**
 * Supabase Client Export
 *
 * This file re-exports the Supabase client from the singleton service.
 * This maintains backward compatibility with components that import from this location.
 */

import supabaseSingleton from "../services/supabase-singleton";

// Export the supabase client from the singleton
export const supabase = supabaseSingleton.getClient();

// Also export the singleton instance for advanced usage
export default supabaseSingleton;
