/* Asharchives — shared navigation layer.
   Adds on every page: hamburger sidebar, bottom tab bar (Home · Cards · Notes · Focus),
   toast messages, and the focus-timer engine (so a running timer keeps counting while you
   move between pages). Needs: nav.css. Optional: subjects.js. */
(() => {
  "use strict";
  const page = document.body.dataset.page || "";
  const K = { theme: "asharrow-theme", focus: "asharrow-focus", log: "asharrow-focus-log", cards: "asharrow-cards", notes: "asharrow-journal" };
  const parse = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ } };
  const pad = n => String(n).padStart(2, "0");
  const dayKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmt = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- theme (new pages bind their own toggle; home/lecture scripts already do) ---------- */
  const applyTheme = t => { document.documentElement.dataset.theme = t; };
  const setTheme = t => { applyTheme(t); try { localStorage.setItem(K.theme, t); } catch { /* ignore */ } };
  const prefersDark = () => window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(localStorage.getItem(K.theme) || (prefersDark() ? "dark" : "light"));
  const toggleTheme = () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  if (page !== "home" && page !== "lecture") document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);

  /* ---------- icons ---------- */
  const svg = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const ICON = {
    home: svg('<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.8V20h13V9.8"/><path d="M10 20v-5.5h4V20"/>'),
    cards: svg('<rect x="3.5" y="7" width="13" height="12.5" rx="2.5"/><path d="M7.5 4.2h11A2 2 0 0 1 20.5 6.2v10.3"/><path d="M7.5 12h5M7.5 15.2h3"/>'),
    notes: svg('<path d="M6 3.5h9.5L19.5 7.5V20a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z"/><path d="M15 3.8V8h4.2"/><path d="M8.5 12.5h7M8.5 15.5h7M8.5 18.5h4"/>'),
    focus: svg('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.6 1.6"/><path d="M9.5 3.5h5"/>'),
    menu: svg('<path d="M4 7h16M4 12h16M4 17h10"/>'),
    close: svg('<path d="m6 6 12 12M18 6 6 18"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>'),
    moon: svg('<path d="M20.3 15.4A8.5 8.5 0 0 1 8.6 3.7 8.6 8.6 0 1 0 20.3 15.4Z"/>'),
    grid: svg('<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>')
  };
  window.AshIcons = ICON;

  /* ---------- toast ---------- */
  let toastTimer = 0;
  const toast = (message, opts = {}) => {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.innerHTML = `<span>${esc(message)}</span>`;
    if (opts.action) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = opts.action.label;
      b.addEventListener("click", () => { opts.action.run(); el.classList.remove("show"); });
      el.appendChild(b);
    }
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), opts.ms || 4200);
  };

  /* ---------- sidebar + bottom tabs ---------- */
  const homeActive = page === "home" || page === "lecture";
  const isActive = key => (key === "home" ? homeActive : page === key);
  const link = (key, href, label, extra = "") =>
    `<a class="drawer-link${isActive(key) ? " is-active" : ""}" href="${href}"${isActive(key) ? ' aria-current="page"' : ""}>${ICON[key] || ICON.grid}<span>${label}</span>${extra}</a>`;

  const overlay = document.createElement("div");
  overlay.className = "nav-overlay"; overlay.id = "navOverlay";
  const drawer = document.createElement("aside");
  drawer.className = "drawer"; drawer.id = "drawer"; drawer.setAttribute("aria-label", "Main menu"); drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = `
    <div class="drawer-head">
      <a class="brand" href="index.html"><span class="brand-mark">A</span><span>Asharchives</span></a>
      <button class="icon-button" id="drawerClose" type="button" aria-label="Close menu">${ICON.close}</button>
    </div>
    <nav class="drawer-nav" aria-label="Sections">
      <p class="drawer-label">Study tools</p>
      ${link("cards", "flashcards.html", "Flashcards", '<em class="badge" id="badgeCards" hidden></em>')}
      ${link("notes", "notes.html", "Notes", '<em class="badge" id="badgeNotes" hidden></em>')}
      ${link("focus", "focus.html", "Focus timer", '<em class="badge live" id="badgeFocus" hidden></em>')}
      <p class="drawer-label">Library</p>
      ${link("home", "index.html", "Home")}
      <a class="drawer-link" href="index.html#subjects">${ICON.grid}<span>All subjects</span></a>
    </nav>
    <div class="drawer-foot">
      <div class="drawer-today" aria-label="Today at a glance">
        <div><strong id="todayFocus">0</strong><span>min focused</span></div>
        <div><strong id="todayDue">0</strong><span>cards due</span></div>
        <div><strong id="todayNotes">0</strong><span>notes</span></div>
      </div>
      <button class="drawer-theme" id="drawerTheme" type="button">
        <span class="sun-icon">${ICON.sun}</span><span class="moon-icon">${ICON.moon}</span><span id="drawerThemeLabel">Switch theme</span>
      </button>
      <p class="drawer-note">Everything is saved on this device.</p>
    </div>`;

  const dock = document.createElement("nav");
  dock.className = "dock"; dock.setAttribute("aria-label", "Quick tabs");
  const tab = (key, href, label) =>
    `<a class="dock-tab${isActive(key) ? " is-active" : ""}" href="${href}"${isActive(key) ? ' aria-current="page"' : ""} data-tab="${key}">${ICON[key]}<span class="dock-label">${label}</span></a>`;
  dock.innerHTML = tab("home", "index.html", "Home") + tab("cards", "flashcards.html", "Cards") + tab("notes", "notes.html", "Notes") + tab("focus", "focus.html", "Focus");

  document.body.classList.add("has-dock");
  document.body.append(overlay, drawer, dock);

  // Hamburger button lives in each page's topbar (see the HTML); wire every one we find.
  const menuButtons = document.querySelectorAll("[data-menu-toggle]");
  let lastFocus = null;
  const openMenu = () => {
    lastFocus = document.activeElement;
    document.documentElement.classList.add("nav-open");
    drawer.setAttribute("aria-hidden", "false");
    menuButtons.forEach(b => b.setAttribute("aria-expanded", "true"));
    refreshToday();
    setTimeout(() => drawer.querySelector(".drawer-link.is-active, .drawer-link")?.focus({ preventScroll: true }), 60);
  };
  const closeMenu = (restore = true) => {
    if (!document.documentElement.classList.contains("nav-open")) return;
    document.documentElement.classList.remove("nav-open");
    drawer.setAttribute("aria-hidden", "true");
    menuButtons.forEach(b => b.setAttribute("aria-expanded", "false"));
    if (restore && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };
  menuButtons.forEach(b => b.addEventListener("click", () => (document.documentElement.classList.contains("nav-open") ? closeMenu() : openMenu())));
  overlay.addEventListener("click", () => closeMenu());
  document.getElementById("drawerClose").addEventListener("click", () => closeMenu());
  drawer.addEventListener("click", e => { if (e.target.closest("a")) closeMenu(false); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
    if (e.key === "Tab" && document.documentElement.classList.contains("nav-open")) {
      const items = [...drawer.querySelectorAll("a,button")].filter(x => !x.hidden);
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.getElementById("drawerTheme").addEventListener("click", toggleTheme);
  const themeLabel = () => { document.getElementById("drawerThemeLabel").textContent = document.documentElement.dataset.theme === "dark" ? "Switch to light mode" : "Switch to dark mode"; };
  themeLabel();
  new MutationObserver(themeLabel).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---------- counts shown in the sidebar ---------- */
  const todayMinutes = () => parse(K.log, []).filter(x => x.d === dayKey(new Date())).reduce((n, x) => n + (x.m || 0), 0);
  const dueCards = () => { const now = Date.now(); const c = parse(K.cards, []); return Array.isArray(c) ? c.filter(x => x.due <= now).length : 0; };
  const noteCount = () => { const n = parse(K.notes, []); return Array.isArray(n) ? n.length : 0; };
  function refreshToday() {
    const due = dueCards(), notes = noteCount(), mins = todayMinutes();
    document.getElementById("todayFocus").textContent = mins;
    document.getElementById("todayDue").textContent = due;
    document.getElementById("todayNotes").textContent = notes;
    const bc = document.getElementById("badgeCards"); bc.hidden = !due; bc.textContent = due > 99 ? "99+" : due;
    const bn = document.getElementById("badgeNotes"); bn.hidden = !notes; bn.textContent = notes > 99 ? "99+" : notes;
  }
  refreshToday();
  window.addEventListener("storage", refreshToday);

  /* =====================================================================
     Focus timer engine — one shared timer for the whole site.
     State is stored with an absolute end time, so it stays accurate across
     page changes, reloads and throttled background tabs.
     ===================================================================== */
  const DEFAULT_FOCUS = { mode: "focus", status: "idle", endAt: null, left: 25 * 60, total: 25 * 60, subject: "", cfg: { focus: 25, brk: 5 } };
  let state = { ...DEFAULT_FOCUS, ...parse(K.focus, {}) };
  state.cfg = { ...DEFAULT_FOCUS.cfg, ...(state.cfg || {}) };
  const listeners = new Set();
  let audioCtx = null;
  const persist = () => save(K.focus, state);
  const remaining = () => state.status === "running" ? Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000)) : state.left;
  const phaseSeconds = mode => (mode === "focus" ? state.cfg.focus : state.cfg.brk) * 60;
  const emit = () => { const r = remaining(); listeners.forEach(fn => fn(state, r)); renderChrome(r); };

  function chime() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      [660, 880, 1100].forEach((freq, i) => {
        const t = audioCtx.currentTime + i * 0.22, osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = "sine"; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t); gain.gain.exponentialRampToValueAtTime(0.22, t + 0.03); gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        osc.connect(gain).connect(audioCtx.destination); osc.start(t); osc.stop(t + 0.55);
      });
    } catch { /* audio unavailable */ }
  }

  function finishPhase() {
    const wasFocus = state.mode === "focus";
    if (wasFocus) {
      const log = parse(K.log, []);
      log.push({ t: Date.now(), d: dayKey(new Date()), m: Math.max(1, Math.round(state.total / 60)), s: state.subject || "" });
      save(K.log, log.slice(-500));
    }
    state.mode = wasFocus ? "break" : "focus";
    state.status = "idle"; state.endAt = null;
    state.total = phaseSeconds(state.mode); state.left = state.total;
    persist(); chime();
    const msg = wasFocus ? "Focus session done. Time for a break." : "Break over. Ready for another round?";
    toast(msg, { ms: 7000 });
    try { if ("Notification" in window && Notification.permission === "granted" && document.hidden) new Notification("Asharchives", { body: msg }); } catch { /* ignore */ }
    refreshToday();
  }

  const tick = () => {
    if (state.status === "running" && Date.now() >= state.endAt) finishPhase();
    emit();
  };
  setInterval(tick, 500);
  document.addEventListener("visibilitychange", tick);
  window.addEventListener("storage", e => {
    if (e.key === K.focus) { state = { ...DEFAULT_FOCUS, ...parse(K.focus, {}) }; state.cfg = { ...DEFAULT_FOCUS.cfg, ...(state.cfg || {}) }; emit(); }
  });

  const AshFocus = {
    get: () => state,
    remaining,
    subscribe(fn) { listeners.add(fn); fn(state, remaining()); return () => listeners.delete(fn); },
    start({ askNotify = false } = {}) {
      if (state.status === "running") return;
      try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume && audioCtx.resume(); } catch { /* ignore */ }
      if (askNotify && "Notification" in window && Notification.permission === "default") { try { Notification.requestPermission(); } catch { /* ignore */ } }
      if (state.left <= 0) state.left = state.total;
      state.status = "running"; state.endAt = Date.now() + state.left * 1000;
      persist(); emit();
    },
    pause() {
      if (state.status !== "running") return;
      state.left = remaining(); state.status = "paused"; state.endAt = null;
      persist(); emit();
    },
    toggle(opts) { state.status === "running" ? AshFocus.pause() : AshFocus.start(opts); },
    reset() {
      state.status = "idle"; state.endAt = null; state.total = phaseSeconds(state.mode); state.left = state.total;
      persist(); emit();
    },
    skip() {
      state.mode = state.mode === "focus" ? "break" : "focus";
      AshFocus.reset();
    },
    setMode(mode) {
      if (mode === state.mode) return;
      state.mode = mode; AshFocus.reset();
    },
    setConfig(focus, brk) {
      state.cfg = { focus: Math.min(180, Math.max(1, Math.round(focus) || 25)), brk: Math.min(60, Math.max(1, Math.round(brk) || 5)) };
      if (state.status === "idle") { state.total = phaseSeconds(state.mode); state.left = state.total; }
      persist(); emit();
    },
    setSubject(id) { state.subject = id || ""; persist(); emit(); },
    log: () => parse(K.log, []),
    dayKey
  };
  window.AshFocus = AshFocus;
  window.AshUI = { toast, esc, parse, save, dayKey, pad, K, ICON, refreshToday };

  /* ---------- timer chrome: dock label, sidebar badge, tab title ---------- */
  const focusTab = dock.querySelector('[data-tab="focus"]');
  const focusLabel = focusTab.querySelector(".dock-label");
  const badgeFocus = document.getElementById("badgeFocus");
  function renderChrome(r) {
    const active = state.status !== "idle";
    focusTab.classList.toggle("is-live", state.status === "running");
    focusTab.classList.toggle("is-paused", state.status === "paused");
    focusLabel.textContent = active ? fmt(r) : "Focus";
    badgeFocus.hidden = !active; badgeFocus.textContent = active ? fmt(r) : "";
    const base = document.title.replace(/^\(\d\d:\d\d\)\s*/, "");
    document.title = state.status === "running" ? `(${fmt(r)}) ${base}` : base;
  }
  emit();
})();
