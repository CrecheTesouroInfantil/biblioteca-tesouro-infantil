"use client";

import { useRef } from "react";
import { supabase } from "@/lib/supabase";

interface UploadCapaProps {
  onUpload: (url: string) => void;
}

export default function UploadCapa({ onUpload }: UploadCapaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function enviarImagem(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    const nomeArquivo = `${Date.now()}-${arquivo.name}`;

    const { error } = await supabase.storage
      .from("capas")
      .upload(nomeArquivo, arquivo);

    if (error) {
      alert("Erro ao enviar imagem.");
      console.log(error);
      return;
    }

    const { data } = supabase.storage
      .from("capas")
      .getPublicUrl(nomeArquivo);

    onUpload(data.publicUrl);
  }

  return (
    <div className="space-y-3">

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={enviarImagem}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-bold"
      >
        📷 Tirar foto ou escolher imagem
      </button>

    </div>
  );
}