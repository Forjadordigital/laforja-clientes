// Recibe el formulario de /<cliente>/acceso/, valida la contraseña y crea la sesión.

import { CLIENTES, DIAS_SESION, nombreCookie, passwordDe, huella, iguales, destinoSeguro } from '../lib/acceso.js';

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function redirigir(location, extra = {}) {
  return new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'no-store', ...extra } });
}

export async function POST(request) {
  let datos;
  try {
    datos = await request.formData();
  } catch {
    return new Response('Solicitud no válida', { status: 400 });
  }
  const cliente = String(datos.get('cliente') || '');
  if (!CLIENTES.includes(cliente)) return new Response('No encontrado', { status: 404 });

  const destino = destinoSeguro(cliente, String(datos.get('next') || ''));
  const volver = (error) => redirigir('/' + cliente + '/acceso/?error=' + error + '&next=' + encodeURIComponent(destino));

  const password = passwordDe(cliente);
  if (!password) return volver('config');

  const enviada = String(datos.get('password') || '');
  const ok = iguales(await huella(cliente, enviada), await huella(cliente, password));
  if (!ok) {
    await espera(600); // frena los intentos repetidos
    return volver('1');
  }

  const cookie = [
    nombreCookie(cliente) + '=' + (await huella(cliente, password)),
    'Path=/' + cliente,
    'Max-Age=' + DIAS_SESION * 24 * 60 * 60,
    'HttpOnly',
    'Secure',
    'SameSite=Lax'
  ].join('; ');
  return redirigir(destino, { 'Set-Cookie': cookie });
}

export function GET() {
  return redirigir('/');
}
