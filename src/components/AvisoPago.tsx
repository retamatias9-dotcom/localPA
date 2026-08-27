import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MENSAJE =
  'Recuerde efectuar el pago para poder seguir disfrutando de este sistema, Comunicarse con Matias para Coordinar el pago';

/** Cuánto tiempo permanece visible el cartel (1 minuto). */
const DURACION_MS = 60_000;

type Listener = () => void;
const listeners = new Set<Listener>();

/** Vuelve a mostrar el cartel (o reinicia el minuto) cuando se carga algo nuevo. */
export function mostrarAvisoPago() {
  listeners.forEach((fn) => fn());
}

export default function AvisoPago() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [restante, setRestante] = useState(DURACION_MS / 1000);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrar = useCallback(() => {
    setVisible(true);
    setRestante(DURACION_MS / 1000);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(false), DURACION_MS);
  }, []);

  // Se muestra al entrar/refrescar y en cada cambio de pantalla
  useEffect(() => {
    mostrar();
  }, [location.pathname, mostrar]);

  // Se muestra cuando algún hook avisa que cargó datos nuevos
  useEffect(() => {
    listeners.add(mostrar);
    return () => {
      listeners.delete(mostrar);
    };
  }, [mostrar]);

  // Cuenta regresiva del minuto
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setRestante((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [visible]);

  // Bloquea el scroll del fondo mientras el cartel está en pantalla
  useEffect(() => {
    if (!visible) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  }, [visible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl animate-aviso-pago rounded-3xl border-4 border-amber-400 bg-amber-50 p-6 text-center shadow-2xl sm:p-10 dark:bg-stone-900">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-stone-900 sm:h-20 sm:w-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-9 w-9 sm:h-11 sm:w-11"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </span>

        <h2 className="mb-4 font-heading text-2xl font-extrabold tracking-tight text-amber-600 uppercase sm:text-3xl dark:text-amber-400">
          Aviso de pago
        </h2>

        <p className="font-heading text-xl leading-snug font-bold text-stone-900 sm:text-3xl dark:text-stone-50">
          {MENSAJE}
        </p>

        <button
          onClick={() => setVisible(false)}
          className="mt-8 w-full rounded-2xl bg-amber-400 px-6 py-4 font-heading text-lg font-bold text-stone-900 shadow-lg transition hover:bg-amber-300 sm:w-auto sm:px-10"
        >
          Entendido
        </button>

        <p className="mt-4 text-sm font-medium text-stone-500 dark:text-stone-400">
          Este aviso se cierra solo en {restante}s
        </p>
      </div>
    </div>
  );
}
