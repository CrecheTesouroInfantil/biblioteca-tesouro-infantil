"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseSistema } from "@/lib/supabaseSistema";

type Aluno = {
  id: number;
  nome: string;
  data_nascimento: string;
  cpf: string | null;
  certidao_nascimento: string | null;
  sexo: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  zona: string | null;
  telefone: string | null;
  observacoes_gerais: string | null;
  ativo: boolean;
};

type Documento = {
  id: number;
  aluno_id: number;
  tipo_documento: string;
  entregue: boolean;
  data_entrega: string | null;
  arquivo_url: string | null;
  observacao: string | null;
  status: string;
};

type Censo = {
  id: number;
  aluno_id: number;
  ano_letivo: number;
  cadastrado: boolean;
};

const documentosCrianca = [
  "Certidão de nascimento",
  "CPF da criança",
  "Cartão do SUS",
  "Cartão de vacinação",
  "Comprovante de endereço",
];

const documentosResponsavel = [
  "Documento do responsável (RG ou CNH)",
  "CPF do responsável",
];

const documentosMatricula = [
  "Ficha de rematrícula assinada",
  "Carteirinha de retirada do estudante",
  "Termo de uso de imagem",
];

const documentosCondicionais = [
  "RG da criança (se possuir)",
  "Laudo médico",
  "Relatório/documentação específica de saúde",
  "Documentação relacionada a necessidades educacionais específicas",
  "Outros documentos específicos",
];

const todosDocumentos = [
  ...documentosCrianca,
  ...documentosResponsavel,
  ...documentosMatricula,
  ...documentosCondicionais,
];

const tipoCarteirinha =
  "Carteirinha de retirada do estudante";

function formatarData(data: string | null) {
  if (!data) return "-";

  const partes = data.split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarDataDigitada(valor: string) {
  const numeros = valor
    .replace(/\D/g, "")
    .slice(0, 8);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 4) {
    return `${numeros.slice(
      0,
      2
    )}/${numeros.slice(2)}`;
  }

  return `${numeros.slice(
    0,
    2
  )}/${numeros.slice(
    2,
    4
  )}/${numeros.slice(4)}`;
}

function dataDigitadaParaISO(
  dataDigitada: string
) {
  const partes = dataDigitada.split("/");

  if (partes.length !== 3) {
    return "";
  }

  const [diaTexto, mesTexto, anoTexto] =
    partes;

  if (
    diaTexto.length !== 2 ||
    mesTexto.length !== 2 ||
    anoTexto.length !== 4
  ) {
    return "";
  }

  const dia = Number(diaTexto);
  const mes = Number(mesTexto);
  const ano = Number(anoTexto);

  if (
    !Number.isInteger(dia) ||
    !Number.isInteger(mes) ||
    !Number.isInteger(ano)
  ) {
    return "";
  }

  if (
    dia < 1 ||
    dia > 31 ||
    mes < 1 ||
    mes > 12
  ) {
    return "";
  }

  const dataConvertida = new Date(
    ano,
    mes - 1,
    dia
  );

  if (
    dataConvertida.getFullYear() !== ano ||
    dataConvertida.getMonth() !== mes - 1 ||
    dataConvertida.getDate() !== dia
  ) {
    return "";
  }

  return `${anoTexto}-${mesTexto}-${diaTexto}`;
}

function idade(data: string) {
  const nascimento = new Date(
    `${data}T12:00:00`
  );

  const hoje = new Date();

  let anos =
    hoje.getFullYear() -
    nascimento.getFullYear();

  const mes =
    hoje.getMonth() -
    nascimento.getMonth();

  if (
    mes < 0 ||
    (mes === 0 &&
      hoje.getDate() <
        nascimento.getDate())
  ) {
    anos--;
  }

  return anos;
}

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<
    Aluno[]
  >([]);

  const [alunoSelecionado, setAlunoSelecionado] =
    useState<Aluno | null>(null);

  const [documentos, setDocumentos] =
    useState<Documento[]>([]);

  const [censo, setCenso] =
    useState<Censo | null>(null);

  const [busca, setBusca] =
    useState("");

  const [mostrarCadastro, setMostrarCadastro] =
    useState(false);

  const [carregando, setCarregando] =
    useState(true);

  const [
    carregandoDetalhes,
    setCarregandoDetalhes,
  ] = useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [mensagem, setMensagem] =
    useState("");

  const [erro, setErro] =
    useState("");

  // FORMULÁRIO

  const [nome, setNome] =
    useState("");

  const [dataNascimento, setDataNascimento] =
    useState("");

  const [cpf, setCpf] =
    useState("");

  const [certidao, setCertidao] =
    useState("");

  const [sexo, setSexo] =
    useState("");

  const [endereco, setEndereco] =
    useState("");

  const [numero, setNumero] =
    useState("");

  const [bairro, setBairro] =
    useState("");

  const [cidade, setCidade] =
    useState("Teófilo Otoni");

  const [zona, setZona] =
    useState("");

  const [telefone, setTelefone] =
    useState("");

  const [observacoes, setObservacoes] =
    useState("");

  useEffect(() => {
    carregarAlunos();
  }, []);

  async function carregarAlunos() {
    setCarregando(true);
    setErro("");

    const { data, error } =
      await supabaseSistema
        .from("alunos")
        .select("*")
        .eq("ativo", true)
        .order("nome", {
          ascending: true,
        });

    if (error) {
      console.error(error);

      setErro(
        `Não foi possível carregar os alunos: ${error.message}`
      );

      setCarregando(false);
      return;
    }

    setAlunos(data || []);
    setCarregando(false);
  }

  async function abrirAluno(
    aluno: Aluno
  ) {
    setAlunoSelecionado(aluno);
    setCarregandoDetalhes(true);
    setMensagem("");
    setErro("");

    await prepararDocumentos(aluno.id);
    await carregarCenso(aluno.id);

    setCarregandoDetalhes(false);
  }

  async function prepararDocumentos(
    alunoId: number
  ) {
    const {
      data: existentes,
      error,
    } = await supabaseSistema
      .from("documentos_alunos")
      .select("*")
      .eq("aluno_id", alunoId);

    if (error) {
      console.error(error);

      setErro(
        `Erro ao carregar documentos: ${error.message}`
      );

      return;
    }

    const documentosExistentes =
      existentes || [];

    const faltantes =
      todosDocumentos.filter(
        (tipo) =>
          !documentosExistentes.some(
            (doc) =>
              doc.tipo_documento === tipo
          )
      );

    if (faltantes.length > 0) {
      const novosDocumentos =
        faltantes.map((tipo) => {
          const ehCarteirinha =
            tipo === tipoCarteirinha;

          const ehCondicional =
            documentosCondicionais.includes(
              tipo
            );

          return {
            aluno_id: alunoId,
            tipo_documento: tipo,
            entregue: false,
            status: ehCarteirinha
              ? "Não entregue"
              : ehCondicional
              ? "Não se aplica"
              : "Pendente",
          };
        });

      const {
        error: insertError,
      } = await supabaseSistema
        .from("documentos_alunos")
        .insert(novosDocumentos);

      if (insertError) {
        console.error(insertError);

        setErro(
          `Erro ao preparar documentos: ${insertError.message}`
        );

        return;
      }
    }

    const carteirinhaExistente =
      documentosExistentes.find(
        (doc) =>
          doc.tipo_documento ===
          tipoCarteirinha
      );

    if (
      carteirinhaExistente &&
      carteirinhaExistente.status ===
        "Pendente"
    ) {
      await supabaseSistema
        .from("documentos_alunos")
        .update({
          status: "Não entregue",
          entregue: false,
          data_entrega: null,
        })
        .eq(
          "id",
          carteirinhaExistente.id
        );
    }

    const {
      data: documentosAtualizados,
      error: reloadError,
    } = await supabaseSistema
      .from("documentos_alunos")
      .select("*")
      .eq("aluno_id", alunoId)
      .order("id", {
        ascending: true,
      });

    if (reloadError) {
      console.error(reloadError);

      setErro(
        `Erro ao atualizar documentos: ${reloadError.message}`
      );

      return;
    }

    setDocumentos(
      documentosAtualizados || []
    );
  }

  async function carregarCenso(
    alunoId: number
  ) {
    const { data, error } =
      await supabaseSistema
        .from("censo_escolar")
        .select("*")
        .eq("aluno_id", alunoId)
        .eq("ano_letivo", 2026)
        .maybeSingle();

    if (error) {
      console.error(error);

      setErro(
        `Erro ao carregar Censo: ${error.message}`
      );

      return;
    }

    if (!data) {
      const {
        data: novoCenso,
        error: insertError,
      } = await supabaseSistema
        .from("censo_escolar")
        .insert({
          aluno_id: alunoId,
          ano_letivo: 2026,
          cadastrado: false,
        })
        .select()
        .single();

      if (insertError) {
        console.error(insertError);

        setErro(
          `Erro ao preparar Censo: ${insertError.message}`
        );

        return;
      }

      setCenso(novoCenso);
      return;
    }

    setCenso(data);
  }

  async function cadastrarAluno(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setMensagem("");
    setErro("");

    if (!nome.trim()) {
      setErro(
        "Informe o nome da criança."
      );
      return;
    }

    if (!dataNascimento) {
      setErro(
        "Informe a data de nascimento."
      );
      return;
    }

    const dataISO =
      dataDigitadaParaISO(
        dataNascimento
      );

    if (!dataISO) {
      setErro(
        "Informe uma data de nascimento válida no formato DD/MM/AAAA."
      );
      return;
    }

    setSalvando(true);

    const {
      data: novoAluno,
      error,
    } = await supabaseSistema
      .from("alunos")
      .insert({
        nome: nome.trim(),
        data_nascimento: dataISO,
        cpf: cpf || null,
        certidao_nascimento:
          certidao || null,
        sexo: sexo || null,
        endereco: endereco || null,
        numero: numero || null,
        bairro: bairro || null,
        cidade: cidade || null,
        zona: zona || null,
        telefone: telefone || null,
        observacoes_gerais:
          observacoes || null,
        ativo: true,
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      setErro(
        `Erro ao cadastrar aluno: ${error.message}`
      );

      setSalvando(false);
      return;
    }

    const documentosIniciais =
      todosDocumentos.map((tipo) => {
        const ehCarteirinha =
          tipo === tipoCarteirinha;

        const ehCondicional =
          documentosCondicionais.includes(
            tipo
          );

        return {
          aluno_id: novoAluno.id,
          tipo_documento: tipo,
          entregue: false,
          status: ehCarteirinha
            ? "Não entregue"
            : ehCondicional
            ? "Não se aplica"
            : "Pendente",
        };
      });

    const {
      error: documentosError,
    } = await supabaseSistema
      .from("documentos_alunos")
      .insert(
        documentosIniciais
      );

    if (documentosError) {
      console.error(
        documentosError
      );

      setErro(
        `Aluno cadastrado, mas houve erro ao criar a documentação: ${documentosError.message}`
      );

      setSalvando(false);
      await carregarAlunos();
      return;
    }

    const { error: censoError } =
      await supabaseSistema
        .from("censo_escolar")
        .insert({
          aluno_id: novoAluno.id,
          ano_letivo: 2026,
          cadastrado: false,
        });

    if (censoError) {
      console.error(censoError);

      setErro(
        `Aluno cadastrado, mas houve erro ao criar o registro do Censo: ${censoError.message}`
      );

      setSalvando(false);
      await carregarAlunos();
      return;
    }

    setMensagem(
      "✅ Aluno cadastrado com sucesso!"
    );

    limparFormulario();

    setMostrarCadastro(false);

    await carregarAlunos();

    setSalvando(false);
  }

  async function alterarStatusDocumento(
    documento: Documento,
    novoStatus: string
  ) {
    setErro("");
    setMensagem("");

    const ehCarteirinha =
      documento.tipo_documento ===
      tipoCarteirinha;

    if (
      ehCarteirinha &&
      novoStatus !== "Entregue" &&
      novoStatus !== "Não entregue"
    ) {
      return;
    }

    const entregue =
      novoStatus === "Entregue";

    const { error } =
      await supabaseSistema
        .from("documentos_alunos")
        .update({
          status: novoStatus,
          entregue,
          data_entrega: entregue
            ? new Date()
                .toISOString()
                .split("T")[0]
            : null,
        })
        .eq(
          "id",
          documento.id
        );

    if (error) {
      console.error(error);

      setErro(
        `Erro ao atualizar documento: ${error.message}`
      );

      return;
    }

    setDocumentos(
      (anteriores) =>
        anteriores.map((doc) =>
          doc.id === documento.id
            ? {
                ...doc,
                status: novoStatus,
                entregue,
                data_entrega:
                  entregue
                    ? new Date()
                        .toISOString()
                        .split("T")[0]
                    : null,
              }
            : doc
        )
    );
  }

  async function alterarCenso(
    cadastrado: boolean
  ) {
    if (!censo) return;

    setErro("");
    setMensagem("");

    const { error } =
      await supabaseSistema
        .from("censo_escolar")
        .update({
          cadastrado,
          data_conferencia:
            cadastrado
              ? new Date()
                  .toISOString()
                  .split("T")[0]
              : null,
        })
        .eq(
          "id",
          censo.id
        );

    if (error) {
      console.error(error);

      setErro(
        `Erro ao atualizar Censo: ${error.message}`
      );

      return;
    }

    setCenso({
      ...censo,
      cadastrado,
    });
  }

  function limparFormulario() {
    setNome("");
    setDataNascimento("");
    setCpf("");
    setCertidao("");
    setSexo("");
    setEndereco("");
    setNumero("");
    setBairro("");
    setCidade("Teófilo Otoni");
    setZona("");
    setTelefone("");
    setObservacoes("");
  }

  function fecharDetalhes() {
    setAlunoSelecionado(null);
    setDocumentos([]);
    setCenso(null);
    setErro("");
    setMensagem("");
  }

  const alunosFiltrados =
    alunos.filter((aluno) =>
      aluno.nome
        .toLowerCase()
        .includes(
          busca.toLowerCase()
        )
    );

  const documentosPendentes =
    documentos.filter(
      (doc) =>
        doc.status === "Pendente"
    );

  const documentosEntregues =
    documentos.filter(
      (doc) =>
        doc.status === "Entregue"
    );

  const documentosNaoAplicaveis =
    documentos.filter(
      (doc) =>
        doc.status ===
        "Não se aplica"
    );

  const carteirinha =
    documentos.find(
      (doc) =>
        doc.tipo_documento ===
        tipoCarteirinha
    );

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-4 md:p-7">

      <div className="max-w-7xl mx-auto">

        {/* CABEÇALHO */}

        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>

            <Link
              href="/"
              className="text-sm font-bold text-blue-600 hover:text-blue-800"
            >
              ← Voltar ao Dashboard
            </Link>

            <p className="text-sm font-semibold text-blue-600 mt-4">
              Sistema de Gestão
            </p>

            <h1 className="text-3xl font-extrabold text-slate-800">
              Alunos
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Cadastro, documentação e situação da rematrícula
            </p>

          </div>

          <div className="flex items-center gap-3">

            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">

              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Ano letivo
              </p>

              <p className="font-extrabold text-slate-700">
                2026
              </p>

            </div>

            <button
              onClick={() => {
                limparFormulario();
                setErro("");
                setMensagem("");
                setMostrarCadastro(true);
              }}
              className="bg-blue-600 text-white px-5 py-3 rounded-xl font-extrabold hover:bg-blue-700 transition"
            >
              + Novo aluno
            </button>

          </div>

        </header>

        {/* MENSAGENS */}

        {mensagem && (
          <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4 text-emerald-700 font-semibold">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-red-700 font-semibold">
            {erro}
          </div>
        )}

        {/* RESUMO */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">

            <p className="text-sm font-semibold text-slate-400">
              Alunos ativos
            </p>

            <p className="text-3xl font-extrabold text-slate-800 mt-2">
              {alunos.length}
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">

            <p className="text-sm font-semibold text-slate-400">
              Ano letivo
            </p>

            <p className="text-3xl font-extrabold text-blue-600 mt-2">
              2026
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">

            <p className="text-sm font-semibold text-slate-400">
              Busca rápida
            </p>

            <p className="text-sm font-bold text-slate-600 mt-3">
              Pesquise pelo nome da criança
            </p>

          </div>

        </section>

        {/* LISTAGEM */}

        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

          <div className="p-6 border-b border-slate-100">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <h2 className="text-xl font-extrabold text-slate-800">
                  Alunos cadastrados
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Clique em um aluno para conferir documentação e Censo.
                </p>

              </div>

              <input
                type="text"
                value={busca}
                onChange={(e) =>
                  setBusca(
                    e.target.value
                  )
                }
                placeholder="🔎 Buscar aluno..."
                className="w-full md:w-80 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          {carregando ? (

            <div className="p-10 text-center text-slate-400">
              Carregando alunos...
            </div>

          ) : alunosFiltrados.length ===
            0 ? (

            <div className="p-12 text-center">

              <div className="text-5xl mb-4">
                👧
              </div>

              <h3 className="text-lg font-extrabold text-slate-700">
                Nenhum aluno encontrado
              </h3>

              <p className="text-sm text-slate-400 mt-2">
                Cadastre o primeiro aluno para começar.
              </p>

              <button
                onClick={() => {
                  limparFormulario();
                  setMostrarCadastro(true);
                }}
                className="mt-5 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700"
              >
                + Cadastrar aluno
              </button>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {alunosFiltrados.map(
                (aluno) => (

                  <button
                    key={aluno.id}
                    onClick={() =>
                      abrirAluno(aluno)
                    }
                    className="w-full text-left p-5 hover:bg-slate-50 transition"
                  >

                    <div className="flex flex-col md:flex-row md:items-center gap-4">

                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl shrink-0">
                        👧
                      </div>

                      <div className="flex-1">

                        <p className="font-extrabold text-slate-800">
                          {aluno.nome}
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                          Nascimento:{" "}
                          {formatarData(
                            aluno.data_nascimento
                          )}
                          {" • "}
                          {idade(
                            aluno.data_nascimento
                          )}{" "}
                          anos
                        </p>

                      </div>

                      <div className="flex items-center gap-2">

                        <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                          Ativo
                        </span>

                        <span className="text-slate-300">
                          →
                        </span>

                      </div>

                    </div>

                  </button>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            MODAL NOVO ALUNO
        ================================================= */}

        {mostrarCadastro && (

          <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">

            <div className="min-h-full flex items-center justify-center">

              <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden">

                <div className="p-6 border-b border-slate-100 flex items-center justify-between">

                  <div>

                    <p className="text-sm font-semibold text-blue-600">
                      Sistema Tesouro Infantil
                    </p>

                    <h2 className="text-2xl font-extrabold text-slate-800">
                      Novo aluno
                    </h2>

                    <p className="text-sm text-slate-400 mt-1">
                      Após o cadastro, a documentação e o Censo serão preparados automaticamente.
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setMostrarCadastro(
                        false
                      )
                    }
                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200"
                  >
                    ✕
                  </button>

                </div>

                <form
                  onSubmit={cadastrarAluno}
                  className="p-6 md:p-8 max-h-[75vh] overflow-y-auto"
                >

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div className="md:col-span-2">

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Nome completo *
                      </label>

                      <input
                        type="text"
                        value={nome}
                        onChange={(e) =>
                          setNome(
                            e.target.value
                          )
                        }
                        placeholder="Nome completo da criança"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        required
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Data de nascimento *
                      </label>

                      <input
                        type="text"
                        inputMode="numeric"
                        value={dataNascimento}
                        onChange={(e) =>
                          setDataNascimento(
                            formatarDataDigitada(
                              e.target.value
                            )
                          )
                        }
                        placeholder="DD/MM/AAAA"
                        maxLength={10}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        required
                      />

                      <p className="text-xs text-slate-400 mt-1">
                        Digite no formato dia/mês/ano.
                      </p>

                    </div>

                    <div>

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Sexo
                      </label>

                      <select
                        value={sexo}
                        onChange={(e) =>
                          setSexo(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >

                        <option value="">
                          Selecione
                        </option>

                        <option value="Feminino">
                          Feminino
                        </option>

                        <option value="Masculino">
                          Masculino
                        </option>

                      </select>

                    </div>

                    <div>

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        CPF da criança
                      </label>

                      <input
                        type="text"
                        value={cpf}
                        onChange={(e) =>
                          setCpf(
                            e.target.value
                          )
                        }
                        placeholder="000.000.000-00"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Certidão de nascimento
                      </label>

                      <input
                        type="text"
                        value={certidao}
                        onChange={(e) =>
                          setCertidao(
                            e.target.value
                          )
                        }
                        placeholder="Número da certidão"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    <div className="md:col-span-2">

                      <h3 className="text-lg font-extrabold text-slate-800 mt-4">
                        Endereço
                      </h3>

                    </div>

                    <div className="md:col-span-2">

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Endereço
                      </label>

                      <input
                        type="text"
                        value={endereco}
                        onChange={(e) =>
                          setEndereco(
                            e.target.value
                          )
                        }
                        placeholder="Rua, avenida, estrada..."
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Número
                      </label>

                      <input
                        type="text"
                        value={numero}
                        onChange={(e) =>
                          setNumero(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Bairro
                      </label>

                      <input
                        type="text"
                        value={bairro}
                        onChange={(e) =>
                          setBairro(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Cidade
                      </label>

                      <input
                        type="text"
                        value={cidade}
                        onChange={(e) =>
                          setCidade(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Zona
                      </label>

                      <select
                        value={zona}
                        onChange={(e) =>
                          setZona(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >

                        <option value="">
                          Selecione
                        </option>

                        <option value="Urbana">
                          Urbana
                        </option>

                        <option value="Rural">
                          Rural
                        </option>

                      </select>

                    </div>

                    <div className="md:col-span-2">

                      <h3 className="text-lg font-extrabold text-slate-800 mt-4">
                        Contato e observações
                      </h3>

                    </div>

                    <div>

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Telefone
                      </label>

                      <input
                        type="text"
                        value={telefone}
                        onChange={(e) =>
                          setTelefone(
                            e.target.value
                          )
                        }
                        placeholder="(33) 99999-9999"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Observações gerais
                      </label>

                      <input
                        type="text"
                        value={observacoes}
                        onChange={(e) =>
                          setObservacoes(
                            e.target.value
                          )
                        }
                        placeholder="Observações importantes"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-100">

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarCadastro(
                          false
                        )
                      }
                      className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={salvando}
                      className="px-6 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 disabled:opacity-60"
                    >
                      {salvando
                        ? "Salvando..."
                        : "💾 Cadastrar aluno"}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          </div>

        )}

        {/* =================================================
            DETALHES DO ALUNO
        ================================================= */}

        {alunoSelecionado && (

          <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">

            <div className="min-h-full flex items-center justify-center">

              <div className="bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden">

                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div className="flex items-center gap-4">

                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                      👧
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-blue-600">
                        Ficha do aluno
                      </p>

                      <h2 className="text-2xl font-extrabold text-slate-800">
                        {alunoSelecionado.nome}
                      </h2>

                      <p className="text-sm text-slate-400 mt-1">
                        Nascimento:{" "}
                        {formatarData(
                          alunoSelecionado.data_nascimento
                        )}
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={
                      fecharDetalhes
                    }
                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200"
                  >
                    ✕
                  </button>

                </div>

                <div className="p-6 md:p-8 max-h-[78vh] overflow-y-auto">

                  {carregandoDetalhes ? (

                    <div className="py-12 text-center text-slate-400">
                      Carregando documentação...
                    </div>

                  ) : (

                    <>

                      {/* RESUMO */}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

                        <div className="rounded-2xl bg-red-50 border border-red-100 p-5">

                          <p className="text-sm font-bold text-red-600">
                            Pendentes
                          </p>

                          <p className="text-3xl font-extrabold text-red-700 mt-2">
                            {
                              documentosPendentes.length
                            }
                          </p>

                        </div>

                        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5">

                          <p className="text-sm font-bold text-emerald-600">
                            Entregues
                          </p>

                          <p className="text-3xl font-extrabold text-emerald-700 mt-2">
                            {
                              documentosEntregues.length
                            }
                          </p>

                        </div>

                        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">

                          <p className="text-sm font-bold text-slate-500">
                            Não se aplica
                          </p>

                          <p className="text-3xl font-extrabold text-slate-700 mt-2">
                            {
                              documentosNaoAplicaveis.length
                            }
                          </p>

                        </div>

                      </div>

                      {/* DOCUMENTOS DA CRIANÇA */}

                      <DocumentoGrupo
                        titulo="👧 Documentos da criança"
                        documentos={
                          documentos
                        }
                        tipos={
                          documentosCrianca
                        }
                        onChange={
                          alterarStatusDocumento
                        }
                      />

                      {/* RESPONSÁVEL */}

                      <DocumentoGrupo
                        titulo="👤 Documentos do responsável"
                        documentos={
                          documentos
                        }
                        tipos={
                          documentosResponsavel
                        }
                        onChange={
                          alterarStatusDocumento
                        }
                      />

                      {/* DOCUMENTOS E FORMULÁRIOS */}

                      <DocumentoGrupo
                        titulo="📝 Documentos e formulários"
                        documentos={
                          documentos
                        }
                        tipos={
                          documentosMatricula
                        }
                        onChange={
                          alterarStatusDocumento
                        }
                      />

                      {/* CARTEIRINHA */}

                      {carteirinha && (

                        <section className="mt-8">

                          <div className="mb-4">

                            <h3 className="text-lg font-extrabold text-slate-800">
                              🎫 Carteirinha de retirada
                            </h3>

                            <p className="text-sm text-slate-400 mt-1">
                              Controle se a carteirinha já foi entregue à família.
                            </p>

                          </div>

                          <div className="rounded-3xl border border-slate-100 overflow-hidden">

                            <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                              <div className="flex items-center gap-3">

                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    carteirinha.status ===
                                    "Entregue"
                                      ? "bg-emerald-50"
                                      : "bg-red-50"
                                  }`}
                                >
                                  {carteirinha.status ===
                                  "Entregue"
                                    ? "✓"
                                    : "!"}
                                </div>

                                <div>

                                  <p className="font-bold text-slate-700">
                                    Carteirinha de retirada do estudante
                                  </p>

                                  <p className="text-xs text-slate-400 mt-1">
                                    {
                                      carteirinha.status
                                    }
                                  </p>

                                </div>

                              </div>

                              <div className="flex gap-2">

                                <button
                                  onClick={() =>
                                    alterarStatusDocumento(
                                      carteirinha,
                                      "Entregue"
                                    )
                                  }
                                  className={`px-4 py-2 rounded-lg text-xs font-bold ${
                                    carteirinha.status ===
                                    "Entregue"
                                      ? "bg-emerald-600 text-white"
                                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  }`}
                                >
                                  Entregue
                                </button>

                                <button
                                  onClick={() =>
                                    alterarStatusDocumento(
                                      carteirinha,
                                      "Não entregue"
                                    )
                                  }
                                  className={`px-4 py-2 rounded-lg text-xs font-bold ${
                                    carteirinha.status ===
                                    "Não entregue"
                                      ? "bg-red-600 text-white"
                                      : "bg-red-50 text-red-700 hover:bg-red-100"
                                  }`}
                                >
                                  Não entregue
                                </button>

                              </div>

                            </div>

                          </div>

                        </section>

                      )}

                      {/* DOCUMENTOS CONDICIONAIS */}

                      <DocumentoGrupo
                        titulo="🩺 Documentos condicionais"
                        documentos={
                          documentos
                        }
                        tipos={
                          documentosCondicionais
                        }
                        onChange={
                          alterarStatusDocumento
                        }
                        condicional
                      />

                      {/* CENSO */}

                      <section className="mt-8">

                        <div className="rounded-3xl border border-slate-100 overflow-hidden">

                          <div className="p-5 bg-slate-50 border-b border-slate-100">

                            <h3 className="text-lg font-extrabold text-slate-800">
                              🏛️ Censo Escolar
                            </h3>

                            <p className="text-sm text-slate-400 mt-1">
                              Situação do aluno no Censo Escolar 2026
                            </p>

                          </div>

                          <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                            <div>

                              <p className="text-sm text-slate-400">
                                Situação atual
                              </p>

                              <p
                                className={`text-xl font-extrabold mt-1 ${
                                  censo?.cadastrado
                                    ? "text-emerald-600"
                                    : "text-red-600"
                                }`}
                              >
                                {censo?.cadastrado
                                  ? "🟢 Cadastrado"
                                  : "🔴 Não cadastrado"}
                              </p>

                            </div>

                            <div className="flex gap-3">

                              <button
                                onClick={() =>
                                  alterarCenso(
                                    true
                                  )
                                }
                                className={`px-5 py-3 rounded-xl font-bold transition ${
                                  censo?.cadastrado
                                    ? "bg-emerald-600 text-white"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                }`}
                              >
                                Cadastrado
                              </button>

                              <button
                                onClick={() =>
                                  alterarCenso(
                                    false
                                  )
                                }
                                className={`px-5 py-3 rounded-xl font-bold transition ${
                                  censo &&
                                  !censo.cadastrado
                                    ? "bg-red-600 text-white"
                                    : "bg-red-50 text-red-700 hover:bg-red-100"
                                }`}
                              >
                                Não cadastrado
                              </button>

                            </div>

                          </div>

                        </div>

                      </section>

                    </>

                  )}

                </div>

                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex justify-end">

                  <button
                    onClick={
                      fecharDetalhes
                    }
                    className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900"
                  >
                    Fechar
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

function DocumentoGrupo({
  titulo,
  documentos,
  tipos,
  onChange,
  condicional = false,
}: {
  titulo: string;
  documentos: Documento[];
  tipos: string[];
  onChange: (
    documento: Documento,
    status: string
  ) => void;
  condicional?: boolean;
}) {
  return (
    <section className="mt-8">

      <div className="mb-4">

        <h3 className="text-lg font-extrabold text-slate-800">
          {titulo}
        </h3>

        {condicional && (
          <p className="text-sm text-slate-400 mt-1">
            Quando não se aplicar à criança, selecione “Não se aplica”.
          </p>
        )}

      </div>

      <div className="rounded-3xl border border-slate-100 overflow-hidden">

        {tipos.map((tipo) => {

          const documento =
            documentos.find(
              (doc) =>
                doc.tipo_documento ===
                tipo
            );

          if (!documento) {
            return null;
          }

          /*
            A carteirinha possui um controle
            próprio de Entregue / Não entregue.
          */

          if (
            tipo === tipoCarteirinha
          ) {
            return null;
          }

          return (
            <div
              key={documento.id}
              className="p-4 border-b last:border-b-0 border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >

              <div className="flex items-center gap-3">

                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    documento.status ===
                    "Entregue"
                      ? "bg-emerald-50"
                      : documento.status ===
                        "Não se aplica"
                      ? "bg-slate-100"
                      : "bg-red-50"
                  }`}
                >
                  {documento.status ===
                  "Entregue"
                    ? "✓"
                    : documento.status ===
                      "Não se aplica"
                    ? "—"
                    : "!"}
                </div>

                <div>

                  <p className="font-bold text-slate-700">
                    {tipo}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    {
                      documento.status
                    }
                  </p>

                </div>

              </div>

              <div className="flex gap-2 flex-wrap">

                <button
                  onClick={() =>
                    onChange(
                      documento,
                      "Entregue"
                    )
                  }
                  className={`px-3 py-2 rounded-lg text-xs font-bold ${
                    documento.status ===
                    "Entregue"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  Entregue
                </button>

                <button
                  onClick={() =>
                    onChange(
                      documento,
                      "Pendente"
                    )
                  }
                  className={`px-3 py-2 rounded-lg text-xs font-bold ${
                    documento.status ===
                    "Pendente"
                      ? "bg-red-600 text-white"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  Pendente
                </button>

                {condicional && (
                  <button
                    onClick={() =>
                      onChange(
                        documento,
                        "Não se aplica"
                      )
                    }
                    className={`px-3 py-2 rounded-lg text-xs font-bold ${
                      documento.status ===
                      "Não se aplica"
                        ? "bg-slate-700 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Não se aplica
                  </button>
                )}

              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}