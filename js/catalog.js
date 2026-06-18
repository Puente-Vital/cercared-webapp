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

function applyFilters() {
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
      districtFilter.value === "" ||
      service.district === districtFilter.value ||
      service.district === "Nacional";
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
  renderServices(services);
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

renderServices(services);
