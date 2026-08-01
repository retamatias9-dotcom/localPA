import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import ProductFormModal from '../components/ProductFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { useProducts } from '../hooks/useProducts';
import type { Producto, ProductoFormData } from '../types';

const PAGE_SIZE = 24;

export default function Catalog() {
  const { productos, loading, error, createProducto, updateProducto, deleteProducto } =
    useProducts();

  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showForm, setShowForm] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [deletingProducto, setDeletingProducto] = useState<Producto | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Al cambiar la búsqueda o la categoría, volvemos a mostrar la primera tanda.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, categoria]);

  const visibles = filtrados.slice(0, visibleCount);
  const hayMas = visibleCount < filtrados.length;

  // Scroll infinito: cuando el centinela entra en pantalla, se muestra una tanda más.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hayMas) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtrados.length));
        }
      },
      { rootMargin: '600px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hayMas, filtrados.length]);

  function openCreateForm() {
    setEditingProducto(null);
    setShowForm(true);
  }

  function openEditForm(producto: Producto) {
    setEditingProducto(producto);
    setShowForm(true);
  }

  async function handleFormSubmit(data: ProductoFormData) {
    const result = editingProducto
      ? await updateProducto(editingProducto.id, data)
      : await createProducto(data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Producto guardado ✓');
    }
    return result;
  }

  async function handleDeleteConfirm() {
    if (!deletingProducto) return;
    setDeleting(true);
    const { error } = await deleteProducto(deletingProducto.id);
    setDeleting(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Producto eliminado');
      setDeletingProducto(null);
    }
  }

  const resultLabel = search.trim()
    ? `${filtrados.length} resultado${filtrados.length === 1 ? '' : 's'} para "${search.trim()}"`
    : `${filtrados.length} producto${filtrados.length === 1 ? '' : 's'}`;

  return (
    <div className="min-h-screen bg-amber-50/40 dark:bg-stone-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-2xl font-bold text-stone-800 dark:text-stone-100">
            Catálogo
          </h1>
          <button
            onClick={openCreateForm}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-amber-500 sm:w-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              className="h-4 w-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo producto
          </button>
        </div>

        {/* Buscador */}
        <div className="relative mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500"
          />
        </div>

        {/* Pills de categoría */}
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={() => setCategoria('')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              categoria === ''
                ? 'bg-amber-400 text-stone-900 shadow-sm'
                : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'
            }`}
          >
            Todos
          </button>
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                categoria === c
                  ? 'bg-amber-400 text-stone-900 shadow-sm'
                  : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {!loading && !error && (
          <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">{resultLabel}</p>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            Error al cargar productos: {error}
          </p>
        )}

        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && !error && filtrados.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-400/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-amber-600 dark:text-amber-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <p className="font-heading text-lg font-semibold text-stone-700 dark:text-stone-200">
              No encontramos productos
            </p>
            <p className="max-w-sm text-sm text-stone-500 dark:text-stone-400">
              Probá con otra palabra o elegí otra categoría.
            </p>
          </div>
        )}

        {!loading && !error && filtrados.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibles.map((producto) => (
                <div key={producto.id} className="relative">
                  <ProductCard producto={producto} />
                  <div className="absolute right-2 top-2 z-10 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        openEditForm(producto);
                      }}
                      className="rounded-lg bg-white/95 px-2 py-1 text-xs font-medium text-stone-700 shadow-sm backdrop-blur hover:bg-white dark:bg-stone-900/90 dark:text-stone-200 dark:hover:bg-stone-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeletingProducto(producto);
                      }}
                      className="rounded-lg bg-white/95 px-2 py-1 text-xs font-medium text-red-600 shadow-sm backdrop-blur hover:bg-white dark:bg-stone-900/90 dark:text-red-400 dark:hover:bg-stone-900"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hayMas && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
              </div>
            )}
          </>
        )}
      </main>

      {showForm && (
        <ProductFormModal
          producto={editingProducto}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
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

      <ScrollToTopButton />
    </div>
  );
}
