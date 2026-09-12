/**
 * Paleta del sitio — GENERADO, no editar a mano.
 *
 * Sale de sitio.json. Para cambiar un color se toca ese archivo y se corre
 * `node generar.js --sitio`.
 *
 * Este archivo hace dos cosas:
 *   1. arma el `tailwind.config`, para las clases (bg-navy-900, text-gold-400…)
 *   2. inyecta las mismas variables como custom properties, para el CSS suelto
 *      de cada página (gradientes, sombras, glows)
 *
 * Va en el <head>, síncrono y DESPUÉS del CDN de Tailwind. Sin `defer` ni
 * `async`: el parser tiene que frenarse acá para que el <style> exista antes
 * del primer pintado, o se ve un parpadeo sin color.
 */
(function () {
  'use strict';

  var PALETA = {
    pine: {
          "600": "#2F6150",
          "700": "#234A3D",
          "800": "#17332A",
          "900": "#10241D",
          "950": "#0A1813"
    },
    clay: {
          "300": "#EDB08A",
          "400": "#D98A5F",
          "500": "#C06F45",
          "600": "#9E5836"
    },
    cream: "#F2EDE3",
    wa: "#25D366"
  };

  // Las claves de Tailwind siguen llamándose `navy` y `gold` porque hay cientos
  // de usos de esas clases repartidos en el markup y renombrarlas sería tocar
  // todo para no cambiar nada visible. `pine` y `clay` son los nombres buenos:
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
            display: ["Fraunces","Georgia","serif"],
            body: ["Public Sans","system-ui","sans-serif"]
          },
          letterSpacing: { tightest: '-0.04em', tighter: '-0.03em' }
        }
      }
    };
  }

  // De cada color salen dos variables: el hex, y la terna RGB suelta para poder
  // escribir `rgb(var(--clay-400-rgb) / 0.28)` donde antes había un rgba() con
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
  estilo.textContent = ':root {\n  ' + reglas.join('\n  ') + '\n}';
  document.head.appendChild(estilo);
})();
