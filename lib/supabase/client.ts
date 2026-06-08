export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

type RuntimeEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

const readRuntimeEnv = (): RuntimeEnv => {
  const maybeProcess = (globalThis as { process?: { env?: RuntimeEnv } }).process;
  return maybeProcess?.env ?? {};
};

export const getSupabasePublicConfig = (): SupabasePublicConfig | null => {
  const env = readRuntimeEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
};

export const isSupabasePublicConfigured = (): boolean => getSupabasePublicConfig() !== null;
