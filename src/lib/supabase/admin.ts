import { createClient } from "@supabase/supabase-js";
import { getPublicEnv, getServerEnv } from "../../config/env";

export const createSupabaseAdminClient = () => {
  const publicEnv = getPublicEnv();
  const serverEnv = getServerEnv();

  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

