import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductFormModal from '../components/ProductFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
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
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    setDeleteError(null);
    const { error } = await deleteProducto(producto.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link to="/" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
          ← Volver al catálogo
        </Link>

        {loading && <p className="py-12 text-center text-gray-500">Cargando producto...</p>}

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
            Error al cargar el producto: {error}
          </p>
        )}

        {!loading && !error && producto && (
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="aspect-video w-full overflow-hidden bg-gray-100 sm:aspect-[21/9]">
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/800x400?text=Sin+imagen';
                }}
              />
            </div>

            <div className="p-6">
              {producto.categoria && (
                <span className="mb-2 inline-block w-fit rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                  {producto.categoria}
                </span>
              )}
              <h1 className="text-2xl font-semibold text-gray-900">{producto.nombre}</h1>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {formatPrecio(producto.precio)}
              </p>
              <p className="mt-4 whitespace-pre-line text-gray-600">{producto.descripcion}</p>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    setShowDelete(true);
                    setDeleteError(null);
                  }}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>

              {deleteError && (
                <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  Error al eliminar: {deleteError}
                </p>
              )}
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
            if (!result.error) {
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
    </div>
  );
}
