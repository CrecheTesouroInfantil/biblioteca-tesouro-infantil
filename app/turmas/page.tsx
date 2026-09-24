"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseSistema } from "@/lib/supabaseSistema";

const ANO_LETIVO = 2026;

const definicoesTurmas = [
  {
    nome: "Berçário B1/B2",
    turno: "Integral",
    icone: "🍼",
    descricao: "Primeira etapa da creche",
    cor: "blue",
    tipo: "bercario",
    precisaProfessora: true,
    precisaMonitora: true,
  },
  {
    nome: "Maternal I",
    turno: "Integral",
    icone: "🌱",
    descricao: "Desenvolvimento e descobertas",
    cor: "emerald",
    tipo: "maternal1",
    precisaProfessora: true,
    precisaMonitora: true,
  },
  {
    nome: "Maternal II",
    turno: "Integral",
    icone: "🌼",
    descricao: "Aprender brincando",
    cor: "amber",
    tipo: "maternal2",
    precisaProfessora: true,
    precisaMonitora: true,
  },
  {
    nome: "Pré-escola",
    turno: "Manhã",
    icone: "🎨",
    descricao: "Pré-escola no período da manhã",
    cor: "purple",
    tipo: "pre",
    precisaProfessora: true,
    precisaMonitora: true,
  },
  {
    nome: "Pré-escola",
    turno: "Tarde",
    icone: "🎨",
    descricao: "Pré-escola no período da tarde",
    cor: "pink",
    tipo: "pre",
    precisaProfessora: true,
    precisaMonitora: true,
  },
  {
    nome: "Contraturno",
    turno: "Manhã",
    icone: "☀️",
    descricao: "Atendimento complementar pela manhã",
    cor: "orange",
    tipo: "contraturno",
    precisaProfessora: false,
    precisaMonitora: true,
  },
  {
    nome: "Contraturno",
    turno: "Tarde",
    icone: "☀️",
    descricao: "Atendimento complementar à tarde",
    cor: "orange",
    tipo: "contraturno",
    precisaProfessora: false,
    precisaMonitora: true,
  },
] as const;

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
  data_nascimento: string | null;
  sexo: string | null;
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
  aluno?: Aluno | null;
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
  monitora?: Monitora | null;
};

type TipoTurma = (typeof definicoesTurmas)[number];

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [monitoras, setMonitoras] = useState<Monitora[]>([]);
  const [turmaMonitoras, setTurmaMonitoras] = useState<TurmaMonitora[]>(
    []
  );

  const [turmaSelecionada, setTurmaSelecionada] =
    useState<Turma | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [mostrarAdicionarAluno, setMostrarAdicionarAluno] =
    useState(false);

  const [mostrarAdicionarMonitora, setMostrarAdicionarMonitora] =
    useState(false);

  const [alunoParaAdicionar, setAlunoParaAdicionar] =
    useState("");

  const [nomeNovaMonitora, setNomeNovaMonitora] =
    useState("");

  const [professoraEditando, setProfessoraEditando] =
    useState("");

  const [buscaAluno, setBuscaAluno] = useState("");

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setCarregando(true);
    setErro("");

    await garantirTurmas();

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
        .eq("ativa", true)
        .order("id", { ascending: true }),

      supabaseSistema
        .from("alunos")
        .select("id,nome,data_nascimento,sexo")
        .eq("ativo", true)
        .order("nome", { ascending: true }),

      supabaseSistema
        .from("matriculas")
        .select(`
          id,
          aluno_id,
          turma_id,
          ano_letivo,
          numero_matricula,
          turno,
          data_matricula,
          situacao,
          observacao,
          faz_contraturno,
          aluno:alunos (
            id,
            nome,
            data_nascimento,
            sexo
          )
        `)
        .eq("ano_letivo", ANO_LETIVO),

      supabaseSistema
        .from("monitoras")
        .select("*")
        .eq("ativa", true)
        .order("nome", { ascending: true }),

      supabaseSistema
        .from("turma_monitoras")
        .select(`
          id,
          turma_id,
          monitora_id,
          monitora:monitoras (
            id,
            nome,
            ativa
          )
        `),
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
        `Erro ao carregar equipe: ${resultadoTurmaMonitoras.error.message}`
      );
    }

    setTurmas((resultadoTurmas.data || []) as unknown as Turma[]);
    setAlunos((resultadoAlunos.data || []) as unknown as Aluno[]);
    setMatriculas((resultadoMatriculas.data || []) as unknown as Matricula[]);
    setMonitoras((resultadoMonitoras.data || []) as unknown as Monitora[]);
    setTurmaMonitoras(
      (resultadoTurmaMonitoras.data || []) as unknown as TurmaMonitora[]
    );

    setCarregando(false);
  }

  async function garantirTurmas() {
    const { data: existentes, error } = await supabaseSistema
      .from("turmas")
      .select("*")
      .eq("ano_letivo", ANO_LETIVO);

    if (error) {
      setErro(
        `Não foi possível preparar as turmas: ${error.message}`
      );
      return;
    }

    const listaExistente = (existentes || []) as unknown as Turma[];

    for (const definicao of definicoesTurmas) {
      const encontrada = listaExistente.find(
        (turma) =>
          turma.nome === definicao.nome &&
          turma.turno === definicao.turno
      );

      if (encontrada) {
        continue;
      }

      const { error: insertError } = await supabaseSistema
        .from("turmas")
        .insert({
          nome: definicao.nome,
          ano_letivo: ANO_LETIVO,
          turno: definicao.turno,
          professor: null,
          capacidade: null,
          ativa: true,
        });

      if (insertError) {
        console.error(insertError);
      }
    }
  }

  function definirTipoTurma(
    nome: string,
    turno: string | null
  ): TipoTurma {
    const encontrada = definicoesTurmas.find(
      (turma) =>
        turma.nome === nome &&
        turma.turno === turno
    );

    if (encontrada) {
      return encontrada;
    }

    const encontradaPorNome = definicoesTurmas.find(
      (turma) => turma.nome === nome
    );

    return encontradaPorNome || definicoesTurmas[0];
  }

  function obterMatriculasDaTurma(turmaId: number) {
    return matriculas.filter(
      (matricula) => matricula.turma_id === turmaId
    );
  }

  /*
   * CONTRATURNO AUTOMÁTICO
   *
   * Pré-escola Manhã + contraturno = Contraturno Tarde
   * Pré-escola Tarde + contraturno = Contraturno Manhã
   *
   * A criança continua tendo apenas UMA matrícula.
   */
  function obterMatriculasContraturno(
    turnoContraturno: string | null
  ) {
    if (!turnoContraturno) {
      return [];
    }

    const turnoPreEscolar =
      turnoContraturno === "Manhã"
        ? "Tarde"
        : turnoContraturno === "Tarde"
        ? "Manhã"
        : null;

    if (!turnoPreEscolar) {
      return [];
    }

    const turmasPreEscolar = turmas.filter(
      (turma) =>
        turma.nome === "Pré-escola" &&
        turma.turno === turnoPreEscolar
    );

    const idsTurmasPreEscolar = new Set(
      turmasPreEscolar.map((turma) => turma.id)
    );

    return matriculas.filter(
      (matricula) =>
        matricula.turma_id !== null &&
        idsTurmasPreEscolar.has(matricula.turma_id) &&
        matricula.faz_contraturno === true
    );
  }

  function obterMonitorasDaTurma(turmaId: number) {
    return turmaMonitoras.filter(
      (item) => item.turma_id === turmaId
    );
  }

  function obterQuantidadeAlunos(turma: Turma) {
    if (turma.nome === "Contraturno") {
      return obterMatriculasContraturno(turma.turno).length;
    }

    return obterMatriculasDaTurma(turma.id).length;
  }

  function abrirTurma(turma: Turma) {
    setTurmaSelecionada(turma);
    setProfessoraEditando(turma.professor || "");
    setMensagem("");
    setErro("");
    setMostrarAdicionarAluno(false);
    setMostrarAdicionarMonitora(false);
    setBuscaAluno("");
    setAlunoParaAdicionar("");
  }

  function fecharTurma() {
    setTurmaSelecionada(null);
    setMostrarAdicionarAluno(false);
    setMostrarAdicionarMonitora(false);
    setAlunoParaAdicionar("");
    setNomeNovaMonitora("");
    setBuscaAluno("");
  }

  async function salvarProfessora() {
    if (!turmaSelecionada) {
      return;
    }

    const tipo = definirTipoTurma(
      turmaSelecionada.nome,
      turmaSelecionada.turno
    );

    if (!tipo.precisaProfessora) {
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    const { error } = await supabaseSistema
      .from("turmas")
      .update({
        professor: professoraEditando.trim() || null,
      })
      .eq("id", turmaSelecionada.id);

    if (error) {
      setErro(
        `Não foi possível salvar a professora: ${error.message}`
      );
      setSalvando(false);
      return;
    }

    setTurmas((anteriores) =>
      anteriores.map((turma) =>
        turma.id === turmaSelecionada.id
          ? {
              ...turma,
              professor: professoraEditando.trim() || null,
            }
          : turma
      )
    );

    setTurmaSelecionada((anterior) =>
      anterior
        ? {
            ...anterior,
            professor: professoraEditando.trim() || null,
          }
        : anterior
    );

    setMensagem("✅ Professora salva com sucesso.");
    setSalvando(false);
  }

  async function adicionarMonitoraExistente(
    monitoraId: number
  ) {
    if (!turmaSelecionada) {
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    const jaExiste = turmaMonitoras.some(
      (item) =>
        item.turma_id === turmaSelecionada.id &&
        item.monitora_id === monitoraId
    );

    if (jaExiste) {
      setErro("Essa monitora já está vinculada a esta turma.");
      setSalvando(false);
      return;
    }

    const { data, error } = await supabaseSistema
      .from("turma_monitoras")
      .insert({
        turma_id: turmaSelecionada.id,
        monitora_id: monitoraId,
      })
      .select(`
        id,
        turma_id,
        monitora_id,
        monitora:monitoras (
          id,
          nome,
          ativa
        )
      `)
      .single();

    if (error) {
      setErro(
        `Não foi possível adicionar a monitora: ${error.message}`
      );
      setSalvando(false);
      return;
    }

    setTurmaMonitoras((anteriores) => [
      ...anteriores,
      data as unknown as TurmaMonitora,
    ]);

    setMensagem("✅ Monitora adicionada à turma.");
    setSalvando(false);
  }

  async function cadastrarNovaMonitora() {
    if (!turmaSelecionada) {
      return;
    }

    if (!nomeNovaMonitora.trim()) {
      setErro("Informe o nome da monitora.");
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    const { data: novaMonitora, error } = await supabaseSistema
      .from("monitoras")
      .insert({
        nome: nomeNovaMonitora.trim(),
        ativa: true,
      })
      .select()
      .single();

    if (error) {
      setErro(
        `Não foi possível cadastrar a monitora: ${error.message}`
      );
      setSalvando(false);
      return;
    }

    setMonitoras((anteriores) =>
      [...anteriores, novaMonitora as unknown as Monitora].sort((a, b) =>
        a.nome.localeCompare(b.nome)
      )
    );

    setSalvando(false);

    const monitoraId = (novaMonitora as unknown as Monitora).id;

    await adicionarMonitoraExistente(monitoraId);

    setNomeNovaMonitora("");
    setMostrarAdicionarMonitora(false);
  }

  async function removerMonitora(
    vinculo: TurmaMonitora
  ) {
    setSalvando(true);
    setErro("");
    setMensagem("");

    const { error } = await supabaseSistema
      .from("turma_monitoras")
      .delete()
      .eq("id", vinculo.id);

    if (error) {
      setErro(
        `Não foi possível retirar a monitora: ${error.message}`
      );
      setSalvando(false);
      return;
    }

    setTurmaMonitoras((anteriores) =>
      anteriores.filter((item) => item.id !== vinculo.id)
    );

    setMensagem("Monitora retirada da turma.");
    setSalvando(false);
  }

  async function adicionarAluno() {
    if (!turmaSelecionada) {
      return;
    }

    if (turmaSelecionada.nome === "Contraturno") {
      setErro(
        "Os alunos do Contraturno entram automaticamente pelo Pré-escola."
      );
      return;
    }

    if (!alunoParaAdicionar) {
      setErro("Selecione um aluno.");
      return;
    }

    const alunoId = Number(alunoParaAdicionar);

    const matriculaExistente = matriculas.find(
      (matricula) => matricula.aluno_id === alunoId
    );

    if (matriculaExistente) {
      setErro(
        "Este aluno já possui uma matrícula no ano letivo de 2026."
      );
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    const { data, error } = await supabaseSistema
      .from("matriculas")
      .insert({
        aluno_id: alunoId,
        turma_id: turmaSelecionada.id,
        ano_letivo: ANO_LETIVO,
        numero_matricula: null,
        turno: turmaSelecionada.turno || null,
        data_matricula: new Date()
          .toISOString()
          .split("T")[0],
        situacao: "Ativa",
        observacao: null,
        faz_contraturno: false,
      })
      .select(`
        id,
        aluno_id,
        turma_id,
        ano_letivo,
        numero_matricula,
        turno,
        data_matricula,
        situacao,
        observacao,
        faz_contraturno,
        aluno:alunos (
          id,
          nome,
          data_nascimento,
          sexo
        )
      `)
      .single();

    if (error) {
      setErro(
        `Não foi possível matricular o aluno: ${error.message}`
      );
      setSalvando(false);
      return;
    }

    setMatriculas((anteriores) => [
      ...anteriores,
      data as unknown as Matricula,
    ]);

    setAlunoParaAdicionar("");
    setMostrarAdicionarAluno(false);
    setMensagem("✅ Aluno adicionado à turma.");
    setSalvando(false);
  }

  async function alterarContraturno(
    matricula: Matricula,
    novoValor: boolean
  ) {
    if (!turmaSelecionada) {
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    const { error } = await supabaseSistema
      .from("matriculas")
      .update({
        faz_contraturno: novoValor,
      })
      .eq("id", matricula.id);

    if (error) {
      setErro(
        `Não foi possível alterar o contraturno: ${error.message}`
      );
      setSalvando(false);
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
        ? "✅ Aluno incluído automaticamente no Contraturno."
        : "Aluno retirado do Contraturno."
    );

    setSalvando(false);
  }

  const matriculasDisponiveis = useMemo(() => {
    if (!turmaSelecionada) {
      return [];
    }

    const idsMatriculados = new Set(
      matriculas.map((matricula) => matricula.aluno_id)
    );

    return alunos.filter((aluno) => {
      if (idsMatriculados.has(aluno.id)) {
        return false;
      }

      if (!buscaAluno.trim()) {
        return true;
      }

      return aluno.nome
        .toLowerCase()
        .includes(buscaAluno.toLowerCase());
    });
  }, [
    alunos,
    matriculas,
    turmaSelecionada,
    buscaAluno,
  ]);

  const totalAlunos = matriculas.filter(
    (matricula) =>
      matricula.turma_id !== null &&
      matricula.ano_letivo === ANO_LETIVO
  ).length;

  const totalContraturnoManha =
    obterMatriculasContraturno("Manhã").length;

  const totalContraturnoTarde =
    obterMatriculasContraturno("Tarde").length;

  const totalContraturno =
    totalContraturnoManha + totalContraturnoTarde;

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-4 md:p-7">
      <div className="max-w-7xl mx-auto space-y-7">

        {/* CABEÇALHO */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Voltar ao Dashboard
            </Link>

            <p className="text-sm font-semibold text-blue-600">
              Organização escolar
            </p>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
              Turmas
            </h1>

            <p className="text-sm md:text-base text-slate-500 mt-1">
              Organize professores, monitoras e alunos da Creche Tesouro Infantil.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl px-6 py-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Ano letivo
            </p>

            <p className="text-xl font-extrabold text-slate-700">
              {ANO_LETIVO}
            </p>
          </div>

        </header>

        {/* RESUMO */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
              👩‍🏫
            </div>

            <p className="text-sm text-slate-500 mt-4">
              Turmas
            </p>

            <p className="text-3xl font-extrabold text-blue-700">
              {turmas.length}
            </p>

            <p className="text-xs text-slate-400">
              turmas organizadas
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
              👧
            </div>

            <p className="text-sm text-slate-500 mt-4">
              Alunos matriculados
            </p>

            <p className="text-3xl font-extrabold text-emerald-700">
              {totalAlunos}
            </p>

            <p className="text-xs text-slate-400">
              no ano de {ANO_LETIVO}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-xl">
              ☀️
            </div>

            <p className="text-sm text-slate-500 mt-4">
              Contraturno
            </p>

            <p className="text-3xl font-extrabold text-orange-700">
              {totalContraturno}
            </p>

            <p className="text-xs text-slate-400">
              {totalContraturnoManha} pela manhã •{" "}
              {totalContraturnoTarde} à tarde
            </p>
          </div>

        </section>

        {/* MENSAGENS */}
        {mensagem && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-5 py-4 font-semibold">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 font-semibold">
            {erro}
          </div>
        )}

        {/* TURMAS */}
        {carregando ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <p className="text-slate-500">
              Carregando turmas...
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {turmas.map((turma) => {
              const definicao = definirTipoTurma(
                turma.nome,
                turma.turno
              );

              const quantidade = obterQuantidadeAlunos(turma);
              const equipe = obterMonitorasDaTurma(turma.id);

              return (
                <button
                  key={turma.id}
                  type="button"
                  onClick={() => abrirTurma(turma)}
                  className="text-left bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-6"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div
                      className={`
                        w-14 h-14 rounded-2xl
                        flex items-center justify-center
                        text-3xl
                        ${
                          definicao.cor === "blue"
                            ? "bg-blue-50"
                            : definicao.cor === "emerald"
                            ? "bg-emerald-50"
                            : definicao.cor === "amber"
                            ? "bg-amber-50"
                            : definicao.cor === "pink"
                            ? "bg-pink-50"
                            : "bg-orange-50"
                        }
                      `}
                    >
                      {definicao.icone}
                    </div>

                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">
                      {quantidade}{" "}
                      {quantidade === 1 ? "aluno" : "alunos"}
                    </span>

                  </div>

                  <h2 className="text-xl font-extrabold text-slate-800 mt-5">
                    {turma.nome}
                  </h2>

                  <div className="mt-2 inline-flex bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                    {turma.turno || "Turno não informado"}
                  </div>

                  <p className="text-sm text-slate-500 mt-3">
                    {definicao.descricao}
                  </p>

                  {definicao.precisaProfessora && (
                    <div className="mt-5">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Professora
                      </p>

                      <p className="text-sm font-semibold text-slate-700 mt-1">
                        {turma.professor || "Ainda não cadastrada"}
                      </p>
                    </div>
                  )}

                  {definicao.precisaMonitora && (
                    <div className="mt-4">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Monitoras
                      </p>

                      <p className="text-sm font-semibold text-slate-700 mt-1">
                        {equipe.length === 0
                          ? "Nenhuma cadastrada"
                          : `${equipe.length} ${
                              equipe.length === 1
                                ? "monitora"
                                : "monitoras"
                            }`}
                      </p>
                    </div>
                  )}

                  {turma.nome === "Contraturno" && (
                    <div className="mt-4 bg-orange-50 rounded-2xl px-4 py-3">
                      <p className="text-xs font-semibold text-orange-800">
                        Alunos entram automaticamente do Pré-escola do
                        turno oposto.
                      </p>
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">

                    <span className="text-sm font-bold text-blue-600">
                      Abrir turma
                    </span>

                    <span className="text-slate-400">
                      →
                    </span>

                  </div>

                </button>
              );
            })}

          </section>
        )}

      </div>

      {/* MODAL DA TURMA */}
      {turmaSelecionada && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm p-3 md:p-6 overflow-y-auto">

          <div className="min-h-full flex items-start justify-center">

            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4">

              {/* TOPO */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 md:p-8">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-blue-100 text-sm font-semibold">
                      Ano letivo {ANO_LETIVO}
                    </p>

                    <h2 className="text-3xl font-extrabold mt-1">
                      {turmaSelecionada.nome}
                    </h2>

                    <div className="mt-2 inline-flex bg-white/15 px-3 py-1 rounded-full text-sm font-bold">
                      {turmaSelecionada.turno || "Turno não informado"}
                    </div>

                    <p className="text-blue-100 mt-2">
                      Gestão da turma
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={fecharTurma}
                    className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-xl"
                  >
                    ×
                  </button>

                </div>

              </div>

              <div className="p-5 md:p-8 space-y-7">

                {/* EQUIPE */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {definirTipoTurma(
                    turmaSelecionada.nome,
                    turmaSelecionada.turno
                  ).precisaProfessora && (

                    <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5">

                      <div className="flex items-center justify-between gap-3">

                        <div>

                          <p className="text-xs uppercase tracking-wider font-bold text-blue-500">
                            Professora
                          </p>

                          <p className="font-extrabold text-slate-800 mt-1">
                            Responsável pela turma
                          </p>

                        </div>

                        <span className="text-2xl">
                          👩‍🏫
                        </span>

                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row gap-2">

                        <input
                          type="text"
                          value={professoraEditando}
                          onChange={(e) =>
                            setProfessoraEditando(e.target.value)
                          }
                          placeholder="Nome da professora"
                          className="flex-1 rounded-2xl border border-blue-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300"
                        />

                        <button
                          type="button"
                          onClick={salvarProfessora}
                          disabled={salvando}
                          className="rounded-2xl bg-blue-700 text-white px-5 py-3 font-bold hover:bg-blue-800 disabled:opacity-50"
                        >
                          Salvar
                        </button>

                      </div>

                    </div>
                  )}

                  {/* MONITORAS */}
                  {definirTipoTurma(
                    turmaSelecionada.nome,
                    turmaSelecionada.turno
                  ).precisaMonitora && (

                    <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5">

                      <div className="flex items-center justify-between gap-3">

                        <div>

                          <p className="text-xs uppercase tracking-wider font-bold text-emerald-600">
                            Monitoras
                          </p>

                          <p className="font-extrabold text-slate-800 mt-1">
                            Profissionais da turma
                          </p>

                        </div>

                        <span className="text-2xl">
                          👩‍🍼
                        </span>

                      </div>

                      <div className="mt-4 space-y-2">

                        {obterMonitorasDaTurma(
                          turmaSelecionada.id
                        ).length === 0 ? (

                          <p className="text-sm text-slate-500">
                            Nenhuma monitora cadastrada.
                          </p>

                        ) : (

                          obterMonitorasDaTurma(
                            turmaSelecionada.id
                          ).map((vinculo) => (

                            <div
                              key={vinculo.id}
                              className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
                            >

                              <span className="font-semibold text-slate-700">
                                {vinculo.monitora?.nome}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  removerMonitora(vinculo)
                                }
                                className="text-xs font-bold text-red-600 hover:text-red-800"
                              >
                                Retirar
                              </button>

                            </div>

                          ))
                        )}

                      </div>

                      <div className="mt-4">

                        <button
                          type="button"
                          onClick={() =>
                            setMostrarAdicionarMonitora(
                              (valor) => !valor
                            )
                          }
                          className="w-full rounded-2xl border-2 border-dashed border-emerald-200 text-emerald-700 py-3 font-bold hover:bg-emerald-100"
                        >
                          + Adicionar monitora
                        </button>

                      </div>

                      {mostrarAdicionarMonitora && (

                        <div className="mt-4 bg-white rounded-2xl p-4 border border-emerald-100 space-y-3">

                          <p className="text-sm font-bold text-slate-700">
                            Selecionar monitora existente
                          </p>

                          <div className="flex flex-col gap-2">

                            {monitoras
                              .filter(
                                (monitora) =>
                                  !obterMonitorasDaTurma(
                                    turmaSelecionada.id
                                  ).some(
                                    (item) =>
                                      item.monitora_id ===
                                      monitora.id
                                  )
                              )
                              .map((monitora) => (

                                <button
                                  key={monitora.id}
                                  type="button"
                                  onClick={() =>
                                    adicionarMonitoraExistente(
                                      monitora.id
                                    )
                                  }
                                  className="text-left rounded-xl px-4 py-3 bg-slate-50 hover:bg-emerald-50 font-semibold text-slate-700"
                                >
                                  {monitora.nome}
                                </button>

                              ))}

                          </div>

                          <div className="border-t border-slate-100 pt-4">

                            <p className="text-sm font-bold text-slate-700 mb-2">
                              Cadastrar nova monitora
                            </p>

                            <div className="flex flex-col sm:flex-row gap-2">

                              <input
                                type="text"
                                value={nomeNovaMonitora}
                                onChange={(e) =>
                                  setNomeNovaMonitora(
                                    e.target.value
                                  )
                                }
                                placeholder="Nome da monitora"
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-300"
                              />

                              <button
                                type="button"
                                onClick={cadastrarNovaMonitora}
                                disabled={salvando}
                                className="rounded-xl bg-emerald-600 text-white px-5 py-3 font-bold hover:bg-emerald-700 disabled:opacity-50"
                              >
                                Cadastrar
                              </button>

                            </div>

                          </div>

                        </div>
                      )}

                    </div>
                  )}

                </section>

                {/* CONTRATURNO */}
                {turmaSelecionada.nome === "Contraturno" && (

                  <section className="bg-orange-50 border border-orange-100 rounded-3xl p-5">

                    <div className="flex items-start gap-4">

                      <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl">
                        ☀️
                      </div>

                      <div>

                        <h3 className="font-extrabold text-slate-800">
                          Contraturno automático
                        </h3>

                        <p className="text-sm text-slate-600 mt-1">

                          {turmaSelecionada.turno === "Manhã"
                            ? "Aqui aparecem automaticamente os alunos da Pré-escola Tarde que fazem contraturno."
                            : "Aqui aparecem automaticamente os alunos da Pré-escola Manhã que fazem contraturno."}

                        </p>

                        <p className="text-xs text-orange-700 font-semibold mt-3">
                          A criança continua matriculada somente
                          na sua turma de Pré-escola.
                        </p>

                      </div>

                    </div>

                  </section>
                )}

                {/* ALUNOS */}
                <section>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                    <div>

                      <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                        Alunos
                      </p>

                      <h3 className="text-xl font-extrabold text-slate-800">

                        {turmaSelecionada.nome === "Contraturno"
                          ? `Alunos do contraturno ${turmaSelecionada.turno?.toLowerCase() || ""}`
                          : "Alunos matriculados"}

                      </h3>

                    </div>

                    {turmaSelecionada.nome !== "Contraturno" && (

                      <button
                        type="button"
                        onClick={() =>
                          setMostrarAdicionarAluno(
                            (valor) => !valor
                          )
                        }
                        className="rounded-2xl bg-blue-700 text-white px-5 py-3 font-bold hover:bg-blue-800"
                      >
                        + Adicionar aluno
                      </button>

                    )}

                  </div>

                  {/* ADICIONAR ALUNO */}
                  {mostrarAdicionarAluno &&
                    turmaSelecionada.nome !== "Contraturno" && (

                      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 mb-5">

                        <p className="font-extrabold text-slate-800">
                          Adicionar aluno já cadastrado
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          A criança será vinculada a esta turma.
                          Não será criado outro cadastro.
                        </p>

                        <input
                          type="text"
                          value={buscaAluno}
                          onChange={(e) =>
                            setBuscaAluno(e.target.value)
                          }
                          placeholder="Pesquisar aluno..."
                          className="w-full mt-4 rounded-2xl border border-blue-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300"
                        />

                        <div className="mt-3 max-h-64 overflow-y-auto space-y-2">

                          {matriculasDisponiveis.length === 0 ? (

                            <p className="text-sm text-slate-500 bg-white rounded-2xl p-4">
                              Nenhum aluno disponível para matrícula.
                            </p>

                          ) : (

                            matriculasDisponiveis.map((aluno) => (

                              <button
                                key={aluno.id}
                                type="button"
                                onClick={() =>
                                  setAlunoParaAdicionar(
                                    String(aluno.id)
                                  )
                                }
                                className={`
                                  w-full text-left rounded-2xl px-4 py-3
                                  border
                                  ${
                                    alunoParaAdicionar ===
                                    String(aluno.id)
                                      ? "bg-blue-100 border-blue-300"
                                      : "bg-white border-slate-100 hover:bg-blue-50"
                                  }
                                `}
                              >

                                <p className="font-bold text-slate-700">
                                  {aluno.nome}
                                </p>

                                <p className="text-xs text-slate-400 mt-1">

                                  {aluno.data_nascimento
                                    ? `Nascimento: ${formatarData(
                                        aluno.data_nascimento
                                      )}`
                                    : "Data de nascimento não informada"}

                                </p>

                              </button>

                            ))
                          )}

                        </div>

                        <div className="flex justify-end gap-2 mt-4">

                          <button
                            type="button"
                            onClick={() =>
                              setMostrarAdicionarAluno(false)
                            }
                            className="rounded-xl px-4 py-3 font-bold text-slate-600 hover:bg-white"
                          >
                            Cancelar
                          </button>

                          <button
                            type="button"
                            onClick={adicionarAluno}
                            disabled={
                              salvando || !alunoParaAdicionar
                            }
                            className="rounded-xl bg-blue-700 text-white px-5 py-3 font-bold disabled:opacity-50"
                          >
                            Adicionar
                          </button>

                        </div>

                      </div>
                    )}

                  {/* LISTA DE ALUNOS */}
                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">

                    {(() => {

                      const lista =
                        turmaSelecionada.nome === "Contraturno"
                          ? obterMatriculasContraturno(
                              turmaSelecionada.turno
                            )
                          : obterMatriculasDaTurma(
                              turmaSelecionada.id
                            );

                      if (lista.length === 0) {

                        return (
                          <div className="p-10 text-center">

                            <div className="text-4xl">
                              👧
                            </div>

                            <p className="font-bold text-slate-700 mt-3">
                              Nenhum aluno nesta turma
                            </p>

                            <p className="text-sm text-slate-400 mt-1">

                              {turmaSelecionada.nome === "Contraturno"
                                ? "Marque “Faz Contraturno: Sim” em um aluno da Pré-escola do turno correspondente."
                                : "Use o botão “Adicionar aluno” para vincular uma criança."}

                            </p>

                          </div>
                        );
                      }

                      return (

                        <div className="divide-y divide-slate-100">

                          {lista.map((matricula, index) => (

                            <div
                              key={matricula.id}
                              className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                            >

                              <div className="flex items-center gap-4">

                                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold">
                                  {index + 1}
                                </div>

                                <div>

                                  <p className="font-extrabold text-slate-800">
                                    {matricula.aluno?.nome ||
                                      "Aluno sem nome"}
                                  </p>

                                  <p className="text-xs text-slate-400 mt-1">

                                    {matricula.aluno?.data_nascimento
                                      ? `Nascimento: ${formatarData(
                                          matricula.aluno
                                            .data_nascimento
                                        )}`
                                      : "Nascimento não informado"}

                                  </p>

                                </div>

                              </div>

                              {/* CONTRATURNO NO PRÉ-ESCOLAR */}
                              {turmaSelecionada.nome === "Pré-escola" && (

                                <div className="flex items-center justify-between gap-4 bg-slate-50 rounded-2xl px-4 py-3">

                                  <div>

                                    <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                                      Faz Contraturno?
                                    </p>

                                    <p className="text-sm font-bold text-slate-700 mt-1">

                                      {matricula.faz_contraturno
                                        ? "Sim"
                                        : "Não"}

                                    </p>

                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      alterarContraturno(
                                        matricula,
                                        !matricula.faz_contraturno
                                      )
                                    }
                                    disabled={salvando}
                                    className={`
                                      relative w-14 h-8 rounded-full transition-colors
                                      ${
                                        matricula.faz_contraturno
                                          ? "bg-emerald-500"
                                          : "bg-slate-300"
                                      }
                                    `}
                                    aria-label="Alterar contraturno"
                                  >

                                    <span
                                      className={`
                                        absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform
                                        ${
                                          matricula.faz_contraturno
                                            ? "translate-x-7"
                                            : "translate-x-1"
                                        }
                                      `}
                                    />

                                  </button>

                                </div>
                              )}

                              {/* AVISO NO CONTRATURNO */}
                              {turmaSelecionada.nome === "Contraturno" && (

                                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-4 py-2 rounded-full">

                                  {matricula.aluno?.nome
                                    ? `Vem da Pré-escola ${
                                        matricula.turno === "Manhã"
                                          ? "Manhã"
                                          : "Tarde"
                                      }`
                                    : "Contraturno automático"}

                                </span>

                              )}

                            </div>

                          ))}

                        </div>

                      );

                    })()}

                  </div>

                </section>

              </div>

              {/* RODAPÉ */}
              <div className="border-t border-slate-100 bg-slate-50 px-5 md:px-8 py-4 flex justify-end">

                <button
                  type="button"
                  onClick={fecharTurma}
                  className="rounded-2xl bg-slate-800 text-white px-6 py-3 font-bold hover:bg-slate-900"
                >
                  Fechar
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

function formatarData(data: string) {
  if (!data) {
    return "";
  }

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}