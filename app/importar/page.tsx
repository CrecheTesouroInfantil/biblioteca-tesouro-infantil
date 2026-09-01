"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface LivroImportado {
  nome: string;
  autor: string;
  categoria: string;
  faixa_etaria: string;
  tema: string;
  quantidade: number;
  local: string;
  capa: string;
}

const categorias = [
  "FORMAS",
  "CORES",
  "NÚMEROS E QUANTIDADES",
  "ALFABETO E LETRAS",
  "ANIMAIS",
  "NATUREZA",
  "MEIO AMBIENTE",
  "CORPO HUMANO",
  "EMOÇÕES",
  "FAMÍLIA",
  "AMIZADE",
  "IDENTIDADE",
  "INCLUSÃO E DIFERENÇAS",
  "ALIMENTAÇÃO",
  "HIGIENE",
  "TRÂNSITO",
  "PROFISSÕES",
  "MORADIA",
  "BRINCADEIRAS",
  "IMAGINAÇÃO",
  "MÚSICA E RIMAS",
  "HISTÓRIAS BÍBLICAS",
  "DATAS COMEMORATIVAS",
  "VALORES E CONVIVÊNCIA",
  "OUTROS",
];

const faixas = [
  "BERÇÁRIO",
  "MATERNAL I",
  "MATERNAL II",
  "PRÉ-ESCOLA",
  "TODAS",
];

const locais = [
  "CAIXA 1",
  "CAIXA 2",
  "CAIXA 3",
];

export default function ImportarLivros() {
  const [texto, setTexto] = useState("");
  const [livros, setLivros] = useState<LivroImportado[]>([]);
  const [importando, setImportando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const [verificandoUsuario, setVerificandoUsuario] =
    useState(true);

  const [usuarioAutenticado, setUsuarioAutenticado] =
    useState(false);

  useEffect(() => {
    verificarUsuario();
  }, []);

  async function verificarUsuario() {
    setVerificandoUsuario(true);

    const { data, error } =
      await supabase.auth.getUser();

    if (error || !data.user) {
      setUsuarioAutenticado(false);
    } else {
      setUsuarioAutenticado(true);
    }

    setVerificandoUsuario(false);
  }

  function normalizarFaixas(valor: string) {
    const faixa = valor
      .trim()
      .toUpperCase();

    if (!faixa) {
      return "TODAS";
    }

    if (faixa === "TODAS") {
      return "TODAS";
    }

    const faixasSelecionadas = faixa
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) =>
        faixas.includes(item)
      )
      .filter((item) => item !== "TODAS");

    if (faixasSelecionadas.length === 0) {
      return "TODAS";
    }

    return faixas
      .filter((item) =>
        faixasSelecionadas.includes(item)
      )
      .filter((item) => item !== "TODAS")
      .join(", ");
  }

  function normalizarCategoria(valor: string) {
    const categoria = valor
      .trim()
      .toUpperCase();

    const encontrada = categorias.find(
      (item) =>
        item.toUpperCase() === categoria
    );

    return encontrada || categoria;
  }

  function normalizarLocal(valor: string) {
    const local = valor
      .trim()
      .toUpperCase();

    const encontrado = locais.find(
      (item) =>
        item.toUpperCase() === local
    );

    return encontrado || "CAIXA 1";
  }

  function analisarLista() {
    setMensagem("");

    const linhas = texto
      .split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean);

    if (linhas.length === 0) {
      alert("Cole pelo menos um livro.");
      return;
    }

    const resultado: LivroImportado[] = [];

    for (const linha of linhas) {
      const partes = linha
        .split(";")
        .map((item) => item.trim());

      const [
        nome = "",
        autor = "",
        categoria = "OUTROS",
        faixa_etaria = "TODAS",
        tema = "",
        quantidade = "1",
        local = "CAIXA 1",
        capa = "",
      ] = partes;

      if (!nome) continue;

      resultado.push({
        nome: nome.toUpperCase(),
        autor: autor.toUpperCase(),
        categoria: normalizarCategoria(
          categoria
        ),
        faixa_etaria:
          normalizarFaixas(faixa_etaria),
        tema: tema.toUpperCase(),
        quantidade: Math.max(
          1,
          Number(quantidade) || 1
        ),
        local: normalizarLocal(local),
        capa,
      });
    }

    setLivros(resultado);

    if (resultado.length > 0) {
      setMensagem(
        `${resultado.length} livro(s) preparado(s) para importação.`
      );
    }
  }

  async function importarLivros() {
    if (livros.length === 0) {
      alert(
        "Primeiro prepare a lista de livros."
      );
      return;
    }

    setImportando(true);
    setMensagem("");

    try {
      const {
        data: usuarioData,
        error: usuarioError,
      } = await supabase.auth.getUser();

      if (
        usuarioError ||
        !usuarioData.user
      ) {
        throw new Error(
          "Você não está autenticado. Entre no sistema novamente antes de importar os livros."
        );
      }

      const dados = livros.map((livro) => ({
        nome: livro.nome.trim(),
        autor: livro.autor.trim(),
        categoria:
          livro.categoria || "OUTROS",
        faixa_etaria:
          livro.faixa_etaria || "TODAS",
        tema:
          livro.tema.trim() || null,
        quantidade: livro.quantidade,
        local: livro.local || "CAIXA 1",
        capa:
          livro.capa.trim() || null,
      }));

      const {
        data,
        error,
      } = await supabase
        .from("livros")
        .insert(dados)
        .select("id");

      if (error) {
        console.log(
          "ERRO SUPABASE:",
          error
        );

        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(
          "Nenhum livro foi cadastrado."
        );
      }

      for (const livro of data) {
        const codigo =
          `LIV-${String(
            livro.id
          ).padStart(6, "0")}`;

        const {
          error: erroCodigo,
        } = await supabase
          .from("livros")
          .update({ codigo })
          .eq("id", livro.id);

        if (erroCodigo) {
          console.log(
            "Erro ao gerar código:",
            erroCodigo
          );
        }
      }

      setMensagem(
        `✅ ${data.length} livro(s) cadastrado(s) com sucesso!`
      );

      setTexto("");
      setLivros([]);

    } catch (error: any) {
      console.log(
        "ERRO AO IMPORTAR:",
        error
      );

      setMensagem(
        error?.message ||
          "Erro ao importar os livros."
      );

    } finally {
      setImportando(false);
    }
  }

  if (verificandoUsuario) {
    return (
      <main className="min-h-screen bg-blue-50 flex items-center justify-center p-6">

        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">

          <p className="text-lg font-bold text-gray-700">
            🔐 Verificando acesso...
          </p>

          <p className="text-sm text-gray-500 mt-2">
            Só um momentinho.
          </p>

        </div>

      </main>
    );
  }

  if (!usuarioAutenticado) {
    return (
      <main className="min-h-screen bg-blue-50 flex items-center justify-center p-6">

        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">

          <div className="text-5xl mb-4">
            🔐
          </div>

          <h1 className="text-2xl font-extrabold text-gray-800">
            Acesso necessário
          </h1>

          <p className="text-gray-500 mt-3">
            Você precisa estar conectado ao sistema
            para importar livros.
          </p>

          <Link
            href="/login"
            className="
              inline-flex
              justify-center
              w-full
              mt-6
              bg-blue-600
              hover:bg-blue-700
              text-white
              rounded-xl
              py-3
              font-bold
            "
          >
            Entrar no sistema
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blue-50 p-4 md:p-8">

      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">

          {/* CABEÇALHO */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

            <div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700">
                📥 Importar livros
              </h1>

              <p className="text-gray-500 mt-2">
                Cadastre vários livros de uma vez.
              </p>

            </div>

            <Link
              href="/biblioteca"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold text-center"
            >
              ← Voltar
            </Link>

          </div>

          {/* COMO PREENCHER */}

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">

            <h2 className="font-extrabold text-blue-700 mb-3">
              Como preencher
            </h2>

            <p className="text-sm text-gray-600 mb-3">
              Coloque <strong>um livro por linha</strong>.
              Separe cada informação usando ponto e vírgula:
            </p>

            <div className="bg-white rounded-xl p-4 font-mono text-sm text-gray-700 overflow-x-auto">
              Nome; Autor; Categoria; Faixa etária; Tema; Quantidade; Caixa; URL da capa
            </div>

            <p className="text-xs text-gray-500 mt-3">
              A faixa etária pode ter várias opções.
              Exemplo:
            </p>

            <div className="bg-white rounded-xl p-4 mt-2 font-mono text-xs text-gray-600 overflow-x-auto">
              FORMAS; CLAUDIA RUEDA; FORMAS; BERÇÁRIO, MATERNAL I, MATERNAL II; TRABALHA FORMAS; 1; CAIXA 1;
            </div>

          </div>

          {/* LISTA */}

          <div className="mb-6">

            <label className="block text-gray-700 font-bold mb-2">
              📚 Lista de livros
            </label>

            <textarea
              value={texto}
              onChange={(e) =>
                setTexto(e.target.value)
              }
              rows={12}
              placeholder={`Cole seus livros aqui.

Um livro por linha.

Exemplo:
A BOCA DO SAPO; MARY FRANÇA; ANIMAIS; MATERNAL I, MATERNAL II; UMA HISTÓRIA SOBRE UM SAPO; 1; CAIXA 1;
FORMAS; CLAUDIA RUEDA; FORMAS; BERÇÁRIO, MATERNAL I, MATERNAL II, PRÉ-ESCOLA; UMA HISTÓRIA SOBRE FORMAS; 1; CAIXA 1;`}
              className="
                w-full
                border border-gray-300
                rounded-2xl
                p-4
                outline-none
                focus:ring-2
                focus:ring-blue-500
                font-mono
                text-sm
              "
            />

          </div>

          {/* BOTÕES */}

          <div className="flex flex-col sm:flex-row gap-3 mb-8">

            <button
              type="button"
              onClick={analisarLista}
              className="
                flex-1
                bg-blue-100
                hover:bg-blue-200
                text-blue-700
                rounded-xl
                py-3
                font-bold
              "
            >
              🔍 Conferir lista
            </button>

            <button
              type="button"
              onClick={importarLivros}
              disabled={
                importando ||
                livros.length === 0
              }
              className="
                flex-1
                bg-blue-600
                hover:bg-blue-700
                disabled:bg-gray-300
                disabled:cursor-not-allowed
                text-white
                rounded-xl
                py-3
                font-bold
              "
            >
              {importando
                ? "💾 Importando..."
                : "📥 Cadastrar todos"}
            </button>

          </div>

          {/* MENSAGEM */}

          {mensagem && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl p-4 mb-6 font-bold">
              {mensagem}
            </div>
          )}

          {/* CONFERÊNCIA */}

          {livros.length > 0 && (

            <div>

              <div className="flex items-center justify-between mb-4">

                <div>

                  <h2 className="text-xl font-extrabold text-gray-800">
                    Conferência
                  </h2>

                  <p className="text-sm text-gray-500">
                    {livros.length} livro(s) encontrado(s)
                  </p>

                </div>

              </div>

              <div className="space-y-3">

                {livros.map(
                  (livro, index) => (

                    <div
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-2xl p-4"
                    >

                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

                        <div>

                          <p className="font-extrabold text-gray-800">
                            {livro.nome}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            {livro.autor ||
                              "Autor não informado"}
                          </p>

                        </div>

                        <div className="flex flex-wrap gap-2">

                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                            {livro.categoria}
                          </span>

                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                            👶 {livro.faixa_etaria}
                          </span>

                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                            📦 {livro.local}
                          </span>

                        </div>

                      </div>

                      {livro.tema && (
                        <p className="text-sm text-gray-600 mt-3">
                          <strong>Tema:</strong>{" "}
                          {livro.tema}
                        </p>
                      )}

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}