import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6.5 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
      <path d="M17.5 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
      <path d="M3.5 13.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
      <path d="M20.5 13.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
      <path d="M12 22c-3 0-5.5-1.8-5.5-4.5C6.5 14.5 9 12 12 12s5.5 2.5 5.5 5.5c0 2.7-2.5 4.5-5.5 4.5Z" />
    </svg>
  );
}

export default function Login() {
  const { session, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    const from = (location.state as { from?: string })?.from ?? '/';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setError('Email o contraseña incorrectos.');
    }
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-stone-950">
      {/* Panel de marca — solo en desktop */}
      <div className="hidden flex-col items-center justify-center bg-gradient-to-br from-amber-300 to-amber-500 px-12 text-stone-900 lg:flex lg:w-1/2">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/30 backdrop-blur">
          <StoreIcon className="h-10 w-10" />
        </div>
        <h1 className="mt-6 text-center font-heading text-4xl font-bold">Catálogo de Precios</h1>
        <p className="mt-3 max-w-sm text-center text-stone-800/80">
          Todo el catálogo de la tienda, ordenado y actualizado en un solo lugar.
        </p>
      </div>

      {/* Formulario */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-stone-900">
              <StoreIcon className="h-8 w-8" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-stone-800 dark:text-stone-100">
              Catálogo de Precios
            </h1>
          </div>

          <h2 className="mb-1 hidden font-heading text-2xl font-bold text-stone-800 lg:block dark:text-stone-100">
            Bienvenido
          </h2>
          <p className="mb-6 hidden text-sm text-stone-500 lg:block dark:text-stone-400">
            Ingresá con tu cuenta para ver el catálogo.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Email
              </label>
              <div className="relative">
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
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-3 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500"
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Contraseña
              </label>
              <div className="relative">
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
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-3 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
