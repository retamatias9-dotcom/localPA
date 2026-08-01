import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function Navbar() {
  const { session, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-10 border-b transition-all ${
        scrolled
          ? 'border-stone-200 bg-white/80 shadow-sm backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80'
          : 'border-transparent bg-white dark:bg-stone-900'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-stone-900 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M6.5 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
              <path d="M17.5 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
              <path d="M3.5 13.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
              <path d="M20.5 13.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
              <path d="M12 22c-3 0-5.5-1.8-5.5-4.5C6.5 14.5 9 12 12 12s5.5 2.5 5.5 5.5c0 2.7-2.5 4.5-5.5 4.5Z" />
            </svg>
          </span>
          <span className="min-w-0 truncate font-heading text-base font-bold text-stone-800 sm:text-lg dark:text-stone-100">
            Catálogo de Precios
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="rounded-xl border border-stone-200 p-2 text-stone-700 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {session && (
            <>
              <span className="hidden text-sm text-stone-500 dark:text-stone-400 md:inline">
                {(session.user.user_metadata?.name as string | undefined) ?? session.user.email}
              </span>
              <button
                onClick={signOut}
                className="rounded-xl border border-stone-200 px-2.5 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 sm:px-3"
              >
                <span className="sm:hidden">Salir</span>
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
