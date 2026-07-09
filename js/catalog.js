import { openConfirmDialog } from "./confirm-dialog.js";
import { loadServices, saveService, setServiceActive } from "./service-store.js";

let services = [];
let currentPage = 1;
const SERVICES_PER_PAGE = 6;
let currentFilteredServices = [];
const MAX_IMAGE_SIZE_BYTES = 350_000;
const MAX_CUSTOM_SECTIONS = 3;
const MAX_CUSTOM_ITEMS = 8;
const MAX_SELECT_OPTIONS = 6;

// ========================================================
// UTILERÍAS Y FORMATO
// ========================================================
function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

function isServiceInactive(serviceId) {
  return services.find((service) => service.id === serviceId)?.active === false;
}

function getImageHelpers() {
  return window.CercaRedServiceImages || {};
}

function createServiceImageElement(service, className = "service-card-image") {
  const img = document.createElement("img");
  const helpers = getImageHelpers();
  const candidates = helpers.getServiceImageCandidates?.(service) || ["assets/images/cards/default.svg"];
  img.className = className;
  img.alt = service?.name ? `Imagen de ${service.name}` : "Imagen del servicio";
  img.loading = "lazy";
  helpers.attachFallback?.(img, candidates);
  if (!img.src) {
    img.src = candidates[0];
  }
  return img;
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

function updateImagePreview(preview, serviceLike) {
  if (!preview) return;

  const helpers = getImageHelpers();
  const candidates = helpers.getServiceImageCandidates?.(serviceLike) || ["assets/images/cards/default.svg"];
  preview.alt = serviceLike?.name
    ? `Vista previa de ${serviceLike.name}`
    : "Vista previa de la imagen del servicio";
  helpers.attachFallback?.(preview, candidates);
  if (!preview.src) {
    preview.src = candidates[0];
  }
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
        return {
          ...baseSection,
          content: String(section?.content || "").trim(),
        };
      }

      if (kind === "select") {
        const options = Array.isArray(section?.options)
          ? section.options.map((option) => String(option || "").trim()).filter(Boolean).slice(0, MAX_SELECT_OPTIONS)
          : [];
        const value = String(section?.value || options[0] || "").trim();
        return {
          ...baseSection,
          options,
          value,
        };
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

      return {
        ...baseSection,
        items,
      };
    })
    .filter((section) => {
      if (section.kind === "text") return Boolean(section.content);
      if (section.kind === "select") return section.options.length > 0;
      return section.items.length > 0;
    })
    .slice(0, MAX_CUSTOM_SECTIONS);
}

// ========================================================
// GESTIÓN DEL CATÁLOGO
// ========================================================
async function toggleServiceStatus(serviceId) {
  const service = services.find((item) => item.id === serviceId);
  if (!service) return;

  const nextActive = service.active === false;
  await setServiceActive(serviceId, nextActive);
  services = services.map((item) =>
    item.id === serviceId ? { ...item, active: nextActive } : item,
  );
  applyFilters();
}

function createServiceCard(service) {
  // Descarte de seguridad: si por algún motivo no hay servicio válido, abortamos pacíficamente
  if (!service) return document.createElement("div");

  // Validamos de forma segura si está inactivo sin romper el código si el .find falla
  const foundService = services && services.length > 0 ? services.find((item) => item.id === service.id) : null;
  const isInactive = foundService ? foundService.active === false : service.active === false;
  
  const article = document.createElement("article");
  article.className = `service-card${isInactive ? " is-inactive" : ""}`;
  article.dataset.serviceId = service.id;

  article.innerHTML = `
    <div class="service-card-header">
      <div class="service-card-tags">
        <span class="service-category">${service.category || "General"}</span>
        ${isAdminUser() ? `<span class="service-status">${isInactive ? "Inactivo" : "Activo"}</span>` : ""}
      </div>
      <button class="save-button" type="button" aria-label="Guardar ${service.name || 'servicio'}">
        <img src="assets/icons/save.svg" alt="" aria-hidden="true">
      </button>
    </div>
    <h3>${service.name || "Servicio institucional"}</h3>
    <p class="service-entity">${service.entity || "Entidad oficial"}</p>
    <p class="service-description">${service.shortDescription || "Sin descripción corta disponible."}</p>
    <div class="card-actions">
      <a class="details-button" href="detail.html?id=${service.id}">Ver requisitos</a>
      <button class="share-button" type="button">Compartir</button>
      ${isAdminUser() ? `
        <div class="admin-card-actions" aria-label="Acciones administrativas">
          <a href="detail.html?id=${service.id}#admin-service-editor">Editar</a>
          <button type="button" data-admin-action="toggle-status">
            ${isInactive ? "Activar" : "Desactivar"}
          </button>
        </div>
      ` : ""}
    </div>
  `;

  article.prepend(createServiceImageElement(service));

  return article;
}

function createServiceId(name) {
  const baseId = normalizeText(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "servicio";
  const existingIds = new Set(services.map((service) => service.id));
  let nextId = baseId;
  let index = 2;

  while (existingIds.has(nextId)) {
    nextId = `${baseId}-${index}`;
    index += 1;
  }

  return nextId;
}

// ========================================================
// VALIDACIONES Y FORMULARIOS IA
// ========================================================
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

function formatSectionItems(items = []) {
  return items.map((item) => `${item.title || ""} | ${item.description || ""}`).join("\n");
}

function formatResourceItems(items = []) {
  return items
    .map((item) =>
      `${item.title || ""} | ${item.description || ""} | ${item.url || ""} | ${item.type || "otro"}`,
    )
    .join("\n");
}

function formatCustomSectionValue(section) {
  if (!section) return "";
  if (section.kind === "text") return section.content || "";
  if (section.kind === "select") return (section.options || []).join("\n");
  if (section.kind === "resources") return formatResourceItems(section.items || []);
  return formatSectionItems(section.items || []);
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
          <input type="text" data-custom-title maxlength="40" value="${escapeHtml(normalized.title)}" placeholder="Beneficios, plazos, sedes..." />
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
              ? "Recursos útiles"
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
          <input type="text" data-custom-selected value="${escapeHtml(normalized.value || "")}" placeholder="Debe coincidir con una opción" />
        </label>
      ` : ""}
    </article>
  `;
}

function setFieldError(selector, hasError) {
  document.querySelector(selector)?.classList.toggle("input-error", hasError);
}

function validateSectionTextarea(selector, label, errors) {
  const field = document.querySelector(selector);
  const value = field?.value.trim() || "";
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);

  setFieldError(selector, false);

  if (lines.length === 0) {
    errors.push(`${label}: agrega al menos un elemento.`);
    setFieldError(selector, true);
    return [];
  }

  const hasInvalidLine = lines.some((line) => {
    const [title, ...descriptionParts] = line.split("|");
    return !title?.trim() || !descriptionParts.join("|").trim();
  });

  if (hasInvalidLine) {
    errors.push(`${label}: usa el formato Título | Descripción.`);
    setFieldError(selector, true);
  }

  return parseSectionItems(value);
}

function validateResourceTextarea(selector, label, errors) {
  const field = document.querySelector(selector);
  const value = field?.value.trim() || "";
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);

  setFieldError(selector, false);
  if (lines.length === 0) return [];

  const hasInvalidLine = lines.some((line) => {
    const [title, , url] = line.split("|").map((part) => part.trim());
    if (!title || !url) return true;

    try {
      const resourceUrl = new URL(url);
      return !["http:", "https:"].includes(resourceUrl.protocol);
    } catch {
      return true;
    }
  });

  if (hasInvalidLine) {
    errors.push(`${label}: usa el formato Título | Descripción | URL | Tipo con enlaces válidos.`);
    setFieldError(selector, true);
  }

  return parseResourceItems(value);
}

function renderCustomSectionsEditor(container, sections = []) {
  if (!container) return;

  const normalized = normalizeCustomSections(sections);
  container.innerHTML = normalized.length
    ? normalized.map((section, index) => buildCustomSectionEditor(section, index)).join("")
    : '<p class="admin-custom-sections-empty">La IA puede sugerir hasta 3 secciones extra. También puedes agregarlas manualmente.</p>';
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
          ? "Recursos útiles"
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
    setAiMessage(`Máximo ${MAX_CUSTOM_SECTIONS} secciones extra para mantener el servicio compacto.`, "warning");
    return;
  }

  container.querySelector(".admin-custom-sections-empty")?.remove();
  container.insertAdjacentHTML("beforeend", buildCustomSectionEditor(section, cards.length));
  syncCustomSectionCard(container.lastElementChild);
}

function validateCustomSections(container, errors) {
  const cards = Array.from(container?.querySelectorAll("[data-custom-section]") || []);
  const sections = [];

  cards.forEach((card, index) => {
    const titleField = card.querySelector("[data-custom-title]");
    const kindField = card.querySelector("[data-custom-kind]");
    const textarea = card.querySelector("[data-custom-value]");
    const selectedField = card.querySelector("[data-custom-selected]");
    const showInSimple = card.querySelector("[data-custom-simple]")?.checked !== false;
    const title = titleField?.value.trim() || "";
    const kind = kindField?.value || "text";
    const rawValue = textarea?.value.trim() || "";

    titleField?.classList.remove("input-error");
    textarea?.classList.remove("input-error");
    selectedField?.classList.remove("input-error");

    if (!title) {
      errors.push(`Sección extra ${index + 1}: el título es obligatorio.`);
      titleField?.classList.add("input-error");
      return;
    }

    if (!rawValue) {
      errors.push(`Sección "${title}": agrega contenido.`);
      textarea?.classList.add("input-error");
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
        textarea?.classList.add("input-error");
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
      const parsedResources = validateInlineResourceSection(rawValue, title, errors);
      if (!parsedResources) {
        textarea?.classList.add("input-error");
        return;
      }
      sections.push({ id: slugifySectionId(title), title, kind, items: parsedResources.slice(0, MAX_CUSTOM_ITEMS), showInSimple });
      return;
    }

    const parsedItems = validateInlineItemsSection(rawValue, title, errors);
    if (!parsedItems) {
      textarea?.classList.add("input-error");
      return;
    }
    sections.push({ id: slugifySectionId(title), title, kind, items: parsedItems.slice(0, MAX_CUSTOM_ITEMS), showInSimple });
  });

  return normalizeCustomSections(sections);
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
    if (!itemTitle || !url) return true;

    try {
      const resourceUrl = new URL(url);
      return !["http:", "https:"].includes(resourceUrl.protocol);
    } catch {
      return true;
    }
  });

  if (hasInvalidLine) {
    errors.push(`Sección "${title}": usa el formato Título | Descripción | URL | Tipo.`);
    return null;
  }

  return parseResourceItems(value);
}

function validateRequiredField(selector, label, errors) {
  const field = document.querySelector(selector);
  const value = field?.value.trim() || "";

  setFieldError(selector, !value);
  if (!value) errors.push(`${label} es obligatorio.`);

  return value;
}

function validateUrlField(selector, label, errors) {
  const field = document.querySelector(selector);
  const value = field?.value.trim() || "";

  setFieldError(selector, false);
  if (!value) return value;

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("invalid protocol");
    }
  } catch {
    errors.push(`${label} debe ser un enlace válido.`);
    setFieldError(selector, true);
  }

  return value;
}

function renderAiValidation(errors) {
  const list = document.querySelector("#admin-ai-validation");
  if (!list) return;

  list.replaceChildren(
    ...errors.map((error) => {
      const item = document.createElement("li");
      item.textContent = error;
      return item;
    }),
  );
  list.hidden = errors.length === 0;
}

function setAiMessage(message, type = "info") {
  const messageElement = document.querySelector(".admin-ai-message");
  if (!messageElement) return;
  messageElement.textContent = message;
  messageElement.dataset.type = type;
}

function createServiceFromForm() {
  const errors = [];
  const name = validateRequiredField("#admin-ai-name", "Nombre", errors);
  const entity = validateRequiredField("#admin-ai-entity", "Entidad", errors);
  const category = document.querySelector("#admin-ai-category").value;
  const description = validateRequiredField("#admin-ai-description", "Descripción principal", errors);
  const shortDescription = validateRequiredField("#admin-ai-short-description", "Descripción corta", errors);
  const officialUrl = validateUrlField("#admin-ai-url", "Canal oficial", errors);
  const cost = document.querySelector("#admin-ai-cost").value.trim() || "Gratuito";
  const scope = document.querySelector("#admin-ai-scope").value.trim() || "Nacional";
  const modality = document.querySelector("#admin-ai-modality").value;
  const attention = document.querySelector("#admin-ai-attention").value.trim() || modality;
  const district = document.querySelector("#admin-ai-district").value.trim() || "Nacional";
  const requirements = validateSectionTextarea("#admin-ai-requirements", "Requisitos", errors);
  const documents = validateSectionTextarea("#admin-ai-documents", "Documentos", errors);
  const steps = validateSectionTextarea("#admin-ai-steps", "Pasos", errors);
  const channels = validateSectionTextarea("#admin-ai-channels", "Canales", errors);
  const resources = validateResourceTextarea("#admin-ai-resources", "Recursos útiles", errors);
  const checklist = validateSectionTextarea("#admin-ai-checklist", "Checklist", errors);
  const customSections = validateCustomSections(document.querySelector("#admin-ai-custom-sections"), errors);
  const image = document.querySelector("#admin-ai-image-data")?.value.trim() || "";

  renderAiValidation(errors);
  if (errors.length > 0) {
    throw new Error("Revisa los campos marcados antes de guardar.");
  }

  return {
    id: createServiceId(name),
    name,
    entity,
    shortEntity: entity.split("-")[0].trim() || entity,
    category,
    description,
    shortDescription: shortDescription || description,
    keywords: normalizeText(`${name} ${entity} ${category}`).split(" ").filter(Boolean),
    district,
    modality,
    attention,
    scope,
    cost,
    officialUrl: officialUrl || "#",
    active: true,
    requirements,
    documents,
    steps,
    channels,
    resources,
    checklist,
    customSections,
    image,
  };
}

function fillAiServiceForm(service) {
  document.querySelector("#admin-ai-name").value = service.name || "";
  document.querySelector("#admin-ai-entity").value = service.entity || "";
  document.querySelector("#admin-ai-category").value = service.category || "Social";
  document.querySelector("#admin-ai-description").value = service.description || "";
  document.querySelector("#admin-ai-short-description").value = service.shortDescription || "";
  document.querySelector("#admin-ai-url").value = service.officialUrl || "";
  document.querySelector("#admin-ai-cost").value = service.cost || "Gratuito";
  document.querySelector("#admin-ai-scope").value = service.scope || "Nacional";
  document.querySelector("#admin-ai-modality").value = service.modality || "Presencial";
  document.querySelector("#admin-ai-attention").value = service.attention || service.modality || "Presencial";
  document.querySelector("#admin-ai-district").value = service.district || "Nacional";
  document.querySelector("#admin-ai-requirements").value = formatSectionItems(service.requirements);
  document.querySelector("#admin-ai-documents").value = formatSectionItems(service.documents);
  document.querySelector("#admin-ai-steps").value = formatSectionItems(service.steps);
  document.querySelector("#admin-ai-channels").value = formatSectionItems(service.channels);
  document.querySelector("#admin-ai-resources").value = formatResourceItems(service.resources);
  document.querySelector("#admin-ai-checklist").value = formatSectionItems(service.checklist);
  renderCustomSectionsEditor(document.querySelector("#admin-ai-custom-sections"), service.customSections);
  document.querySelector("#admin-ai-image-data").value = service.image || "";
  updateImagePreview(document.querySelector("#admin-ai-image-preview"), service);
}

function buildAiServiceModal() {
  return `
    <div class="admin-ai-modal-overlay" id="admin-ai-modal" role="dialog" aria-modal="true" aria-labelledby="admin-ai-title">
      <div class="admin-ai-modal">
        <button class="admin-ai-close" type="button" aria-label="Cerrar">×</button>
        <p class="admin-ai-eyebrow">Administración</p>
        <h2 id="admin-ai-title">Añadir servicio con IA</h2>
        <p class="admin-ai-intro">
          Pega enlaces oficiales, notas verificadas o ambos. La IA intentará leer los enlaces y generar un borrador editable.
        </p>

        <form class="admin-ai-form" id="admin-ai-form">
          <label class="admin-ai-full">
            Enlaces oficiales o notas opcionales
            <textarea id="admin-ai-sources" placeholder="Puedes pegar solo enlaces, por ejemplo:
https://www.gob.pe/...

Opcional: agrega notas, requisitos, canales o costos si la web no se puede leer."></textarea>
          </label>
          <section class="admin-ai-image-block admin-ai-full" aria-labelledby="admin-ai-image-title">
            <div class="admin-ai-image-copy">
              <p class="admin-ai-image-label" id="admin-ai-image-title">Imagen del servicio</p>
              <p class="admin-ai-image-note">Puedes subir una portada ahora o dejar la imagen por defecto del catálogo.</p>
            </div>
            <div class="admin-ai-image-layout">
              <img class="admin-ai-image-preview" id="admin-ai-image-preview" src="assets/images/cards/default.svg" alt="Vista previa de la imagen del servicio" />
              <div class="admin-ai-image-actions">
                <input id="admin-ai-image-file" type="file" accept="image/png, image/jpeg, image/webp, image/svg+xml" />
                <input id="admin-ai-image-data" type="hidden" />
                <button class="admin-ai-image-clear" id="admin-ai-image-clear" type="button">Quitar imagen cargada</button>
              </div>
            </div>
          </section>
          <div class="admin-ai-actions admin-ai-full">
            <button class="admin-ai-generate" type="button">Generar borrador con IA</button>
          </div>

          <label>
            Nombre
            <input id="admin-ai-name" type="text" />
          </label>
          <label>
            Entidad
            <input id="admin-ai-entity" type="text" />
          </label>
          <label>
            Categoría
            <select id="admin-ai-category">
              <option value="Adulto mayor">Adulto mayor</option>
              <option value="Educación">Educación</option>
              <option value="Salud">Salud</option>
              <option value="Social" selected>Social</option>
              <option value="Vivienda">Vivienda</option>
            </select>
          </label>
          <label>
            Modalidad
            <select id="admin-ai-modality">
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
              <option value="Mixta">Mixta</option>
            </select>
          </label>
          <label>
            Distrito
            <input id="admin-ai-district" type="text" value="Nacional" />
          </label>
          <label>
            Atención
            <input id="admin-ai-attention" type="text" value="Presencial" />
          </label>
          <label>
            Ámbito
            <input id="admin-ai-scope" type="text" value="Nacional" />
          </label>
          <label>
            Costo
            <input id="admin-ai-cost" type="text" value="Gratuito" />
          </label>
          <label class="admin-ai-full">
            Canal oficial
            <input id="admin-ai-url" type="url" placeholder="https://www.gob.pe/..." />
          </label>
          <label class="admin-ai-full">
            Descripción principal
            <textarea id="admin-ai-description"></textarea>
          </label>
          <label class="admin-ai-full">
            Descripción corta
            <textarea id="admin-ai-short-description"></textarea>
          </label>
          <label class="admin-ai-full">
            Requisitos
            <textarea id="admin-ai-requirements" placeholder="Título | Descripción"></textarea>
          </label>
          <label class="admin-ai-full">
            Documentos
            <textarea id="admin-ai-documents" placeholder="Título | Descripción"></textarea>
          </label>
          <label class="admin-ai-full">
            Pasos
            <textarea id="admin-ai-steps" placeholder="Título | Descripción"></textarea>
          </label>
          <label class="admin-ai-full">
            Canales
            <textarea id="admin-ai-channels" placeholder="Título | Descripción"></textarea>
          </label>
          <label class="admin-ai-full">
            Recursos útiles
            <textarea id="admin-ai-resources" placeholder="Consulta de afiliación | Verifica si figuras como afiliado | https://www.gob.pe/... | consulta"></textarea>
          </label>
          <label class="admin-ai-full">
            Checklist
            <textarea id="admin-ai-checklist" placeholder="Verificar requisitos | Confirma edad, clasificación y documentos antes de iniciar."></textarea>
          </label>
          <section class="admin-custom-sections admin-ai-full" aria-labelledby="admin-custom-sections-title">
            <div class="admin-custom-sections-header">
              <div>
                <h3 id="admin-custom-sections-title">Secciones extra</h3>
                <p>Máximo 3. Úsalas para beneficios, plazos, sedes, coberturas o campos compactos como desplegables.</p>
              </div>
              <button type="button" id="admin-ai-add-section">Agregar sección</button>
            </div>
            <div id="admin-ai-custom-sections"></div>
          </section>

          <p class="admin-ai-help admin-ai-full">Formato de listas: Título | Descripción. Recursos: Título | Descripción | URL | Tipo.</p>
          <ul class="admin-ai-validation admin-ai-full" id="admin-ai-validation" hidden></ul>
          <p class="admin-ai-message admin-ai-full" aria-live="polite"></p>

          <div class="admin-ai-actions admin-ai-full">
            <button class="admin-ai-save" type="submit">Agregar al catálogo</button>
            <button class="admin-ai-cancel" type="button">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function openAiServiceModal() {
  document.querySelector("#admin-ai-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", buildAiServiceModal());
  document.body.classList.add("has-admin-ai-modal");

  const modal = document.querySelector("#admin-ai-modal");
  const closeButton = modal.querySelector(".admin-ai-close");
  const cancelButton = modal.querySelector(".admin-ai-cancel");
  const generateButton = modal.querySelector(".admin-ai-generate");
  const form = modal.querySelector("#admin-ai-form");
  const saveButton = form.querySelector(".admin-ai-save");
  const customSectionsContainer = modal.querySelector("#admin-ai-custom-sections");
  const addCustomSectionButton = modal.querySelector("#admin-ai-add-section");
  const imagePreview = modal.querySelector("#admin-ai-image-preview");
  const imageInput = modal.querySelector("#admin-ai-image-file");
  const imageData = modal.querySelector("#admin-ai-image-data");
  const imageClearButton = modal.querySelector("#admin-ai-image-clear");
  let pendingServiceToSave = null;

  const closeModal = () => {
    modal.remove();
    document.body.classList.remove("has-admin-ai-modal");
  };

  const closeWithConfirmation = async () => {
    const hasContent = Array.from(modal.querySelectorAll("input, textarea"))
      .some((field) => {
        if (field.type === "file") return field.files?.length;
        if (["checkbox", "radio", "hidden"].includes(field.type)) return false;
        return field.value.trim();
      });
    if (!hasContent) {
      closeModal();
      return;
    }

    const shouldClose = await openConfirmDialog({
      title: "Cerrar sin guardar",
      message: "Hay información sin guardar. Si cierras ahora, perderás los cambios de este borrador.",
      confirmText: "Cerrar sin guardar",
      cancelText: "Seguir editando",
    });

    if (shouldClose) {
      closeModal();
    }
  };

  updateImagePreview(imagePreview, {});
  renderCustomSectionsEditor(customSectionsContainer, []);

  closeButton.addEventListener("click", closeWithConfirmation);
  cancelButton.addEventListener("click", closeWithConfirmation);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeWithConfirmation();
  });

  generateButton.addEventListener("click", async () => {
    const sources = document.querySelector("#admin-ai-sources").value.trim();
    renderAiValidation([]);
    if (!sources) {
      setFieldError("#admin-ai-sources", true);
      setAiMessage("Pega al menos un enlace oficial o una nota antes de generar.", "error");
      return;
    }

    setFieldError("#admin-ai-sources", false);
    generateButton.disabled = true;
    setAiMessage("Leyendo fuentes y generando borrador...", "info");

    try {
      const response = await fetch("/api/generate-service-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo generar el servicio.");

      fillAiServiceForm(payload.service);
      pendingServiceToSave = null;
      saveButton.textContent = "Agregar al catálogo";
      setAiMessage(payload.warnings?.length
        ? `Borrador generado. Algunos enlaces no se pudieron leer: ${payload.warnings.join(" ")}`
        : "Borrador generado. Revísalo antes de agregarlo.", payload.warnings?.length ? "warning" : "success");
    } catch (error) {
      setAiMessage(error.message, "error");
    } finally {
      generateButton.disabled = false;
    }
  });

  form.addEventListener("input", () => {
    pendingServiceToSave = null;
    saveButton.textContent = "Agregar al catálogo";
  });

  addCustomSectionButton.addEventListener("click", () => {
    addCustomSectionEditor(customSectionsContainer);
  });

  customSectionsContainer.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".admin-custom-section-remove");
    if (!removeButton) return;

    removeButton.closest("[data-custom-section]")?.remove();
    if (!customSectionsContainer.querySelector("[data-custom-section]")) {
      renderCustomSectionsEditor(customSectionsContainer, []);
    }
  });

  customSectionsContainer.addEventListener("change", (event) => {
    const card = event.target.closest("[data-custom-section]");
    if (!card) return;
    if (event.target.matches("[data-custom-kind]")) {
      syncCustomSectionCard(card);
    }
  });

  imageInput.addEventListener("change", async () => {
    pendingServiceToSave = null;
    saveButton.textContent = "Agregar al catálogo";

    try {
      const file = imageInput.files?.[0];
      const image = await readImageFile(file);
      imageData.value = image;
      updateImagePreview(imagePreview, {
        id: document.querySelector("#admin-ai-name")?.value || "",
        name: document.querySelector("#admin-ai-name")?.value || "Servicio",
        image,
      });
      setAiMessage(file ? "Imagen cargada. Revisa el borrador y guarda cuando esté listo." : "", "info");
    } catch (error) {
      imageInput.value = "";
      imageData.value = "";
      updateImagePreview(imagePreview, {
        id: document.querySelector("#admin-ai-name")?.value || "",
      });
      setAiMessage(error.message, "error");
    }
  });

  imageClearButton.addEventListener("click", () => {
    imageInput.value = "";
    imageData.value = "";
    pendingServiceToSave = null;
    saveButton.textContent = "Agregar al catálogo";
    updateImagePreview(imagePreview, {
      id: document.querySelector("#admin-ai-name")?.value || "",
      name: document.querySelector("#admin-ai-name")?.value || "Servicio",
    });
    setAiMessage("Se quitó la imagen personalizada. Se usará la imagen por defecto del servicio.", "warning");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const newService = createServiceFromForm();

      if (JSON.stringify(pendingServiceToSave) !== JSON.stringify(newService)) {
        pendingServiceToSave = newService;
        saveButton.textContent = "Confirmar agregado";
        setAiMessage(`Revisa el borrador. Vuelve a presionar para agregar "${newService.name}".`, "warning");
        return;
      }

      saveButton.disabled = true;
      setAiMessage("Guardando servicio en Firestore...", "info");
      await saveService(newService);
      services = await loadServices();
      setAiMessage("Servicio agregado al catálogo.", "success");
      closeModal();
      clearFilters();
    } catch (error) {
      console.error(error);
      setAiMessage(error.message || "No se pudo guardar en Firestore. Revisa permisos de admin.", "error");
    } finally {
      form.querySelector(".admin-ai-save").disabled = false;
    }
  });

  closeButton.focus();
}

function renderAdminCatalogActions() {
  if (!isAdminUser()) return;

  const heading = document.querySelector(".catalog-heading");
  if (!heading || document.querySelector(".admin-catalog-actions")) return;

  heading.insertAdjacentHTML(
    "afterend",
    `
      <section class="admin-catalog-actions" aria-label="Acciones administrativas del catálogo">
        <div>
          <p>Modo administrador</p>
          <h2>Añadir nuevo servicio</h2>
        </div>
        <button type="button" id="admin-add-ai-service">Añadir servicio con IA</button>
      </section>
    `,
  );

  document
    .querySelector("#admin-add-ai-service")
    ?.addEventListener("click", openAiServiceModal);
}

// ========================================================
// RENDERIZADO Y FILTROS PROTEGIDOS
// ========================================================
function renderServices() {
  const servicesGrid = document.querySelector("#services-grid");
  const emptyState = document.querySelector("#empty-state");
  const pagination = document.querySelector("#pagination");
  const resultsCount = document.querySelector("#results-count");

  if (!servicesGrid) return; // Protección para Inicio

  const startIndex = (currentPage - 1) * SERVICES_PER_PAGE;
  const endIndex = startIndex + SERVICES_PER_PAGE;
  const servicesToRender = currentFilteredServices.slice(startIndex, endIndex);

  servicesGrid.replaceChildren(
    ...servicesToRender.map((service) => createServiceCard(service)),
  );

  const hasResults = currentFilteredServices.length > 0;
  servicesGrid.hidden = !hasResults;
  if (emptyState) emptyState.hidden = hasResults;
  if (pagination) pagination.hidden = !hasResults;

  if (!hasResults) {
    if (resultsCount) resultsCount.textContent = "";
    if (pagination) pagination.replaceChildren(); 
    return;
  }

  const serviceLabel = currentFilteredServices.length === 1 ? "servicio disponible" : "servicios disponibles";
  if (resultsCount) resultsCount.textContent = `Mostrando ${currentFilteredServices.length} ${serviceLabel}`;

  renderPaginationControls();
}

function renderPaginationControls() {
  const pagination = document.querySelector("#pagination");
  const servicesGrid = document.querySelector("#services-grid");
  if (!pagination || !servicesGrid) return;

  const totalPages = Math.ceil(currentFilteredServices.length / SERVICES_PER_PAGE);
  pagination.replaceChildren();

  if (totalPages <= 1) {
    pagination.hidden = true;
    return;
  }

  pagination.hidden = false;

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.type = "button";
    pageButton.textContent = i;
    pageButton.className = i === currentPage ? "page-button active" : "page-button";
    
    pageButton.addEventListener("click", () => {
      currentPage = i;
      renderServices();
      window.scrollTo({ top: servicesGrid.offsetTop - 100, behavior: 'smooth' });
    });

    pagination.appendChild(pageButton);
  }
}

function applyFilters() {
  const searchInput = document.querySelector("#search-input");
  const categoryFilter = document.querySelector("#category-filter");
  const districtFilter = document.querySelector("#district-filter");
  const modalityFilter = document.querySelector("#modality-filter");

  const normalizedQuery = searchInput ? normalizeText(searchInput.value) : "";
  
  currentFilteredServices = services.filter((service) => {
    if (!isAdminUser() && isServiceInactive(service.id)) return false;

    const searchableContent = [
      service.name,
      service.entity,
      service.category,
      service.description,
      ...service.keywords,
    ]
      .map(normalizeText)
      .join(" ");

    const matchesQuery = normalizedQuery.length === 0 || searchableContent.includes(normalizedQuery);
    const matchesCategory = !categoryFilter || categoryFilter.value === "" || service.category === categoryFilter.value;
    const matchesDistrict = !districtFilter || districtFilter.value === "" || service.district === districtFilter.value || service.district === "Nacional";
    const matchesModality = !modalityFilter || modalityFilter.value === "" || service.modality === modalityFilter.value;

    return matchesQuery && matchesCategory && matchesDistrict && matchesModality;
  });

  currentPage = 1;
  renderServices();
}

function clearFilters() {
  const searchInput = document.querySelector("#search-input");
  const categoryFilter = document.querySelector("#category-filter");
  const districtFilter = document.querySelector("#district-filter");
  const modalityFilter = document.querySelector("#modality-filter");

  if (searchInput) searchInput.value = "";
  if (categoryFilter) categoryFilter.value = "";
  if (districtFilter) districtFilter.value = "";
  if (modalityFilter) modalityFilter.value = "";
  
  currentPage = 1;
  applyFilters();
  searchInput?.focus();
}

// ========================================================
// REPOSITORIO DE ACTIVIDAD RECIENTE
// ========================================================
function loadUserActivitySummary() {
  const section = document.getElementById('activity-summary');
  const txtLastVisited = document.getElementById('last-visited-text');
  const txtSavedCount = document.getElementById('saved-count-text');
  const linkSuggestion = document.getElementById('suggestion-link');

  if (!section) return;
  section.removeAttribute('hidden');

  const savedServices = window.CercaRedSaved ? window.CercaRedSaved.getSaved() : [];
  const lastVisited = JSON.parse(localStorage.getItem('cercared_last_visited'));

  if (txtSavedCount) {
    txtSavedCount.textContent = `${savedServices.length} ${savedServices.length === 1 ? 'servicio' : 'servicios'}`;
  }

  if (lastVisited) {
    if (txtLastVisited) txtLastVisited.textContent = lastVisited.name;
    if (linkSuggestion) {
      linkSuggestion.textContent = `Ver más de ${lastVisited.category}`;
      linkSuggestion.href = "#";

      linkSuggestion.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.location.pathname.includes("index.html") || window.location.pathname.endsWith("/")) {
          window.location.href = `catalog.html?category=${encodeURIComponent(lastVisited.category)}`;
          return;
        }
        const categoryFilter = document.getElementById("category-filter");
        if (categoryFilter) {
          categoryFilter.value = lastVisited.category;
          categoryFilter.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }
  } else {
    if (txtLastVisited) txtLastVisited.textContent = "Ninguno recientemente";
    if (linkSuggestion) {
      linkSuggestion.textContent = "Explorar catálogo completo";
      linkSuggestion.href = "catalog.html";
    }
  }
}

// ========================================================
// RENDERIZADO DE POPULARES Y RECOMENDADOS (INICIO)
// ========================================================
function renderPopularServices() {
  const popularGrid = document.getElementById("popular-services-grid");
  if (!popularGrid) return;

  const popularServices = [...services]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3);

  if (popularServices.length === 0) {
    popularGrid.innerHTML = '<p class="placeholder-text">No hay servicios populares disponibles.</p>';
    return;
  }

  popularGrid.replaceChildren(
    ...popularServices.map((service) => createServiceCard(service))
  );
}

function renderRecommendedServices(userPreferences) {
  const recommendedSection = document.getElementById("recommended-section");
  const recommendedGrid = document.getElementById("recommended-services-grid");
  
  if (!recommendedSection || !recommendedGrid) return;

  // 1. Intentar obtener la categoría desde las preferencias del perfil
  let targetCategory = userPreferences?.category || null;

  // 2. Si no hay categoría en el perfil, buscamos en los marcadores guardados
  if (!targetCategory) {
    const rawSaved = window.CercaRedSaved ? window.CercaRedSaved.getSaved() : [];
    
    if (rawSaved.length > 0) {
      // Descarte: Si guarda objetos completos, tomamos el último. Si guarda solo IDs (strings), buscamos el servicio en el catálogo.
      const lastSavedItem = rawSaved[rawSaved.length - 1];
      
      if (typeof lastSavedItem === 'string') {
        // Buscamos el servicio real en nuestra lista global usando el ID guardado
        const realService = services.find(s => s.id === lastSavedItem);
        if (realService) targetCategory = realService.category;
      } else if (lastSavedItem && lastSavedItem.category) {
        targetCategory = lastSavedItem.category;
      }
    }
  }

  // 3. Si sigue sin encontrar un interés o categoría, forzamos un fallback dinámico (p. ej., "Social") para que no quede vacío
  if (!targetCategory) {
    targetCategory = "Social"; 
  }

  // Forzamos a mostrar la sección
  recommendedSection.style.display = "block";
  
  // Obtener IDs guardados para no recomendar lo que el usuario ya tiene en marcadores
  const rawSaved = window.CercaRedSaved ? window.CercaRedSaved.getSaved() : [];
  const savedIds = new Set(rawSaved.map(item => typeof item === 'string' ? item : item.id));

  // Filtrar el top 3 de recomendaciones de esa categoría
  let recommendedServices = services
    .filter((service) => service.category === targetCategory && !savedIds.has(service.id))
    .slice(0, 3);

  // 2. Si ya guardó todos, relajamos la regla y le mostramos los servicios de esa categoría de todos modos
  if (recommendedServices.length === 0) {
    recommendedServices = services
      .filter((service) => service.category === targetCategory)
      .slice(0, 3);
  }

  // 3. Si la categoría realmente no existe en la data local, mostramos 3 servicios cualquiera como fallback total
  if (recommendedServices.length === 0) {
    recommendedServices = services.slice(0, 3);
  }

  recommendedGrid.replaceChildren(
    ...recommendedServices.map((service) => createServiceCard(service))
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  // Cargar base de datos básica sincronizada con Firebase
  services = await loadServices();
  currentFilteredServices = [...services];

  // 1. Ejecutar el resumen de actividad reciente si existe el contenedor (Inicio)
  loadUserActivitySummary();

 // 2. Control condicional de Populares y Recomendados según Login (Inicio)
  const currentUser = getCurrentUser();
  renderPopularServices();

  // Si hay un usuario logueado (con o sin preferencias), intentamos renderizar recomendados
  if (currentUser) {
    renderRecommendedServices(currentUser.preferences);
  } else {
    // Si está totalmente deslogueado, ahí sí ocultamos la sección por completo
    const recommendedSection = document.getElementById("recommended-section");
    if (recommendedSection) recommendedSection.style.display = "none";
  }

  // 3. Vincular listeners y lógica de catálogo solo si existen en la página activa
  const searchForm = document.querySelector("#service-search");
  const categoryFilter = document.querySelector("#category-filter");
  const districtFilter = document.querySelector("#district-filter");
  const modalityFilter = document.querySelector("#modality-filter");
  const clearFiltersButton = document.querySelector("#clear-filters");
  const emptyClearButton = document.querySelector("#empty-clear-search");
  const servicesGrid = document.querySelector("#services-grid");

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      applyFilters();
    });
  }

  [categoryFilter, districtFilter, modalityFilter].forEach((filter) => {
    filter?.addEventListener("change", applyFilters);
  });

  if (clearFiltersButton) clearFiltersButton.addEventListener("click", clearFilters);
  if (emptyClearButton) emptyClearButton.addEventListener("click", clearFilters);

  if (servicesGrid) {
    servicesGrid.addEventListener("click", (event) => {
      const toggleButton = event.target.closest('[data-admin-action="toggle-status"]');
      if (!toggleButton || !isAdminUser()) return;

      const card = toggleButton.closest(".service-card");
      if (!card?.dataset.serviceId) return;

      toggleServiceStatus(card.dataset.serviceId).catch((error) => {
        console.error(error);
      });
    });
  }

  // Cargar preferencias guardadas en el Catálogo
  try {
    const sessionUser = JSON.parse(localStorage.getItem("cercared_currentUser"));
    if (sessionUser && sessionUser.preferences) {
      const prefs = sessionUser.preferences;
      
      if (prefs.viewMode === 'simple') {
        document.body.classList.add('view-mode-simple');
      }
      
      if (prefs.district && districtFilter) {
        districtFilter.value = prefs.district;
        districtFilter.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (prefs.category && categoryFilter) {
        categoryFilter.value = prefs.category;
        categoryFilter.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  } catch (err) {
    console.error("Error al cargar las preferencias por defecto:", err);
  }

  // Interceptar parámetros de filtro por URL
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  
  if (categoryParam && categoryFilter) {
    categoryFilter.value = categoryParam;
    categoryFilter.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Renderizar vistas finales del catálogo
  applyFilters();
  renderAdminCatalogActions();
});
