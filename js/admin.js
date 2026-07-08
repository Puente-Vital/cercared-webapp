import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCKV8X6ZDw12oFHyKYSNsnX_HiGRWlbaAQ",
  authDomain: "cercared-auth.firebaseapp.com",
  projectId: "cercared-auth",
  storageBucket: "cercared-auth.firebasestorage.app",
  messagingSenderId: "303320791334",
  appId: "1:303320791334:web:4b32a407f6cb0748ae69e7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const root = document.querySelector("#admin-root");
const serviceDraftsKey = "cercared_admin_service_drafts";
const createdServicesKey = "cercared_admin_created_services";
const services = getAllServices().map(applyInitialDraft);
const inactiveKey = "cercared_inactive_services";
let metricsByService = {};
let searchQuery = "";
let statusFilter = "all";
let sortMode = "visits-desc";

function readInitialDrafts() {
  try {
    return JSON.parse(localStorage.getItem(serviceDraftsKey) || "{}");
  } catch {
    return {};
  }
}

function applyInitialDraft(service) {
  const draft = readInitialDrafts()[service.id] || {};
  return {
    ...service,
    ...draft,
    requirements: draft.requirements || service.requirements,
    documents: draft.documents || service.documents,
    steps: draft.steps || service.steps,
    channels: draft.channels || service.channels,
  };
}

function getCreatedServices() {
  return readJson(createdServicesKey, []);
}

function getAllServices() {
  return [...(window.CercaRedServices || []), ...getCreatedServices()];
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getInactiveIds() {
  return readJson(inactiveKey, []);
}

function isInactive(serviceId) {
  return getInactiveIds().includes(serviceId);
}

function setInactive(serviceId, nextInactive) {
  const inactiveIds = getInactiveIds();
  const nextIds = nextInactive
    ? [...inactiveIds, serviceId]
    : inactiveIds.filter((id) => id !== serviceId);

  writeJson(inactiveKey, [...new Set(nextIds)]);
  renderDashboard();
}

function showState(title, message, action = "") {
  root.innerHTML = `
    <section class="admin-state">
      <h1>${title}</h1>
      <p>${message}</p>
      ${action}
    </section>
  `;
}

async function getUserRole(user) {
  const userDoc = await getDoc(doc(db, "users", user.uid));
  const data = userDoc.exists() ? userDoc.data() : {};
  const currentUser = {
    uid: user.uid,
    name: data.name || user.displayName || "Usuario",
    email: user.email,
    role: data.role || "user",
    source: data.source || user.providerData[0]?.providerId || "firebase",
    avatar: data.avatar || null,
    preferences: data.preferences || undefined
  };

  localStorage.setItem("cercared_currentUser", JSON.stringify(currentUser));
  localStorage.setItem("cercared_has_session", "true");
  window.CercaRedNavbar?.updateAuthLink();
  return currentUser.role;
}

async function loadMetrics() {
  try {
    const snapshot = await getDocs(collection(db, "metrics"));
    metricsByService = {};
    snapshot.forEach((metricDoc) => {
      metricsByService[metricDoc.id] = metricDoc.data();
    });
  } catch (error) {
    console.warn("No se pudieron leer las métricas:", error);
    metricsByService = {};
  }
}

function renderStats() {
  const inactiveCount = getInactiveIds().length;
  const activeCount = services.length - inactiveCount;
  const savedCount = readJson("cercared_saved", []).length;
  const totalVisits = Object.values(metricsByService).reduce(
    (sum, metric) => sum + Number(metric.visits || 0),
    0
  );

  return `
    <section class="admin-stats" aria-label="Resumen administrativo">
      <article class="admin-stat">
        <span>Servicios totales</span>
        <strong>${services.length}</strong>
      </article>
      <article class="admin-stat">
        <span>Servicios activos</span>
        <strong>${activeCount}</strong>
      </article>
      <article class="admin-stat">
        <span>Servicios inactivos</span>
        <strong>${inactiveCount}</strong>
      </article>
      <article class="admin-stat">
        <span>Visitas registradas</span>
        <strong>${totalVisits}</strong>
      </article>
      <article class="admin-stat">
        <span>Guardados en este navegador</span>
        <strong>${savedCount}</strong>
      </article>
    </section>
  `;
}

function getVisits(serviceId) {
  return Number(metricsByService[serviceId]?.visits || 0);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getVisibleServices() {
  const normalizedQuery = normalizeText(searchQuery);

  return services
    .filter((service) => {
      const inactive = isInactive(service.id);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !inactive) ||
        (statusFilter === "inactive" && inactive);
      const searchableContent = normalizeText(`${service.name} ${service.entity} ${service.category}`);
      const matchesQuery = !normalizedQuery || searchableContent.includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    })
    .sort((a, b) => {
      if (sortMode === "visits-asc") return getVisits(a.id) - getVisits(b.id);
      if (sortMode === "name-asc") return a.name.localeCompare(b.name, "es");
      if (sortMode === "name-desc") return b.name.localeCompare(a.name, "es");
      return getVisits(b.id) - getVisits(a.id);
    });
}

function renderToolbar() {
  return `
    <div class="admin-toolbar" aria-label="Filtros de servicios publicados">
      <label>
        Buscar
        <input id="admin-search" type="search" value="${escapeHtml(searchQuery)}" placeholder="Buscar por servicio, entidad o categoría" />
      </label>
      <label>
        Estado
        <select id="admin-status-filter">
          <option value="all" ${statusFilter === "all" ? "selected" : ""}>Todos</option>
          <option value="active" ${statusFilter === "active" ? "selected" : ""}>Activos</option>
          <option value="inactive" ${statusFilter === "inactive" ? "selected" : ""}>Inactivos</option>
        </select>
      </label>
      <label>
        Ordenar
        <select id="admin-sort">
          <option value="visits-desc" ${sortMode === "visits-desc" ? "selected" : ""}>Más visitados</option>
          <option value="visits-asc" ${sortMode === "visits-asc" ? "selected" : ""}>Menos visitados</option>
          <option value="name-asc" ${sortMode === "name-asc" ? "selected" : ""}>Nombre A-Z</option>
          <option value="name-desc" ${sortMode === "name-desc" ? "selected" : ""}>Nombre Z-A</option>
        </select>
      </label>
    </div>
  `;
}

function renderServiceRows() {
  const visibleServices = getVisibleServices();

  if (visibleServices.length === 0) {
    return `
      <tr>
        <td colspan="5">No hay servicios que coincidan con los filtros.</td>
      </tr>
    `;
  }

  return visibleServices
    .map((service) => {
      const visits = getVisits(service.id);
      const inactive = isInactive(service.id);

      return `
        <tr>
          <td>
            <strong>${escapeHtml(service.name)}</strong><br>
            <span>${escapeHtml(service.entity)}</span>
          </td>
          <td>${escapeHtml(service.category)}</td>
          <td>${visits}</td>
          <td>
            <span class="status-pill${inactive ? " is-inactive" : ""}">
              ${inactive ? "Inactivo" : "Activo"}
            </span>
          </td>
          <td>
            <div class="admin-row-actions">
              <a href="detail.html?id=${encodeURIComponent(service.id)}#admin-service-editor">Editar</a>
              <button type="button" data-admin-toggle="${escapeHtml(service.id)}">
                ${inactive ? "Activar" : "Desactivar"}
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderDashboard() {
  root.innerHTML = `
    <section class="admin-hero" aria-labelledby="admin-title">
      <div>
        <p class="admin-eyebrow">Panel administrativo</p>
        <h1 id="admin-title">Gestión de servicios</h1>
        <p>Revisa métricas, filtra servicios y controla la visibilidad del catálogo.</p>
      </div>
      <a class="admin-primary-link" href="index.html">Volver al catálogo</a>
    </section>

    ${renderStats()}

    <section class="admin-card" aria-labelledby="admin-services-title">
      <div class="admin-card-heading">
        <div>
          <h2 id="admin-services-title">Servicios publicados</h2>
          <p>Las visitas vienen de Firestore cuando se abre cada detalle de servicio.</p>
        </div>
      </div>
      ${renderToolbar()}
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Categoría</th>
              <th>Visitas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>${renderServiceRows()}</tbody>
        </table>
      </div>
    </section>
  `;

  wireAdminActions();
}

function wireAdminActions() {
  root.querySelectorAll("[data-admin-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      setInactive(button.dataset.adminToggle, !isInactive(button.dataset.adminToggle));
    });
  });

  root.querySelector("#admin-search")?.addEventListener("input", (event) => {
    searchQuery = event.target.value;
    renderDashboard();
  });

  root.querySelector("#admin-status-filter")?.addEventListener("change", (event) => {
    statusFilter = event.target.value;
    renderDashboard();
  });

  root.querySelector("#admin-sort")?.addEventListener("change", (event) => {
    sortMode = event.target.value;
    renderDashboard();
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    showState(
      "Acceso requerido",
      "Debes iniciar sesión con una cuenta administradora para usar este panel.",
      '<a class="admin-primary-link" href="auth.html">Ir a acceso</a>'
    );
    return;
  }

  try {
    const role = await getUserRole(user);
    if (role !== "admin") {
      showState(
        "Permiso insuficiente",
        "Tu cuenta está autenticada, pero no tiene el rol admin en Firestore."
      );
      return;
    }

    await loadMetrics();
    renderDashboard();
  } catch (error) {
    console.error(error);
    showState("Error al validar permisos", "No se pudo confirmar tu rol de administrador.");
  }
});
