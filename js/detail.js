import { doc, increment, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db, loadServices, setServiceActive, updateService } from "./service-store.js";

const detailRoot = document.querySelector("#service-detail");
const params = new URLSearchParams(window.location.search);
const serviceId = params.get("id") || "pension-65";
let rawService = null;
const MAX_IMAGE_SIZE_BYTES = 350_000;
const MAX_CUSTOM_SECTIONS = 3;
const MAX_CUSTOM_ITEMS = 8;
const MAX_SELECT_OPTIONS = 6;

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

function getImageHelpers() {
  return window.CercaRedServiceImages || {};
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("Adjunta una imagen en formato JPG, PNG, WebP o SVG."));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      reject(new Error("La imagen supera 350 KB. Usa un archivo más liviano."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("No se pudo leer la imagen seleccionada."));
    reader.readAsDataURL(file);
  });
}

function getServiceImageMarkup(service, className, alt) {
  const candidates = getImageHelpers().getServiceImageCandidates?.(service) || ["assets/images/cards/default.svg"];
  const escapedSources = escapeHtml(JSON.stringify(candidates));

  return `
    <img
      class="${className}"
      src="${escapeHtml(candidates[0])}"
      alt="${escapeHtml(alt)}"
      data-image-candidates="${escapedSources}"
    />
  `;
}

function wireImageFallbacks(root = document) {
  const helpers = getImageHelpers();
  root.querySelectorAll("[data-image-candidates]").forEach((img) => {
    try {
      const candidates = JSON.parse(img.dataset.imageCandidates || "[]");
      helpers.attachFallback?.(img, candidates);
    } catch {
      // Keep the original src if dataset parsing fails.
    }
  });
}

function updateImagePreview(preview, serviceLike) {
  if (!preview) return;

  const candidates = getImageHelpers().getServiceImageCandidates?.(serviceLike) || ["assets/images/cards/default.svg"];
  preview.alt = serviceLike?.name
    ? `Vista previa de ${serviceLike.name}`
    : "Vista previa de la imagen del servicio";
  getImageHelpers().attachFallback?.(preview, candidates);
  if (!preview.src) {
    preview.src = candidates[0];
  }
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

function slugifySectionId(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "seccion";
}

function normalizeCustomSections(customSections = []) {
  if (!Array.isArray(customSections)) return [];

  return customSections
    .map((section, index) => {
      const title = String(section?.title || "").trim().slice(0, 40);
      const kind = ["text", "items", "resources", "select"].includes(section?.kind)
        ? section.kind
        : "text";
      const id = slugifySectionId(section?.id || title || `seccion-${index + 1}`);
      const baseSection = {
        id,
        title: title || `Sección ${index + 1}`,
        kind,
        showInSimple: section?.showInSimple !== false,
      };

      if (kind === "text") {
        return { ...baseSection, content: String(section?.content || "").trim() };
      }

      if (kind === "select") {
        const options = Array.isArray(section?.options)
          ? section.options.map((option) => String(option || "").trim()).filter(Boolean).slice(0, MAX_SELECT_OPTIONS)
          : [];
        const value = String(section?.value || options[0] || "").trim();
        return { ...baseSection, options, value };
      }

      const items = Array.isArray(section?.items)
        ? section.items
          .map((item) => ({
            title: String(item?.title || "").trim(),
            description: String(item?.description || "").trim(),
            ...(kind === "resources"
              ? {
                  url: String(item?.url || "").trim(),
                  type: String(item?.type || "otro").trim() || "otro",
                }
              : {}),
          }))
          .filter((item) => item.title && (kind === "resources" ? item.url : item.description))
          .slice(0, MAX_CUSTOM_ITEMS)
        : [];

      return { ...baseSection, items };
    })
    .filter((section) => {
      if (section.kind === "text") return Boolean(section.content);
      if (section.kind === "select") return section.options.length > 0;
      return section.items.length > 0;
    })
    .slice(0, MAX_CUSTOM_SECTIONS);
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

function formatCustomSectionValue(section) {
  if (!section) return "";
  if (section.kind === "text") return section.content || "";
  if (section.kind === "select") return (section.options || []).join("\n");
  if (section.kind === "resources") return formatResourceItems(section.items || []);
  return formatSectionItems(section.items || []);
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

function buildCustomSectionEditor(section = {}, index = 0) {
  const normalized = normalizeCustomSections([section])[0] || {
    id: `seccion-${index + 1}`,
    title: "",
    kind: "text",
    content: "",
    showInSimple: true,
  };
  const sectionValue = formatCustomSectionValue(normalized);

  return `
    <article class="admin-custom-section-card" data-custom-section data-section-id="${escapeHtml(normalized.id)}">
      <div class="admin-custom-section-header">
        <h3>Sección extra ${index + 1}</h3>
        <button type="button" class="admin-custom-section-remove">Quitar</button>
      </div>
      <div class="admin-custom-section-grid">
        <label>
          Título
          <input type="text" data-custom-title maxlength="40" value="${escapeHtml(normalized.title)}" />
        </label>
        <label>
          Tipo
          <select data-custom-kind>
            <option value="text"${normalized.kind === "text" ? " selected" : ""}>Texto</option>
            <option value="items"${normalized.kind === "items" ? " selected" : ""}>Lista</option>
            <option value="resources"${normalized.kind === "resources" ? " selected" : ""}>Recursos</option>
            <option value="select"${normalized.kind === "select" ? " selected" : ""}>Desplegable</option>
          </select>
        </label>
        <label class="admin-custom-section-toggle">
          <input type="checkbox" data-custom-simple${normalized.showInSimple ? " checked" : ""} />
          Mostrar en modo simple
        </label>
      </div>
      <label class="admin-custom-section-body">
        <span data-custom-body-label>${normalized.kind === "text"
          ? "Contenido"
          : normalized.kind === "select"
            ? "Opciones, una por línea"
            : normalized.kind === "resources"
              ? "Recursos"
              : "Elementos"}</span>
        <textarea
          data-custom-value
          data-kind="${escapeHtml(normalized.kind)}"
          placeholder="${normalized.kind === "text"
            ? "Escribe un bloque breve y claro."
            : normalized.kind === "select"
              ? "Presencial\nVirtual\nMixta"
              : normalized.kind === "resources"
                ? "Título | Descripción | URL | Tipo"
                : "Título | Descripción"}"
        >${escapeHtml(sectionValue)}</textarea>
      </label>
      ${normalized.kind === "select" ? `
        <label>
          Valor por defecto
          <input type="text" data-custom-selected value="${escapeHtml(normalized.value || "")}" />
        </label>
      ` : ""}
    </article>
  `;
}

function renderCustomSectionsEditor(container, sections = []) {
  if (!container) return;
  const normalized = normalizeCustomSections(sections);
  container.innerHTML = normalized.length
    ? normalized.map((section, index) => buildCustomSectionEditor(section, index)).join("")
    : '<p class="admin-custom-sections-empty">No hay secciones extra. Puedes agregar hasta 3.</p>';
}

function syncCustomSectionCard(card) {
  if (!card) return;
  const kind = card.querySelector("[data-custom-kind]")?.value || "text";
  const label = card.querySelector("[data-custom-body-label]");
  const textarea = card.querySelector("[data-custom-value]");
  const selectedField = card.querySelector("[data-custom-selected]")?.closest("label");

  if (label) {
    label.textContent = kind === "text"
      ? "Contenido"
      : kind === "select"
        ? "Opciones, una por línea"
        : kind === "resources"
          ? "Recursos"
          : "Elementos";
  }

  if (textarea) {
    textarea.dataset.kind = kind;
    textarea.placeholder = kind === "text"
      ? "Escribe un bloque breve y claro."
      : kind === "select"
        ? "Presencial\nVirtual\nMixta"
        : kind === "resources"
          ? "Título | Descripción | URL | Tipo"
          : "Título | Descripción";
  }

  if (selectedField) {
    selectedField.hidden = kind !== "select";
  }
}

function addCustomSectionEditor(container, section = {}) {
  if (!container) return;
  const cards = container.querySelectorAll("[data-custom-section]");
  if (cards.length >= MAX_CUSTOM_SECTIONS) {
    showDetailToast(`Máximo ${MAX_CUSTOM_SECTIONS} secciones extra para mantener la vista compacta.`);
    return;
  }
  container.querySelector(".admin-custom-sections-empty")?.remove();
  container.insertAdjacentHTML("beforeend", buildCustomSectionEditor(section, cards.length));
  syncCustomSectionCard(container.lastElementChild);
}

function validateInlineItemsSection(value, title, errors) {
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
  const hasInvalidLine = lines.some((line) => {
    const [itemTitle, ...descriptionParts] = line.split("|");
    return !itemTitle?.trim() || !descriptionParts.join("|").trim();
  });

  if (hasInvalidLine) {
    errors.push(`Sección "${title}": usa el formato Título | Descripción.`);
    return null;
  }

  return parseSectionItems(value);
}

function validateInlineResourceSection(value, title, errors) {
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
  const hasInvalidLine = lines.some((line) => {
    const [itemTitle, , url] = line.split("|").map((part) => part.trim());
    return !itemTitle || !url || !isValidHttpUrl(url);
  });

  if (hasInvalidLine) {
    errors.push(`Sección "${title}": usa el formato Título | Descripción | URL | Tipo.`);
    return null;
  }

  return parseResourceItems(value);
}

function validateCustomSections(container, errors) {
  const cards = Array.from(container?.querySelectorAll("[data-custom-section]") || []);
  const sections = [];

  cards.forEach((card, index) => {
    const titleField = card.querySelector("[data-custom-title]");
    const kindField = card.querySelector("[data-custom-kind]");
    const valueField = card.querySelector("[data-custom-value]");
    const selectedField = card.querySelector("[data-custom-selected]");
    const title = titleField?.value.trim() || "";
    const kind = kindField?.value || "text";
    const rawValue = valueField?.value.trim() || "";
    const showInSimple = card.querySelector("[data-custom-simple]")?.checked !== false;

    titleField?.classList.remove("input-error");
    valueField?.classList.remove("input-error");
    selectedField?.classList.remove("input-error");

    if (!title) {
      errors.push(`Sección extra ${index + 1}: el título es obligatorio.`);
      titleField?.classList.add("input-error");
      return;
    }

    if (!rawValue) {
      errors.push(`Sección "${title}": agrega contenido.`);
      valueField?.classList.add("input-error");
      return;
    }

    if (kind === "text") {
      sections.push({ id: slugifySectionId(title), title, kind, content: rawValue, showInSimple });
      return;
    }

    if (kind === "select") {
      const options = rawValue.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, MAX_SELECT_OPTIONS);
      const selectedValue = selectedField?.value.trim() || options[0] || "";
      if (!options.length) {
        errors.push(`Sección "${title}": agrega al menos una opción.`);
        valueField?.classList.add("input-error");
        return;
      }
      if (selectedValue && !options.includes(selectedValue)) {
        errors.push(`Sección "${title}": el valor por defecto debe coincidir con una opción.`);
        selectedField?.classList.add("input-error");
        return;
      }
      sections.push({ id: slugifySectionId(title), title, kind, options, value: selectedValue || options[0], showInSimple });
      return;
    }

    if (kind === "resources") {
      const items = validateInlineResourceSection(rawValue, title, errors);
      if (!items) {
        valueField?.classList.add("input-error");
        return;
      }
      sections.push({ id: slugifySectionId(title), title, kind, items: items.slice(0, MAX_CUSTOM_ITEMS), showInSimple });
      return;
    }

    const items = validateInlineItemsSection(rawValue, title, errors);
    if (!items) {
      valueField?.classList.add("input-error");
      return;
    }
    sections.push({ id: slugifySectionId(title), title, kind, items: items.slice(0, MAX_CUSTOM_ITEMS), showInSimple });
  });

  return normalizeCustomSections(sections);
}

function validateUrlField(selector, label, errors) {
  const field = document.querySelector(selector);
  const value = field?.value.trim() || "";

  field?.classList.remove("input-error");
  if (!value) return value;

  if (!isValidHttpUrl(value)) {
    errors.push(`${label} debe ser un enlace válido.`);
    field?.classList.add("input-error");
  }

  return value;
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

function renderCustomSections(customSections = []) {
  const sections = normalizeCustomSections(customSections);
  if (!sections.length) return "";

  return sections
    .map((section) => {
      if (section.kind === "text") {
        return `
          <section class="custom-section" aria-labelledby="custom-section-${escapeHtml(section.id)}">
            <h2 id="custom-section-${escapeHtml(section.id)}">${escapeHtml(section.title)}</h2>
            <div class="custom-section-text">${escapeHtml(section.content)}</div>
          </section>
        `;
      }

      if (section.kind === "select") {
        return `
          <section class="custom-section" aria-labelledby="custom-section-${escapeHtml(section.id)}">
            <h2 id="custom-section-${escapeHtml(section.id)}">${escapeHtml(section.title)}</h2>
            <label class="procedure-select custom-section-select">
              <span class="visually-hidden">${escapeHtml(section.title)}</span>
              <select>
                ${section.options.map((option) => `<option${option === section.value ? " selected" : ""}>${escapeHtml(option)}</option>`).join("")}
              </select>
            </label>
          </section>
        `;
      }

      if (section.kind === "resources") {
        return `
          <section class="custom-section" aria-labelledby="custom-section-${escapeHtml(section.id)}">
            <h2 id="custom-section-${escapeHtml(section.id)}">${escapeHtml(section.title)}</h2>
            <div class="resources-grid">
              ${section.items.map((item) => `
                <article class="resource-card">
                  <span>${escapeHtml(item.type || "recurso")}</span>
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.description)}</p>
                  <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Abrir recurso →</a>
                </article>
              `).join("")}
            </div>
          </section>
        `;
      }

      return `
        <section class="custom-section" aria-labelledby="custom-section-${escapeHtml(section.id)}">
          <h2 id="custom-section-${escapeHtml(section.id)}">${escapeHtml(section.title)}</h2>
          <div class="stacked-cards">
            ${renderCards(section.items || [])}
          </div>
        </section>
      `;
    })
    .join("");
}

function fillAdminServiceForm(service) {
  document.querySelector("#admin-edit-name").value = service.name || "";
  document.querySelector("#admin-edit-description").value = service.description || "";
  document.querySelector("#admin-edit-short-description").value = service.shortDescription || "";
  document.querySelector("#admin-edit-official-url").value = service.officialUrl || "";
  document.querySelector("#admin-edit-requirements").value = formatSectionItems(service.requirements);
  document.querySelector("#admin-edit-documents").value = formatSectionItems(service.documents);
  document.querySelector("#admin-edit-steps").value = formatSectionItems(service.steps);
  document.querySelector("#admin-edit-channels").value = formatSectionItems(service.channels);
  document.querySelector("#admin-edit-resources").value = formatResourceItems(service.resources);
  document.querySelector("#admin-edit-checklist").value = formatSectionItems(service.checklist);
  renderCustomSectionsEditor(document.querySelector("#admin-edit-custom-sections"), service.customSections);
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
          <button type="button" id="admin-close-editor" aria-label="Cerrar editor">×</button>
        </div>
      </div>
      <form class="admin-service-form" id="admin-service-form">
        <label>
          Título
          <input id="admin-edit-name" type="text" value="${escapeHtml(data.name)}" />
        </label>
        <section class="admin-image-field" aria-labelledby="admin-image-title">
          <div class="admin-image-field-copy">
            <p id="admin-image-title">Imagen del servicio</p>
            <span>Sube una nueva portada o conserva la imagen actual.</span>
          </div>
          <div class="admin-image-field-layout">
            ${getServiceImageMarkup(data, "admin-service-image-preview", `Vista previa de ${data.name}`)}
            <div class="admin-image-field-actions">
              <input id="admin-edit-image-file" type="file" accept="image/png, image/jpeg, image/webp, image/svg+xml" />
              <input id="admin-edit-image-data" type="hidden" value="${escapeHtml(data.image || "")}" />
              <button type="button" id="admin-clear-image">Quitar imagen personalizada</button>
            </div>
          </div>
        </section>
        <label>
          Descripción principal
          <textarea id="admin-edit-description">${escapeHtml(data.description)}</textarea>
        </label>
        <label>
          Descripción corta para catálogo
          <textarea id="admin-edit-short-description">${escapeHtml(data.shortDescription)}</textarea>
        </label>
        <label>
          Canal oficial
          <input id="admin-edit-official-url" type="url" value="${escapeHtml(data.officialUrl || "")}" placeholder="https://www.gob.pe/..." />
        </label>
        <section class="admin-ai-refresh" aria-labelledby="admin-ai-refresh-title">
          <div class="admin-ai-refresh-copy">
            <p id="admin-ai-refresh-title">Actualizar con IA</p>
            <span>Pega enlaces o notas verificadas para regenerar este borrador sin salir del editor.</span>
          </div>
          <textarea id="admin-edit-ai-sources" placeholder="https://www.gob.pe/...

Opcional: agrega notas o nuevas fuentes para mejorar el borrador."></textarea>
          <div class="admin-ai-refresh-actions">
            <button type="button" id="admin-refresh-with-ai">Usar enlaces con IA</button>
          </div>
        </section>
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
        <section class="admin-custom-sections" aria-labelledby="admin-custom-sections-title">
          <div class="admin-custom-sections-header">
            <div>
              <h3 id="admin-custom-sections-title">Secciones extra</h3>
              <p>Máximo 3. Úsalas para bloques adicionales compactos y visibles también en el detalle.</p>
            </div>
            <button type="button" id="admin-add-custom-section">Agregar sección</button>
          </div>
          <div id="admin-edit-custom-sections">
            ${normalizeCustomSections(data.customSections).map((section, index) => buildCustomSectionEditor(section, index)).join("") || '<p class="admin-custom-sections-empty">No hay secciones extra. Puedes agregar hasta 3.</p>'}
          </div>
        </section>
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
  data = {
    ...data,
    customSections: normalizeCustomSections(data.customSections),
  };
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
          <div class="detail-hero-copy">
            <h1 id="detail-title">${data.name}</h1>
            <p>${data.description}</p>
          </div>
          ${getServiceImageMarkup(data, "detail-hero-image", `Imagen de ${data.name}`)}
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
        </div>

        ${renderChecklist(data.checklist)}
        ${renderResources(data.resources)}
        ${renderCustomSections(data.customSections)}

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
  wireImageFallbacks(detailRoot);
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
    image: data.image || "",
    url: getShareUrl(data.id),
  };
}

function buildSummary(data) {
  const requirements = data.requirements.map((item) => `- ${item.title}`).join("\n");
  const steps = data.steps.map((item, index) => `${index + 1}. ${item.title}`).join("\n");
  const checklist = (data.checklist || []).map((item) => `- ${item.title}`).join("\n");
  const resources = (data.resources || []).map((item) => `- ${item.title}: ${item.url}`).join("\n");
  const extraSections = normalizeCustomSections(data.customSections)
    .map((section) => {
      if (section.kind === "text") return `${section.title}:\n${section.content}`;
      if (section.kind === "select") return `${section.title}:\n- ${section.value || section.options[0] || "Por verificar"}`;
      if (section.kind === "resources") return `${section.title}:\n${section.items.map((item) => `- ${item.title}: ${item.url}`).join("\n")}`;
      return `${section.title}:\n${section.items.map((item) => `- ${item.title}`).join("\n")}`;
    })
    .join("\n\n");

  return `${data.name}\n\nRequisitos principales:\n${requirements}\n\nPasos:\n${steps}${checklist ? `\n\nChecklist:\n${checklist}` : ""}${resources ? `\n\nRecursos utiles:\n${resources}` : ""}${extraSections ? `\n\n${extraSections}` : ""}\n\nCanal oficial: ${data.officialUrl}`;
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
  const imageInput = document.querySelector("#admin-edit-image-file");
  const imageData = document.querySelector("#admin-edit-image-data");
  const imagePreview = document.querySelector(".admin-service-image-preview");
  const clearImageButton = document.querySelector("#admin-clear-image");
  const aiRefreshButton = document.querySelector("#admin-refresh-with-ai");
  const aiSourcesField = document.querySelector("#admin-edit-ai-sources");
  const customSectionsContainer = document.querySelector("#admin-edit-custom-sections");
  const addCustomSectionButton = document.querySelector("#admin-add-custom-section");

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
  addCustomSectionButton?.addEventListener("click", () => addCustomSectionEditor(customSectionsContainer));

  customSectionsContainer?.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".admin-custom-section-remove");
    if (!removeButton) return;
    removeButton.closest("[data-custom-section]")?.remove();
    if (!customSectionsContainer.querySelector("[data-custom-section]")) {
      renderCustomSectionsEditor(customSectionsContainer, []);
    }
  });

  customSectionsContainer?.addEventListener("change", (event) => {
    const card = event.target.closest("[data-custom-section]");
    if (!card) return;
    if (event.target.matches("[data-custom-kind]")) {
      syncCustomSectionCard(card);
    }
  });

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
      officialUrl: validateUrlField("#admin-edit-official-url", "Canal oficial", errors) || "#",
      requirements: validateSectionField("#admin-edit-requirements", "Requisitos", errors),
      documents: validateSectionField("#admin-edit-documents", "Documentos", errors),
      steps: validateSectionField("#admin-edit-steps", "Pasos", errors),
      channels: validateSectionField("#admin-edit-channels", "Canales de atención", errors),
      resources: validateResourceField("#admin-edit-resources", "Recursos útiles", errors),
      checklist: validateOptionalSectionField("#admin-edit-checklist", "Checklist", errors),
      customSections: validateCustomSections(customSectionsContainer, errors),
      image: imageData?.value.trim() || "",
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

  imageInput?.addEventListener("change", async () => {
    try {
      const file = imageInput.files?.[0];
      const image = await readImageFile(file);
      if (imageData) imageData.value = image;
      updateImagePreview(imagePreview, {
        id: data.id,
        name: document.querySelector("#admin-edit-name")?.value || data.name,
        image,
      });
      showDetailToast(file ? "Imagen cargada" : "Imagen restablecida");
    } catch (error) {
      imageInput.value = "";
      if (imageData) imageData.value = data.image || "";
      updateImagePreview(imagePreview, {
        id: data.id,
        name: data.name,
        image: data.image || "",
      });
      showDetailToast(error.message);
    }
  });

  clearImageButton?.addEventListener("click", () => {
    if (imageInput) imageInput.value = "";
    if (imageData) imageData.value = "";
    updateImagePreview(imagePreview, {
      id: data.id,
      name: document.querySelector("#admin-edit-name")?.value || data.name,
    });
    showDetailToast("Se quitó la imagen personalizada");
  });

  aiRefreshButton?.addEventListener("click", async () => {
    const sources = aiSourcesField?.value.trim() || "";
    if (!sources) {
      aiSourcesField?.classList.add("input-error");
      showDetailToast("Pega al menos un enlace o nota para usar la IA");
      return;
    }

    aiSourcesField?.classList.remove("input-error");
    aiRefreshButton.disabled = true;
    aiRefreshButton.textContent = "Generando...";

    try {
      const response = await fetch("/api/generate-service-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo generar el borrador.");

      const mergedService = {
        ...data,
        ...payload.service,
        id: data.id,
        image: imageData?.value.trim() || data.image || "",
      };
      fillAdminServiceForm(mergedService);
      renderValidationErrors([]);
      showDetailToast(payload.warnings?.length
        ? "Borrador actualizado con advertencias"
        : "Borrador actualizado con IA");
    } catch (error) {
      console.error(error);
      showDetailToast(error.message || "No se pudo actualizar el borrador");
    } finally {
      aiRefreshButton.disabled = false;
      aiRefreshButton.textContent = "Usar enlaces con IA";
    }
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

  const extraSectionBlocks = normalizeCustomSections(data.customSections)
    .map((section) => {
      if (section.kind === "text") {
        return `
          <div>
            <h3 class="summary-modal-section-title">${escapeHtml(section.title)}</h3>
            <div class="summary-modal-text">${escapeHtml(section.content)}</div>
          </div>
        `;
      }
      if (section.kind === "select") {
        return `
          <div>
            <h3 class="summary-modal-section-title">${escapeHtml(section.title)}</h3>
            <ul class="summary-modal-channels"><li class="summary-modal-channel">${escapeHtml(section.value || section.options[0] || "Por verificar")}</li></ul>
          </div>
        `;
      }
      const entries = section.kind === "resources"
        ? section.items.map((item) => `<li class="summary-modal-channel">${escapeHtml(item.title)}. ${escapeHtml(item.url)}</li>`).join("")
        : section.items.map((item) => `<li class="summary-modal-channel">${escapeHtml(item.title)}. ${escapeHtml(item.description)}</li>`).join("");
      return `
        <div>
          <h3 class="summary-modal-section-title">${escapeHtml(section.title)}</h3>
          <ul class="summary-modal-channels">${entries}</ul>
        </div>
      `;
    })
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

        ${extraSectionBlocks ? `
          <div class="summary-modal-grid">
            ${extraSectionBlocks}
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
  normalizeCustomSections(data.customSections).forEach((section) => {
    if (section.kind === "text") {
      agregarSeccion(section.title.toUpperCase(), section.content, false);
      return;
    }
    if (section.kind === "select") {
      agregarSeccion(section.title.toUpperCase(), [{ title: section.value || section.options[0] || "Por verificar" }], true);
      return;
    }
    agregarSeccion(section.title.toUpperCase(), section.kind === "resources"
      ? section.items.map((item) => ({ title: item.title, description: item.url }))
      : section.items, true);
  });

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
