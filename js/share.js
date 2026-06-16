(function () {
  const ICONS = {
    whatsapp:
      '<path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02zM12.05 20.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.23 8.25c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/>',
    x: '<path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.81-5.96 6.81H1.69l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64z"/>',
    facebook:
      '<path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94z"/>',
    telegram:
      '<path d="M21.94 4.64 18.62 20.3c-.25 1.1-.9 1.38-1.82.86l-5.03-3.71-2.43 2.34c-.27.27-.5.5-1.01.5l.36-5.13L17.04 6.7c.4-.36-.09-.56-.63-.2L5.85 13.3l-4.92-1.54c-1.07-.34-1.09-1.07.22-1.58L20.55 3.1c.89-.34 1.67.2 1.39 1.54z"/>',
    discord:
      '<path d="M19.54 5.34A17.7 17.7 0 0 0 15.2 4l-.22.44a13.4 13.4 0 0 1 3.83 1.93 13.2 13.2 0 0 0-11.6 0A13.4 13.4 0 0 1 11.04 4.4L10.8 4a17.7 17.7 0 0 0-4.34 1.34C3.7 9.42 2.95 13.4 3.32 17.32a17.8 17.8 0 0 0 5.39 2.7l.43-.6a11.6 11.6 0 0 1-1.94-.93l.48-.36a12.6 12.6 0 0 0 10.64 0l.48.36c-.61.36-1.26.67-1.94.93l.43.6a17.8 17.8 0 0 0 5.39-2.7c.44-4.55-.74-8.5-3.14-11.98zM9.35 14.94c-1.04 0-1.9-.96-1.9-2.13 0-1.18.84-2.14 1.9-2.14 1.07 0 1.92.97 1.9 2.14 0 1.17-.84 2.13-1.9 2.13zm5.3 0c-1.04 0-1.9-.96-1.9-2.13 0-1.18.84-2.14 1.9-2.14 1.07 0 1.92.97 1.9 2.14 0 1.17-.83 2.13-1.9 2.13z"/>',
    instagram:
      '<path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.25-2.19.41-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.42-.36 1.04-.41 2.19-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.25 1.77.41 2.19.21.55.47.94.88 1.35.41.41.8.67 1.35.88.42.16 1.04.36 2.19.41 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.25 2.19-.41.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.42.36-1.04.41-2.19.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.25-1.77-.41-2.19a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.42-.16-1.04-.36-2.19-.41-1.24-.06-1.61-.07-4.76-.07zm0 2.76a5.3 5.3 0 1 0 0 10.6 5.3 5.3 0 0 0 0-10.6zm0 8.74a3.44 3.44 0 1 1 0-6.88 3.44 3.44 0 0 1 0 6.88zm6.74-8.94a1.24 1.24 0 1 1-2.48 0 1.24 1.24 0 0 1 2.48 0z"/>',
    email:
      '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 3.24V18h16V7.24l-8 5.26-8-5.26zM18.6 6H5.4l6.6 4.34L18.6 6z"/>',
    link:
      '<path d="M10.6 13.4a1 1 0 0 0 1.42 0l4.24-4.24a3 3 0 0 0-4.24-4.24l-1.42 1.41 1.42 1.42 1.41-1.42a1 1 0 0 1 1.42 1.42l-4.24 4.24a1 1 0 0 0 0 1.41zm2.8-2.8a1 1 0 0 0-1.42 0L7.74 14.84a3 3 0 0 0 4.24 4.24l1.42-1.41-1.42-1.42-1.41 1.42a1 1 0 0 1-1.42-1.42l4.24-4.24a1 1 0 0 0 0-1.41z"/>',
  };

  //servicios 
  const TARGETS = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      shareUrl: (d) =>
        `https://wa.me/?text=${encodeURIComponent(`${d.text} ${d.url}`)}`,
    },
    {
      id: "x",
      label: "X",
      shareUrl: (d) =>
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          d.text
        )}&url=${encodeURIComponent(d.url)}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      shareUrl: (d) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          d.url
        )}`,
    },
    {
      id: "telegram",
      label: "Telegram",
      shareUrl: (d) =>
        `https://t.me/share/url?url=${encodeURIComponent(
          d.url
        )}&text=${encodeURIComponent(d.text)}`,
    },
    {
      id: "email",
      label: "Correo",
      shareUrl: (d) =>
        `mailto:?subject=${encodeURIComponent(
          d.title
        )}&body=${encodeURIComponent(`${d.text} ${d.url}`)}`,
    },
    {
      id: "discord",
      label: "Discord",
      copyOnly: true,
      hint: "Enlace copiado. Pegalo en Discord para compartir.",
    },
    {
      id: "instagram",
      label: "Instagram",
      copyOnly: true,
      hint: "Enlace copiado. Pegalo en Instagram para compartir.",
    },
  ];

  let currentData = null;
  let lastFocused = null;
  let modal = null;

  function buildShareData(service) {
    const name = service.name || "Servicio en CercaRed";
    const entity = service.entity ? ` (${service.entity})` : "";
    const description = service.description ? service.description.trim() : "";
    const url = service.url || window.location.href;

    const title = `${name}${entity}`;

    const textLines = [title];
    if (description) textLines.push(description);
    textLines.push("Encuéntralo en CercaRed:");
    const text = textLines.join("\n");
    const fullText = `${text}\n${url}`;

    return { title, text, fullText, url };
  }

  function ensureModal() {
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "share-modal-overlay";
    modal.id = "share-modal";
    modal.hidden = true;

    const targetsMarkup = TARGETS.map(
      (t) => `
      <button class="share-target share-target--${t.id}" type="button"
              data-target="${t.id}" aria-label="Compartir por ${t.label}">
        <span class="share-target-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">${
            ICONS[t.id]
          }</svg>
        </span>
        <span class="share-target-label">${t.label}</span>
      </button>`
    ).join("");

    modal.innerHTML = `
      <div class="share-modal" role="dialog" aria-modal="true"
           aria-labelledby="share-modal-title">
        <div class="share-modal-header">
          <h2 id="share-modal-title">Compartir</h2>
          <button class="share-modal-close" type="button" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.42 1.42 6.3 6.3-6.3 6.29 1.42 1.42 6.3-6.3 6.29 6.3 1.42-1.42-6.3-6.29 6.3-6.3z"/>
            </svg>
          </button>
        </div>

        <div class="share-targets">
          ${targetsMarkup}
        </div>

        <div class="share-url">
          <input class="share-url-input" type="text" readonly aria-label="Enlace para compartir" />
          <button class="share-url-copy" type="button">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">${
              ICONS.link
            }</svg>
            Copiar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeShareModal();
    });
    modal.querySelector(".share-modal-close").addEventListener("click", closeShareModal);

    modal.querySelectorAll(".share-target").forEach((button) => {
      button.addEventListener("click", () => onTargetClick(button.dataset.target));
    });

    modal.querySelector(".share-url-copy").addEventListener("click", () => {
      copyToClipboard(currentData.fullText, "Texto y enlace copiados");
    });

    return modal;
  }

  function onTargetClick(targetId) {
    const target = TARGETS.find((t) => t.id === targetId);
    if (!target) return;

    if (target.copyOnly) {
      copyToClipboard(currentData.fullText, target.hint);
      return;
    }
    window.open(target.shareUrl(currentData), "_blank", "noopener,noreferrer");
  }

  function openShareModal(service) {
    currentData = buildShareData(service);
    ensureModal();

    modal.querySelector(".share-url-input").value = currentData.url;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden"; 
    modal.querySelector(".share-modal-close").focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeShareModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(event) {
    if (event.key === "Escape") closeShareModal();
  }

  async function copyToClipboard(text, message) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(message);
        return;
      }
      throw new Error("Clipboard error");
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showToast(message);
      } catch (copyError) {
        showToast("No se pudo copiar en este navegador");
      }
      document.body.removeChild(textarea);
    }
  }

  let toastTimer = null;
  function showToast(message) {
    let toast = document.querySelector("#share-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "share-toast";
      toast.className = "share-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function readServiceFromCard(card) {
    const getText = (selector) => {
      const el = card.querySelector(selector);
      return el ? el.textContent.trim() : "";
    };
    return {
      name: getText("h3"),
      entity: getText(".service-entity"),
      description: getText(".service-description"),
      url: window.location.href,
    };
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".share-button");
    if (!button) return;
    const card = button.closest(".service-card");
    const service = card ? readServiceFromCard(card) : { url: window.location.href };
    openShareModal(service);
  });
  window.CercaRedShare = { openShareModal };
})();
