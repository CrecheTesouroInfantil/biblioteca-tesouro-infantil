"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  turno: string | null;
};

type Matricula = {
  id: number;
  aluno_id: number;
  turma_id: number | null;
  ano_letivo: number;
  situacao: string | null;
  turma: Turma | null;
};

type Responsavel = {
  aluno_id?: number;
  nome?: string | null;
  nome_completo?: string | null;
  responsavel?: string | null;
  nome_responsavel?: string | null;
  responsavel_nome?: string | null;
};

type PessoaAutorizada = {
  nome: string;
  parentesco: string;
  documento: string;
  telefone: string;
};

const ANO_LETIVO = 2026;

function formatarData(data: string | null | undefined) {
  if (!data) return "";

  const partes = data.split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function nomeDoResponsavel(item: Responsavel | undefined) {
  if (!item) return "";

  return (
    item.nome ||
    item.nome_completo ||
    item.responsavel ||
    item.nome_responsavel ||
    item.responsavel_nome ||
    ""
  );
}

export default function TermoRetiradaPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);

  const [busca, setBusca] = useState("");
  const [alunoId, setAlunoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [pessoas, setPessoas] = useState<PessoaAutorizada[]>([
    {
      nome: "",
      parentesco: "",
      documento: "",
      telefone: "",
    },
    {
      nome: "",
      parentesco: "",
      documento: "",
      telefone: "",
    },
    {
      nome: "",
      parentesco: "",
      documento: "",
      telefone: "",
    },
  ]);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro("");

      const alunosResult = await supabaseSistema
        .from("alunos")
        .select("id,nome,data_nascimento,ativo")
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (alunosResult.error) {
        setErro(
          `Erro ao carregar alunos: ${alunosResult.error.message}`
        );
        setCarregando(false);
        return;
      }

      const matriculasResult = await supabaseSistema
        .from("matriculas")
        .select(`
          id,
          aluno_id,
          turma_id,
          ano_letivo,
          situacao,
          turma:turmas (
            id,
            nome,
            turno
          )
        `)
        .eq("ano_letivo", ANO_LETIVO);

      if (matriculasResult.error) {
        setErro(
          `Erro ao carregar matrículas: ${matriculasResult.error.message}`
        );
        setCarregando(false);
        return;
      }

      const responsaveisResult = await supabaseSistema
        .from("responsaveis")
        .select("*");

      if (responsaveisResult.error) {
        setErro(
          `Erro ao carregar responsáveis: ${responsaveisResult.error.message}`
        );
        setCarregando(false);
        return;
      }

      setAlunos((alunosResult.data || []) as Aluno[]);

      setMatriculas(
        (matriculasResult.data || []) as unknown as Matricula[]
      );

      setResponsaveis(
        (responsaveisResult.data || []) as Responsavel[]
      );

      setCarregando(false);
    }

    carregar();
  }, []);

  const resultados = useMemo(() => {
    const texto = busca.trim().toLowerCase();

    if (!texto || alunoId) {
      return [];
    }

    return alunos.filter((item) =>
      item.nome.toLowerCase().includes(texto)
    );
  }, [alunos, busca, alunoId]);

  const aluno = useMemo(() => {
    return alunos.find((item) => item.id === alunoId) || null;
  }, [alunos, alunoId]);

  const matricula = useMemo(() => {
    if (!alunoId) return null;

    const lista = matriculas.filter(
      (item) =>
        item.aluno_id === alunoId &&
        item.ano_letivo === ANO_LETIVO
    );

    return (
      lista.find((item) =>
        ["ativa", "ATIVA", "Ativa"].includes(item.situacao || "")
      ) ||
      lista[0] ||
      null
    );
  }, [matriculas, alunoId]);

  const responsavel = useMemo(() => {
    if (!alunoId) return "";

    const registro = responsaveis.find(
      (item) => Number(item.aluno_id) === alunoId
    );

    return nomeDoResponsavel(registro);
  }, [responsaveis, alunoId]);

  function selecionarAluno(id: number) {
    setAlunoId(id);
    setBusca("");
  }

  function trocarAluno() {
    setAlunoId(null);
    setBusca("");
  }

  function alterarPessoa(
    index: number,
    campo: keyof PessoaAutorizada,
    valor: string
  ) {
    setPessoas((lista) =>
      lista.map((item, i) =>
        i === index
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    );
  }

  function adicionarPessoa() {
    setPessoas((lista) => [
      ...lista,
      {
        nome: "",
        parentesco: "",
        documento: "",
        telefone: "",
      },
    ]);
  }

  function removerPessoa(index: number) {
    setPessoas((lista) =>
      lista.filter((_, i) => i !== index)
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#eef5ff] px-4 py-6 print:bg-white print:p-0">
        <div className="mx-auto max-w-6xl print:max-w-none">

          <section className="mb-6 rounded-3xl bg-white p-5 shadow-lg print:hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Impressão
                </p>

                <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Termo de Autorização para Retirada de Aluno
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Busque o aluno para preencher automaticamente os dados.
                </p>
              </div>

              <button
                type="button"
                disabled={!aluno}
                onClick={() => window.print()}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                🖨️ Imprimir termo
              </button>
            </div>

            {erro && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {erro}
              </div>
            )}

            <div className="mt-5">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">
                  🔎 Buscar aluno
                </span>

                <input
                  type="text"
                  value={aluno ? aluno.nome : busca}
                  onChange={(event) => {
                    setAlunoId(null);
                    setBusca(event.target.value);
                  }}
                  placeholder="Digite o nome da criança..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </label>

              {carregando && (
                <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Carregando alunos...
                </div>
              )}

              {!carregando && resultados.length > 0 && (
                <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {resultados.map((item) => {
                    const matriculaAluno = matriculas.find(
                      (registro) =>
                        registro.aluno_id === item.id &&
                        registro.ano_letivo === ANO_LETIVO
                    );

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selecionarAluno(item.id)}
                        className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-blue-50"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {item.nome}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Nascimento:{" "}
                            {formatarData(item.data_nascimento)}
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase text-blue-700">
                          {matriculaAluno?.turma?.nome || "Sem turma"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {!carregando &&
                busca.trim() &&
                !aluno &&
                resultados.length === 0 && (
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Nenhum aluno encontrado.
                  </div>
                )}
            </div>

            {aluno && (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                      Aluno selecionado
                    </p>

                    <p className="mt-1 text-lg font-extrabold text-blue-900">
                      {aluno.nome}
                    </p>

                    <p className="mt-1 text-xs text-blue-700">
                      Turma:{" "}
                      {matricula?.turma?.nome || "não encontrada"}
                      {" • "}
                      Nascimento:{" "}
                      {formatarData(aluno.data_nascimento)}
                      {" • "}
                      Responsável:{" "}
                      {responsavel || "não localizado"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={trocarAluno}
                    className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-100"
                  >
                    Trocar aluno
                  </button>
                </div>

                {!responsavel && (
                  <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                    Não foi localizado um responsável vinculado a este aluno.
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h2 className="text-sm font-extrabold text-slate-800">
                Pessoas autorizadas
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Cadastre as pessoas que poderão retirar a criança.
              </p>

              <div className="mt-4 space-y-4">
                {pessoas.map((pessoa, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                        Pessoa autorizada {index + 1}
                      </p>

                      {pessoas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerPessoa(index)}
                          className="text-xs font-bold text-red-600"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <Campo
                        label="Nome completo"
                        value={pessoa.nome}
                        onChange={(valor) =>
                          alterarPessoa(index, "nome", valor)
                        }
                      />

                      <Campo
                        label="Parentesco / relação"
                        value={pessoa.parentesco}
                        onChange={(valor) =>
                          alterarPessoa(index, "parentesco", valor)
                        }
                      />

                      <Campo
                        label="RG / documento"
                        value={pessoa.documento}
                        onChange={(valor) =>
                          alterarPessoa(index, "documento", valor)
                        }
                      />

                      <Campo
                        label="Telefone"
                        value={pessoa.telefone}
                        onChange={(valor) =>
                          alterarPessoa(index, "telefone", valor)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={adicionarPessoa}
                className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-extrabold text-blue-700 hover:bg-blue-100"
              >
                + Adicionar outra pessoa autorizada
              </button>
            </div>
          </section>

          <article className="a4-page mx-auto bg-white text-[11.5pt] leading-[1.43] text-slate-900 shadow-xl print:shadow-none">
            <header className="border-b-2 border-blue-700 pb-3">
              <div className="flex items-center justify-center gap-3">
                <img
                  src="/logo-creche.png"
                  alt="Tesouro Infantil"
                  className="h-14 w-14 object-contain"
                />

                <div className="text-center">
                  <h2 className="text-[18pt] font-black uppercase tracking-wide text-blue-800">
                    Tesouro Infantil
                  </h2>

                  <p className="text-[9pt] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Educação Infantil
                  </p>
                </div>
              </div>

              <h1 className="mt-4 text-center text-[14.5pt] font-black uppercase">
                Termo de Autorização para Retirada de Aluno
              </h1>

              <p className="mt-1 text-center text-[8.5pt] font-semibold text-slate-500">
                Autorização para retirada da criança por responsável ou pessoa autorizada
              </p>
            </header>

            <section className="mt-4">
              <p>
                Eu,{" "}
                <strong>
                  {responsavel ||
                    "____________________________________________"}
                </strong>
                , responsável legal pela criança{" "}
                <strong>
                  {aluno?.nome ||
                    "____________________________________________"}
                </strong>
                , matriculada no <strong>Tesouro Infantil</strong>, turma{" "}
                <strong>
                  {matricula?.turma?.nome ||
                    "____________________________"}
                </strong>
                , declaro estar ciente das regras da instituição para a retirada
                da criança e autorizo as pessoas identificadas neste documento.
              </p>
            </section>

            <Secao numero="1" titulo="Identificação da criança">
              <div className="grid grid-cols-[1fr_160px] gap-4">
                <p>
                  <strong>Nome completo:</strong>{" "}
                  {aluno?.nome ||
                    "____________________________________________"}
                </p>

                <p>
                  <strong>Data de nascimento:</strong>{" "}
                  {formatarData(aluno?.data_nascimento) ||
                    "____/____/________"}
                </p>
              </div>

              <p className="mt-2">
                <strong>Turma:</strong>{" "}
                {matricula?.turma?.nome ||
                  "____________________________________________"}
              </p>
            </Secao>

            <Secao numero="2" titulo="Responsável legal">
              <p>
                <strong>Nome completo:</strong>{" "}
                {responsavel ||
                  "____________________________________________"}
              </p>
            </Secao>

            <Secao
              numero="3"
              titulo="Pessoas autorizadas a retirar a criança"
            >
              <p>
                Autorizo as pessoas relacionadas abaixo a retirar a criança da
                instituição. A pessoa autorizada deverá apresentar documento de
                identificação quando solicitado.
              </p>

              <div className="mt-3 space-y-2">
                {pessoas.map((pessoa, index) => (
                  <div
                    key={index}
                    className="break-inside-avoid rounded-lg border border-slate-300"
                  >
                    <div className="border-b border-slate-300 bg-slate-50 px-3 py-1.5">
                      <p className="text-[9.5pt] font-black uppercase text-blue-800">
                        Pessoa autorizada {index + 1}
                      </p>
                    </div>

                    <div className="grid grid-cols-[1.7fr_1fr_1fr] gap-x-4 gap-y-1 px-3 py-2 text-[9.5pt]">
                      <p>
                        <strong>Nome:</strong>{" "}
                        {pessoa.nome ||
                          "________________________________"}
                      </p>

                      <p>
                        <strong>Parentesco:</strong>{" "}
                        {pessoa.parentesco ||
                          "____________________"}
                      </p>

                      <p>
                        <strong>Telefone:</strong>{" "}
                        {pessoa.telefone ||
                          "____________________"}
                      </p>

                      <p className="col-span-2">
                        <strong>RG / Documento:</strong>{" "}
                        {pessoa.documento ||
                          "________________________________"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Secao>

            <Secao numero="4" titulo="Regras para a retirada">
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  A criança somente poderá ser retirada pelo responsável legal
                  ou por pessoa previamente autorizada.
                </li>

                <li>
                  A pessoa autorizada deverá ser identificada pela instituição.
                </li>

                <li>
                  A instituição poderá solicitar documento de identificação.
                </li>

                <li>
                  Alterações na lista de pessoas autorizadas deverão ser
                  comunicadas pelo responsável legal.
                </li>

                <li>
                  O responsável declara ser responsável pela veracidade das
                  informações fornecidas neste termo.
                </li>
              </ul>
            </Secao>

            <section className="mt-4 break-inside-avoid rounded-xl border-2 border-amber-400 bg-amber-50 p-3">
              <h3 className="text-[10.5pt] font-black uppercase text-amber-900">
                Atenção
              </h3>

              <p className="mt-1 text-[9.5pt]">
                A autorização não substitui a identificação da pessoa
                autorizada. Em caso de dúvida, a instituição poderá entrar em
                contato com o responsável legal antes de liberar a criança.
              </p>
            </section>

            <Secao numero="5" titulo="Declaração do responsável">
              <p>
                Declaro que as informações apresentadas neste documento são
                verdadeiras e que as pessoas indicadas acima estão autorizadas
                por mim a realizar a retirada da criança.
              </p>

              <p className="mt-2">
                Comprometo-me a comunicar imediatamente à instituição qualquer
                alteração, inclusão ou exclusão de pessoa autorizada.
              </p>
            </Secao>

            <section className="mt-5 break-inside-avoid">
              <p>
                <strong>Teófilo Otoni/MG,</strong> ______ de{" "}
                __________________________ de 20_______.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-8 text-center">
                <div>
                  <div className="mx-auto w-[250px] border-t border-slate-900 pt-2">
                    <p className="font-bold">
                      Assinatura do responsável legal
                    </p>

                    <p className="mt-1 text-[8.5pt]">
                      Nome:{" "}
                      {responsavel ||
                        "____________________________"}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mx-auto w-[250px] border-t border-slate-900 pt-2">
                    <p className="font-bold">
                      Conferência da instituição
                    </p>

                    <p className="mt-1 text-[8.5pt]">
                      Nome/assinatura: ______________________________
                    </p>

                    <p className="text-[8.5pt]">
                      Data: ____/____/________
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <footer className="mt-5 border-t border-slate-300 pt-2 text-center text-[8pt] text-slate-500">
              <strong className="text-slate-700">
                TESOURO INFANTIL
              </strong>
              <br />
              Termo destinado ao registro das pessoas autorizadas pelo
              responsável legal a realizar a retirada da criança.
            </footer>
          </article>
        </div>
      </main>

      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        .a4-page {
          width: 210mm;
          min-height: 297mm;
          padding: 12mm 14mm;
          box-sizing: border-box;
        }

        @media screen and (max-width: 900px) {
          .a4-page {
            width: 100%;
            min-height: auto;
          }
        }

        @media print {
          html,
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .a4-page {
            width: 210mm !important;
            min-height: 277mm !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}

function Campo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-600">
        {label}
      </span>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function Secao({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-3 break-inside-avoid">
      <h3 className="mb-1 text-[10.5pt] font-black uppercase">
        {numero}. {titulo}
      </h3>

      {children}
    </section>
  );
}
