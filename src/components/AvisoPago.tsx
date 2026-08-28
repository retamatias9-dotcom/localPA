import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MENSAJE =
  'Recuerde efectuar el pago para poder seguir disfrutando de este sistema, Comunicarse con Matias para Coordinar el pago';

/** Cuánto dura el cartel al entrar o al cargar datos nuevos. */
const DURACION_CARGA_MS = 60_000;
/** Cuánto dura el cartel que tapa los precios cada tanda de búsquedas. */
const DURACION_BUSQUEDA_MS = 5_000;
/** Cada cuántas búsquedas se tapa el catálogo. */
const BUSQUEDAS_POR_AVISO = 4;

type Opciones = { duracionMs: number; bloqueante: boolean };
type Listener = (opciones: Opciones) => void;

const listeners = new Set<Listener>();
let busquedas = 0;

/** Vuelve a mostrar el cartel (o reinicia el temporizador) cuando se carga algo nuevo. */
export function mostrarAvisoPago(
  duracionMs = DURACION_CARGA_MS,
  bloqueante = false
) {
  listeners.forEach((fn) => fn({ duracionMs, bloqueante }));
}

/**
 * Registra una búsqueda del catálogo. Cada BUSQUEDAS_POR_AVISO tapa los precios
 * con el cartel durante unos segundos, sin dejar cerrarlo.
 */
export function contarBusqueda() {
  busquedas += 1;
  if (busquedas % BUSQUEDAS_POR_AVISO === 0) {
    mostrarAvisoPago(DURACION_BUSQUEDA_MS, true);
  }
}

export default function AvisoPago() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [bloqueante, setBloqueante] = useState(false);
  const [restante, setRestante] = useState(DURACION_CARGA_MS / 1000);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrar = useCallback((opciones: Opciones) => {
    setVisible(true);
    setBloqueante(opciones.bloqueante);
    setRestante(Math.ceil(opciones.duracionMs / 1000));
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(false), opciones.duracionMs);
  }, []);

  // Se muestra al entrar/refrescar y en cada cambio de pantalla
  useEffect(() => {
    mostrar({ duracionMs: DURACION_CARGA_MS, bloqueante: false });
  }, [location.pathname, mostrar]);

  // Se muestra cuando algún hook avisa que cargó datos nuevos o que hubo búsquedas
  useEffect(() => {
    listeners.add(mostrar);
    return () => {
      listeners.delete(mostrar);
    };
  }, [mostrar]);

  // Cuenta regresiva
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-md"
    >
      <div
        className={`animate-aviso-pago w-full rounded-3xl border-4 border-amber-400 bg-amber-50 text-center shadow-2xl dark:bg-stone-900 ${
          bloqueante ? 'max-w-sm p-5' : 'max-w-2xl p-6 sm:p-10'
        }`}
      >
        <span
          className={`mx-auto flex items-center justify-center rounded-2xl bg-amber-400 text-stone-900 ${
            bloqueante ? 'mb-3 h-11 w-11' : 'mb-5 h-16 w-16 sm:h-20 sm:w-20'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={bloqueante ? 'h-6 w-6' : 'h-9 w-9 sm:h-11 sm:w-11'}
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </span>

        <h2
          className={`font-heading font-extrabold tracking-tight text-amber-600 uppercase dark:text-amber-400 ${
            bloqueante ? 'mb-2 text-base' : 'mb-4 text-2xl sm:text-3xl'
          }`}
        >
          Aviso de pago
        </h2>

        <p
          className={`font-heading leading-snug font-bold text-stone-900 dark:text-stone-50 ${
            bloqueante ? 'text-sm' : 'text-xl sm:text-3xl'
          }`}
        >
          {MENSAJE}
        </p>

        {bloqueante ? (
          <p className="mt-4 font-heading text-sm font-bold text-stone-700 dark:text-stone-300">
            Los precios vuelven en {restante}s
          </p>
        ) : (
          <>
            <button
              onClick={() => setVisible(false)}
              className="mt-8 w-full rounded-2xl bg-amber-400 px-6 py-4 font-heading text-lg font-bold text-stone-900 shadow-lg transition hover:bg-amber-300 sm:w-auto sm:px-10"
            >
              Entendido
            </button>
            <p className="mt-4 text-sm font-medium text-stone-500 dark:text-stone-400">
              Este aviso se cierra solo en {restante}s
            </p>
          </>
        )}
      </div>
    </div>
  );
}
