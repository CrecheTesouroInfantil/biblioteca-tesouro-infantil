"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Crianca = {
  id: number;
  nome: string;
  data_nascimento: string;
  genero: string;
  turma: string;
  cartinha_ou_desenho: string | null;
  cartinha_url: string | null;
  status: string;
  adotante_nome: string | null;
  adotante_email: string | null;
  data_adocao: string | null;
};

const filtros = [
  "Todas",
  "Berçário",
  "Maternal I",
  "Maternal II",
  "Pré-escola",
];

function calcularIdade(dataNascimento: string) {
  const nascimento = new Date(`${dataNascimento}T00:00:00`);
  const hoje = new Date();

  let anos = hoje.getFullYear() - nascimento.getFullYear();
  let meses = hoje.getMonth() - nascimento.getMonth();

  if (hoje.getDate() < nascimento.getDate()) {
    meses--;
  }

  if (meses < 0) {
    anos--;
    meses += 12;
  }

  if (anos < 1) {
    return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  }

  if (meses === 0) {
    return `${anos} ${anos === 1 ? "ano" : "anos"}`;
  }

  return `${anos} ${anos === 1 ? "ano" : "anos"} e ${meses} ${
    meses === 1 ? "mês" : "meses"
  }`;
}

function emojiTurma(turma: string) {
  if (turma === "Berçário") return "🍼";
  if (turma === "Maternal I") return "🧸";
  if (turma === "Maternal II") return "🎨";
  return "🎒";
}

export default function AdminCampanhaPage() {
  const router = useRouter();

  const [criancas, setCriancas] = useState<Crianca[]>([]);
  const [filtro, setFiltro] = useState("Todas");

  const [carregando, setCarregando] = useState(true);
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  const [enviandoId, setEnviandoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState("");

  const [imagemSelecionada, setImagemSelecionada] =
    useState<Crianca | null>(null);

  // Um único campo de arquivo controlado por botão.
  // Isso evita problemas de input escondido dentro dos cards.
  const inputArquivoRef = useRef<HTMLInputElement | null>(null);
  const [criancaParaUpload, setCriancaParaUpload] = useState<Crianca | null>(null);
  const [modoCamera, setModoCamera] = useState(false);

  async function carregarCriancas() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("criancas")
      .select(
        "id, nome, data_nascimento, genero, turma, cartinha_ou_desenho, cartinha_url, status, adotante_nome, adotante_email, data_adocao"
      )
      .order("turma", { ascending: true })
      .order("nome", { ascending: true });

    if (error) {
      console.error(error);
      setErro(
        "Não foi possível carregar as crianças. Verifique as permissões do Supabase."
      );
      setCarregando(false);
      return;
    }

    setCriancas((data || []) as Crianca[]);
    setCarregando(false);
  }

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      setVerificandoSessao(true);

      const { data, error } = await supabase.auth.getUser();

      if (!ativo) return;

      if (error || !data.user) {
        setUsuarioLogado(null);
        setVerificandoSessao(false);
        router.replace("/login");
        return;
      }

      setUsuarioLogado(data.user.id);
      setVerificandoSessao(false);
      await carregarCriancas();
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_evento, sessao) => {
        if (!ativo) return;

        if (!sessao?.user) {
          setUsuarioLogado(null);
          router.replace("/login");
          return;
        }

        setUsuarioLogado(sessao.user.id);
      }
    );

    verificarSessao();

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const criancasFiltradas = useMemo(() => {
    if (filtro === "Todas") {
      return criancasDisponiveis;
    }

    return criancasDisponiveis.filter((crianca) => crianca.turma === filtro);
  }, [criancasDisponiveis, filtro]);

  const criancasDisponiveis = useMemo(() => {
    return criancas.filter((crianca) => crianca.status !== "adotada");
  }, [criancas]);

  const criancasAdotadas = useMemo(() => {
    return [...criancas]
      .filter((crianca) => crianca.status === "adotada")
      .sort((a, b) => {
        const dataA = a.data_adocao
          ? new Date(a.data_adocao).getTime()
          : 0;
        const dataB = b.data_adocao
          ? new Date(b.data_adocao).getTime()
          : 0;

        return dataB - dataA;
      });
  }, [criancas]);

  function formatarDataAdocao(data: string | null) {
    if (!data) return "Data não informada";

    const valor = new Date(data);

    if (Number.isNaN(valor.getTime())) {
      return "Data não informada";
    }

    return valor.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  async function atualizarPainel() {
    await carregarCriancas();
    setMensagem("🔄 Painel atualizado com os dados mais recentes.");
  }

  async function adicionarCartinha(
    crianca: Crianca,
    evento: ChangeEvent<HTMLInputElement>
  ) {
    console.log("================================");
    console.log("📸 INÍCIO DO PROCESSO");
    console.log("Criança:", crianca.nome);
    console.log("ID:", crianca.id);

    const arquivo = evento.target.files?.[0];

    console.log("📁 Arquivo recebido:", arquivo);

    if (!arquivo) {
      console.log("❌ Nenhum arquivo foi selecionado.");
      setMensagem("❌ Nenhuma imagem foi selecionada.");
      return;
    }

    console.log("✅ Arquivo recebido com sucesso.");
    console.log("Nome:", arquivo.name);
    console.log("Tipo:", arquivo.type);
    console.log("Tamanho:", arquivo.size);

    setMensagem("1️⃣ Imagem recebida. Verificando arquivo...");

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      console.log("❌ Tipo de arquivo não permitido:", arquivo.type);
      setMensagem("❌ Escolha uma imagem JPG, PNG ou WEBP.");
      evento.target.value = "";
      return;
    }

    console.log("✅ Tipo de imagem permitido.");

    const tamanhoMaximo = 5 * 1024 * 1024;

    if (arquivo.size > tamanhoMaximo) {
      console.log("❌ Imagem maior que 5 MB.");
      setMensagem("❌ A imagem deve ter no máximo 5 MB.");
      evento.target.value = "";
      return;
    }

    console.log("✅ Tamanho da imagem permitido.");

    try {
      setEnviandoId(crianca.id);

      /*
       * Confirma que a sessão do Supabase ainda existe antes do upload.
       * O Storage usa essa sessão para aplicar a policy TO authenticated.
       */
      const { data: sessaoData, error: sessaoError } =
        await supabase.auth.getSession();

      if (sessaoError || !sessaoData.session?.user) {
        console.error("❌ SESSÃO AUSENTE:", sessaoError);
        setMensagem(
          "❌ Sua sessão expirou. Faça login novamente para enviar a cartinha."
        );
        router.replace("/login");
        return;
      }

      setUsuarioLogado(sessaoData.session.user.id);

      setMensagem("2️⃣ Sessão confirmada. Preparando a imagem para envio...");

      const extensao =
        arquivo.name.split(".").pop()?.toLowerCase() || "jpg";

      const caminho = `${crianca.id}.${extensao}`;

      console.log("📂 Bucket:", "cartinhas");
      console.log("📄 Caminho:", caminho);

      setMensagem("3️⃣ Enviando imagem para o armazenamento...");
      console.log("📤 Tentando enviar imagem para o Storage...");

      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from("cartinhas")
          .upload(caminho, arquivo, {
            cacheControl: "3600",
            upsert: true,
            contentType: arquivo.type,
          });

      console.log("📦 Resultado do Storage:", {
        uploadData,
        uploadError,
      });

      if (uploadError) {
        console.error("❌ ERRO NO STORAGE:", uploadError);
        setMensagem(`❌ ERRO NO STORAGE: ${uploadError.message}`);
        return;
      }

      console.log("✅ IMAGEM ENVIADA PARA O STORAGE!");

      setMensagem("4️⃣ Imagem enviada. Obtendo endereço...");
      console.log("🔗 Gerando URL pública...");

      const { data: publicUrlData } = supabase.storage
        .from("cartinhas")
        .getPublicUrl(caminho);

      console.log("🔗 Resultado da URL:", publicUrlData);

      const url = publicUrlData.publicUrl;

      console.log("🔗 URL gerada:", url);

      if (!url) {
        console.error("❌ A URL pública não foi gerada.");
        setMensagem(
          "❌ A imagem foi enviada, mas não foi possível gerar a URL."
        );
        return;
      }

      console.log("✅ URL pública gerada com sucesso.");

      setMensagem("5️⃣ Salvando a imagem no cadastro da criança...");
      console.log("💾 Tentando salvar cartinha_url na tabela criancas...");
      console.log("ID da criança:", crianca.id);
      console.log("URL:", url);

      const { data: updateData, error: updateError } =
        await supabase
          .from("criancas")
          .update({
            cartinha_url: url,
          })
          .eq("id", crianca.id)
          .select();

      console.log("📋 Resultado do UPDATE:", {
        updateData,
        updateError,
      });

      if (updateError) {
        console.error("❌ ERRO AO SALVAR NA TABELA:", updateError);
        setMensagem(`❌ ERRO AO SALVAR NO BANCO: ${updateError.message}`);
        return;
      }

      console.log("✅ URL SALVA NA TABELA CRIANCAS!");

      setCriancas((atual) =>
        atual.map((item) =>
          item.id === crianca.id
            ? {
                ...item,
                cartinha_url: url,
              }
            : item
        )
      );

      console.log("🎉 CARTINHA CADASTRADA COM SUCESSO!");

      setMensagem(
        `🎉 Cartinha de ${crianca.nome} adicionada com sucesso!`
      );
    } catch (error) {
      console.error("🔥 ERRO INESPERADO:", error);

      setMensagem(
        error instanceof Error
          ? `❌ ERRO: ${error.message}`
          : "❌ Ocorreu um erro inesperado."
      );
    } finally {
      console.log("🏁 FIM DO PROCESSO");
      setEnviandoId(null);
      evento.target.value = "";
    }
  }

  if (verificandoSessao || !usuarioLogado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6FAFF] px-5 text-[#123A78]">
        <div className="w-full max-w-md rounded-[30px] bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#DDF3FF] border-t-[#168BE8]" />
          <h1 className="mt-5 text-xl font-black">Verificando acesso...</h1>
          <p className="mt-2 text-sm text-gray-500">
            Esta área é exclusiva da administração.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6FAFF] text-[#123A78]">
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#168BE8]">
              Administração
            </p>

            <h1 className="mt-1 text-2xl font-black text-[#123A78] sm:text-3xl">
              💌 Cartinhas das Crianças
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Semana das Crianças 2026 • Adote uma Criança
            </p>
            <p className="mt-1 text-xs font-bold text-[#16A66A]">
              🔐 Acesso administrativo autenticado
            </p>
          </div>

          <a
            href="/campanha"
            className="rounded-2xl bg-[#168BE8] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0D75C8]"
          >
            Ver campanha
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {/* EXPLICAÇÃO */}
        <section className="rounded-[30px] bg-gradient-to-br from-[#DDF3FF] to-[#F3E9FF] p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-[#123A78]">
                Adicione as cartinhas ou desenhos 💗
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Escolha a imagem da cartinha ou desenho de cada criança.
                A imagem ficará disponível na campanha para que o
                adotante possa conhecer esse pedido especial.
              </p>
            </div>

            <div className="rounded-2xl bg-white px-5 py-4 text-center shadow-sm">
              <p className="text-3xl font-black text-[#168BE8]">
                {criancas.length}
              </p>

              <p className="text-xs font-bold text-gray-500">
                crianças cadastradas
              </p>
            </div>
          </div>
        </section>

        {/* FILTROS */}
        <section className="mt-7">
          <div className="flex flex-wrap gap-2">
            {filtros.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFiltro(item)}
                className={`rounded-full px-5 py-3 text-xs font-black transition ${
                  filtro === item
                    ? "bg-[#168BE8] text-white shadow-md"
                    : "bg-white text-[#123A78] shadow-sm ring-1 ring-gray-200 hover:bg-[#F1F8FF]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* MENSAGEM */}
        {mensagem && (
          <div
            className={`mt-6 rounded-2xl p-4 text-center text-sm font-bold shadow-sm ${
              mensagem.includes("sucesso")
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-red-50 text-red-700 ring-1 ring-red-200"
            }`}
          >
            {mensagem}
          </div>
        )}

        {/* RESUMO DAS ADOÇÕES */}
        {!carregando && !erro && (
          <section className="mt-8 rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#F02B78]">
                  Controle das adoções
                </p>

                <h2 className="mt-1 text-2xl font-black text-[#123A78]">
                  🎁 Crianças adotadas
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Aqui aparecem as crianças que já foram escolhidas na campanha.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#FFF1F7] px-5 py-3 text-center">
                  <p className="text-2xl font-black text-[#F02B78]">
                    {criancasAdotadas.length}
                  </p>
                  <p className="text-xs font-bold text-gray-500">
                    adotadas
                  </p>
                </div>

                <button
                  type="button"
                  onClick={atualizarPainel}
                  disabled={carregando}
                  className="rounded-2xl bg-[#168BE8] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0D75C8] disabled:cursor-wait disabled:bg-gray-400"
                >
                  🔄 Atualizar
                </button>
              </div>
            </div>

            {criancasAdotadas.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-[#F8FCFF] p-8 text-center ring-1 ring-gray-100">
                <div className="text-4xl">💙</div>
                <p className="mt-3 text-sm font-bold text-gray-500">
                  Nenhuma criança foi adotada ainda.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-gray-100">
                <table className="w-full min-w-[850px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#F6FAFF] text-xs font-black uppercase tracking-wide text-[#123A78]">
                      <th className="px-4 py-4">Nome da criança</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Nome do adotante</th>
                      <th className="px-4 py-4">E-mail</th>
                      <th className="px-4 py-4">Data da adoção</th>
                    </tr>
                  </thead>

                  <tbody>
                    {criancasAdotadas.map((crianca) => (
                      <tr
                        key={crianca.id}
                        className="border-t border-gray-100 text-sm"
                      >
                        <td className="px-4 py-4">
                          <div className="font-black text-[#123A78]">
                            {crianca.nome}
                          </div>
                          <div className="mt-1 text-xs text-gray-400">
                            {crianca.turma}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-[#DDF8D9] px-3 py-1.5 text-xs font-black text-[#168B57]">
                            Adotada
                          </span>
                        </td>

                        <td className="px-4 py-4 font-bold text-gray-700">
                          {crianca.adotante_nome || "Não informado"}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {crianca.adotante_email || "Não informado"}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {formatarDataAdocao(crianca.data_adocao)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* CARREGANDO */}
        {carregando ? (
          <div className="mt-8 rounded-[30px] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#DDF3FF] border-t-[#168BE8]" />

            <p className="mt-4 text-sm font-bold text-gray-400">
              Carregando crianças...
            </p>
          </div>
        ) : erro ? (
          <div className="mt-8 rounded-[30px] bg-red-50 p-8 text-center text-sm font-bold text-red-600">
            {erro}
          </div>
        ) : (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {criancasFiltradas.map((crianca) => {
              const enviando = enviandoId === crianca.id;

              return (
                <article
                  key={crianca.id}
                  className="overflow-hidden rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-gray-100"
                >
                  {/* TOPO DO CARD */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF7FF] text-3xl">
                      {emojiTurma(crianca.turma)}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-[9px] font-black ${
                        crianca.cartinha_url
                          ? "bg-[#DDF8D9] text-[#168B57]"
                          : "bg-[#FFF1BD] text-[#B87500]"
                      }`}
                    >
                      {crianca.cartinha_url
                        ? "COM CARTINHA"
                        : "SEM CARTINHA"}
                    </span>
                  </div>

                  {/* DADOS */}
                  <h3 className="mt-5 text-lg font-black text-[#123A78]">
                    {crianca.nome}
                  </h3>

                  <p className="mt-1 text-sm font-bold text-gray-500">
                    {crianca.turma}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {calcularIdade(crianca.data_nascimento)}
                  </p>

                  {/* PREVIEW */}
                  {crianca.cartinha_url && (
                    <button
                      type="button"
                      onClick={() => setImagemSelecionada(crianca)}
                      className="mt-4 block w-full overflow-hidden rounded-2xl bg-gray-50"
                    >
                      <img
                        src={crianca.cartinha_url}
                        alt={`Cartinha ou desenho de ${crianca.nome}`}
                        className="h-40 w-full object-cover transition hover:scale-[1.02]"
                      />
                    </button>
                  )}

                  {/* BOTÕES DE CARTINHA/DESENHO */}
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={enviando}
                      onClick={() => {
                        setCriancaParaUpload(crianca);
                        setModoCamera(true);
                        setTimeout(() => inputArquivoRef.current?.click(), 50);
                      }}
                      className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3.5 text-sm font-black text-white shadow-sm transition ${
                        enviando
                          ? "cursor-wait bg-gray-400"
                          : "bg-[#F02B78] hover:bg-[#D91D65]"
                      }`}
                    >
                      {enviando ? (
                        <>⏳ Enviando...</>
                      ) : crianca.cartinha_url ? (
                        <>🔄 Trocar foto</>
                      ) : (
                        <>📷 Tirar foto</>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={enviando}
                      onClick={() => {
                        setCriancaParaUpload(crianca);
                        setModoCamera(false);
                        setTimeout(() => inputArquivoRef.current?.click(), 50);
                      }}
                      className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3.5 text-sm font-black shadow-sm ring-1 transition ${
                        enviando
                          ? "cursor-wait bg-gray-100 text-gray-400 ring-gray-200"
                          : "bg-white text-[#123A78] ring-gray-200 hover:bg-[#F5FAFF]"
                      }`}
                    >
                      🖼️ Escolher imagem
                    </button>
                  </div>

                  {/* STATUS */}
                  {crianca.cartinha_url && (
                    <p className="mt-3 text-center text-xs font-bold text-[#16A66A]">
                      ✅ Imagem cadastrada
                    </p>
                  )}
                </article>
              );
            })}
          </section>
        )}

        {/* CAMPO ÚNICO DE ARQUIVO */}
        <input
          ref={inputArquivoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture={modoCamera ? "environment" : undefined}
          className="hidden"
          onChange={(evento) => {
            if (criancaParaUpload) {
              adicionarCartinha(criancaParaUpload, evento);
            }
            setCriancaParaUpload(null);
            setModoCamera(false);
          }}
        />

        {/* QUANDO NÃO HOUVER RESULTADOS */}
        {!carregando &&
          !erro &&
          criancasFiltradas.length === 0 && (
            <div className="mt-8 rounded-[30px] bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">💌</div>

              <p className="mt-4 text-lg font-black text-[#123A78]">
                Nenhuma criança encontrada.
              </p>
            </div>
          )}
      </div>

      {/* MODAL DA CARTINHA */}
      {imagemSelecionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#123A78]/70 p-4 backdrop-blur-sm"
          onClick={() => setImagemSelecionada(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[30px] bg-white p-4 shadow-2xl"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-2 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#168BE8]">
                  Cartinha / desenho
                </p>

                <h3 className="mt-1 text-xl font-black text-[#123A78]">
                  {imagemSelecionada.nome}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setImagemSelecionada(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-2xl bg-gray-50 p-2">
              <img
                src={imagemSelecionada.cartinha_url || ""}
                alt={`Cartinha ou desenho de ${imagemSelecionada.nome}`}
                className="mx-auto max-h-[70vh] w-auto max-w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}