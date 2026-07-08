import { loadServices, saveService, setServiceActive } from "./service-store.js";

let services = [];
let currentPage = 1;
const SERVICES_PER_PAGE = 6;
let currentFilteredServices = [];

const searchForm = document.querySelector("#service-search");
const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const districtFilter = document.querySelector("#district-filter");
const modalityFilter = document.querySelector("#modality-filter");
const clearFiltersButton = document.querySelector("#clear-filters");
const emptyClearButton = document.querySelector("#empty-clear-search");
const servicesGrid = document.querySelector("#services-grid");
const resultsCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const pagination = document.querySelector("#pagination");

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
  const isInactive = isServiceInactive(service.id);
  const article = document.createElement("article");
  article.className = `service-card${isInactive ? " is-inactive" : ""}`;
  article.dataset.serviceId = service.id;

  article.innerHTML = `
    <img class="service-card-image" src="assets/images/cards/${service.id}.jpg" alt="" aria-hidden="true"
         onerror="if(!this.dataset.t){this.dataset.t='png';this.src='assets/images/cards/${service.id}.png';}
                  else if(this.dataset.t==='png'){this.dataset.t='webp';this.src='assets/images/cards/${service.id}.webp';}
                  else{this.dataset.t='def';this.src='assets/images/cards/default.png';this.onerror=null;}">
    <div class="service-card-header">
      <div class="service-card-tags">
        <span class="service-category">${service.category}</span>
        ${isAdminUser() ? `<span class="service-status">${isInactive ? "Inactivo" : "Activo"}</span>` : ""}
      </div>
      <button class="save-button" type="button" aria-label="Guardar ${service.name}">
        <img src="assets/icons/save.svg" alt="" aria-hidden="true">
      </button>
    </div>
    <h3>${service.name}</h3>
    <p class="service-entity">${service.entity}</p>
    <p class="service-description">${service.shortDescription}</p>
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
    procedures: [
      {
        value: "procedimiento-general",
        label: "Procedimiento general",
      },
    ],
    channels,
    resources,
    checklist,
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
  const message = modal.querySelector(".admin-ai-message");
  const saveButton = form.querySelector(".admin-ai-save");
  let pendingServiceToSave = null;

  const closeModal = () => {
    modal.remove();
    document.body.classList.remove("has-admin-ai-modal");
  };

  const closeWithConfirmation = () => {
    const hasContent = Array.from(modal.querySelectorAll("input, textarea"))
      .some((field) => field.value.trim());
    if (!hasContent || window.confirm("Hay información sin guardar. ¿Cerrar de todos modos?")) {
      closeModal();
    }
  };

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

function renderServices() {

  const startIndex = (currentPage - 1) * SERVICES_PER_PAGE;
  const endIndex = startIndex + SERVICES_PER_PAGE;
  const servicesToRender = currentFilteredServices.slice(startIndex, endIndex);

  // 2. Pintar las tarjetas correspondientes a la página actual
  servicesGrid.replaceChildren(
    ...servicesToRender.map((service) => createServiceCard(service)),
  );

  const hasResults = currentFilteredServices.length > 0;
  servicesGrid.hidden = !hasResults;
  emptyState.hidden = hasResults;
  pagination.hidden = !hasResults;

  if (!hasResults) {
    resultsCount.textContent = "";
    pagination.replaceChildren(); 
    return;
  }

  const serviceLabel =
    currentFilteredServices.length === 1 ? "servicio disponible" : "servicios disponibles";
  resultsCount.textContent = `Mostrando ${currentFilteredServices.length} ${serviceLabel}`;

  renderPaginationControls();
}

function renderPaginationControls() {
  const totalPages = Math.ceil(currentFilteredServices.length / SERVICES_PER_PAGE);
  pagination.replaceChildren(); // Limpiar botones viejos

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
  const normalizedQuery = normalizeText(searchInput.value);
  
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

    const matchesQuery =
      normalizedQuery.length === 0 || searchableContent.includes(normalizedQuery);
    const matchesCategory =
      categoryFilter.value === "" || service.category === categoryFilter.value;
    const matchesDistrict =
      districtFilter.value === "" ||
      service.district === districtFilter.value ||
      service.district === "Nacional";
    const matchesModality =
      modalityFilter.value === "" || service.modality === modalityFilter.value;

    return (
      matchesQuery && matchesCategory && matchesDistrict && matchesModality
    );
  });

  currentPage = 1;
  renderServices();
}

function clearFilters() {
  searchInput.value = "";
  categoryFilter.value = "";
  districtFilter.value = "";
  modalityFilter.value = "";
  currentPage = 1;
  applyFilters();
  searchInput.focus();
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applyFilters();
});

[categoryFilter, districtFilter, modalityFilter].forEach((filter) => {
  filter.addEventListener("change", applyFilters);
});

clearFiltersButton.addEventListener("click", clearFilters);
emptyClearButton.addEventListener("click", clearFilters);

servicesGrid.addEventListener("click", (event) => {
  const toggleButton = event.target.closest('[data-admin-action="toggle-status"]');
  if (!toggleButton || !isAdminUser()) return;

  const card = toggleButton.closest(".service-card");
  if (!card?.dataset.serviceId) return;

  toggleServiceStatus(card.dataset.serviceId).catch((error) => {
    console.error(error);
  });
});

async function initCatalog() {
  services = await loadServices();
  currentFilteredServices = [...services];
  
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

  applyFilters();
  renderAdminCatalogActions();
}

initCatalog();
