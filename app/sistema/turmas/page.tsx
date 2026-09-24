"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseSistema } from "@/lib/supabaseSistema";

type Turma = {
  id: number;
  nome: string;
  ano_letivo: number;
  turno: string | null;
  professor: string | null;
  capacidade: number | null;
  ativa: boolean | null;
};

type Aluno = {
  id: number;
  nome: string;
  data_nascimento: string;
  ativo: boolean;
};

type Matricula = {
  id: number;
  aluno_id: number;
  turma_id: number | null;
  ano_letivo: number;
  turno: string | null;
  situacao: string | null;
  faz_contraturno: boolean;
};

type Monitora = {
  id: number;
  nome: string;
  ativa: boolean;
};

type TurmaMonitora = {
  id: number;
  turma_id: number;
  monitora_id: number;
};

const ANO_LETIVO = 2026;

const definicoesTurmas = [
  {
    nome: "Berçário B1/B2",
    turno: "Integral",
    tipo: "Creche",
  },
  {
    nome: "Maternal I",
    turno: "Integral",
    tipo: "Creche",
  },
  {
    nome: "Maternal II",
    turno: "Integral",
    tipo: "Creche",
  },
  {
    nome: "Pré-escola",
    turno: "Manhã",
    tipo: "Pré-escola",
  },
  {
    nome: "Pré-escola",
    turno: "Tarde",
    tipo: "Pré-escola",
  },
  {
    nome: "Contraturno",
    turno: "Manhã",
    tipo: "Contraturno",
  },
  {
    nome: "Contraturno",
    turno: "Tarde",
    tipo: "Contraturno",
  },
];

function formatarData(data: string) {
  if (!data) return "-";

  const partes = data.split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterTipoTurma(turma: Turma) {
  if (turma.nome === "Contraturno") {
    return "Contraturno";
  }

  if (turma.nome === "Pré-escola") {
    return "Pré-escola";
  }

  return "Creche";
}

export default function SistemaTurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [monitoras, setMonitoras] = useState<Monitora[]>([]);
  const [turmaMonitoras, setTurmaMonitoras] = useState<
    TurmaMonitora[]
  >([]);

  const [turmaSelecionada, setTurmaSelecionada] =
    useState<Turma | null>(null);

  const [turmaParaAdicionarAluno, setTurmaParaAdicionarAluno] =
    useState<Turma | null>(null);

  const [busca, setBusca] = useState("");
  const [buscaAluno, setBuscaAluno] = useState("");

  const [mostrarCadastroMonitora, setMostrarCadastroMonitora] =
    useState(false);

  const [nomeMonitora, setNomeMonitora] = useState("");

  const [mostrarAlunos, setMostrarAlunos] =
    useState(false);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [vinculandoAlunoId, setVinculandoAlunoId] =
    useState<number | null>(null);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    const [
      resultadoTurmas,
      resultadoAlunos,
      resultadoMatriculas,
      resultadoMonitoras,
      resultadoTurmaMonitoras,
    ] = await Promise.all([
      supabaseSistema
        .from("turmas")
        .select("*")
        .eq("ano_letivo", ANO_LETIVO)
        .order("id", { ascending: true }),

      supabaseSistema
        .from("alunos")
        .select("id, nome, data_nascimento, ativo")
        .eq("ativo", true)
        .order("nome", { ascending: true }),

      supabaseSistema
        .from("matriculas")
        .select("*")
        .eq("ano_letivo", ANO_LETIVO),

      supabaseSistema
        .from("monitoras")
        .select("*")
        .eq("ativa", true)
        .order("nome", { ascending: true }),

      supabaseSistema
        .from("turma_monitoras")
        .select("*"),
    ]);

    if (resultadoTurmas.error) {
      setErro(
        `Erro ao carregar turmas: ${resultadoTurmas.error.message}`
      );
    }

    if (resultadoAlunos.error) {
      setErro(
        `Erro ao carregar alunos: ${resultadoAlunos.error.message}`
      );
    }

    if (resultadoMatriculas.error) {
      setErro(
        `Erro ao carregar matrículas: ${resultadoMatriculas.error.message}`
      );
    }

    if (resultadoMonitoras.error) {
      setErro(
        `Erro ao carregar monitoras: ${resultadoMonitoras.error.message}`
      );
    }

    if (resultadoTurmaMonitoras.error) {
      setErro(
        `Erro ao carregar monitoras das turmas: ${resultadoTurmaMonitoras.error.message}`
      );
    }

    setTurmas(resultadoTurmas.data || []);
    setAlunos(resultadoAlunos.data || []);
    setMatriculas(resultadoMatriculas.data || []);
    setMonitoras(resultadoMonitoras.data || []);
    setTurmaMonitoras(resultadoTurmaMonitoras.data || []);

    setCarregando(false);
  }

  function garantirTurmasPadrao() {
    return definicoesTurmas.map((definicao) => {
      return turmas.find(
        (turma) =>
          turma.nome === definicao.nome &&
          turma.turno === definicao.turno
      );
    });
  }

  function obterMatriculasDaTurma(turma: Turma) {
    if (turma.nome === "Contraturno") {
      const turnoPreEscolar =
        turma.turno === "Manhã"
          ? "Tarde"
          : turma.turno === "Tarde"
          ? "Manhã"
          : null;

      if (!turnoPreEscolar) return [];

      const turmasPreEscolar = turmas.filter(
        (item) =>
          item.nome === "Pré-escola" &&
          item.turno === turnoPreEscolar
      );

      const idsTurmasPreEscolar = new Set(
        turmasPreEscolar.map((item) => item.id)
      );

      return matriculas.filter(
        (matricula) =>
          matricula.turma_id !== null &&
          idsTurmasPreEscolar.has(matricula.turma_id) &&
          matricula.faz_contraturno === true
      );
    }

    return matriculas.filter(
      (matricula) =>
        matricula.turma_id === turma.id &&
        matricula.ano_letivo === ANO_LETIVO
    );
  }

  function obterAlunosDaTurma(turma: Turma) {
    const matriculasDaTurma = obterMatriculasDaTurma(turma);

    const ids = new Set(
      matriculasDaTurma.map(
        (matricula) => matricula.aluno_id
      )
    );

    return alunos.filter((aluno) => ids.has(aluno.id));
  }

  function obterMatriculaDoAluno(alunoId: number) {
    return matriculas.find(
      (matricula) =>
        matricula.aluno_id === alunoId &&
        matricula.ano_letivo === ANO_LETIVO
    );
  }

  function obterNomeTurmaDaMatricula(
    matricula: Matricula | undefined
  ) {
    if (!matricula || matricula.turma_id === null) {
      return "Sem turma";
    }

    const turma = turmas.find(
      (item) => item.id === matricula.turma_id
    );

    if (!turma) return "Turma não encontrada";

    return `${turma.nome} • ${turma.turno || ""}`;
  }

  function obterMonitorasDaTurma(turma: Turma) {
    const relacoes = turmaMonitoras.filter(
      (item) => item.turma_id === turma.id
    );

    const ids = new Set(
      relacoes.map((item) => item.monitora_id)
    );

    return monitoras.filter((monitora) =>
      ids.has(monitora.id)
    );
  }

  async function salvarProfessora(
    turma: Turma,
    professora: string
  ) {
    setErro("");
    setMensagem("");

    const { error } = await supabaseSistema
      .from("turmas")
      .update({
        professor: professora.trim() || null,
      })
      .eq("id", turma.id);

    if (error) {
      setErro(
        `Erro ao salvar professora: ${error.message}`
      );
      return;
    }

    setTurmas((anteriores) =>
      anteriores.map((item) =>
        item.id === turma.id
          ? {
              ...item,
              professor: professora.trim() || null,
            }
          : item
      )
    );

    setTurmaSelecionada((anterior) =>
      anterior && anterior.id === turma.id
        ? {
            ...anterior,
            professor: professora.trim() || null,
          }
        : anterior
    );

    setMensagem("Professora atualizada com sucesso.");
  }

  async function adicionarMonitora(
    turma: Turma,
    monitoraId: number
  ) {
    setErro("");
    setMensagem("");

    const jaExiste = turmaMonitoras.some(
      (item) =>
        item.turma_id === turma.id &&
        item.monitora_id === monitoraId
    );

    if (jaExiste) {
      setErro("Essa monitora já está vinculada à turma.");
      return;
    }

    const { data, error } = await supabaseSistema
      .from("turma_monitoras")
      .insert({
        turma_id: turma.id,
        monitora_id: monitoraId,
      })
      .select()
      .single();

    if (error) {
      setErro(
        `Erro ao vincular monitora: ${error.message}`
      );
      return;
    }

    setTurmaMonitoras((anteriores) => [
      ...anteriores,
      data,
    ]);

    setMensagem("Monitora vinculada à turma.");
  }

  async function removerMonitora(
    turmaId: number,
    monitoraId: number
  ) {
    setErro("");
    setMensagem("");

    const { error } = await supabaseSistema
      .from("turma_monitoras")
      .delete()
      .eq("turma_id", turmaId)
      .eq("monitora_id", monitoraId);

    if (error) {
      setErro(
        `Erro ao remover monitora: ${error.message}`
      );
      return;
    }

    setTurmaMonitoras((anteriores) =>
      anteriores.filter(
        (item) =>
          !(
            item.turma_id === turmaId &&
            item.monitora_id === monitoraId
          )
      )
    );

    setMensagem("Monitora removida da turma.");
  }

  async function cadastrarMonitora() {
    if (!nomeMonitora.trim()) {
      setErro("Informe o nome da monitora.");
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    const { data, error } = await supabaseSistema
      .from("monitoras")
      .insert({
        nome: nomeMonitora.trim(),
        ativa: true,
      })
      .select()
      .single();

    if (error) {
      setErro(
        `Erro ao cadastrar monitora: ${error.message}`
      );
      setSalvando(false);
      return;
    }

    setMonitoras((anteriores) =>
      [...anteriores, data].sort((a, b) =>
        a.nome.localeCompare(b.nome)
      )
    );

    setNomeMonitora("");
    setMostrarCadastroMonitora(false);
    setMensagem("Monitora cadastrada com sucesso.");
    setSalvando(false);
  }

  async function alternarContraturno(
    matricula: Matricula
  ) {
    setErro("");
    setMensagem("");

    const novoValor = !matricula.faz_contraturno;

    const { error } = await supabaseSistema
      .from("matriculas")
      .update({
        faz_contraturno: novoValor,
      })
      .eq("id", matricula.id);

    if (error) {
      setErro(
        `Erro ao atualizar contraturno: ${error.message}`
      );
      return;
    }

    setMatriculas((anteriores) =>
      anteriores.map((item) =>
        item.id === matricula.id
          ? {
              ...item,
              faz_contraturno: novoValor,
            }
          : item
      )
    );

    setMensagem(
      novoValor
        ? "Aluno adicionado ao contraturno."
        : "Aluno retirado do contraturno."
    );
  }

  async function vincularAluno(
    aluno: Aluno,
    turma: Turma
  ) {
    if (turma.nome === "Contraturno") {
      setErro(
        "O contraturno é automático. Marque 'Faz contraturno: Sim' na turma de Pré-escola do aluno."
      );
      return;
    }

    setVinculandoAlunoId(aluno.id);
    setErro("");
    setMensagem("");

    try {
      const matriculaExistente =
        obterMatriculaDoAluno(aluno.id);

      if (matriculaExistente) {
        const { data, error } = await supabaseSistema
          .from("matriculas")
          .update({
            turma_id: turma.id,
            turno: turma.turno,
            ano_letivo: ANO_LETIVO,
          })
          .eq("id", matriculaExistente.id)
          .select()
          .single();

        if (error) {
          throw new Error(
            `Não foi possível mover o aluno: ${error.message}`
          );
        }

        setMatriculas((anteriores) =>
          anteriores.map((item) =>
            item.id === matriculaExistente.id
              ? data
              : item
          )
        );

        setMensagem(
          `${aluno.nome} foi vinculado à turma ${turma.nome} ${turma.turno}.`
        );
      } else {
        const { data, error } = await supabaseSistema
          .from("matriculas")
          .insert({
            aluno_id: aluno.id,
            turma_id: turma.id,
            ano_letivo: ANO_LETIVO,
            turno: turma.turno,
            situacao: "Ativa",
            faz_contraturno: false,
          })
          .select()
          .single();

        if (error) {
          throw new Error(
            `Não foi possível criar a matrícula: ${error.message}`
          );
        }

        setMatriculas((anteriores) => [
          ...anteriores,
          data,
        ]);

        setMensagem(
          `${aluno.nome} foi vinculado à turma ${turma.nome} ${turma.turno}.`
        );
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível vincular o aluno."
      );
    } finally {
      setVinculandoAlunoId(null);
    }
  }

  async function criarTurmasQueFaltam() {
    setSalvando(true);
    setErro("");
    setMensagem("");

    for (const definicao of definicoesTurmas) {
      const existe = turmas.some(
        (turma) =>
          turma.nome === definicao.nome &&
          turma.turno === definicao.turno
      );

      if (existe) continue;

      const { error } = await supabaseSistema
        .from("turmas")
        .insert({
          nome: definicao.nome,
          ano_letivo: ANO_LETIVO,
          turno: definicao.turno,
          professor: null,
          capacidade: null,
          ativa: true,
        });

      if (error) {
        setErro(
          `Erro ao criar ${definicao.nome} ${definicao.turno}: ${error.message}`
        );
        setSalvando(false);
        return;
      }
    }

    await carregarDados();

    setMensagem(
      "Turmas padrão conferidas e criadas quando necessário."
    );

    setSalvando(false);
  }

  const turmasVisiveis = useMemo(() => {
    const texto = busca.trim().toLowerCase();

    if (!texto) return turmas;

    return turmas.filter((turma) => {
      return (
        turma.nome.toLowerCase().includes(texto) ||
        (turma.turno || "")
          .toLowerCase()
          .includes(texto) ||
        (turma.professor || "")
          .toLowerCase()
          .includes(texto)
      );
    });
  }, [turmas, busca]);

  const alunosParaVincular = useMemo(() => {
    const texto = buscaAluno.trim().toLowerCase();

    let lista = alunos;

    if (texto) {
      lista = alunos.filter((aluno) =>
        aluno.nome.toLowerCase().includes(texto)
      );
    }

    return [...lista].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
  }, [alunos, buscaAluno]);

  const totalAlunosDistribuidos = useMemo(() => {
    const ids = new Set<number>();

    matriculas.forEach((matricula) => {
      if (matricula.turma_id !== null) {
        ids.add(matricula.aluno_id);
      }
    });

    return ids.size;
  }, [matriculas]);

  const turmasCriadas = garantirTurmasPadrao().filter(
    Boolean
  ).length;

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-4 md:p-7">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* CABEÇALHO */}

        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <p className="text-sm font-semibold text-blue-600">
              Sistema de Gestão
            </p>

            <h1 className="text-3xl font-extrabold text-slate-800">
              Turmas
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Organização das turmas, professoras, monitoras e alunos.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">

              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Ano letivo
              </p>

              <p className="font-extrabold text-slate-700">
                {ANO_LETIVO}
              </p>

            </div>

            <button
              type="button"
              onClick={criarTurmasQueFaltam}
              disabled={salvando}
              className="bg-blue-600 text-white px-5 py-3 rounded-xl font-extrabold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {salvando
                ? "Organizando..."
                : "✓ Conferir turmas"}
            </button>

          </div>

        </header>

        {/* MENSAGENS */}

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

        {/* RESUMO */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">

            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
              👩‍🏫
            </div>

            <p className="text-sm text-slate-400 mt-4">
              Turmas cadastradas
            </p>

            <p className="text-3xl font-extrabold text-slate-800 mt-1">
              {carregando ? "..." : turmas.length}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              de {definicoesTurmas.length} turmas previstas
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">

            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
              👧
            </div>

            <p className="text-sm text-slate-400 mt-4">
              Alunos distribuídos
            </p>

            <p className="text-3xl font-extrabold text-emerald-700 mt-1">
              {carregando
                ? "..."
                : totalAlunosDistribuidos}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              matrículas no ano letivo
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">

            <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-xl">
              👩
            </div>

            <p className="text-sm text-slate-400 mt-4">
              Monitoras ativas
            </p>

            <p className="text-3xl font-extrabold text-orange-600 mt-1">
              {carregando
                ? "..."
                : monitoras.length}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              disponíveis para as turmas
            </p>

          </div>

        </section>

        {/* BUSCA */}

        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h2 className="text-xl font-extrabold text-slate-800">
                Organização das turmas
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Clique em uma turma para gerenciar equipe e alunos.
              </p>

            </div>

            <input
              type="text"
              value={busca}
              onChange={(e) =>
                setBusca(e.target.value)
              }
              placeholder="🔎 Buscar turma..."
              className="w-full md:w-80 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </section>

        {/* TURMAS */}

        {carregando ? (

          <div className="bg-white rounded-3xl p-12 text-center text-slate-400">
            Carregando turmas...
          </div>

        ) : turmasVisiveis.length === 0 ? (

          <div className="bg-white rounded-3xl p-12 text-center">

            <div className="text-5xl mb-4">
              👩‍🏫
            </div>

            <h3 className="text-lg font-extrabold text-slate-700">
              Nenhuma turma encontrada
            </h3>

            <p className="text-sm text-slate-400 mt-2">
              Clique em “Conferir turmas” para criar as turmas padrão.
            </p>

          </div>

        ) : (

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {turmasVisiveis.map((turma) => {

              const alunosDaTurma =
                obterAlunosDaTurma(turma);

              const monitorasDaTurma =
                obterMonitorasDaTurma(turma);

              const tipo =
                obterTipoTurma(turma);

              return (
                <div
                  key={turma.id}
                  className="text-left bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                >

                  <div
                    className={`
                      p-5
                      ${
                        tipo === "Contraturno"
                          ? "bg-gradient-to-r from-orange-50 to-amber-50"
                          : tipo === "Pré-escola"
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50"
                          : "bg-gradient-to-r from-emerald-50 to-teal-50"
                      }
                    `}
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                          {tipo}
                        </p>

                        <h3 className="text-xl font-extrabold text-slate-800 mt-1">
                          {turma.nome}
                        </h3>

                        <p className="text-sm font-bold text-blue-600 mt-1">
                          {turma.turno || "Turno não informado"}
                        </p>

                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm">
                        {tipo === "Contraturno"
                          ? "🔄"
                          : tipo === "Pré-escola"
                          ? "🎨"
                          : "👶"}
                      </div>

                    </div>

                  </div>

                  <div className="p-5">

                    <div className="space-y-3">

                      <div className="flex items-center justify-between gap-3">

                        <span className="text-sm text-slate-400">
                          Professora
                        </span>

                        <span className="text-sm font-bold text-slate-700 text-right">
                          {turma.professor ||
                            (tipo === "Contraturno"
                              ? "Não se aplica"
                              : "Não cadastrada")}
                        </span>

                      </div>

                      <div className="flex items-center justify-between">

                        <span className="text-sm text-slate-400">
                          Monitoras
                        </span>

                        <span className="text-sm font-bold text-slate-700">
                          {monitorasDaTurma.length}
                        </span>

                      </div>

                      <div className="flex items-center justify-between">

                        <span className="text-sm text-slate-400">
                          Alunos
                        </span>

                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold">
                          {alunosDaTurma.length}
                        </span>

                      </div>

                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">

                      {turma.nome !== "Contraturno" && (
                        <button
                          type="button"
                          onClick={() => {
                            setTurmaParaAdicionarAluno(turma);
                            setBuscaAluno("");
                            setErro("");
                            setMensagem("");
                          }}
                          className="w-full rounded-xl bg-blue-600 text-white px-4 py-3 text-sm font-extrabold hover:bg-blue-700 transition"
                        >
                          + Adicionar aluno
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setTurmaSelecionada(turma);
                          setMostrarAlunos(true);
                          setErro("");
                          setMensagem("");
                        }}
                        className="w-full rounded-xl bg-slate-50 text-slate-700 px-4 py-3 text-sm font-bold hover:bg-slate-100 transition"
                      >
                        Gerenciar turma →
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </section>

        )}

        {/* MODAL DA TURMA */}

        {mostrarAlunos && turmaSelecionada && (

          <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">

            <div className="min-h-full flex items-center justify-center">

              <div className="bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden">

                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    <p className="text-sm font-semibold text-blue-600">
                      {obterTipoTurma(turmaSelecionada)}
                    </p>

                    <h2 className="text-2xl font-extrabold text-slate-800">
                      {turmaSelecionada.nome}
                    </h2>

                    <p className="text-sm text-slate-400 mt-1">
                      Turno: {turmaSelecionada.turno}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMostrarAlunos(false);
                      setTurmaSelecionada(null);
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200"
                  >
                    ✕
                  </button>

                </div>

                <div className="p-6 md:p-8 max-h-[78vh] overflow-y-auto">

                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* PROFESSORA */}

                    <div className="rounded-3xl border border-slate-100 overflow-hidden">

                      <div className="p-5 bg-blue-50 border-b border-blue-100">

                        <h3 className="font-extrabold text-slate-800">
                          👩‍🏫 Professora
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                          Professora responsável pela turma
                        </p>

                      </div>

                      <div className="p-5">

                        {turmaSelecionada.nome ===
                        "Contraturno" ? (

                          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                            O contraturno não possui professora.
                            A turma é acompanhada pelas monitoras.
                          </div>

                        ) : (

                          <div className="flex gap-3">

                            <input
                              type="text"
                              defaultValue={
                                turmaSelecionada.professor || ""
                              }
                              placeholder="Nome da professora"
                              id={`professora-${turmaSelecionada.id}`}
                              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <button
                              type="button"
                              onClick={() => {

                                const campo =
                                  document.getElementById(
                                    `professora-${turmaSelecionada.id}`
                                  ) as HTMLInputElement | null;

                                salvarProfessora(
                                  turmaSelecionada,
                                  campo?.value || ""
                                );
                              }}
                              className="px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                            >
                              Salvar
                            </button>

                          </div>

                        )}

                      </div>

                    </div>

                    {/* MONITORAS */}

                    <div className="rounded-3xl border border-slate-100 overflow-hidden">

                      <div className="p-5 bg-orange-50 border-b border-orange-100 flex items-center justify-between gap-3">

                        <div>

                          <h3 className="font-extrabold text-slate-800">
                            👩 Monitoras
                          </h3>

                          <p className="text-sm text-slate-400 mt-1">
                            Uma ou mais monitoras podem acompanhar a turma.
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setMostrarCadastroMonitora(true)
                          }
                          className="px-3 py-2 rounded-xl bg-white text-orange-700 border border-orange-200 text-xs font-extrabold hover:bg-orange-100"
                        >
                          + Nova
                        </button>

                      </div>

                      <div className="p-5 space-y-3">

                        {obterMonitorasDaTurma(
                          turmaSelecionada
                        ).length === 0 ? (

                          <p className="text-sm text-slate-400">
                            Nenhuma monitora vinculada.
                          </p>

                        ) : (

                          obterMonitorasDaTurma(
                            turmaSelecionada
                          ).map((monitora) => (

                            <div
                              key={monitora.id}
                              className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"
                            >

                              <div className="flex items-center gap-3">

                                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                                  👩
                                </div>

                                <p className="font-bold text-slate-700">
                                  {monitora.nome}
                                </p>

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removerMonitora(
                                    turmaSelecionada.id,
                                    monitora.id
                                  )
                                }
                                className="text-xs font-bold text-red-600 hover:text-red-700"
                              >
                                Remover
                              </button>

                            </div>

                          ))

                        )}

                        <div className="pt-3 border-t border-slate-100">

                          <select
                            defaultValue=""
                            onChange={(e) => {

                              const id =
                                Number(e.target.value);

                              if (!id) return;

                              adicionarMonitora(
                                turmaSelecionada,
                                id
                              );

                              e.target.value = "";
                            }}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:border-orange-500"
                          >

                            <option value="">
                              + Vincular monitora existente
                            </option>

                            {monitoras
                              .filter(
                                (monitora) =>
                                  !obterMonitorasDaTurma(
                                    turmaSelecionada
                                  ).some(
                                    (item) =>
                                      item.id ===
                                      monitora.id
                                  )
                              )
                              .map((monitora) => (

                                <option
                                  key={monitora.id}
                                  value={monitora.id}
                                >
                                  {monitora.nome}
                                </option>

                              ))}

                          </select>

                        </div>

                      </div>

                    </div>

                  </section>

                  {/* ALUNOS DA TURMA */}

                  <section className="mt-6 rounded-3xl border border-slate-100 overflow-hidden">

                    <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">

                      <div>

                        <h3 className="font-extrabold text-slate-800">
                          👧 Alunos da turma
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                          {obterAlunosDaTurma(
                            turmaSelecionada
                          ).length}{" "}
                          aluno(s) nesta turma
                        </p>

                      </div>

                      <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold">
                        {obterAlunosDaTurma(
                          turmaSelecionada
                        ).length} alunos
                      </span>

                    </div>

                    <div className="divide-y divide-slate-100">

                      {obterAlunosDaTurma(
                        turmaSelecionada
                      ).length === 0 ? (

                        <div className="p-10 text-center">

                          <div className="text-4xl mb-3">
                            👧
                          </div>

                          <p className="font-extrabold text-slate-700">
                            Nenhum aluno nesta turma
                          </p>

                          <p className="text-sm text-slate-400 mt-1">
                            Use “Adicionar aluno” para vincular uma criança.
                          </p>

                        </div>

                      ) : (

                        obterAlunosDaTurma(
                          turmaSelecionada
                        ).map((aluno) => {

                          const matricula =
                            obterMatriculaDoAluno(
                              aluno.id
                            );

                          return (
                            <div
                              key={aluno.id}
                              className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            >

                              <div className="flex items-center gap-3">

                                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                                  👧
                                </div>

                                <div>

                                  <p className="font-extrabold text-slate-700">
                                    {aluno.nome}
                                  </p>

                                  <p className="text-xs text-slate-400 mt-1">
                                    Nascimento:{" "}
                                    {formatarData(
                                      aluno.data_nascimento
                                    )}
                                  </p>

                                </div>

                              </div>

                              {turmaSelecionada.nome ===
                                "Pré-escola" &&
                                matricula && (

                                  <div className="flex items-center gap-3">

                                    <span className="text-xs font-bold text-slate-400">
                                      Faz contraturno
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        alternarContraturno(
                                          matricula
                                        )
                                      }
                                      className={`
                                        px-4
                                        py-2
                                        rounded-xl
                                        text-xs
                                        font-extrabold
                                        transition
                                        ${
                                          matricula.faz_contraturno
                                            ? "bg-emerald-600 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }
                                      `}
                                    >
                                      {matricula.faz_contraturno
                                        ? "Sim"
                                        : "Não"}
                                    </button>

                                  </div>

                                )}

                            </div>
                          );
                        })

                      )}

                    </div>

                  </section>

                  {/* CONTRATURNO */}

                  {turmaSelecionada.nome ===
                    "Contraturno" && (

                    <div className="mt-6 rounded-2xl bg-orange-50 border border-orange-100 p-5">

                      <p className="font-extrabold text-orange-700">
                        🔄 Contraturno automático
                      </p>

                      <p className="text-sm text-slate-600 mt-1">
                        Os alunos desta turma vêm automaticamente
                        da Pré-escola do turno oposto quando a opção
                        “Faz contraturno” está marcada como “Sim”.
                      </p>

                    </div>

                  )}

                </div>

                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex justify-end">

                  <button
                    type="button"
                    onClick={() => {
                      setMostrarAlunos(false);
                      setTurmaSelecionada(null);
                    }}
                    className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900"
                  >
                    Fechar
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* MODAL ADICIONAR ALUNO */}

        {turmaParaAdicionarAluno && (

          <div className="fixed inset-0 z-[10000] bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">

            <div className="min-h-full flex items-center justify-center">

              <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden">

                {/* CABEÇALHO */}

                <div className="p-6 border-b border-slate-100">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-sm font-semibold text-blue-600">
                        Vincular aluno
                      </p>

                      <h2 className="text-2xl font-extrabold text-slate-800">
                        {turmaParaAdicionarAluno.nome}
                      </h2>

                      <p className="text-sm text-slate-400 mt-1">
                        {turmaParaAdicionarAluno.turno}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTurmaParaAdicionarAluno(null);
                        setBuscaAluno("");
                      }}
                      className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200"
                    >
                      ✕
                    </button>

                  </div>

                  <div className="mt-5">

                    <input
                      type="text"
                      value={buscaAluno}
                      onChange={(e) =>
                        setBuscaAluno(e.target.value)
                      }
                      placeholder="🔎 Buscar aluno pelo nome..."
                      autoFocus
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </div>

                {/* LISTA */}

                <div className="p-6 max-h-[65vh] overflow-y-auto">

                  <div className="mb-4 rounded-2xl bg-blue-50 border border-blue-100 p-4">

                    <p className="text-sm font-bold text-blue-700">
                      Como funciona
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Se o aluno já estiver em outra turma,
                      o sistema moverá a matrícula para esta turma.
                      Não será criada uma segunda matrícula.
                    </p>

                  </div>

                  <div className="space-y-2">

                    {alunosParaVincular.length === 0 ? (

                      <div className="text-center py-10">

                        <div className="text-4xl mb-3">
                          🔎
                        </div>

                        <p className="font-extrabold text-slate-700">
                          Nenhum aluno encontrado
                        </p>

                      </div>

                    ) : (

                      alunosParaVincular.map((aluno) => {

                        const matricula =
                          obterMatriculaDoAluno(
                            aluno.id
                          );

                        const jaNestaTurma =
                          matricula?.turma_id ===
                          turmaParaAdicionarAluno.id;

                        const estaEmOutraTurma =
                          matricula &&
                          matricula.turma_id !== null &&
                          !jaNestaTurma;

                        const nomeTurmaAtual =
                          obterNomeTurmaDaMatricula(
                            matricula
                          );

                        const processando =
                          vinculandoAlunoId === aluno.id;

                        return (
                          <div
                            key={aluno.id}
                            className={`
                              rounded-2xl
                              border
                              p-4
                              flex
                              flex-col
                              md:flex-row
                              md:items-center
                              md:justify-between
                              gap-4
                              ${
                                jaNestaTurma
                                  ? "border-emerald-100 bg-emerald-50/50"
                                  : "border-slate-100 bg-white"
                              }
                            `}
                          >

                            <div className="flex items-center gap-3 min-w-0">

                              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                👧
                              </div>

                              <div className="min-w-0">

                                <p className="font-extrabold text-slate-700 truncate">
                                  {aluno.nome}
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                  Nascimento:{" "}
                                  {formatarData(
                                    aluno.data_nascimento
                                  )}
                                </p>

                                <p
                                  className={`
                                    text-xs
                                    font-semibold
                                    mt-1
                                    ${
                                      jaNestaTurma
                                        ? "text-emerald-600"
                                        : estaEmOutraTurma
                                        ? "text-orange-600"
                                        : "text-slate-400"
                                    }
                                  `}
                                >
                                  {jaNestaTurma
                                    ? "✓ Já está nesta turma"
                                    : estaEmOutraTurma
                                    ? `Atual: ${nomeTurmaAtual}`
                                    : "Sem turma definida"}
                                </p>

                              </div>

                            </div>

                            <div className="shrink-0">

                              {jaNestaTurma ? (

                                <span className="inline-flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 px-4 py-2 text-xs font-extrabold">
                                  ✓ Vinculado
                                </span>

                              ) : (

                                <button
                                  type="button"
                                  disabled={processando}
                                  onClick={() =>
                                    vincularAluno(
                                      aluno,
                                      turmaParaAdicionarAluno
                                    )
                                  }
                                  className={`
                                    rounded-xl
                                    px-4
                                    py-2.5
                                    text-xs
                                    font-extrabold
                                    text-white
                                    transition
                                    disabled:opacity-60
                                    ${
                                      estaEmOutraTurma
                                        ? "bg-orange-600 hover:bg-orange-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                    }
                                  `}
                                >
                                  {processando
                                    ? "Salvando..."
                                    : estaEmOutraTurma
                                    ? "Mover para cá"
                                    : "Vincular"}
                                </button>

                              )}

                            </div>

                          </div>
                        );
                      })

                    )}

                  </div>

                </div>

                {/* RODAPÉ */}

                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-4">

                  <p className="text-xs text-slate-400">
                    {alunosParaVincular.length} aluno(s) encontrado(s)
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setTurmaParaAdicionarAluno(null);
                      setBuscaAluno("");
                    }}
                    className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900"
                  >
                    Fechar
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* MODAL NOVA MONITORA */}

        {mostrarCadastroMonitora && (

          <div className="fixed inset-0 z-[10001] bg-slate-900/50 backdrop-blur-sm p-4">

            <div className="min-h-full flex items-center justify-center">

              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <p className="text-sm font-semibold text-orange-600">
                      Equipe
                    </p>

                    <h2 className="text-xl font-extrabold text-slate-800">
                      Nova monitora
                    </h2>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarCadastroMonitora(false)
                    }
                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 font-bold"
                  >
                    ✕
                  </button>

                </div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nome da monitora
                </label>

                <input
                  type="text"
                  value={nomeMonitora}
                  onChange={(e) =>
                    setNomeMonitora(e.target.value)
                  }
                  placeholder="Nome completo"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                <div className="flex justify-end gap-3 mt-6">

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarCadastroMonitora(false)
                    }
                    className="px-5 py-3 rounded-xl border border-slate-200 font-bold text-slate-600"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={cadastrarMonitora}
                    disabled={salvando}
                    className="px-5 py-3 rounded-xl bg-orange-600 text-white font-extrabold disabled:opacity-60"
                  >
                    {salvando
                      ? "Salvando..."
                      : "Cadastrar"}
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}