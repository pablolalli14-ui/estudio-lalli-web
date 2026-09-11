# -*- coding: utf-8 -*-
"""Deriva _plantilla/base.html desde alimentos.html por sustitucion inversa.

Que la plantilla SALGA del archivo que ya funciona, en vez de escribirse a
mano, es lo que garantiza que el generador reproduzca exactamente lo que hoy
esta en produccion. Si algun valor de la ficha no aparece en el HTML, falla
aca y no mas tarde.

Se corre una sola vez, o de nuevo si se rehace el diseno de la landing base.
El uso diario es generar.js, no esto.
"""
import io, json, re, urllib.parse

spec = json.load(io.open('areas/alimentos.json', encoding='utf-8'))
s = io.open('alimentos.html', encoding='utf-8').read()

reemplazos = []

def add(txt, marcador, minimo=1):
    reemplazos.append((txt, '{{' + marcador + '}}', minimo))

for i, sv in enumerate(spec['servicios']):
    add(sv['titulo'], 'servicios.%d.titulo' % i)
    add(sv['texto'],  'servicios.%d.texto' % i)
for i, pr in enumerate(spec['proceso']):
    add(pr['titulo'], 'proceso.%d.titulo' % i)
    add(pr['texto'],  'proceso.%d.texto' % i)
for i, fq in enumerate(spec['faq']):
    add(fq['pregunta'],  'faq.%d.pregunta' % i,  2)   # visible + JSON-LD
    add(fq['respuesta'], 'faq.%d.respuesta' % i, 2)
for i, si in enumerate(spec['sintesis']):
    add(si, 'sintesis.%d' % i)

add(spec['descripcion'], 'descripcion', 4)            # meta + og + twitter + JSON-LD
add(spec['titulo'].replace('&', '&amp;'), 'titulo_esc', 2)
add(spec['titulo'], 'titulo')
add(spec['bajada'], 'bajada')
add(spec['h1'], 'h1')
add(spec['servicios_titulo'], 'servicios_titulo')
add(spec['cierre_titulo'], 'cierre_titulo')
add(spec['cierre_texto'], 'cierre_texto')
add(urllib.parse.quote(spec['wa_texto'], safe="!~*'()."), 'wa_texto_url', 5)

# De mayor a menor longitud. Sin esto, "Reclamo de cuota alimentaria" -- que es
# titulo de un servicio Y el arranque de la meta description -- entra primero y
# parte a la description por la mitad, que fue exactamente lo que paso.
reemplazos.sort(key=lambda r: len(r[0]), reverse=True)

faltantes = []
for txt, marcador, minimo in reemplazos:
    n = s.count(txt)
    if n < minimo:
        faltantes.append('%-26s esperaba >=%d, hay %d  :: %s' % (marcador, minimo, n, txt[:58]))
    s = s.replace(txt, marcador)

# Estos van por patron: 'alimentos' aparece tambien adentro de frases y
# reemplazarlo a secas destruiria el contenido.
s, n_track = re.subn(r'whatsapp_' + re.escape(spec['area']) + r'_', 'whatsapp_{{area}}_', s)
s, n_url   = re.subn(r'(https://estudio-lalli-web\.vercel\.app)/' + re.escape(spec['slug']) + r'(?=["\s])',
                     r'\1/{{slug}}', s)

if faltantes:
    print('NO SE PUDO DERIVAR:')
    for f in faltantes: print('  ' + f)
    raise SystemExit(1)

# Los marcadores que caen adentro de un bloque JSON-LD necesitan escape propio:
# ahi el texto va entre comillas, y una comilla o una barra sin escapar rompe el
# bloque entero -- Google deja de leer las FAQ y no avisa. Se los marca con |json
# para que generar.js sepa tratarlos distinto.
def marcar_json(m):
    return re.sub(r'\{\{([a-z0-9._]+)\}\}', r'{{\1|json}}', m.group(0))

s = re.sub(r'<script type="application/ld\+json">.*?</script>', marcar_json, s, flags=re.S)

io.open('_plantilla/base.html', 'w', encoding='utf-8').write(s)
print('plantilla escrita  ·  track: %d  ·  urls: %d  ·  marcadores distintos: %d' %
      (n_track, n_url, len(set(re.findall(r'\{\{[a-z0-9._]+\}\}', s)))))
