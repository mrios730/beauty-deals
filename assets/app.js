(function () {
  "use strict";

  var DAY = 86400000;
  var CATEGORIES = ["All", "Face", "Eyes", "Lips", "Cheeks", "Skincare", "Tools", "Offers"];
  var SAVED_KEY = "pretty-penny:saved";
  var now = Date.now();

  // `ends` is an inclusive YYYY-MM-DD date: the deal lasts until the end of that local day.
  function endOfDay(iso) {
    var p = iso.split("-");
    return new Date(+p[0], p[1] - 1, +p[2], 23, 59, 59).getTime();
  }

  var deals = window.DEALS.map(function (d) {
    var pct = d.price != null && d.was ? Math.round((1 - d.price / d.was) * 100) : null;
    return Object.assign({}, d, { pct: pct, ends: d.ends ? endOfDay(d.ends) : null });
  }).filter(function (d) { return d.ends === null || d.ends >= now; });

  // Deals missing the sort field (no price, no end date) always go last.
  function lastIfNull(a, b, f) {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    return f(a, b);
  }

  var state = { category: "All", retailer: "All", query: "", sort: "discount", savedOnly: false, saved: loadSaved() };

  var $ = function (sel) { return document.querySelector(sel); };
  var grid = $("#grid"), chips = $("#chips"), meta = $("#results-meta"), empty = $("#empty");
  var savedBtn = $("#saved-toggle"), savedCount = $("#saved-count"), toast = $("#toast");

  function loadSaved() {
    try { return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]")); }
    catch (e) { return new Set(); }
  }
  function persistSaved() {
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(state.saved))); } catch (e) { /* storage off */ }
  }

  function money(n) { return "$" + (n % 1 ? n.toFixed(2) : n); }
  function endsLabel(ts) {
    if (ts === null) return { text: "No end date listed", soon: false };
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var days = Math.round((new Date(ts).setHours(0, 0, 0, 0) - today) / DAY);
    if (days <= 0) return { text: "Ends today", soon: true };
    if (days === 1) return { text: "Ends tomorrow", soon: true };
    if (days <= 3) return { text: "Ends in " + days + " days", soon: true };
    return { text: "Ends " + new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" }), soon: false };
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderChips() {
    chips.innerHTML = CATEGORIES.map(function (c) {
      return '<button class="chip" type="button" data-cat="' + c + '" aria-pressed="' + (c === state.category) + '">' + c + "</button>";
    }).join("");
  }

  function visible() {
    var q = state.query.trim().toLowerCase();
    var list = deals.filter(function (d) {
      if (state.savedOnly && !state.saved.has(d.id)) return false;
      if (state.category !== "All" && d.category !== state.category) return false;
      if (state.retailer !== "All" && d.retailer !== state.retailer) return false;
      if (!q) return true;
      return (d.brand + " " + d.name + " " + d.desc + " " + (d.offer || "") + " " + d.retailer).toLowerCase().indexOf(q) !== -1;
    });
    var by = {
      discount: function (a, b) { return lastIfNull(a.pct, b.pct, function (x, y) { return y - x; }); },
      ending: function (a, b) { return lastIfNull(a.ends, b.ends, function (x, y) { return x - y; }); },
      "price-low": function (a, b) { return lastIfNull(a.price, b.price, function (x, y) { return x - y; }); },
      "price-high": function (a, b) { return lastIfNull(a.price, b.price, function (x, y) { return y - x; }); }
    }[state.sort];
    return list.sort(by);
  }

  var heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';

  function swatch(d) {
    return '<div class="pan ' + (d.shape === "lip" ? "lip" : "") + '" style="background:' + d.color + '"></div>';
  }

  // Product photo, else brand logo, else colour swatch.
  function art(d) {
    if (d.image) return '<img class="product-img" src="' + esc(d.image) + '" alt="' + esc(d.brand + " " + d.name) + '" loading="lazy" data-fallback="' + (d.logo ? "logo" : "swatch") + '">';
    if (d.logo) return '<img class="brand-logo" src="' + esc(d.logo) + '" alt="' + esc(d.brand) + ' logo" loading="lazy" data-fallback="swatch">';
    return swatch(d);
  }

  // Images that fail to load step down to the next option. `error` doesn't bubble, so listen in the capture phase.
  grid.addEventListener("error", function (e) {
    var img = e.target;
    if (img.tagName !== "IMG" || !img.dataset.fallback) return;
    var d = deals.filter(function (x) { return x.id === img.closest(".card").dataset.id; })[0];
    if (!d) return;
    if (img.dataset.fallback === "logo") {
      img.outerHTML = '<img class="brand-logo" src="' + esc(d.logo) + '" alt="' + esc(d.brand) + ' logo" loading="lazy" data-fallback="swatch">';
    } else {
      img.outerHTML = swatch(d);
    }
  }, true);

  function card(d) {
    var ends = endsLabel(d.ends);
    var saved = state.saved.has(d.id);
    var swatches = d.shades.length
      ? '<ul class="swatches" aria-label="' + d.shades.length + ' shades">' + d.shades.map(function (s) { return '<li style="background:' + s + '"></li>'; }).join("") + "</ul>"
      : "";
    return '<li class="card" data-id="' + esc(d.id) + '">' +
      '<div class="card-art">' +
        '<span class="badge">' + (d.pct !== null ? d.pct + "% off" : esc(d.offer)) + "</span>" +
        (d.limited ? '<span class="badge limited">Limited</span>' : "") +
        art(d) +
        '<button class="save" type="button" data-save="' + d.id + '" aria-pressed="' + saved + '" aria-label="' + (saved ? "Remove from saved" : "Save deal") + ": " + esc(d.name) + '">' + heart + "</button>" +
      "</div>" +
      '<div class="card-body">' +
        '<p class="brand">' + esc(d.brand) +
          (d.brand.indexOf(d.retailer) === 0 ? "" : ' <span class="retailer">at ' + esc(d.retailer) + "</span>") + "</p>" +
        "<h3>" + esc(d.name) + "</h3>" +
        '<p class="desc">' + esc(d.desc) + "</p>" +
        swatches +
        '<div class="price-row">' +
          (d.price != null
            ? '<span class="price">' + money(d.price) + "</span>" + (d.was ? '<span class="was"><span class="sr-only">was </span>' + money(d.was) + "</span>" : "")
            : '<span class="price">' + esc(d.offer) + "</span>") +
          (d.code ? '<button class="code btn ghost" type="button" data-code="' + esc(d.code) + '" aria-label="Copy code ' + esc(d.code) + '">Code <b>' + esc(d.code) + "</b></button>" : "") +
        "</div>" +
      "</div>" +
      '<div class="card-foot"><span class="ends' + (ends.soon ? " soon" : "") + '">' + ends.text + "</span>" +
        '<a href="' + esc(d.url) + '" target="_blank" rel="noopener noreferrer">Via ' + esc(d.source) + "</a></div>" +
    "</li>";
  }

  function render() {
    var list = visible();
    grid.innerHTML = list.map(card).join("");
    grid.hidden = list.length === 0;
    empty.hidden = list.length !== 0;
    empty.querySelector("p").textContent = state.savedOnly && state.saved.size === 0
      ? "Tap the heart on any deal to keep it here."
      : "Try another category or a different search.";
    meta.textContent = list.length + (list.length === 1 ? " deal" : " deals") +
      (state.savedOnly ? " saved" : "") +
      (state.category !== "All" ? " in " + state.category : "") +
      (state.retailer !== "All" ? " at " + state.retailer : "") +
      (state.query ? ' matching "' + state.query.trim() + '"' : "");
    savedCount.textContent = state.saved.size;
    savedBtn.setAttribute("aria-pressed", state.savedOnly);
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(function () { toast.classList.remove("show"); }, 1800);
  }

  chips.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat]");
    if (!b) return;
    state.category = b.dataset.cat;
    renderChips(); render();
  });
  $("#search").addEventListener("input", function (e) { state.query = e.target.value; render(); });
  $("#sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
  $("#retailer").addEventListener("change", function (e) { state.retailer = e.target.value; render(); });
  savedBtn.addEventListener("click", function () { state.savedOnly = !state.savedOnly; render(); });
  $("#reset").addEventListener("click", function () {
    state.category = "All"; state.retailer = "All"; state.query = ""; state.savedOnly = false;
    $("#search").value = ""; $("#retailer").value = "All";
    renderChips(); render();
  });

  grid.addEventListener("click", function (e) {
    var save = e.target.closest("[data-save]");
    if (save) {
      var id = save.dataset.save;
      if (state.saved.has(id)) { state.saved.delete(id); showToast("Removed from saved"); }
      else { state.saved.add(id); showToast("Saved"); }
      persistSaved(); render();
      return;
    }
    var code = e.target.closest("[data-code]");
    if (code) {
      var text = code.dataset.code;
      var done = function () { showToast("Code " + text + " copied"); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { showToast("Code: " + text); });
      else showToast("Code: " + text);
    }
  });

  $("#signup").addEventListener("submit", function (e) {
    e.preventDefault();
    // Placeholder: wire this to your email provider.
    $("#signup-note").textContent = "Thanks — you're on the list.";
    e.target.reset();
  });

  $("#year").textContent = new Date().getFullYear();
  if (window.DEALS_CHECKED) {
    $("#checked").textContent = new Date(window.DEALS_CHECKED + "T12:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  }
  renderChips();
  render();
})();
