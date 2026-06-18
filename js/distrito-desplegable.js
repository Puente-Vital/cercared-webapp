/* === Mejora el selector de distrito para que se abra hacia abajo === */
/* Guarda esto como js/distrito-desplegable.js y enlázalo en index.html
   DESPUÉS de js/catalog.js:
   <script src="js/catalog.js"></script>
   <script src="js/distrito-desplegable.js"></script>
*/

(function () {
  function enhance(select) {
    if (!select || select.dataset.enhanced) return;
    select.dataset.enhanced = "1";

    // Contenedor
    const wrap = document.createElement("div");
    wrap.className = "cs-wrap";
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.classList.add("cs-native");

    // Botón visible
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cs-btn";

    // Panel de opciones
    const panel = document.createElement("div");
    panel.className = "cs-panel";
    panel.setAttribute("role", "listbox");

    function sync() {
      const opt = select.options[select.selectedIndex];
      btn.textContent = opt ? opt.textContent : "";
      panel.querySelectorAll(".cs-opt").forEach(function (el) {
        el.classList.toggle("is-active", el.dataset.value === select.value);
      });
    }

    // Construye las opciones a partir del propio <select>
    Array.prototype.forEach.call(select.options, function (o) {
      const item = document.createElement("div");
      item.className = "cs-opt";
      item.setAttribute("role", "option");
      item.textContent = o.textContent;
      item.dataset.value = o.value;
      item.addEventListener("click", function () {
        select.value = o.value;          // devuelve el valor al select nativo
        wrap.classList.remove("open");
        sync();
        // dispara 'change' para que catalog.js vuelva a filtrar
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      panel.appendChild(item);
    });

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      wrap.classList.toggle("open");
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) wrap.classList.remove("open");
    });

    wrap.appendChild(btn);
    wrap.appendChild(panel);
    sync();

    // Mantener sincronizado cuando se usan los botones de limpiar filtros
    ["#clear-filters", "#empty-clear-search"].forEach(function (sel) {
      const b = document.querySelector(sel);
      if (b) b.addEventListener("click", function () { setTimeout(sync, 0); });
    });
  }

  document.querySelectorAll("#district-filter").forEach(enhance);
})();