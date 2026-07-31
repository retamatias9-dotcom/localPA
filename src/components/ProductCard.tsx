import { Link } from 'react-router-dom';
import type { Producto } from '../types';
import { formatPrecio } from '../lib/format';

export default function ProductCard({ producto }: { producto: Producto }) {
  return (
    <Link
      to={`/productos/${producto.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="h-full w-full object-cover transition group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x400?text=Sin+imagen';
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {producto.categoria && (
          <span className="w-fit rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            {producto.categoria}
          </span>
        )}
        <h3 className="line-clamp-1 font-medium text-gray-900 dark:text-gray-100">
          {producto.nombre}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm text-gray-500 dark:text-gray-400">
          {producto.descripcion}
        </p>
        {producto.precio_por_kilo ? (
          <div className="mt-1 space-y-0.5">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatPrecio(producto.precio_kilo ?? 0)}
              <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                / kg
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatPrecio(producto.precio)} / bolsa
            </p>
          </div>
        ) : (
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatPrecio(producto.precio)}
          </p>
        )}
      </div>
    </Link>
  );
}
