function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function openConfirmDialog({
  title = "Confirmar acción",
  message = "¿Deseas continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  tone = "warning",
} = {}) {
  return new Promise((resolve) => {
    document.querySelector(".app-confirm-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "app-confirm-overlay";
    overlay.innerHTML = `
      <div class="app-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="app-confirm-title" aria-describedby="app-confirm-message" data-tone="${tone}">
        <p class="app-confirm-eyebrow">Cambios sin guardar</p>
        <h2 id="app-confirm-title">${title}</h2>
        <p class="app-confirm-message" id="app-confirm-message">${message}</p>
        <div class="app-confirm-actions">
          <button class="app-confirm-cancel" type="button">${cancelText}</button>
          <button class="app-confirm-accept" type="button">${confirmText}</button>
        </div>
      </div>
    `;

    const previousActiveElement = document.activeElement;
    const dialog = overlay.querySelector(".app-confirm-dialog");
    const cancelButton = overlay.querySelector(".app-confirm-cancel");
    const acceptButton = overlay.querySelector(".app-confirm-accept");

    const cleanup = (accepted) => {
      document.body.classList.remove("has-app-dialog");
      overlay.remove();
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
      resolve(accepted);
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        cleanup(false);
      }
    });

    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cleanup(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(dialog);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    cancelButton.addEventListener("click", () => cleanup(false));
    acceptButton.addEventListener("click", () => cleanup(true));

    document.body.append(overlay);
    document.body.classList.add("has-app-dialog");
    cancelButton.focus();
  });
}
