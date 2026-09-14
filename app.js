// =========================================================
// Cartis Brajá — Rosh Hashaná 5787 — Hillel Argentina
// Sitio de una sola página (SPA simple), sin frameworks ni backend.
// Todo el estado vive en memoria (variable `state`) y se pierde al
// cerrar/recargar la pestaña a propósito: cada visita es independiente.
// =========================================================

// ---------------------------------------------------------
// 1) DISEÑOS DE TARJETA
// En vez de un fondo rectangular plano, cada diseño usa como fondo un
// SVG con la silueta del emoji que usa (ej: la tarjeta "Shaná Tová"
// tiene un fondo con forma de Maguen David), diseñado a mano y provisto
// como archivo en assets/shapes/. El emoji de color va arriba, tal cual
// un emoji normal.
// Para agregar/quitar un diseño, solo hay que editar este array y subir
// el archivo correspondiente a assets/shapes/<shapeId>.svg.
//   - icon: el emoji tal cual se muestra (sin tocar).
//   - shapeId: nombre del archivo (sin extensión) en assets/shapes/.
//   - bg: color de referencia del diseño (el mismo que ya tiene
//     pintado el SVG) — se usa solo para decidir el color del título.
//   - text: color del texto sobre esa silueta.
//   - accent: color del título "Shaná Tová".
// ---------------------------------------------------------
const CARD_STYLES = [
  {
    id: "dulce",
    label: "Dulce Comienzo",
    icon: "🍯",
    shapeId: "honey",
    bg: "#F5DDB0",
    text: "#3B2420",
    accent: "#7A1338",
  },
  {
    id: "renovacion",
    label: "Renovación",
    icon: "🍎",
    shapeId: "apple",
    bg: "#7A1338",
    text: "#FFFFFF",
    accent: "#E8A33D",
  },
  {
    id: "shana-tova",
    label: "Shaná Tová",
    icon: "✡️",
    shapeId: "star",
    bg: "#3B2420",
    text: "#F5DDB0",
    accent: "#E8A33D",
  },
  {
    id: "brindis",
    label: "Brindis",
    icon: "🍷",
    shapeId: "wine",
    bg: "#E8A33D",
    text: "#3B2420",
    accent: "#7A1338",
  },
];

// Arma el fondo con forma (imagen SVG a pantalla completa, detrás del
// contenido) para un diseño dado. Se usa en la grilla de estilos (paso
// 2), donde no hace falta que sea perfecto: un <img> normal alcanza.
function renderShapeBackground(style) {
  return `<img class="card-shape" src="assets/shapes/${style.shapeId}.svg" alt="" />`;
}

// ---------------------------------------------------------
// 1.2) SVG DE LA SILUETA, EMBEBIDO (para la tarjeta final)
// La tarjeta que se exporta como imagen (html2canvas) NO usa <img
// src="...svg">: en Safari/iOS, html2canvas suele fallar en capturar
// imágenes SVG externas (la silueta sale en blanco o cortada, aunque
// la imagen ya haya terminado de cargar). La solución confiable es
// insertar el SVG directo en el HTML de la tarjeta — html2canvas lo
// captura sin problema porque ya es parte del DOM, no un recurso
// aparte que haya que cargar. Se cachea el texto de cada SVG (una sola
// vez por shapeId) para no volver a pedirlo cada vez que se re-renderiza.
// ---------------------------------------------------------
const SHAPE_MARKUP_CACHE = {};

function loadShapeMarkup(shapeId) {
  if (SHAPE_MARKUP_CACHE[shapeId]) return SHAPE_MARKUP_CACHE[shapeId];

  const promise = fetch(`assets/shapes/${shapeId}.svg`)
    .then((res) => res.text())
    .catch(() => "");

  SHAPE_MARKUP_CACHE[shapeId] = promise;
  return promise;
}

function warmShapeMarkupCache() {
  CARD_STYLES.forEach((style) => loadShapeMarkup(style.shapeId));
}

// ---------------------------------------------------------
// 1.1) ZONA SEGURA DE TEXTO (calculada a partir de cada SVG)
// Para que el mensaje quede siempre dentro de la silueta, sin importar
// su largo, no usamos un ancho fijo a ojo: analizamos el propio archivo
// SVG de cada diseño (dibujando en un <canvas> oculto y mirando qué
// píxeles son opacos) para encontrar la franja horizontal más ancha y
// continua disponible, y en qué banda vertical del dibujo está. Así,
// si mañana se agrega o se cambia una silueta, el ancho del texto se
// recalcula solo — no hace falta volver a medir nada a mano.
// El resultado se cachea por shapeId (se calcula una sola vez).
// ---------------------------------------------------------
const SAFE_ZONE_CACHE = {};

// Valor de respaldo por si algo falla al analizar el SVG (imagen que no
// carga, etc.) — conservador, para que el texto no se salga igual.
const SAFE_ZONE_FALLBACK = { widthPct: 50, topPct: 22, heightPct: 56 };

function computeSafeZone(shapeId) {
  if (SAFE_ZONE_CACHE[shapeId]) return SAFE_ZONE_CACHE[shapeId];

  const promise = new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Resolución de muestreo (mantiene la proporción 4:5 de la tarjeta).
        const W = 120;
        const H = 150;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(0, 0, W, H).data;

        // Ancho de la silueta (en píxeles de muestra) en cada fila.
        const rowWidths = [];
        for (let y = 0; y < H; y++) {
          let minX = -1;
          let maxX = -1;
          for (let x = 0; x < W; x++) {
            const alpha = data[(y * W + x) * 4 + 3];
            if (alpha > 40) {
              if (minX === -1) minX = x;
              maxX = x;
            }
          }
          rowWidths.push(minX === -1 ? 0 : maxX - minX + 1);
        }

        // Para una altura de banda dada, busca la posición vertical con
        // el mayor ancho mínimo garantizado en toda esa franja.
        const bestForHeight = (bandH) => {
          let bestMinWidth = -1;
          let bestYStart = 0;
          for (let yStart = 0; yStart <= H - bandH; yStart += 2) {
            let minWidth = Infinity;
            for (let y = yStart; y < yStart + bandH; y++) {
              minWidth = Math.min(minWidth, rowWidths[y]);
            }
            if (minWidth > bestMinWidth) {
              bestMinWidth = minWidth;
              bestYStart = yStart;
            }
          }
          return { minWidth: bestMinWidth, yStart: bestYStart };
        };

        // Estrategia en dos pasos (en vez de maximizar ancho×alto a
        // ciegas, que a veces elegía una franja apenas más alta pero
        // mucho más angosta — ej. metida en el tallo de la copa):
        //   1) Mide el ancho disponible en una franja "base" (suficiente
        //      para ícono + título + un par de líneas de mensaje).
        //   2) Prueba franjas cada vez más altas y se queda con la más
        //      alta que no pierda demasiado ancho respecto a esa base
        //      — así el mensaje tiene más lugar para varias líneas sin
        //      caer en una parte angosta de la silueta (la punta de la
        //      estrella, el tallo de la copa, etc.).
        const refBandH = Math.round(H * 0.35);
        const refWidth = bestForHeight(refBandH).minWidth;

        let best = { bandH: refBandH, ...bestForHeight(refBandH) };
        const maxBandH = Math.round(H * 0.85);
        for (let bandH = refBandH + 2; bandH <= maxBandH; bandH += 2) {
          const attempt = bestForHeight(bandH);
          if (attempt.minWidth >= refWidth * 0.72) {
            best = { bandH, ...attempt };
          } else {
            break; // el ancho ya cayó demasiado, no vale la pena seguir
          }
        }

        resolve({
          // 0.85: un margen de aire para que el texto no toque el borde
          // justo de la silueta.
          widthPct: Math.max(30, (best.minWidth / W) * 100 * 0.85),
          topPct: (best.yStart / H) * 100,
          heightPct: (best.bandH / H) * 100,
        });
      } catch (err) {
        resolve(SAFE_ZONE_FALLBACK);
      }
    };

    img.onerror = () => resolve(SAFE_ZONE_FALLBACK);
    img.src = `assets/shapes/${shapeId}.svg`;
  });

  SAFE_ZONE_CACHE[shapeId] = promise;
  return promise;
}

// Precalienta el cálculo de las 4 siluetas apenas arranca el sitio,
// para que ya esté listo cuando el usuario llegue al preview.
function warmSafeZoneCache() {
  CARD_STYLES.forEach((style) => computeSafeZone(style.shapeId));
}

// ---------------------------------------------------------
// 2) ESTADO DE LA APP
// ---------------------------------------------------------
const state = {
  selectedStyleId: null,
  para: "",
  de: "",
  activeTab: "predeterminado", // "predeterminado" | "propio"
  mensajeIndex: 0,
  // Texto del mensaje predeterminado actual — arranca igual al mensaje
  // original del carrusel, pero se puede retocar a mano (ver
  // renderMensajeCarousel / listener de "input" más abajo). Al navegar
  // a otro mensaje del carrusel se pisa con el texto de ese mensaje.
  mensajeEditado: "",
  mensajePropio: "",
};

// ---------------------------------------------------------
// 3) NAVEGACIÓN ENTRE PASOS
// ---------------------------------------------------------
function goToStep(stepId) {
  document.querySelectorAll(".step").forEach((el) => el.classList.remove("is-active"));
  document.getElementById(stepId).classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "instant" in window.scrollTo ? "instant" : "auto" });
}

// ---------------------------------------------------------
// 4) PASO 2 — RENDER GRILLA DE ESTILOS
// ---------------------------------------------------------
function renderStylesGrid() {
  const grid = document.getElementById("styles-grid");
  grid.innerHTML = "";

  CARD_STYLES.forEach((style) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "style-option";
    btn.style.color = style.text;
    if (style.id === state.selectedStyleId) btn.classList.add("is-selected");

    btn.innerHTML = `
      ${renderShapeBackground(style)}
      <span class="style-option-content">
        <span class="style-icon">${style.icon}</span>
        <span>${style.label}</span>
      </span>
    `;

    btn.addEventListener("click", () => {
      state.selectedStyleId = style.id;
      goToStep("step-customize");
    });

    grid.appendChild(btn);
  });
}

// ---------------------------------------------------------
// 5) PASO 3 — TABS (predeterminado vs propio) + CARRUSEL
// ---------------------------------------------------------
function setActiveTab(tab) {
  state.activeTab = tab;

  document.getElementById("tab-predeterminado").classList.toggle("is-active", tab === "predeterminado");
  document.getElementById("tab-propio").classList.toggle("is-active", tab === "propio");
  document.getElementById("panel-predeterminado").classList.toggle("is-active", tab === "predeterminado");
  document.getElementById("panel-propio").classList.toggle("is-active", tab === "propio");
}

function renderMensajeCarousel() {
  const mensajes = window.MENSAJES_PREDETERMINADOS || [];
  // Al cambiar de mensaje se pisa cualquier edición anterior con el
  // texto original de ese mensaje.
  state.mensajeEditado = mensajes[state.mensajeIndex] || "";
  document.getElementById("mensaje-preview-text").value = state.mensajeEditado;
  document.getElementById("mensaje-index").textContent = state.mensajeIndex + 1;
  document.getElementById("mensaje-total").textContent = mensajes.length;
}

function mensajeStep(delta) {
  const mensajes = window.MENSAJES_PREDETERMINADOS || [];
  const total = mensajes.length;
  state.mensajeIndex = (state.mensajeIndex + delta + total) % total;
  renderMensajeCarousel();
}

// Devuelve el mensaje final a usar en la tarjeta, según la tab activa.
function getMensajeFinal() {
  if (state.activeTab === "propio") {
    return state.mensajePropio.trim();
  }
  return (state.mensajeEditado || "").trim();
}

// ---------------------------------------------------------
// 6) PASO 4 — RENDER DE LA TARJETA FINAL
// ---------------------------------------------------------
async function renderCard() {
  const style = CARD_STYLES.find((s) => s.id === state.selectedStyleId) || CARD_STYLES[0];
  const card = document.getElementById("card-render");

  card.style.color = style.text;

  const [zone, shapeMarkup] = await Promise.all([
    computeSafeZone(style.shapeId),
    loadShapeMarkup(style.shapeId),
  ]);

  // Si el usuario ya navegó a otro diseño mientras se calculaba la zona
  // segura, no pisamos su selección más nueva con esta respuesta vieja.
  if (state.selectedStyleId !== style.id) return;

  const mensaje = getMensajeFinal() || (window.MENSAJES_PREDETERMINADOS || [])[0];

  const para = state.para.trim();
  const de = state.de.trim();

  let namesHtml = "";
  if (para) namesHtml += `Para: ${escapeHtml(para)}<br/>`;
  if (de) namesHtml += `De: ${escapeHtml(de)}`;

  // Centramos el bloque de texto en el punto medio de la franja segura
  // (en vez de encerrarlo en una caja con esa altura exacta): el ancho
  // sí queda firmemente limitado a --safe-width, pero el alto se deja
  // crecer libremente desde ese centro — el ícono y el título suelen
  // asomar un poco por encima de la silueta hacia el área blanca de la
  // tarjeta, y eso se ve bien; lo que importa es que el mensaje no se
  // salga para los costados.
  const centerPct = zone.topPct + zone.heightPct / 2;

  card.innerHTML = `
    <div class="card-shape">${shapeMarkup}</div>
    <div
      class="card-text-zone"
      style="top:${centerPct}%; --safe-width:${zone.widthPct}%;"
    >
      <div class="card-icon">${style.icon}</div>
      <div class="card-shana-tova" style="color:${style.accent === style.bg ? style.text : style.accent}">
        Shaná Tová
      </div>
      <div class="card-message">${escapeHtml(mensaje)}</div>
      ${namesHtml ? `<div class="card-names">${namesHtml}</div>` : ""}
    </div>
    <div class="card-brand"><span>Hillel Argentina · Rosh Hashaná 5787</span></div>
  `;

  fitTextZone(card.querySelector(".card-text-zone"), card);
}

// El ícono y el título pueden asomar un poco por encima de la silueta
// (hacia el área blanca de la tarjeta) sin que se vea mal — lo único
// que de verdad tiene que evitarse es que el bloque de texto entero se
// salga de la tarjeta (tape el logo de arriba o el pie de marca de
// abajo). Si eso llega a pasar con un mensaje muy largo, achica la
// tipografía hasta que todo entre en el alto disponible de la tarjeta.
function fitTextZone(zoneEl, cardEl) {
  const messageEl = zoneEl.querySelector(".card-message");
  const titleEl = zoneEl.querySelector(".card-shana-tova");
  const iconEl = zoneEl.querySelector(".card-icon");
  if (!messageEl) return;

  // Un margen de aire arriba (que no tape el borde de la tarjeta) y
  // abajo (que no se pise con el pie de marca).
  const cardRect = cardEl.getBoundingClientRect();
  const topMargin = cardRect.height * 0.04;
  const bottomMargin = cardRect.height * 0.1;
  const zoneHeight = cardRect.height - topMargin - bottomMargin;

  const contentHeight = () => {
    const first = zoneEl.firstElementChild.getBoundingClientRect();
    const last = zoneEl.lastElementChild.getBoundingClientRect();
    return last.bottom - first.top;
  };
  // Los márgenes de estos elementos están en "em" (ver style.css), así
  // que al achicar el font-size también se achica el aire entre ellos.

  // 1) Primero achica el mensaje (lo más "elástico" en alto), hasta un piso legible.
  let messageSize = 15;
  while (contentHeight() > zoneHeight && messageSize > 11) {
    messageSize -= 1;
    messageEl.style.fontSize = messageSize + "px";
  }

  // 2) Si todavía no entra, achica un poco el título.
  let titleSize = 30;
  while (contentHeight() > zoneHeight && titleSize > 20 && titleEl) {
    titleSize -= 2;
    titleEl.style.fontSize = titleSize + "px";
  }

  // 3) Si todavía no entra, achica el ícono.
  let iconSize = 56;
  while (contentHeight() > zoneHeight && iconSize > 32 && iconEl) {
    iconSize -= 4;
    iconEl.style.fontSize = iconSize + "px";
  }

  // 4) Último recurso — casos extremos (mensaje larguísimo en la
  // silueta más angosta, con nombres): aunque el CONTENIDO ya entra en
  // el alto disponible, puede quedar corrido hacia arriba o abajo de
  // la tarjeta si el centro de la franja segura no está a mitad de
  // camino entre los márgenes. Se corre el bloque lo justo para que
  // vuelva a entrar del todo.
  const topBoundary = cardRect.top + topMargin;
  const bottomBoundary = cardRect.bottom - bottomMargin;
  const first = zoneEl.firstElementChild.getBoundingClientRect();
  const last = zoneEl.lastElementChild.getBoundingClientRect();
  let nudge = 0;
  if (first.top < topBoundary) nudge = topBoundary - first.top;
  else if (last.bottom > bottomBoundary) nudge = bottomBoundary - last.bottom;
  if (nudge !== 0) {
    zoneEl.style.transform = `translateY(calc(-50% + ${nudge}px))`;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------
// 7) COMPARTIR POR WHATSAPP
// ---------------------------------------------------------
async function shareCard() {
  const shareBtn = document.querySelector('[data-action="share-whatsapp"]');
  const originalLabel = shareBtn.innerHTML;
  shareBtn.disabled = true;
  shareBtn.style.opacity = "0.7";

  try {
    const cardEl = document.getElementById("card-render");

    // scale: 2 para que la imagen salga nítida al compartir/descargar.
    const canvas = await html2canvas(cardEl, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    });

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1));
    const fileName = "cartis-braja-rosh-hashana.png";
    const file = new File([blob], fileName, { type: "image/png" });

    const shareText = "¡Shaná Tová! Te mando esta Cartis Brajá 🍯🍎";

    // Método principal: Web Share API con archivo (funciona en la mayoría
    // de los celulares y abre directamente el selector de apps, incluyendo WhatsApp).
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        text: shareText,
      });
      return;
    }

    // Fallback: el navegador no soporta compartir archivos.
    // Descargamos la imagen y abrimos WhatsApp con un texto que invita
    // a adjuntar la imagen manualmente.
    downloadBlob(blob, fileName);
    const waText = encodeURIComponent(
      `${shareText}\n\n(Se descargó la imagen a tu celular — adjuntala en este chat de WhatsApp)`
    );
    window.open(`https://wa.me/?text=${waText}`, "_blank");
  } catch (err) {
    // Si el usuario cancela el share nativo, el navegador tira AbortError:
    // no es un error real, no hacemos nada.
    if (err && err.name === "AbortError") return;
    console.error("Error al compartir la tarjeta:", err);
    alert("No se pudo generar la imagen. Probá de nuevo o tomá una captura de pantalla de la tarjeta.");
  } finally {
    shareBtn.disabled = false;
    shareBtn.style.opacity = "1";
    shareBtn.innerHTML = originalLabel;
  }
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------
// 8) EVENTOS
// ---------------------------------------------------------
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  switch (action) {
    case "go-to-styles":
      goToStep("step-styles");
      break;
    case "back-to-intro":
      goToStep("step-intro");
      break;
    case "back-to-styles":
      goToStep("step-styles");
      break;
    case "go-to-preview":
      goToStep("step-preview");
      renderCard();
      break;
    case "back-to-customize":
      goToStep("step-customize");
      break;
    case "tab-predeterminado":
      setActiveTab("predeterminado");
      break;
    case "tab-propio":
      setActiveTab("propio");
      break;
    case "mensaje-prev":
      mensajeStep(-1);
      break;
    case "mensaje-next":
      mensajeStep(1);
      break;
    case "share-whatsapp":
      shareCard();
      break;
  }
});

document.getElementById("input-para").addEventListener("input", (e) => {
  state.para = e.target.value;
});

document.getElementById("input-de").addEventListener("input", (e) => {
  state.de = e.target.value;
});

document.getElementById("input-propio").addEventListener("input", (e) => {
  state.mensajePropio = e.target.value;
  document.getElementById("propio-count").textContent = e.target.value.length;
});

document.getElementById("mensaje-preview-text").addEventListener("input", (e) => {
  state.mensajeEditado = e.target.value;
});

// ---------------------------------------------------------
// 9) INIT
// ---------------------------------------------------------
renderStylesGrid();
renderMensajeCarousel();
warmSafeZoneCache();
warmShapeMarkupCache();
