"use client";

interface FormLivroProps {
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

import UploadCapa from "./UploadCapa";

export default function FormLivro(props: FormLivroProps) {
  return (
    <>
      <input
        className="w-full border rounded-lg p-3 mb-4"
        placeholder="Nome do livro"
        value={props.nome}
        onChange={(e) => props.setNome(e.target.value)}
      />

      <input
        className="w-full border rounded-lg p-3 mb-4"
        placeholder="Autor"
        value={props.autor}
        onChange={(e) => props.setAutor(e.target.value)}
      />

      <select
        className="w-full border rounded-lg p-3 mb-4"
        value={props.categoria}
        onChange={(e) => props.setCategoria(e.target.value)}
      >
        <option value="">Categoria</option>

        {categorias.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <select
        className="w-full border rounded-lg p-3 mb-4"
        value={props.faixaEtaria}
        onChange={(e) => props.setFaixaEtaria(e.target.value)}
      >
        <option value="">Faixa etária</option>

        {faixas.map((faixa) => (
          <option key={faixa} value={faixa}>
            {faixa}
          </option>
        ))}
      </select>

      <select
        className="w-full border rounded-lg p-3 mb-4"
        value={props.local}
        onChange={(e) => props.setLocal(e.target.value)}
      >
        <option value="">Caixa</option>

        {locais.map((caixa) => (
          <option key={caixa} value={caixa}>
            {caixa}
          </option>
        ))}
      </select>

      <input
        type="number"
        className="w-full border rounded-lg p-3 mb-4"
        value={props.quantidade}
        onChange={(e) =>
          props.setQuantidade(Number(e.target.value))
        }
      />

      <UploadCapa onUpload={props.setCapa} />

      {props.capa && (
        <img
          src={props.capa}
          alt="Prévia"
          className="w-40 mx-auto rounded-xl my-4 shadow"
        />
      )}

      <input
        className="w-full border rounded-lg p-3"
        placeholder="Ou cole uma URL (opcional)"
        value={props.capa}
        onChange={(e) => props.setCapa(e.target.value)}
      />
    </>
  );
}