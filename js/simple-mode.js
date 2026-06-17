(function () {
  const KEY = "cercared_simple_mode";
  const root = document.documentElement;
  const isOn = () => localStorage.getItem(KEY) === "on";
  const SIMPLE_DISTRITOS = ["Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos", "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María", "La Molina", "La Victoria", "Lima (Cercado)", "Lince", "Los Olivos", "Lurigancho-Chosica", "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana", "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac", "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador", "Villa María del Triunfo"];

  function getMain() {
    return document.querySelector(".detail-main") ||
           document.querySelector("#service-detail") ||
           document.querySelector("main");
  }

  function currentService() {
    const id = new URLSearchParams(location.search).get("id");
    const list = window.CercaRedServices || [];
    return list.find((s) => s.id === id) || list[0] || null;
  }

  function banner(show, mode) {
    let b = document.querySelector("#simple-mode-banner");
    if (show && !b) {
      b = document.createElement("div");
      b.id = "simple-mode-banner";
      b.className = "simple-mode-banner";
      b.setAttribute("role", "status");
      const header = document.querySelector(".site-header") || document.querySelector("header");
      if (header) header.insertAdjacentElement("afterend", b);
      else document.body.prepend(b);
    }
    if (b) {
      b.classList.toggle("is-warning", mode === "warn");
      const eye = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"/></svg>';
      b.innerHTML = eye + (mode === "warn"
        ? "<span><strong>Modo simple no disponible</strong> — La vista simplificada no está disponible para esta página.</span>"
        : "<span><strong>Modo simple activado</strong> — Vista simplificada con texto más grande y solo lo esencial.</span>");
    }
    if (!show && b) b.remove();
  }

  function simpleHTML(s) {
    const d = s.simple;
    const facts = d.facts.map((f) =>
      `<div class="s-fact"><span class="s-fact-label">${f.label}</span><span class="s-fact-value${f.highlight ? " s-ok" : ""}">${f.value}</span></div>`).join("");
    const needs = d.needs.map((n) => `<li>${n}</li>`).join("");
    const steps = d.doSteps.map((p, i) =>
      `<li><span class="s-step-num${i === d.doSteps.length - 1 ? " s-step-last" : ""}">${i + 1}</span><span>${p}</span></li>`).join("");
    const places = d.places.map((p) =>
      `<div class="s-place"><strong>${p.title}</strong><span>${p.description}</span></div>`).join("");
    const options = ["<option>Elige tu distrito</option>"].concat(SIMPLE_DISTRITOS.map((d)=>`<option value="${d}">${d}</option>`)).join("");
    return `
      <div class="simple-view">
        <nav class="simple-crumbs"><a href="index.html">Catálogo</a> → <span>${s.name}</span></nav>
        <h1 class="simple-title">${s.name}</h1>
        <section class="s-about"><h2>¿De qué trata este servicio?</h2><p>${d.about}</p></section>
        <section class="s-card"><h2>Datos del servicio</h2><div class="s-facts">${facts}</div></section>
        <section class="s-card"><h2>¿Qué necesito?</h2><ul class="s-needs">${needs}</ul></section>
        <section class="s-card"><h2>¿Qué tengo que hacer?</h2><ol class="s-steps">${steps}</ol></section>
        <section class="s-card">
          <h2>¿Dónde me atienden?</h2>
          <label class="s-select"><span class="visually-hidden">Elige tu distrito</span><select>${options}</select></label>
          ${places}
          <a class="s-official" href="${s.officialUrl}" target="_blank" rel="noreferrer">Ir al canal oficial →</a>
          <button class="s-summary" type="button">Generar resumen para compartir</button>
        </section>
      </div>`;
  }

  function apply(on) {
    root.classList.toggle("simple-mode", on);
    document.querySelectorAll(".simple-mode-button").forEach((b) => {
      b.textContent = on ? "Modo normal" : "Modo simple";
      b.setAttribute("aria-pressed", String(on));
    });

    const main = getMain();
    if (!main) { banner(on); return; }
    const layout = main.querySelector(".detail-layout");
    const view = main.querySelector(".simple-view");    

    if (on) {
      const service = currentService();
      if (!service || !service.simple) { banner(true, "warn"); return; }
      if (layout) layout.style.display = "none";      // ocultar (no borrar)
      if (!view) main.insertAdjacentHTML("beforeend", simpleHTML(service));
      banner(true);
    } else {
      if (view) view.remove();
      if (layout) layout.style.display = "";        
      banner(false);
    }
  }

  function toggle() {
    localStorage.setItem(KEY, isOn() ? "off" : "on");
    apply(isOn());
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".simple-mode-button")) toggle();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".s-summary")) return;
    const original = document.querySelector(".detail-layout .summary-button");
    if (original) original.click();
  });

  function watch() {
    const main = getMain();
    if (!main) return;
    new MutationObserver(() => {
      if (isOn() && !main.querySelector(".simple-view")) apply(true);
    }).observe(main, { childList: true });
  }

  function init() { apply(isOn()); watch(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();