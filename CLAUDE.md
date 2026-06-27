# Estudio Jurídico Lalli & Asoc — Brand Kit de referencia

Usá este archivo como contexto en cada tarea relacionada con el estudio.
Antes de generar copy, diseño, código o estrategia, revisá esta guía.

---

## El proyecto

Sitio web de una sola página (`index.html`) para el Estudio Jurídico Lalli & Asociados.
Stack: HTML estático · Tailwind CSS (CDN) · vanilla JS.
Sin build pipeline. Sin framework. Sin archivos CSS/JS separados.

**Dominio objetivo:** `estudiollalli.com.ar`
**Analytics:** Google Analytics 4 — ID `G-J12SDZEF9B`
**Google Ads:** `AW-17938773454`

---

## Identidad

| Campo | Valor |
|-------|-------|
| Nombre completo | Estudio Jurídico Lalli & Asociados |
| Nombre corto | Lalli & Asoc |
| Tagline | Especialista en derecho penal y de familia |
| Profesional | Pablo Jesús Lalli |
| Matrícula | Colegio de Abogados del Departamento Judicial de Quilmes |
| Dirección | Av. Eva Perón 6640, B1888, Florencio Varela, Buenos Aires |
| Teléfono / WhatsApp | +54 9 11 6516-5861 |
| Email | pablo.lalli.14@gmail.com |
| Instagram | @pablo.j.lalli |
| Modalidad | Presencial y virtual |

---

## Sistema de color

```
Navy 950  #060E1C  → fondo principal del sitio (bg-texture)
Navy 900  #0D1B2A  → fondo de secciones alternadas (bg-section)
Navy 800  #14253D  → superficie de cards
Navy 700  #1C3256  → bordes y profundidad
Gold 400  #D4A843  → acento principal, iconos, chevrons, stat numbers
Gold 300  #E8CC7A  → acento suave, hover states
Gold 500  #B8962E  → acento oscuro, gradientes de botones
Cream     #F4EFE6  → texto principal sobre oscuro, superficies claras
Text      #E8E8E8  → cuerpo de texto
WhatsApp  #25D366  → botón CTA WhatsApp únicamente
```

**Versión light (para papel, documentos, flyers):**
Fondo `#F4EFE6` · Texto `#060E1C` · Acento `#D4A843`.
Nunca blanco puro — pierde la sofisticación del sistema.

---

## Tipografía

| Uso | Fuente | Pesos |
|-----|--------|-------|
| Títulos / headings / números destacados | Playfair Display (serif) | 400, 600, 700, 400 italic |
| Cuerpo / UI / botones / etiquetas | Outfit (sans-serif) | 300, 400, 500, 600, 700 |

**Reglas:**
- Letter-spacing negativo en títulos grandes: `-0.03em` a `-0.04em`
- Subtítulos de categoría: Outfit · uppercase · `tracking-widest` · XS · color gold
- Labels/tags: Outfit · uppercase · `tracking-widest` · `0.7rem` · gold con baja opacidad

---

## Logo

Balanza de la justicia dorada, centrada, sobre fondo navy oscuro.
"ESTUDIO JURÍDICO" en serif pequeño arriba. "Lalli & Asoc" en serif grande.

**Versiones que existen / se necesitan:**
- Completo (actual JPG): header web, presentaciones, membrete
- Isotipo solo (balanza): favicon, avatar redes, watermark
- Sobre fondo claro: documentos impresos, papel membretado
- Monocromático dorado: sobre fotografías

**Reglas:**
- No deformar · No cambiar el gold · No sobre fondos de bajo contraste
- No agregar sombras extras · Siempre respetar el espacio libre alrededor

---

## Voz y tono

**Cinco palabras que definen la voz:**
`honesto · directo · cercano · sin vueltas · seguro`

**Reglas de tono:**
1. Siempre "vos" — nunca "usted" (el público es bonaerense/rioplatense)
2. Desmitificar siempre: si algo no es tan simple como lo venden, decirlo
3. Primera persona de Pablo cuando corresponde ("Mi recomendación personal...")
4. Dar contexto antes de dar la respuesta concreta — nunca responder en el aire
5. Tono de par a par, nunca de especialista condescendiente
6. Ironía suave permitida. Humor que reste seriedad: prohibido.
7. Admitir la complejidad sin generar pánico

**Frases que definen la marca (no cambiar, son sello):**
- *"Tu voluntad alcanza."*
- *"Actuá rápido: las primeras horas son decisivas."*
- *"Siempre dentro de un rango claro desde el primer momento. Por escrito."*
- *"El divorcio 'express' es un nombre que el marketing decidió darle..."*

**No hacer:**
- Usar jerga jurídica sin explicar
- Simplificar procesos que no son simples
- Copy genérico de "abogado confiable" sin sustancia

---

## Áreas de práctica

1. **Familia y Sucesiones** — cuota alimentaria, divorcio, guarda, sucesiones
2. **Penal** — defensa penal, IPP, excarcelación, detención
3. **Laboral** — consulta gratuita
4. **Civil** — daños, contratos, etc.

---

## Posicionamiento y SEO

**Propuesta de valor central:**
> Lalli & Asoc es el estudio de referencia en el sur del GBA para quienes necesitan un abogado que explica sin vender, cobra sin sorpresas y actúa sin demoras.

**Público objetivo:**
- Personas en conflicto familiar (divorcio, alimentos)
- Familiares de detenidos sin orientación
- Clase media del sur del GBA: Florencio Varela, Quilmes, Berazategui, Almirante Brown

**Keywords primarias (local, alta intención):**
- `abogado Florencio Varela`
- `abogado penal Florencio Varela`
- `abogado familia Buenos Aires sur`
- `abogado divorcio Quilmes`
- `cuota alimentaria abogado`
- `excarcelación urgente Buenos Aires`

**Keywords de contenido (FAQ, blog, redes):**
- "cuánto corresponde de cuota alimentaria"
- "puedo divorciarme sin que el otro quiera argentina"
- "qué es una IPP"
- "cuánto cuesta un abogado en argentina"
- "qué hacer si detienen a un familiar"

**SEO técnico ya implementado:**
- ✅ Schema markup JSON-LD (LegalService + LocalBusiness)
- ✅ Open Graph tags (WhatsApp/redes preview)
- ✅ `<title>` optimizado para búsqueda local
- ✅ Meta description accionable con keywords
- ✅ Sección FAQ con preguntas reales (rich snippets)
- ⬜ Google Business Profile (completar manualmente)
- ⬜ Imágenes en formato WebP (optimización futura)
- ⬜ Reseñas en Google Maps (pedir a clientes)

---

## Componentes clave del sitio

| Clase CSS | Uso |
|-----------|-----|
| `.card` | Tarjetas con gradiente navy, borde gold, efecto spotlight hover |
| `.btn-wa` | CTA WhatsApp — verde, solo para ese canal |
| `.btn-gold` | CTA principal — gradiente gold |
| `.btn-outline` | CTA secundario — borde gold transparente |
| `.tag` | Etiqueta pill pequeña con gold |
| `.stat-num` | Números destacados — Playfair Display, gold, clamp responsive |
| `.fade-up` | Animación scroll reveal — opacity + translateY |
| `.fade-in` | Animación scroll reveal — solo opacity |
| `.bg-texture` | Fondo principal con noise SVG y gradientes |
| `.bg-section` | Fondo de secciones alternadas |
| `.faq-trigger` | Botón acordeón FAQ |
| `.faq-panel` | Panel acordeón FAQ con max-height animado |

**IDs de sección:**
`#areas` · `#nosotros` · `#faq` · `#contacto`

---

## Conversiones y tracking

```js
// Llamar en cada CTA de WhatsApp
trackConversion('whatsapp_hero')
trackConversion('whatsapp_contact')
trackConversion('whatsapp_footer')
trackConversion('whatsapp_sticky')
```

Cada conversión va a Google Analytics 4 y Google Ads.
El `utm_campaign=penal` redirige a una etiqueta de conversión diferente.

---

## Ramas de desarrollo

- Rama de desarrollo: `claude/landing-page-faq-fx4zvk`
- Siempre desarrollar en la rama indicada, nunca pushear a main sin confirmación.
