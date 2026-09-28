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
  const [cartinhaAberta, setCartinhaAberta] = useState<Crianca | null>(null);

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
        "id, nome, data_nascimento, genero, turma, cartinha_ou_desenho, cartinha_url, status"
      );

    if (error) {
      console.error(error);
      setErro("Não foi possível carregar as crianças da campanha.");
      return;
    }

    const ordenadas = [...(data || [])].sort((a, b) => {
      const ordemA = ordemTurmas[a.turma] ?? 99;
      const ordemB = ordemTurmas[b.turma] ?? 99;

      if (ordemA !== ordemB) return ordemA - ordemB;

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

    const resultado = Array.isArray(data) ? data[0] : data;

    if (resultado) {
      setEstatisticas({
        total: Number(resultado.total ?? 0),
        adotadas: Number(resultado.adotadas ?? 0),
        disponiveis: Number(resultado.disponiveis ?? 0),
        presentes_recebidos: Number(resultado.presentes_recebidos ?? 0),
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

    const nome = nomeAdotante.trim();
    const email = emailAdotante.trim();

    if (!nome) {
      alert("Informe seu nome para confirmar a adoção.");
      return;
    }

    if (!email) {
      alert("Informe seu e-mail para confirmar a adoção.");
      return;
    }

    setAdotando(true);

    const { data, error } = await supabase.rpc("adotar_crianca", {
      p_crianca_id: criancaSelecionada.id,
      p_adotante_nome: nome,
      p_adotante_email: email,
    });

    if (error) {
      console.error(error);

      alert(
        "Não foi possível concluir a escolha. Essa criança pode já ter sido escolhida por outra pessoa."
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
      atual.filter((item) => item.id !== criancaSelecionada.id)
    );

    await carregarEstatisticas();

    setSucesso(true);
    setAdotando(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8FCFF] text-[#123A78]">
      {/* Fundo decorativo */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-[#BDEBFF]/70 blur-sm" />
        <div className="absolute -right-24 top-[420px] h-80 w-80 rounded-full bg-[#FFD5E8]/60 blur-sm" />
        <div className="absolute left-[35%] top-[900px] h-72 w-72 rounded-full bg-[#FFF0A8]/45 blur-sm" />
      </div>

      {/* CABEÇALHO */}
      <header className="bg-white/95 px-4 py-3 shadow-sm sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5F6FF] text-2xl shadow-sm sm:h-14 sm:w-14 sm:text-3xl">
              🏫
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#168BE8] sm:text-[10px]">
                Creche
              </p>
              <h1 className="text-base font-black leading-tight text-[#123A78] sm:text-xl">
                Tesouro Infantil
              </h1>
              <p className="text-[11px] font-medium text-gray-500 sm:text-xs">
                Em parceria com a FENORD
              </p>
            </div>
          </div>

          <div className="hidden rounded-full bg-[#FFF1BD] px-4 py-2 text-right shadow-sm sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#F39A12]">
              Semana das Crianças
            </p>
            <p className="text-lg font-black text-[#123A78]">2026</p>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="px-3 pt-3 sm:px-5 sm:pt-5">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[34px] bg-gradient-to-br from-[#64D8FF] via-[#70B9FF] to-[#9277F5] shadow-xl">
          <div className="relative px-4 pb-5 pt-4 sm:px-8 sm:pb-8 sm:pt-6 lg:px-12">
            <span className="absolute left-3 top-5 text-2xl sm:left-8 sm:text-4xl">⭐</span>
            <span className="absolute right-4 top-4 text-2xl sm:right-8 sm:text-4xl">💗</span>
            <span className="absolute bottom-4 left-5 text-xl sm:left-10 sm:text-3xl">✨</span>
            <span className="absolute bottom-5 right-5 text-xl sm:right-10 sm:text-3xl">🎈</span>

            <div className="mx-auto max-w-6xl text-center">
              <div className="inline-flex rounded-full bg-[#FFD52E] px-4 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#123A78] shadow-md sm:px-5 sm:py-2 sm:text-xs">
                🎈 Semana das Crianças 2026
              </div>

              {/* Faixa de crianças em estilo ilustração, sem depender de imagem externa */}
              <div className="mx-auto mt-3 flex max-w-2xl items-end justify-center gap-1 text-[3.1rem] leading-none sm:gap-2 sm:text-7xl">
                <span className="-rotate-6 drop-shadow-md">👦🏻</span>
                <span className="translate-y-1 drop-shadow-md">👧🏽</span>
                <span className="translate-y-1 drop-shadow-md">👦🏽</span>
                <span className="-rotate-6 drop-shadow-md">👧🏻</span>
              </div>

              <div className="mx-auto -mt-1 max-w-5xl rounded-[30px] bg-white/95 px-4 py-4 shadow-xl sm:px-8 sm:py-6">
                <p className="text-xl font-black leading-tight text-[#123A78] sm:text-3xl">
                  Escolha e presenteie uma
                </p>
                <h2 className="mt-1 text-[3.25rem] font-black leading-[0.88] tracking-tight text-[#F02B78] drop-shadow-sm sm:text-7xl lg:text-8xl">
                  CRIANÇA
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-xs font-bold leading-5 text-[#123A78]/80 sm:text-base">
                  Um pequeno gesto pode transformar o Dia das Crianças em uma grande lembrança! 💗
                </p>
              </div>

              <div className="mx-auto mt-4 grid max-w-4xl grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-2xl bg-[#FFB8DB] px-2 py-2.5 shadow-md sm:rounded-3xl sm:p-4">
                  <div className="text-xl sm:text-3xl">🔎</div>
                  <p className="mt-1 text-[9px] font-black leading-3 text-[#123A78] sm:text-sm">
                    Escolha uma criança
                  </p>
                </div>
                <div className="rounded-2xl bg-[#FFE47A] px-2 py-2.5 shadow-md sm:rounded-3xl sm:p-4">
                  <div className="text-xl sm:text-3xl">❤️</div>
                  <p className="mt-1 text-[9px] font-black leading-3 text-[#123A78] sm:text-sm">
                    Escolha e presenteie
                  </p>
                </div>
                <div className="rounded-2xl bg-[#BDEBFF] px-2 py-2.5 shadow-md sm:rounded-3xl sm:p-4">
                  <div className="text-xl sm:text-3xl">🎁</div>
                  <p className="mt-1 text-[9px] font-black leading-3 text-[#123A78] sm:text-sm">
                    Entregue o presente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFORMAÇÕES PRINCIPAIS */}
      <section className="px-4 pt-4 sm:px-5 sm:pt-6">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-2">
          <div className="rounded-[28px] bg-[#DDF3FF] p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🧸</div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#168BE8]">
                  O presente
                </p>
                <h3 className="mt-1 text-lg font-black text-[#123A78]">
                  Um brinquedo cheio de carinho
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm">
                  Escolha um brinquedo adequado à idade e à faixa etária da criança.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-[#FFE8F2] p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <div className="text-3xl">📅</div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#F02B78]">
                  Entrega
                </p>
                <h3 className="mt-1 text-lg font-black text-[#123A78]">
                  Até 20/10/2026
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm">
                  Entregue o presente na FENORD, no local indicado pela organização.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ESTATÍSTICAS */}
      <section className="px-4 pt-5 sm:px-5 sm:pt-7">
        <div className="mx-auto grid max-w-7xl grid-cols-2 overflow-hidden rounded-[30px] bg-white shadow-lg ring-1 ring-gray-100 lg:grid-cols-4">
          <div className="p-4 text-center sm:p-6">
            <div className="text-3xl">👧👦</div>
            <p className="mt-1 text-3xl font-black text-[#168BE8] sm:mt-2 sm:text-4xl">
              {estatisticas.total}
            </p>
            <p className="text-[11px] font-bold leading-4 text-gray-500 sm:text-sm">
              Crianças participantes
            </p>
          </div>

          <div className="border-l border-gray-100 p-4 text-center sm:p-6">
            <div className="text-3xl">💗</div>
            <p className="mt-1 text-3xl font-black text-[#F02B78] sm:mt-2 sm:text-4xl">
              {estatisticas.adotadas}
            </p>
            <p className="text-[11px] font-bold leading-4 text-gray-500 sm:text-sm">
              Crianças escolhidas
            </p>
          </div>

          <div className="border-t border-gray-100 p-4 text-center sm:border-l sm:p-6 lg:border-t-0">
            <div className="text-3xl">🎁</div>
            <p className="mt-1 text-3xl font-black text-[#F39A12] sm:mt-2 sm:text-4xl">
              {estatisticas.disponiveis}
            </p>
            <p className="text-[11px] font-bold leading-4 text-gray-500 sm:text-sm">
              Aguardando presente
            </p>
          </div>

          <div className="border-l border-t border-gray-100 p-4 text-center sm:p-6 lg:border-t-0">
            <div className="text-3xl">📦</div>
            <p className="mt-1 text-3xl font-black text-[#16A66A] sm:mt-2 sm:text-4xl">
              {estatisticas.presentes_recebidos}
            </p>
            <p className="text-[11px] font-bold leading-4 text-gray-500 sm:text-sm">
              Presentes recebidos
            </p>
          </div>
        </div>
      </section>

      {/* COMO PARTICIPAR */}
      <section className="px-4 pt-9 sm:px-5 sm:pt-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F02B78] sm:text-sm">
              É simples participar
            </p>
            <h3 className="mt-1 text-3xl font-black text-[#123A78] sm:text-5xl">
              Como participar?
            </h3>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="relative rounded-[28px] bg-[#FFE0EF] p-4 shadow-sm sm:p-6">
              <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#F02B78] text-xs font-black text-white">
                01
              </div>
              <div className="pt-10 text-center">
                <div className="text-4xl">🔎</div>
                <h4 className="mt-2 text-lg font-black text-[#123A78]">Escolha</h4>
                <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm">
                  Encontre uma criança disponível e veja sua idade e turma.
                </p>
              </div>
            </div>

            <div className="relative rounded-[28px] bg-[#FFF1BD] p-4 shadow-sm sm:p-6">
              <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#F39A12] text-xs font-black text-white">
                02
              </div>
              <div className="pt-10 text-center">
                <div className="text-4xl">💗</div>
                <h4 className="mt-2 text-lg font-black text-[#123A78]">
                  Escolha e presenteie
                </h4>
                <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm">
                  Informe seu nome e e-mail e confirme que deseja presentear a criança.
                </p>
              </div>
            </div>

            <div className="relative rounded-[28px] bg-[#DDF3FF] p-4 shadow-sm sm:p-6">
              <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#168BE8] text-xs font-black text-white">
                03
              </div>
              <div className="pt-10 text-center">
                <div className="text-4xl">🎁</div>
                <h4 className="mt-2 text-lg font-black text-[#123A78]">Entregue</h4>
                <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm">
                  Entregue o presente até <strong>20/10/2026</strong> para organizarmos tudo com carinho.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CRIANÇAS */}
      <section id="criancas" className="relative px-4 py-10 sm:px-5 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="relative text-center">
            <span className="absolute left-0 top-0 hidden text-4xl sm:block">💗</span>
            <span className="absolute right-0 top-0 hidden text-4xl sm:block">⭐</span>

            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#168BE8] sm:text-sm">
              Escolha quem você deseja presentear
            </p>
            <h3 className="mt-1 text-[2rem] font-black leading-tight text-[#123A78] sm:text-5xl">
              Conheça as crianças 💙
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
              Escolha uma criança e faça parte dessa história!
            </p>
          </div>

          {/* filtros */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center">
            {filtros.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFiltro(item)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-black transition sm:px-5 sm:py-3 ${
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
            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {criancasFiltradas.map((crianca, index) => {
                const cor = coresCards[index % coresCards.length];

                return (
                  <article
                    key={crianca.id}
                    className={`group relative overflow-hidden rounded-[30px] ${cor.fundo} p-4 shadow-sm ring-1 ring-black/[0.03] transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5`}
                  >
                    <span className="absolute right-4 top-3 text-2xl opacity-60">
                      {index % 2 === 0 ? "♡" : "✦"}
                    </span>

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm sm:h-16 sm:w-16 sm:text-3xl">
                        {emojiTurma(crianca.turma)}
                      </div>

                      <span className="rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black text-green-600 shadow-sm">
                        DISPONÍVEL
                      </span>
                    </div>

                    <h4 className="mt-4 text-lg font-black text-[#123A78] sm:text-xl">
                      {crianca.nome}
                    </h4>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <span className="font-bold text-gray-600">
                        {calcularIdade(crianca.data_nascimento)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className={`font-black ${cor.detalhe}`}>
                        {crianca.turma}
                      </span>
                    </div>

                    {crianca.cartinha_ou_desenho && (
                      <div className="mt-4 rounded-2xl bg-white/70 p-3 text-xs leading-5 text-gray-600">
                        💌 <strong>Mensagem:</strong> {crianca.cartinha_ou_desenho}
                      </div>
                    )}

                    {crianca.cartinha_url && (
                      <button
                        type="button"
                        onClick={() => setCartinhaAberta(crianca)}
                        className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#F02B78] shadow-sm ring-1 ring-[#FFD2E6] transition hover:bg-[#FFF5FA]"
                      >
                        💌 Ver cartinha ou desenho
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => abrirAdocao(crianca)}
                      className={`mt-3 w-full rounded-2xl px-4 py-3.5 text-sm font-black text-white shadow-md transition ${cor.botao}`}
                    >
                      🎁 Escolher e presentear
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {!carregando && criancasFiltradas.length === 0 && (
            <div className="mt-8 rounded-[30px] bg-white p-10 text-center shadow-sm">
              <div className="text-5xl">💙</div>
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

      {/* RODAPÉ */}
      <footer className="relative overflow-hidden bg-[#123A78] px-5 py-10 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <div className="text-4xl">💙 💗 💛</div>
          <h3 className="mt-4 text-2xl font-black">
            Juntos por infâncias mais felizes!
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/70">
            Cada presente é um gesto de carinho. Obrigado por fazer parte da Semana das Crianças da Creche Tesouro Infantil.
          </p>
          <div className="mt-6">
            <p className="font-black">Creche Tesouro Infantil</p>
            <p className="mt-1 text-xs text-white/60">Em parceria com a FENORD</p>
          </div>
        </div>
      </footer>

      {/* CARTINHA */}
      {cartinhaAberta?.cartinha_url && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#123A78]/75 p-4 backdrop-blur-sm"
          onClick={() => setCartinhaAberta(null)}
        >
          <div
            className="relative max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-[30px] bg-white p-4 shadow-2xl sm:p-6"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#F02B78]">
                  💌 Cartinha ou desenho
                </p>
                <h3 className="mt-1 text-2xl font-black text-[#123A78]">
                  {cartinhaAberta.nome}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {cartinhaAberta.turma} • {calcularIdade(cartinhaAberta.data_nascimento)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCartinhaAberta(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                aria-label="Fechar cartinha"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[76vh] overflow-auto rounded-2xl bg-[#F8FCFF] p-2 text-center">
              <img
                src={cartinhaAberta.cartinha_url}
                alt={`Cartinha ou desenho de ${cartinhaAberta.nome}`}
                className="mx-auto max-h-[72vh] w-auto max-w-full rounded-xl object-contain"
              />
            </div>

            <button
              type="button"
              onClick={() => setCartinhaAberta(null)}
              className="mt-4 w-full rounded-2xl bg-[#168BE8] px-5 py-3.5 text-sm font-black text-white shadow-sm hover:bg-[#0D75C8]"
            >
              Voltar para a criança
            </button>
          </div>
        </div>
      )}

      {/* ADOÇÃO */}
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
                      {criancaSelecionada.turma} • {calcularIdade(criancaSelecionada.data_nascimento)}
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
                  <div className="text-4xl">🎁</div>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#123A78]">
                    Que lindo! Você está escolhendo fazer parte da história de{" "}
                    <strong>{criancaSelecionada.nome}</strong>. 💗
                  </p>
                </div>

                <label className="mt-6 block">
                  <span className="text-sm font-black text-[#123A78]">Seu nome *</span>
                  <input
                    type="text"
                    value={nomeAdotante}
                    onChange={(e) => setNomeAdotante(e.target.value)}
                    placeholder="Digite seu nome"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#168BE8] focus:bg-white"
                  />
                </label>

                <label className="mt-4 block">
                  <span className="text-sm font-black text-[#123A78]">Seu e-mail *</span>
                  <input
                    type="email"
                    value={emailAdotante}
                    onChange={(e) => setEmailAdotante(e.target.value)}
                    placeholder="Digite seu e-mail"
                    required
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
                    {adotando ? "Confirmando..." : "❤️ Confirmar adoção"}
                  </button>
                </div>
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#DDF8D9] text-5xl">
                  🎉
                </div>

                <h3 className="mt-6 text-3xl font-black text-[#123A78]">
                  Escolha confirmada!
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Obrigado, <strong className="text-[#123A78]">{nomeAdotante}</strong>!
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Você escolheu presentear{" "}
                  <strong className="text-[#123A78]">{criancaSelecionada.nome}</strong>. 💗
                </p>

                <div className="mt-6 rounded-3xl bg-[#DDF3FF] p-5 text-left">
                  <p className="text-xs font-black uppercase tracking-wide text-[#168BE8]">
                    Agora é só preparar o presente 🎁
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Entregue o brinquedo até <strong>20/10/2026</strong>, para que nossa equipe possa organizar tudo antes da Semana das Crianças.
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