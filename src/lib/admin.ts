import type { Session } from '@supabase/supabase-js';

// Usuarios con acceso al panel de administración (ventas y stock).
// Se configura por instalación en VITE_ADMIN_EMAILS, separando por comas, para
// que entregar la app a un cliente no requiera tocar código.
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS ?? 'retamatias9@gmail.com')
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(session: Session | null): boolean {
  const email = session?.user.email?.toLowerCase();
  return Boolean(email && ADMIN_EMAILS.includes(email));
}
