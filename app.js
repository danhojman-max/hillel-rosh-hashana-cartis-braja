// =========================================================
// Cartis Brajá — Rosh Hashaná 5787 — Hillel Argentina
// Sitio de una sola página (SPA simple), sin frameworks ni backend.
// Todo el estado vive en memoria (variable `state`) y se pierde al
// cerrar/recargar la pestaña a propósito: cada visita es independiente.
// =========================================================

// ---------------------------------------------------------
// 1) DISEÑOS DE TARJETA
// Combinan colores de la paleta del poster + un ícono central.
// Para agregar/quitar un diseño, solo hay que editar este array.
// ---------------------------------------------------------
const CARD_STYLES = [
  {
    id: "dulce",
    label: "Dulce Comienzo",
    icon: "🍯",
    bg: "#F5DDB0",
    text: "#3B2420",
    accent: "#7A1338",
  },
  {
    id: "renovacion",
    label: "Renovación",
    icon: "🍎",
    bg: "#7A1338",
    text: "#FFFFFF",
    accent: "#E8A33D",
  },
  {
    id: "shana-tova",
    label: "Shaná Tová",
    icon: "✡️",
    bg: "#3B2420",
    text: "#F5DDB0",
    accent: "#E8A33D",
  },
  {
    id: "paz",
    label: "Paz y Bendición",
    icon: "🕊️",
    bg: "#B8D8F0",
    text: "#3B2420",
    accent: "#7A1338",
  },
  {
    id: "brindis",
    label: "Brindis",
    icon: "🍷",
    bg: "#E8A33D",
    text: "#3B2420",
    accent: "#7A1338",
  },
];

// ---------------------------------------------------------
// 2) ESTADO DE LA APP
// ---------------------------------------------------------
const state = {
  selectedStyleId: null,
  para: "",
  de: "",
  activeTab: "predeterminado", // "predeterminado" | "propio"
  mensajeIndex: 0,
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
      <span class="style-icon">${style.icon}</span>
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
  document.getElementById("mensaje-preview-text").textContent = mensajes[state.mensajeIndex] || "";
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
  const mensajes = window.MENSAJES_PREDETERMINADOS || [];
  return mensajes[state.mensajeIndex] || "";
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
    <div class="card-icon">${style.icon}</div>
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

// ---------------------------------------------------------
// 9) INIT
// ---------------------------------------------------------
renderStylesGrid();
renderMensajeCarousel();
