const detailRoot = document.querySelector("#service-detail");
const params = new URLSearchParams(window.location.search);
const serviceId = params.get("id") || "pension-65";
const service = (window.CercaRedServices || []).find((item) => item.id === serviceId);

function renderCards(items) {
  return items
    .map(
      (item) => `
        <article class="info-card">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </article>
      `,
    )
    .join("");
}

function renderSteps(items) {
  return items
    .map(
      (item, index) => `
        <li class="step-item">
          <span class="step-number${item.highlight ? " is-highlighted" : ""}">
            ${index + 1}
          </span>
          <div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </div>
        </li>
      `,
    )
    .join("");
}

function renderChannels(items) {
  return items
    .map(
      (item) => `
        <li class="channel-item">
          <span aria-hidden="true"></span>
          <div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </div>
        </li>
      `,
    )
    .join("");
}

function renderProcedures(items) {
  return items
    .map((item) => `<option value="${item.value}">${item.label}</option>`)
    .join("");
}

function renderNotFound() {
  detailRoot.innerHTML = `
    <section class="detail-empty" aria-labelledby="detail-empty-title">
      <h1 id="detail-empty-title">Servicio no encontrado</h1>
      <p>El servicio solicitado no existe o ya no está disponible.</p>
      <a class="primary-link" href="index.html">Volver al catálogo</a>
    </section>
  `;
}

function renderServiceDetail(data) {
  document.title = `${data.name} | CercaRed`;

  detailRoot.innerHTML = `
    <div class="detail-layout">
      <div class="detail-content">
        <nav class="breadcrumb" aria-label="Ruta de navegación">
          <a href="index.html">Catálogo</a>
          <span aria-hidden="true">→</span>
          <span>${data.name}</span>
        </nav>

        <section class="detail-hero" aria-labelledby="detail-title">
          <h1 id="detail-title">${data.name}</h1>
          <p>${data.description}</p>
        </section>

        <div class="detail-columns">
          <section aria-labelledby="requirements-title">
            <h2 id="requirements-title">Requisitos necesarios</h2>
            <div class="stacked-cards">
              ${renderCards(data.requirements)}
            </div>
          </section>

          <section aria-labelledby="documents-title">
            <h2 id="documents-title">Documentos necesarios</h2>
            <div class="stacked-cards">
              ${renderCards(data.documents)}
            </div>
          </section>
        </div>

        <div class="detail-columns detail-lower">
          <section aria-labelledby="steps-title">
            <h2 id="steps-title">Pasos</h2>
            <ol class="steps-list">
              ${renderSteps(data.steps)}
            </ol>
          </section>

          <section aria-labelledby="procedure-title">
            <h2 id="procedure-title">Procedimiento municipal disponible</h2>
            <label class="procedure-select">
              <span class="visually-hidden">Seleccionar procedimiento municipal</span>
              <select>
                ${renderProcedures(data.procedures)}
              </select>
            </label>
          </section>
        </div>

        <section class="channels-section" aria-labelledby="channels-title">
          <h2 id="channels-title">Canales de atención</h2>
          <ul class="channels-list">
            ${renderChannels(data.channels)}
          </ul>
        </section>

        <a class="official-channel" href="${data.officialUrl}" target="_blank" rel="noreferrer">
          Ir al canal oficial →
        </a>
      </div>

      <aside class="detail-sidebar" aria-label="Información adicional del servicio">
        <section class="sidebar-card">
          <h2>Detalles del servicio</h2>
          <dl>
            <div>
              <dt>Entidad</dt>
              <dd>${data.shortEntity}</dd>
            </div>
            <div>
              <dt>Categoría</dt>
              <dd>${data.category}</dd>
            </div>
            <div>
              <dt>Atención</dt>
              <dd>${data.attention}</dd>
            </div>
            <div>
              <dt>Ámbito</dt>
              <dd>${data.scope}</dd>
            </div>
            <div>
              <dt>Costo</dt>
              <dd class="success-text">${data.cost}</dd>
            </div>
          </dl>
        </section>

        <section class="sidebar-card summary-card">
          <h2>Resumen del trámite</h2>
          <p>
            Obtén una guía resumida con los requisitos principales y los pasos
            para acceder a ${data.name}, lista para compartir con tu familiar.
          </p>
          <button class="summary-button" type="button">Generar resumen</button>
        </section>

        <div class="sidebar-actions">
          <button class="detail-save-button" type="button" aria-pressed="false">Guardar</button>
          <button class="detail-share-button" type="button">Compartir</button>
        </div>
      </aside>
    </div>
  `;

  wireDetailActions(data);
}

function getShareUrl(serviceId) {
  const basePath = window.location.pathname.replace(/[^/]*$/, "");
  return `${window.location.origin}${basePath}detail.html?id=${encodeURIComponent(serviceId)}`;
}

function toSavedService(data) {
  return {
    id: data.id,
    name: data.name,
    entity: data.entity,
    category: data.category,
    description: data.shortDescription,
    url: getShareUrl(data.id),
  };
}

function buildSummary(data) {
  const requirements = data.requirements.map((item) => `- ${item.title}`).join("\n");
  const steps = data.steps.map((item, index) => `${index + 1}. ${item.title}`).join("\n");
  return `${data.name}\n\nRequisitos principales:\n${requirements}\n\nPasos:\n${steps}\n\nCanal oficial: ${data.officialUrl}`;
}

function showDetailToast(message) {
  let toast = document.querySelector("#detail-toast");
  if (!toast) {
    toast = Object.assign(document.createElement("div"), {
      id: "detail-toast",
      className: "saved-toast",
    });
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showDetailToast.timer);
  showDetailToast.timer = window.setTimeout(
    () => toast.classList.remove("is-visible"),
    2400,
  );
}

async function copySummary(data) {
  const summary = buildSummary(data);
  try {
    await navigator.clipboard.writeText(summary);
    showDetailToast("Resumen copiado");
  } catch {
    window.prompt("Copia el resumen del trámite:", summary);
  }
}

function wireDetailActions(data) {
  const savedService = toSavedService(data);
  const saveButton = document.querySelector(".detail-save-button");
  const shareButton = document.querySelector(".detail-share-button");
  const summaryButton = document.querySelector(".summary-button");

  function updateSaveState() {
    const saved = window.CercaRedSaved?.isSaved(savedService) || false;
    saveButton.classList.toggle("is-saved", saved);
    saveButton.setAttribute("aria-pressed", String(saved));
    saveButton.textContent = saved ? "Guardado" : "Guardar";
  }

  updateSaveState();

  saveButton.addEventListener("click", () => {
    if (!window.CercaRedSaved?.isLoggedIn()) {
      window.location.href = "auth.html";
      return;
    }

    const saved = window.CercaRedSaved.toggleSaved(savedService);
    updateSaveState();
    showDetailToast(saved ? "Servicio guardado" : "Se quitó de los guardados");
  });

  shareButton.addEventListener("click", () => {
    window.CercaRedShare?.openShareModal({
      ...savedService,
      description: data.description,
      url: savedService.url,
    });
  });

  summaryButton.addEventListener("click", () => openSummaryModal(data));
}
function buildSummaryModal(data) {
  const requirementItems = data.requirements
    .map((r) => `<div class="summary-modal-item">${r.title}</div>`)
    .join("");
 
  const documentItems = data.documents
    .map((d) => `<div class="summary-modal-item">${d.title}</div>`)
    .join("");
 
  const stepItems = data.steps
    .map(
      (s, i) => `
      <li class="summary-modal-step">
        <span class="summary-modal-step-num">${i + 1}</span>
        <span>${s.title}</span>
      </li>`
    )
    .join("");
 
  const channelItems = data.channels
    .map((c) => `<li class="summary-modal-channel">${c.title}. ${c.description}</li>`)
    .join("");
 
  return `
    <div
      class="summary-modal-overlay"
      id="summary-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-modal-title"
    >
      <div class="summary-modal">
        <button
          class="summary-modal-close"
          type="button"
          aria-label="Cerrar resumen"
          id="summary-modal-close"
        >×</button>
 
        <p class="summary-modal-category">${data.category}</p>
        <h2 class="summary-modal-title" id="summary-modal-title">${data.name}</h2>
 
        <h3 class="summary-modal-section-title">Resumen del servicio</h3>
        <div class="summary-modal-text">${data.description}</div>
 
        <div class="summary-modal-grid">
          <div>
            <h3 class="summary-modal-section-title">Requisitos principales</h3>
            <div class="summary-modal-items">${requirementItems}</div>
          </div>
          <div>
            <h3 class="summary-modal-section-title">Documentos basicos</h3>
            <div class="summary-modal-items">${documentItems}</div>
          </div>
        </div>
 
        <div class="summary-modal-grid">
          <div>
            <h3 class="summary-modal-section-title">Pasos</h3>
            <ol class="summary-modal-steps">${stepItems}</ol>
          </div>
          <div>
            <h3 class="summary-modal-section-title">Canales de atencion</h3>
            <ul class="summary-modal-channels">${channelItems}</ul>
          </div>
        </div>
 
        <div class="summary-modal-actions">
          <button class="summary-modal-copy" type="button" id="summary-modal-copy-btn">
            Copiar resumen
          </button>
          <button class="summary-modal-pdf" type="button" id="summary-modal-pdf-btn">
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  `;
}
 
/* ── Abrir modal ── */
function openSummaryModal(data) {
  // Evitar duplicados
  document.querySelector("#summary-modal-overlay")?.remove();
 
  document.body.insertAdjacentHTML("beforeend", buildSummaryModal(data));
 
  const overlay = document.querySelector("#summary-modal-overlay");
  const closeBtn = document.querySelector("#summary-modal-close");
  const copyBtn = document.querySelector("#summary-modal-copy-btn");
  const pdfBtn = document.querySelector("#summary-modal-pdf-btn");
 
  // Abrir con animación
  requestAnimationFrame(() => overlay.classList.add("is-open"));
 
  // Guardar foco anterior y mover foco al modal
  const previousFocus = document.activeElement;
  closeBtn.focus();
 
  // Cerrar al hacer clic en overlay (fuera del modal)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSummaryModal(overlay, previousFocus);
  });
 
  // Cerrar con botón X
  closeBtn.addEventListener("click", () => closeSummaryModal(overlay, previousFocus));
 
  // Cerrar con Escape
  function handleKeydown(e) {
    if (e.key === "Escape") {
      closeSummaryModal(overlay, previousFocus);
      document.removeEventListener("keydown", handleKeydown);
    }
  }
  document.addEventListener("keydown", handleKeydown);
 
  // Copiar resumen
  copyBtn.addEventListener("click", async () => {
    await copySummary(data);
  });
 
  // Descargar PDF
  pdfBtn.addEventListener("click", () => downloadSummaryPDF(data));
}
 
/* ── Cerrar modal ── */
function closeSummaryModal(overlay, previousFocus) {
  overlay.classList.remove("is-open");
  overlay.addEventListener(
    "transitionend",
    () => {
      overlay.remove();
      previousFocus?.focus();
    },
    { once: true }
  );
}
 
/* ── Descargar PDF ── */
function downloadSummaryPDF(data) {
  // 1. Acceder a jsPDF desde el objeto global window
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  // 2. Encabezado Institucional de CercaRed
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(26, 38, 57); // Azul oscuro elegante
  doc.text("RESUMEN DEL SERVICIO - CERCARED", 15, 20);
  
  doc.setDrawColor(230, 0, 35); // Línea decorativa color rojo tipo Pinterest
  doc.setLineWidth(1);
  doc.line(15, 24, 195, 24);

  // 3. Título del Servicio y Metadatos
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(230, 0, 35);
  doc.text(data.name.toUpperCase(), 15, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Categoría: ${data.category}  |  Entidad: ${data.shortEntity}  |  Costo: ${data.cost}`, 15, 40);

  // Variable de control vertical (para evitar que se encimen los textos)
  let currentY = 52;

  // --- FUNCIÓN INTERNA AUXILIAR PARA IMPRIMIR SECCIONES Y EVITAR DESBORDES ---
  function agregarSeccion(titulo, elementos, esLista = true) {
    if (!elementos || elementos.length === 0) return;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(titulo, 15, currentY);
    currentY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    if (Array.isArray(elementos)) {
      elementos.forEach((item, index) => {
        let textoLinea = esLista ? `• ${item.title}` : `${index + 1}. ${item.title}`;
        
        // Si son canales, formateamos con su descripción
        if (titulo === "CANALES DE ATENCIÓN") {
          textoLinea = `• ${item.title}: ${item.description}`;
        }

        const lineasFragmentadas = doc.splitTextToSize(textoLinea, 175);
        doc.text(lineasFragmentadas, 18, currentY);
        currentY += (lineasFragmentadas.length * 5);
      });
    } else {
      // Para texto plano largo como la Descripción
      const lineasFragmentadas = doc.splitTextToSize(elementos, 175);
      doc.text(lineasFragmentadas, 15, currentY);
      currentY += (lineasFragmentadas.length * 5);
    }
    currentY += 6; // Espacio de separación entre bloques de contenido
  }

  // 4. Inyección del contenido dinámico de CercaRed
  agregarSeccion("DESCRIPCIÓN", data.description, false);
  agregarSeccion("REQUISITOS PRINCIPALES", data.requirements, true);
  agregarSeccion("DOCUMENTOS BÁSICOS", data.documents, true);
  
  // Para los Pasos, pasamos 'false' en el tercer parámetro para que use numeración (1, 2, 3...)
  agregarSeccion("PASOS", data.steps, false);
  agregarSeccion("CANALES DE ATENCIÓN", data.channels, true);

  // 5. Enlace Oficial y Cierre del Documento
  if (currentY > 260) {
    doc.addPage();
    currentY = 20; // Si el contenido es largo, crea otra hoja y reinicia el margen superior
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(26, 38, 57);
  doc.text(`Canal oficial: ${data.officialUrl}`, 15, currentY + 4);

  // Pie de página fijo al final
  doc.setDrawColor(220, 220, 220);
  doc.line(15, 278, 195, 278);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generado desde CercaRed · Servicios sociales cerca de ti", 15, 284);

  // 6. Ejecutar la descarga del archivo PDF real
  doc.save(`resumen-${data.id}.pdf`);
  
  // Tu feedback visual nativo original
  showDetailToast("Resumen descargado");
}

if (service) {
  renderServiceDetail(service);
} else {
  renderNotFound();
}
