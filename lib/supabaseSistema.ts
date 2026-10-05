import { createBrowserClient } from "@supabase/ssr";

const supabaseSistemaUrl =
  process.env.NEXT_PUBLIC_SISTEMA_SUPABASE_URL!;

const supabaseSistemaAnonKey =
  process.env.NEXT_PUBLIC_SISTEMA_SUPABASE_ANON_KEY!;

export const supabaseSistema = createBrowserClient(
  supabaseSistemaUrl,
  supabaseSistemaAnonKey
);