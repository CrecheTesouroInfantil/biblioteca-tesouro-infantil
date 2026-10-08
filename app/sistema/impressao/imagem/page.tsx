"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseSistema } from "@/lib/supabaseSistema";

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
  turma?: {
    id: number;
    nome: string;
    turno: string | null;
  } | null;
};

type Responsavel = Record<string, unknown> & {
  aluno_id?: number;
};

const ANO_LETIVO = 2026;

function formatarData(data: string | null) {
  if (!data) return "";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function textoResponsavel(registro: Responsavel | null) {
  if (!registro) return "";

  const possiveis = [
    "nome",
    "nome_completo",
    "responsavel",
    "nome_responsavel",
    "responsavel_nome",
  ];

  for (const campo of possiveis) {
    const valor = registro[campo];
    if (typeof valor === "string" && valor.trim()) {
      return valor;
    }
  }

  return "";
}

export default function ImagemPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);

  const [busca, setBusca] = useState("");
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState<number | null>(
    null
  );

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [opcao, setOpcao] = useState<"autorizo" | "nao-autorizo" | "">("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    const [resultadoAlunos, resultadoMatriculas, resultadoResponsaveis] =
      await Promise.all([
        supabaseSistema
          .from("alunos")
          .select("id,nome,data_nascimento,ativo")
          .eq("ativo", true)
          .order("nome", { ascending: true }),

        supabaseSistema
          .from("matriculas")
          .select(`
            id,
            aluno_id,
            turma_id,
            ano_letivo,
            turno,
            situacao,
            turma:turmas (
              id,
              nome,
              turno
            )
          `)
          .eq("ano_letivo", ANO_LETIVO),

        supabaseSistema.from("responsaveis").select("*"),
      ]);

    if (resultadoAlunos.error) {
      setErro(
        `Não foi possível carregar os alunos: ${resultadoAlunos.error.message}`
      );
      setCarregando(false);
      return;
    }

    if (resultadoMatriculas.error) {
      setErro(
        `Não foi possível carregar as matrículas: ${resultadoMatriculas.error.message}`
      );
      setCarregando(false);
      return;
    }

    if (resultadoResponsaveis.error) {
      setErro(
        `Não foi possível carregar os responsáveis: ${resultadoResponsaveis.error.message}`
      );
      setCarregando(false);
      return;
    }

    setAlunos((resultadoAlunos.data || []) as Aluno[]);
    setMatriculas((resultadoMatriculas.data || []) as unknown as Matricula[]);
    setResponsaveis((resultadoResponsaveis.data || []) as Responsavel[]);
    setCarregando(false);
  }

  const alunosFiltrados = useMemo(() => {
    const texto = busca.trim().toLowerCase();

    if (!texto) {
      return alunos;
    }

    return alunos.filter((item) =>
      item.nome.toLowerCase().includes(texto)
    );
  }, [alunos, busca]);

  const alunoSelecionado = useMemo(() => {
    if (!alunoSelecionadoId) return null;
    return alunos.find((item) => item.id === alunoSelecionadoId) || null;
  }, [alunos, alunoSelecionadoId]);

  const matriculaSelecionada = useMemo(() => {
    if (!alunoSelecionadoId) return null;

    const lista = matriculas.filter(
      (item) =>
        item.aluno_id === alunoSelecionadoId &&
        item.ano_letivo === ANO_LETIVO
    );

    return (
      lista.find(
        (item) =>
          item.situacao === "Ativa" ||
          item.situacao === "ATIVA" ||
          item.situacao === "ativa"
      ) || lista[0] || null
    );
  }, [matriculas, alunoSelecionadoId]);

  const responsavelSelecionado = useMemo(() => {
    if (!alunoSelecionadoId) return "";

    const registro = responsaveis.find(
      (item) => Number(item.aluno_id) === alunoSelecionadoId
    );

    return textoResponsavel(registro || null);
  }, [responsaveis, alunoSelecionadoId]);

  const nomeAluno = alunoSelecionado?.nome || "";
  const nascimento = alunoSelecionado?.data_nascimento || "";
  const turma =
    matriculaSelecionada?.turma?.nome ||
    "";
  const responsavel = responsavelSelecionado;

  function selecionarAluno(id: number) {
    setAlunoSelecionadoId(id);
    setBusca("");
    setOpcao("");
  }

  function limparAluno() {
    setAlunoSelecionadoId(null);
    setBusca("");
    setOpcao("");
  }

  return (
    <>
      <main className="min-h-screen bg-[#eef5ff] px-4 py-6 print:bg-white print:p-0">
        <div className="mx-auto max-w-6xl print:max-w-none">

          {/* PAINEL DE SELEÇÃO */}
          <section className="mb-6 rounded-3xl bg-white p-5 shadow-lg print:hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Impressão
                </p>

                <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Termo de Uso de Imagem e Voz
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Selecione o aluno e os dados serão preenchidos automaticamente.
                </p>
              </div>

              <button
                type="button"
                disabled={!alunoSelecionado}
                onClick={() => window.print()}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
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
                  value={
                    alunoSelecionado
                      ? alunoSelecionado.nome
                      : busca
                  }
                  onChange={(e) => {
                    setAlunoSelecionadoId(null);
                    setBusca(e.target.value);
                  }}
                  placeholder="Digite o nome da criança..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </label>

              {carregando ? (
                <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Carregando alunos...
                </div>
              ) : !alunoSelecionado && busca.trim() ? (
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {alunosFiltrados.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      {alunosFiltrados.map((aluno) => {
                        const matricula = matriculas.find(
                          (item) =>
                            item.aluno_id === aluno.id &&
                            item.ano_letivo === ANO_LETIVO
                        );

                        return (
                          <button
                            key={aluno.id}
                            type="button"
                            onClick={() => selecionarAluno(aluno.id)}
                            className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50"
                          >
                            <div>
                              <p className="font-bold text-slate-800">
                                {aluno.nome}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                Nascimento:{" "}
                                {formatarData(aluno.data_nascimento)}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase text-blue-700">
                                {matricula?.turma?.nome || "Sem turma"}
                              </span>

                              <p className="mt-1 text-[10px] text-slate-400">
                                Selecionar →
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="p-4 text-sm text-slate-500">
                      Nenhum aluno encontrado.
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            {alunoSelecionado && (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                      Aluno selecionado
                    </p>

                    <p className="mt-1 text-lg font-extrabold text-blue-900">
                      {nomeAluno}
                    </p>

                    <p className="mt-1 text-xs text-blue-700">
                      {turma || "Turma não encontrada"}{" "}
                      {nascimento
                        ? `• ${formatarData(nascimento)}`
                        : ""}
                      {responsavel
                        ? ` • Responsável: ${responsavel}`
                        : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={limparAluno}
                    className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-100"
                  >
                    Trocar aluno
                  </button>
                </div>

                {!responsavel && (
                  <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                    O aluno foi encontrado, mas não foi localizado um responsável
                    vinculado na tabela de responsáveis.
                  </p>
                )}

                {!matriculaSelecionada && (
                  <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                    O aluno não possui matrícula encontrada para o ano letivo de 2026,
                    então a turma ficará em branco.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* DOCUMENTO A4 */}
          <article className="a4-page mx-auto bg-white text-[11.5pt] leading-[1.42] text-slate-900 shadow-xl print:shadow-none">
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

              <h1 className="mt-4 text-center text-[15pt] font-black uppercase">
                Termo de Autorização para Uso de Imagem e Voz
              </h1>
            </header>

            <p className="mt-4">
              Pelo presente instrumento, eu,{" "}
              <strong>
                {responsavel ||
                  "____________________________________________________________"}
              </strong>
              , responsável legal pela criança{" "}
              <strong>
                {nomeAluno ||
                  "____________________________________________________________"}
              </strong>
              , matriculada no <strong>Tesouro Infantil</strong>, turma{" "}
              <strong>
                {turma || "____________________________"}
              </strong>
              , declaro estar ciente e de acordo com as condições estabelecidas
              neste termo.
            </p>

            <Secao numero="1" titulo="DA AUTORIZAÇÃO">
              <p>
                Autorizo o <strong>Tesouro Infantil</strong> a fotografar, filmar
                e registrar a participação da criança em atividades pedagógicas,
                projetos, apresentações, eventos, passeios, comemorações e demais
                atividades realizadas ou promovidas pela instituição.
              </p>

              <p className="mt-2">
                A autorização compreende fotografias, vídeos e registros
                audiovisuais nos quais a criança apareça ou tenha sua voz registrada.
              </p>
            </Secao>

            <Secao numero="2" titulo="DAS FINALIDADES">
              <p>
                Os registros poderão ser utilizados exclusivamente para fins
                educacionais, pedagógicos, institucionais e de divulgação das
                atividades realizadas pelo Tesouro Infantil, incluindo:
              </p>

              <ul className="mt-1 list-disc pl-5">
                <li>murais e espaços internos da instituição;</li>
                <li>apresentações e atividades pedagógicas;</li>
                <li>materiais informativos e institucionais;</li>
                <li>site e páginas oficiais da instituição;</li>
                <li>redes sociais oficiais da instituição;</li>
                <li>registros e divulgações de projetos, eventos e atividades escolares;</li>
                <li>materiais de divulgação institucional relacionados às atividades da instituição.</li>
              </ul>
            </Secao>

            <Secao numero="3" titulo="DA GRATUIDADE E DA FINALIDADE NÃO COMERCIAL">
              <p>
                A autorização é concedida de forma <strong>gratuita</strong>,
                não gerando qualquer pagamento, indenização ou remuneração pela
                utilização da imagem ou da voz da criança.
              </p>

              <p className="mt-2">
                A imagem e a voz não deverão ser utilizadas para finalidade
                comercial, publicitária ou diversa daquela prevista neste termo.
              </p>
            </Secao>

            <Secao numero="4" titulo="DO RESPEITO À CRIANÇA">
              <p>
                O Tesouro Infantil compromete-se a utilizar os registros de maneira
                respeitosa, preservando a dignidade, a integridade, a privacidade e
                os direitos da criança, não realizando utilização que possa causar
                constrangimento, exposição indevida ou qualquer forma de discriminação.
              </p>
            </Secao>

            <Secao numero="5" titulo="DO TRATAMENTO DOS DADOS E DA PRIVACIDADE">
              <p>
                O responsável declara estar ciente de que os registros de imagem
                e voz estão relacionados à criança e serão tratados para as
                finalidades descritas neste termo, observados os princípios de
                proteção de dados pessoais e os direitos da criança e de seu
                responsável legal.
              </p>
            </Secao>

            <section className="mt-4 break-inside-avoid rounded-xl border-2 border-blue-700 bg-blue-50 p-3">
              <div className="text-center">
                <h3 className="text-[12pt] font-black uppercase text-blue-900">
                  6. OPÇÃO DO RESPONSÁVEL
                </h3>

                <p className="mt-1 text-[9.5pt] font-extrabold uppercase">
                  ATENÇÃO: MARQUE APENAS UMA DAS OPÇÕES ABAIXO
                </p>

                <p className="text-[9pt] text-slate-600">
                  Utilize um X ou ✓ no quadrinho correspondente. Não marque as duas opções.
                </p>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setOpcao("autorizo")}
                  className={`rounded-lg border-2 bg-white p-3 text-left ${
                    opcao === "autorizo"
                      ? "border-green-600 bg-green-50"
                      : "border-slate-300"
                  }`}
                >
                  <p className="font-black text-green-700">
                    {opcao === "autorizo" ? "☒" : "☐"} AUTORIZO
                  </p>

                  <p className="mt-1 text-[9.5pt]">
                    Autorizo o Tesouro Infantil a captar e utilizar a imagem e a
                    voz da criança identificada neste documento, exclusivamente
                    para as finalidades descritas neste Termo de Autorização.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setOpcao("nao-autorizo")}
                  className={`rounded-lg border-2 bg-white p-3 text-left ${
                    opcao === "nao-autorizo"
                      ? "border-red-600 bg-red-50"
                      : "border-slate-300"
                  }`}
                >
                  <p className="font-black text-red-700">
                    {opcao === "nao-autorizo" ? "☒" : "☐"} NÃO AUTORIZO
                  </p>

                  <p className="mt-1 text-[9.5pt]">
                    Não autorizo o Tesouro Infantil a utilizar a imagem e a voz
                    da criança identificada neste documento para as finalidades
                    descritas neste termo.
                  </p>
                </button>
              </div>

              <p className="mt-2 text-center text-[8.5pt] text-slate-600">
                Em caso de dúvida, procure a secretaria da instituição antes de
                assinar este documento.
              </p>
            </section>

            <Secao numero="7" titulo="DA REVOGAÇÃO DA AUTORIZAÇÃO">
              <p>
                O responsável legal poderá solicitar a revogação da autorização
                a qualquer momento, mediante comunicação à instituição.
              </p>

              <p className="mt-2">
                A revogação produzirá efeitos para novas utilizações dos registros,
                não sendo possível garantir a retirada de materiais que já tenham
                sido publicados, distribuídos ou reproduzidos antes do recebimento
                da solicitação, especialmente quando compartilhados por terceiros.
              </p>
            </Secao>

            <Secao numero="8" titulo="DA CIÊNCIA E CONCORDÂNCIA">
              <p>
                Declaro que li e compreendi este termo e que fui informado(a)
                sobre as finalidades da utilização da imagem e da voz da criança.
              </p>

              <p className="mt-2">
                Declaro ainda que sou responsável legal pela criança identificada
                neste documento e que a opção acima assinalada representa minha
                decisão quanto à utilização de sua imagem e voz.
              </p>
            </Secao>

            <section className="mt-4 break-inside-avoid">
              <h3 className="mb-2 border-b border-slate-300 pb-1 text-[10.5pt] font-black uppercase">
                Dados da criança
              </h3>

              <p>
                <strong>Nome completo:</strong>{" "}
                {nomeAluno ||
                  "____________________________________________________________"}
              </p>

              <div className="mt-2 grid grid-cols-2 gap-4">
                <p>
                  <strong>Data de nascimento:</strong>{" "}
                  {nascimento
                    ? formatarData(nascimento)
                    : "____/____/________"}
                </p>

                <p>
                  <strong>Turma:</strong>{" "}
                  {turma || "____________________________"}
                </p>
              </div>
            </section>

            <section className="mt-4 break-inside-avoid">
              <h3 className="mb-2 border-b border-slate-300 pb-1 text-[10.5pt] font-black uppercase">
                Dados do responsável legal
              </h3>

              <p>
                <strong>Nome completo:</strong>{" "}
                {responsavel ||
                  "____________________________________________________________"}
              </p>
            </section>

            <section className="mt-5 break-inside-avoid">
              <p>
                <strong>Teófilo Otoni/MG,</strong> ______ de{" "}
                ______________________________ de 20______.
              </p>

              <div className="mt-8 text-center">
                <div className="mx-auto w-[310px] border-t border-slate-900 pt-2">
                  <p className="font-bold">
                    Assinatura do responsável legal
                  </p>

                  <p className="mt-1 text-[9pt]">
                    Nome:{" "}
                    {responsavel || "________________________________________"}
                  </p>
                </div>
              </div>
            </section>

            <footer className="mt-5 border-t border-slate-300 pt-2 text-center text-[8pt] text-slate-500">
              <strong className="text-slate-700">
                TESOURO INFANTIL
              </strong>
              <br />
              Documento destinado ao registro da manifestação do responsável
              legal quanto à autorização para utilização de imagem e voz da criança.
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
            background: #fff !important;
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
