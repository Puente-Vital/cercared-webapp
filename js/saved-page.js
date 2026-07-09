(function () {
  const grid = document.querySelector("#saved-grid");
  const empty = document.querySelector("#saved-empty");
  const count = document.querySelector("#saved-count");
  const { getSaved, setSaved } = window.CercaRedSaved;
  const imageHelpers = window.CercaRedServiceImages || {};
  const baseServices = window.CercaRedServices || [];

  function resolveSavedService(service) {
    if (!service) return service;

    const matchedService = baseServices.find((item) =>
      (service.id && item.id === service.id) ||
      (!service.id && service.name && item.name === service.name),
    );

    if (!matchedService) return service;

    return {
      ...matchedService,
      ...service,
      id: service.id || matchedService.id,
      name: service.name || matchedService.name,
      entity: service.entity || matchedService.entity,
      category: service.category || matchedService.category,
      description: service.description || service.shortDescription || matchedService.shortDescription || matchedService.description,
      image: service.image || matchedService.image || "",
    };
  }

  function createImage(service) {
    const img = document.createElement("img");
    img.className = "service-card-image";
    img.alt = service?.name ? `Imagen de ${service.name}` : "Imagen del servicio";
    imageHelpers.attachFallback?.(
      img,
      imageHelpers.getServiceImageCandidates?.(service) || ["assets/images/cards/default.svg"],
    );
    return img;
  }

  function createCard(service) {
    const resolvedService = resolveSavedService(service);
    const article = document.createElement("article");
    article.className = "service-card";
    article.dataset.serviceId = resolvedService.id || "";
    article.innerHTML = `
      <div class="service-card-header">
        <span class="service-category">${resolvedService.category || "Servicio"}</span>
      </div>
      <h3>${resolvedService.name}</h3>
      <p class="service-entity">${resolvedService.entity || ""}</p>
      <p class="service-description">${resolvedService.description || ""}</p>
      <div class="card-actions">
        <button class="details-button" type="button">Ver detalle</button>
        <button class="share-button remove-button" type="button">Quitar de guardados</button>
      </div>`;
    article.prepend(createImage(resolvedService));

    article.querySelector(".details-button").addEventListener("click", () => {
      if (!resolvedService.id) return;
      window.location.href = "detail.html?id=" + encodeURIComponent(resolvedService.id);
    });
    article.querySelector(".remove-button").addEventListener("click", () =>
      remove(resolvedService)
    );
    return article;
  }

  function remove(service) {
    const key = service.id || service.name;
    setSaved(getSaved().filter((savedService) => (savedService.id || savedService.name) !== key));
    render();
  }

  function render() {
    const list = getSaved();
    grid.replaceChildren(...list.map(createCard));
    const has = list.length > 0;
    grid.hidden = !has;
    empty.hidden = has;
    count.textContent = has
      ? `${list.length} ${list.length === 1 ? "servicio guardado" : "servicios guardados"}`
      : "";
  }

  document.addEventListener("DOMContentLoaded", render);
})();
