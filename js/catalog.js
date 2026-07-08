const SERVICE_DRAFTS_KEY = "cercared_admin_service_drafts";
const CREATED_SERVICES_KEY = "cercared_admin_created_services";

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readInitialDrafts() {
  return readJson(SERVICE_DRAFTS_KEY, {});
}

function applyInitialDraft(service) {
  const draft = readInitialDrafts()[service.id] || {};
  return {
    ...service,
    ...draft,
    requirements: draft.requirements || service.requirements,
    documents: draft.documents || service.documents,
    steps: draft.steps || service.steps,
    channels: draft.channels || service.channels,
  };
}

function getCreatedServices() {
  return readJson(CREATED_SERVICES_KEY, []);
}

function saveCreatedService(service) {
  const createdServices = getCreatedServices();
  const nextServices = [
    ...createdServices.filter((item) => item.id !== service.id),
    service,
  ];
  writeJson(CREATED_SERVICES_KEY, nextServices);
}

function getAllServices() {
  return [...(window.CercaRedServices || []), ...getCreatedServices()].map(applyInitialDraft);
}

let services = getAllServices();
let currentPage = 1;
const SERVICES_PER_PAGE = 6;
let currentFilteredServices = [...services]; 

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
const INACTIVE_SERVICES_KEY = "cercared_inactive_services";

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

function getInactiveServiceIds() {
  try {
    return JSON.parse(localStorage.getItem(INACTIVE_SERVICES_KEY) || "[]");
  } catch {
    return [];
  }
}

function setInactiveServiceIds(ids) {
  localStorage.setItem(INACTIVE_SERVICES_KEY, JSON.stringify([...new Set(ids)]));
}

function isServiceInactive(serviceId) {
  return getInactiveServiceIds().includes(serviceId);
}

function toggleServiceStatus(serviceId) {
  const inactiveIds = getInactiveServiceIds();
  const nextIds = inactiveIds.includes(serviceId)
    ? inactiveIds.filter((id) => id !== serviceId)
    : [...inactiveIds, serviceId];

  setInactiveServiceIds(nextIds);
  applyFilters();
}

function createServiceCard(service) {
  const isInactive = isServiceInactive(service.id);
  const article = document.createElement("article");
  article.className = `service-card${isInactive ? " is-inactive" : ""}`;
  article.dataset.serviceId = service.id;

  article.innerHTML = `
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

function formatSectionItems(items = []) {
  return items.map((item) => `${item.title || ""} | ${item.description || ""}`).join("\n");
}

function createServiceFromForm() {
  const name = document.querySelector("#admin-ai-name").value.trim();
  const entity = document.querySelector("#admin-ai-entity").value.trim();
  const category = document.querySelector("#admin-ai-category").value;
  const description = document.querySelector("#admin-ai-description").value.trim();
  const shortDescription = document.querySelector("#admin-ai-short-description").value.trim();
  const officialUrl = document.querySelector("#admin-ai-url").value.trim();
  const cost = document.querySelector("#admin-ai-cost").value.trim() || "Gratuito";
  const scope = document.querySelector("#admin-ai-scope").value.trim() || "Nacional";
  const modality = document.querySelector("#admin-ai-modality").value;
  const attention = document.querySelector("#admin-ai-attention").value.trim() || modality;
  const district = document.querySelector("#admin-ai-district").value.trim() || "Nacional";

  if (!name || !entity || !description) {
    throw new Error("Completa nombre, entidad y descripción antes de guardar.");
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
    requirements: parseSectionItems(document.querySelector("#admin-ai-requirements").value),
    documents: parseSectionItems(document.querySelector("#admin-ai-documents").value),
    steps: parseSectionItems(document.querySelector("#admin-ai-steps").value),
    procedures: [
      {
        value: "procedimiento-general",
        label: "Procedimiento general",
      },
    ],
    channels: parseSectionItems(document.querySelector("#admin-ai-channels").value),
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
}

function buildAiServiceModal() {
  return `
    <div class="admin-ai-modal-overlay" id="admin-ai-modal" role="dialog" aria-modal="true" aria-labelledby="admin-ai-title">
      <div class="admin-ai-modal">
        <button class="admin-ai-close" type="button" aria-label="Cerrar">×</button>
        <p class="admin-ai-eyebrow">Administración</p>
        <h2 id="admin-ai-title">Añadir servicio con IA</h2>
        <p class="admin-ai-intro">
          Pega fuentes oficiales o notas verificadas. La IA genera un borrador editable antes de agregarlo al catálogo.
        </p>

        <form class="admin-ai-form" id="admin-ai-form">
          <label class="admin-ai-full">
            Fuentes oficiales o notas
            <textarea id="admin-ai-sources" placeholder="Pega enlaces oficiales, requisitos, canales, costos y pasos del servicio."></textarea>
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

          <p class="admin-ai-help admin-ai-full">Formato de listas: una línea por elemento usando Título | Descripción.</p>
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

  const closeModal = () => {
    modal.remove();
    document.body.classList.remove("has-admin-ai-modal");
  };

  closeButton.addEventListener("click", closeModal);
  cancelButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  generateButton.addEventListener("click", async () => {
    const sources = document.querySelector("#admin-ai-sources").value.trim();
    if (!sources) {
      message.textContent = "Pega fuentes oficiales o notas antes de generar.";
      return;
    }

    generateButton.disabled = true;
    message.textContent = "Generando borrador...";

    try {
      const response = await fetch("/api/generate-service-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo generar el servicio.");

      fillAiServiceForm(payload.service);
      message.textContent = "Borrador generado. Revísalo antes de agregarlo.";
    } catch (error) {
      message.textContent = error.message;
    } finally {
      generateButton.disabled = false;
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      const newService = createServiceFromForm();
      saveCreatedService(newService);
      services = getAllServices();
      closeModal();
      clearFilters();
    } catch (error) {
      message.textContent = error.message;
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

  toggleServiceStatus(card.dataset.serviceId);
});

renderServices();
renderAdminCatalogActions();
