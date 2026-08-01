import { Link } from 'react-router-dom';
import type { Producto } from '../types';
import { formatPrecio } from '../lib/format';

export default function ProductCard({ producto }: { producto: Producto }) {
  const tieneKilo = producto.precio_por_kilo && producto.precio_kilo != null;

  return (
    <Link
      to={`/productos/${producto.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
        {producto.categoria && (
          <span className="absolute left-2 top-2 z-10 w-fit rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold capitalize text-amber-800 shadow-sm dark:bg-amber-400/15 dark:text-amber-300">
            {producto.categoria}
          </span>
        )}
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x400?text=Sin+imagen';
          }}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-1 font-heading text-base font-semibold text-stone-800 dark:text-stone-100">
          {producto.nombre}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm text-stone-500 dark:text-stone-400">
          {producto.descripcion}
        </p>

        <div className="mt-2 flex items-baseline gap-1.5">
          <p className="font-heading text-2xl font-bold text-amber-700 dark:text-amber-400">
            {formatPrecio(producto.precio)}
          </p>
          {tieneKilo && <span className="text-xs text-stone-400">/ bolsa</span>}
        </div>
        {tieneKilo && (
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
            {formatPrecio(producto.precio_kilo!)} / kg
          </p>
        )}
      </div>
    </Link>
  );
}
