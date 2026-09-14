// TEXTOS DE EJEMPLO — reemplazar por los definitivos antes del evento.
// Estos NO son textos oficiales de Hillel, son placeholders para que el sitio
// funcione de punta a punta mientras se define el copy final.
//
// Cómo editar: cada elemento del array es un mensaje predeterminado que
// aparece en el dropdown/carrusel del paso "Personalizar". Podés agregar,
// borrar o editar líneas libremente — no hace falta tocar el resto del código.

const MENSAJES_PREDETERMINADOS = [
  "Que este nuevo año te traga salud, alegría y muchos motivos para sonreír. ¡Shaná Tová!",
  "Que sea un año dulce como la miel y lleno de bendiciones para vos y los tuyos.",
  "En este Rosh Hashaná quiero desearte un año de renovación, paz y muchas alegrías.",
  "Shaná Tová Umetuká — que este 5787 venga cargado de cosas buenas para tu vida.",
  "Que el sonido del shofar te acompañe hacia un año de crecimiento y bienestar.",
  "Pensé en vos para empezar el año nuevo. ¡Que sea dulce, sano y lleno de bendiciones!",
];

// Se expone como variable global para poder usarla desde app.js sin necesidad
// de un bundler (el sitio es HTML + JS plano, sin build step).
window.MENSAJES_PREDETERMINADOS = MENSAJES_PREDETERMINADOS;
