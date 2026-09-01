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

  tema?: string;
  setTema?: (valor: string) => void;

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
  "FORMAS",
  "CORES",
  "NÚMEROS E QUANTIDADES",
  "ALFABETO E LETRAS",
  "ANIMAIS",
  "NATUREZA",
  "MEIO AMBIENTE",
  "CORPO HUMANO",
  "EMOÇÕES",
  "FAMÍLIA",
  "AMIZADE",
  "IDENTIDADE",
  "INCLUSÃO E DIFERENÇAS",
  "ALIMENTAÇÃO",
  "HIGIENE",
  "TRÂNSITO",
  "PROFISSÕES",
  "MORADIA",
  "BRINCADEIRAS",
  "IMAGINAÇÃO",
  "MÚSICA E RIMAS",
  "HISTÓRIAS BÍBLICAS",
  "DATAS COMEMORATIVAS",
  "VALORES E CONVIVÊNCIA",
  "OUTROS",
];

const faixas = [
  "BERÇÁRIO",
  "MATERNAL I",
  "MATERNAL II",
  "PRÉ-ESCOLA",
];

const locais = [
  "CAIXA 1",
  "CAIXA 2",
  "CAIXA 3",
];

export default function FormLivro(props: FormLivroProps) {
  const faixasSelecionadas =
    props.faixaEtaria === "TODAS"
      ? []
      : props.faixaEtaria
      ? props.faixaEtaria
          .split(",")
          .map((faixa) => faixa.trim())
          .filter(Boolean)
      : [];

  function alternarFaixa(faixa: string) {
    let novasFaixas = [...faixasSelecionadas];

    if (novasFaixas.includes(faixa)) {
      novasFaixas = novasFaixas.filter(
        (item) => item !== faixa
      );
    } else {
      novasFaixas.push(faixa);
    }

    novasFaixas.sort(
      (a, b) =>
        faixas.indexOf(a) - faixas.indexOf(b)
    );

    props.setFaixaEtaria(
      novasFaixas.join(", ")
    );
  }

  function selecionarTodas() {
    props.setFaixaEtaria("TODAS");
  }

  function limparFaixas() {
    props.setFaixaEtaria("");
  }

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

      {/* TEMA PEDAGÓGICO / FAIXA */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* CATEGORIA */}

        <div>
          <label className="block text-gray-700 mb-2 font-bold">
            🏷️ Tema pedagógico *
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
              Selecione um tema
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

        {/* FAIXA ETÁRIA */}

        <div>
          <label className="block text-gray-700 mb-2 font-bold">
            👶 Faixa etária *
          </label>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

              {faixas.map((faixa) => {
                const selecionada =
                  faixasSelecionadas.includes(
                    faixa
                  );

                return (
                  <label
                    key={faixa}
                    className={`
                      flex
                      items-center
                      gap-3
                      p-3
                      rounded-xl
                      border
                      cursor-pointer
                      transition
                      ${
                        selecionada
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }
                    `}
                  >

                    <input
                      type="checkbox"
                      checked={selecionada}
                      onChange={() =>
                        alternarFaixa(faixa)
                      }
                      className="w-5 h-5 accent-blue-600"
                    />

                    <span
                      className={`
                        text-sm
                        font-bold
                        ${
                          selecionada
                            ? "text-blue-700"
                            : "text-gray-700"
                        }
                      `}
                    >
                      {faixa}
                    </span>

                  </label>
                );
              })}

            </div>

            <button
              type="button"
              onClick={selecionarTodas}
              className={`
                w-full
                mt-3
                py-2.5
                rounded-xl
                border
                font-bold
                text-sm
                transition
                ${
                  props.faixaEtaria === "TODAS"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                }
              `}
            >
              👶 TODAS AS FAIXAS
            </button>

            {props.faixaEtaria && (
              <button
                type="button"
                onClick={limparFaixas}
                className="w-full mt-2 text-xs font-bold text-gray-500 hover:text-red-600"
              >
                Limpar seleção
              </button>
            )}

            <div className="mt-3 bg-white border border-gray-200 rounded-xl p-3">

              <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
                Faixas selecionadas
              </p>

              <p className="text-sm font-bold text-gray-700 mt-1">
                {props.faixaEtaria ||
                  "Nenhuma selecionada"}
              </p>

            </div>

          </div>
        </div>

      </div>

      {/* TEMA / RESUMO DO LIVRO */}

      {props.setTema && (
        <div>

          <label className="block text-gray-700 mb-2 font-bold">
            💭 Tema / resumo do livro
          </label>

          <textarea
            rows={4}
            value={props.tema || ""}
            onChange={(e) =>
              props.setTema?.(e.target.value)
            }
            placeholder="Escreva um pequeno resumo do que o livro trabalha..."
            className="
              w-full
              border border-gray-300
              rounded-xl
              p-3
              outline-none
              resize-y
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
            "
          />

          <p className="text-xs text-gray-500 mt-1">
            Exemplo: trabalha amizade, respeito,
            sentimentos e convivência.
          </p>

        </div>
      )}

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
              const valor = Number(
                e.target.value
              );

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
                alt={`Capa de ${
                  props.nome || "livro"
                }`}
                className="w-40 h-56 object-contain rounded-2xl shadow-lg border bg-gray-50"
              />

            </div>

            <div className="flex justify-center mt-4">

              <button
                type="button"
                onClick={() =>
                  props.setCapa("")
                }
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

      {/* RESUMO DO CADASTRO */}

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
            🏷️ Tema pedagógico:{" "}
            <strong>
              {props.categoria ||
                "Não selecionado"}
            </strong>
          </p>

          <p>
            👶 Faixa:{" "}
            <strong>
              {props.faixaEtaria ||
                "Não selecionada"}
            </strong>
          </p>

          <p>
            📦 Local:{" "}
            <strong>
              {props.local ||
                "Não informado"}
            </strong>
          </p>

          <p>
            🔢 Exemplares:{" "}
            <strong>
              {props.quantidade || 0}
            </strong>
          </p>

        </div>

        {props.tema && (
          <div className="mt-3 pt-3 border-t border-blue-100">

            <p className="text-sm text-gray-700">
              💭 <strong>Tema / resumo:</strong>{" "}
              {props.tema}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}