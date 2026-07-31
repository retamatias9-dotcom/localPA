import { Link } from 'react-router-dom';
import type { Producto } from '../types';
import { formatPrecio } from '../lib/format';

export default function ProductCard({ producto }: { producto: Producto }) {
  return (
    <Link
      to={`/productos/${producto.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
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
          <span className="w-fit rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
            {producto.categoria}
          </span>
        )}
        <h3 className="line-clamp-1 font-medium text-gray-900">{producto.nombre}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-gray-500">{producto.descripcion}</p>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          {formatPrecio(producto.precio)}
        </p>
      </div>
    </Link>
  );
}
