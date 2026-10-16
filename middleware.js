// Protege cada carpeta de cliente. Sin sesión válida, el visitante va a la pantalla de acceso
// de su carpeta (/<cliente>/acceso/), que es pública. La sesión es una cookie creada por /api/acceso.

import { next } from '@vercel/functions';
import { CLIENTES, nombreCookie, passwordDe, huella, iguales, leerCookie } from './lib/acceso.js';

export const config = { matcher: ['/vascardio', '/vascardio/:path*'] };

export default async function middleware(request) {
  const url = new URL(request.url);
  const cliente = url.pathname.split('/')[1];
  if (!CLIENTES.includes(cliente)) return next();

  // La pantalla de acceso y sus archivos son públicos.
  if (url.pathname.startsWith('/' + cliente + '/acceso')) return next();

  const password = passwordDe(cliente);
  if (password) {
    const esperado = await huella(cliente, password);
    if (iguales(leerCookie(request, nombreCookie(cliente)), esperado)) return next();
  }

  const acceso = new URL('/' + cliente + '/acceso/', url);
  acceso.searchParams.set('next', url.pathname + url.search);
  return new Response(null, {
    status: 302,
    headers: { Location: acceso.pathname + acceso.search, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }
  });
}
