import { createClient } from "@supabase/supabase-js";

const supabaseSistemaUrl =
  process.env.NEXT_PUBLIC_SISTEMA_SUPABASE_URL!;

const supabaseSistemaAnonKey =
  process.env.NEXT_PUBLIC_SISTEMA_SUPABASE_ANON_KEY!;

export const supabaseSistema = createClient(
  supabaseSistemaUrl,
  supabaseSistemaAnonKey
);