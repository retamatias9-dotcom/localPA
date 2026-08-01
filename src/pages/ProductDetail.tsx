import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import ProductFormModal from '../components/ProductFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { supabase } from '../lib/supabase';
import { formatPrecio } from '../lib/format';
import { useProducts } from '../hooks/useProducts';
import type { Producto } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateProducto, deleteProducto } = useProducts();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setProducto(data as Producto);
        }
        setLoading(false);
      });
  }, [id]);

  async function handleDeleteConfirm() {
    if (!producto) return;
    setDeleting(true);
    const { error } = await deleteProducto(producto.id);
    setDeleting(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Producto eliminado');
      navigate('/');
    }
  }

  return (
    <div className="min-h-screen bg-amber-50/40 dark:bg-stone-950">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
        >
          ← Volver al catálogo
        </Link>

        {loading && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-stone-900">
            <div className="h-72 w-full animate-pulse bg-stone-200 sm:h-[28rem] dark:bg-stone-800" />
            <div className="space-y-3 p-6">
              <div className="h-4 w-20 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
              <div className="h-7 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
              <div className="h-9 w-40 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
              <div className="h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            Error al cargar el producto: {error}
          </p>
        )}

        {!loading && !error && producto && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-stone-900">
            <div className="flex min-h-72 items-center justify-center bg-stone-100 p-4 sm:min-h-[28rem] sm:p-8 dark:bg-stone-800">
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="max-h-72 w-auto max-w-full object-contain sm:max-h-[26rem]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/800x400?text=Sin+imagen';
                }}
              />
            </div>

            <div className="p-4 sm:p-6">
              {producto.categoria && (
                <span className="mb-2 inline-block w-fit rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold capitalize text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                  {producto.categoria}
                </span>
              )}
              <h1 className="font-heading text-2xl font-bold text-stone-800 dark:text-stone-100">
                {producto.nombre}
              </h1>
              {producto.precio_por_kilo ? (
                <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-2">
                  <div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Precio por bolsa</p>
                    <p className="font-heading text-3xl font-bold text-amber-700 dark:text-amber-400">
                      {formatPrecio(producto.precio)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Precio por kilo</p>
                    <p className="text-xl font-semibold text-stone-700 dark:text-stone-300">
                      {formatPrecio(producto.precio_kilo ?? 0)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 font-heading text-3xl font-bold text-amber-700 dark:text-amber-400">
                  {formatPrecio(producto.precio)}
                </p>
              )}
              <p className="mt-4 whitespace-pre-line text-stone-600 dark:text-stone-400">
                {producto.descripcion}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showForm && producto && (
        <ProductFormModal
          producto={producto}
          onClose={() => setShowForm(false)}
          onSubmit={async (data) => {
            const result = await updateProducto(producto.id, data);
            if (result.error) {
              toast.error(result.error);
            } else {
              toast.success('Producto guardado ✓');
              setProducto({ ...producto, ...data });
            }
            return result;
          }}
        />
      )}

      {showDelete && producto && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Seguro que querés eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}

      <ScrollToTopButton />
    </div>
  );
}
