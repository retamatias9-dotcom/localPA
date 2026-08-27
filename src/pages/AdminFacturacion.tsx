import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { useConfigNegocio } from '../hooks/useConfigNegocio';
import type { ConfigNegocio } from '../types';

const inputClass =
  'w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500';
const labelClass = 'mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300';

const CONDICIONES_EMISOR = [
  'Responsable Monotributo',
  'IVA Responsable Inscripto',
  'IVA Sujeto Exento',
];

/** Campos del emisor, con la aclaración de para qué sirve cada uno. */
const CAMPOS: {
  clave: keyof ConfigNegocio;
  label: string;
  placeholder: string;
  ayuda?: string;
  obligatorio?: boolean;
}[] = [
  {
    clave: 'nombre',
    label: 'Razón social o nombre',
    placeholder: 'Planeta Animal',
    ayuda: 'Encabezado del comprobante.',
    obligatorio: true,
  },
  { clave: 'detalle', label: 'Rubro', placeholder: 'Alimento para mascotas' },
  {
    clave: 'cuit',
    label: 'CUIT',
    placeholder: '20-12345678-9',
    ayuda: 'El del titular que factura. Tiene que coincidir con ARCA.',
    obligatorio: true,
  },
  {
    clave: 'domicilio',
    label: 'Domicilio comercial',
    placeholder: 'Av. Siempre Viva 742, San Juan',
    obligatorio: true,
  },
  {
    clave: 'ingresos_brutos',
    label: 'Ingresos Brutos',
    placeholder: 'N° de IIBB o "Exento"',
    obligatorio: true,
  },
  {
    clave: 'inicio_actividades',
    label: 'Inicio de actividades',
    placeholder: '01/03/2024',
    obligatorio: true,
  },
  { clave: 'contacto', label: 'Teléfono / contacto', placeholder: '2645048951' },
];

export default function AdminFacturacion() {
  const { config, loading, error, guardar } = useConfigNegocio();
  const [form, setForm] = useState<ConfigNegocio>(config);
  const [guardando, setGuardando] = useState(false);

  // La config llega asincrónica: cuando aparece, se vuelca al formulario.
  useEffect(() => {
    setForm(config);
  }, [config]);

  const set = (clave: keyof ConfigNegocio, valor: string) =>
    setForm((prev) => ({ ...prev, [clave]: valor }));

  const faltantes = CAMPOS.filter((c) => c.obligatorio && !form[c.clave]?.trim());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const { error } = await guardar(form);
    setGuardando(false);
    if (error) toast.error(error);
    else toast.success('Datos de facturación guardados ✓');
  }

  return (
    <div className="min-h-screen bg-amber-50/40 dark:bg-stone-950">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <Link
          to="/admin"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
        >
          ← Volver al panel
        </Link>

        <h1 className="mb-1 font-heading text-2xl font-bold text-stone-800 dark:text-stone-100">
          Facturación
        </h1>
        <p className="mb-6 text-sm text-stone-500 dark:text-stone-400">
          A nombre de quién se emiten las facturas. Estos datos salen impresos en cada comprobante
          y son obligatorios en una factura, así que tienen que coincidir con lo declarado en ARCA.
        </p>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800" />
            ))}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            )}

            {CAMPOS.map((c) => (
              <div key={c.clave}>
                <label className={labelClass}>
                  {c.label}
                  {c.obligatorio && <span className="text-amber-600"> *</span>}
                </label>
                <input
                  type="text"
                  value={form[c.clave] ?? ''}
                  placeholder={c.placeholder}
                  onChange={(e) => set(c.clave, e.target.value)}
                  className={inputClass}
                />
                {c.ayuda && <p className="mt-1 text-xs text-stone-400">{c.ayuda}</p>}
              </div>
            ))}

            <div>
              <label className={labelClass}>Condición frente al IVA</label>
              <select
                value={form.condicion_iva}
                onChange={(e) => set('condicion_iva', e.target.value)}
                className={inputClass}
              >
                {CONDICIONES_EMISOR.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {faltantes.length > 0 && (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                Falta completar: {faltantes.map((f) => f.label).join(', ')}. Sin esos datos el
                comprobante impreso queda incompleto como factura.
              </p>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="w-full rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
