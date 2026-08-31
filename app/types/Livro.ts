export interface Livro {
  id: number;

  codigo?: string;

  nome: string;

  autor: string;

  categoria: string | null;

  tema: string | null;

  faixa_etaria: string | null;

  quantidade: number | null;

  local: string | null;

  capa: string | null;
}