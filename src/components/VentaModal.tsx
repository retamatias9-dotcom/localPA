import { useState, type FormEvent } from 'react';
import type { Producto, TipoVenta } from '../types';
import { formatCantidad, formatPrecio } from '../lib/format';

interface VentaModalProps {
  producto: Producto;
  onClose: () => void;
  onConfirm: (cantidad: number, tipo: TipoVenta) => Promise<{ error: string | null }>;
}

const inputClass =
  'w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500';
const labelClass = 'mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300';

export default function VentaModal({ producto, onClose, onConfirm }: VentaModalProps) {
  // La cantidad siempre son bolsas. El tilde solo marca que esa bolsa se abre
  // para vender suelto por kilo: descuenta stock igual y queda anotado en ventas.
  const [bolsaAbierta, setBolsaAbierta] = useState(false);
  const [cantidad, setCantidad] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const total = cantidad === '' ? 0 : producto.precio * cantidad;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (cantidad === '' || cantidad <= 0) {
      setError('Ingresá una cantidad válida.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error } = await onConfirm(cantidad, bolsaAbierta ? 'kilo' : 'unidad');
    setSubmitting(false);
    if (!error) {
      onClose();
    }
  }

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
          {bolsaAbierta ? 'Registrar bolsa abierta' : 'Registrar venta'}
        </h2>
        <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">{producto.nombre}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Cantidad (bolsas)</label>
            <input
              type="number"
              min={0}
              step="1"
              autoFocus
              placeholder="0"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value === '' ? '' : Number(e.target.value))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-stone-400">
              Stock actual: {formatCantidad(producto.stock)} bolsa
              {producto.stock === 1 ? '' : 's'}
            </p>
          </div>

          <label className="flex items-start gap-2 rounded-xl border border-stone-200 p-3 text-sm font-medium text-stone-700 dark:border-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={bolsaAbierta}
              onChange={(e) => setBolsaAbierta(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-amber-500 focus:ring-amber-400 dark:border-stone-600"
            />
            <span>
              Bolsa abierta (se vende por kilo)
              <span className="mt-1 block text-xs font-normal text-stone-400">
                Solo descuenta del stock: no cuenta como venta ni suma importe.
              </span>
            </span>
          </label>

          {!bolsaAbierta && (
            <div className="rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-400/10">
              <p className="text-xs text-stone-500 dark:text-stone-400">Total de la venta</p>
              <p className="font-heading text-2xl font-bold text-amber-700 dark:text-amber-400">
                {formatPrecio(total)}
              </p>
            </div>
          )}

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
              {submitting
                ? 'Registrando...'
                : bolsaAbierta
                  ? 'Registrar bolsa abierta'
                  : 'Confirmar venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
