import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

const browserEnvironmentSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

let client: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (client) {
    return client;
  }

  const result = browserEnvironmentSchema.safeParse(import.meta.env);

  if (!result.success) {
    throw new Error(
      'Supabase 环境变量缺失或无效，请根据 .env.example 配置 .env.local。',
    );
  }

  client = createClient(
    result.data.VITE_SUPABASE_URL,
    result.data.VITE_SUPABASE_ANON_KEY,
  );

  return client;
}
