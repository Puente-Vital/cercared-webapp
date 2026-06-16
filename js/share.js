(function () {
  const TARGETS = [
    { id: "whatsapp", label: "WhatsApp", url: (d) => `https://wa.me/?text=${encodeURIComponent(d.text + " " + d.url)}` },
    { id: "x", label: "X", url: (d) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(d.text)}&url=${encodeURIComponent(d.url)}` },
    { id: "facebook", label: "Facebook", url: (d) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(d.url)}` },
    { id: "telegram", label: "Telegram", url: (d) => `https://t.me/share/url?url=${encodeURIComponent(d.url)}&text=${encodeURIComponent(d.text)}` },
    { id: "mail", label: "Correo", url: (d) => `mailto:?subject=${encodeURIComponent(d.title)}&body=${encodeURIComponent(d.text + " " + d.url)}` },
    { id: "discord", label: "Discord", copyOnly: true, hint: "Enlace copiado. Pegalo en Discord." },
    { id: "instagram", label: "Instagram", copyOnly: true, hint: "Enlace copiado. Pegalo en Instagram." },
  ];

  let data = null, modal = null, lastFocus = null;

  function buildData(s) {
    const title = `${s.name || "Servicio"}${s.entity ? ` (${s.entity})` : ""}`;
    const lines = [title];
    if (s.description) lines.push(s.description.trim());
    lines.push("Encuéntralo en CercaRed:");
    const text = lines.join("\n");
    const url = s.url || window.location.href;
    return { title, text, fullText: `${text}\n${url}`, url };
  }

  function build() {
    if (modal) return;
    modal = document.createElement("div");
    modal.className = "share-modal-overlay";
    modal.id = "share-modal";
    modal.hidden = true;
    const targets = TARGETS.map((t) => `
      <button class="share-target share-target--${t.id}" type="button" data-target="${t.id}" aria-label="Compartir por ${t.label}">
        <span class="share-target-icon"><img src="assets/icons/${t.id}.svg" alt="" aria-hidden="true" /></span>
        <span class="share-target-label">${t.label}</span>
      </button>`).join("");
    modal.innerHTML = `
      <div class="share-modal" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
        <div class="share-modal-header">
          <h2 id="share-modal-title">Compartir</h2>
          <button class="share-modal-close" type="button" aria-label="Cerrar">✕</button>
        </div>
        <div class="share-targets">${targets}</div>
        <div class="share-url">
          <input class="share-url-input" type="text" readonly aria-label="Enlace para compartir" />
          <button class="share-url-copy" type="button">
            <img src="assets/icons/copy.svg" alt="" aria-hidden="true" /> Copiar
          </button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    modal.querySelector(".share-modal-close").addEventListener("click", close);
    modal.querySelector(".share-url-copy").addEventListener("click", () => copy(data.fullText, "Texto y enlace copiados"));
    modal.querySelectorAll(".share-target").forEach((b) =>
      b.addEventListener("click", () => onTarget(b.dataset.target))
    );
  }

  function onTarget(id) {
    const t = TARGETS.find((x) => x.id === id);
    if (t.copyOnly) return copy(data.fullText, t.hint);
    window.open(t.url(data), "_blank", "noopener,noreferrer");
  }

  function open(service) {
    data = buildData(service);
    build();
    modal.querySelector(".share-url-input").value = data.url;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".share-modal-close").focus();
    document.addEventListener("keydown", onKey);
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
    lastFocus?.focus();
  }

  const onKey = (e) => { if (e.key === "Escape") close(); };

  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg); }
    catch { toast("No se pudo copiar en este navegador"); }
  }

  let timer;
  function toast(msg) {
    let el = document.querySelector("#share-toast");
    if (!el) {
      el = Object.assign(document.createElement("div"), { id: "share-toast", className: "share-toast" });
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("is-visible"), 2400);
  }

  const text = (card, sel) => card.querySelector(sel)?.textContent.trim() || "";
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".share-button");
    const card = btn?.closest(".service-card");
    if (!card) return;
    open({ name: text(card, "h3"), entity: text(card, ".service-entity"), description: text(card, ".service-description") });
  });

  window.CercaRedShare = { openShareModal: open };
})();
