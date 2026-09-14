// =========================================================
// Cartis Brajá — Rosh Hashaná 5787 — Hillel Argentina
// Sitio de una sola página (SPA simple), sin frameworks ni backend.
// Todo el estado vive en memoria (variable `state`) y se pierde al
// cerrar/recargar la pestaña a propósito: cada visita es independiente.
// =========================================================

// ---------------------------------------------------------
// 1) ÍCONOS (siluetas planas en SVG)
// En vez de usar el emoji de color directo, cada diseño muestra una
// silueta simple de un solo color (como los íconos del poster de
// referencia: shofar, estrella de David, etc.), dentro de una placa
// circular negra o blanca. Los paths son deliberadamente simples.
// ---------------------------------------------------------
const ICONS = {
  honey: `
    <rect x="70" y="75" width="60" height="105" rx="16"/>
    <rect x="65" y="55" width="70" height="24" rx="8"/>
    <rect x="90" y="34" width="20" height="23" rx="6"/>
    <path d="M148,148 Q160,165 148,182 Q136,165 148,148 Z"/>
  `,
  apple: `
    <ellipse cx="100" cy="128" rx="50" ry="52"/>
    <rect x="94" y="54" width="12" height="28" rx="5"/>
    <path d="M106,64 Q134,52 140,74 Q116,80 106,64 Z"/>
  `,
  star: `
    <polygon points="100,32 165,152 35,152"/>
    <polygon points="100,196 35,76 165,76"/>
  `,
  dove: `
    <path d="M20,110 C45,70 75,65 100,96 C125,65 155,70 180,110 C155,92 125,96 100,132 C75,96 45,92 20,110 Z"/>
    <ellipse cx="170" cy="98" rx="11" ry="4.5" transform="rotate(-35 170 98)"/>
  `,
  wine: `
    <path d="M68,38 H132 L116,112 Q100,124 84,112 Z"/>
    <rect x="96" y="112" width="8" height="52" />
    <ellipse cx="100" cy="168" rx="32" ry="9"/>
  `,
};

// ---------------------------------------------------------
// 2) DISEÑOS DE TARJETA
// Combinan colores de la paleta del poster + una placa con silueta.
// Para agregar/quitar un diseño, solo hay que editar este array.
//   - bg / text: fondo y color de texto de la tarjeta.
//   - badgeBg: fondo de la placa del ícono (negro o blanco, como en
//     el poster de referencia).
//   - iconId: referencia a ICONS.
//   - iconColor: color plano (silueta) del ícono.
//   - accent: color del título "Shaná Tová".
// ---------------------------------------------------------
const CARD_STYLES = [
  {
    id: "dulce",
    label: "Dulce Comienzo",
    iconId: "honey",
    badgeBg: "#FFFFFF",
    iconColor: "#C97F1D",
    bg: "#F5DDB0",
    text: "#3B2420",
    accent: "#7A1338",
  },
  {
    id: "renovacion",
    label: "Renovación",
    iconId: "apple",
    badgeBg: "#FFFFFF",
    iconColor: "#C0392B",
    bg: "#7A1338",
    text: "#FFFFFF",
    accent: "#E8A33D",
  },
  {
    id: "shana-tova",
    label: "Shaná Tová",
    iconId: "star",
    badgeBg: "#000000",
    iconColor: "#E8A33D",
    bg: "#3B2420",
    text: "#F5DDB0",
    accent: "#E8A33D",
  },
  {
    id: "paz",
    label: "Paz y Bendición",
    iconId: "dove",
    badgeBg: "#000000",
    iconColor: "#FFFFFF",
    bg: "#B8D8F0",
    text: "#3B2420",
    accent: "#7A1338",
  },
  {
    id: "brindis",
    label: "Brindis",
    iconId: "wine",
    badgeBg: "#FFFFFF",
    iconColor: "#7A1338",
    bg: "#E8A33D",
    text: "#3B2420",
    accent: "#7A1338",
  },
];

// Arma el HTML de una placa de ícono (círculo + silueta SVG) para un
// diseño dado. `size` es el diámetro en px.
function renderIconBadge(style, size) {
  return `
    <span class="icon-badge" style="width:${size}px;height:${size}px;background:${style.badgeBg}">
      <svg viewBox="0 0 200 200" style="width:${size * 0.62}px;height:${size * 0.62}px;fill:${style.iconColor}">
        ${ICONS[style.iconId]}
      </svg>
    </span>
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
    btn.style.background = style.bg;
    btn.style.color = style.text;
    if (style.id === state.selectedStyleId) btn.classList.add("is-selected");

    btn.innerHTML = `
      ${renderIconBadge(style, 64)}
      <span>${style.label}</span>
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

  card.style.background = style.bg;
  card.style.color = style.text;

  const mensaje = getMensajeFinal() || (window.MENSAJES_PREDETERMINADOS || [])[0];

  const para = state.para.trim();
  const de = state.de.trim();

  let namesHtml = "";
  if (para) namesHtml += `Para: ${escapeHtml(para)}<br/>`;
  if (de) namesHtml += `De: ${escapeHtml(de)}`;

  card.innerHTML = `
    <div class="card-icon">${renderIconBadge(style, 108)}</div>
    <div class="card-shana-tova" style="color:${style.accent === style.bg ? style.text : style.accent}">
      Shaná Tová
    </div>
    <div class="card-message">${escapeHtml(mensaje)}</div>
    ${namesHtml ? `<div class="card-names">${namesHtml}</div>` : ""}
    <div class="card-brand">Hillel Argentina · Rosh Hashaná 5787</div>
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
