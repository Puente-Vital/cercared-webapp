const services = window.CercaRedServices || [];

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

const QUERY_PARAM = "q";
const CATEGORY_PARAM = "category";
const DISTRICT_PARAM = "district";
const MODALITY_PARAM = "modality";

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function createServiceCard(service) {
  const article = document.createElement("article");
  article.className = "service-card";
  article.dataset.serviceId = service.id;

  article.innerHTML = `
    <div class="service-card-header">
      <span class="service-category">${service.category}</span>
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
    </div>
  `;

  return article;
}

function setSelectValue(select, value) {
  if (!value) return;
  const hasOption = Array.from(select.options).some((option) => option.value === value);
  if (hasOption) select.value = value;
}

function readFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);

  searchInput.value = params.get(QUERY_PARAM) || params.get("query") || "";
  setSelectValue(categoryFilter, params.get(CATEGORY_PARAM));
  setSelectValue(districtFilter, params.get(DISTRICT_PARAM));
  setSelectValue(modalityFilter, params.get(MODALITY_PARAM));
}

function updateUrlFromFilters() {
  const params = new URLSearchParams();
  const query = searchInput.value.trim();

  if (query) params.set(QUERY_PARAM, query);
  if (categoryFilter.value) params.set(CATEGORY_PARAM, categoryFilter.value);
  if (districtFilter.value) params.set(DISTRICT_PARAM, districtFilter.value);
  if (modalityFilter.value) params.set(MODALITY_PARAM, modalityFilter.value);

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);
}

function renderServices(filteredServices) {
  servicesGrid.replaceChildren(
    ...filteredServices.map((service) => createServiceCard(service)),
  );

  const hasResults = filteredServices.length > 0;
  servicesGrid.hidden = !hasResults;
  emptyState.hidden = hasResults;
  pagination.hidden = !hasResults;

  if (!hasResults) {
    resultsCount.textContent = "";
    return;
  }

  const serviceLabel =
    filteredServices.length === 1 ? "servicio disponible" : "servicios disponibles";
  resultsCount.textContent = `Mostrando ${filteredServices.length} ${serviceLabel}`;
}

function applyFilters({ syncUrl = true } = {}) {
  if (syncUrl) updateUrlFromFilters();

  const normalizedQuery = normalizeText(searchInput.value);
  const filteredServices = services.filter((service) => {
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
      districtFilter.value === "" || service.district === districtFilter.value;
    const matchesModality =
      modalityFilter.value === "" || service.modality === modalityFilter.value;

    return (
      matchesQuery && matchesCategory && matchesDistrict && matchesModality
    );
  });

  renderServices(filteredServices);
}

function clearFilters() {
  searchInput.value = "";
  categoryFilter.value = "";
  districtFilter.value = "";
  modalityFilter.value = "";
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

readFiltersFromUrl();
applyFilters({ syncUrl: false });
