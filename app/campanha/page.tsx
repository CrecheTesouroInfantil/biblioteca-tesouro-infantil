"use client";

import { useEffect, useMemo, useState } from "react";
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

type Estatisticas = {
  total: number;
  adotadas: number;
  disponiveis: number;
  presentes_recebidos: number;
};

const filtros = [
  "Todas",
  "Berçário",
  "Maternal I",
  "Maternal II",
  "Pré-escola",
];

const coresCards = [
  {
    fundo: "bg-[#DDF3FF]",
    borda: "border-[#B8E7FF]",
    botao: "bg-[#168BE8] hover:bg-[#0D75C8]",
  },
  {
    fundo: "bg-[#FFE3F0]",
    borda: "border-[#FFD0E3]",
    botao: "bg-[#F02B78] hover:bg-[#D91D65]",
  },
  {
    fundo: "bg-[#FFF2BF]",
    borda: "border-[#FFE39A]",
    botao: "bg-[#F39A12] hover:bg-[#D98000]",
  },
  {
    fundo: "bg-[#E9DEFF]",
    borda: "border-[#DCCBFF]",
    botao: "bg-[#7651D9] hover:bg-[#603BC0]",
  },
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

export default function CampanhaPage() {
  const [criancas, setCriancas] = useState<Crianca[]>([]);

  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    total: 0,
    adotadas: 0,
    disponiveis: 0,
    presentes_recebidos: 0,
  });

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("Todas");

  const [criancaSelecionada, setCriancaSelecionada] =
    useState<Crianca | null>(null);

  const [nomeAdotante, setNomeAdotante] = useState("");
  const [emailAdotante, setEmailAdotante] = useState("");

  const [adotando, setAdotando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [cartinhaAberta, setCartinhaAberta] =
    useState<Crianca | null>(null);

  async function carregarCriancas() {
    const { data, error } = await supabase
      .from("criancas_publicas")
      .select(
        "id, nome, data_nascimento, genero, turma, cartinha_ou_desenho, cartinha_url, status"
      );

    if (error) {
      console.error(error);
      setErro("Não foi possível carregar as crianças da campanha.");
      return;
    }

    const ordenadas = [...(data || [])].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", {
        sensitivity: "base",
      })
    );

    setCriancas(ordenadas);
  }

  async function carregarEstatisticas() {
    const { data, error } = await supabase.rpc("estatisticas_campanha");

    if (error) {
      console.error(error);
      setErro("Não foi possível carregar os números da campanha.");
      return;
    }

    const resultado = Array.isArray(data) ? data[0] : data;

    if (resultado) {
      setEstatisticas({
        total: Number(resultado.total ?? 0),
        adotadas: Number(resultado.adotadas ?? 0),
        disponiveis: Number(resultado.disponiveis ?? 0),
        presentes_recebidos: Number(
          resultado.presentes_recebidos ?? 0
        ),
      });
    }
  }

  async function carregarTudo() {
    setCarregando(true);
    setErro("");

    await Promise.all([
      carregarCriancas(),
      carregarEstatisticas(),
    ]);

    setCarregando(false);
  }

  useEffect(() => {
    carregarTudo();

    const canal = supabase
      .channel("campanha-atualizacao")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "criancas",
        },
        () => {
          carregarTudo();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const criancasFiltradas = useMemo(() => {
    if (filtro === "Todas") {
      return criancas;
    }

    return criancas.filter(
      (crianca) => crianca.turma === filtro
    );
  }, [criancas, filtro]);

  function abrirAdocao(crianca: Crianca) {
    setCriancaSelecionada(crianca);
    setNomeAdotante("");
    setEmailAdotante("");
    setSucesso(false);
  }

  function fecharModal() {
    if (adotando) return;

    setCriancaSelecionada(null);
    setNomeAdotante("");
    setEmailAdotante("");
    setSucesso(false);
  }

  async function confirmarAdocao() {
    if (!criancaSelecionada) return;

    if (!nomeAdotante.trim()) {
      alert("Informe seu nome para confirmar a adoção.");
      return;
    }

    if (!emailAdotante.trim()) {
      alert("Informe seu e-mail para confirmar a adoção.");
      return;
    }

    setAdotando(true);

    const { data, error } = await supabase.rpc(
      "adotar_crianca",
      {
        p_crianca_id: criancaSelecionada.id,
        p_adotante_nome: nomeAdotante.trim(),
        p_adotante_email: emailAdotante.trim(),
      }
    );

    if (error) {
      console.error(error);

      alert(
        "Não foi possível concluir a adoção. Essa criança pode já ter sido escolhida por outra pessoa."
      );

      setAdotando(false);
      return;
    }

    if (data === false) {
      alert(
        "Essa criança acabou de ser escolhida por outra pessoa. Escolha outra criança."
      );

      setAdotando(false);

      await carregarTudo();
      fecharModal();

      return;
    }

    setCriancas((atual) =>
      atual.filter(
        (item) => item.id !== criancaSelecionada.id
      )
    );

    await carregarEstatisticas();

    setSucesso(true);
    setAdotando(false);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8FCFF] text-[#123A78]">

      {/* FUNDO */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-[#C7F0FF] opacity-60" />
        <div className="absolute -right-32 top-[650px] h-80 w-80 rounded-full bg-[#FFD9EA] opacity-50" />
        <div className="absolute left-[35%] top-[1100px] h-72 w-72 rounded-full bg-[#FFF1A8] opacity-40" />
      </div>

      {/* TOPO */}

      <header className="bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">

          <div className="flex items-center">
            <img
              src="/campanha/logo-creche.png"
              alt="Creche Tesouro Infantil"
              className="h-16 w-auto object-contain sm:h-20"
            />
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-black uppercase tracking-widest text-[#168BE8]">
              Semana das Crianças
            </p>

            <p className="text-xl font-black text-[#123A78]">
              2026
            </p>
          </div>

        </div>
      </header>

      {/* HERO */}

      <section className="px-3 pt-4 sm:px-5 sm:pt-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-gradient-to-br from-[#5FCFFF] via-[#6BB9FF] to-[#9879F4] p-3 shadow-xl sm:rounded-[40px] sm:p-5">

          <div className="rounded-[22px] bg-white/95 p-3 shadow-lg sm:rounded-[32px] sm:p-5">

            <img
              src="/campanha/banner-crianca.png"
              alt="Escolha e presenteie uma criança"
              className="mx-auto block w-full max-w-5xl object-contain"
            />

            <div className="mt-2 grid gap-2 sm:grid-cols-3 sm:gap-3">

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("criancas")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-2xl bg-[#FFB8D8] px-4 py-3 text-sm font-black text-[#123A78] shadow-sm transition hover:scale-[1.02]"
              >
                🔎 Escolha uma criança
              </button>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("criancas")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-2xl bg-[#FFE477] px-4 py-3 text-sm font-black text-[#123A78] shadow-sm transition hover:scale-[1.02]"
              >
                ❤️ Escolha e presenteie
              </button>

              <div className="rounded-2xl bg-[#BDEAFF] px-4 py-3 text-center text-sm font-black text-[#123A78] shadow-sm">
                🎁 Entregue o presente
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FENORD */}

      <section className="px-4 pt-5 sm:px-5">
        <div className="mx-auto max-w-6xl rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-[#E5EEF7] sm:rounded-[32px] sm:p-6">

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">

            <img
              src="/campanha/logo-fenord.png"
              alt="FENORD - Projeto de Extensão"
              className="h-auto w-full max-w-[330px] object-contain sm:max-w-[390px]"
            />

            <div className="max-w-md text-center sm:text-left">
              <p className="text-xs font-black uppercase tracking-widest text-[#168BE8]">
                Uma ação especial
              </p>

              <h2 className="mt-1 text-xl font-black text-[#123A78] sm:text-2xl">
                Semana das Crianças 2026
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Uma parceria para tornar o Dia das Crianças ainda mais
                especial para nossas crianças.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* COMO PARTICIPAR */}

      <section className="px-4 pt-7 sm:px-5 sm:pt-10">
        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F02B78] sm:text-sm">
              É simples participar
            </p>

            <h2 className="mt-1 text-3xl font-black text-[#123A78] sm:text-4xl">
              Como funciona?
            </h2>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">

            <div className="rounded-[28px] bg-[#FFE1EF] p-5 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl font-black shadow-sm">
                01
              </div>

              <h3 className="mt-3 text-xl font-black">
                Escolha
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Encontre uma criança disponível e veja sua idade e turma.
              </p>
            </div>

            <div className="rounded-[28px] bg-[#FFF1BD] p-5 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl font-black shadow-sm">
                02
              </div>

              <h3 className="mt-3 text-xl font-black">
                Presenteie
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Informe seu nome e e-mail e confirme a adoção da criança.
              </p>
            </div>

            <div className="rounded-[28px] bg-[#DDF3FF] p-5 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl font-black shadow-sm">
                03
              </div>

              <h3 className="mt-3 text-xl font-black">
                Entregue
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Entregue o presente até <strong>20/10/2026</strong>.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* INFORMAÇÕES */}

      <section className="px-4 pt-5 sm:px-5 sm:pt-7">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">

          <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#BDEAFF]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F8FF] text-2xl">
                🧸
              </div>

              <div>
                <p className="font-black text-[#123A78]">
                  Brinquedo
                </p>

                <p className="text-xs text-gray-500">
                  Adequado à faixa etária
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#FFD1E4]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0F7] text-2xl">
                💌
              </div>

              <div>
                <p className="font-black text-[#123A78]">
                  Cartinha ou desenho
                </p>

                <p className="text-xs text-gray-500">
                  Quando disponível
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#FFE399]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF9DE] text-2xl">
                📅
              </div>

              <div>
                <p className="font-black text-[#123A78]">
                  Entrega
                </p>

                <p className="text-sm font-black text-[#F15A3A]">
                  Até 20/10/2026
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ESTATÍSTICAS */}

      <section className="px-4 pt-6 sm:px-5 sm:pt-8">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[30px] bg-white shadow-lg sm:grid-cols-2 lg:grid-cols-4">

          <div className="p-5 text-center">
            <div className="text-3xl">👧👦</div>

            <p className="mt-1 text-3xl font-black text-[#168BE8]">
              {estatisticas.total}
            </p>

            <p className="text-xs font-bold text-gray-500 sm:text-sm">
              Crianças participantes
            </p>
          </div>

          <div className="border-t border-gray-100 p-5 text-center sm:border-l lg:border-t-0">
            <div className="text-3xl">💗</div>

            <p className="mt-1 text-3xl font-black text-[#F02B78]">
              {estatisticas.adotadas}
            </p>

            <p className="text-xs font-bold text-gray-500 sm:text-sm">
              Crianças escolhidas
            </p>
          </div>

          <div className="border-t border-gray-100 p-5 text-center lg:border-l lg:border-t-0">
            <div className="text-3xl">🎁</div>

            <p className="mt-1 text-3xl font-black text-[#F39A12]">
              {estatisticas.disponiveis}
            </p>

            <p className="text-xs font-bold text-gray-500 sm:text-sm">
              Aguardando presente
            </p>
          </div>

          <div className="border-t border-gray-100 p-5 text-center sm:border-l lg:border-t-0">
            <div className="text-3xl">📦</div>

            <p className="mt-1 text-3xl font-black text-[#16A66A]">
              {estatisticas.presentes_recebidos}
            </p>

            <p className="text-xs font-bold text-gray-500 sm:text-sm">
              Presentes recebidos
            </p>
          </div>

        </div>
      </section>

      {/* CRIANÇAS */}

      <section
        id="criancas"
        className="px-4 py-10 sm:px-5 sm:py-14"
      >
        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#168BE8] sm:text-sm">
              Escolha quem você deseja presentear
            </p>

            <h2 className="mt-1 text-3xl font-black text-[#123A78] sm:text-4xl">
              Conheça as crianças 💙
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Escolha uma criança, veja sua cartinha quando disponível e
              faça parte dessa história.
            </p>
          </div>

          {/* FILTROS */}

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {filtros.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFiltro(item)}
                className={`rounded-full px-4 py-2.5 text-xs font-black transition sm:px-5 ${
                  filtro === item
                    ? "bg-[#168BE8] text-white shadow-md"
                    : "bg-white text-[#123A78] shadow-sm ring-1 ring-gray-200 hover:bg-[#F1F8FF]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {erro && (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-center text-sm font-bold text-red-600">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="mt-8 rounded-[30px] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#DDF3FF] border-t-[#168BE8]" />

              <p className="mt-4 text-sm font-bold text-gray-400">
                Preparando a lista das crianças...
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {criancasFiltradas.map((crianca, index) => {
                const cor =
                  coresCards[index % coresCards.length];

                return (
                  <article
                    key={crianca.id}
                    className={`relative overflow-hidden rounded-[30px] border ${cor.borda} ${cor.fundo} p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg`}
                  >

                    <div className="absolute right-4 top-4 text-2xl opacity-40">
                      {index % 2 === 0 ? "♡" : "✦"}
                    </div>

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                        {emojiTurma(crianca.turma)}
                      </div>

                      <span className="rounded-full bg-white px-3 py-1.5 text-[9px] font-black text-green-600 shadow-sm">
                        DISPONÍVEL
                      </span>

                    </div>

                    <h3 className="mt-5 text-xl font-black text-[#123A78]">
                      {crianca.nome}
                    </h3>

                    <p className="mt-1 text-sm font-bold text-gray-600">
                      {calcularIdade(crianca.data_nascimento)}
                    </p>

                    <p className="mt-1 text-sm font-black text-[#168BE8]">
                      {crianca.turma}
                    </p>

                    {crianca.cartinha_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setCartinhaAberta(crianca)
                        }
                        className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#F02B78] shadow-sm ring-1 ring-[#FFD1E4] transition hover:bg-[#FFF7FB]"
                      >
                        💌 Ver cartinha ou desenho
                      </button>
                    )}

                    {crianca.cartinha_ou_desenho &&
                      !crianca.cartinha_url && (
                        <div className="mt-4 rounded-2xl bg-white/75 p-3 text-xs leading-5 text-gray-600">
                          💌{" "}
                          <strong>Cartinha:</strong>{" "}
                          {crianca.cartinha_ou_desenho}
                        </div>
                      )}

                    <button
                      type="button"
                      onClick={() => abrirAdocao(crianca)}
                      className={`mt-4 w-full rounded-2xl px-4 py-3.5 text-sm font-black text-white shadow-sm transition ${cor.botao}`}
                    >
                      🎁 Escolher e presentear
                    </button>

                  </article>
                );
              })}
            </div>
          )}

          {!carregando &&
            criancasFiltradas.length === 0 && (
              <div className="mt-8 rounded-[30px] bg-white p-10 text-center shadow-sm">
                <div className="text-5xl">💙</div>

                <p className="mt-4 text-lg font-black text-[#123A78]">
                  Essa turma já está toda escolhida!
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Escolha outra turma para encontrar uma criança
                  disponível.
                </p>
              </div>
            )}

        </div>
      </section>

      {/* RODAPÉ */}

      <footer className="bg-[#123A78] px-5 py-10 text-white">
        <div className="mx-auto max-w-6xl text-center">

          <img
            src="/campanha/logo-creche.png"
            alt="Creche Tesouro Infantil"
            className="mx-auto h-20 w-auto object-contain brightness-0 invert"
          />

          <p className="mt-4 text-lg font-black">
            Juntos por uma Semana das Crianças especial! 💙
          </p>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/70">
            Cada presente é um gesto de carinho e pode transformar o
            Dia das Crianças em uma lembrança inesquecível.
          </p>

          <div className="mt-6 flex justify-center">
            <img
              src="/campanha/logo-fenord.png"
              alt="FENORD"
              className="h-auto w-full max-w-[220px] rounded-xl bg-white p-2 object-contain"
            />
          </div>

        </div>
      </footer>

      {/* MODAL CARTINHA */}

      {cartinhaAberta?.cartinha_url && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#123A78]/80 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => setCartinhaAberta(null)}
        >

          <div
            className="max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-[28px] bg-white p-4 shadow-2xl sm:p-6"
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#F02B78]">
                  💌 Cartinha ou desenho
                </p>

                <h3 className="mt-1 text-2xl font-black text-[#123A78]">
                  {cartinhaAberta.nome}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {cartinhaAberta.turma} •{" "}
                  {calcularIdade(
                    cartinhaAberta.data_nascimento
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCartinhaAberta(null)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                ✕
              </button>

            </div>

            <div className="mt-4 max-h-[72vh] overflow-auto rounded-2xl bg-[#F8FCFF] p-2 text-center">
              <img
                src={cartinhaAberta.cartinha_url}
                alt={`Cartinha ou desenho de ${cartinhaAberta.nome}`}
                className="mx-auto max-h-[68vh] w-auto max-w-full rounded-xl object-contain"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setCartinhaAberta(null)
              }
              className="mt-4 w-full rounded-2xl bg-[#168BE8] px-5 py-3.5 text-sm font-black text-white"
            >
              Voltar para a criança
            </button>

          </div>
        </div>
      )}

      {/* MODAL ADOÇÃO */}

      {criancaSelecionada && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#123A78]/65 p-0 backdrop-blur-sm sm:items-center sm:p-5">

          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[32px] bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-[32px] sm:p-7">

            {!sucesso ? (
              <>

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-[#168BE8]">
                      Você escolheu
                    </p>

                    <h3 className="mt-1 text-2xl font-black text-[#123A78]">
                      {criancaSelecionada.nome}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {criancaSelecionada.turma} •{" "}
                      {calcularIdade(
                        criancaSelecionada.data_nascimento
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fecharModal}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500"
                  >
                    ✕
                  </button>

                </div>

                <div className="mt-5 rounded-3xl bg-[#FFF1BD] p-5 text-center">

                  <div className="text-4xl">
                    🎁
                  </div>

                  <p className="mt-2 text-sm font-bold leading-6 text-[#123A78]">
                    Que lindo! Você está escolhendo
                    presentear{" "}
                    <strong>
                      {criancaSelecionada.nome}
                    </strong>
                    . 💗
                  </p>

                </div>

                <label className="mt-5 block">

                  <span className="text-sm font-black text-[#123A78]">
                    Seu nome *
                  </span>

                  <input
                    type="text"
                    value={nomeAdotante}
                    onChange={(e) =>
                      setNomeAdotante(e.target.value)
                    }
                    placeholder="Digite seu nome"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#168BE8] focus:bg-white"
                  />

                </label>

                <label className="mt-4 block">

                  <span className="text-sm font-black text-[#123A78]">
                    Seu e-mail *
                  </span>

                  <input
                    type="email"
                    value={emailAdotante}
                    onChange={(e) =>
                      setEmailAdotante(e.target.value)
                    }
                    placeholder="seuemail@exemplo.com"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#168BE8] focus:bg-white"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Usaremos apenas para registrar sua adoção.
                  </p>

                </label>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={fecharModal}
                    disabled={adotando}
                    className="rounded-2xl border border-gray-200 px-5 py-3.5 text-sm font-black text-gray-500 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={confirmarAdocao}
                    disabled={adotando}
                    className="rounded-2xl bg-[#F02B78] px-5 py-3.5 text-sm font-black text-white shadow-sm hover:bg-[#D91D65] disabled:opacity-60"
                  >
                    {adotando
                      ? "Confirmando..."
                      : "❤️ Confirmar adoção"}
                  </button>

                </div>

              </>
            ) : (

              <div className="py-5 text-center">

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#DDF8D9] text-5xl">
                  🎉
                </div>

                <h3 className="mt-5 text-3xl font-black text-[#123A78]">
                  Adoção confirmada!
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Obrigado,{" "}
                  <strong className="text-[#123A78]">
                    {nomeAdotante}
                  </strong>
                  !
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Você escolheu presentear{" "}
                  <strong className="text-[#123A78]">
                    {criancaSelecionada.nome}
                  </strong>
                  . 💗
                </p>

                <div className="mt-5 rounded-3xl bg-[#DDF3FF] p-5 text-left">

                  <p className="text-xs font-black uppercase tracking-wide text-[#168BE8]">
                    Agora é só preparar o presente 🎁
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Entregue o presente até{" "}
                    <strong>
                      20/10/2026
                    </strong>
                    .
                  </p>

                </div>

                <button
                  type="button"
                  onClick={fecharModal}
                  className="mt-6 w-full rounded-2xl bg-[#168BE8] px-5 py-3.5 text-sm font-black text-white hover:bg-[#0D75C8]"
                >
                  Voltar para a campanha
                </button>

              </div>
            )}

          </div>
        </div>
      )}

    </main>
  );
}