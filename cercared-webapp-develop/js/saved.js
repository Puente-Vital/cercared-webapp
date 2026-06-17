(function () {
  const SESSION = "cercared_currentUser";
  const SAVED = "cercared_saved";

  const isLoggedIn = () => !!localStorage.getItem(SESSION);
  const getSaved = () => JSON.parse(localStorage.getItem(SAVED) || "[]");
  const setSaved = (list) => localStorage.setItem(SAVED, JSON.stringify(list));
  const keyOf = (service) => service.id || service.name;
  const isSaved = (service) => {
    const key = typeof service === "string" ? service : keyOf(service);
    return getSaved().some((savedService) => keyOf(savedService) === key);
  };

  function toggleSaved(service) {
    const list = getSaved();
    const serviceKey = keyOf(service);
    const i = list.findIndex((savedService) => keyOf(savedService) === serviceKey);
    if (i >= 0) list.splice(i, 1);
    else list.push(service);
    setSaved(list);
    return i < 0;
  }

  const text = (card, sel) => card.querySelector(sel)?.textContent.trim() || "";
  const readService = (card) => ({
    id: card.dataset.serviceId || "",
    name: text(card, "h3"),
    entity: text(card, ".service-entity"),
    category: text(card, ".service-category"),
    description: text(card, ".service-description"),
    url: card.dataset.serviceId
      ? `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, "")}detail.html?id=${encodeURIComponent(card.dataset.serviceId)}`
      : window.location.href,
  });

  function setState(button, saved) {
    button.classList.toggle("is-saved", saved);
    button.setAttribute("aria-pressed", String(saved)); 
  }
  function refresh() {
    document.querySelectorAll(".service-card").forEach((card) => {
      const button = card.querySelector(".save-button");
      if (button) setState(button, isSaved(readService(card)));
    });
  }

  let timer;
  function toast(message) {
    let el = document.querySelector("#saved-toast");
    if (!el) {
      el = Object.assign(document.createElement("div"), { id: "saved-toast", className: "saved-toast" });
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("is-visible"), 2400);
  }

  document.addEventListener("click", (e) => {
    const button = e.target.closest(".save-button");
    const card = button?.closest(".service-card");
    if (!card) return;
    if (!isLoggedIn()) return (window.location.href = "auth.html"); 
    const saved = toggleSaved(readService(card));
    setState(button, saved);
    toast(saved ? "Servicio guardado" : "Se quito de los guardados");
  });

  document.addEventListener("DOMContentLoaded", () => {
    refresh();
    const grid = document.querySelector("#services-grid"); 
    if (grid) new MutationObserver(refresh).observe(grid, { childList: true });
  });

  window.CercaRedSaved = { getSaved, setSaved, isSaved, isLoggedIn, toggleSaved };
})();
