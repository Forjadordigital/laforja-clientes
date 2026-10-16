// Protege cada carpeta de cliente con usuario y contraseña (Basic Auth).
// Cada cliente tiene su variable de entorno en Vercel: CLIENTE_<CARPETA>_PASSWORD (ej. CLIENTE_VASCARDIO_PASSWORD).
// El usuario es el nombre de la carpeta en minúsculas (ej. vascardio). Sin variable configurada, la carpeta queda cerrada.

import { next } from '@vercel/functions';

export const config = { matcher: ['/vascardio', '/vascardio/:path*'] };

const CLIENTES = ['vascardio'];

export default function middleware(request) {
  const url = new URL(request.url);
  const cliente = url.pathname.split('/')[1];
  if (!CLIENTES.includes(cliente)) return next();

  const esperado = process.env['CLIENTE_' + cliente.toUpperCase() + '_PASSWORD'];
  const header = request.headers.get('authorization') || '';
  if (esperado && header.startsWith('Basic ')) {
    try {
      const [user, ...rest] = atob(header.slice(6)).split(':');
      if (user === cliente && rest.join(':') === esperado) return next();
    } catch (e) { /* credenciales mal formadas: se piden de nuevo */ }
  }
  return new Response('Esta propuesta es privada. Ingrese el usuario y la contraseña que le enviamos.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Propuesta ' + cliente + '", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow'
    }
  });
}
