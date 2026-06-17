(function () {
  let modal = null, lastFocus = null;

  function buildText(s) {
    const reqs = (s.requirements || []).map((r) => `- ${r.title}`).join("\n");
    const steps = (s.steps || []).map((st, i) => `${i + 1}. ${st.title}`).join("\n");
    return `${s.name}\n\nRequisitos principales:\n${reqs}\n\nPasos:\n${steps}\n\nCanal oficial: ${s.officialUrl || "(no disponible)"}`;
  }

  function missingData(s) {
    const missing = [];
    if (!s.requirements || !s.requirements.length) missing.push("requisitos");
    if (!s.steps || !s.steps.length) missing.push("pasos");
    if (!s.officialUrl) missing.push("canal oficial");
    return missing;
  }

  function build() {
    if (modal) return;
    modal = document.createElement("div");
    modal.className = "summary-overlay";
    modal.id = "summary-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="summary-modal" role="dialog" aria-modal="true" aria-labelledby="summary-title">
        <div class="summary-header">
          <h2 id="summary-title">Resumen del trámite</h2>
          <button class="summary-close" type="button" aria-label="Cerrar">✕</button>
        </div>
        <div class="summary-body"></div>
        <div class="summary-actions">
          <button class="summary-copy" type="button">Copiar resumen</button>
          <button class="summary-share" type="button">Compartir resumen</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    modal.querySelector(".summary-close").addEventListener("click", close);
  }

  function open(service) {
    build();
    const body = modal.querySelector(".summary-body");
    const reqs = (service.requirements || []).map((r) => `<li>${r.title}</li>`).join("");
    const steps = (service.steps || []).map((s) => `<li>${s.title}</li>`).join("");
    const missing = missingData(service);
    const warn = missing.length
      ? `<p class="summary-warning">⚠ No se pudo incluir: ${missing.join(", ")}.</p>`
      : "";

    body.innerHTML = `
      <h3 class="summary-name">${service.name}</h3>
      ${warn}
      <h4>Requisitos principales</h4>
      <ul>${reqs || "<li>No disponible</li>"}</ul>
      <h4>Pasos</h4>
      <ol>${steps || "<li>No disponible</li>"}</ol>
      <h4>Canal oficial</h4>
      <p>${service.officialUrl
        ? `<a href="${service.officialUrl}" target="_blank" rel="noreferrer">${service.officialUrl}</a>`
        : "No disponible"}</p>`;

    const text = buildText(service);
    modal.querySelector(".summary-copy").onclick = () => copy(text);
    modal.querySelector(".summary-share").onclick = () => {
      if (window.CercaRedShare) {
        window.CercaRedShare.openShareModal({
          name: service.name, entity: service.shortEntity, description: text, url: service.officialUrl,
        });
      } else copy(text);
    };

    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".summary-close").focus();
    document.addEventListener("keydown", onKey);
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
    lastFocus?.focus();
  }
  const onKey = (e) => { if (e.key === "Escape") close(); };

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast("Resumen copiado"); }
    catch { toast("No se pudo copiar"); }
  }

  let timer;
  function toast(msg) {
    let el = document.querySelector("#summary-toast");
    if (!el) {
      el = Object.assign(document.createElement("div"), { id: "summary-toast", className: "saved-toast" });
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("is-visible"), 2400);
  }

  window.CercaRedSummary = { open };
})();
