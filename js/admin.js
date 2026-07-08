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
const services = window.CercaRedServices || [];
const inactiveKey = "cercared_inactive_services";
const draftKey = "cercared_admin_service_drafts";
let metricsByService = {};
let selectedServiceId = new URLSearchParams(window.location.search).get("service") || services[0]?.id;

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

function getDrafts() {
  return readJson(draftKey, {});
}

function saveDraft(serviceId, draft) {
  const drafts = getDrafts();
  drafts[serviceId] = {
    ...draft,
    updatedAt: new Date().toISOString()
  };
  writeJson(draftKey, drafts);
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

function getSelectedService() {
  return services.find((service) => service.id === selectedServiceId) || services[0];
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

function renderServiceRows() {
  return services
    .map((service) => {
      const visits = metricsByService[service.id]?.visits || 0;
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
              <button type="button" data-admin-edit="${escapeHtml(service.id)}">Editar</button>
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

function renderEditor(service) {
  const drafts = getDrafts();
  const draft = drafts[service.id] || {};

  return `
    <section class="admin-card" aria-labelledby="admin-editor-title">
      <h2 id="admin-editor-title">Editar servicio</h2>
      <p class="admin-form-help">
        Por ahora se guarda como borrador local para revisión. Cuando se migre servicios a Firestore, este formulario podrá persistir cambios globales.
      </p>
      <form class="admin-form" id="admin-edit-form">
        <label>
          Servicio
          <select id="admin-service-select">
            ${services.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === service.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}
          </select>
        </label>
        <label>
          Nombre
          <input id="admin-service-name" type="text" value="${escapeHtml(draft.name || service.name)}" />
        </label>
        <label>
          Descripción corta
          <textarea id="admin-service-description">${escapeHtml(draft.shortDescription || service.shortDescription)}</textarea>
        </label>
        <label>
          Estado
          <select id="admin-service-status">
            <option value="active" ${isInactive(service.id) ? "" : "selected"}>Activo</option>
            <option value="inactive" ${isInactive(service.id) ? "selected" : ""}>Inactivo</option>
          </select>
        </label>
        <div class="admin-form-actions">
          <button type="submit">Guardar borrador</button>
          <a class="admin-secondary-link" href="detail.html?id=${encodeURIComponent(service.id)}">Ver detalle</a>
        </div>
        <p class="admin-message" id="admin-edit-message" aria-live="polite"></p>
      </form>
    </section>
  `;
}

function renderAiPanel() {
  return `
    <section class="admin-card admin-ai" aria-labelledby="admin-ai-title">
      <h2 id="admin-ai-title">Generar borrador con IA</h2>
      <form class="admin-form" id="admin-ai-form">
        <label>
          Fuentes o notas oficiales
          <textarea id="admin-ai-sources" placeholder="Pega enlaces oficiales, requisitos, costos, pasos o texto verificado del servicio."></textarea>
        </label>
        <button class="is-primary" type="button" id="admin-ai-button">Generar borrador</button>
        <label>
          Resultado
          <textarea class="admin-ai-output" id="admin-ai-output" readonly></textarea>
        </label>
        <p class="admin-message" id="admin-ai-message" aria-live="polite"></p>
      </form>
    </section>
  `;
}

function renderDashboard() {
  const selectedService = getSelectedService();

  root.innerHTML = `
    <section class="admin-hero" aria-labelledby="admin-title">
      <div>
        <p class="admin-eyebrow">Panel administrativo</p>
        <h1 id="admin-title">Gestión de servicios</h1>
        <p>Revisa métricas, controla visibilidad y prepara borradores de cambios para el catálogo.</p>
      </div>
      <a class="admin-primary-link" href="index.html">Volver al catálogo</a>
    </section>

    ${renderStats()}

    <div class="admin-layout">
      <section class="admin-card" aria-labelledby="admin-services-title">
        <h2 id="admin-services-title">Servicios publicados</h2>
        <p>Las visitas vienen de Firestore cuando se abre cada detalle de servicio.</p>
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

      <div>
        ${renderEditor(selectedService)}
        ${renderAiPanel()}
      </div>
    </div>
  `;

  wireAdminActions();
}

function wireAdminActions() {
  root.querySelectorAll("[data-admin-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedServiceId = button.dataset.adminEdit;
      renderDashboard();
    });
  });

  root.querySelectorAll("[data-admin-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      setInactive(button.dataset.adminToggle, !isInactive(button.dataset.adminToggle));
    });
  });

  root.querySelector("#admin-service-select")?.addEventListener("change", (event) => {
    selectedServiceId = event.target.value;
    renderDashboard();
  });

  root.querySelector("#admin-edit-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const service = getSelectedService();
    const status = root.querySelector("#admin-service-status").value;
    saveDraft(service.id, {
      name: root.querySelector("#admin-service-name").value.trim(),
      shortDescription: root.querySelector("#admin-service-description").value.trim(),
      status
    });
    setInactive(service.id, status === "inactive");
    root.querySelector("#admin-edit-message").textContent = "Borrador guardado.";
  });

  root.querySelector("#admin-ai-button")?.addEventListener("click", generateAiDraft);
}

async function generateAiDraft() {
  const sourcesField = root.querySelector("#admin-ai-sources");
  const outputField = root.querySelector("#admin-ai-output");
  const message = root.querySelector("#admin-ai-message");
  const service = getSelectedService();
  const sources = sourcesField.value.trim();

  if (!sources) {
    message.textContent = "Pega primero fuentes o notas oficiales.";
    return;
  }

  message.textContent = "Generando borrador...";
  outputField.value = "";

  try {
    const response = await fetch("/api/generate-service-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceName: service.name,
        sources
      })
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "No se pudo generar el borrador.");

    outputField.value = payload.draft;
    message.textContent = "Borrador generado. Revísalo antes de usarlo.";
  } catch (error) {
    outputField.value = "";
    message.textContent = error.message;
  }
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
