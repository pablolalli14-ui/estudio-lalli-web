# Fichas de área

Cada `.json` de esta carpeta es una landing. `node generar.js <slug>` la escribe.

```
node generar.js alimentos          # escribe alimentos.html y engancha todo
node generar.js alimentos --dry    # muestra qué haría, sin escribir
node generar.js                    # lista las fichas disponibles
```

## Qué toca el generador

| Archivo | Qué le hace |
|---|---|
| `<slug>.html` | lo escribe entero desde `_plantilla/base.html` |
| `medicion.json` | agrega el área con sus etiquetas y su texto de WhatsApp |
| `sitemap.xml` | agrega la URL |
| `theme.js` | lo regenera desde `sitio.json` |
| `conversiones.js` | lo regenera desde `sitio.json` + `medicion.json` |

Correrlo dos veces no duplica nada: antes de insertar chequea si ya está.

`node generar.js --sitio` regenera solo los dos archivos compartidos, sin tocar
ninguna landing. Es lo que hay que correr después de cambiar un color o una
etiqueta de conversión.

## Los tres archivos de datos

| Archivo | Qué manda |
|---|---|
| `sitio.json` | dominio, marca, WhatsApp, IDs de GA4 y Ads, paleta, tipografías |
| `medicion.json` | qué etiqueta de conversión usa cada área y con qué texto saluda |
| `areas/<slug>.json` | el contenido de una landing |

**`theme.js` y `conversiones.js` no se editan a mano: se generan.** Llevan el
aviso en la cabecera. Si los tocás, el próximo `generar.js` te pisa el cambio.

## Levantar el kit en otra cuenta

Copiá el repo y cambiá `sitio.json` —dominio, marca, WhatsApp, los dos IDs de
medición, la paleta— y las fichas de `areas/`. Corré `node generar.js --sitio`
y después cada área. No queda ningún dato del estudio original escrito adentro
del código.

Lo único que sigue a mano es el logo del encabezado, que está partido en dos
para poder pintar el `&` con el color de acento.

## Sumar un área

1. Copiá `alimentos.json` con el nombre del slug nuevo.
2. Cambiá el contenido. Los arrays tienen largo fijo —3 síntesis, 4 servicios,
   3 pasos, 3 FAQ— porque la maqueta tiene esa cantidad de huecos.
3. `node generar.js <slug> --dry` para ver que pase la validación.
4. Creá las dos acciones de conversión en Google Ads y pegá sus Label en la
   ficha. Mientras digan `null` la landing mide contra la etiqueta legacy de
   Familia, que es mejor que no medir, pero no sirve para leer el área.
5. `node generar.js <slug>` y commit.

## El campo `area` y por qué importa

`area` es la clave con la que `conversiones.js` elige la etiqueta. `areaActual()`
la deduce **de la ruta**: busca el nombre del área adentro del path.

Por eso el generador **falla** si el slug no contiene el área. No es un capricho:
se probó con un slug desalineado y la landing quedó midiendo con la etiqueta
legacy y saludando con el texto genérico, sin un solo error en consola.

Dos landings pueden compartir área a propósito. `me-reclaman-alimentos` y
`acuerdo-alimentos-y-visitas` son ambas `area: "alimentos"`, porque el corte
entre actor y demandado se lee por ad group en Google Ads, no hace falta
duplicar acciones de conversión. Lo que sí cambia entre ellas es `wa_texto_ads`,
y eso lo resuelve `claveWa()` mirando la ruta.

Si de verdad necesitás un slug que no contenga el área, agregale la línea a
`areaActual()` en `conversiones.js` y poné `"area_fuera_de_ruta": true` en la
ficha. El generador te va a dejar seguir, avisando.

## Lo que se valida antes de escribir

- campos obligatorios presentes y no vacíos
- slug en minúsculas, números y guiones; área en minúsculas sin espacios
- los cuatro arrays con su largo exacto
- título ≤65 y descripción ≤160 caracteres, que es donde corta Google
- las etiquetas de conversión con forma `AW-<números>/<label>`
- que en ningún lado diga "gratis", "gratuito" ni "sin cargo": la consulta
  cuesta 1 JUS y ninguna landing puede prometer lo contrario
- que el slug contenga el área

## La plantilla

`_plantilla/base.html` no se escribe a mano. Sale de `alimentos.html` por
sustitución inversa, con `python3 _plantilla/derivar.py`. Por eso
`node generar.js alimentos` reproduce **byte a byte** el archivo que está en
producción — y esa igualdad es la prueba de que el generador no inventa nada.

Si rediseñás la landing base: tocá `alimentos.html`, corré `derivar.py`, y
verificá que `node generar.js alimentos` deje el archivo igual que antes.

Los marcadores que caen adentro de un bloque JSON-LD llevan el sufijo `|json`
y se escapan distinto. Sin eso, una comilla en una FAQ rompe el bloque entero
y Google deja de leer las preguntas, en silencio.
