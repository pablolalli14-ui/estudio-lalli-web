/**
 * Medición de conversiones — ÚNICA FUENTE DE VERDAD.
 *
 * Este bloque vivía copiado, idéntico, dentro de los 8 HTML de landing. Eso
 * significa que sumar un área nueva eran 8 ediciones del mismo mapa, y que
 * cualquiera que quedara sin actualizar mandaba la conversión a la etiqueta
 * equivocada — en silencio, porque gtag no se queja.
 *
 * Va en el <head>, DESPUÉS del bloque que define gtag() y corre los config.
 * No lleva defer ni async: el bloque ?wa=1 de abajo tiene que disparar la
 * conversión antes de que la página salte a WhatsApp.
 *
 * PARA SUMAR UN ÁREA: una entrada en CONV, una en TEXTO_WA, y si la ruta no
 * contiene el nombre del área, una línea en areaActual() o en claveWa().
 */
(function () {
  // ── Conversiones por área ──────────────────────────────────────────────
  // Reescrito 09-2026. Antes esto elegía la etiqueta por utm_campaign y caía en
  // 'familia' por defecto: Alimentos, Divorcio, Régimen y Sucesiones contaban todos
  // como Familia. Ahora decide por la RUTA de la página, que es lo que efectivamente
  // distingue el área y no se pierde si el UTM se cae.
  //
  // Dos acciones por área:
  //   visita   → llegada a la landing. En Google Ads va como SECUNDARIA (observación).
  //   whatsapp → clic en cualquier CTA de WhatsApp. PRIMARIA: es la que gobierna la puja.
  //
  // PENDIENTE: crear las acciones en Google Ads y pegar acá su Label. Mientras el valor
  // sea null se usa LEGACY, así que nada deja de medirse durante la transición.
  var LEGACY = {
    familia: 'AW-17938773454/VkroCNX54LAcEM7r7-lC',
    penal:   'AW-17938773454/rvIZCPy0tbIcEM7r7-lC'
  };
  var CONV = {
    alimentos: { visita: 'AW-17938773454/1AnqCMm9ovIcEM7r7-lC', whatsapp: 'AW-17938773454/80xzCLrsofIcEM7r7-lC', legacy: LEGACY.familia },
    divorcio:  { visita: null, whatsapp: null, legacy: LEGACY.familia },
    regimen:   { visita: null, whatsapp: null, legacy: LEGACY.familia },
    sucesiones:{ visita: null, whatsapp: null, legacy: LEGACY.familia },
    penal:     { visita: null, whatsapp: null, legacy: LEGACY.penal },
    home:      { visita: null, whatsapp: null, legacy: LEGACY.familia }
  };
  function areaActual() {
    var p = (window.location.pathname || '').toLowerCase();
    if (p.indexOf('alimentos') !== -1) return 'alimentos';
    if (p.indexOf('divorcio') !== -1) return 'divorcio';
    if (p.indexOf('regimen') !== -1) return 'regimen';
    if (p.indexOf('sucesiones') !== -1) return 'sucesiones';
    if (p.indexOf('penal') !== -1) return 'penal';
    return 'home';
  }
  function enviarConversion(evento, etiqueta) {
    var area = areaActual();
    var cfg = CONV[area] || CONV.home;
    // El fallback a LEGACY es SOLO para 'whatsapp': preserva lo que ya se venía midiendo
    // mientras no estén cargadas las etiquetas nuevas. 'visita' NUNCA cae en legacy —
    // si lo hiciera, cada carga de página entraría como conversión en la acción que hoy
    // gobierna la puja, inflándola con tráfico que no pidió nada.
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
  // El sitelink del anuncio apunta a esta misma landing con ?wa=1: la
  // conversión se registra acá y recién después saltamos al chat. Un toque
  // para el usuario, medición intacta, y el destino del anuncio sigue siendo
  // dominio propio (Google rechaza sitelinks que apuntan a wa.me directo).
  var TEXTO_WA = {
    alimentos:  'Hola, quisiera consultar por una cuota alimentaria',
    divorcio:   'Hola, los contacto por el anuncio de divorcios en Florencio Varela',
    regimen:    'Hola, los contacto por el anuncio de régimen de comunicación',
    sucesiones: 'Hola, los contacto por el anuncio de sucesiones en Florencio Varela',
    penal:      'Hola, los contacto por el anuncio penal en Florencio Varela',
    home:       'Hola, los contacto por el anuncio en Florencio Varela',
    reclaman:   'Hola, me reclaman alimentos y los contacto por el anuncio',
    acuerdo:    'Hola, quiero pagar la cuota y ver a mis hijos, los contacto por el anuncio'
  };
  // Las dos landings del lado demandado caen dentro del area 'alimentos' para la
  // conversion -- eso es deliberado, el corte por lado se lee por ad group en Ads --
  // pero necesitan su propio texto de WhatsApp. La clave sale de la ruta.
  function claveWa() {
    var p = (window.location.pathname || '').toLowerCase();
    if (p.indexOf('me-reclaman') !== -1) return 'reclaman';
    if (p.indexOf('acuerdo-alimentos') !== -1) return 'acuerdo';
    return areaActual();
  }
  if (new URLSearchParams(window.location.search).get('wa') === '1') {
    trackConversion('whatsapp_ads_directo');
    // El salto espera 700 ms: gtag manda el hit por sendBeacon y sobrevive a
    // la navegación, pero si la red está lenta esto le da aire antes de irse.
    setTimeout(function () {
      window.location.replace('https://wa.me/5491165165861?text=' +
        encodeURIComponent(TEXTO_WA[claveWa()] || TEXTO_WA.home));
    }, 700);
  }

  // Los CTA del HTML llaman a trackConversion desde onclick, o sea desde el
  // ámbito global. Sin esta línea el IIFE se la come y NINGÚN botón mide —
  // sin error en consola, porque onclick falla en silencio. También es la que
  // permite probar a mano desde la consola del navegador.
  window.trackConversion = trackConversion;
  window.trackVisita = trackVisita;
})();
