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
el resto del código. **Son textos de ejemplo (placeholders), no textos
oficiales de Hillel** — hay que reemplazarlos por los definitivos antes del
evento.

## Dónde van los logos

Cuando tengas los archivos reales, reemplazá:

- `assets/logo-hillel.png` — logo de Hillel Argentina
- `assets/logo-masa.png` — logo de Masá (Israel Journey)

Mientras esos archivos no existan, el sitio muestra automáticamente un
placeholder de texto ("HILLEL ARGENTINA" / "MASA") en vez de un ícono de
imagen rota, así que no hace falta hacer nada más: simplemente subir los
PNG con esos nombres exactos en la carpeta `assets/` y listo.

## Cómo agregar o editar un diseño de tarjeta

Los 5 estilos de tarjeta están definidos en el array `CARD_STYLES` al
principio de [`app.js`](app.js). Cada uno tiene: `label` (nombre visible),
`icon` (emoji), `bg` (color de fondo), `text` (color de texto) y `accent`
(color del título "Shaná Tová"). Para agregar un diseño nuevo, alcanza con
copiar un objeto del array y cambiar esos valores.

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
- **Compartir**: se intenta primero `navigator.share` con el archivo PNG
  adjunto (funciona en la mayoría de los celulares modernos y abre
  directamente el selector de apps con WhatsApp). Si el navegador no
  soporta compartir archivos, se descarga la imagen automáticamente y se
  abre `wa.me` con un texto que avisa que hay que adjuntar la imagen
  descargada a mano.
- **5 diseños de tarjeta** (dentro del rango pedido de 3 a 5): Dulce
  Comienzo (🍯), Renovación (🍎), Shaná Tová (✡️), Paz y Bendición (🕊️) y
  Brindis (🍷) — cada uno combina un color sólido de la paleta del poster
  con un emoji como ícono central, siguiendo la lógica de bloques de color
  + ícono simple de la referencia visual.
- **Campos "Para" y "De"**: los dejé opcionales (placeholder, no
  obligatorios) porque frenar a alguien con un campo requerido en un flujo
  pensado para ser rápido en el celular iba en contra del objetivo del
  sitio.
- **Sin persistencia**: no hay `localStorage` ni nada que recuerde al
  usuario entre visitas — cada escaneo de QR arranca de cero, como se
  especificó.

## Deploy

- **Repo de GitHub**: creado y pusheado automáticamente.
- **Vercel**: ver la sección "Estado del deploy" que se actualiza al pie
  de este README, o preguntame si necesitás el link.

Cualquier paso del deploy que haya requerido tu intervención (login, pago,
autorización de OAuth) está documentado ahí también.
