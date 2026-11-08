(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const parse = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } };
  const setTheme = t => { document.documentElement.dataset.theme = t; try { localStorage.setItem("asharrow-theme", t); } catch {} };
  $("themeToggle").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const subs = window.ASH_SUBJECTS || [];
  $("qbSubject").innerHTML = subs.map(s => `<option value="${s.id}">${s.icon} ${esc(s.name)}</option>`).join("");
  // Data lives in qbank/pyq/<subject>.js (PYQs) and qbank/questions/<subject>.js (all other questions); loaded on demand.
  const loadJs = src => new Promise(res => { const s = document.createElement("script"); s.src = src; s.onload = s.onerror = () => res(); document.head.appendChild(s); });
  const loaded = {};
  const ensure = id => loaded[id] || (loaded[id] = Promise.all([loadJs(`qbank/pyq/${id}.js`), loadJs(`qbank/questions/${id}.js`)]));
  const bank = id => [...((window.ASH_PYQ || {})[id] || []), ...((window.ASH_QB || {})[id] || []), ...parse("asharrow-qbank", {})[id] || []];
  const imgs = a => (a || []).filter(u => /^(https?:\/\/|images\/|data:image\/)/.test(u)).map(u => `<img class="qb-img" src="${esc(u)}" alt="" loading="lazy">`).join("");
  const quiz = $("qbQuiz");
  quiz.addEventListener("error", e => { const t = e.target; if (t.classList && t.classList.contains("qb-img")) { const a = document.createElement("a"); a.href = t.src; a.target = "_blank"; a.rel = "noopener"; a.className = "btn"; a.textContent = "Image could not load – open it in a new tab ↗"; t.replaceWith(a); } }, true);
  let qs = [], i = 0, score = 0;
  const sel = sid => bank(sid).filter(q => ($("qbMode").value !== "pyq" || q.x) && (!$("qbTopic").value || q.c === $("qbTopic").value));
  const fillTopics = sid => { const m = {}; bank(sid).forEach(q => { if (q.c) m[q.c] = (m[q.c] || 0) + 1; }); const cur = $("qbTopic").value;
    $("qbTopic").innerHTML = `<option value="">All topics</option>` + Object.keys(m).map(c => `<option value="${esc(c)}">${esc(c)} (${m[c]})</option>`).join("");
    if (m[cur]) $("qbTopic").value = cur; $("qbTopic").disabled = $("qbMode").value === "pyq"; if ($("qbTopic").disabled) $("qbTopic").value = ""; };
  const stats = async () => { const h = parse("asharrow-qbank-hist", {}); const sid = $("qbSubject").value; await ensure(sid); fillTopics(sid); $("qbStats").textContent = `${sel(sid).length} ${$("qbMode").value === "pyq" ? "PYQs" : "questions"} in this subject` + (h[sid] ? ` · best score ${h[sid]}%` : ""); };
  function show() {
    if (i >= qs.length) {
      const pct = Math.round(score / qs.length * 100), h = parse("asharrow-qbank-hist", {}), sid = $("qbSubject").value;
      h[sid] = Math.max(h[sid] || 0, pct); try { localStorage.setItem("asharrow-qbank-hist", JSON.stringify(h)); } catch {}
      const msg = pct >= 80 ? "Excellent work!" : pct >= 50 ? "Good going — keep practising." : "Keep at it, review and retry.";
      quiz.innerHTML = `<div class="qb-result"><div class="qb-ring" style="--p:${pct}"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="qbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--c1)"/><stop offset=".6" stop-color="var(--c4)"/><stop offset="1" stop-color="var(--c5)"/></linearGradient></defs><circle class="trk" cx="60" cy="60" r="52"/><circle class="val" cx="60" cy="60" r="52" pathLength="100"/></svg><div class="qb-score" id="qbPct">0%</div></div><p class="qb-msg">${msg}</p><p class="small-muted">${score} of ${qs.length} correct</p><button class="btn btn-primary" id="again" type="button">Try again</button></div>`;
      { const el = $("qbPct"), t0 = performance.now(); const tick = t => { const f = Math.min(1, (t - t0) / 900); el.textContent = Math.round(pct * (1 - Math.pow(1 - f, 3))) + "%"; if (f < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
      $("again").onclick = start; stats(); return;
    }
    const q = qs[i];
    quiz.innerHTML = `<div class="qb-top"><span>Question ${i + 1} of ${qs.length}</span><span>Score ${score}</span></div><div class="qb-bar-track"><i style="width:${i / qs.length * 100}%"></i></div>${q.x ? `<span class="qb-tag">PYQ · ${esc(q.x)}</span>` : q.c ? `<span class="qb-tag">${esc(q.c)} › ${esc((q.t || "").replace(/\s+/g, " "))}</span>` : ""}<div class="qb-q">${esc(q.q)}</div>${imgs(q.i)}` +
      q.o.map((o, k) => `<button class="qb-opt" type="button" data-k="${k}" style="--d:${k * 70 + 120}ms"><span class="qb-let">${"ABCD"[k]}</span><span class="qb-ot">${esc(o)}</span><span class="qb-mark" aria-hidden="true"></span></button>`).join("") + `<div id="qbFb"></div>`;
    quiz.querySelectorAll(".qb-opt").forEach(b => b.onclick = () => {
      const k = +b.dataset.k; quiz.querySelectorAll(".qb-opt").forEach(x => x.disabled = true);
      quiz.querySelectorAll(".qb-opt")[q.a].classList.add("right"); { const bi = quiz.querySelector(".qb-bar-track i"); if (bi) bi.style.width = (i + 1) / qs.length * 100 + "%"; } if (k !== q.a) b.classList.add("wrong"); else score++;
      $("qbFb").innerHTML = `<div class="qb-exp ${k === q.a ? "is-right" : "is-wrong"}"><b class="qb-exp-h">${k === q.a ? "Correct" : "Not quite"}</b>${esc(q.e || (k === q.a ? "Well done." : "Review this topic."))}${imgs(q.ei)}</div><button class="btn btn-primary" id="nx" type="button" style="margin-top:12px">${i + 1 < qs.length ? "Next" : "Finish"}</button>`;
      $("nx").onclick = () => { i++; show(); };
    });
  }
  async function start() {
    const sid0 = $("qbSubject").value; quiz.innerHTML = `<div class="qb-empty"><span class="qb-empty-ico spin">✦</span><p>Loading questions…</p></div>`; await ensure(sid0);
    qs = sel(sid0);
    for (let j = qs.length - 1; j > 0; j--) { const r = Math.floor(Math.random() * (j + 1)); [qs[j], qs[r]] = [qs[r], qs[j]]; }
    const n = $("qbCount").value; if (n !== "all") qs = qs.slice(0, +n); i = 0; score = 0;
    if (!qs.length) { quiz.innerHTML = `<p class="small-muted">${$("qbMode").value === "pyq" ? "No PYQs for this subject yet." : "No questions yet for this subject. Use “+ Add question” to build your own set."}</p>`; return; }
    show();
  }
  $("qbStart").onclick = start; $("qbSubject").onchange = () => { $("qbTopic").value = ""; stats(); }; $("qbTopic").onchange = stats; $("qbMode").onchange = () => { stats(); };
  $("qbAddToggle").onclick = () => { $("qbAdd").hidden = !$("qbAdd").hidden; };
  $("aSave").onclick = () => {
    const o = ["aO1", "aO2", "aO3", "aO4"].map(x => $(x).value.trim());
    if (!$("aQ").value.trim() || o.some(x => !x)) { $("aQ").focus(); return; }
    const all = parse("asharrow-qbank", {}), sid = $("qbSubject").value;
    (all[sid] = all[sid] || []).push({ q: $("aQ").value.trim(), o, a: +$("aAns").value, e: $("aE").value.trim() });
    try { localStorage.setItem("asharrow-qbank", JSON.stringify(all)); } catch {}
    ["aQ", "aO1", "aO2", "aO3", "aO4", "aE"].forEach(x => $(x).value = ""); $("qbAdd").hidden = true; stats();
  };
  stats();
})();
