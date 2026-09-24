"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
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
  const [criancas, setCriancas] = useState<Crianca[]>([]);
  const [filtro, setFiltro] = useState("Todas");
  const [busca, setBusca] = useState("");

  const [carregando, setCarregando] = useState(true);
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

  const [editandoCrianca, setEditandoCrianca] = useState<Crianca | null>(null);
  const [formulario, setFormulario] = useState({
    nome: "",
    data_nascimento: "",
    genero: "",
    turma: "",
    cartinha_ou_desenho: "",
    status: "disponivel",
  });
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const [adicionandoCrianca, setAdicionandoCrianca] = useState(false);
  const [salvandoNovaCrianca, setSalvandoNovaCrianca] = useState(false);
  const [novoFormulario, setNovoFormulario] = useState({
    nome: "",
    data_nascimento: "",
    genero: "",
    turma: "",
    cartinha_ou_desenho: "",
    status: "disponivel",
  });

  async function carregarCriancas() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("criancas")
      .select(
        "id, nome, data_nascimento, genero, turma, cartinha_ou_desenho, cartinha_url, status"
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
    carregarCriancas();
  }, []);

  const criancasFiltradas = useMemo(() => {
    if (filtro === "Todas") {
      return criancas;
    }

    const termo = busca.trim().toLowerCase();

    return criancas.filter((crianca) => {
      const correspondeTurma =
        filtro === "Todas" || crianca.turma === filtro;
      const correspondeBusca =
        !termo ||
        crianca.nome.toLowerCase().includes(termo) ||
        crianca.turma.toLowerCase().includes(termo);

      return correspondeTurma && correspondeBusca;
    });
  }, [criancas, filtro, busca]);

  function abrirEdicao(crianca: Crianca) {
    setEditandoCrianca(crianca);
    setFormulario({
      nome: crianca.nome,
      data_nascimento: crianca.data_nascimento,
      genero: crianca.genero,
      turma: crianca.turma,
      cartinha_ou_desenho: crianca.cartinha_ou_desenho || "",
      status: crianca.status || "disponivel",
    });
    setMensagem("");
  }

  async function salvarEdicao() {
    if (!editandoCrianca) return;

    if (!formulario.nome.trim()) {
      setMensagem("Informe o nome da criança.");
      return;
    }

    try {
      setSalvandoEdicao(true);
      setMensagem("");

      const { data, error } = await supabase
        .from("criancas")
        .update({
          nome: formulario.nome.trim(),
          data_nascimento: formulario.data_nascimento,
          genero: formulario.genero,
          turma: formulario.turma,
          cartinha_ou_desenho: formulario.cartinha_ou_desenho.trim() || null,
          status: formulario.status,
        })
        .eq("id", editandoCrianca.id)
        .select(
          "id, nome, data_nascimento, genero, turma, cartinha_ou_desenho, cartinha_url, status"
        )
        .single();

      if (error) {
        console.error(error);
        throw new Error(
          "Não foi possível salvar as alterações. Verifique as permissões do administrador."
        );
      }

      setCriancas((atual) =>
        atual.map((item) =>
          item.id === editandoCrianca.id ? (data as Crianca) : item
        )
      );
      setEditandoCrianca(null);
      setMensagem(`Dados de ${data.nome} atualizados com sucesso! ✅`);
    } catch (error) {
      console.error(error);
      setMensagem(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as alterações."
      );
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function abrirNovaCrianca() {
    setNovoFormulario({
      nome: "",
      data_nascimento: "",
      genero: "",
      turma: "",
      cartinha_ou_desenho: "",
      status: "disponivel",
    });
    setMensagem("");
    setAdicionandoCrianca(true);
  }

  async function salvarNovaCrianca() {
    if (!novoFormulario.nome.trim()) {
      setMensagem("Informe o nome da criança.");
      return;
    }

    if (!novoFormulario.data_nascimento) {
      setMensagem("Informe a data de nascimento.");
      return;
    }

    if (!novoFormulario.genero) {
      setMensagem("Selecione o gênero.");
      return;
    }

    if (!novoFormulario.turma) {
      setMensagem("Selecione a turma.");
      return;
    }

    try {
      setSalvandoNovaCrianca(true);
      setMensagem("");

      const { data, error } = await supabase
        .from("criancas")
        .insert({
          nome: novoFormulario.nome.trim(),
          data_nascimento: novoFormulario.data_nascimento,
          genero: novoFormulario.genero,
          turma: novoFormulario.turma,
          cartinha_ou_desenho: novoFormulario.cartinha_ou_desenho.trim() || null,
          status: novoFormulario.status,
          presente_recebido: false,
        })
        .select(
          "id, nome, data_nascimento, genero, turma, cartinha_ou_desenho, cartinha_url, status"
        )
        .single();

      if (error) {
        console.error(error);
        throw new Error(
          "Não foi possível cadastrar a criança. Verifique a permissão de inclusão no Supabase."
        );
      }

      setCriancas((atual) => [...atual, data as Crianca]);
      setAdicionandoCrianca(false);
      setMensagem(`${data.nome} foi cadastrada com sucesso! 👧💗`);
    } catch (error) {
      console.error(error);
      setMensagem(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a criança."
      );
    } finally {
      setSalvandoNovaCrianca(false);
    }
  }

  async function excluirCrianca(crianca: Crianca) {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir ${crianca.nome}?\n\nEssa ação removerá o cadastro da campanha.`
    );

    if (!confirmou) return;

    try {
      setExcluindoId(crianca.id);
      setMensagem("");

      const { error } = await supabase
        .from("criancas")
        .delete()
        .eq("id", crianca.id);

      if (error) {
        console.error(error);
        throw new Error(
          "Não foi possível excluir a criança. Verifique a permissão de exclusão no Supabase."
        );
      }

      if (crianca.cartinha_url) {
        try {
          const parte = crianca.cartinha_url.split("/cartinhas/")[1];
          const caminho = parte ? decodeURIComponent(parte.split("?")[0]) : null;

          if (caminho) {
            await supabase.storage.from("cartinhas").remove([caminho]);
          }
        } catch (storageError) {
          console.warn("Não foi possível remover a cartinha da Storage:", storageError);
        }
      }

      setCriancas((atual) =>
        atual.filter((item) => item.id !== crianca.id)
      );
      setMensagem(`${crianca.nome} foi excluída da campanha. 🗑️`);
    } catch (error) {
      console.error(error);
      setMensagem(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a criança."
      );
    } finally {
      setExcluindoId(null);
    }
  }

  async function adicionarCartinha(
    crianca: Crianca,
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = evento.target.files?.[0];

    if (!arquivo) return;

    setMensagem("");

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      setMensagem(
        "Escolha uma imagem JPG, PNG ou WEBP."
      );
      evento.target.value = "";
      return;
    }

    const tamanhoMaximo = 5 * 1024 * 1024;

    if (arquivo.size > tamanhoMaximo) {
      setMensagem(
        "A imagem deve ter no máximo 5 MB."
      );
      evento.target.value = "";
      return;
    }

    try {
      setEnviandoId(crianca.id);

      const extensao =
        arquivo.name.split(".").pop()?.toLowerCase() || "jpg";

      const caminho = `${crianca.id}.${extensao}`;

      /*
       * Envia a imagem para o bucket cartinhas
       */
      const { error: uploadError } = await supabase.storage
        .from("cartinhas")
        .upload(caminho, arquivo, {
          cacheControl: "3600",
          upsert: true,
          contentType: arquivo.type,
        });

      if (uploadError) {
        console.error(uploadError);
        throw new Error(
          "Não foi possível enviar a imagem para o armazenamento."
        );
      }

      /*
       * Obtém o endereço público da imagem
       */
      const { data: publicUrlData } = supabase.storage
        .from("cartinhas")
        .getPublicUrl(caminho);

      const url = publicUrlData.publicUrl;

      if (!url) {
        throw new Error(
          "Não foi possível obter o endereço da imagem."
        );
      }

      /*
       * Salva o endereço na criança
       */
      const { error: updateError } = await supabase
        .from("criancas")
        .update({
          cartinha_url: url,
        })
        .eq("id", crianca.id);

      if (updateError) {
        console.error(updateError);
        throw new Error(
          "A imagem foi enviada, mas não foi possível salvar o endereço na criança."
        );
      }

      /*
       * Atualiza a tela imediatamente
       */
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

      setMensagem(
        `Cartinha de ${crianca.nome} adicionada com sucesso! 💌`
      );
    } catch (error) {
      console.error(error);

      setMensagem(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar a cartinha."
      );
    } finally {
      setEnviandoId(null);
      evento.target.value = "";
    }
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
        <section className="mb-6 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#168BE8]">
                Prazo da campanha
              </p>
              <h2 className="mt-1 text-xl font-black text-[#123A78]">
                Entrega dos brinquedos até 20 de outubro de 2026 🎁
              </h2>
            </div>
            <div className="rounded-2xl bg-[#FFF1BD] px-5 py-3 text-center">
              <p className="text-sm font-black text-[#123A78]">20/10/2026</p>
            </div>
          </div>
        </section>

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

        {/* PESQUISA E NOVA CRIANÇA */}
        <section className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">
              🔎 Pesquisar criança
            </label>
            <input
              type="search"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Digite o nome da criança..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none transition focus:border-[#168BE8] focus:bg-white focus:ring-2 focus:ring-[#168BE8]/20"
            />
          </div>

          <button
            type="button"
            onClick={abrirNovaCrianca}
            className="rounded-[24px] bg-[#16A66A] px-6 py-4 text-sm font-black text-white shadow-sm transition hover:bg-[#128B58] lg:mb-0"
          >
            ➕ Acrescentar criança
          </button>
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

                  {/* GERENCIAR CADASTRO */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => abrirEdicao(crianca)}
                      className="rounded-2xl bg-[#EAF7FF] px-3 py-3 text-sm font-black text-[#123A78] ring-1 ring-[#CDEBFF] transition hover:bg-[#DDF3FF]"
                    >
                      ✏️ Editar dados
                    </button>

                    <button
                      type="button"
                      disabled={excluindoId === crianca.id}
                      onClick={() => excluirCrianca(crianca)}
                      className={`rounded-2xl px-3 py-3 text-sm font-black transition ${
                        excluindoId === crianca.id
                          ? "cursor-wait bg-gray-100 text-gray-400"
                          : "bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100"
                      }`}
                    >
                      {excluindoId === crianca.id ? "⏳ Excluindo..." : "🗑️ Excluir"}
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

      {/* MODAL DE NOVA CRIANÇA */}
      {adicionandoCrianca && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#123A78]/70 p-4 backdrop-blur-sm"
          onClick={() => !salvandoNovaCrianca && setAdicionandoCrianca(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-6 shadow-2xl"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#16A66A]">
                  Novo cadastro
                </p>
                <h3 className="mt-1 text-2xl font-black text-[#123A78]">
                  ➕ Acrescentar criança
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Cadastre uma nova criança diretamente pela administração.
                </p>
              </div>
              <button
                type="button"
                disabled={salvandoNovaCrianca}
                onClick={() => setAdicionandoCrianca(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Nome</label>
                <input
                  type="text"
                  value={novoFormulario.nome}
                  onChange={(evento) => setNovoFormulario((atual) => ({ ...atual, nome: evento.target.value }))}
                  placeholder="Nome completo da criança"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none focus:border-[#16A66A] focus:bg-white focus:ring-2 focus:ring-[#16A66A]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Data de nascimento</label>
                <input
                  type="date"
                  value={novoFormulario.data_nascimento}
                  onChange={(evento) => setNovoFormulario((atual) => ({ ...atual, data_nascimento: evento.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none focus:border-[#16A66A] focus:bg-white focus:ring-2 focus:ring-[#16A66A]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Gênero</label>
                <select
                  value={novoFormulario.genero}
                  onChange={(evento) => setNovoFormulario((atual) => ({ ...atual, genero: evento.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none focus:border-[#16A66A] focus:bg-white focus:ring-2 focus:ring-[#16A66A]/20"
                >
                  <option value="">Selecione</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Turma</label>
                <select
                  value={novoFormulario.turma}
                  onChange={(evento) => setNovoFormulario((atual) => ({ ...atual, turma: evento.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none focus:border-[#16A66A] focus:bg-white focus:ring-2 focus:ring-[#16A66A]/20"
                >
                  <option value="">Selecione</option>
                  {filtros.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Status</label>
                <select
                  value={novoFormulario.status}
                  onChange={(evento) => setNovoFormulario((atual) => ({ ...atual, status: evento.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none focus:border-[#16A66A] focus:bg-white focus:ring-2 focus:ring-[#16A66A]/20"
                >
                  <option value="disponivel">Disponível</option>
                  <option value="adotada">Escolhida</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Cartinha ou desenho</label>
                <textarea
                  value={novoFormulario.cartinha_ou_desenho}
                  onChange={(evento) => setNovoFormulario((atual) => ({ ...atual, cartinha_ou_desenho: evento.target.value }))}
                  rows={3}
                  placeholder="Observação ou pedido escrito pela criança..."
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none focus:border-[#16A66A] focus:bg-white focus:ring-2 focus:ring-[#16A66A]/20"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={salvandoNovaCrianca}
                onClick={() => setAdicionandoCrianca(false)}
                className="rounded-2xl bg-gray-100 px-5 py-3 font-black text-gray-600 hover:bg-gray-200"
              >Cancelar</button>
              <button
                type="button"
                disabled={salvandoNovaCrianca}
                onClick={salvarNovaCrianca}
                className="rounded-2xl bg-[#16A66A] px-5 py-3 font-black text-white shadow-sm hover:bg-[#128B58]"
              >
                {salvandoNovaCrianca ? "⏳ Cadastrando..." : "💾 Cadastrar criança"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO */}
      {editandoCrianca && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#123A78]/70 p-4 backdrop-blur-sm"
          onClick={() => !salvandoEdicao && setEditandoCrianca(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-6 shadow-2xl"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#168BE8]">
                  Editar cadastro
                </p>
                <h3 className="mt-1 text-2xl font-black text-[#123A78]">
                  {editandoCrianca.nome}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Corrija os dados da criança diretamente pela administração.
                </p>
              </div>

              <button
                type="button"
                disabled={salvandoEdicao}
                onClick={() => setEditandoCrianca(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">
                  Nome
                </label>
                <input
                  type="text"
                  value={formulario.nome}
                  onChange={(evento) =>
                    setFormulario((atual) => ({ ...atual, nome: evento.target.value }))
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none focus:border-[#168BE8] focus:bg-white focus:ring-2 focus:ring-[#168BE8]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">
                  Data de nascimento
                </label>
                <input
                  type="date"
                  value={formulario.data_nascimento}
                  onChange={(evento) =>
                    setFormulario((atual) => ({ ...atual, data_nascimento: evento.target.value }))
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none focus:border-[#168BE8] focus:bg-white focus:ring-2 focus:ring-[#168BE8]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">
                  Gênero
                </label>
                <select
                  value={formulario.genero}
                  onChange={(evento) =>
                    setFormulario((atual) => ({ ...atual, genero: evento.target.value }))
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none focus:border-[#168BE8] focus:bg-white focus:ring-2 focus:ring-[#168BE8]/20"
                >
                  <option value="">Selecione</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">
                  Turma
                </label>
                <select
                  value={formulario.turma}
                  onChange={(evento) =>
                    setFormulario((atual) => ({ ...atual, turma: evento.target.value }))
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none focus:border-[#168BE8] focus:bg-white focus:ring-2 focus:ring-[#168BE8]/20"
                >
                  {filtros.slice(1).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">
                  Status
                </label>
                <select
                  value={formulario.status}
                  onChange={(evento) =>
                    setFormulario((atual) => ({ ...atual, status: evento.target.value }))
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none focus:border-[#168BE8] focus:bg-white focus:ring-2 focus:ring-[#168BE8]/20"
                >
                  <option value="disponivel">Disponível</option>
                  <option value="adotada">Escolhida</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">
                  Cartinha ou desenho
                </label>
                <textarea
                  value={formulario.cartinha_ou_desenho}
                  onChange={(evento) =>
                    setFormulario((atual) => ({ ...atual, cartinha_ou_desenho: evento.target.value }))
                  }
                  rows={3}
                  placeholder="Observação ou pedido escrito pela criança..."
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#123A78] outline-none focus:border-[#168BE8] focus:bg-white focus:ring-2 focus:ring-[#168BE8]/20"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={salvandoEdicao}
                onClick={() => setEditandoCrianca(null)}
                className="rounded-2xl bg-gray-100 px-5 py-3 font-black text-gray-600 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={salvandoEdicao}
                onClick={salvarEdicao}
                className="rounded-2xl bg-[#168BE8] px-5 py-3 font-black text-white shadow-sm hover:bg-[#0D75C8]"
              >
                {salvandoEdicao ? "⏳ Salvando..." : "💾 Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

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