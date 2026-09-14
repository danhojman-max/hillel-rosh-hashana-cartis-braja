# Cartis Brajá — Rosh Hashaná 5787

Landing de una sola función, pensada para escanear con QR en el evento de
Rosh Hashaná de Hillel Argentina. El usuario elige un diseño de tarjeta, la
personaliza con un mensaje de Shaná Tová y la comparte por WhatsApp como
imagen.

No tiene backend ni base de datos: es HTML + CSS + JS puro, cada visita es
independiente y no queda nada guardado en ningún servidor.

## Cómo correrlo local

No hace falta instalar nada (no hay build step). Alcanza con levantar un
servidor estático en la carpeta del proyecto, por ejemplo:

```bash
python3 -m http.server 8000
```

Y abrir `http://localhost:8000` en el celular o en Chrome DevTools en modo
mobile. (No abrir `index.html` con doble click / `file://` directo, porque
algunos navegadores bloquean `fetch`/scripts locales bajo ese protocolo.)

## Dónde editar los textos predeterminados

Los mensajes que aparecen en el carrusel "Usar un mensaje predeterminado"
están en [`content/mensajes.js`](content/mensajes.js). Es un array de
strings — se puede agregar, borrar o reescribir cualquier línea sin tocar
el resto del código. Actualmente tiene los 5 mensajes definitivos.

## Dónde van los logos

Los logos ya están cargados en `assets/logo-hillel.png` y
`assets/logo-masa.png`. Si en algún momento hay que reemplazarlos, alcanza
con subir un archivo nuevo con el mismo nombre en la carpeta `assets/` — no
hace falta tocar el código. Si por algún motivo alguno de los dos archivos
faltara, el sitio muestra automáticamente un placeholder de texto ("HILLEL
ARGENTINA" / "MASA") en vez de un ícono de imagen rota.

## Dónde van las siluetas de fondo de cada tarjeta

Cada diseño usa como fondo un SVG con la silueta del emoji (jarra de
miel, manzana, Maguen David, copa de vino), en vez de un rectángulo plano
de color. Esos archivos van en `assets/shapes/`, con el nombre que pide
`shapeId` en `CARD_STYLES` (ver abajo):

- `assets/shapes/honey.svg` — Dulce Comienzo
- `assets/shapes/apple.svg` — Renovación
- `assets/shapes/star.svg` — Shaná Tová
- `assets/shapes/wine.svg` — Brindis

Recomendado: SVG con proporción 4:5 (igual que la tarjeta), silueta de un
solo color sólido (sin degradé ni sombra) ocupando ~85-90% del lienzo,
centrada, con una zona ancha y continua en el medio para que el mensaje
se lea bien encima.

**No hace falta medir nada a mano.** El sitio analiza cada SVG solo
(dibujándolo en un `<canvas>` oculto y mirando qué parte es opaca) para
calcular automáticamente cuál es la franja más ancha disponible y ahí
ubica el mensaje — ver `computeSafeZone()` en [`app.js`](app.js). Si el
mensaje es largo, además achica un poco la tipografía para que nunca se
salga de la silueta. Esto quiere decir que subir una silueta nueva (o
retocar una existente) no requiere tocar ningún número a mano: el ancho
del texto se recalcula solo.

## Cómo agregar o editar un diseño de tarjeta

Los estilos de tarjeta están definidos en el array `CARD_STYLES` al
principio de [`app.js`](app.js). Cada uno tiene: `label` (nombre visible),
`icon` (emoji, sin modificar), `shapeId` (qué archivo de
`assets/shapes/` usar de fondo), `bg` (color de referencia del diseño,
usado solo para decidir el color del título), `text` (color de texto) y
`accent` (color del título "Shaná Tová"). Para agregar un diseño nuevo,
alcanza con copiar un objeto del array, cambiar esos valores y subir el
SVG correspondiente.

## Decisiones de diseño e implementación

Resumen de las decisiones menores que tomé para no frenar el desarrollo,
por si querés ajustar algo después:

- **Tipografía**: Gotham no está disponible como web font gratuita. Usé
  **Poppins** (Google Fonts, pesos 700/800/900) como reemplazo — es la
  alternativa más parecida en peso y geometría a Gotham Bold/Black, que es
  como se usa en el poster de referencia.
- **Stack**: HTML + CSS + JS vanilla, sin bundler ni framework. Una sola
  página (`index.html`) con 4 "pasos" que se muestran/ocultan por JS
  (`goToStep()` en `app.js`), sin recargas. Esto prioriza velocidad de
  deploy y simplicidad de mantenimiento sobre sofisticación técnica, tal
  como se pidió.
- **Librería de imagen**: `html2canvas` vía CDN (cdnjs), sin instalarla
  como dependencia npm, para no necesitar Node/build step.
- **Siluetas embebidas, no `<img src>`**: la tarjeta final inserta el SVG
  de la silueta directo en el HTML (texto del archivo, insertado como
  `<div class="card-shape">{svg}</div>`), en vez de referenciarlo con
  `<img src="assets/shapes/...svg">`. Safari/iOS tiene un bug conocido
  donde `html2canvas` no captura bien imágenes SVG externas (la silueta
  sale en blanco o cortada al exportar, aunque se vea perfecta en
  pantalla) — insertar el SVG como parte del DOM evita ese problema por
  completo. La grilla de diseños (paso 2) sí sigue usando `<img>`
  normal, porque esa pantalla nunca se exporta como imagen.
- **Compartir**: se intenta primero `navigator.share` con el archivo PNG
  adjunto (funciona en la mayoría de los celulares modernos y abre
  directamente el selector de apps con WhatsApp). Si el navegador no
  soporta compartir archivos, se descarga la imagen automáticamente y se
  abre `wa.me` con un texto que avisa que hay que adjuntar la imagen
  descargada a mano.
- **4 diseños de tarjeta** (dentro del rango pedido de 3 a 5): Dulce
  Comienzo, Renovación, Shaná Tová y Brindis. El emoji de cada diseño se
  muestra tal cual (sin modificar), y lo que cambia es el **fondo de la
  tarjeta**: en vez de ser un rectángulo plano de color, es una silueta
  con la forma del emoji (ej. la tarjeta "Shaná Tová" tiene un fondo con
  forma de Maguen David). Las siluetas son archivos SVG diseñados a mano
  (no generados por código) en `assets/shapes/` — ver más abajo.
- **Mensaje predeterminado editable**: el texto que aparece en el
  carrusel se puede retocar a mano ahí mismo (es un `<textarea>`, no un
  texto fijo) antes de pasar a la vista previa. Si se navega a otro
  mensaje del carrusel con las flechas, la edición se pierde y se carga
  el texto original de ese otro mensaje — evita confusión sobre "qué
  mensaje es cuál".
- **Campos "Para" y "De"**: los dejé opcionales (placeholder, no
  obligatorios) porque frenar a alguien con un campo requerido en un flujo
  pensado para ser rápido en el celular iba en contra del objetivo del
  sitio.
- **Sin persistencia**: no hay `localStorage` ni nada que recuerde al
  usuario entre visitas — cada escaneo de QR arranca de cero, como se
  especificó.

## Deploy

- **Repo de GitHub**: https://github.com/danhojman-max/hillel-rosh-hashana-cartis-braja
- **Sitio en producción (Vercel)**: https://hillel-rosh-hashana-cartis-braja.vercel.app

El repo se creó y pusheó de forma automática con `gh`. Para el deploy en
Vercel hizo falta un solo paso manual de tu parte: iniciar sesión en Vercel
con "Continue with GitHub" (crear/loguear una cuenta es algo que no puedo
hacer en tu nombre). Una vez logueado, la importación del repo, la
configuración (preset "Other", sin build step) y el deploy se hicieron
automáticamente. Cada push a la rama `main` en GitHub va a re-deployar el
sitio solo.
