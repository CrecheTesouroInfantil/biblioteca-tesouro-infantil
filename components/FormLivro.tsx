"use client";

import UploadCapa from "./UploadCapa";

interface FormLivroProps {
  codigo?: string;

  nome: string;
  setNome: (valor: string) => void;

  autor: string;
  setAutor: (valor: string) => void;

  categoria: string;
  setCategoria: (valor: string) => void;

  faixaEtaria: string;
  setFaixaEtaria: (valor: string) => void;

  quantidade: number;
  setQuantidade: (valor: number) => void;

  local: string;
  setLocal: (valor: string) => void;

  capa: string;
  setCapa: (valor: string) => void;
}

const categorias = [
  "Literatura Infantil",
  "Histórias Bíblicas",
  "Animais",
  "Natureza",
  "Emoções",
  "Família",
  "Inclusão",
  "Alfabetização",
  "Datas Comemorativas",
];

const faixas = [
  "Berçário",
  "Maternal I",
  "Maternal II",
  "Pré-escola",
];

const locais = [
  "Caixa 1",
  "Caixa 2",
  "Caixa 3",
];

export default function FormLivro(props: FormLivroProps) {
  return (
    <div className="space-y-6">

      {/* CÓDIGO */}

      <div>
        <label className="block text-gray-700 mb-2 font-bold">
          🆔 Código do Livro
        </label>

        <input
          value={
            props.codigo ||
            "Será gerado automaticamente"
          }
          readOnly
          className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-gray-500 font-bold cursor-not-allowed"
        />

        <p className="text-xs text-gray-500 mt-1">
          O código é criado automaticamente pelo sistema.
        </p>
      </div>

      {/* NOME E AUTOR */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="block text-gray-700 mb-2 font-bold">
            📚 Nome do livro *
          </label>

          <input
            type="text"
            required
            value={props.nome}
            onChange={(e) =>
              props.setNome(e.target.value)
            }
            placeholder="Digite o nome do livro"
            className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-bold">
            ✍️ Autor *
          </label>

          <input
            type="text"
            required
            value={props.autor}
            onChange={(e) =>
              props.setAutor(e.target.value)
            }
            placeholder="Digite o nome do autor"
            className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

      </div>

      {/* CATEGORIA / FAIXA */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="block text-gray-700 mb-2 font-bold">
            🏷️ Categoria *
          </label>

          <select
            required
            value={props.categoria}
            onChange={(e) =>
              props.setCategoria(e.target.value)
            }
            className="w-full border border-gray-300 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              Selecione uma categoria
            </option>

            {categorias.map((categoria) => (
              <option
                key={categoria}
                value={categoria}
              >
                {categoria}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-bold">
            👶 Faixa etária *
          </label>

          <select
            required
            value={props.faixaEtaria}
            onChange={(e) =>
              props.setFaixaEtaria(e.target.value)
            }
            className="w-full border border-gray-300 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              Selecione a faixa etária
            </option>

            {faixas.map((faixa) => (
              <option
                key={faixa}
                value={faixa}
              >
                {faixa}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* LOCAL / QUANTIDADE */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="block text-gray-700 mb-2 font-bold">
            📦 Localização
          </label>

          <select
            value={props.local}
            onChange={(e) =>
              props.setLocal(e.target.value)
            }
            className="w-full border border-gray-300 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              Selecione a caixa
            </option>

            {locais.map((local) => (
              <option
                key={local}
                value={local}
              >
                {local}
              </option>
            ))}
          </select>

          <p className="text-xs text-gray-500 mt-1">
            Informe onde o livro está guardado.
          </p>
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-bold">
            🔢 Quantidade de exemplares *
          </label>

          <input
            type="number"
            required
            min={1}
            step={1}
            value={props.quantidade}
            onChange={(e) => {
              const valor = Number(e.target.value);

              props.setQuantidade(
                Number.isNaN(valor)
                  ? 1
                  : Math.max(1, valor)
              );
            }}
            className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <p className="text-xs text-gray-500 mt-1">
            Quantidade de exemplares disponíveis no acervo.
          </p>
        </div>

      </div>

      {/* CAPA */}

      <div className="border-t pt-6">

        <div className="mb-4">

          <h2 className="text-xl font-bold text-blue-700">
            🖼️ Capa do livro
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Envie uma imagem da capa ou cole uma URL.
          </p>

        </div>

        <UploadCapa
          onUpload={props.setCapa}
        />

        {props.capa ? (

          <div className="mt-5">

            <div className="flex items-center justify-center">

              <img
                src={props.capa}
                alt={`Capa de ${props.nome || "livro"}`}
                className="w-40 h-56 object-cover rounded-2xl shadow-lg border"
              />

            </div>

            <div className="flex justify-center mt-4">

              <button
                type="button"
                onClick={() => props.setCapa("")}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-5 py-2 rounded-xl font-bold"
              >
                🗑️ Remover capa
              </button>

            </div>

          </div>

        ) : (

          <div className="mt-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 text-center">

            <div className="text-4xl mb-2">
              🖼️
            </div>

            <p className="text-gray-500 font-semibold">
              Nenhuma capa adicionada
            </p>

            <p className="text-xs text-gray-400 mt-1">
              A capa é opcional.
            </p>

          </div>

        )}

        <div className="mt-5">

          <label className="block text-gray-700 mb-2 font-semibold">
            🔗 URL da capa
          </label>

          <input
            type="url"
            value={props.capa}
            onChange={(e) =>
              props.setCapa(e.target.value)
            }
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

        </div>

      </div>

      {/* RESUMO */}

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">

        <h3 className="font-bold text-blue-700 mb-2">
          📋 Resumo do cadastro
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">

          <p>
            📚 Livro:{" "}
            <strong>
              {props.nome || "Não informado"}
            </strong>
          </p>

          <p>
            ✍️ Autor:{" "}
            <strong>
              {props.autor || "Não informado"}
            </strong>
          </p>

          <p>
            🏷️ Categoria:{" "}
            <strong>
              {props.categoria || "Não selecionada"}
            </strong>
          </p>

          <p>
            👶 Faixa:{" "}
            <strong>
              {props.faixaEtaria || "Não selecionada"}
            </strong>
          </p>

          <p>
            📦 Local:{" "}
            <strong>
              {props.local || "Não informado"}
            </strong>
          </p>

          <p>
            🔢 Exemplares:{" "}
            <strong>
              {props.quantidade || 0}
            </strong>
          </p>

        </div>

      </div>

    </div>
  );
}