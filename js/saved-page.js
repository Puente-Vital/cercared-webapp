(function () {
  const grid = document.querySelector("#saved-grid");
  const empty = document.querySelector("#saved-empty");
  const count = document.querySelector("#saved-count");
  const { getSaved, setSaved } = window.CercaRedSaved;

  function createCard(service) {
    const article = document.createElement("article");
    article.className = "service-card";
    article.dataset.serviceId = service.id || "";
    article.innerHTML = `
      <div class="service-card-header">
        <span class="service-category">${service.category || "Servicio"}</span>
      </div>
      <h3>${service.name}</h3>
      <p class="service-entity">${service.entity || ""}</p>
      <p class="service-description">${service.description || ""}</p>
      <div class="card-actions">
        <button class="details-button" type="button">Ver detalle</button>
        <button class="share-button remove-button" type="button">Quitar de guardados</button>
      </div>`;

    article.querySelector(".details-button").addEventListener("click", () => {
      if (!service.id) return;
      window.location.href = "detail.html?id=" + encodeURIComponent(service.id);
    });
    article.querySelector(".remove-button").addEventListener("click", () =>
      remove(service)
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
