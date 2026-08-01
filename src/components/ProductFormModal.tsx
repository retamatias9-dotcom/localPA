import { useState, type FormEvent } from 'react';
import type { Producto, ProductoFormData } from '../types';

interface ProductFormModalProps {
  producto?: Producto | null;
  onClose: () => void;
  onSubmit: (data: ProductoFormData) => Promise<{ error: string | null }>;
}

type FormState = Omit<ProductoFormData, 'precio' | 'precio_kilo'> & {
  precio: number | '';
  precio_kilo: number | '';
};

const emptyForm: FormState = {
  nombre: '',
  descripcion: '',
  precio: '',
  precio_kilo: '',
  precio_por_kilo: false,
  imagen_url: '',
  categoria: '',
};

const inputClass =
  'w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500';
const labelClass = 'mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300';

export default function ProductFormModal({
  producto,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [form, setForm] = useState<FormState>(
    producto
      ? {
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          precio_kilo: producto.precio_kilo ?? '',
          precio_por_kilo: producto.precio_por_kilo,
          imagen_url: producto.imagen_url,
          categoria: producto.categoria,
        }
      : emptyForm
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.precio === '') {
      setError(form.precio_por_kilo ? 'Ingresá el precio por bolsa.' : 'Ingresá un precio.');
      return;
    }
    if (form.precio_por_kilo && form.precio_kilo === '') {
      setError('Ingresá el precio por kilo.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error } = await onSubmit({
      ...form,
      precio: form.precio,
      precio_kilo: form.precio_por_kilo ? (form.precio_kilo as number) : null,
    });
    setSubmitting(false);
    // Si hubo un error de guardado, el toast del padre ya lo avisó; dejamos el modal
    // abierto para que se pueda reintentar sin perder lo cargado.
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
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 font-heading text-xl font-semibold text-stone-800 dark:text-stone-100">
          {producto ? 'Editar producto' : 'Nuevo producto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Descripción</label>
            <textarea
              required
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={form.precio_por_kilo}
              onChange={(e) => setForm({ ...form, precio_por_kilo: e.target.checked })}
              className="h-4 w-4 rounded border-stone-300 accent-amber-500 focus:ring-amber-400 dark:border-stone-600"
            />
            Vender por kilo y por bolsa
          </label>

          {form.precio_por_kilo ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Precio por kilo</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="0"
                  value={form.precio_kilo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      precio_kilo: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Precio por bolsa</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="0"
                  value={form.precio}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      precio: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className={labelClass}>Precio</label>
              <input
                type="number"
                required
                min={0}
                placeholder="0"
                value={form.precio}
                onChange={(e) =>
                  setForm({
                    ...form,
                    precio: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className={labelClass}>Categoría</label>
            <input
              type="text"
              required
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>URL de la imagen</label>
            <input
              type="url"
              required
              value={form.imagen_url}
              onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

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
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
