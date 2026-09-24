# estudio-lalli-web — sitio público del estudio

Sitio estático del estudio, desplegado en Vercel desde `main`. **Este repo es público:** nada de
datos de clientes, credenciales ni números internos del negocio.

## Cómo está armado

- Una landing por área (`alimentos.html`, `familia.html`, …). **No se escriben a mano:**
  `node generar.js <slug>` toma `areas/<slug>.json`, lo mete en `_plantilla/base.html` y
  engancha la medición (`conversiones.js`, `medicion.json`) y el `sitemap.xml`.
- `node generar.js <slug> --dry` muestra el resultado sin escribir. Usarlo antes de cada cambio.
- `sitio.json` tiene los datos comunes (contacto, etc.).

## Ojo: `main` es producción

Lo que llega a `main` queda online en minutos. Antes de llevar un cambio: `--dry`, y abrir la
página generada para verla.

## Git: todo termina en `main`, sin PR

Pablo trabaja solo: no hay quien revise un PR, y los PR que quedaban abiertos eran trabajo
perdido. Lo que no está en `main` no existe. Por eso:

1. Se trabaja en la rama de la sesión.
2. Al cerrar cada tema —y **siempre** antes de terminar la sesión— se lleva a `main`:
   ```bash
   git fetch origin main && git merge origin/main   # sólo si main avanzó
   git push origin HEAD:main                        # fast-forward; nunca --force
   git push -u origin HEAD                          # la rama queda igual a main
   ```
3. La respuesta dice qué quedó en `main`, para que sea revisable y reversible (`git revert`).
4. **No se abren PR** salvo que Pablo lo pida. **Nunca** force-push a `main`.
5. Si algo no está listo para `main`, se dice explícitamente y por qué. El silencio no es opción.
