# La Forja Digital · Espacio de clientes

Sitio estático en Vercel para `clientes.laforjadigital.com`. Cada cliente vive en su carpeta y entra con una contraseña desde una pantalla de acceso propia.

## Cómo funciona el acceso

- `middleware.js`: sin sesión válida, redirige a `/<cliente>/acceso/` (pública).
- `/<cliente>/acceso/index.html`: pantalla de acceso con la marca del cliente; envía el formulario a `/api/acceso`.
- `api/acceso.js`: valida la contraseña y crea la cookie `lf_<cliente>` (HttpOnly, Secure, 30 días).
- `lib/acceso.js`: lógica compartida. La cookie es una huella SHA-256 de la contraseña: cambiar la contraseña en Vercel cierra todas las sesiones.

## Clientes

| Carpeta | Variable de entorno en Vercel |
|---|---|
| `/vascardio/` | `CLIENTE_VASCARDIO_PASSWORD` |

## Agregar un cliente

1. Crear la carpeta `/<cliente>/` con sus páginas y su `/<cliente>/acceso/` (copiar la de Vascardio y cambiar logo, textos y el campo oculto `cliente`).
2. Agregar el nombre a `CLIENTES` en `lib/acceso.js` y al `matcher` de `middleware.js`.
3. Crear `CLIENTE_<CLIENTE>_PASSWORD` en Vercel y volver a desplegar.

Todo el sitio responde con `noindex` y `robots.txt` bloquea a los buscadores.
