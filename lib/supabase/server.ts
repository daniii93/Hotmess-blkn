import { getSupabasePublicConfig } from "./client";

export type SupabaseServerConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
};

type RuntimeEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

const readRuntimeEnv = (): RuntimeEnv => {
  const maybeProcess = (globalThis as { process?: { env?: RuntimeEnv } }).process;
  return maybeProcess?.env ?? {};
};

export const getSupabaseServerConfig = (): SupabaseServerConfig | null => {
  const publicConfig = getSupabasePublicConfig();

  if (!publicConfig) {
    return null;
  }

  return {
    ...publicConfig,
    serviceRoleKey: readRuntimeEnv().SUPABASE_SERVICE_ROLE_KEY,
  };
};

export const isSupabaseServerConfigured = (): boolean => getSupabaseServerConfig() !== null;
