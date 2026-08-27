import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScrollToTopButton from '../components/ScrollToTopButton';
import VentasTable from '../components/VentasTable';
import { useProducts } from '../hooks/useProducts';
import { useVentas } from '../hooks/useVentas';
import { formatCantidad, formatPrecio } from '../lib/format';

const VENTAS_RECIENTES_CANTIDAD = 6;

const STOCK_BAJO = 5;
const STOCK_VISIBLE_INICIAL = 4;

// Claves en horario local (no UTC), para que el corte de "hoy" sea a las 00:00 locales.
function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500"
      />
    </div>
  );
}

function StatTile({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'critical';
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
      <p
        className={`mt-1 font-heading text-3xl font-bold ${
          tone === 'critical'
            ? 'text-red-600 dark:text-red-400'
            : 'text-stone-800 dark:text-stone-100'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const { productos, loading: loadingProductos } = useProducts();
  const { ventas, loading: loadingVentas, error: errorVentas } = useVentas();

  const [buscarMarca, setBuscarMarca] = useState('');
  const [stockExpandido, setStockExpandido] = useState(false);
  const [historialVista, setHistorialVista] = useState<'dia' | 'mes'>('dia');

  // Las bolsas abiertas (tipo 'kilo') descuentan stock pero no son ventas: no
  // suman ni a los contadores ni a los ingresos.
  const ventasReales = useMemo(() => ventas.filter((v) => v.tipo !== 'kilo'), [ventas]);

  const totalVentas = ventasReales.length;
  const ingresosTotales = useMemo(
    () => ventasReales.reduce((acc, v) => acc + v.total, 0),
    [ventasReales]
  );
  const sinStock = useMemo(() => productos.filter((p) => p.stock <= 0).length, [productos]);

  // Facturar es opcional: acá solo se avisa cuánto quedó pendiente, se factura
  // desde "Todas las ventas".
  const sinFacturar = useMemo(() => ventasReales.filter((v) => !v.facturada).length, [ventasReales]);

  // "Hoy" se recalcula en cada carga a partir de la fecha actual: no hay que
  // borrar ni reiniciar nada, al pasar la medianoche el filtro cambia solo.
  const ventasHoy = useMemo(() => {
    const hoy = dayKey(new Date());
    return ventasReales.filter((v) => dayKey(new Date(v.created_at)) === hoy);
  }, [ventasReales]);
  const ingresosHoy = useMemo(() => ventasHoy.reduce((acc, v) => acc + v.total, 0), [ventasHoy]);

  // Historial agrupado por día y por mes, para ver la evolución de ventas
  // en el tiempo (todo lo registrado se conserva, nada se borra).
  const ventasPorDia = useMemo(() => {
    const grupos = new Map<string, { fecha: Date; ventas: number; total: number }>();
    for (const v of ventasReales) {
      const fecha = new Date(v.created_at);
      const key = dayKey(fecha);
      const actual = grupos.get(key) ?? { fecha, ventas: 0, total: 0 };
      grupos.set(key, { fecha, ventas: actual.ventas + 1, total: actual.total + v.total });
    }
    return Array.from(grupos.values()).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }, [ventasReales]);

  const ventasPorMes = useMemo(() => {
    const grupos = new Map<string, { fecha: Date; ventas: number; total: number }>();
    for (const v of ventasReales) {
      const fecha = new Date(v.created_at);
      const key = monthKey(fecha);
      const actual = grupos.get(key) ?? { fecha, ventas: 0, total: 0 };
      grupos.set(key, { fecha, ventas: actual.ventas + 1, total: actual.total + v.total });
    }
    return Array.from(grupos.values()).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }, [ventasReales]);

  const historial = historialVista === 'dia' ? ventasPorDia : ventasPorMes;

  const marcasDistintas = useMemo(
    () => new Set(productos.map((p) => p.marca?.trim()).filter(Boolean)).size,
    [productos]
  );

  // Listado de stock por producto, ordenado por nombre.
  const stockProductos = useMemo(() => {
    return [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [productos]);

  // Bolsas que salieron del stock en el mes corriente, separando las vendidas de
  // las que se abrieron para vender por kilo (que no son ventas).
  const bolsasDelMes = useMemo(() => {
    const mes = monthKey(new Date());
    const porProducto = new Map<string, { vendidas: number; abiertas: number }>();
    for (const v of ventas) {
      if (!v.producto_id) continue;
      if (monthKey(new Date(v.created_at)) !== mes) continue;
      const actual = porProducto.get(v.producto_id) ?? { vendidas: 0, abiertas: 0 };
      if (v.tipo === 'kilo') actual.abiertas += v.cantidad;
      else actual.vendidas += v.cantidad;
      porProducto.set(v.producto_id, actual);
    }
    return porProducto;
  }, [ventas]);

  const totalesDelMes = useMemo(() => {
    let vendidas = 0;
    let abiertas = 0;
    for (const m of bolsasDelMes.values()) {
      vendidas += m.vendidas;
      abiertas += m.abiertas;
    }
    return { vendidas, abiertas };
  }, [bolsasDelMes]);

  const mesActual = new Date().toLocaleDateString('es-AR', { month: 'long' });

  // Las estadísticas y los conteos usan siempre el total; los buscadores solo
  // filtran lo que se muestra en cada tabla.
  const stockFiltrado = useMemo(() => {
    const q = buscarMarca.trim().toLowerCase();
    if (!q) return stockProductos;
    return stockProductos.filter((p) => p.nombre.toLowerCase().includes(q));
  }, [stockProductos, buscarMarca]);

  // Con una búsqueda activa se muestran todos los resultados; si no, se
  // arranca colapsado a las primeras filas con un botón para ver el resto.
  const hayBusquedaStock = buscarMarca.trim() !== '';
  const stockVisible =
    hayBusquedaStock || stockExpandido
      ? stockFiltrado
      : stockFiltrado.slice(0, STOCK_VISIBLE_INICIAL);
  const hayMasStock = !hayBusquedaStock && stockFiltrado.length > STOCK_VISIBLE_INICIAL;

  const ventasRecientes = useMemo(
    () => ventas.slice(0, VENTAS_RECIENTES_CANTIDAD),
    [ventas]
  );

  const loading = loadingProductos || loadingVentas;

  return (
    <div className="min-h-screen bg-amber-50/40 dark:bg-stone-950">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
        >
          ← Volver al catálogo
        </Link>

        <h1 className="mb-1 font-heading text-2xl font-bold text-stone-800 dark:text-stone-100">
          Panel de administración
        </h1>
        <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
          Ventas registradas y stock disponible por producto.
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            to="/admin/ventas"
            className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            Todas las ventas
          </Link>
          <Link
            to="/admin/facturacion"
            className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            Facturación
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800"
              />
            ))}
          </div>
        ) : (
          <>
            {errorVentas && (
              <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                Error al cargar ventas: {errorVentas}
              </p>
            )}

            {/* Ventas recientes */}
            <section className="mb-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-stone-800 dark:text-stone-100">
                    Últimos movimientos
                  </h2>
                  {sinFacturar > 0 && (
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {sinFacturar} venta{sinFacturar === 1 ? '' : 's'} sin facturar
                    </p>
                  )}
                </div>
                <Link
                  to="/admin/ventas"
                  className="whitespace-nowrap text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
                >
                  Ver todas →
                </Link>
              </div>
              <VentasTable
                ventas={ventasRecientes}
                emptyMessage="Todavía no se registró ningún movimiento."
              />
            </section>

            {/* Estadísticas */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Ventas de hoy" value={String(ventasHoy.length)} />
              <StatTile label="Ingresos de hoy" value={formatPrecio(ingresosHoy)} />
              <StatTile label="Ventas totales" value={String(totalVentas)} />
              <StatTile label="Ingresos totales" value={formatPrecio(ingresosTotales)} />
              <StatTile
                label="Productos sin stock"
                value={String(sinStock)}
                tone={sinStock > 0 ? 'critical' : 'default'}
              />
              <StatTile label="Marcas distintas" value={String(marcasDistintas)} />
            </div>

            {/* Stock */}
            <section className="mb-8">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-stone-800 dark:text-stone-100">
                    Stock
                  </h2>
                  <p className="text-sm capitalize text-stone-500 dark:text-stone-400">
                    {mesActual}: {formatCantidad(totalesDelMes.vendidas)} bolsa
                    {totalesDelMes.vendidas === 1 ? '' : 's'} vendida
                    {totalesDelMes.vendidas === 1 ? '' : 's'}
                    {totalesDelMes.abiertas > 0 &&
                      ` · ${formatCantidad(totalesDelMes.abiertas)} abierta${
                        totalesDelMes.abiertas === 1 ? '' : 's'
                      }`}
                  </p>
                </div>
                <SearchInput
                  value={buscarMarca}
                  onChange={setBuscarMarca}
                  placeholder="Buscar producto..."
                />
              </div>
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 dark:border-stone-800 dark:text-stone-400">
                        <th className="px-4 py-3 font-medium">Nombre</th>
                        <th className="px-4 py-3 font-medium">Stock (bolsas)</th>
                        <th className="whitespace-nowrap px-4 py-3 font-medium capitalize">
                          Vendidas en {mesActual}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockVisible.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-stone-100 last:border-0 dark:border-stone-800/60"
                        >
                          <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-100">
                            {p.nombre}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                p.stock <= 0
                                  ? 'font-semibold text-red-600 dark:text-red-400'
                                  : p.stock <= STOCK_BAJO
                                    ? 'font-semibold text-amber-600 dark:text-amber-400'
                                    : 'font-semibold text-stone-700 dark:text-stone-200'
                              }
                            >
                              {formatCantidad(p.stock)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-stone-600 dark:text-stone-300">
                            {formatCantidad(bolsasDelMes.get(p.id)?.vendidas ?? 0)}
                            {(bolsasDelMes.get(p.id)?.abiertas ?? 0) > 0 && (
                              <span className="text-stone-400">
                                {' '}
                                · {formatCantidad(bolsasDelMes.get(p.id)!.abiertas)} abierta(s)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {stockFiltrado.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-stone-400">
                            {stockProductos.length === 0
                              ? 'No hay productos cargados.'
                              : 'Ningún producto coincide con la búsqueda.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {hayMasStock && (
                <button
                  onClick={() => setStockExpandido(true)}
                  className="mt-3 w-full rounded-xl border border-stone-200 py-2 text-sm font-medium text-stone-600 transition hover:bg-white dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Ver {stockFiltrado.length - STOCK_VISIBLE_INICIAL} más
                </button>
              )}
              {stockExpandido && !hayBusquedaStock && stockFiltrado.length > STOCK_VISIBLE_INICIAL && (
                <button
                  onClick={() => setStockExpandido(false)}
                  className="mt-3 w-full rounded-xl border border-stone-200 py-2 text-sm font-medium text-stone-600 transition hover:bg-white dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Ver menos
                </button>
              )}
            </section>

            {/* Historial de ventas por día / por mes */}
            <section className="mb-8">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-heading text-lg font-semibold text-stone-800 dark:text-stone-100">
                  Historial de ventas
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setHistorialVista('dia')}
                    className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                      historialVista === 'dia'
                        ? 'bg-amber-400 text-stone-900 shadow-sm'
                        : 'border border-stone-200 text-stone-600 hover:bg-white dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800'
                    }`}
                  >
                    Por día
                  </button>
                  <button
                    onClick={() => setHistorialVista('mes')}
                    className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                      historialVista === 'mes'
                        ? 'bg-amber-400 text-stone-900 shadow-sm'
                        : 'border border-stone-200 text-stone-600 hover:bg-white dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800'
                    }`}
                  >
                    Por mes
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 dark:border-stone-800 dark:text-stone-400">
                        <th className="px-4 py-3 font-medium">
                          {historialVista === 'dia' ? 'Día' : 'Mes'}
                        </th>
                        <th className="px-4 py-3 font-medium">Ventas</th>
                        <th className="px-4 py-3 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.map((h) => (
                        <tr
                          key={historialVista === 'dia' ? dayKey(h.fecha) : monthKey(h.fecha)}
                          className="border-b border-stone-100 last:border-0 dark:border-stone-800/60"
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-medium capitalize text-stone-800 dark:text-stone-100">
                            {historialVista === 'dia'
                              ? h.fecha.toLocaleDateString('es-AR', {
                                  weekday: 'short',
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : h.fecha.toLocaleDateString('es-AR', {
                                  month: 'long',
                                  year: 'numeric',
                                })}
                          </td>
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            {h.ventas}
                          </td>
                          <td className="px-4 py-3 font-semibold text-amber-700 dark:text-amber-400">
                            {formatPrecio(h.total)}
                          </td>
                        </tr>
                      ))}
                      {historial.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-stone-400">
                            Todavía no se registró ninguna venta.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <ScrollToTopButton />
    </div>
  );
}
