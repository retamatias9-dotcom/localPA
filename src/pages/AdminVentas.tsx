import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import VentasTable from '../components/VentasTable';
import FacturaModal from '../components/FacturaModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { useVentas } from '../hooks/useVentas';
import { useConfigNegocio } from '../hooks/useConfigNegocio';
import { imprimirComprobante, siguienteNumeroFactura } from '../lib/comprobante';
import { formatPrecio } from '../lib/format';
import type { FacturaData, Venta } from '../types';

type FiltroFactura = 'todas' | 'facturadas' | 'sin_facturar';

const filtros: { valor: FiltroFactura; label: string }[] = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'sin_facturar', label: 'Sin facturar' },
  { valor: 'facturadas', label: 'Facturadas' },
];

export default function AdminVentas() {
  const { ventas, loading, error, facturarVenta, anularFactura } = useVentas();
  const { config: negocio } = useConfigNegocio();
  const [buscarVendedor, setBuscarVendedor] = useState('');
  const [filtro, setFiltro] = useState<FiltroFactura>('todas');
  const [facturando, setFacturando] = useState<Venta | null>(null);
  const [anulando, setAnulando] = useState<Venta | null>(null);
  const [anulandoLoading, setAnulandoLoading] = useState(false);

  const ventasFiltradas = useMemo(() => {
    const q = buscarVendedor.trim().toLowerCase();
    return ventas.filter((v) => {
      if (q && !(v.vendido_por ?? '').toLowerCase().includes(q)) return false;
      // Las bolsas abiertas no se facturan: quedan fuera de los filtros de factura.
      if (filtro === 'facturadas') return v.facturada;
      if (filtro === 'sin_facturar') return !v.facturada && v.tipo !== 'kilo';
      return true;
    });
  }, [ventas, buscarVendedor, filtro]);

  // Las bolsas abiertas se listan igual, pero se cuentan aparte: no son ventas.
  const conteo = useMemo(
    () => ({
      ventas: ventasFiltradas.filter((v) => v.tipo !== 'kilo').length,
      abiertas: ventasFiltradas.filter((v) => v.tipo === 'kilo').length,
    }),
    [ventasFiltradas]
  );

  // Facturar es opcional, así que conviene ver de un vistazo cuánto quedó pendiente.
  const pendientes = useMemo(() => {
    const sinFacturar = ventas.filter((v) => v.tipo !== 'kilo' && !v.facturada);
    return { cantidad: sinFacturar.length, total: sinFacturar.reduce((acc, v) => acc + v.total, 0) };
  }, [ventas]);

  const numerosUsados = useMemo(
    () => ventas.map((v) => v.factura_numero).filter((n): n is string => Boolean(n)),
    [ventas]
  );
  const numeroSugerido = useMemo(() => siguienteNumeroFactura(ventas), [ventas]);

  async function handleFacturarInterno(datos: FacturaData) {
    if (!facturando) return { error: 'No hay venta seleccionada.' };
    const result = await facturarVenta(facturando.id, datos);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        datos.externa
          ? `Factura de AFIP registrada · N° ${datos.factura_numero}`
          : `Comprobante interno N° ${datos.factura_numero}`
      );
    }
    return result;
  }

  async function handleAnularConfirm() {
    if (!anulando) return;
    setAnulandoLoading(true);
    const { error } = await anularFactura(anulando.id);
    setAnulandoLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Factura quitada');
      setAnulando(null);
    }
  }

  function handleImprimir(venta: Venta) {
    if (!imprimirComprobante(venta, negocio)) {
      toast.error(
        'El navegador bloqueó la ventana de impresión. Permití los popups para este sitio.'
      );
    }
  }

  return (
    <div className="min-h-screen bg-amber-50/40 dark:bg-stone-950">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link
          to="/admin"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
        >
          ← Volver al panel
        </Link>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-stone-800 dark:text-stone-100">
              Todas las ventas
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {conteo.ventas} venta{conteo.ventas === 1 ? '' : 's'}
              {conteo.abiertas > 0 &&
                ` · ${conteo.abiertas} bolsa${conteo.abiertas === 1 ? '' : 's'} abierta${
                  conteo.abiertas === 1 ? '' : 's'
                }`}
              {pendientes.cantidad > 0 &&
                ` · ${pendientes.cantidad} sin facturar (${formatPrecio(pendientes.total)})`}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={buscarVendedor}
              onChange={(e) => setBuscarVendedor(e.target.value)}
              placeholder="Buscar por usuario..."
              className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {filtros.map((f) => (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                filtro === f.valor
                  ? 'bg-amber-400 text-stone-900 shadow-sm'
                  : 'border border-stone-200 text-stone-600 hover:bg-white dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800"
              />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            Error al cargar ventas: {error}
          </p>
        ) : (
          <VentasTable
            ventas={ventasFiltradas}
            emptyMessage={
              ventas.length === 0
                ? 'Todavía no se registró ninguna venta.'
                : 'Ninguna venta coincide con los filtros.'
            }
            onFacturar={setFacturando}
            onImprimir={handleImprimir}
            onAnular={setAnulando}
          />
        )}
      </main>

      {facturando && (
        <FacturaModal
          venta={facturando}
          numeroSugerido={numeroSugerido}
          numerosUsados={numerosUsados}
          negocio={negocio}
          onClose={() => setFacturando(null)}
          onConfirmInterno={handleFacturarInterno}
        />
      )}

      {anulando && (
        <ConfirmDialog
          title="Quitar la factura"
          message={`Se van a borrar los datos del comprobante N° ${
            anulando.factura_numero ?? '—'
          }. La venta queda registrada igual, como no facturada.`}
          confirmLabel="Quitar factura"
          onConfirm={handleAnularConfirm}
          onCancel={() => setAnulando(null)}
          loading={anulandoLoading}
        />
      )}

      <ScrollToTopButton />
    </div>
  );
}
