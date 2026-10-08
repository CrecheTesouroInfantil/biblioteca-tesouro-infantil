"use client";

import { useState } from "react";

type Autorizado = {
  nome: string;
  parentesco: string;
  documento: string;
  telefone: string;
};

const vazio: Autorizado = {
  nome: "",
  parentesco: "",
  documento: "",
  telefone: "",
};

export default function TermoRetiradaPage() {
  const [aluno, setAluno] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [turma, setTurma] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [cpfResponsavel, setCpfResponsavel] = useState("");
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("Teófilo Otoni/MG");
  const [autorizados, setAutorizados] = useState<Autorizado[]>([
    { ...vazio },
    { ...vazio },
    { ...vazio },
  ]);

  function atualizarAutorizado(
    index: number,
    campo: keyof Autorizado,
    valor: string
  ) {
    setAutorizados((atual) =>
      atual.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item
      )
    );
  }

  function adicionarAutorizado() {
    setAutorizados((atual) => [...atual, { ...vazio }]);
  }

  function removerAutorizado(index: number) {
    setAutorizados((atual) => atual.filter((_, i) => i !== index));
  }

  function imprimir() {
    window.print();
  }

  return (
    <>
      <main className="min-h-screen bg-[#eef5ff] px-4 py-6 print:bg-white print:p-0">
        <div className="mx-auto max-w-6xl print:max-w-none">

          {/* PAINEL DE PREENCHIMENTO */}
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
                  Preencha os dados e informe quem está autorizado a retirar a criança.
                </p>
              </div>

              <button
                type="button"
                onClick={imprimir}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-blue-700"
              >
                🖨️ Imprimir termo
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Campo label="Nome da criança" value={aluno} onChange={setAluno} />
              <Campo
                label="Data de nascimento"
                value={nascimento}
                onChange={setNascimento}
                type="date"
              />
              <Campo label="Turma" value={turma} onChange={setTurma} />
              <Campo
                label="Nome do responsável legal"
                value={responsavel}
                onChange={setResponsavel}
              />
              <Campo
                label="CPF do responsável"
                value={cpfResponsavel}
                onChange={setCpfResponsavel}
              />
              <Campo
                label="Telefone do responsável"
                value={telefoneResponsavel}
                onChange={setTelefoneResponsavel}
              />
              <div className="md:col-span-2">
                <Campo
                  label="Endereço"
                  value={endereco}
                  onChange={setEndereco}
                />
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="mb-3">
                <h2 className="text-sm font-extrabold text-slate-800">
                  Pessoas autorizadas
                </h2>
                <p className="text-xs text-slate-500">
                  Cadastre as pessoas que poderão retirar a criança na instituição.
                </p>
              </div>

              <div className="space-y-4">
                {autorizados.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                        Autorizado {index + 1}
                      </p>

                      {autorizados.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerAutorizado(index)}
                          className="text-xs font-bold text-red-600 hover:text-red-700"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <Campo
                        label="Nome completo"
                        value={item.nome}
                        onChange={(valor) =>
                          atualizarAutorizado(index, "nome", valor)
                        }
                      />
                      <Campo
                        label="Parentesco / relação"
                        value={item.parentesco}
                        onChange={(valor) =>
                          atualizarAutorizado(index, "parentesco", valor)
                        }
                      />
                      <Campo
                        label="RG / documento"
                        value={item.documento}
                        onChange={(valor) =>
                          atualizarAutorizado(index, "documento", valor)
                        }
                      />
                      <Campo
                        label="Telefone"
                        value={item.telefone}
                        onChange={(valor) =>
                          atualizarAutorizado(index, "telefone", valor)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={adicionarAutorizado}
                className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-extrabold text-blue-700 transition hover:bg-blue-100"
              >
                + Adicionar outra pessoa autorizada
              </button>
            </div>
          </section>

          {/* DOCUMENTO A4 */}
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
                Autorização para retirada da criança por responsável ou pessoa previamente autorizada
              </p>
            </header>

            <section className="mt-4">
              <p>
                Eu,{" "}
                <Linha
                  texto={
                    responsavel ||
                    "____________________________________________________________"
                  }
                />
                , responsável legal pela criança{" "}
                <Linha
                  texto={
                    aluno ||
                    "____________________________________________________________"
                  }
                />
                , matriculada no <strong>Tesouro Infantil</strong>, turma{" "}
                <Linha texto={turma || "____________________________"} />, declaro,
                para os devidos fins, que estou ciente das regras da instituição
                para a retirada da criança e autorizo as pessoas identificadas
                neste documento a realizar sua retirada, conforme as condições
                estabelecidas abaixo.
              </p>
            </section>

            <Secao numero="1" titulo="IDENTIFICAÇÃO DA CRIANÇA">
              <div className="grid grid-cols-[1fr_160px] gap-4">
                <p>
                  <strong>Nome completo:</strong>{" "}
                  {aluno ||
                    "____________________________________________________________"}
                </p>
                <p>
                  <strong>Data de nascimento:</strong>{" "}
                  {nascimento
                    ? formatarData(nascimento)
                    : "____/____/________"}
                </p>
              </div>

              <p className="mt-2">
                <strong>Turma:</strong>{" "}
                {turma ||
                  "____________________________________________________________"}
              </p>
            </Secao>

            <Secao numero="2" titulo="RESPONSÁVEL LEGAL">
              <p>
                <strong>Nome completo:</strong>{" "}
                {responsavel ||
                  "____________________________________________________________"}
              </p>

              <div className="mt-2 grid grid-cols-2 gap-4">
                <p>
                  <strong>CPF:</strong>{" "}
                  {cpfResponsavel || "____________________________"}
                </p>
                <p>
                  <strong>Telefone:</strong>{" "}
                  {telefoneResponsavel || "____________________________"}
                </p>
              </div>

              <p className="mt-2">
                <strong>Endereço:</strong>{" "}
                {endereco ||
                  "____________________________________________________________"}
              </p>
            </Secao>

            <Secao numero="3" titulo="PESSOAS AUTORIZADAS A RETIRAR A CRIANÇA">
              <p>
                Autorizo as pessoas relacionadas abaixo a retirar a criança da
                instituição. No momento da retirada, a pessoa autorizada deverá
                apresentar documento de identificação sempre que solicitado
                pela instituição.
              </p>

              <div className="mt-3 space-y-2">
                {autorizados.map((item, index) => (
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
                        {item.nome ||
                          "____________________________________________"}
                      </p>
                      <p>
                        <strong>Parentesco/relação:</strong>{" "}
                        {item.parentesco || "________________________"}
                      </p>
                      <p>
                        <strong>Telefone:</strong>{" "}
                        {item.telefone || "________________________"}
                      </p>
                      <p className="col-span-2">
                        <strong>RG / Documento:</strong>{" "}
                        {item.documento ||
                          "____________________________________________"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Secao>

            <Secao numero="4" titulo="REGRAS PARA A RETIRADA">
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  A criança somente poderá ser retirada por seu responsável
                  legal ou por pessoa previamente autorizada neste documento,
                  conforme os registros mantidos pela instituição.
                </li>
                <li>
                  A pessoa autorizada deverá ser identificada pela instituição
                  antes da liberação da criança.
                </li>
                <li>
                  A instituição poderá solicitar documento de identificação
                  sempre que necessário para confirmar a identidade da pessoa
                  que realizará a retirada.
                </li>
                <li>
                  Qualquer alteração na lista de pessoas autorizadas deverá ser
                  comunicada pelo responsável legal à instituição.
                </li>
                <li>
                  O responsável legal declara ser responsável pela veracidade
                  das informações fornecidas neste termo.
                </li>
              </ul>
            </Secao>

            <section className="mt-4 break-inside-avoid rounded-xl border-2 border-amber-400 bg-amber-50 p-3">
              <h3 className="text-[10.5pt] font-black uppercase text-amber-900">
                Atenção
              </h3>

              <p className="mt-1 text-[9.5pt]">
                A autorização de retirada não substitui a necessidade de
                identificação da pessoa autorizada. Em caso de dúvida quanto à
                identidade ou à autorização para retirada, a instituição poderá
                entrar em contato com o responsável legal antes de liberar a
                criança.
              </p>
            </section>

            <Secao numero="5" titulo="DECLARAÇÃO DO RESPONSÁVEL">
              <p>
                Declaro que as informações apresentadas neste documento são
                verdadeiras e que as pessoas indicadas acima estão autorizadas
                por mim a realizar a retirada da criança, assumindo a
                responsabilidade pelas autorizações concedidas.
              </p>

              <p className="mt-2">
                Comprometo-me a comunicar imediatamente à instituição qualquer
                alteração, inclusão ou exclusão de pessoa autorizada a retirar
                a criança.
              </p>
            </Secao>

            <section className="mt-5 break-inside-avoid">
              <p>
                <strong>{cidade || "Teófilo Otoni/MG"},</strong> ______ de
                ______________________________ de 20_______.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-8 text-center">
                <div>
                  <div className="mx-auto w-[250px] border-t border-slate-900 pt-2">
                    <p className="font-bold">Assinatura do responsável legal</p>
                    <p className="mt-1 text-[8.5pt]">
                      Nome:{" "}
                      {responsavel || "________________________________"}
                    </p>
                    <p className="text-[8.5pt]">
                      CPF:{" "}
                      {cpfResponsavel || "________________________________"}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mx-auto w-[250px] border-t border-slate-900 pt-2">
                    <p className="font-bold">Conferência da instituição</p>
                    <p className="mt-1 text-[8.5pt]">
                      Nome/assinatura: ________________________________
                    </p>
                    <p className="text-[8.5pt]">
                      Data: ____/____/________
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <footer className="mt-5 border-t border-slate-300 pt-2 text-center text-[8pt] text-slate-500">
              <strong className="text-slate-700">TESOURO INFANTIL</strong>
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

function Campo({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-600">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function Linha({ texto }: { texto: string }) {
  return <span className="font-semibold">{texto}</span>;
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

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}
