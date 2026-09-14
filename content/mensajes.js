// Mensajes predeterminados del carrusel "Usar un mensaje predeterminado".
//
// Cómo editar: cada elemento del array es un mensaje que aparece en el
// carrusel del paso "Personalizar". Podés agregar, borrar o editar
// líneas libremente — no hace falta tocar el resto del código.
// (La persona que arma la tarjeta también puede retocar el texto elegido
// a mano antes de compartir, desde el mismo carrusel.)

const MENSAJES_PREDETERMINADOS = [
  "Ojalá que este nuevo año que empieza venga con muchos motivos para sonreír y ser feliz! Que sea un año compartido juntos, donde vivamos grandes momentos ¡Shana Tová!",
  "Te mando este mensaje porque te extraño: Deseo que sea para vos un año hermoso, lleno de cosas lindas para vos y la gente que querés ¡Ojalá sea un año en el que nos veamos más seguido!",
  "En este Rosh Hashaná quiero desearte un año de renovación, paz, lindos deseos, nuevas alegrías, y ojalá lleno de buenas noticias ¡Que tengas un nuevo año hermoso!",
  "Shaná Tová Umetuká — que este 5787 venga cargado de cosas buenas para tu vida, para vos y para los tuyos ¡Ojalá sea un año que nos encuentre juntos nuevamente!",
  "Pensé en vos para empezar el año nuevo, porque te quiero y quiero desearte que tengas un año dulce, sano y lleno de cosas lindas ¡Te mando un abrazo y un beso gigante! ¡Shaná Tová!",
];

// Se expone como variable global para poder usarla desde app.js sin necesidad
// de un bundler (el sitio es HTML + JS plano, sin build step).
window.MENSAJES_PREDETERMINADOS = MENSAJES_PREDETERMINADOS;
