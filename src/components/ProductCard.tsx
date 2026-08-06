import { Link } from 'react-router-dom';
import type { Producto } from '../types';
import { formatPrecio } from '../lib/format';

export default function ProductCard({ producto }: { producto: Producto }) {
  const tieneKilo = producto.precio_por_kilo && producto.precio_kilo != null;

  return (
    <Link
      to={`/productos/${producto.id}`}
      className="group flex flex-row items-stretch overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg sm:flex-col dark:border-stone-800 dark:bg-stone-900"
    >
      {/* En mobile la foto es chica y va al costado; desde sm es cuadrada arriba, como antes */}
      <div className="relative w-24 shrink-0 overflow-hidden bg-stone-100 sm:aspect-square sm:w-full dark:bg-stone-800">
        {producto.categoria && (
          <span className="absolute left-1.5 top-1.5 z-10 w-fit rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-amber-800 shadow-sm sm:left-2 sm:top-2 sm:px-2.5 sm:py-1 sm:text-xs dark:bg-amber-400/15 dark:text-amber-300">
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

      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="line-clamp-1 pr-20 font-heading text-sm font-semibold text-stone-800 sm:pr-0 sm:text-base dark:text-stone-100">
          {producto.nombre}
        </h3>
        <p className="line-clamp-2 flex-1 text-xs text-stone-500 sm:text-sm dark:text-stone-400">
          {producto.descripcion}
        </p>

        <div className="mt-1 flex items-baseline gap-1.5 sm:mt-2">
          <p className="font-heading text-lg font-bold text-amber-700 sm:text-2xl dark:text-amber-400">
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
