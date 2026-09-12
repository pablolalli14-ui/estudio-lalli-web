/**
 * Emisores de los dos archivos compartidos del sitio.
 *
 * theme.js y conversiones.js NO se editan a mano: se generan desde sitio.json
 * y medicion.json. Eso es lo que hace que el kit sirva en otra cuenta cambiando
 * dos archivos de datos en vez de buscar IDs desperdigados por el código.
 *
 * El orden de `areas` en medicion.json importa: areaActual() devuelve la
 * primera ruta que coincide, igual que el if/else que había antes.
 */
'use strict';

const q = s => JSON.stringify(String(s));

function emitirTheme(sitio) {
  const p = sitio.paleta;
  const fam = f => JSON.stringify(p[f], null, 6).replace(/\n/g, '\n    ');

  return `/**
 * Paleta del sitio — GENERADO, no editar a mano.
 *
 * Sale de sitio.json. Para cambiar un color se toca ese archivo y se corre
 * \`node generar.js --sitio\`.
 *
 * Este archivo hace dos cosas:
 *   1. arma el \`tailwind.config\`, para las clases (bg-navy-900, text-gold-400…)
 *   2. inyecta las mismas variables como custom properties, para el CSS suelto
 *      de cada página (gradientes, sombras, glows)
 *
 * Va en el <head>, síncrono y DESPUÉS del CDN de Tailwind. Sin \`defer\` ni
 * \`async\`: el parser tiene que frenarse acá para que el <style> exista antes
 * del primer pintado, o se ve un parpadeo sin color.
 */
(function () {
  'use strict';

  var PALETA = {
    pine: ${fam('pine')},
    clay: ${fam('clay')},
    cream: ${q(p.cream)},
    wa: ${q(p.wa)}
  };

  // Las claves de Tailwind siguen llamándose \`navy\` y \`gold\` porque hay cientos
  // de usos de esas clases repartidos en el markup y renombrarlas sería tocar
  // todo para no cambiar nada visible. \`pine\` y \`clay\` son los nombres buenos:
  // usarlos en lo nuevo.
  if (typeof tailwind !== 'undefined') {
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            navy: PALETA.pine,
            gold: PALETA.clay,
            pine: PALETA.pine,
            clay: PALETA.clay,
            cream: PALETA.cream,
            wa: PALETA.wa
          },
          fontFamily: {
            display: ${JSON.stringify(sitio.tipografias.display)},
            body: ${JSON.stringify(sitio.tipografias.body)}
          },
          letterSpacing: { tightest: '-0.04em', tighter: '-0.03em' }
        }
      }
    };
  }

  // De cada color salen dos variables: el hex, y la terna RGB suelta para poder
  // escribir \`rgb(var(--clay-400-rgb) / 0.28)\` donde antes había un rgba() con
  // los números escritos a mano.
  function terna(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ].join(' ');
  }

  var reglas = [];
  function agregar(nombre, hex) {
    reglas.push('--' + nombre + ': ' + hex + ';');
    reglas.push('--' + nombre + '-rgb: ' + terna(hex) + ';');
  }

  ['pine', 'clay'].forEach(function (familia) {
    Object.keys(PALETA[familia]).forEach(function (tono) {
      agregar(familia + '-' + tono, PALETA[familia][tono]);
    });
  });
  agregar('cream', PALETA.cream);
  agregar('wa', PALETA.wa);

  var estilo = document.createElement('style');
  estilo.setAttribute('data-theme', 'sitio');
  estilo.textContent = ':root {\\n  ' + reglas.join('\\n  ') + '\\n}';
  document.head.appendChild(estilo);
})();
`;
}

function emitirConversiones(sitio, med) {
  const anchoArea = Math.max(...med.areas.map(a => a.area.length), 4);
  const pad = (s, n) => String(s) + ' '.repeat(Math.max(0, n - String(s).length));

  const legacy = Object.keys(med.legacy)
    .map(k => `    ${pad(k + ':', 9)}${q(med.legacy[k])}`).join(',\n');

  const conv = med.areas.map(a =>
    `    ${pad(a.area + ':', anchoArea + 2)}{ visita: ${a.visita ? q(a.visita) : 'null'}` +
    `, whatsapp: ${a.whatsapp ? q(a.whatsapp) : 'null'}, legacy: LEGACY.${a.legacy} }`
  ).concat([
    `    ${pad('home:', anchoArea + 2)}{ visita: null, whatsapp: null, legacy: LEGACY.${med.home.legacy} }`
  ]).join(',\n');

  const rutas = med.areas.map(a =>
    `    if (p.indexOf(${q(a.ruta)}) !== -1) return ${q(a.area)};`).join('\n');

  const textos = med.areas.map(a => `    ${pad(a.area + ':', anchoArea + 2)}${q(a.texto_wa)}`)
    .concat(med.textos_por_ruta.map(t => `    ${pad(t.clave + ':', anchoArea + 2)}${q(t.texto)}`))
    .concat([`    ${pad('home:', anchoArea + 2)}${q(med.home.texto_wa)}`]).join(',\n');

  const clavesRuta = med.textos_por_ruta.map(t =>
    `    if (p.indexOf(${q(t.contiene)}) !== -1) return ${q(t.clave)};`).join('\n');

  return `/**
 * Medición de conversiones — GENERADO, no editar a mano.
 *
 * Sale de medicion.json. Para sumar un área o cambiar una etiqueta se toca ese
 * archivo y se corre \`node generar.js --sitio\`.
 *
 * Antes esto vivía copiado, idéntico, dentro de cada HTML: sumar un área eran
 * ocho ediciones del mismo mapa, y la copia que quedara sin actualizar mandaba
 * la conversión a la etiqueta equivocada — en silencio, porque gtag no se queja.
 *
 * Va en el <head>, DESPUÉS del bloque que define gtag() y corre los config.
 * No lleva defer ni async: el bloque ?wa=1 tiene que disparar la conversión
 * antes de que la página salte a WhatsApp.
 */
(function () {
  // Dos acciones por área:
  //   visita   → llegada a la landing. En Google Ads va como SECUNDARIA (observación).
  //   whatsapp → clic en cualquier CTA de WhatsApp. PRIMARIA: gobierna la puja.
  //
  // Mientras una etiqueta sea null se usa LEGACY, así que nada deja de medirse
  // durante la transición.
  var LEGACY = {
${legacy}
  };
  var CONV = {
${conv}
  };
  // El área sale de la RUTA, no del utm_campaign. Antes salía del UTM y caía en
  // 'familia' por defecto: Alimentos, Divorcio, Régimen y Sucesiones contaban
  // todos como Familia. La ruta es lo que efectivamente distingue el área y no
  // se pierde si el UTM se cae.
  function areaActual() {
    var p = (window.location.pathname || '').toLowerCase();
${rutas}
    return 'home';
  }
  function enviarConversion(evento, etiqueta) {
    var area = areaActual();
    var cfg = CONV[area] || CONV.home;
    // El fallback a LEGACY es SOLO para 'whatsapp'. 'visita' NUNCA cae en legacy:
    // si lo hiciera, cada carga de página entraría como conversión en la acción
    // que gobierna la puja, inflándola con tráfico que no pidió nada.
    var sendTo = cfg[evento] || (evento === 'whatsapp' ? cfg.legacy : null);
    if (!sendTo) return;
    gtag('event', 'conversion', {
      send_to: sendTo, event_category: 'lead', event_label: etiqueta || area
    });
  }
  // Clic en WhatsApp — la conversión que importa.
  function trackConversion(type) {
    enviarConversion('whatsapp', type);
    gtag('event', type, { event_category: 'lead' });
  }
  // Llegada a la landing — solo observación, para leer el embudo.
  function trackVisita() {
    var area = areaActual();
    enviarConversion('visita', 'visita_' + area);
    gtag('event', 'visita_landing', { event_category: 'lead', event_label: area });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackVisita);
  } else {
    trackVisita();
  }

  // ── WhatsApp directo desde el anuncio (?wa=1) ──────────────────────────
  // El sitelink del anuncio apunta a esta misma landing con ?wa=1: la conversión
  // se registra acá y recién después saltamos al chat. Un toque para el usuario,
  // medición intacta, y el destino del anuncio sigue siendo dominio propio
  // (Google rechaza sitelinks que apuntan a wa.me directo).
  var TEXTO_WA = {
${textos}
  };
  // Dos landings pueden compartir área a propósito -- el corte se lee por ad
  // group en Ads -- pero necesitan su propio saludo. Esto se evalúa ANTES que
  // el área.
  function claveWa() {
    var p = (window.location.pathname || '').toLowerCase();
${clavesRuta}
    return areaActual();
  }
  if (new URLSearchParams(window.location.search).get('wa') === '1') {
    trackConversion('whatsapp_ads_directo');
    // El salto espera 700 ms: gtag manda el hit por sendBeacon y sobrevive a la
    // navegación, pero si la red está lenta esto le da aire antes de irse.
    setTimeout(function () {
      window.location.replace('https://wa.me/${sitio.whatsapp}?text=' +
        encodeURIComponent(TEXTO_WA[claveWa()] || TEXTO_WA.home));
    }, 700);
  }

  // Los CTA del HTML llaman a trackConversion desde onclick, o sea desde el
  // ámbito global. Sin estas líneas el IIFE se las come y NINGÚN botón mide —
  // sin error en consola, porque onclick falla en silencio. También son las que
  // permiten probar a mano desde la consola del navegador.
  window.trackConversion = trackConversion;
  window.trackVisita = trackVisita;
})();
`;
}

module.exports = { emitirTheme, emitirConversiones };
