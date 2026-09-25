import { useEffect, useState } from 'react';

/** Momento en que vence el pago (hora local): 29 de septiembre de 2026, 00:00. */
const VENCIMIENTO = new Date(2026, 8, 29, 0, 0, 0);

function dosDigitos(n: number) {
  return String(n).padStart(2, '0');
}

export default function AvisoHosting() {
  const [ahora, setAhora] = useState(() => Date.now());
  // Se oculta solo en memoria: al recargar la página el cartel vuelve a aparecer.
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    if (oculto) return;
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [oculto]);

  if (oculto) return null;

  const restanteMs = Math.max(0, VENCIMIENTO.getTime() - ahora);
  const vencido = restanteMs === 0;

  const totalSeg = Math.floor(restanteMs / 1000);
  const dias = Math.floor(totalSeg / 86_400);
  const horas = Math.floor((totalSeg % 86_400) / 3_600);
  const minutos = Math.floor((totalSeg % 3_600) / 60);

  return (
    <div
      role="status"
      className="relative flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b-2 border-amber-500 bg-amber-400 py-2 pl-4 pr-12 text-center font-heading text-sm font-bold text-stone-900 shadow-md"
    >
      {vencido ? (
        <span>El pago por este servicio venció el 29 de Septiembre.</span>
      ) : (
        <>
          <span>El pago por este servicio vence el 29 de Septiembre.</span>
          <span className="rounded-lg bg-stone-900 px-3 py-1 font-mono text-amber-300 tabular-nums">
            {dias}d {dosDigitos(horas)}h {dosDigitos(minutos)}m
          </span>
        </>
      )}
      <button
        onClick={() => setOculto(true)}
        aria-label="Ocultar aviso"
        title="Ocultar aviso"
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-900 transition hover:bg-amber-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="h-4 w-4"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
