/**
 * ayuda.js — Centro de Ayuda de CercaRed
 * Implementa T17 (FAQ), T19 (búsqueda/filtro por tema) y acordeón accesible
 */

"use strict";

/* ══════════════════════════════
   Datos de FAQ (T17)
══════════════════════════════ */
const FAQ_DATA = [
  // ── Búsqueda ──
  {
    topic: "busqueda",
    topicLabel: "Búsqueda",
    q: "¿Cómo busco un servicio?",
    a: `Ingresa una palabra clave en el buscador de la página principal (Catálogo).
        Por ejemplo: "salud", "alimentos", "vivienda", "educación" o el nombre de un programa.
        Los resultados se actualizan automáticamente mientras escribes.`,
  },
  {
    topic: "busqueda",
    topicLabel: "Búsqueda",
    q: "¿Puedo buscar por nombre del programa?",
    a: `Sí. Puedes escribir el nombre del programa directamente, como "Pensión 65",
        "Beca 18" o "SIS". El buscador también reconoce palabras parciales.`,
  },
  {
    topic: "busqueda",
    topicLabel: "Búsqueda",
    q: "¿Qué hago si no aparecen resultados?",
    a: `Prueba con una palabra más general (ej.: "salud" en vez de "consulta médica gratuita").
        También puedes limpiar el buscador y explorar el catálogo completo para revisar todos
        los servicios disponibles.`,
  },

  // ── Filtros ──
  {
    topic: "filtros",
    topicLabel: "Filtros",
    q: "¿Cómo uso los filtros del catálogo?",
    a: `Debajo del buscador encontrarás tres filtros desplegables: <strong>Categoría</strong>,
        <strong>Distrito</strong> y <strong>Modalidad</strong>. Selecciona una opción en cualquiera
        de ellos y la lista se actualizará al instante.`,
  },
  {
    topic: "filtros",
    topicLabel: "Filtros",
    q: "¿Puedo combinar varios filtros a la vez?",
    a: `Sí. Puedes usar el buscador y los filtros al mismo tiempo. Por ejemplo:
        escribe "salud" y selecciona el distrito "San Juan de Lurigancho" para ver
        solo servicios de salud disponibles en esa zona.`,
  },
  {
    topic: "filtros",
    topicLabel: "Filtros",
    q: "¿Cómo limpio los filtros?",
    a: `Haz clic en el botón <strong>Limpiar filtros</strong> (ícono de embudo con X)
        que aparece junto a los filtros. Esto restablece todos los filtros y el buscador
        para mostrar el catálogo completo.`,
  },

  // ── Guardados ──
  {
    topic: "guardados",
    topicLabel: "Guardados",
    q: "¿Cómo guardo un servicio para verlo después?",
    a: `En cada tarjeta del catálogo encontrarás un ícono de marcador (guardar).
        Haz clic en él para guardar el servicio. Puedes ver todos tus servicios
        guardados desde la sección <strong>Guardados</strong> en el menú principal.`,
  },
  {
    topic: "guardados",
    topicLabel: "Guardados",
    q: "¿Se pierden mis servicios guardados si cierro el navegador?",
    a: `No. Tus servicios guardados se almacenan en tu navegador (localStorage),
        por lo que permanecen disponibles aunque cierres la pestaña o el navegador.
        Sin embargo, si usas un navegador diferente o limpias los datos del navegador,
        los guardados podrían perderse.`,
  },
  {
    topic: "guardados",
    topicLabel: "Guardados",
    q: "¿Cómo elimino un servicio de mis guardados?",
    a: `Vuelve a hacer clic en el ícono de marcador del servicio que deseas eliminar
        (en el catálogo o en la página de Guardados). El marcador se desactivará y
        el servicio desaparecerá de tu lista de guardados.`,
  },

  // ── Modo simple ──
  {
    topic: "modo-simple",
    topicLabel: "Modo simple",
    q: "¿Qué es el Modo simple?",
    a: `El Modo simple muestra la información de cada servicio de forma más clara
        y resumida, usando un lenguaje sencillo. Está pensado para personas que
        prefieren una lectura más directa, sin términos técnicos o con menos texto.`,
  },
  {
    topic: "modo-simple",
    topicLabel: "Modo simple",
    q: "¿Cómo activo el Modo simple?",
    a: `Dentro del detalle de cualquier servicio encontrarás un interruptor o botón
        que dice <strong>Modo simple</strong>. Al activarlo, la página se reorganiza
        para mostrar solo la información esencial del servicio.`,
  },

  // ── Acceso ──
  {
    topic: "acceso",
    topicLabel: "Acceso",
    q: "¿Para qué sirve crear una cuenta en CercaRed?",
    a: `Crear una cuenta te permite tener tus servicios guardados vinculados a tu
        perfil, de modo que puedas acceder a ellos desde cualquier dispositivo.
        Sin cuenta, los guardados solo se conservan en el navegador donde los creaste.`,
  },
  {
    topic: "acceso",
    topicLabel: "Acceso",
    q: "¿Cómo creo una cuenta?",
    a: `Haz clic en <strong>Acceso</strong> en el menú de navegación y luego
        selecciona la opción de registro. Completa el formulario con tu correo
        electrónico y una contraseña. Recibirás una confirmación para activar tu cuenta.`,
  },
  {
    topic: "acceso",
    topicLabel: "Acceso",
    q: "¿Qué hago si olvidé mi contraseña?",
    a: `En la pantalla de inicio de sesión, haz clic en <strong>¿Olvidaste tu contraseña?</strong>.
        Ingresa tu correo electrónico y recibirás un enlace para restablecerla.
        Revisa también tu carpeta de spam si no lo encuentras en la bandeja de entrada.`,
  },
];

/* ══════════════════════════════
   Estado de la aplicación
══════════════════════════════ */
let currentTopic = "all";
let currentQuery = "";

/* ══════════════════════════════
   Inicialización
══════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  renderFAQItems(FAQ_DATA);
  setupSearch();
  setupTopicFilter();
  setupResetButton();
});

/* ══════════════════════════════
   Renderizado de items FAQ
══════════════════════════════ */
function renderFAQItems(items) {
  const list = document.getElementById("faq-list");
  const emptyState = document.getElementById("faq-empty");
  const emptyQuery = document.getElementById("faq-empty-query");

  if (!list) return;

  if (items.length === 0) {
    list.innerHTML = "";
    emptyQuery.textContent = currentQuery;
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  list.innerHTML = items
    .map((item, index) => {
      const id = `faq-answer-${index}`;
      return `
        <div class="faq-item" data-topic="${item.topic}" role="listitem">
          <button
            class="faq-question"
            aria-expanded="false"
            aria-controls="${id}"
            type="button"
          >
            <span>${escapeHtml(item.q)}</span>
            <svg
              class="faq-chevron"
              aria-hidden="true"
              focusable="false"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="faq-answer" id="${id}" role="region" hidden>
            <p>${item.a}</p>
            <span class="faq-topic-tag">${escapeHtml(item.topicLabel)}</span>
          </div>
        </div>
      `;
    })
    .join("");

  setupAccordion();
}

/* ══════════════════════════════
   Acordeón accesible (T20)
══════════════════════════════ */
function setupAccordion() {
  const buttons = document.querySelectorAll(".faq-question");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const answer = document.getElementById(btn.getAttribute("aria-controls"));
      const isOpen = item.classList.contains("is-open");

      // Cerrar todos los otros
      document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
        if (openItem !== item) {
          const openBtn = openItem.querySelector(".faq-question");
          const openAnswer = document.getElementById(openBtn.getAttribute("aria-controls"));
          openItem.classList.remove("is-open");
          openBtn.setAttribute("aria-expanded", "false");
          if (openAnswer) openAnswer.hidden = true;
        }
      });

      // Alternar el actual
      if (isOpen) {
        item.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        if (answer) answer.hidden = true;
      } else {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        if (answer) answer.hidden = false;
      }
    });

    // Soporte de teclado: Enter y Espacio ya funcionan nativamente en <button>
  });
}

/* ══════════════════════════════
   Buscador (T19)
══════════════════════════════ */
function setupSearch() {
  const input = document.getElementById("faq-search");
  if (!input) return;

  input.addEventListener("input", () => {
    currentQuery = input.value.trim().toLowerCase();
    applyFilters();
  });
}

/* ══════════════════════════════
   Filtro por tema (T19)
══════════════════════════════ */
function setupTopicFilter() {
  const buttons = document.querySelectorAll(".topic-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Actualizar estado visual
      buttons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      currentTopic = btn.dataset.topic || "all";
      applyFilters();
    });
  });
}

/* ══════════════════════════════
   Aplicar filtros combinados
══════════════════════════════ */
function applyFilters() {
  let filtered = FAQ_DATA;

  // Filtrar por tema
  if (currentTopic && currentTopic !== "all") {
    filtered = filtered.filter((item) => item.topic === currentTopic);
  }

  // Filtrar por texto
  if (currentQuery) {
    filtered = filtered.filter(
      (item) =>
        item.q.toLowerCase().includes(currentQuery) ||
        item.a.toLowerCase().includes(currentQuery) ||
        item.topicLabel.toLowerCase().includes(currentQuery)
    );
  }

  renderFAQItems(filtered);
}

/* ══════════════════════════════
   Botón de reset del estado vacío
══════════════════════════════ */
function setupResetButton() {
  const btn = document.getElementById("faq-empty-reset");
  if (!btn) return;

  btn.addEventListener("click", () => {
    // Limpiar buscador
    const input = document.getElementById("faq-search");
    if (input) input.value = "";
    currentQuery = "";

    // Resetear tema
    currentTopic = "all";
    document.querySelectorAll(".topic-btn").forEach((b) => {
      b.classList.remove("is-active");
      b.setAttribute("aria-pressed", "false");
    });
    const allBtn = document.querySelector('.topic-btn[data-topic="all"]');
    if (allBtn) {
      allBtn.classList.add("is-active");
      allBtn.setAttribute("aria-pressed", "true");
    }

    renderFAQItems(FAQ_DATA);
  });
}

/* ══════════════════════════════
   Utilidades
══════════════════════════════ */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
