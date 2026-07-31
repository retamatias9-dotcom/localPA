import { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ProductFormModal from '../components/ProductFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useProducts } from '../hooks/useProducts';
import type { Producto } from '../types';

export default function Catalog() {
  const { productos, loading, error, createProducto, updateProducto, deleteProducto } =
    useProducts();

  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [deletingProducto, setDeletingProducto] = useState<Producto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const categorias = useMemo(
    () => Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))).sort(),
    [productos]
  );

  const filtrados = useMemo(() => {
    const palabras = search.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return productos.filter((p) => {
      const nombre = p.nombre.toLowerCase();
      const matchNombre = palabras.every((palabra) => nombre.includes(palabra));
      const matchCategoria = categoria ? p.categoria === categoria : true;
      return matchNombre && matchCategoria;
    });
  }, [productos, search, categoria]);

  function openCreateForm() {
    setEditingProducto(null);
    setShowForm(true);
  }

  function openEditForm(producto: Producto) {
    setEditingProducto(producto);
    setShowForm(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingProducto) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteProducto(deletingProducto.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error);
    } else {
      setDeletingProducto(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Productos</h1>
          <button
            onClick={openCreateForm}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
          >
            + Nuevo producto
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:w-56"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400">
            Cargando productos...
          </p>
        )}

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            Error al cargar productos: {error}
          </p>
        )}

        {!loading && !error && filtrados.length === 0 && (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400">
            No se encontraron productos.
          </p>
        )}

        {!loading && !error && filtrados.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtrados.map((producto) => (
              <div key={producto.id} className="relative">
                <ProductCard producto={producto} />
                <div className="absolute right-2 top-2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      openEditForm(producto);
                    }}
                    className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow hover:bg-white dark:bg-gray-900/90 dark:text-gray-200 dark:hover:bg-gray-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setDeletingProducto(producto);
                      setDeleteError(null);
                    }}
                    className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-white dark:bg-gray-900/90 dark:text-red-400 dark:hover:bg-gray-900"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ProductFormModal
          producto={editingProducto}
          onClose={() => setShowForm(false)}
          onSubmit={(data) =>
            editingProducto
              ? updateProducto(editingProducto.id, data)
              : createProducto(data)
          }
        />
      )}

      {deletingProducto && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Seguro que querés eliminar "${deletingProducto.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingProducto(null)}
          loading={deleting}
        />
      )}

      {deleteError && (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-md bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
          Error al eliminar: {deleteError}
        </div>
      )}
    </div>
  );
}
