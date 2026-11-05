(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const parse = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } };
  const setTheme = t => { document.documentElement.dataset.theme = t; try { localStorage.setItem("asharrow-theme", t); } catch {} };
  $("themeToggle").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const subs = window.ASH_SUBJECTS || [];
  $("qbSubject").innerHTML = subs.map(s => `<option value="${s.id}">${s.icon} ${esc(s.name)}</option>`).join("");
  const bank = id => [...((window.ASH_QBANK || {})[id] || []), ...parse("asharrow-qbank", {})[id] || []];
  const quiz = $("qbQuiz");
  let qs = [], i = 0, score = 0;
  const stats = () => { const h = parse("asharrow-qbank-hist", {}); const sid = $("qbSubject").value; $("qbStats").textContent = `${bank(sid).length} questions in this subject` + (h[sid] ? ` · best score ${h[sid]}%` : ""); };
  function show() {
    if (i >= qs.length) {
      const pct = Math.round(score / qs.length * 100), h = parse("asharrow-qbank-hist", {}), sid = $("qbSubject").value;
      h[sid] = Math.max(h[sid] || 0, pct); try { localStorage.setItem("asharrow-qbank-hist", JSON.stringify(h)); } catch {}
      quiz.innerHTML = `<div class="qb-score">${pct}%</div><p>${score} of ${qs.length} correct.</p><button class="btn btn-primary" id="again" type="button">Try again</button>`;
      $("again").onclick = start; stats(); return;
    }
    const q = qs[i];
    quiz.innerHTML = `<div class="qb-top"><span>Question ${i + 1} of ${qs.length}</span><span>Score ${score}</span></div><div class="qb-bar-track"><i style="width:${i / qs.length * 100}%"></i></div><div class="qb-q">${esc(q.q)}</div>` +
      q.o.map((o, k) => `<button class="qb-opt" type="button" data-k="${k}">${"ABCD"[k]}. ${esc(o)}</button>`).join("") + `<div id="qbFb"></div>`;
    quiz.querySelectorAll(".qb-opt").forEach(b => b.onclick = () => {
      const k = +b.dataset.k; quiz.querySelectorAll(".qb-opt").forEach(x => x.disabled = true);
      quiz.querySelectorAll(".qb-opt")[q.a].classList.add("right"); if (k !== q.a) b.classList.add("wrong"); else score++;
      $("qbFb").innerHTML = `<div class="qb-exp">${esc(q.e || (k === q.a ? "Correct." : "Review this topic."))}</div><button class="btn btn-primary" id="nx" type="button" style="margin-top:12px">${i + 1 < qs.length ? "Next" : "Finish"}</button>`;
      $("nx").onclick = () => { i++; show(); };
    });
  }
  function start() {
    qs = bank($("qbSubject").value).slice().sort(() => Math.random() - .5); i = 0; score = 0;
    if (!qs.length) { quiz.innerHTML = `<p class="small-muted">No questions yet for this subject. Use “+ Add question” to build your own set.</p>`; return; }
    show();
  }
  $("qbStart").onclick = start; $("qbSubject").onchange = stats;
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
