import { useState, type FormEvent } from 'react';
import type { ConfigNegocio, FacturaData, Venta } from '../types';
import { formatCantidad, formatPrecio } from '../lib/format';
import {
  abrirVentanaComprobante,
  datosParaAfip,
  escribirComprobante,
  URL_COMPROBANTES_EN_LINEA,
} from '../lib/comprobante';

type Resultado = { error: string | null; venta?: Venta };

interface FacturaModalProps {
  venta: Venta;
  /** Próximo número libre de la serie interna, ya calculado. */
  numeroSugerido: string;
  /** Números internos ya usados, para no repetir comprobantes. */
  numerosUsados: string[];
  /** Emisor del comprobante, configurado en Panel → Facturación. */
  negocio: ConfigNegocio;
  onClose: () => void;
  /** Comprobante interno, sin validez fiscal. */
  onConfirmInterno: (datos: FacturaData) => Promise<Resultado>;
}

const inputClass =
  'w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500';
const labelClass = 'mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300';

export default function FacturaModal({
  venta,
  numeroSugerido,
  numerosUsados,
  negocio,
  onClose,
  onConfirmInterno,
}: FacturaModalProps) {
  // La factura fiscal se emite en Comprobantes en Línea de AFIP, así que se
  // arranca en ese modo: el interno es solo un remito sin validez fiscal.
  const [modo, setModo] = useState<'afip' | 'interno'>('afip');
  const [copiado, setCopiado] = useState<string | null>(null);
  const [cliente, setCliente] = useState('');
  const [docNro, setDocNro] = useState('');
  const [numero, setNumero] = useState(numeroSugerido);
  const [imprimir, setImprimir] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function copiar(label: string, valor: string) {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(label);
      setTimeout(() => setCopiado(null), 1500);
    } catch {
      setError('El navegador no dejó copiar. Seleccioná el texto y copialo a mano.');
    }
  }

  function validar(): string | null {
    if (modo === 'afip') {
      if (!numero.trim()) return 'Pegá el número que te dio AFIP.';
      if (numerosUsados.includes(numero.trim())) {
        return `El comprobante N° ${numero.trim()} ya está registrado en otra venta.`;
      }
      return null;
    }
    if (!numero.trim()) return 'Ingresá un número de comprobante.';
    if (numerosUsados.includes(numero.trim())) {
      return `El comprobante N° ${numero.trim()} ya fue emitido para otra venta.`;
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const invalido = validar();
    if (invalido) {
      setError(invalido);
      return;
    }
    setError(null);

    // Facturando en AFIP no se imprime nada acá: el comprobante fiscal lo emite
    // y lo imprime AFIP.
    const debeImprimir = imprimir && modo !== 'afip';

    // La ventana se abre acá, todavía dentro del click: si se abriera después
    // de esperar la respuesta del servidor, el navegador la bloquearía.
    const ventana = debeImprimir ? abrirVentanaComprobante() : null;
    if (debeImprimir && !ventana) {
      setError('El navegador bloqueó la ventana de impresión. Permití los popups para este sitio.');
      return;
    }

    setSubmitting(true);
    const result = await onConfirmInterno({
      factura_numero: numero.trim(),
      factura_cliente: cliente.trim(),
      factura_doc: docNro.trim() || null,
      externa: modo === 'afip',
    });
    setSubmitting(false);

    if (result.error) {
      ventana?.close();
      setError(result.error);
      return;
    }
    if (ventana && result.venta) escribirComprobante(ventana, result.venta, negocio);
    onClose();
  }

  const esAfip = modo === 'afip';

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 font-heading text-xl font-semibold text-stone-800 dark:text-stone-100">
          Facturar venta
        </h2>
        <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
          {venta.producto_nombre} · {formatCantidad(venta.cantidad)} bolsa
          {venta.cantidad === 1 ? '' : 's'}
        </p>

        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
          {(
            [
              ['afip', 'Facturar en AFIP'],
              ['interno', 'Interno'],
            ] as const
          ).map(([valor, label]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setModo(valor)}
              className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                modo === valor
                  ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-stone-100'
                  : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {esAfip && (
            <>
              <div className="rounded-xl border border-stone-200 p-3 dark:border-stone-700">
                <p className="mb-2 text-xs text-stone-500 dark:text-stone-400">
                  Copiá cada dato y pegalo en el formulario de AFIP. No se puede cargar solo:
                  Comprobantes en Línea no acepta datos desde afuera.
                </p>
                <ul className="space-y-1">
                  {datosParaAfip(venta).map((d) => (
                    <li key={d.label} className="flex items-center gap-2 text-sm">
                      <span className="w-28 shrink-0 text-xs text-stone-500 dark:text-stone-400">
                        {d.label}
                      </span>
                      <span className="flex-1 truncate font-medium text-stone-800 dark:text-stone-100">
                        {d.valor}
                      </span>
                      <button
                        type="button"
                        onClick={() => copiar(d.label, d.valor)}
                        className="shrink-0 rounded-lg border border-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                      >
                        {copiado === d.label ? '✓' : 'Copiar'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={URL_COMPROBANTES_EN_LINEA}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-stone-800 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
              >
                Abrir Comprobantes en Línea de AFIP ↗
              </a>

              <div>
                <label className={labelClass}>Número que te dio AFIP</label>
                <input
                  type="text"
                  placeholder="00001-00000123"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-stone-400">
                  Se guarda para dejar la venta marcada como facturada. La factura fiscal queda en
                  AFIP.
                </p>
              </div>
            </>
          )}

          {!esAfip && (
            <div>
              <label className={labelClass}>Número de comprobante</label>
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-stone-400">
                Sin validez fiscal · sugerido: {numeroSugerido}
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>Cliente</label>
            <input
              type="text"
              autoFocus
              placeholder="Consumidor final"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>CUIT / DNI (opcional)</label>
            <input
              type="text"
              placeholder="—"
              value={docNro}
              onChange={(e) => setDocNro(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-400/10">
            <p className="text-xs text-stone-500 dark:text-stone-400">Total a facturar</p>
            <p className="font-heading text-2xl font-bold text-amber-700 dark:text-amber-400">
              {formatPrecio(venta.total)}
            </p>
          </div>

          <label
            className={`${esAfip ? 'hidden' : 'flex'} items-start gap-2 rounded-xl border border-stone-200 p-3 text-sm font-medium text-stone-700 dark:border-stone-700 dark:text-stone-300`}
          >
            <input
              type="checkbox"
              checked={imprimir}
              onChange={(e) => setImprimir(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-amber-500 focus:ring-amber-400 dark:border-stone-600"
            />
            <span>
              Imprimir el comprobante
              <span className="mt-1 block text-xs font-normal text-stone-400">
                Se abre en una ventana nueva: se puede imprimir o guardar en PDF.
              </span>
            </span>
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Guardando...' : esAfip ? 'Registrar factura' : 'Facturar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
