import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

export default function SetName() {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ data: { name: nombre.trim() } });
    setSubmitting(false);
    if (error) {
      setError(error.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md sm:p-8 dark:bg-gray-900">
        <h1 className="mb-2 text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
          ¿Cómo te llamás?
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Este nombre va a aparecer en el catálogo.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nombre"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              required
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
