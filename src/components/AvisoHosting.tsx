import { useEffect, useState } from 'react';

/** Momento en que vence el hosting (hora local): 29 de septiembre de 2026, 00:00. */
const VENCIMIENTO = new Date(2026, 8, 29, 0, 0, 0);

function dosDigitos(n: number) {
  return String(n).padStart(2, '0');
}

export default function AvisoHosting() {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const restanteMs = Math.max(0, VENCIMIENTO.getTime() - ahora);
  const vencido = restanteMs === 0;

  const totalSeg = Math.floor(restanteMs / 1000);
  const dias = Math.floor(totalSeg / 86_400);
  const horas = Math.floor((totalSeg % 86_400) / 3_600);
  const minutos = Math.floor((totalSeg % 3_600) / 60);
  const segundos = totalSeg % 60;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b-2 border-amber-500 bg-amber-400 px-4 py-2 text-center font-heading text-sm font-bold text-stone-900 shadow-md"
    >
      {vencido ? (
        <span>El hosting del programa venció el 29 de septiembre.</span>
      ) : (
        <>
          <span>El hosting del programa vence el 29 de septiembre.</span>
          <span className="rounded-lg bg-stone-900 px-3 py-1 font-mono text-amber-300 tabular-nums">
            {dias}d {dosDigitos(horas)}h {dosDigitos(minutos)}m {dosDigitos(segundos)}s
          </span>
        </>
      )}
    </div>
  );
}
