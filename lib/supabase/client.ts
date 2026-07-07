import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseEnv } from "./env";

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = assertSupabaseEnv();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
