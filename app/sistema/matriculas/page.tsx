"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseSistema } from "@/lib/supabaseSistema";

type Aluno = {
  id: number;
  nome: string;
  data_nascimento: string;
  ativo: boolean;
};

type Turma = {
  id: number;
  nome: string;
  ano_letivo: number;
  turno: string | null;
  professor: string | null;
  capacidade: number | null;
  ativa: boolean | null;
};

type Matricula = {
  id: number;
  aluno_id: number;
  turma_id: number | null;
  ano_letivo: number;
  numero_matricula: string | null;
  turno: string | null;
  data_matricula: string | null;
  situacao: string | null;
  observacao: string | null;
  faz_contraturno: boolean;
  ficha_matricula_assinada: boolean | null;
  data_declaracao: string | null;
  data_transferencia: string | null;
  aluno?: Aluno | null;
  turma?: Turma | null;
};

const ANO_LETIVO = 2026;

const situacoes = ["Ativa", "Aguardando", "Transferida", "Cancelada", "Concluída"];

function formatarData(data: string | null) {
  if (!data) return "-";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function dataHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function calcularIdade(data: string) {
  const nascimento = new Date(`${data}T12:00:00`);
  const hoje = new Date();
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    anos--;
  }
  return anos;
}

export default function MatriculasPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [matriculaEditando, setMatriculaEditando] = useState<Matricula | null>(null);

  const [alunoId, setAlunoId] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [numeroMatricula, setNumeroMatricula] = useState("");
  const [dataMatricula, setDataMatricula] = useState(dataHoje());
  const [situacao, setSituacao] = useState("Ativa");
  const [observacao, setObservacao] = useState("");
  const [fazContraturno, setFazContraturno] = useState(false);
  const [fichaAssinada, setFichaAssinada] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    const [resultadoAlunos, resultadoTurmas, resultadoMatriculas] =
      await Promise.all([
        supabaseSistema
          .from("alunos")
          .select("id,nome,data_nascimento,ativo")
          .eq("ativo", true)
          .order("nome", { ascending: true }),

        supabaseSistema
          .from("turmas")
          .select("id,nome,ano_letivo,turno,professor,capacidade,ativa")
          .eq("ano_letivo", ANO_LETIVO)
          .eq("ativa", true)
          .order("id", { ascending: true }),

        supabaseSistema
          .from("matriculas")
          .select(
            "id,aluno_id,turma_id,ano_letivo,numero_matricula,turno,data_matricula,situacao,observacao,faz_contraturno,ficha_matricula_assinada,data_declaracao,data_transferencia"
          )
          .eq("ano_letivo", ANO_LETIVO)
          .order("id", { ascending: false }),
      ]);

    if (resultadoAlunos.error) {
      setErro(`Erro ao carregar alunos: ${resultadoAlunos.error.message}`);
    }

    if (resultadoTurmas.error) {
      setErro(`Erro ao carregar turmas: ${resultadoTurmas.error.message}`);
    }

    if (resultadoMatriculas.error) {
      setErro(`Erro ao carregar matrículas: ${resultadoMatriculas.error.message}`);
    }

    const listaAlunos = (resultadoAlunos.data || []) as Aluno[];
    const listaTurmas = (resultadoTurmas.data || []) as Turma[];
    const listaMatriculas = (resultadoMatriculas.data || []) as Matricula[];

    const alunosPorId = new Map(listaAlunos.map((aluno) => [aluno.id, aluno]));
    const turmasPorId = new Map(listaTurmas.map((turma) => [turma.id, turma]));

    const completas = listaMatriculas.map((matricula) => ({
      ...matricula,
      aluno: alunosPorId.get(matricula.aluno_id) || null,
      turma: matricula.turma_id
        ? turmasPorId.get(matricula.turma_id) || null
        : null,
    }));

    setAlunos(listaAlunos);
    setTurmas(listaTurmas);
    setMatriculas(completas);
    setCarregando(false);
  }

  function limparFormulario() {
    setAlunoId("");
    setTurmaId("");
    setNumeroMatricula("");
    setDataMatricula(dataHoje());
    setSituacao("Ativa");
    setObservacao("");
    setFazContraturno(false);
    setFichaAssinada(false);
    setMatriculaEditando(null);
  }

  function abrirNovaMatricula() {
    limparFormulario();
    setErro("");
    setMensagem("");
    setMostrarModal(true);
  }

  function abrirEdicao(matricula: Matricula) {
    setMatriculaEditando(matricula);
    setAlunoId(String(matricula.aluno_id));
    setTurmaId(matricula.turma_id ? String(matricula.turma_id) : "");
    setNumeroMatricula(matricula.numero_matricula || "");
    setDataMatricula(matricula.data_matricula || dataHoje());
    setSituacao(matricula.situacao || "Ativa");
    setObservacao(matricula.observacao || "");
    setFazContraturno(Boolean(matricula.faz_contraturno));
    setFichaAssinada(Boolean(matricula.ficha_matricula_assinada));
    setErro("");
    setMensagem("");
    setMostrarModal(true);
  }

  async function salvarMatricula() {
    setErro("");
    setMensagem("");

    if (!alunoId) {
      setErro("Selecione o aluno.");
      return;
    }

    if (!turmaId) {
      setErro("Selecione a turma.");
      return;
    }

    const turmaSelecionada = turmas.find(
      (turma) => turma.id === Number(turmaId)
    );

    if (!turmaSelecionada) {
      setErro("A turma selecionada não foi encontrada.");
      return;
    }

    setSalvando(true);

    const dados = {
      aluno_id: Number(alunoId),
      turma_id: turmaSelecionada.id,
      ano_letivo: ANO_LETIVO,
      numero_matricula: numeroMatricula.trim() || null,
      turno: turmaSelecionada.turno,
      data_matricula: dataMatricula || null,
      situacao,
      observacao: observacao.trim() || null,
      faz_contraturno: fazContraturno,
      ficha_matricula_assinada: fichaAssinada,
    };

    if (matriculaEditando) {
      const { data, error } = await supabaseSistema
        .from("matriculas")
        .update(dados)
        .eq("id", matriculaEditando.id)
        .select()
        .single();

      if (error) {
        setErro(`Não foi possível salvar a matrícula: ${error.message}`);
        setSalvando(false);
        return;
      }

      const atualizada: Matricula = {
        ...(data as Matricula),
        aluno: alunos.find((aluno) => aluno.id === Number(alunoId)) || null,
        turma: turmaSelecionada,
      };

      setMatriculas((anteriores) =>
        anteriores.map((item) =>
          item.id === matriculaEditando.id ? atualizada : item
        )
      );

      setMensagem("✅ Matrícula atualizada com sucesso.");
    } else {
      const jaMatriculado = matriculas.some(
        (matricula) =>
          matricula.aluno_id === Number(alunoId) &&
          matricula.situacao !== "Cancelada" &&
          matricula.situacao !== "Transferida"
      );

      if (jaMatriculado) {
        setErro("Este aluno já possui uma matrícula ativa em 2026.");
        setSalvando(false);
        return;
      }

      const { data, error } = await supabaseSistema
        .from("matriculas")
        .insert(dados)
        .select()
        .single();

      if (error) {
        setErro(`Não foi possível criar a matrícula: ${error.message}`);
        setSalvando(false);
        return;
      }

      const nova: Matricula = {
        ...(data as Matricula),
        aluno: alunos.find((aluno) => aluno.id === Number(alunoId)) || null,
        turma: turmaSelecionada,
      };

      setMatriculas((anteriores) => [nova, ...anteriores]);
      setMensagem("✅ Matrícula criada com sucesso.");
    }

    setMostrarModal(false);
    limparFormulario();
    setSalvando(false);
  }

  async function cancelarMatricula(matricula: Matricula) {
    const confirmou = window.confirm(
      `Deseja realmente cancelar a matrícula de ${matricula.aluno?.nome || "este aluno"}?`
    );

    if (!confirmou) return;

    setErro("");
    setMensagem("");
    setSalvando(true);

    const { error } = await supabaseSistema
      .from("matriculas")
      .update({ situacao: "Cancelada" })
      .eq("id", matricula.id);

    if (error) {
      setErro(`Não foi possível cancelar a matrícula: ${error.message}`);
      setSalvando(false);
      return;
    }

    setMatriculas((anteriores) =>
      anteriores.map((item) =>
        item.id === matricula.id
          ? { ...item, situacao: "Cancelada" }
          : item
      )
    );

    setMensagem("Matrícula cancelada.");
    setSalvando(false);
  }

  const matriculasFiltradas = useMemo(() => {
    const texto = busca.trim().toLowerCase();

    return matriculas.filter((matricula) => {
      const correspondeBusca =
        !texto ||
        (matricula.aluno?.nome || "").toLowerCase().includes(texto) ||
        (matricula.numero_matricula || "").toLowerCase().includes(texto);

      const correspondeTurma =
        !filtroTurma || String(matricula.turma_id) === filtroTurma;

      const correspondeSituacao =
        !filtroSituacao || matricula.situacao === filtroSituacao;

      return correspondeBusca && correspondeTurma && correspondeSituacao;
    });
  }, [matriculas, busca, filtroTurma, filtroSituacao]);

  const alunosSemMatricula = useMemo(() => {
    const matriculados = new Set(
      matriculas
        .filter(
          (matricula) =>
            matricula.situacao !== "Cancelada" &&
            matricula.situacao !== "Transferida"
        )
        .map((matricula) => matricula.aluno_id)
    );

    return alunos.filter((aluno) => !matriculados.has(aluno.id));
  }, [alunos, matriculas]);

  const totalAtivas = matriculas.filter(
    (matricula) => matricula.situacao === "Ativa"
  ).length;

  const totalContraturno = matriculas.filter(
    (matricula) => matricula.faz_contraturno
  ).length;

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-4 md:p-7">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              Sistema de Gestão
            </p>
            <h1 className="text-3xl font-extrabold text-slate-800">
              Matrículas
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerenciamento das matrículas da Creche Tesouro Infantil.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Ano letivo
              </p>
              <p className="font-extrabold text-slate-700">{ANO_LETIVO}</p>
            </div>

            <button
              type="button"
              onClick={abrirNovaMatricula}
              className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-extrabold hover:bg-emerald-700 transition shadow-sm"
            >
              + Nova matrícula
            </button>
          </div>
        </header>

        {mensagem && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4 text-emerald-700 font-semibold">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-red-700 font-semibold">
            {erro}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Matrículas
            </p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">
              {matriculas.length}
            </p>
            <p className="text-sm text-slate-500 mt-1">Registradas em 2026</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Ativas
            </p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">
              {totalAtivas}
            </p>
            <p className="text-sm text-slate-500 mt-1">Matrículas vigentes</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Sem matrícula
            </p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">
              {alunosSemMatricula.length}
            </p>
            <p className="text-sm text-slate-500 mt-1">Alunos ativos</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Contraturno
            </p>
            <p className="text-3xl font-extrabold text-purple-600 mt-1">
              {totalContraturno}
            </p>
            <p className="text-sm text-slate-500 mt-1">Alunos marcados</p>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Buscar aluno
                </label>
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome ou nº da matrícula"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Turma
                </label>
                <select
                  value={filtroTurma}
                  onChange={(e) => setFiltroTurma(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="">Todas as turmas</option>
                  {turmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome} {turma.turno ? `• ${turma.turno}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Situação
                </label>
                <select
                  value={filtroSituacao}
                  onChange={(e) => setFiltroSituacao(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="">Todas</option>
                  {situacoes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {carregando ? (
            <div className="p-10 text-center text-slate-500">
              Carregando matrículas...
            </div>
          ) : matriculasFiltradas.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="font-extrabold text-slate-700">
                Nenhuma matrícula encontrada
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Ajuste os filtros ou cadastre uma nova matrícula.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-left">
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Aluno
                    </th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Turma
                    </th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Turno
                    </th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Matrícula
                    </th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Situação
                    </th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Contraturno
                    </th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500 text-right">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {matriculasFiltradas.map((matricula) => {
                    const situacaoAtual = matricula.situacao || "-";
                    const ativa = situacaoAtual === "Ativa";

                    return (
                      <tr key={matricula.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-slate-800">
                            {matricula.aluno?.nome || "Aluno não encontrado"}
                          </div>
                          {matricula.aluno?.data_nascimento && (
                            <div className="text-xs text-slate-400 mt-1">
                              {formatarData(matricula.aluno.data_nascimento)} • {calcularIdade(matricula.aluno.data_nascimento)} anos
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-700">
                            {matricula.turma?.nome || "Sem turma"}
                          </div>
                          {matricula.turma?.professor && (
                            <div className="text-xs text-slate-400 mt-1">
                              {matricula.turma.professor}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {matricula.turno || matricula.turma?.turno || "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          <div>{matricula.numero_matricula || "—"}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            {formatarData(matricula.data_matricula)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                              ativa
                                ? "bg-emerald-50 text-emerald-700"
                                : situacaoAtual === "Cancelada"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {situacaoAtual}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {matricula.faz_contraturno ? (
                            <span className="inline-flex rounded-full px-3 py-1 text-xs font-extrabold bg-purple-50 text-purple-700">
                              Sim
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">Não</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => abrirEdicao(matricula)}
                              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-200 transition"
                            >
                              Editar
                            </button>

                            {situacaoAtual !== "Cancelada" && (
                              <button
                                type="button"
                                onClick={() => cancelarMatricula(matricula)}
                                disabled={salvando}
                                className="rounded-xl bg-red-50 px-3 py-2 text-sm font-extrabold text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {mostrarModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
              <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-600">
                    Secretaria
                  </p>
                  <h2 className="text-2xl font-extrabold text-slate-800">
                    {matriculaEditando ? "Editar matrícula" : "Nova matrícula"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMostrarModal(false);
                    limparFormulario();
                  }}
                  className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-5">
                {erro && (
                  <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 font-semibold">
                    {erro}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-extrabold text-slate-700 mb-2">
                    Aluno
                  </label>
                  <select
                    value={alunoId}
                    onChange={(e) => setAlunoId(e.target.value)}
                    disabled={Boolean(matriculaEditando)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
                  >
                    <option value="">Selecione o aluno</option>
                    {(matriculaEditando
                      ? alunos
                      : alunosSemMatricula
                    ).map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>
                        {aluno.nome} • {formatarData(aluno.data_nascimento)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-extrabold text-slate-700 mb-2">
                      Turma
                    </label>
                    <select
                      value={turmaId}
                      onChange={(e) => setTurmaId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="">Selecione a turma</option>
                      {turmas.map((turma) => (
                        <option key={turma.id} value={turma.id}>
                          {turma.nome} • {turma.turno || "Sem turno"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-slate-700 mb-2">
                      Nº da matrícula
                    </label>
                    <input
                      value={numeroMatricula}
                      onChange={(e) => setNumeroMatricula(e.target.value)}
                      placeholder="Ex.: 2026-001"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-extrabold text-slate-700 mb-2">
                      Data da matrícula
                    </label>
                    <input
                      type="date"
                      value={dataMatricula}
                      onChange={(e) => setDataMatricula(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-slate-700 mb-2">
                      Situação
                    </label>
                    <select
                      value={situacao}
                      onChange={(e) => setSituacao(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      {situacoes.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={fazContraturno}
                      onChange={(e) => setFazContraturno(e.target.checked)}
                      className="h-5 w-5"
                    />
                    <span>
                      <span className="block font-extrabold text-slate-700">
                        Faz contraturno
                      </span>
                      <span className="block text-xs text-slate-400 mt-1">
                        Marque quando o aluno também participa do contraturno.
                      </span>
                    </span>
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={fichaAssinada}
                      onChange={(e) => setFichaAssinada(e.target.checked)}
                      className="h-5 w-5"
                    />
                    <span>
                      <span className="block font-extrabold text-slate-700">
                        Ficha assinada
                      </span>
                      <span className="block text-xs text-slate-400 mt-1">
                        Registra a entrega da ficha de matrícula assinada.
                      </span>
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-slate-700 mb-2">
                    Observação
                  </label>
                  <textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={4}
                    placeholder="Observações da matrícula..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModal(false);
                    limparFormulario();
                  }}
                  disabled={salvando}
                  className="rounded-xl bg-slate-100 px-5 py-3 font-extrabold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={salvarMatricula}
                  disabled={salvando}
                  className="rounded-xl bg-emerald-600 px-5 py-3 font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {salvando ? "Salvando..." : "Salvar matrícula"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
