"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseSistema } from "@/lib/supabaseSistema";

type Adocao = {
  id: number;
  crianca_id: number | null;
  crianca_nome: string;
  idade: number | null;
  status_adocao: string;
  nome_adotante: string | null;
  contato_adotante: string | null;
  data_adocao: string | null;
  status_presente: string;
  data_recebimento_presente: string | null;
  data_entrega_presente: string | null;
  observacao: string | null;
  created_at: string;
};

const statusAdocao = [
  "Todas",
  "Disponível",
  "Adotada",
  "Cancelada",
];

const statusPresente = [
  "Todos",
  "Aguardando",
  "Recebido",
  "Entregue",
];

function formatarData(data: string | null) {
  if (!data) return "—";

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function badgeAdocao(status: string) {
  if (status === "Adotada") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Cancelada") {
    return "bg-red-100 text-red-700";
  }

  return "bg-blue-100 text-blue-700";
}

function badgePresente(status: string) {
  if (status === "Entregue") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Recebido") {
    return "bg-purple-100 text-purple-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default function CampanhaAdministracao() {
  const [adocoes, setAdocoes] = useState<Adocao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroAdocao, setFiltroAdocao] = useState("Todas");
  const [filtroPresente, setFiltroPresente] = useState("Todos");

  async function carregarAdocoes() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabaseSistema
      .from("adocoes_campanha")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);

      setErro(
        `Não foi possível carregar as adoções: ${error.message}`
      );

      setAdocoes([]);
      setCarregando(false);
      return;
    }

    setAdocoes((data || []) as Adocao[]);
    setCarregando(false);
  }

  useEffect(() => {
    carregarAdocoes();
  }, []);

  const adocoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return adocoes.filter((item) => {
      const correspondeBusca =
        !termo ||
        item.crianca_nome.toLowerCase().includes(termo) ||
        (item.nome_adotante || "").toLowerCase().includes(termo) ||
        (item.contato_adotante || "")
          .toLowerCase()
          .includes(termo);

      const correspondeAdocao =
        filtroAdocao === "Todas" ||
        item.status_adocao === filtroAdocao;

      const correspondePresente =
        filtroPresente === "Todos" ||
        item.status_presente === filtroPresente;

      return (
        correspondeBusca &&
        correspondeAdocao &&
        correspondePresente
      );
    });
  }, [adocoes, busca, filtroAdocao, filtroPresente]);

  const totalCriancas = adocoes.length;

  const totalAdotadas = adocoes.filter(
    (item) => item.status_adocao === "Adotada"
  ).length;

  const totalDisponiveis = adocoes.filter(
    (item) => item.status_adocao === "Disponível"
  ).length;

  const totalPresentesRecebidos = adocoes.filter(
    (item) =>
      item.status_presente === "Recebido" ||
      item.status_presente === "Entregue"
  ).length;

  const totalPresentesPendentes = adocoes.filter(
    (item) =>
      item.status_adocao === "Adotada" &&
      item.status_presente === "Aguardando"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* CABEÇALHO */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Sistema de Gestão
              </p>

              <h1 className="mt-1 text-3xl font-extrabold text-slate-800">
                Adote uma Criança
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Acompanhe as adoções da Semana das Crianças 2026.
              </p>
            </div>

            <button
              type="button"
              onClick={carregarAdocoes}
              className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              ↻ Atualizar
            </button>

          </div>
        </section>

        {/* ERRO */}
        {erro && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {erro}

            <p className="mt-2 text-xs font-normal text-red-600">
              Se a tabela de adoções ainda não foi criada no Supabase,
              esta mensagem é esperada por enquanto.
            </p>
          </div>
        )}

        {/* CARDS */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              👧
            </div>

            <p className="text-sm font-semibold text-slate-400">
              Crianças cadastradas
            </p>

            <p className="mt-1 text-3xl font-extrabold text-slate-800">
              {totalCriancas}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
              💛
            </div>

            <p className="text-sm font-semibold text-slate-400">
              Crianças adotadas
            </p>

            <p className="mt-1 text-3xl font-extrabold text-emerald-600">
              {totalAdotadas}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              🧒
            </div>

            <p className="text-sm font-semibold text-slate-400">
              Disponíveis
            </p>

            <p className="mt-1 text-3xl font-extrabold text-blue-600">
              {totalDisponiveis}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
              🎁
            </div>

            <p className="text-sm font-semibold text-slate-400">
              Presentes recebidos
            </p>

            <p className="mt-1 text-3xl font-extrabold text-purple-600">
              {totalPresentesRecebidos}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
              ⏳
            </div>

            <p className="text-sm font-semibold text-slate-400">
              Aguardando presente
            </p>

            <p className="mt-1 text-3xl font-extrabold text-amber-600">
              {totalPresentesPendentes}
            </p>
          </div>

        </section>

        {/* FILTROS */}
        <section className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">

          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-slate-800">
              Acompanhamento das adoções
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Pesquise e filtre as crianças da campanha.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="🔎 Pesquisar criança, adotante ou contato..."
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <select
              value={filtroAdocao}
              onChange={(e) => setFiltroAdocao(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
            >
              {statusAdocao.map((status) => (
                <option key={status} value={status}>
                  Adoção: {status}
                </option>
              ))}
            </select>

            <select
              value={filtroPresente}
              onChange={(e) => setFiltroPresente(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
            >
              {statusPresente.map((status) => (
                <option key={status} value={status}>
                  Presente: {status}
                </option>
              ))}
            </select>

          </div>

        </section>

        {/* TABELA */}
        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-extrabold text-slate-800">
              Adoções
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {adocoesFiltradas.length} registro(s) encontrado(s).
            </p>
          </div>

          {carregando ? (
            <div className="p-10 text-center text-sm font-semibold text-slate-400">
              Carregando adoções...
            </div>
          ) : adocoesFiltradas.length === 0 ? (
            <div className="p-12 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                🎁
              </div>

              <h3 className="text-lg font-extrabold text-slate-700">
                Nenhuma adoção encontrada
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                Quando as adoções forem registradas, elas aparecerão aqui
                automaticamente.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-[1100px] w-full text-left">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                      Criança
                    </th>

                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                      Idade
                    </th>

                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                      Adoção
                    </th>

                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                      Adotante
                    </th>

                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                      Contato
                    </th>

                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                      Data
                    </th>

                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                      Presente
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {adocoesFiltradas.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-5 py-4">
                        <p className="font-extrabold text-slate-800">
                          {item.crianca_nome}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        {item.idade !== null
                          ? `${item.idade} anos`
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${badgeAdocao(
                            item.status_adocao
                          )}`}
                        >
                          {item.status_adocao}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-700">
                          {item.nome_adotante || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-600">
                          {item.contato_adotante || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        {formatarData(item.data_adocao)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${badgePresente(
                            item.status_presente
                          )}`}
                        >
                          {item.status_presente}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}