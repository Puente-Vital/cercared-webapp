import { doc, increment, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db, loadServices, setServiceActive, updateService } from "./service-store.js";

const detailRoot = document.querySelector("#service-detail");
const params = new URLSearchParams(window.location.search);
const serviceId = params.get("id") || "pension-65";
let rawService = null;

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("cercared_currentUser") || "null");
  } catch {
    return null;
  }
}

function isAdminUser() {
  return getCurrentUser()?.role === "admin";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatSectionItems(items) {
  return (items || [])
    .map((item) => `${item.title || ""} | ${item.description || ""}`)
    .join("\n");
}

function formatResourceItems(items) {
  return (items || [])
    .map((item) =>
      `${item.title || ""} | ${item.description || ""} | ${item.url || ""} | ${item.type || "otro"}`,
    )
    .join("\n");
}

function parseSectionItems(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...descriptionParts] = line.split("|");
      return {
        title: title.trim(),
        description: descriptionParts.join("|").trim() || "Por verificar",
      };
    });
}

function parseResourceItems(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, description = "", url = "", type = "otro"] = line
        .split("|")
        .map((part) => part.trim());
      return {
        title,
        description: description || "Recurso oficial relacionado al servicio.",
        url,
        type: type || "otro",
      };
    });
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function validateTextField(selector, label, errors) {
  const field = document.querySelector(selector);
  const value = field?.value.trim() || "";

  field?.classList.remove("input-error");
  if (!value) {
    errors.push(`${label} es obligatorio.`);
    field?.classList.add("input-error");
  }

  return value;
}

function validateSectionField(selector, label, errors) {
  const field = document.querySelector(selector);
  const value = field?.value.trim() || "";
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);

  field?.classList.remove("input-error");

  if (lines.length === 0) {
    errors.push(`${label} debe tener al menos un elemento.`);
    field?.classList.add("input-error");
    return [];
  }

  const hasInvalidLine = lines.some((line) => {
    const [title, ...descriptionParts] = line.split("|");
    return !title?.trim() || !descriptionParts.join("|").trim();
  });

  if (hasInvalidLine) {
    errors.push(`${label} debe usar el formato: Título | Descripción.`);
    field?.classList.add("input-error");
  }

  return parseSectionItems(value);
}

function validateOptionalSectionField(selector, label, errors) {
  const field = document.querySelector(selector);
  const value = field?.value.trim() || "";
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);

  field?.classList.remove("input-error");
  if (lines.length === 0) return [];

  const hasInvalidLine = lines.some((line) => {
    const [title, ...descriptionParts] = line.split("|");
    return !title?.trim() || !descriptionParts.join("|").trim();
  });

  if (hasInvalidLine) {
    errors.push(`${label} debe usar el formato: Título | Descripción.`);
    field?.classList.add("input-error");
  }

  return parseSectionItems(value);
}

function validateResourceField(selector, label, errors) {
  const field = document.querySelector(selector);
  const value = field?.value.trim() || "";
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);

  field?.classList.remove("input-error");
  if (lines.length === 0) return [];

  const hasInvalidLine = lines.some((line) => {
    const [title, , url] = line.split("|").map((part) => part.trim());
    return !title || !url || !isValidHttpUrl(url);
  });

  if (hasInvalidLine) {
    errors.push(`${label} debe usar el formato: Título | Descripción | URL | Tipo con enlaces válidos.`);
    field?.classList.add("input-error");
  }

  return parseResourceItems(value);
}

function isServiceInactive(serviceData) {
  return serviceData.active === false;
}

async function toggleServiceStatus(serviceData) {
  const nextActive = serviceData.active === false;
  await setServiceActive(serviceData.id, nextActive);
  rawService = { ...serviceData, active: nextActive };
  showDetailToast(nextActive ? "Servicio activado" : "Servicio desactivado");
  renderServiceDetail(rawService);
}

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

function renderChecklist(items = []) {
  if (!items.length) return "";

  return `
    <section class="checklist-section" aria-labelledby="checklist-title">
      <div class="section-heading-inline">
        <h2 id="checklist-title">Checklist antes de iniciar</h2>
        <p>Marca lo que ya tienes listo. Esta lista no modifica tus datos.</p>
      </div>
      <ul class="checklist-list">
        ${items
          .map(
            (item, index) => `
              <li>
                <label class="checklist-item">
                  <input type="checkbox" aria-label="${escapeHtml(item.title)}" />
                  <span>
                    <strong>${escapeHtml(item.title)}</strong>
                    <small>${escapeHtml(item.description)}</small>
                  </span>
                </label>
              </li>
            `,
          )
          .join("")}
      </ul>
    </section>
  `;
}

function renderResources(items = []) {
  if (!items.length) return "";

  return `
    <section class="resources-section" aria-labelledby="resources-title">
      <h2 id="resources-title">Recursos útiles</h2>
      <div class="resources-grid">
        ${items
          .map(
            (item) => `
              <article class="resource-card">
                <span>${escapeHtml(item.type || "recurso")}</span>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
                <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">
                  Abrir recurso →
                </a>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderAdminEditor(data) {
  if (!isAdminUser()) return "";

  return `
    <section class="admin-service-editor" id="admin-service-editor" aria-labelledby="admin-editor-title" hidden>
      <div class="admin-service-editor-heading">
        <div>
          <p>Administración</p>
          <h2 id="admin-editor-title">Editar contenido del servicio</h2>
        </div>
        <div class="admin-editor-heading-actions">
          <span>Guardado en Firestore</span>
          <button type="button" id="admin-close-editor">Cerrar editor</button>
        </div>
      </div>
      <form class="admin-service-form" id="admin-service-form">
        <label>
          Título
          <input id="admin-edit-name" type="text" value="${escapeHtml(data.name)}" />
        </label>
        <label>
          Descripción principal
          <textarea id="admin-edit-description">${escapeHtml(data.description)}</textarea>
        </label>
        <label>
          Descripción corta para catálogo
          <textarea id="admin-edit-short-description">${escapeHtml(data.shortDescription)}</textarea>
        </label>
        <label>
          Requisitos
          <textarea id="admin-edit-requirements" aria-describedby="admin-editor-help">${escapeHtml(formatSectionItems(data.requirements))}</textarea>
        </label>
        <label>
          Documentos
          <textarea id="admin-edit-documents">${escapeHtml(formatSectionItems(data.documents))}</textarea>
        </label>
        <label>
          Pasos
          <textarea id="admin-edit-steps">${escapeHtml(formatSectionItems(data.steps))}</textarea>
        </label>
        <label>
          Canales de atención
          <textarea id="admin-edit-channels">${escapeHtml(formatSectionItems(data.channels))}</textarea>
        </label>
        <label>
          Recursos útiles
          <textarea id="admin-edit-resources" placeholder="Título | Descripción | URL | Tipo">${escapeHtml(formatResourceItems(data.resources))}</textarea>
        </label>
        <label>
          Checklist
          <textarea id="admin-edit-checklist" placeholder="Título | Descripción">${escapeHtml(formatSectionItems(data.checklist))}</textarea>
        </label>
        <p class="admin-editor-help" id="admin-editor-help">
          Escribe cada elemento en una línea. Listas: Título | Descripción. Recursos: Título | Descripción | URL | Tipo.
        </p>
        <ul class="admin-validation-list" id="admin-validation-list" hidden></ul>
        <div class="admin-service-form-actions">
          <button type="submit">Guardar cambios</button>
          <button type="button" id="admin-reset-draft">Restablecer formulario</button>
        </div>
        <p class="admin-editor-message" id="admin-editor-message" aria-live="polite"></p>
      </form>
    </section>
  `;
}

function renderAdminPanel(data) {
  if (!isAdminUser()) return "";

  return `
    <section class="admin-detail-panel" aria-labelledby="admin-panel-title">
      <div>
        <p>Administración</p>
        <h2 id="admin-panel-title">Gestión del servicio</h2>
        <span>${isServiceInactive(data) ? "Este servicio está oculto para usuarios." : "Este servicio está publicado en el catálogo."}</span>
      </div>
      <div class="admin-detail-panel-actions">
        <button type="button" id="admin-open-editor">Editar contenido</button>
        <button class="detail-admin-toggle" type="button">
          ${isServiceInactive(data) ? "Activar servicio" : "Desactivar servicio"}
        </button>
      </div>
    </section>
  `;
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
  window.CercaRedCurrentService = data;

  const currentService = {
    id: data.id,
    name: data.name,
    category: data.category
  };
  localStorage.setItem('cercared_last_visited', JSON.stringify(currentService));

  detailRoot.innerHTML = `
    <div class="detail-layout">
      <div class="detail-content">
        <nav class="breadcrumb" aria-label="Ruta de navegación">
          <a href="index.html">Catálogo</a>
          <span aria-hidden="true">→</span>
          <span>${data.name}</span>
        </nav>

        ${renderAdminPanel(data)}

        <section class="detail-hero" aria-labelledby="detail-title">
          <h1 id="detail-title">${data.name}</h1>
          <p>${data.description}</p>
        </section>

        ${renderAdminEditor(data)}

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

        ${renderChecklist(data.checklist)}
        ${renderResources(data.resources)}

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

        <section class="sidebar-card sidebar-channels-card" aria-labelledby="sidebar-channels-title">
          <h2 id="sidebar-channels-title">Canales de atención</h2>
          <ul class="channels-list">
            ${renderChannels(data.channels)}
          </ul>
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
  window.dispatchEvent(new CustomEvent("cercared:service-rendered", { detail: data }));
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
  const checklist = (data.checklist || []).map((item) => `- ${item.title}`).join("\n");
  const resources = (data.resources || []).map((item) => `- ${item.title}: ${item.url}`).join("\n");
  return `${data.name}\n\nRequisitos principales:\n${requirements}\n\nPasos:\n${steps}${checklist ? `\n\nChecklist:\n${checklist}` : ""}${resources ? `\n\nRecursos utiles:\n${resources}` : ""}\n\nCanal oficial: ${data.officialUrl}`;
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
  const adminToggleButton = document.querySelector(".detail-admin-toggle");
  const adminOpenButton = document.querySelector("#admin-open-editor");
  const adminCloseButton = document.querySelector("#admin-close-editor");
  const adminEditor = document.querySelector("#admin-service-editor");
  const adminForm = document.querySelector("#admin-service-form");
  const adminResetButton = document.querySelector("#admin-reset-draft");
  const validationList = document.querySelector("#admin-validation-list");

  function openAdminEditor() {
    if (!adminEditor) return;
    adminEditor.hidden = false;
    adminEditor.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelector("#admin-edit-name")?.focus();
  }

  function closeAdminEditor() {
    if (!adminEditor) return;
    adminEditor.hidden = true;
    document.querySelector("#admin-open-editor")?.focus();
  }

  function renderValidationErrors(errors) {
    if (!validationList) return;

    validationList.replaceChildren(
      ...errors.map((error) => {
        const item = document.createElement("li");
        item.textContent = error;
        return item;
      }),
    );
    validationList.hidden = errors.length === 0;
  }

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

  adminOpenButton?.addEventListener("click", openAdminEditor);
  adminCloseButton?.addEventListener("click", closeAdminEditor);

  if (window.location.hash === "#admin-service-editor") {
    window.requestAnimationFrame(openAdminEditor);
  }

  adminToggleButton?.addEventListener("click", () => {
    toggleServiceStatus(data).catch((error) => {
      console.error(error);
      showDetailToast("No se pudo cambiar el estado");
    });
  });

  adminForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const errors = [];
    const updates = {
      name: validateTextField("#admin-edit-name", "Título", errors),
      description: validateTextField("#admin-edit-description", "Descripción principal", errors),
      shortDescription: validateTextField("#admin-edit-short-description", "Descripción corta", errors),
      requirements: validateSectionField("#admin-edit-requirements", "Requisitos", errors),
      documents: validateSectionField("#admin-edit-documents", "Documentos", errors),
      steps: validateSectionField("#admin-edit-steps", "Pasos", errors),
      channels: validateSectionField("#admin-edit-channels", "Canales de atención", errors),
      resources: validateResourceField("#admin-edit-resources", "Recursos útiles", errors),
      checklist: validateOptionalSectionField("#admin-edit-checklist", "Checklist", errors),
    };

    renderValidationErrors(errors);
    if (errors.length > 0) {
      showDetailToast("Revisa los campos marcados");
      return;
    }

    try {
      await updateService(data.id, updates);
      rawService = { ...data, ...updates };
      showDetailToast("Cambios guardados");
      renderServiceDetail(rawService);
      document.querySelector("#admin-service-editor")?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error(error);
      showDetailToast("No se pudo guardar en Firestore");
    }
  });

  adminResetButton?.addEventListener("click", () => {
    renderValidationErrors([]);
    document.querySelectorAll(".admin-service-form .input-error").forEach((field) => {
      field.classList.remove("input-error");
    });
    showDetailToast("Formulario restablecido");
    renderServiceDetail(data);
    window.requestAnimationFrame(openAdminEditor);
  });
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

  const checklistItems = (data.checklist || [])
    .map((c) => `<li class="summary-modal-channel">${c.title}. ${c.description}</li>`)
    .join("");

  const resourceItems = (data.resources || [])
    .map((r) => `<li class="summary-modal-channel">${r.title}. ${r.url}</li>`)
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

        ${(checklistItems || resourceItems) ? `
          <div class="summary-modal-grid">
            ${checklistItems ? `
              <div>
                <h3 class="summary-modal-section-title">Checklist</h3>
                <ul class="summary-modal-channels">${checklistItems}</ul>
              </div>
            ` : ""}
            ${resourceItems ? `
              <div>
                <h3 class="summary-modal-section-title">Recursos utiles</h3>
                <ul class="summary-modal-channels">${resourceItems}</ul>
              </div>
            ` : ""}
          </div>
        ` : ""}
 
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
 
function openSummaryModal(data) {
  document.querySelector("#summary-modal-overlay")?.remove();
  document.body.insertAdjacentHTML("beforeend", buildSummaryModal(data));
 
  const overlay = document.querySelector("#summary-modal-overlay");
  const closeBtn = document.querySelector("#summary-modal-close");
  const copyBtn = document.querySelector("#summary-modal-copy-btn");
  const pdfBtn = document.querySelector("#summary-modal-pdf-btn");
 
  requestAnimationFrame(() => overlay.classList.add("is-open"));
 
  const previousFocus = document.activeElement;
  closeBtn.focus();
 
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSummaryModal(overlay, previousFocus);
  });
 
  closeBtn.addEventListener("click", () => closeSummaryModal(overlay, previousFocus));
 
  function handleKeydown(e) {
    if (e.key === "Escape") {
      closeSummaryModal(overlay, previousFocus);
      document.removeEventListener("keydown", handleKeydown);
    }
  }
  document.addEventListener("keydown", handleKeydown);
 
  copyBtn.addEventListener("click", async () => {
    await copySummary(data);
  });
 
  pdfBtn.addEventListener("click", () => downloadSummaryPDF(data));
}
 
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
 
function downloadSummaryPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(26, 38, 57); 
  doc.text("RESUMEN DEL SERVICIO - CERCARED", 15, 20);
  
  doc.setDrawColor(230, 0, 35); 
  doc.setLineWidth(1);
  doc.line(15, 24, 195, 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(230, 0, 35);
  doc.text(data.name.toUpperCase(), 15, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Categoría: ${data.category}  |  Entidad: ${data.shortEntity}  |  Costo: ${data.cost}`, 15, 40);

  let currentY = 52;

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
        if (titulo === "CANALES DE ATENCIÓN") {
          textoLinea = `• ${item.title}: ${item.description}`;
        }
        if (titulo === "RECURSOS ÚTILES") {
          textoLinea = `• ${item.title}: ${item.url}`;
        }
        const lineasFragmentadas = doc.splitTextToSize(textoLinea, 175);
        doc.text(lineasFragmentadas, 18, currentY);
        currentY += (lineasFragmentadas.length * 5);
      });
    } else {
      const lineasFragmentadas = doc.splitTextToSize(elementos, 175);
      doc.text(lineasFragmentadas, 15, currentY);
      currentY += (lineasFragmentadas.length * 5);
    }
    currentY += 6;
  }

  agregarSeccion("DESCRIPCIÓN", data.description, false);
  agregarSeccion("REQUISITOS PRINCIPALES", data.requirements, true);
  agregarSeccion("DOCUMENTOS BÁSICOS", data.documents, true);
  agregarSeccion("PASOS", data.steps, false);
  agregarSeccion("CANALES DE ATENCIÓN", data.channels, true);
  agregarSeccion("CHECKLIST", data.checklist, true);
  agregarSeccion("RECURSOS ÚTILES", data.resources, true);

  if (currentY > 260) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(26, 38, 57);
  doc.text(`Canal oficial: ${data.officialUrl}`, 15, currentY + 4);

  doc.setDrawColor(220, 220, 220);
  doc.line(15, 278, 195, 278);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generado desde CercaRed · Servicios sociales cerca de ti", 15, 284);

  doc.save(`resumen-${data.id}.pdf`);
  showDetailToast("Resumen descargado");
}

async function trackServiceVisit(serviceData) {
  if (!serviceData || !serviceData.id) return;
  try {
    const metricDocRef = doc(db, "metrics", serviceData.id);
    await setDoc(metricDocRef, {
      serviceName: serviceData.name,
      category: serviceData.category || "Sin categoría",
      visits: increment(1),
      lastVisited: new Date().toISOString()
    }, { merge: true });
    console.log(`[Métricas] Incrementado conteo para: ${serviceData.name}`);
  } catch (error) {
    console.error("Error al registrar la métrica de visita:", error);
  }
}

async function initDetail() {
  const services = await loadServices();
  rawService = services.find((item) => item.id === serviceId);

  if (rawService && (isAdminUser() || !isServiceInactive(rawService))) {
    renderServiceDetail(rawService);
    trackServiceVisit(rawService);
  } else {
    renderNotFound();
  }
}

initDetail();