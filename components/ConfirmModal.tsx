"use client";

interface ConfirmModalProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  confirmar: () => void;
  cancelar: () => void;
}

export default function ConfirmModal({
  aberto,
  titulo,
  mensagem,
  confirmar,
  cancelar,
}: ConfirmModalProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">

        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {titulo}
        </h2>

        <p className="text-gray-700 mb-8">
          {mensagem}
        </p>

        <div className="flex justify-end gap-4">

          <button
            onClick={cancelar}
            className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 font-semibold"
          >
            Cancelar
          </button>

          <button
            onClick={confirmar}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            Confirmar
          </button>

        </div>

      </div>

    </div>
  );
}