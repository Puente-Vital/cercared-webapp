(function () {
  const ENHANCE_SELECTOR = ".filters select, select.form-input, .procedure-select select, .s-select select";

  function enhance(select) {
    if (!select || select.dataset.enhanced) return;
    select.dataset.enhanced = "1";

    const wrap = document.createElement("div");
    wrap.className = "cs-wrap";
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.classList.add("cs-native");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cs-btn";

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

    Array.prototype.forEach.call(select.options, function (o) {
      const item = document.createElement("div");
      item.className = "cs-opt";
      item.setAttribute("role", "option");
      item.textContent = o.textContent;
      item.dataset.value = o.value;
      item.addEventListener("click", function () {
        select.value = o.value; 
        wrap.classList.remove("open");
        sync();
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

    select.addEventListener("change", sync);

    ["#clear-filters", "#empty-clear-search"].forEach(function (sel) {
      const b = document.querySelector(sel);
      if (b) b.addEventListener("click", function () { setTimeout(sync, 0); });
    });
  }

  function enhanceAll(root = document) {
    root.querySelectorAll(ENHANCE_SELECTOR).forEach(enhance);
  }

  enhanceAll();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches?.(ENHANCE_SELECTOR)) {
          enhance(node);
        }
        enhanceAll(node);
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
