# La Forja Digital · Espacio de clientes

Sitio estático en Vercel para `clientes.laforjadigital.com`. Cada cliente vive en su carpeta y está protegido con usuario y contraseña por `middleware.js`.

## Clientes

| Carpeta | Usuario | Variable de entorno en Vercel |
|---|---|---|
| `/vascardio/` | `vascardio` | `CLIENTE_VASCARDIO_PASSWORD` |

## Agregar un cliente

1. Crear la carpeta `/<cliente>/` con sus páginas.
2. Agregar el nombre a `CLIENTES` y al `matcher` en `middleware.js`.
3. Crear la variable `CLIENTE_<CLIENTE>_PASSWORD` en Vercel y volver a publicar.

Todo el sitio responde con `noindex` y `robots.txt` bloquea a los buscadores.
