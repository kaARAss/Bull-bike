/* Bull Bike — админ-панель (статика для GitHub Pages).
   Вход по логину/паролю -> Yandex Cloud Function -> коммит в GitHub. */
(function () {
  "use strict";
  var CFG = window.BULLBIKE_ADMIN || {};
  var API = (CFG.API_BASE || "").replace(/\/+$/, "");
  var MEDIA = CFG.MEDIA_FOLDER || "images";
  var TOKEN_KEY = "bullbike_admin_token";

  // ---------- Схема разделов ----------
  // file — имя файла в content/. fields — описание полей.
  var SECTIONS = [
    { key: "hero", file: "hero.json", title: "Главный экран", icon: "🏞️",
      intro: "Первый экран сайта: заголовок, кнопки и главное фото.",
      cards: [
        { title: "Текст", icon: "✏️", fields: [
          { k: "eyebrow", t: "text", label: "Надзаголовок" },
          { k: "subtitle", t: "textarea", label: "Подзаголовок" },
          { k: "btnPrimary", t: "text", label: "Кнопка (основная)", half: true },
          { k: "btnPrimaryHref", t: "text", label: "Ссылка основной", half: true },
          { k: "btnGhost", t: "text", label: "Кнопка (вторая)", half: true },
          { k: "btnGhostHref", t: "text", label: "Ссылка второй", half: true }
        ]},
        { title: "Фото — десктоп", icon: "🖼️", fields: [
          { k: "image", t: "image", pos: "imagePos", ratio: "16/9", label: "Главное фото" }
        ]},
        { title: "Фото — мобильное", icon: "📱", fields: [
          { k: "imageMobile", t: "image", pos: "imageMobilePos", ratio: "3/4", label: "Фото для телефона" }
        ]}
      ]},

    { key: "how", file: "how.json", title: "Как проходит", icon: "🗺️",
      intro: "Форматы аренды и шаги — карточки с фото и шагами.",
      cards: [
        { title: "Заголовок блока", icon: "✏️", fields: [
          { k: "kicker", t: "text", label: "Надзаголовок", half: true },
          { k: "title", t: "text", label: "Заголовок", half: true },
          { k: "lead", t: "textarea", label: "Описание" }
        ]},
        { title: "Карточки форматов", icon: "🃏", list: {
          key: "cards", titleKey: "title", addLabel: "Добавить формат",
          fields: [
            { k: "tag", t: "text", label: "Метка", half: true },
            { k: "title", t: "text", label: "Заголовок", half: true },
            { k: "intro", t: "textarea", label: "Описание" },
            { k: "image", t: "image", pos: "imagePos", ratio: "4/3", label: "Фото формата" },
            { k: "steps", t: "objlist", label: "Шаги", titleKey: "label", addLabel: "Добавить шаг", fields: [
              { k: "label", t: "text", label: "Название шага" },
              { k: "text", t: "textarea", label: "Описание шага" }
            ]}
          ]
        }}
      ]},

    { key: "services", file: "services.json", title: "Услуги", icon: "🏍️",
      intro: "Карточки техники. Внутри каждой — фото и содержимое окна «Подробнее».",
      cards: [
        { title: "Позиции", icon: "🃏", list: {
          key: "items", titleKey: "title", addLabel: "Добавить позицию",
          fields: [
            { k: "title", t: "text", label: "Название", half: true },
            { k: "price", t: "text", label: "Цена", half: true },
            { k: "specs", t: "text", label: "Характеристики (коротко)" },
            { k: "teaser", t: "textarea", label: "Краткое описание (на карточке)" },
            { k: "image", t: "image", pos: "imagePos", ratio: "4/3", label: "Фото" },
            { k: "intro", t: "textarea", label: "Вступление в окне «Подробнее»" },
            { k: "details", t: "strlist", label: "Пункты описания", addLabel: "Добавить пункт" },
            { k: "gallery", t: "gallery", label: "Фото в окне «Подробнее» (галерея)" }
          ]
        }}
      ]},

    { key: "gallery", file: "gallery.json", title: "Галерея", icon: "🖼️",
      intro: "Фотогалерея. Можно добавлять, удалять и менять порядок.",
      cards: [ { title: "Снимки", icon: "🖼️", gallery: { key: "images" } } ]
    },

    { key: "about", file: "about.json", title: "О нас", icon: "👥",
      intro: "Блок «О нас» — текст и фото.",
      cards: [
        { title: "Текст", icon: "✏️", fields: [
          { k: "kicker", t: "text", label: "Надзаголовок", half: true },
          { k: "title", t: "text", label: "Заголовок", half: true },
          { k: "p1", t: "textarea", label: "Абзац 1" },
          { k: "p2", t: "textarea", label: "Абзац 2" },
          { k: "p3", t: "textarea", label: "Абзац 3" },
          { k: "legend", t: "text", label: "Подпись/легенда" },
          { k: "cta", t: "text", label: "Текст кнопки", half: true },
          { k: "ctaHref", t: "text", label: "Ссылка кнопки", half: true }
        ]},
        { title: "Фото", icon: "🖼️", fields: [
          { k: "image", t: "image", pos: "imagePos", ratio: "4/3", label: "Фото блока" }
        ]}
      ]},

    { key: "vkl", file: "vkl.json", title: "Что входит", icon: "✅",
      intro: "Пункты «что входит».",
      cards: [
        { title: "Заголовок", icon: "✏️", fields: [
          { k: "kicker", t: "text", label: "Надзаголовок", half: true },
          { k: "title", t: "text", label: "Заголовок", half: true },
          { k: "lead", t: "textarea", label: "Описание" }
        ]},
        { title: "Пункты", icon: "📌", list: {
          key: "items", titleKey: "title", addLabel: "Добавить пункт",
          fields: [
            { k: "title", t: "text", label: "Заголовок" },
            { k: "text", t: "textarea", label: "Текст" }
          ]
        }}
      ]},

    { key: "contacts", file: "contacts.json", title: "Контакты", icon: "📞",
      intro: "Адрес, телефон и ссылки.",
      cards: [
        { title: "Контактные данные", icon: "📍", fields: [
          { k: "address", t: "text", label: "Адрес" },
          { k: "addressNote", t: "text", label: "Примечание к адресу" },
          { k: "phoneText", t: "text", label: "Телефон (текст)", half: true },
          { k: "phoneHref", t: "text", label: "Телефон (ссылка tel:)", half: true },
          { k: "vkText", t: "text", label: "VK (текст)", half: true },
          { k: "vk", t: "text", label: "VK (ссылка)", half: true },
          { k: "maxText", t: "text", label: "MAX (текст)", half: true },
          { k: "max", t: "text", label: "MAX (ссылка)", half: true },
          { k: "maxGroupText", t: "text", label: "MAX-группа (текст)", half: true },
          { k: "maxGroup", t: "text", label: "MAX-группа (ссылка)", half: true },
          { k: "fabPhone", t: "text", label: "Телефон кнопки-звонка" }
        ]}
      ]}
  ];

  // ---------- Состояние ----------
  var state = {
    data: {},        // {hero:{...}, ...} — текущие данные
    original: {},    // исходные (для «Отменить» и определения dirty)
    uploads: {},     // { "images/xxx.webp": { base64, dataUrl } }
    active: SECTIONS[0].key,
    loaded: false
  };

  // ---------- Утилиты ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k.slice(0, 2) === "on" && typeof attrs[k] === "function") n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function deep(o) { return JSON.parse(JSON.stringify(o == null ? null : o)); }
  function toast(msg, kind, title) {
    var t = el("div", { class: "toast " + (kind || "") }, [
      title ? el("b", { text: title }) : null,
      el("span", { text: msg })
    ]);
    $("#toasts").appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; t.style.transform = "translateY(8px)"; setTimeout(function () { t.remove(); }, 250); }, kind === "err" ? 5200 : 3200);
  }

  // Путь фото -> URL для превью (с учётом загруженных, но ещё не сохранённых)
  function mediaUrl(path) {
    if (!path) return "";
    if (/^(https?:|data:)/.test(path)) return path;
    if (state.uploads[path]) return state.uploads[path].dataUrl;
    return "../" + path.replace(/^\/+/, "");
  }

  // ---------- Сеть ----------
  function api(action, payload, withAuth) {
    if (!API) return Promise.reject(new Error("Не задан адрес сервера (API_BASE в admin/assets/config.js)"));
    var headers = { "Content-Type": "application/json" };
    var bodyObj = Object.assign({ action: action }, payload || {});
    // Токен передаём в теле запроса: заголовок Authorization перехватывает шлюз Yandex Cloud (ошибка 403).
    if (withAuth) bodyObj.token = sessionStorage.getItem(TOKEN_KEY) || "";
    return fetch(API, {
      method: "POST", headers: headers,
      body: JSON.stringify(bodyObj)
    }).then(function (r) {
      return r.json().catch(function () { return { ok: false, error: "Пустой ответ сервера (" + r.status + ")" }; })
        .then(function (j) { if (!r.ok || !j.ok) throw new Error(j && j.error ? j.error : "Ошибка " + r.status); return j; });
    });
  }

  // ---------- Dirty ----------
  function isDirty() {
    if (Object.keys(state.uploads).length) return true;
    return JSON.stringify(state.data) !== JSON.stringify(state.original);
  }
  function dirtyFiles() {
    var out = [];
    SECTIONS.forEach(function (s) {
      if (JSON.stringify(state.data[s.key]) !== JSON.stringify(state.original[s.key])) out.push(s);
    });
    return out;
  }
  function refreshDirty() {
    var dirty = isDirty();
    var dot = $("#stateDot"), txt = $("#stateTxt"), bar = $("#savebar");
    dot.className = "dot " + (dirty ? "dirty" : "saved");
    txt.textContent = dirty ? "Есть изменения" : "Всё сохранено";
    bar.classList.toggle("show", dirty);
    var files = dirtyFiles().length, imgs = Object.keys(state.uploads).length;
    var parts = [];
    if (files) parts.push(files + " разд.");
    if (imgs) parts.push(imgs + " фото");
    $("#dirtyCount").textContent = parts.length ? "(" + parts.join(", ") + ")" : "";
  }
  function markChanged() { refreshDirty(); }

  window.addEventListener("beforeunload", function (e) {
    if (isDirty()) { e.preventDefault(); e.returnValue = ""; }
  });

  // ================= РЕНДЕР ПОЛЕЙ =================
  function fieldControl(obj, f) {
    var wrap = el("div", { class: "fld" + (f.half ? "" : "") });
    if (f.t === "bool") {
      var cb = el("input", { type: "checkbox" });
      cb.checked = !!obj[f.k];
      cb.addEventListener("change", function () { obj[f.k] = cb.checked; markChanged(); });
      wrap.appendChild(el("label", { class: "switch" }, [cb, el("span", { class: "track" }), el("span", { class: "lbl", text: f.label })]));
      return wrap;
    }
    wrap.appendChild(el("label", { text: f.label }));
    if (f.t === "image") { wrap.appendChild(imageEditor(obj, f)); return wrap; }
    if (f.t === "textarea") {
      var ta = el("textarea", { class: "inp" }); ta.value = obj[f.k] == null ? "" : obj[f.k];
      ta.addEventListener("input", function () { obj[f.k] = ta.value; markChanged(); });
      wrap.appendChild(ta); return wrap;
    }
    if (f.t === "strlist") { wrap.appendChild(strListEditor(obj, f)); return wrap; }
    if (f.t === "gallery") { wrap.appendChild(galleryEditor(obj, { key: f.k })); return wrap; }
    if (f.t === "objlist") { wrap.appendChild(objListEditor(obj, f, true)); return wrap; }
    // text / url
    var inp = el("input", { class: "inp", type: "text" }); inp.value = obj[f.k] == null ? "" : obj[f.k];
    inp.addEventListener("input", function () { obj[f.k] = inp.value; markChanged(); });
    wrap.appendChild(inp); return wrap;
  }

  function fieldsGrid(obj, fields) {
    var grid = el("div", { class: "grid2" });
    var flow = el("div");
    var usesGrid = false;
    fields.forEach(function (f) {
      var ctrl = fieldControl(obj, f);
      if (f.half && (f.t === "text" || f.t === "url")) { usesGrid = true; grid.appendChild(ctrl); }
      else flow.appendChild(ctrl);
    });
    var frag = document.createDocumentFragment();
    if (usesGrid) frag.appendChild(grid);
    frag.appendChild(flow);
    return frag;
  }

  // ---------- Редактор фото с перетаскиванием ----------
  function parsePos(v) {
    var m = String(v || "50% 50%").match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
    return m ? { x: +m[1], y: +m[2] } : { x: 50, y: 50 };
  }
  function clamp(v) { return Math.max(0, Math.min(100, v)); }

  function imageEditor(obj, f) {
    var posKey = f.pos || "imagePos";
    var pos = parsePos(obj[posKey]);
    var ratios = [["Широко", "16/9"], ["Карточка", "4/3"], ["Квадрат", "1/1"], ["Вертикаль", "3/4"]];

    var photo = el("div", { class: "imed-photo" });
    var frame = el("div", { class: "imed-frame" }, [
      el("span", { class: "imed-badge", text: "Как ляжет на сайте" }),
      photo,
      el("div", { class: "imed-hintbar", text: "Перетащите фото мышкой, чтобы сместить кадр" })
    ]);
    frame.style.aspectRatio = f.ratio || "4/3";

    var sx = el("input", { type: "range", min: "0", max: "100", step: "1" });
    var sy = el("input", { type: "range", min: "0", max: "100", step: "1" });
    var sxLbl = el("span"), syLbl = el("span");

    function apply() {
      var url = mediaUrl(obj[f.k]);
      photo.style.backgroundImage = url ? "url('" + url.replace(/'/g, "%27") + "')" : "none";
      photo.style.backgroundPosition = pos.x + "% " + pos.y + "%";
      sx.value = Math.round(pos.x); sy.value = Math.round(pos.y);
      sxLbl.textContent = Math.round(pos.x) + "%"; syLbl.textContent = Math.round(pos.y) + "%";
    }
    function commit() {
      pos.x = clamp(pos.x); pos.y = clamp(pos.y);
      obj[posKey] = Math.round(pos.x) + "% " + Math.round(pos.y) + "%";
      apply(); markChanged();
    }

    sx.addEventListener("input", function () { pos.x = +sx.value; commit(); });
    sy.addEventListener("input", function () { pos.y = +sy.value; commit(); });

    // Перетаскивание
    var drag = null;
    function down(e) {
      var p = e.touches ? e.touches[0] : e;
      drag = { x: p.clientX, y: p.clientY, px: pos.x, py: pos.y, w: frame.clientWidth, h: frame.clientHeight };
      frame.classList.add("dragging");
      window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
      window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
      e.preventDefault();
    }
    function move(e) {
      if (!drag) return;
      var p = e.touches ? e.touches[0] : e;
      var dx = (p.clientX - drag.x) / drag.w * 100;
      var dy = (p.clientY - drag.y) / drag.h * 100;
      // тянем фото — позиция меняется в обратную сторону (как background)
      pos.x = clamp(drag.px - dx * 1.4);
      pos.y = clamp(drag.py - dy * 1.4);
      apply();
      if (e.cancelable) e.preventDefault();
    }
    function up() {
      if (!drag) return; drag = null; frame.classList.remove("dragging"); commit();
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up);
    }
    frame.addEventListener("mousedown", down);
    frame.addEventListener("touchstart", down, { passive: false });

    // Загрузка нового фото
    var fileInput = el("input", { type: "file", accept: "image/*" });
    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var dataUrl = reader.result;
        var base64 = String(dataUrl).split(",")[1] || "";
        var safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
        var path = MEDIA + "/" + Date.now().toString(36) + "-" + (safe || "photo.jpg");
        state.uploads[path] = { base64: base64, dataUrl: dataUrl };
        obj[f.k] = path;
        apply(); markChanged();
        toast("Фото готово к сохранению. Сместите кадр и нажмите «Сохранить».", "ok", "Загружено");
      };
      reader.readAsDataURL(file);
      fileInput.value = "";
    });

    var ratioTabs = el("div", { class: "ratio-tabs" });
    ratios.forEach(function (r) {
      var b = el("button", { type: "button", class: "ratio-tab" + (r[1] === (f.ratio || "4/3") ? " active" : ""), text: r[0] });
      b.addEventListener("click", function () {
        frame.style.aspectRatio = r[1];
        ratioTabs.querySelectorAll(".ratio-tab").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
      });
      ratioTabs.appendChild(b);
    });

    var side = el("div", { class: "imed-side" }, [
      el("div", { class: "imed-actions" }, [
        el("label", { class: "btn btn-sm btn-block file-btn" }, [document.createTextNode("Загрузить фото"), fileInput])
      ]),
      el("div", { class: "slider" }, [ el("label", {}, [document.createTextNode("По горизонтали"), sxLbl]), sx ]),
      el("div", { class: "slider" }, [ el("label", {}, [document.createTextNode("По вертикали"), syLbl]), sy ]),
      el("div", { class: "hint", text: "Превью показывает, как фото ляжет в блоке. Переключайте формат рамки ниже." }),
      ratioTabs
    ]);

    apply();
    return el("div", { class: "imed" }, [ el("div", { class: "imed-stage-wrap" }, [frame]), side ]);
  }

  // ---------- Список строк ----------
  function strListEditor(obj, f) {
    if (!Array.isArray(obj[f.k])) obj[f.k] = obj[f.k] ? [obj[f.k]] : [];
    var arr = obj[f.k];
    var box = el("div", { class: "chips" });
    function render() {
      box.innerHTML = "";
      arr.forEach(function (v, i) {
        var inp = el("textarea", { class: "inp", rows: "2" }); inp.value = v == null ? "" : v;
        inp.addEventListener("input", function () { arr[i] = inp.value; markChanged(); });
        var del = el("button", { type: "button", class: "icon-btn del", title: "Удалить", text: "✕" });
        del.addEventListener("click", function () { arr.splice(i, 1); render(); markChanged(); });
        box.appendChild(el("div", { class: "chip-row" }, [inp, del]));
      });
      var add = el("button", { type: "button", class: "btn btn-ghost btn-sm", text: "+ " + (f.addLabel || "Добавить") });
      add.addEventListener("click", function () { arr.push(""); render(); markChanged(); });
      box.appendChild(el("div", { class: "add-row" }, [add]));
    }
    render();
    return box;
  }

  // ---------- Список объектов (вложенный или как блок) ----------
  function objListEditor(obj, cfg, nested) {
    if (!Array.isArray(obj[cfg.key])) obj[cfg.key] = [];
    var arr = obj[cfg.key];
    var box = el("div");
    function itemTitle(it, i) {
      var t = cfg.titleKey && it[cfg.titleKey];
      return (t && String(t).trim()) || ("Элемент " + (i + 1));
    }
    function render() {
      box.innerHTML = "";
      arr.forEach(function (it, i) {
        var body = el("div", { class: "li-body" });
        body.appendChild(fieldsGrid(it, cfg.fields));
        var titleSpan = el("span", { class: "li-title", text: itemTitle(it, i) });
        var chev = el("span", { class: "chev", text: "▾" });
        var up = el("button", { type: "button", class: "icon-btn", title: "Вверх", text: "↑" });
        var dn = el("button", { type: "button", class: "icon-btn", title: "Вниз", text: "↓" });
        var del = el("button", { type: "button", class: "icon-btn del", title: "Удалить", text: "✕" });
        up.addEventListener("click", function (e) { e.stopPropagation(); if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); render(); markChanged(); } });
        dn.addEventListener("click", function (e) { e.stopPropagation(); if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); render(); markChanged(); } });
        del.addEventListener("click", function (e) { e.stopPropagation(); if (confirm("Удалить «" + itemTitle(it, i) + "»?")) { arr.splice(i, 1); render(); markChanged(); } });
        var head = el("div", { class: "li-head" }, [chev, titleSpan, el("span", { class: "li-tools" }, [up, dn, del])]);
        var item = el("div", { class: "list-item li-item-collapsed" }, [head, body]);
        head.addEventListener("click", function () {
          var open = body.classList.toggle("open");
          item.classList.toggle("li-item-collapsed", !open);
          titleSpan.textContent = itemTitle(it, i);
        });
        // Обновляем заголовок при вводе
        if (cfg.titleKey) body.addEventListener("input", function () { titleSpan.textContent = itemTitle(it, i); });
        box.appendChild(item);
      });
      var add = el("button", { type: "button", class: "btn btn-ghost btn-sm", text: "+ " + (cfg.addLabel || "Добавить") });
      add.addEventListener("click", function () {
        var o = {}; cfg.fields.forEach(function (f) { o[f.k] = (f.t === "objlist" || f.t === "strlist") ? [] : (f.t === "bool" ? false : ""); });
        arr.push(o); render(); markChanged();
      });
      box.appendChild(el("div", { class: "add-row" }, [add]));
    }
    render();
    return box;
  }

  // ---------- Галерея ----------
  function galleryEditor(obj, cfg) {
    if (!Array.isArray(obj[cfg.key])) obj[cfg.key] = [];
    var arr = obj[cfg.key];
    var wrap = el("div");
    var grid = el("div", { class: "gal-grid" });
    function render() {
      grid.innerHTML = "";
      arr.forEach(function (path, i) {
        var cell = el("div", { class: "gal-cell" });
        cell.style.backgroundImage = "url('" + mediaUrl(path).replace(/'/g, "%27") + "')";
        var up = el("button", { type: "button", class: "gc-btn", title: "Раньше", text: "←" });
        var dn = el("button", { type: "button", class: "gc-btn", title: "Позже", text: "→" });
        var del = el("button", { type: "button", class: "gc-btn", title: "Удалить", text: "✕" });
        up.addEventListener("click", function () { if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); render(); markChanged(); } });
        dn.addEventListener("click", function () { if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); render(); markChanged(); } });
        del.addEventListener("click", function () { arr.splice(i, 1); render(); markChanged(); });
        cell.appendChild(el("div", { class: "gc-tools" }, [up, dn, del]));
        cell.appendChild(el("span", { class: "gc-idx", text: (i + 1) }));
        grid.appendChild(cell);
      });
    }
    var fileInput = el("input", { type: "file", accept: "image/*", multiple: "multiple" });
    fileInput.addEventListener("change", function () {
      var files = Array.prototype.slice.call(fileInput.files || []);
      files.forEach(function (file) {
        var reader = new FileReader();
        reader.onload = function () {
          var dataUrl = reader.result, base64 = String(dataUrl).split(",")[1] || "";
          var safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
          var path = MEDIA + "/" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6) + "-" + (safe || "photo.jpg");
          state.uploads[path] = { base64: base64, dataUrl: dataUrl };
          arr.push(path); render(); markChanged();
        };
        reader.readAsDataURL(file);
      });
      fileInput.value = "";
    });
    render();
    wrap.appendChild(grid);
    wrap.appendChild(el("div", { class: "add-row" }, [
      el("label", { class: "btn btn-ghost btn-sm file-btn" }, [document.createTextNode("+ Загрузить фото"), fileInput])
    ]));
    return wrap;
  }

  // ================= РЕНДЕР РАЗДЕЛА =================
  function renderSection(sec) {
    var obj = state.data[sec.key] || (state.data[sec.key] = {});
    var host = $("#content"); host.innerHTML = "";
    $("#pageTitle").textContent = sec.title;
    if (sec.intro) host.appendChild(el("p", { class: "section-intro", text: sec.intro }));
    sec.cards.forEach(function (card) {
      var body = el("div");
      if (card.fields) body.appendChild(fieldsGrid(obj, card.fields));
      else if (card.list) body.appendChild(objListEditor(obj, card.list));
      else if (card.gallery) body.appendChild(galleryEditor(obj, card.gallery));
      host.appendChild(el("div", { class: "card" }, [
        el("div", { class: "card-h" }, [
          el("span", { class: "ci", text: card.icon || "•" }),
          el("h3", { text: card.title }),
          card.list ? el("span", { class: "sub", text: (obj[card.list.key] || []).length + " шт." }) : null
        ]),
        body
      ]));
    });
  }

  function buildNav() {
    var nav = $("#nav"); nav.innerHTML = "";
    SECTIONS.forEach(function (s) {
      var item = el("div", { class: "nav-item" + (s.key === state.active ? " active" : ""), "data-key": s.key }, [
        el("span", { class: "ic", text: s.icon }), el("span", { text: s.title })
      ]);
      item.addEventListener("click", function () {
        state.active = s.key;
        nav.querySelectorAll(".nav-item").forEach(function (x) { x.classList.toggle("active", x.getAttribute("data-key") === s.key); });
        renderSection(s);
        $("#sidebar").classList.remove("open"); $("#scrim").classList.remove("show");
        window.scrollTo(0, 0);
      });
      nav.appendChild(item);
    });
  }

  // ================= ЗАГРУЗКА ДАННЫХ =================
  function loadContent() {
    var host = $("#content");
    host.innerHTML = '<div class="card"><div class="card-h"><span class="ci"><span class="spin"></span></span><h3>Загрузка…</h3></div></div>';
    return Promise.all(SECTIONS.map(function (s) {
      return fetch("../content/" + s.file + "?_=" + Date.now()).then(function (r) {
        if (!r.ok) throw new Error(s.file + ": " + r.status);
        return r.json();
      }).then(function (j) { state.data[s.key] = j || {}; }).catch(function () { state.data[s.key] = state.data[s.key] || {}; });
    })).then(function () {
      state.original = deep(state.data);
      state.uploads = {};
      state.loaded = true;
      buildNav();
      renderSection(SECTIONS.find(function (s) { return s.key === state.active; }));
      refreshDirty();
    });
  }

  // ================= СОХРАНЕНИЕ =================
  function save() {
    var changed = dirtyFiles();
    var uploadPaths = Object.keys(state.uploads);
    if (!changed.length && !uploadPaths.length) { toast("Нет изменений", "", ""); return; }
    var changes = [];
    uploadPaths.forEach(function (p) { changes.push({ path: p, content: state.uploads[p].base64, encoding: "base64" }); });
    changed.forEach(function (s) { changes.push({ path: "content/" + s.file, content: JSON.stringify(state.data[s.key], null, 2) + "\n" }); });

    var btn = $("#saveBtn"); var old = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Сохранение…';
    api("save", { changes: changes, message: "admin: обновление контента" }, true).then(function (res) {
      // Фиксируем новое состояние
      state.original = deep(state.data);
      state.uploads = {};
      refreshDirty();
      // если были загружены фото — перерисуем раздел, чтобы превью шло уже из репо
      renderSection(SECTIONS.find(function (s) { return s.key === state.active; }));
      toast("Сохранено (" + (res.saved || changes.length) + " файл.). Сайт обновится через 1–2 мин.", "ok", "Готово");
    }).catch(function (e) {
      toast(String(e.message || e), "err", "��шибка сохранения");
      if (/Сессия истекла/i.test(String(e.message))) { setTimeout(logout, 1200); }
    }).then(function () { btn.disabled = false; btn.innerHTML = old; });
  }

  function discard() {
    if (!confirm("Отменить все несохранённые изменения?")) return;
    state.data = deep(state.original); state.uploads = {};
    renderSection(SECTIONS.find(function (s) { return s.key === state.active; }));
    refreshDirty();
  }

  // ================= АУТЕНТИФИКАЦИЯ =================
  function showApp(login) {
    $("#loginView").classList.add("hidden");
    $("#appView").classList.remove("hidden");
    var name = login || "admin";
    $("#userName").textContent = name;
    $("#userAva").textContent = (name[0] || "A").toUpperCase();
    if (!state.loaded) loadContent().catch(function (e) { toast(String(e.message || e), "err", "Ошибка загрузки"); });
  }
  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    location.reload();
  }

  function initLogin() {
    $("#loginForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var login = $("#login").value.trim(), pass = $("#password").value;
      var errBox = $("#loginErr"); errBox.classList.add("hidden");
      var btn = $("#loginBtn"); btn.disabled = true; var old = btn.textContent; btn.textContent = "Вход…";
      api("login", { login: login, password: pass }).then(function (res) {
        sessionStorage.setItem(TOKEN_KEY, res.token);
        showApp(login);
      }).catch(function (err) {
        errBox.textContent = String(err.message || err); errBox.classList.remove("hidden");
      }).then(function () { btn.disabled = false; btn.textContent = old; });
    });
  }

  // ================= СТАРТ =================
  document.addEventListener("DOMContentLoaded", function () {
    initLogin();
    $("#saveBtn").addEventListener("click", save);
    $("#discardBtn").addEventListener("click", discard);
    $("#logoutBtn").addEventListener("click", function () { if (!isDirty() || confirm("Есть несохранённые изменения. Выйти?")) logout(); });
    $("#burger").addEventListener("click", function () { $("#sidebar").classList.toggle("open"); $("#scrim").classList.toggle("show"); });
    $("#scrim").addEventListener("click", function () { $("#sidebar").classList.remove("open"); $("#scrim").classList.remove("show"); });

    if (!API) {
      $("#loginErr").textContent = "❗ Не задан адрес сервера. Откройте admin/assets/config.js и вставьте API_BASE (см. backend/README.md).";
      $("#loginErr").classList.remove("hidden");
    }
    // Авто-вход по сохранённому токену
    if (sessionStorage.getItem(TOKEN_KEY)) showApp("admin");
  });
})();
