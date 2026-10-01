import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nusvohecfgwtrpwcxwfd.supabase.co",
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const uid = "29b08290-3325-42cc-ae4e-3d840882c564";
const novaSenha = process.env.NOVA_SENHA;

if (!novaSenha) {
  console.error("ERRO: NOVA_SENHA não foi definida.");
  process.exit(1);
}

const { data, error } =
  await supabase.auth.admin.updateUserById(uid, {
    password: novaSenha,
  });

if (error) {
  console.error("ERRO AO ALTERAR A SENHA:");
  console.error(error.message);
  process.exit(1);
}

console.log("SENHA ALTERADA COM SUCESSO!");
console.log("UID:", data.user.id);
console.log("E-MAIL:", data.user.email);