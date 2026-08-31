"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UploadCapaProps {
  onUpload: (url: string) => void;
}

export default function UploadCapa({
  onUpload,
}: UploadCapaProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);

  const [enviando, setEnviando] = useState(false);

  async function prepararImagem(
    arquivo: File
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(arquivo);
      const imagem = new Image();

      imagem.onload = () => {
        try {
          const larguraMaxima = 2000;
          const alturaMaxima = 2000;

          let largura = imagem.width;
          let altura = imagem.height;

          if (
            largura > larguraMaxima ||
            altura > alturaMaxima
          ) {
            const proporcao = Math.min(
              larguraMaxima / largura,
              alturaMaxima / altura
            );

            largura = Math.round(
              largura * proporcao
            );

            altura = Math.round(
              altura * proporcao
            );
          }

          const canvas =
            document.createElement("canvas");

          canvas.width = largura;
          canvas.height = altura;

          const contexto =
            canvas.getContext("2d");

          if (!contexto) {
            URL.revokeObjectURL(url);

            reject(
              new Error(
                "Não foi possível preparar a imagem."
              )
            );

            return;
          }

          contexto.imageSmoothingEnabled = true;
          contexto.imageSmoothingQuality = "high";

          contexto.drawImage(
            imagem,
            0,
            0,
            largura,
            altura
          );

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);

              if (!blob) {
                reject(
                  new Error(
                    "Não foi possível preparar a imagem."
                  )
                );

                return;
              }

              resolve(blob);
            },
            "image/jpeg",
            0.92
          );
        } catch (erro) {
          URL.revokeObjectURL(url);
          reject(erro);
        }
      };

      imagem.onerror = () => {
        URL.revokeObjectURL(url);

        reject(
          new Error(
            "Não foi possível processar essa imagem."
          )
        );
      };

      imagem.src = url;
    });
  }

  async function enviarImagem(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivo =
      event.target.files?.[0];

    if (!arquivo) return;

    setEnviando(true);

    try {
      if (
        !arquivo.type.startsWith("image/")
      ) {
        throw new Error(
          "O arquivo selecionado não é uma imagem."
        );
      }

      const {
        data: usuarioData,
        error: usuarioError,
      } = await supabase.auth.getUser();

      if (
        usuarioError ||
        !usuarioData.user
      ) {
        throw new Error(
          "Sua sessão expirou. Entre novamente no sistema."
        );
      }

      const imagemPreparada =
        await prepararImagem(arquivo);

      const nomeArquivo =
        `capa-${Date.now()}-${crypto.randomUUID()}.jpg`;

      const { error } =
        await supabase.storage
          .from("capas")
          .upload(
            nomeArquivo,
            imagemPreparada,
            {
              contentType: "image/jpeg",
              cacheControl: "3600",
              upsert: false,
            }
          );

      if (error) {
        throw error;
      }

      const { data } =
        supabase.storage
          .from("capas")
          .getPublicUrl(nomeArquivo);

      if (!data.publicUrl) {
        throw new Error(
          "Não foi possível gerar o endereço da capa."
        );
      }

      onUpload(data.publicUrl);

    } catch (error: any) {
      console.log(
        "ERRO AO ENVIAR CAPA:",
        error
      );

      alert(
        `Erro ao enviar imagem:\n\n${
          error?.message ||
          "Erro desconhecido."
        }`
      );

    } finally {
      setEnviando(false);

      if (cameraRef.current) {
        cameraRef.current.value = "";
      }

      if (galeriaRef.current) {
        galeriaRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">

      {/* CÂMERA */}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={enviarImagem}
        className="hidden"
      />

      <button
        type="button"
        disabled={enviando}
        onClick={() =>
          cameraRef.current?.click()
        }
        className="
          w-full
          bg-green-600
          hover:bg-green-700
          disabled:bg-gray-400
          disabled:cursor-not-allowed
          text-white
          rounded-xl
          py-3.5
          font-bold
          transition
        "
      >
        {enviando
          ? "📤 Enviando imagem..."
          : "📷 Tirar foto da capa"}
      </button>

      {/* GALERIA */}

      <input
        ref={galeriaRef}
        type="file"
        accept="image/*"
        onChange={enviarImagem}
        className="hidden"
      />

      <button
        type="button"
        disabled={enviando}
        onClick={() =>
          galeriaRef.current?.click()
        }
        className="
          w-full
          bg-blue-600
          hover:bg-blue-700
          disabled:bg-gray-400
          disabled:cursor-not-allowed
          text-white
          rounded-xl
          py-3.5
          font-bold
          transition
        "
      >
        🖼️ Escolher imagem da galeria
      </button>

      <p className="text-xs text-gray-500 text-center">
        Para melhor qualidade, prefira uma imagem
        nítida da capa.
      </p>

    </div>
  );
}