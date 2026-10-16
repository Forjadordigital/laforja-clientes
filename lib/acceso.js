// Lógica compartida del acceso por contraseña de cada cliente.
// La contraseña vive en Vercel como CLIENTE_<CARPETA>_PASSWORD (ej. CLIENTE_VASCARDIO_PASSWORD).
// La cookie guarda una huella SHA-256 de la contraseña: si la contraseña cambia, todas las sesiones caducan.

export const CLIENTES = ['vascardio'];
export const DIAS_SESION = 30;

export function nombreCookie(cliente) {
  return 'lf_' + cliente;
}

export function passwordDe(cliente) {
  return process.env['CLIENTE_' + cliente.toUpperCase() + '_PASSWORD'] || '';
}

export async function huella(cliente, password) {
  const datos = new TextEncoder().encode('laforja:' + cliente + ':' + password);
  const hash = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function iguales(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function leerCookie(request, nombre) {
  const header = request.headers.get('cookie') || '';
  for (const parte of header.split(';')) {
    const [k, ...v] = parte.trim().split('=');
    if (k === nombre) return decodeURIComponent(v.join('='));
  }
  return '';
}

export function destinoSeguro(cliente, next) {
  const base = '/' + cliente + '/';
  if (typeof next !== 'string' || !next.startsWith('/' + cliente) || next.includes('//') || next.includes('\\')) return base;
  if (next.startsWith(base + 'acceso')) return base;
  return next;
}
