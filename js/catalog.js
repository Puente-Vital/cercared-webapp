const services = window.CercaRedServices || [];
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
  currentFilteredServices = [...services];
  currentPage = 1;
  renderServices();
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

renderServices();