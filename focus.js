/* Asharchives — Focus timer page.
   The timer itself lives in nav.js (window.AshFocus) so it keeps running on every page.
   This file only draws it and records nothing by itself. */
(() => {
  "use strict";
  const F = window.AshFocus;
  const { esc, pad, dayKey, K, toast } = window.AshUI;
  const SUBJECTS = window.ASH_SUBJECTS || [];
  const $ = id => document.getElementById(id);
  const CIRC = 816.8;                                   // 2π × r(130)
  const fmt = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  const subj = id => SUBJECTS.find(s => s.id === id);
  const yearLabel = y => (y === 4 ? "Final year" : `${y}${y === 1 ? "st" : y === 2 ? "nd" : "rd"} year`);
  const PRESETS = ["25,5", "50,10", "15,3"];
  let customOpen = false;

  /* ---------- controls ---------- */
  $("fSubject").innerHTML = `<option value="">No subject</option>` + [1, 2, 3, 4].map(y => {
    const list = SUBJECTS.filter(s => s.year === y);
    return list.length ? `<optgroup label="${yearLabel(y)}">${list.map(s => `<option value="${s.id}">${s.icon} ${esc(s.name)}</option>`).join("")}</optgroup>` : "";
  }).join("");
  $("fSubject").value = F.get().subject || "";
  $("fSubject").addEventListener("change", () => F.setSubject($("fSubject").value));

  $("btnMain").addEventListener("click", () => F.toggle({ askNotify: true }));
  $("btnReset").addEventListener("click", () => F.reset());
  $("btnSkip").addEventListener("click", () => {
    const s = F.get();
    if (s.status !== "idle" && !confirm("Skip to the next phase? Your current progress will not be saved.")) return;
    F.skip();
  });
  $("modeSeg").addEventListener("click", e => {
    const b = e.target.closest("[data-mode]"); if (!b || b.dataset.mode === F.get().mode) return;
    if (F.get().status !== "idle" && !confirm("Switch mode? The timer will reset.")) return;
    F.setMode(b.dataset.mode);
  });

  $("presets").addEventListener("click", e => {
    const b = e.target.closest("[data-preset]"); if (!b) return;
    if (b.dataset.preset === "custom") { customOpen = !customOpen; render(F.get(), F.remaining()); if (customOpen) $("cFocus").focus(); return; }
    customOpen = false;
    const [f, k] = b.dataset.preset.split(",").map(Number);
    F.setConfig(f, k);
    if (F.get().status !== "idle") toast("New length starts with the next session.");
  });
  const applyCustom = () => {
    const f = Number($("cFocus").value), k = Number($("cBreak").value);
    if (f >= 1 && k >= 1) F.setConfig(f, k);
  };
  $("cFocus").addEventListener("change", applyCustom);
  $("cBreak").addEventListener("change", applyCustom);

  document.addEventListener("keydown", e => {
    if (e.code !== "Space" || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest && e.target.closest("button, a, input, select, textarea, [contenteditable]")) return;
    e.preventDefault(); F.toggle({ askNotify: true });
  });

  /* ---------- drawing the timer ---------- */
  function render(state, r) {
    const isFocus = state.mode === "focus", running = state.status === "running", paused = state.status === "paused";
    $("ringTime").textContent = fmt(r);
    const frac = state.total ? Math.min(1, Math.max(0, (state.total - r) / state.total)) : 0;
    $("ringBar").style.strokeDashoffset = String(CIRC * (1 - frac));
    $("timerCard").classList.toggle("is-running", running);
    $("timerCard").classList.toggle("is-break", !isFocus);
    $("ringSub").textContent = running ? (isFocus ? "Stay with it" : "Rest your eyes") : paused ? "Paused" : isFocus ? "Ready to focus" : "Break time";
    $("btnMain").textContent = running ? "Pause" : paused ? "Resume" : isFocus ? "Start focus" : "Start break";
    document.querySelectorAll("[data-mode]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === state.mode)));
    if (document.activeElement !== $("fSubject")) $("fSubject").value = state.subject || "";

    const key = `${state.cfg.focus},${state.cfg.brk}`, isPreset = PRESETS.includes(key);
    document.querySelectorAll("[data-preset]").forEach(b => {
      const on = b.dataset.preset === "custom" ? (customOpen || !isPreset) : b.dataset.preset === key && !customOpen;
      b.setAttribute("aria-pressed", String(on));
    });
    const showCustom = customOpen || !isPreset;
    $("customRow").hidden = !showCustom;
    if (showCustom) {
      if (document.activeElement !== $("cFocus")) $("cFocus").value = state.cfg.focus;
      if (document.activeElement !== $("cBreak")) $("cBreak").value = state.cfg.brk;
    }
    drawStats();
  }

  /* ---------- statistics (redrawn only when the log changes) ---------- */
  let lastLog = null;
  function drawStats() {
    const raw = localStorage.getItem(K.log) || "[]";
    if (raw === lastLog) return;
    lastLog = raw;
    let log = []; try { log = JSON.parse(raw); } catch { /* ignore */ }
    if (!Array.isArray(log)) log = [];
    const today = dayKey(new Date());
    const todayLog = log.filter(x => x.d === today);
    const mins = list => list.reduce((n, x) => n + (x.m || 0), 0);
    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push({ key: dayKey(d), label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3) }); }
    const perDay = days.map(d => ({ ...d, m: mins(log.filter(x => x.d === d.key)) }));
    const max = Math.max(30, ...perDay.map(d => d.m));

    $("sToday").textContent = mins(todayLog);
    $("sSessions").textContent = todayLog.length;
    $("sWeek").textContent = perDay.reduce((n, d) => n + d.m, 0);
    $("sTotal").textContent = (mins(log) / 60).toFixed(1).replace(/\.0$/, "");
    $("headToday").textContent = mins(todayLog);
    $("headSessions").textContent = todayLog.length;

    $("weekBars").innerHTML = perDay.map((d, i) => `<div class="col${d.m ? " has" : ""}${i === 6 ? " today" : ""}"><b>${d.m || ""}</b><div class="track"><div class="fill" style="height:${Math.max(4, Math.round(d.m / max * 100))}%"></div></div><span>${esc(d.label)}</span></div>`).join("");

    const recent = log.slice(-5).reverse();
    $("sessionList").innerHTML = recent.length
      ? recent.map(x => {
          const s = subj(x.s), when = new Date(x.t);
          const stamp = x.d === today ? when.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : when.toLocaleDateString(undefined, { day: "numeric", month: "short" });
          return `<li><span><strong>${x.m} min</strong>${s ? " · " + esc(s.name) : ""}</span><span>${stamp}</span></li>`;
        }).join("")
      : `<li><span>Finish a focus session and it will appear here.</span></li>`;
  }

  F.subscribe(render);
})();
