import type { Venta } from '../types';
import { formatCantidad, formatPrecio } from '../lib/format';

interface VentasTableProps {
  ventas: Venta[];
  emptyMessage: string;
  /** Sin estos handlers la columna de factura queda de solo lectura. */
  onFacturar?: (venta: Venta) => void;
  onImprimir?: (venta: Venta) => void;
  onAnular?: (venta: Venta) => void;
}

const accionClass =
  'rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800';

export default function VentasTable({
  ventas,
  emptyMessage,
  onFacturar,
  onImprimir,
  onAnular,
}: VentasTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500 dark:border-stone-800 dark:text-stone-400">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Cantidad</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Vendido por</th>
              <th className="px-4 py-3 font-medium">Factura</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr
                key={v.id}
                className="border-b border-stone-100 last:border-0 dark:border-stone-800/60"
              >
                <td className="whitespace-nowrap px-4 py-3 text-stone-500 dark:text-stone-400">
                  {new Date(v.created_at).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-100">
                  {v.producto_nombre}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-stone-600 dark:text-stone-300">
                  {formatCantidad(v.cantidad)} bolsa{v.cantidad === 1 ? '' : 's'}
                  {v.tipo === 'kilo' && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                      abierta por kilo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-amber-700 dark:text-amber-400">
                  {v.tipo === 'kilo' ? (
                    <span className="font-normal text-stone-400">—</span>
                  ) : (
                    formatPrecio(v.total)
                  )}
                </td>
                <td className="px-4 py-3 text-stone-500 dark:text-stone-400">
                  {v.vendido_por ?? '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {/* Las bolsas abiertas no son ventas: no se facturan. */}
                  {v.tipo === 'kilo' ? (
                    <span className="text-stone-400">—</span>
                  ) : v.facturada ? (
                    <div className="flex items-center gap-2">
                      <span
                        title={
                          v.factura_externa
                            ? 'Factura emitida en Comprobantes en Línea de AFIP'
                            : 'Comprobante interno, sin validez fiscal'
                        }
                        className={
                          v.factura_externa
                            ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300'
                            : 'rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                        }
                      >
                        {`${v.factura_externa ? 'AFIP' : 'N°'} ${v.factura_numero ?? '—'}`}
                      </span>
                      {onImprimir && (
                        <button onClick={() => onImprimir(v)} className={accionClass}>
                          Imprimir
                        </button>
                      )}
                      {onAnular && (
                        <button
                          onClick={() => onAnular(v)}
                          className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-stone-700 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  ) : onFacturar ? (
                    <button
                      onClick={() => onFacturar(v)}
                      className="rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-semibold text-stone-900 transition hover:bg-amber-500"
                    >
                      Facturar
                    </button>
                  ) : (
                    <span className="text-stone-400">Sin facturar</span>
                  )}
                </td>
              </tr>
            ))}
            {ventas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-stone-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
