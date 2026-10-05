"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseSistema } from "@/lib/supabaseSistema";

type Aluno = {
  id: number;
  nome: string;
  data_nascimento: string;
  ativo: boolean;
};

type Censo = {
  id: number;
  aluno_id: number;
  ano_letivo: number;
  cadastrado: boolean;
  data_conferencia: string | null;
};

type LinhaCenso = {
  aluno: Aluno;
  censo: Censo | null;
};

const ANO_LETIVO = 2026;

function formatarData(data: string | null) {
  if (!data) return "-";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function calcularIdade(data: string) {
  const nascimento = new Date(`${data}T12:00:00`);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade;
}

export default function CensoPage() {
  const [linhas, setLinhas] = useState<LinhaCenso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    const [resultadoAlunos, resultadoCenso] = await Promise.all([
      supabaseSistema
        .from("alunos")
        .select("id,nome,data_nascimento,ativo")
        .eq("ativo", true)
        .order("nome", { ascending: true }),

      supabaseSistema
        .from("censo_escolar")
        .select("id,aluno_id,ano_letivo,cadastrado,data_conferencia")
        .eq("ano_letivo", ANO_LETIVO),
    ]);

    if (resultadoAlunos.error) {
      setErro(`Erro ao carregar alunos: ${resultadoAlunos.error.message}`);
      setCarregando(false);
      return;
    }

    if (resultadoCenso.error) {
      setErro(`Erro ao carregar Censo: ${resultadoCenso.error.message}`);
      setCarregando(false);
      return;
    }

    const alunos = (resultadoAlunos.data || []) as Aluno[];
    const censos = (resultadoCenso.data || []) as Censo[];
    const censoPorAluno = new Map(censos.map((item) => [item.aluno_id, item]));

    setLinhas(
      alunos.map((aluno) => ({
        aluno,
        censo: censoPorAluno.get(aluno.id) || null,
      }))
    );

    setCarregando(false);
  }

  async function alterarSituacao(linha: LinhaCenso, cadastrado: boolean) {
    setErro("");
    setMensagem("");
    setSalvandoId(linha.aluno.id);

    if (!linha.censo) {
      const { data, error } = await supabaseSistema
        .from("censo_escolar")
        .insert({
          aluno_id: linha.aluno.id,
          ano_letivo: ANO_LETIVO,
          cadastrado,
          data_conferencia: cadastrado
            ? new Date().toISOString().split("T")[0]
            : null,
        })
        .select("id,aluno_id,ano_letivo,cadastrado,data_conferencia")
        .single();

      if (error) {
        setErro(`Não foi possível salvar o Censo: ${error.message}`);
        setSalvandoId(null);
        return;
      }

      setLinhas((anteriores) =>
        anteriores.map((item) =>
          item.aluno.id === linha.aluno.id
            ? { ...item, censo: data as Censo }
            : item
        )
      );

      setMensagem(
        cadastrado
          ? `✅ ${linha.aluno.nome} foi marcado como cadastrado no Censo.`
          : `ℹ️ O Censo de ${linha.aluno.nome} foi registrado como não cadastrado.`
      );
      setSalvandoId(null);
      return;
    }

    const { data, error } = await supabaseSistema
      .from("censo_escolar")
      .update({
        cadastrado,
        data_conferencia: cadastrado
          ? new Date().toISOString().split("T")[0]
          : null,
      })
      .eq("id", linha.censo.id)
      .select("id,aluno_id,ano_letivo,cadastrado,data_conferencia")
      .single();

    if (error) {
      setErro(`Não foi possível atualizar o Censo: ${error.message}`);
      setSalvandoId(null);
      return;
    }

    setLinhas((anteriores) =>
      anteriores.map((item) =>
        item.aluno.id === linha.aluno.id
          ? { ...item, censo: data as Censo }
          : item
      )
    );

    setMensagem(
      cadastrado
        ? `✅ ${linha.aluno.nome} foi marcado como cadastrado no Censo.`
        : `ℹ️ ${linha.aluno.nome} foi marcado como não cadastrado.`
    );
    setSalvandoId(null);
  }

  const estatisticas = useMemo(() => {
    const total = linhas.length;
    const cadastrados = linhas.filter((item) => item.censo?.cadastrado).length;
    const naoCadastrados = linhas.filter(
      (item) => !item.censo || !item.censo.cadastrado
    ).length;
    const semRegistro = linhas.filter((item) => !item.censo).length;

    return { total, cadastrados, naoCadastrados, semRegistro };
  }, [linhas]);

  const linhasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return linhas.filter((linha) => {
      const correspondeBusca =
        !termo || linha.aluno.nome.toLowerCase().includes(termo);

      if (!correspondeBusca) return false;

      if (filtro === "cadastrados") {
        return Boolean(linha.censo?.cadastrado);
      }

      if (filtro === "pendentes") {
        return !linha.censo || !linha.censo.cadastrado;
      }

      if (filtro === "sem-registro") {
        return !linha.censo;
      }

      return true;
    });
  }, [linhas, busca, filtro]);

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-4 md:p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Sistema de Gestão
            </p>
            <h1 className="text-2xl font-extrabold text-slate-800 md:text-3xl">
              Censo Escolar
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Conferência dos alunos cadastrados no Censo Escolar de {ANO_LETIVO}.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ano letivo
            </p>
            <p className="font-extrabold text-slate-700">{ANO_LETIVO}</p>
          </div>
        </header>

        {erro && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {erro}
          </div>
        )}

        {mensagem && !erro && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {mensagem}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Alunos ativos
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-800">
              {estatisticas.total}
            </p>
            <p className="mt-1 text-xs text-slate-400">Base do Censo 2026</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Cadastrados
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">
              {estatisticas.cadastrados}
            </p>
            <p className="mt-1 text-xs text-slate-400">Conferidos no Censo</p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Pendentes
            </p>
            <p className="mt-2 text-3xl font-extrabold text-amber-600">
              {estatisticas.naoCadastrados}
            </p>
            <p className="mt-1 text-xs text-slate-400">Ainda não conferidos</p>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
              Sem registro
            </p>
            <p className="mt-2 text-3xl font-extrabold text-purple-600">
              {estatisticas.semRegistro}
            </p>
            <p className="mt-1 text-xs text-slate-400">Precisam ser preparados</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Situação dos alunos
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Marque cada aluno conforme a conferência do Censo Escolar.
                </p>
              </div>

              <button
                type="button"
                onClick={carregarDados}
                disabled={carregando}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ↻ Atualizar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-5 md:grid-cols-[1fr_220px]">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar aluno pelo nome..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />

            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="todos">Todos os alunos</option>
              <option value="cadastrados">Cadastrados</option>
              <option value="pendentes">Pendentes</option>
              <option value="sem-registro">Sem registro</option>
            </select>
          </div>

          {carregando ? (
            <div className="p-10 text-center text-sm font-semibold text-slate-400">
              Carregando Censo Escolar...
            </div>
          ) : linhasFiltradas.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl">🏛️</div>
              <p className="mt-3 text-sm font-extrabold text-slate-700">
                Nenhum aluno encontrado
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Ajuste a busca ou o filtro para visualizar os alunos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {linhasFiltradas.map((linha) => {
                const cadastrado = Boolean(linha.censo?.cadastrado);
                const salvando = salvandoId === linha.aluno.id;

                return (
                  <div
                    key={linha.aluno.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-extrabold text-slate-800">
                          {linha.aluno.nome}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            cadastrado
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {cadastrado ? "Cadastrado" : "Pendente"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {calcularIdade(linha.aluno.data_nascimento)} anos • Nascimento: {formatarData(linha.aluno.data_nascimento)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {linha.censo?.data_conferencia
                          ? `Última conferência: ${formatarData(linha.censo.data_conferencia)}`
                          : "Ainda não possui conferência registrada."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={salvando || cadastrado}
                        onClick={() => alterarSituacao(linha, true)}
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {salvando && !cadastrado ? "Salvando..." : "✓ Cadastrado"}
                      </button>

                      <button
                        type="button"
                        disabled={salvando || !cadastrado}
                        onClick={() => alterarSituacao(linha, false)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Marcar pendente
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <p className="text-center text-xs text-slate-400">
          Sistema Tesouro Infantil • Censo Escolar {ANO_LETIVO}
        </p>
      </div>
    </main>
  );
}
