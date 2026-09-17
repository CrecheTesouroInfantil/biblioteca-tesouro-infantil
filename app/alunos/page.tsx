"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseSistema } from "@/lib/supabaseSistema";

export default function AlunosPage() {
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [certidao, setCertidao] = useState("");
  const [sexo, setSexo] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("Teófilo Otoni");
  const [zona, setZona] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function cadastrarAluno(e: React.FormEvent) {
    e.preventDefault();

    setMensagem("");

    if (!nome.trim()) {
      setMensagem("Informe o nome da criança.");
      return;
    }

    if (!dataNascimento) {
      setMensagem("Informe a data de nascimento.");
      return;
    }

    setSalvando(true);

    const { error } = await supabaseSistema
      .from("alunos")
      .insert({
        nome: nome.trim(),
        data_nascimento: dataNascimento,
        cpf: cpf || null,
        certidao_nascimento: certidao || null,
        sexo: sexo || null,
        endereco: endereco || null,
        numero: numero || null,
        bairro: bairro || null,
        cidade: cidade || null,
        zona: zona || null,
        telefone: telefone || null,
        observacoes_gerais: observacoes || null,
        ativo: true,
      });

    setSalvando(false);

    if (error) {
      console.error(error);
      setMensagem(
        `Erro ao cadastrar: ${error.message}`
      );
      return;
    }

    setMensagem("✅ Aluno cadastrado com sucesso!");

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

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-4 md:p-7">

      <div className="max-w-6xl mx-auto">

        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div>
            <Link
              href="/"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
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
              Cadastro e gerenciamento dos alunos da creche
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Ano letivo
            </p>

            <p className="font-extrabold text-slate-700">
              2026
            </p>
          </div>

        </div>


        {/* FORMULÁRIO */}
        <form
          onSubmit={cadastrarAluno}
          className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
        >

          {/* TÍTULO */}
          <div className="px-6 py-6 md:px-8 border-b border-slate-100">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">
                👧
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  Novo aluno
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Preencha os dados da criança
                </p>
              </div>

            </div>

          </div>


          {/* DADOS DA CRIANÇA */}
          <div className="p-6 md:p-8">

            <h3 className="text-lg font-extrabold text-slate-800 mb-5">
              Dados da criança
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* NOME */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nome completo *
                </label>

                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite o nome completo da criança"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>


              {/* DATA */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Data de nascimento *
                </label>

                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>


              {/* SEXO */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Sexo
                </label>

                <select
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="">Selecione</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>


              {/* CPF */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  CPF
                </label>

                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              {/* CERTIDÃO */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Certidão de nascimento
                </label>

                <input
                  type="text"
                  value={certidao}
                  onChange={(e) => setCertidao(e.target.value)}
                  placeholder="Número da certidão"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>


            {/* ENDEREÇO */}
            <h3 className="text-lg font-extrabold text-slate-800 mt-9 mb-5">
              Endereço
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

              <div className="md:col-span-3">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Endereço
                </label>

                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
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
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Nº"
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
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Bairro"
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
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Zona
                </label>

                <select
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="">Selecione</option>
                  <option value="Urbana">Urbana</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>

            </div>


            {/* CONTATO */}
            <h3 className="text-lg font-extrabold text-slate-800 mt-9 mb-5">
              Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Telefone
                </label>

                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
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
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações importantes"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>

          </div>


          {/* RODAPÉ DO FORMULÁRIO */}
          <div className="px-6 py-5 md:px-8 bg-slate-50 border-t border-slate-100">

            {mensagem && (
              <div
                className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${
                  mensagem.startsWith("✅")
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {mensagem}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3">

              <Link
                href="/"
                className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-center hover:bg-slate-100 transition"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={salvando}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {salvando ? "Salvando..." : "💾 Cadastrar aluno"}
              </button>

            </div>

          </div>

        </form>

      </div>

    </main>
  );
}