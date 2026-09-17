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
    botao: "bg-[#168BE8] hover:bg-[#0D75C8]",
    detalhe: "text-[#168BE8]",
  },
  {
    fundo: "bg-[#FFE0EF]",
    botao: "bg-[#F02B78] hover:bg-[#D91D65]",
    detalhe: "text-[#F02B78]",
  },
  {
    fundo: "bg-[#FFF1BD]",
    botao: "bg-[#F39A12] hover:bg-[#D98000]",
    detalhe: "text-[#F39A12]",
  },
  {
    fundo: "bg-[#E9DEFF]",
    botao: "bg-[#7651D9] hover:bg-[#603BC0]",
    detalhe: "text-[#7651D9]",
  },
  {
    fundo: "bg-[#DDF8D9]",
    botao: "bg-[#16A66A] hover:bg-[#0D8B57]",
    detalhe: "text-[#16A66A]",
  },
  {
    fundo: "bg-[#FFE6D2]",
    botao: "bg-[#F15A3A] hover:bg-[#D94729]",
    detalhe: "text-[#F15A3A]",
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

  async function carregarCriancas() {
    const ordemTurmas: Record<string, number> = {
      "Berçário": 1,
      "Maternal I": 2,
      "Maternal II": 3,
      "Pré-escola": 4,
    };

    const { data, error } = await supabase
      .from("criancas_publicas")
      .select(
        "id, nome, data_nascimento, genero, turma, cartinha_ou_desenho, status"
      );

    if (error) {
      console.error(error);
      setErro("Não foi possível carregar as crianças da campanha.");
      return;
    }

    const ordenadas = [...(data || [])].sort((a, b) => {
      const ordemA = ordemTurmas[a.turma] ?? 99;
      const ordemB = ordemTurmas[b.turma] ?? 99;

      if (ordemA !== ordemB) {
        return ordemA - ordemB;
      }

      return a.nome.localeCompare(b.nome, "pt-BR");
    });

    setCriancas(ordenadas);
  }

  async function carregarEstatisticas() {
    const { data, error } = await supabase.rpc("estatisticas_campanha");

    if (error) {
      console.error(error);
      setErro("Não foi possível carregar os números da campanha.");
      return;
    }

    if (data && data.length > 0) {
      setEstatisticas({
        total: Number(data[0].total),
        adotadas: Number(data[0].adotadas),
        disponiveis: Number(data[0].disponiveis),
        presentes_recebidos: Number(data[0].presentes_recebidos),
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

    return criancas.filter((crianca) => crianca.turma === filtro);
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

    setAdotando(true);

    const { data, error } = await supabase.rpc("adotar_crianca", {
      p_crianca_id: criancaSelecionada.id,
      p_adotante_nome: nomeAdotante.trim(),
      p_adotante_email: emailAdotante.trim() || null,
    });

    if (error) {
      console.error(error);

      alert(
        "Não foi possível concluir a adoção. Essa criança pode já ter sido adotada."
      );

      setAdotando(false);
      return;
    }

    if (data === false) {
      alert(
        "Essa criança acabou de ser adotada por outra pessoa. Escolha outra criança."
      );

      setAdotando(false);

      await carregarTudo();
      fecharModal();

      return;
    }

    setCriancas((atual) =>
      atual.filter((item) => item.id !== criancaSelecionada.id)
    );

    await carregarEstatisticas();

    setSucesso(true);
    setAdotando(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8FCFF] text-[#123A78]">
      {/* =========================
          FUNDO DECORATIVO
      ========================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-32 h-56 w-56 rounded-full bg-[#BDEBFF] opacity-70" />
        <div className="absolute -right-20 top-[520px] h-72 w-72 rounded-full bg-[#FFD3E8] opacity-60" />
        <div className="absolute left-[40%] top-[850px] h-64 w-64 rounded-full bg-[#FFF0A8] opacity-50" />
      </div>

      {/* =========================
          TOPO
      ========================== */}

      <header className="bg-white/95 px-5 py-5 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5F6FF] text-3xl shadow-sm">
              🏫
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#168BE8]">
                Creche
              </p>

              <h1 className="text-lg font-black text-[#123A78] sm:text-xl">
                Tesouro Infantil
              </h1>

              <p className="text-xs font-medium text-gray-500">
                Em parceria com a FENORTE
              </p>
            </div>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-black uppercase tracking-widest text-[#168BE8]">
              Semana das Crianças
            </p>

            <p className="text-lg font-black text-[#123A78]">
              2026
            </p>
          </div>
        </div>
      </header>

      {/* =========================
          HERO COMPACTO
      ========================== */}

      <section className="relative px-4 pt-4 sm:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-gradient-to-br from-[#62D8FF] via-[#6EB5FF] to-[#9B7AFF] shadow-xl">
          <div className="relative px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
            <span className="absolute left-4 top-5 text-3xl sm:text-4xl">
              ⭐
            </span>

            <span className="absolute right-5 top-6 text-3xl sm:text-4xl">
              💗
            </span>

            <span className="absolute bottom-5 left-8 text-2xl sm:text-3xl">
              🎈
            </span>

            <span className="absolute bottom-5 right-10 text-3xl sm:text-4xl">
              🎁
            </span>

            <span className="absolute left-[48%] top-3 text-xl">
              ✨
            </span>

            <div className="relative mx-auto max-w-5xl text-center">
              <div className="inline-flex rounded-full bg-[#FFD52E] px-4 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#123A78] shadow-md sm:px-5 sm:py-2 sm:text-xs">
                🎈 Semana das Crianças 2026
              </div>

              <h2 className="mt-3 text-4xl font-black leading-[0.95] tracking-tight text-white drop-shadow-md sm:text-6xl lg:text-7xl">
                Adote uma{" "}
                <span className="text-[#FF2F7D]">
                  CRIANÇA
                </span>
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm font-bold leading-5 text-white sm:text-lg">
                Um pequeno gesto pode transformar o Dia das Crianças em uma
                grande lembrança! 💗
              </p>

              <div className="mx-auto mt-5 grid max-w-3xl gap-2 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#FFB8DB] px-3 py-3 shadow-md sm:rounded-3xl sm:p-4">
                  <div className="text-2xl sm:text-3xl">
                    🔎
                  </div>

                  <p className="mt-1 text-xs font-black text-[#123A78] sm:mt-2 sm:text-sm">
                    Escolha uma criança
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FFE47A] px-3 py-3 shadow-md sm:rounded-3xl sm:p-4">
                  <div className="text-2xl sm:text-3xl">
                    ❤️
                  </div>

                  <p className="mt-1 text-xs font-black text-[#123A78] sm:mt-2 sm:text-sm">
                    Faça a adoção
                  </p>
                </div>

                <div className="rounded-2xl bg-[#BDEBFF] px-3 py-3 shadow-md sm:rounded-3xl sm:p-4">
                  <div className="text-2xl sm:text-3xl">
                    🎁
                  </div>

                  <p className="mt-1 text-xs font-black text-[#123A78] sm:mt-2 sm:text-sm">
                    Entregue o presente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          ORIENTAÇÕES RÁPIDAS
      ========================== */}

      <section className="px-5 pt-4">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#BDEBFF]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4F7FF] text-2xl">
                🧸
              </div>

              <div>
                <p className="text-sm font-black text-[#123A78]">
                  Brinquedo
                </p>

                <p className="text-xs text-gray-500">
                  Novo ou em bom estado
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#FFD2E6]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F7] text-2xl">
                💌
              </div>

              <div>
                <p className="text-sm font-black text-[#123A78]">
                  Cartinha ou desenho
                </p>

                <p className="text-xs text-gray-500">
                  Opcional
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#FFE28A]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF9DD] text-2xl">
                📅
              </div>

              <div>
                <p className="text-sm font-black text-[#123A78]">
                  Entregas até
                </p>

                <p className="text-sm font-black text-[#F15A3A]">
                  07/10/2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          CONTADORES
      ========================== */}

      <section className="px-5 pt-5">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[32px] bg-white shadow-lg ring-1 ring-gray-100 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-5 text-center">
            <div className="text-3xl">
              👧👦
            </div>

            <p className="mt-2 text-3xl font-black text-[#168BE8]">
              {estatisticas.total}
            </p>

            <p className="text-sm font-bold text-gray-500">
              Crianças participantes
            </p>
          </div>

          <div className="border-t border-gray-100 p-6 text-center sm:border-l lg:border-t-0">
            <div className="text-3xl">
              💗
            </div>

            <p className="mt-2 text-3xl font-black text-[#F02B78]">
              {estatisticas.adotadas}
            </p>

            <p className="text-sm font-bold text-gray-500">
              Crianças adotadas
            </p>
          </div>

          <div className="border-t border-gray-100 p-6 text-center lg:border-l lg:border-t-0">
            <div className="text-3xl">
              🎁
            </div>

            <p className="mt-2 text-3xl font-black text-[#F39A12]">
              {estatisticas.disponiveis}
            </p>

            <p className="text-sm font-bold text-gray-500">
              Aguardando adoção
            </p>
          </div>

          <div className="border-t border-gray-100 p-6 text-center sm:border-l lg:border-t-0">
            <div className="text-3xl">
              📦
            </div>

            <p className="mt-2 text-3xl font-black text-[#16A66A]">
              {estatisticas.presentes_recebidos}
            </p>

            <p className="text-sm font-bold text-gray-500">
              Presentes recebidos
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          COMO PARTICIPAR
      ========================== */}

      <section className="px-5 pt-7">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-widest text-[#F02B78]">
              É simples participar
            </p>

            <h3 className="mt-1 text-3xl font-black text-[#123A78] sm:text-4xl">
              Como funciona?
            </h3>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[26px] bg-[#FFE0EF] p-5 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                01
              </div>

              <h4 className="mt-4 text-xl font-black text-[#123A78]">
                Escolha
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Encontre uma criança disponível e veja sua idade e turma.
              </p>
            </div>

            <div className="rounded-[26px] bg-[#FFF1BD] p-5 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                02
              </div>

              <h4 className="mt-4 text-xl font-black text-[#123A78]">
                Adote
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Informe seu nome e confirme que deseja presentear a criança.
              </p>
            </div>

            <div className="rounded-[26px] bg-[#DDF3FF] p-5 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                03
              </div>

              <h4 className="mt-4 text-xl font-black text-[#123A78]">
                Entregue
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Entregue o presente até 07/10/2026 para organizarmos tudo com
                carinho.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          LISTA DE CRIANÇAS
      ========================== */}

      <section id="criancas" className="relative px-5 py-9">
        <div className="mx-auto max-w-7xl">
          <div className="relative text-center">
            <span className="absolute left-0 top-0 hidden text-4xl sm:block">
              ✨
            </span>

            <span className="absolute right-0 top-0 hidden text-4xl sm:block">
              ⭐
            </span>

            <p className="text-sm font-black uppercase tracking-widest text-[#168BE8]">
              Escolha quem você deseja presentear
            </p>

            <h3 className="mt-1 text-3xl font-black text-[#123A78] sm:text-4xl">
              Conheça as crianças 💙
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Escolha uma criança e faça parte dessa história!
            </p>
          </div>

          {/* FILTROS */}

          <div className="mt-5 flex flex-wrap justify-center gap-2">
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

          {erro && (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-center text-sm font-bold text-red-600">
              {erro}
            </div>
          )}

          {/* CARREGANDO */}

          {carregando ? (
            <div className="mt-8 rounded-[30px] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#DDF3FF] border-t-[#168BE8]" />

              <p className="mt-4 text-sm font-bold text-gray-400">
                Preparando a lista das crianças...
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {criancasFiltradas.map((crianca, index) => {
                const cor = coresCards[index % coresCards.length];

                return (
                  <article
                    key={crianca.id}
                    className={`group relative overflow-hidden rounded-[30px] ${cor.fundo} p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <span className="absolute right-4 top-3 text-2xl opacity-60">
                      {index % 2 === 0 ? "♡" : "✦"}
                    </span>

                    <div className="flex items-start justify-between">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                        {emojiTurma(crianca.turma)}
                      </div>

                      <span className="rounded-full bg-white/80 px-3 py-1.5 text-[9px] font-black text-green-600 shadow-sm">
                        DISPONÍVEL
                      </span>
                    </div>

                    <h4 className="mt-5 text-xl font-black text-[#123A78]">
                      {crianca.nome}
                    </h4>

                    <p className="mt-1 text-sm font-bold text-gray-600">
                      {calcularIdade(crianca.data_nascimento)}
                    </p>

                    <p className={`mt-1 text-sm font-black ${cor.detalhe}`}>
                      {crianca.turma}
                    </p>

                    {crianca.cartinha_ou_desenho && (
                      <div className="mt-4 rounded-2xl bg-white/70 p-3 text-xs leading-5 text-gray-600">
                        💌{" "}
                        <strong>Cartinha/desenho:</strong>{" "}
                        {crianca.cartinha_ou_desenho}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => abrirAdocao(crianca)}
                      className={`mt-5 w-full rounded-2xl px-4 py-3.5 text-sm font-black text-white shadow-sm transition ${cor.botao}`}
                    >
                      🎁 Adotar esta criança
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {!carregando && criancasFiltradas.length === 0 && (
            <div className="mt-8 rounded-[30px] bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">
                💙
              </div>

              <p className="mt-4 text-lg font-black text-[#123A78]">
                Essa turma já está toda escolhida!
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Tente outra turma para encontrar uma criança disponível.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================
          RODAPÉ
      ========================== */}

      <footer className="relative overflow-hidden bg-[#123A78] px-5 py-10 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <div className="text-4xl">
            💙 💗 💛
          </div>

          <h3 className="mt-4 text-2xl font-black">
            Juntos por infâncias mais felizes!
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/70">
            Cada presente é um gesto de carinho. Obrigado por fazer parte da
            Semana das Crianças da Creche Tesouro Infantil.
          </p>

          <div className="mt-6">
            <p className="font-black">
              Creche Tesouro Infantil
            </p>

            <p className="mt-1 text-xs text-white/60">
              Em parceria com a FENORTE
            </p>
          </div>
        </div>
      </footer>

      {/* =========================
          MODAL DE ADOÇÃO
      ========================== */}

      {criancaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#123A78]/60 p-0 backdrop-blur-sm sm:items-center sm:p-5">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[32px] bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-[32px]">
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
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-6 rounded-3xl bg-[#FFF1BD] p-5 text-center">
                  <div className="text-4xl">
                    🎁
                  </div>

                  <p className="mt-2 text-sm font-bold leading-6 text-[#123A78]">
                    Que lindo! Você está escolhendo fazer parte da história de{" "}
                    <strong>{criancaSelecionada.nome}</strong>. 💗
                  </p>
                </div>

                <label className="mt-6 block">
                  <span className="text-sm font-black text-[#123A78]">
                    Seu nome *
                  </span>

                  <input
                    type="text"
                    value={nomeAdotante}
                    onChange={(e) => setNomeAdotante(e.target.value)}
                    placeholder="Digite seu nome"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#168BE8] focus:bg-white"
                  />
                </label>

                <label className="mt-4 block">
                  <span className="text-sm font-black text-[#123A78]">
                    E-mail{" "}
                    <span className="font-normal text-gray-400">
                      (opcional)
                    </span>
                  </span>

                  <input
                    type="email"
                    value={emailAdotante}
                    onChange={(e) => setEmailAdotante(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#168BE8] focus:bg-white"
                  />
                </label>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={fecharModal}
                    disabled={adotando}
                    className="rounded-2xl border border-gray-200 px-5 py-3.5 text-sm font-black text-gray-500 hover:bg-gray-50 sm:flex-1"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={confirmarAdocao}
                    disabled={adotando}
                    className="rounded-2xl bg-[#F02B78] px-5 py-3.5 text-sm font-black text-white shadow-sm hover:bg-[#D91D65] disabled:opacity-60 sm:flex-1"
                  >
                    {adotando
                      ? "Confirmando..."
                      : "❤️ Confirmar adoção"}
                  </button>
                </div>
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#DDF8D9] text-5xl">
                  🎉
                </div>

                <h3 className="mt-6 text-3xl font-black text-[#123A78]">
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
                  Você adotou{" "}
                  <strong className="text-[#123A78]">
                    {criancaSelecionada.nome}
                  </strong>
                  . 💗
                </p>

                <div className="mt-6 rounded-3xl bg-[#DDF3FF] p-5 text-left">
                  <p className="text-xs font-black uppercase tracking-wide text-[#168BE8]">
                    Agora é só preparar o presente 🎁
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Entregue o brinquedo até{" "}
                    <strong>07/10/2026</strong>, para que nossa equipe possa
                    organizar tudo antes da Semana das Crianças.
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