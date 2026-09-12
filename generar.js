#!/usr/bin/env node
/**
 * Generador de landings por área.
 *
 *   node generar.js alimentos
 *   node generar.js alimentos --dry     (no escribe nada, solo muestra)
 *
 * Toma areas/<slug>.json, lo mete en _plantilla/base.html y escribe <slug>.html.
 * Además deja enganchada la medición y el sitemap, que son los tres archivos que
 * antes había que acordarse de tocar a mano — y que si te olvidabas, la landing
 * quedaba online midiendo en la etiqueta equivocada.
 *
 * ── Por qué así ────────────────────────────────────────────────────────────
 * La plantilla no se escribió a mano: sale de alimentos.html por sustitución
 * inversa (_plantilla/derivar.py). Eso hace que `node generar.js alimentos`
 * reproduzca byte a byte el archivo que está en producción, y esa igualdad es
 * la prueba de que el generador no inventa nada.
 *
 * Correrlo dos veces no duplica nada: antes de tocar conversiones.js o
 * sitemap.xml chequea si la entrada ya existe.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const { emitirTheme, emitirConversiones } = require('./_plantilla/emitir.js');

const leerJson = f => JSON.parse(fs.readFileSync(path.join(RAIZ, f), 'utf8'));
const SITIO = leerJson('sitio.json');

// ── Reglas que no se negocian (workflows/paso5_anuncios.md) ────────────────
// La consulta cuesta 1 JUS. Que una landing diga "gratis" en cualquier
// declinación es una promesa que el estudio no puede sostener.
const PROHIBIDAS = [/\bgratis\b/i, /\bgratuit/i, /\bsin cargo\b/i];

const rojo  = t => '\x1b[31m' + t + '\x1b[0m';
const verde = t => '\x1b[32m' + t + '\x1b[0m';
const gris  = t => '\x1b[90m' + t + '\x1b[0m';

function morir(msg) {
  console.error(rojo('\n  ✗ ' + msg) + '\n');
  process.exit(1);
}

// ── Validación de la ficha ─────────────────────────────────────────────────

const OBLIGATORIOS = ['slug', 'area', 'titulo', 'descripcion', 'h1', 'bajada',
                      'servicios_titulo', 'cierre_titulo', 'cierre_texto',
                      'wa_texto', 'wa_texto_ads'];

function validar(spec) {
  const fallas = [];

  OBLIGATORIOS.forEach(k => {
    if (!spec[k] || !String(spec[k]).trim()) fallas.push('falta ' + k);
  });

  if (!/^[a-z0-9-]+$/.test(spec.slug || '')) fallas.push('el slug solo admite minúsculas, números y guiones');
  if (!/^[a-z]+$/.test(spec.area || ''))     fallas.push('el area solo admite minúsculas sin espacios');

  [['sintesis', 3], ['servicios', 4], ['proceso', 3], ['faq', 3]].forEach(([k, n]) => {
    if (!Array.isArray(spec[k]) || spec[k].length !== n) {
      fallas.push(k + ' tiene que traer exactamente ' + n + ' entradas (la maqueta tiene ese número de huecos)');
    }
  });

  // Google corta la description a ~160 y el title a ~60 en el resultado de
  // búsqueda. Pasarse no rompe nada, pero lo que sobra no se lee.
  if (spec.descripcion && spec.descripcion.length > 160) {
    fallas.push('la descripción tiene ' + spec.descripcion.length + ' caracteres, Google corta en ~160');
  }
  if (spec.titulo && spec.titulo.length > 65) {
    fallas.push('el título tiene ' + spec.titulo.length + ' caracteres, Google corta en ~60');
  }

  // La conversión decide la puja de la campaña: una etiqueta mal copiada manda
  // los datos a otra acción y no hay forma de notarlo mirando la página.
  ['conversion_visita', 'conversion_whatsapp'].forEach(k => {
    if (spec[k] && !/^AW-\d+\/[\w-]+$/.test(spec[k])) {
      fallas.push(k + ' no tiene forma de etiqueta de Google Ads (AW-123456/AbCd...)');
    }
  });

  const texto = JSON.stringify(spec);
  PROHIBIDAS.forEach(re => {
    const m = texto.match(re);
    if (m) fallas.push('dice "' + m[0] + '": la consulta cuesta 1 JUS, ninguna landing puede prometer lo contrario');
  });

  // areaActual() decide el área mirando la RUTA. Si el slug no contiene el
  // nombre del área, cae en 'home' y la landing mide con la etiqueta legacy
  // y saluda con el texto genérico — sin un solo error en consola. Se probó:
  // pasa exactamente eso. Por eso es falla, no advertencia.
  if (spec.slug && spec.area && spec.slug.indexOf(spec.area) === -1) {
    if (spec.area_fuera_de_ruta) {
      console.warn(gris('  ojo  el slug no contiene el área, y la ficha lo declara a propósito.'));
      console.warn(gris('       Verificá que areaActual() en conversiones.js tenga su línea.'));
    } else {
      fallas.push('el slug "' + spec.slug + '" no contiene el área "' + spec.area + '": areaActual() ' +
                  'va a caer en home y la landing va a medir con la etiqueta equivocada, en silencio. ' +
                  'Corregí uno de los dos, o agregá "area_fuera_de_ruta": true a la ficha si ya le ' +
                  'pusiste su línea a areaActual().');
    }
  }

  if (fallas.length) {
    console.error(rojo('\n  La ficha no pasa la validación:'));
    fallas.forEach(f => console.error(rojo('    · ' + f)));
    console.error('');
    process.exit(1);
  }
}

// ── Sustitución ────────────────────────────────────────────────────────────

function valorDe(spec, ruta) {
  return ruta.split('.').reduce((o, k) => (o == null ? o : o[k]), spec);
}

function escaparHtml(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escaparJson(t) {
  // Adentro del JSON-LD el texto va entre comillas: una comilla o una barra
  // sin escapar rompe el bloque entero y Google deja de leer las FAQ.
  return JSON.stringify(String(t)).slice(1, -1);
}

function renderizar(plantilla, spec) {
  const derivados = Object.assign({}, spec, {
    sitio: SITIO,
    titulo_esc:   escaparHtml(spec.titulo),
    wa_texto_url: encodeURIComponent(spec.wa_texto)
  });

  const sinResolver = [];
  const html = plantilla.replace(/\{\{([a-z0-9._]+)(\|json|\|html)?\}\}/g, (todo, ruta, filtro) => {
    const v = valorDe(derivados, ruta);
    if (v == null) { sinResolver.push(ruta); return todo; }
    if (filtro === '|json') return escaparJson(v);
    if (filtro === '|html') return escaparHtml(v);
    return String(v);
  });

  if (sinResolver.length) {
    morir('la ficha no resuelve: ' + [...new Set(sinResolver)].join(', '));
  }
  return html;
}

// ── Enganches: medición y sitemap ──────────────────────────────────────────

function engancharMedicion(spec, dry) {
  // Se parchea medicion.json, no conversiones.js: meter mano en el JS por
  // coincidencia de texto se rompe el día que alguien reordena el archivo.
  // El JS se regenera entero desde el JSON, así que no puede desincronizarse.
  const p = path.join(RAIZ, 'medicion.json');
  const med = JSON.parse(fs.readFileSync(p, 'utf8'));

  if (med.areas.some(a => a.area === spec.area)) {
    return [gris('  ya estaba  medicion.json · ' + spec.area)];
  }

  med.areas.push({
    area:     spec.area,
    ruta:     spec.area,
    legacy:   spec.legacy || 'familia',
    visita:   spec.conversion_visita   || null,
    whatsapp: spec.conversion_whatsapp || null,
    texto_wa: spec.wa_texto_ads
  });

  if (!dry) fs.writeFileSync(p, JSON.stringify(med, null, 2) + '\n');
  return [verde('  agregado   medicion.json · ' + spec.area)];
}

function emitirCompartidos(dry) {
  const med = leerJson('medicion.json');
  const salidas = [
    ['theme.js',        emitirTheme(SITIO)],
    ['conversiones.js', emitirConversiones(SITIO, med)]
  ];
  return salidas.map(([nombre, contenido]) => {
    const destino = path.join(RAIZ, nombre);
    const igual = fs.existsSync(destino) && fs.readFileSync(destino, 'utf8') === contenido;
    if (!dry && !igual) fs.writeFileSync(destino, contenido);
    return (igual ? gris('  sin cambios ') : verde('  generado   ')) + nombre;
  });
}

function engancharSitemap(spec, dry) {
  const p = path.join(RAIZ, 'sitemap.xml');
  let s = fs.readFileSync(p, 'utf8');
  const loc = SITIO.dominio + '/' + spec.slug;

  if (s.indexOf('<loc>' + loc + '</loc>') !== -1) {
    return [gris('  ya estaba  sitemap.xml')];
  }
  const entrada = '  <url>\n    <loc>' + loc + '</loc>\n' +
                  '    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n';
  s = s.replace('</urlset>', entrada + '</urlset>');
  if (!dry) fs.writeFileSync(p, s);
  return [verde('  agregado   sitemap.xml')];
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const dry  = args.indexOf('--dry') !== -1;
  const slug = args.filter(a => a[0] !== '-')[0];

  if (args.indexOf('--sitio') !== -1) {
    console.log('');
    emitirCompartidos(dry).forEach(l => console.log(l));
    console.log('');
    return;
  }

  if (!slug) {
    const fichas = fs.readdirSync(path.join(RAIZ, 'areas'))
                     .filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    console.error('\n  uso:  node generar.js <slug> [--dry]\n');
    console.error('  fichas disponibles: ' + (fichas.join(', ') || '(ninguna)') + '\n');
    process.exit(1);
  }

  const fichaPath = path.join(RAIZ, 'areas', slug + '.json');
  if (!fs.existsSync(fichaPath)) morir('no existe areas/' + slug + '.json');

  let spec;
  try { spec = JSON.parse(fs.readFileSync(fichaPath, 'utf8')); }
  catch (e) { morir('areas/' + slug + '.json no es JSON válido: ' + e.message); }

  if (spec.slug !== slug) morir('el campo slug dice "' + spec.slug + '" pero el archivo se llama ' + slug + '.json');

  validar(spec);

  const plantilla = fs.readFileSync(path.join(RAIZ, '_plantilla', 'base.html'), 'utf8');
  const html = renderizar(plantilla, spec);

  const destino = path.join(RAIZ, slug + '.html');
  const existia = fs.existsSync(destino);
  const igual   = existia && fs.readFileSync(destino, 'utf8') === html;

  console.log('');
  if (!dry) fs.writeFileSync(destino, html);
  console.log((igual ? gris('  sin cambios ') : verde('  escrito     ')) + slug + '.html' +
              gris('  (' + html.length.toLocaleString('es-AR') + ' bytes)'));

  engancharMedicion(spec, dry).forEach(l => console.log(l));
  engancharSitemap(spec, dry).forEach(l => console.log(l));
  emitirCompartidos(dry).forEach(l => console.log(l));

  if (dry) console.log(gris('\n  --dry: no se escribió nada.'));
  console.log('');
  console.log(gris('  Falta a mano: crear las dos acciones de conversión en Google Ads'));
  console.log(gris('  y pegar sus Label en la ficha, si todavía dicen null.'));
  console.log('');
}

main();
