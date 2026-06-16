(function () {
  const grid = document.querySelector("#saved-grid");
  const empty = document.querySelector("#saved-empty");
  const count = document.querySelector("#saved-count");
  const { getSaved, setSaved } = window.CercaRedSaved;

  const toId = (name) =>
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  function createCard(service) {
    const article = document.createElement("article");
    article.className = "service-card";
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
//falta unificar el detail.html #1
    article.querySelector(".details-button").addEventListener("click", () => {
      window.location.href = "detail.html?id=" + encodeURIComponent(service.id || toId(service.name));
    });
    article.querySelector(".remove-button").addEventListener("click", () =>
      remove(service.name)
    );
    return article;
  }

  function remove(name) {
    setSaved(getSaved().filter((s) => s.name !== name));
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
