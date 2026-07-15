"use client";

interface ModalProps {
  aberto: boolean;
  fechar: () => void;
  titulo: string;
  children: React.ReactNode;
}

export default function Modal({
  aberto,
  fechar,
  titulo,
  children,
}: ModalProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">

        <button
          onClick={fechar}
          className="absolute right-5 top-5 text-2xl hover:text-red-500"
        >
          ✖
        </button>

        <h2 className="text-3xl font-bold text-blue-700 mb-6">
          {titulo}
        </h2>

        {children}

      </div>

    </div>
  );
}