// =========================================================
// Cartis Brajá — Rosh Hashaná 5787 — Hillel Argentina
// Sitio de una sola página (SPA simple), sin frameworks ni backend.
// Todo el estado vive en memoria (variable `state`) y se pierde al
// cerrar/recargar la pestaña a propósito: cada visita es independiente.
// =========================================================

// ---------------------------------------------------------
// 1) SILUETAS DE FONDO (SVG)
// En vez de un fondo rectangular plano, cada diseño recorta su color
// plano con la silueta del emoji que usa (ej: la tarjeta "Shaná Tová"
// tiene un fondo con forma de Maguen David). El emoji de color va
// arriba, tal cual un emoji normal. viewBox 0 0 240 300 (proporción
// 4:5, igual a la tarjeta) para que la silueta ocupe casi toda la
// tarjeta.
// ---------------------------------------------------------
const SHAPES = {
  honey: `
    <rect x="50" y="95" width="140" height="190" rx="28"/>
    <rect x="100" y="35" width="40" height="65" rx="10"/>
  `,
  apple: `
    <ellipse cx="120" cy="175" rx="95" ry="105"/>
    <rect x="112" y="15" width="16" height="50" rx="6"/>
    <path d="M128,28 Q168,15 178,42 Q145,50 128,28 Z"/>
  `,
  star: `
    <polygon points="120,15 226,205 14,205"/>
    <polygon points="120,285 14,95 226,95"/>
  `,
  dove: `
    <ellipse cx="72" cy="98" rx="78" ry="46" transform="rotate(-38 72 98)"/>
    <ellipse cx="168" cy="98" rx="78" ry="46" transform="rotate(38 168 98)"/>
    <ellipse cx="120" cy="200" rx="28" ry="90"/>
    <circle cx="120" cy="108" r="21"/>
    <polygon points="138,102 158,108 138,116"/>
    <ellipse cx="150" cy="78" rx="15" ry="6.5" transform="rotate(-30 150 78)"/>
  `,
  wine: `
    <path d="M55,20 H185 L150,175 Q120,195 90,175 Z"/>
    <rect x="112" y="175" width="16" height="75" rx="4"/>
    <ellipse cx="120" cy="270" rx="55" ry="15"/>
  `,
};

// ---------------------------------------------------------
// 2) DISEÑOS DE TARJETA
// Combinan colores de la paleta del poster + una silueta de fondo.
// Para agregar/quitar un diseño, solo hay que editar este array.
//   - icon: el emoji tal cual se muestra (sin tocar).
//   - shapeId: referencia a SHAPES — la forma que recorta el color de
//     fondo (`bg`).
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
    id: "paz",
    label: "Paz y Bendición",
    icon: "🕊️",
    shapeId: "dove",
    bg: "#B8D8F0",
    text: "#3B2420",
    accent: "#7A1338",
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

// Arma el fondo con forma (SVG a pantalla completa, detrás del
// contenido) para un diseño dado.
function renderShapeBackground(style) {
  return `
    <svg class="card-shape" viewBox="0 0 240 300" preserveAspectRatio="none" style="fill:${style.bg}">
      ${SHAPES[style.shapeId]}
    </svg>
  `;
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
function renderCard() {
  const style = CARD_STYLES.find((s) => s.id === state.selectedStyleId) || CARD_STYLES[0];
  const card = document.getElementById("card-render");

  card.style.color = style.text;

  const mensaje = getMensajeFinal() || (window.MENSAJES_PREDETERMINADOS || [])[0];

  const para = state.para.trim();
  const de = state.de.trim();

  let namesHtml = "";
  if (para) namesHtml += `Para: ${escapeHtml(para)}<br/>`;
  if (de) namesHtml += `De: ${escapeHtml(de)}`;

  card.innerHTML = `
    ${renderShapeBackground(style)}
    <div class="card-content">
      <div class="card-icon">${style.icon}</div>
      <div class="card-shana-tova" style="color:${style.accent === style.bg ? style.text : style.accent}">
        Shaná Tová
      </div>
      <div class="card-message">${escapeHtml(mensaje)}</div>
      ${namesHtml ? `<div class="card-names">${namesHtml}</div>` : ""}
      <div class="card-brand">Hillel Argentina · Rosh Hashaná 5787</div>
    </div>
  `;
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
      renderCard();
      goToStep("step-preview");
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
