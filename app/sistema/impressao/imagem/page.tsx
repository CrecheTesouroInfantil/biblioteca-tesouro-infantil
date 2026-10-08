 "use client";

import { useState } from "react";

export default function ImpressaoImagemPage() {
  const [aluno, setAluno] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [turma, setTurma] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [opcao, setOpcao] = useState<"autorizo" | "nao-autorizo" | "">("");

  function imprimir() {
    window.print();
  }

  return (
    <>
      <main className="min-h-screen bg-[#eef5ff] px-4 py-6 print:bg-white print:p-0">
        <div className="mx-auto max-w-6xl print:max-w-none">

          {/* PAINEL DE CONTROLE - NÃO SAI NA IMPRESSÃO */}
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
                  Preencha os dados da criança e do responsável antes de imprimir.
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
              <Campo label="Data de nascimento" value={nascimento} onChange={setNascimento} type="date" />
              <Campo label="Turma" value={turma} onChange={setTurma} />
              <Campo label="Nome do responsável" value={responsavel} onChange={setResponsavel} />
              <Campo label="CPF" value={cpf} onChange={setCpf} />
              <Campo label="Telefone" value={telefone} onChange={setTelefone} />
              <Campo label="E-mail" value={email} onChange={setEmail} />
            </div>
          </section>

          {/* FOLHA A4 */}
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

            <section className="mt-4">
              <p>
                Pelo presente instrumento, eu,{" "}
                <Linha texto={responsavel || "____________________________________________________________"} />,{" "}
                responsável legal pela criança{" "}
                <Linha texto={aluno || "____________________________________________________________"} />,
                matriculada no <strong>Tesouro Infantil</strong>, turma{" "}
                <Linha texto={turma || "____________________________"} />, declaro estar ciente e de acordo
                com as condições estabelecidas neste termo.
              </p>
            </section>

            <Secao numero="1" titulo="DA AUTORIZAÇÃO">
              <p>
                Autorizo o <strong>Tesouro Infantil</strong> a fotografar, filmar e registrar a
                participação da criança em atividades pedagógicas, projetos, apresentações,
                eventos, passeios, comemorações e demais atividades realizadas ou promovidas
                pela instituição.
              </p>
              <p className="mt-2">
                A autorização compreende fotografias, vídeos e registros audiovisuais nos quais
                a criança apareça ou tenha sua voz registrada.
              </p>
            </Secao>

            <Secao numero="2" titulo="DAS FINALIDADES">
              <p>
                Os registros poderão ser utilizados exclusivamente para fins educacionais,
                pedagógicos, institucionais e de divulgação das atividades realizadas pelo
                Tesouro Infantil, incluindo:
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
                A autorização é concedida de forma <strong>gratuita</strong>, não gerando qualquer
                pagamento, indenização ou remuneração pela utilização da imagem ou da voz da criança.
              </p>
              <p className="mt-2">
                A imagem e a voz não deverão ser utilizadas para finalidade comercial, publicitária
                ou diversa daquela prevista neste termo.
              </p>
            </Secao>

            <Secao numero="4" titulo="DO RESPEITO À CRIANÇA">
              <p>
                O Tesouro Infantil compromete-se a utilizar os registros de maneira respeitosa,
                preservando a dignidade, a integridade, a privacidade e os direitos da criança,
                não realizando utilização que possa causar constrangimento, exposição indevida
                ou qualquer forma de discriminação.
              </p>
            </Secao>

            <Secao numero="5" titulo="DO TRATAMENTO DOS DADOS E DA PRIVACIDADE">
              <p>
                O responsável declara estar ciente de que os registros de imagem e voz estão
                relacionados à criança e serão tratados para as finalidades descritas neste termo,
                observados os princípios de proteção de dados pessoais e os direitos da criança
                e de seu responsável legal.
              </p>
            </Secao>

            {/* CAIXA DE DECISÃO */}
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
                  className={`text-left rounded-lg border-2 p-3 print:cursor-default ${
                    opcao === "autorizo"
                      ? "border-green-600 bg-green-50"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  <p className="font-black text-green-700">
                    {opcao === "autorizo" ? "☒" : "☐"} AUTORIZO
                  </p>
                  <p className="mt-1 text-[9.5pt]">
                    Autorizo o Tesouro Infantil a captar e utilizar a imagem e a voz da criança
                    identificada neste documento, exclusivamente para as finalidades descritas
                    neste Termo de Autorização.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setOpcao("nao-autorizo")}
                  className={`text-left rounded-lg border-2 p-3 print:cursor-default ${
                    opcao === "nao-autorizo"
                      ? "border-red-600 bg-red-50"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  <p className="font-black text-red-700">
                    {opcao === "nao-autorizo" ? "☒" : "☐"} NÃO AUTORIZO
                  </p>
                  <p className="mt-1 text-[9.5pt]">
                    Não autorizo o Tesouro Infantil a utilizar a imagem e a voz da criança
                    identificada neste documento para as finalidades descritas neste termo.
                  </p>
                </button>
              </div>

              <p className="mt-2 text-center text-[8.5pt] text-slate-600">
                Em caso de dúvida, procure a secretaria da instituição antes de assinar este documento.
              </p>
            </section>

            <Secao numero="7" titulo="DA REVOGAÇÃO DA AUTORIZAÇÃO">
              <p>
                O responsável legal poderá solicitar a revogação da autorização a qualquer momento,
                mediante comunicação à instituição.
              </p>
              <p className="mt-2">
                A revogação produzirá efeitos para novas utilizações dos registros, não sendo
                possível garantir a retirada de materiais que já tenham sido publicados, distribuídos
                ou reproduzidos antes do recebimento da solicitação, especialmente quando compartilhados
                por terceiros.
              </p>
            </Secao>

            <Secao numero="8" titulo="DA CIÊNCIA E CONCORDÂNCIA">
              <p>
                Declaro que li e compreendi este termo e que fui informado(a) sobre as finalidades
                da utilização da imagem e da voz da criança.
              </p>
              <p className="mt-2">
                Declaro ainda que sou responsável legal pela criança identificada neste documento
                e que a opção acima assinalada representa minha decisão quanto à utilização de sua
                imagem e voz.
              </p>
            </Secao>

            <section className="mt-4 break-inside-avoid">
              <h3 className="mb-2 border-b border-slate-300 pb-1 text-[10.5pt] font-black uppercase">
                Dados da criança
              </h3>

              <div className="grid grid-cols-[1fr_150px] gap-4">
                <p>
                  <strong>Nome completo:</strong>{" "}
                  {aluno || "____________________________________________________________"}
                </p>
                <p>
                  <strong>Data de nascimento:</strong>{" "}
                  {nascimento ? formatarData(nascimento) : "____/____/________"}
                </p>
              </div>

              <p className="mt-2">
                <strong>Turma:</strong> {turma || "____________________________________________________________"}
              </p>
            </section>

            <section className="mt-4 break-inside-avoid">
              <h3 className="mb-2 border-b border-slate-300 pb-1 text-[10.5pt] font-black uppercase">
                Dados do responsável legal
              </h3>

              <p>
                <strong>Nome completo:</strong>{" "}
                {responsavel || "____________________________________________________________"}
              </p>

              <div className="mt-2 grid grid-cols-2 gap-4">
                <p><strong>CPF:</strong> {cpf || "____________________________"}</p>
                <p><strong>Telefone:</strong> {telefone || "____________________________"}</p>
              </div>

              <p className="mt-2">
                <strong>E-mail:</strong> {email || "____________________________________________________________"}
              </p>
            </section>

            <section className="mt-5 break-inside-avoid">
              <p>
                <strong>Teófilo Otoni/MG,</strong> ______ de ______________________________ de 20______.
              </p>

              <div className="mt-9 text-center">
                <div className="mx-auto w-[310px] border-t border-slate-900 pt-2">
                  <p className="font-bold">Assinatura do responsável legal</p>
                  <p className="mt-1 text-[9pt]">
                    Nome: {responsavel || "________________________________________"}
                  </p>
                  <p className="text-[9pt]">
                    CPF: {cpf || "________________________________________"}
                  </p>
                </div>
              </div>
            </section>

            <footer className="mt-5 border-t border-slate-300 pt-2 text-center text-[8pt] text-slate-500">
              <strong className="text-slate-700">TESOURO INFANTIL</strong>
              <br />
              Documento destinado ao registro da manifestação do responsável legal quanto à
              autorização para utilização de imagem e voz da criança.
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

          button {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
      <span className="mb-1 block text-xs font-bold text-slate-600">{label}</span>
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
