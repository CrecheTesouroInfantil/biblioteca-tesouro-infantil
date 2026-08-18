export interface Reserva {
  id: number;
  livro_id: number;
  sala: string;
  data_reserva: string;
  atendida: boolean;
  created_at?: string;
}