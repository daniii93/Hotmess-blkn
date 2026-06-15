import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "../../config/env";

export const createSupabaseBrowserClient = () => {
  const env = getPublicEnv();

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
};

