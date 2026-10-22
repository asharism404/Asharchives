/* Asharchives — Flashcards.
   Students write their own cards (single or bulk), study them with a simple spaced-repetition
   schedule (Leitner boxes), and manage everything in a searchable library.
   Data: localStorage "asharrow-cards" = [{id, sub, topic, q, a, box, due, created, n}] */
(() => {
  "use strict";
  const { toast, esc, parse, save, K } = window.AshUI;
  const SUBJECTS = window.ASH_SUBJECTS || [];
  const $ = id => document.getElementById(id);
  const DAY = 86400000;
  const INTERVALS = [0, 1, 3, 7, 16];          // days until a card returns, by box 0–4
  const LAST_KEY = "asharrow-cards-last";
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const startOfDay = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const dueFor = box => (box <= 0 ? Date.now() : startOfDay(Date.now()) + INTERVALS[Math.min(box, 4)] * DAY);
  const subj = id => SUBJECTS.find(s => s.id === id);
  const yearLabel = y => (y === 4 ? "Final year" : `${y}${y === 1 ? "st" : y === 2 ? "nd" : "rd"} year`);
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

  let cards = (() => { const c = parse(K.cards, []); return Array.isArray(c) ? c.filter(x => x && typeof x.q === "string" && typeof x.a === "string") : []; })();
  const persist = () => { save(K.cards, cards); window.AshUI.refreshToday(); };
  const byId = id => cards.find(c => c.id === id);
  const isDue = c => c.due <= Date.now();
  const last = parse(LAST_KEY, {});
  let editingId = null;
  let scope = "due";
  let run = null;
  const recent = [];

  /* ---------- select builders ---------- */
  function subjectGroups(selected) {
    let html = `<option value="">Choose a subject</option>`;
    [1, 2, 3, 4].forEach(y => {
      const list = SUBJECTS.filter(s => s.year === y);
      if (list.length) html += `<optgroup label="${yearLabel(y)}">${list.map(s => `<option value="${s.id}"${s.id === selected ? " selected" : ""}>${s.icon} ${esc(s.name)}</option>`).join("")}</optgroup>`;
    });
    return html;
  }
  function topicOptions(subjectId, selected) {
    const s = subj(subjectId);
    if (!s) return `<option value="">Pick a subject first</option>`;
    return `<option value="">No specific lecture</option>` + s.topics.map(t => `<option value="${esc(t)}"${t === selected ? " selected" : ""}>${esc(t)}</option>`).join("");
  }
  function subjectsWithCards(allLabel, selected) {
    const ids = [...new Set(cards.map(c => c.sub))];
    const list = SUBJECTS.filter(s => ids.includes(s.id));
    return `<option value="all">${allLabel} (${cards.length})</option>` +
      list.map(s => `<option value="${s.id}"${s.id === selected ? " selected" : ""}>${s.icon} ${esc(s.name)} (${cards.filter(c => c.sub === s.id).length})</option>`).join("");
  }

  /* ---------- stats ---------- */
  function renderStats() {
    $("statTotal").textContent = cards.length;
    $("statDue").textContent = cards.filter(isDue).length;
    $("statMastered").textContent = cards.filter(c => c.box >= 4).length;
    $("libCount").textContent = cards.length;
  }

  /* ---------- views ---------- */
  function setView(name) {
    ["study", "create", "library"].forEach(v => {
      const on = v === name;
      $("view" + v[0].toUpperCase() + v.slice(1)).hidden = !on;
      const tab = $("tab" + v[0].toUpperCase() + v.slice(1));
      tab.setAttribute("aria-selected", String(on));
    });
    if (name === "library") renderLibrary();
    if (name === "study") renderSetup();
  }
  document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => setView(b.dataset.view)));

  /* ---------- create / edit ---------- */
  function fillCreateSelects(sub, topic) {
    $("cSubject").innerHTML = subjectGroups(sub);
    $("cTopic").innerHTML = topicOptions(sub, topic);
    $("cTopic").disabled = !sub;
  }
  $("cSubject").addEventListener("change", () => { $("cTopic").innerHTML = topicOptions($("cSubject").value, ""); $("cTopic").disabled = !$("cSubject").value; });

  function resetForm(keepContext = true) {
    editingId = null;
    $("cQ").value = ""; $("cA").value = "";
    $("formTitle").textContent = "New card";
    $("cSubmit").textContent = "Add card";
    $("cCancel").hidden = true;
    if (!keepContext) fillCreateSelects("", "");
  }
  $("cardForm").addEventListener("submit", e => {
    e.preventDefault();
    const sub = $("cSubject").value, topic = $("cTopic").value, q = $("cQ").value.trim(), a = $("cA").value.trim();
    if (!sub) { toast("Choose a subject for this card."); $("cSubject").focus(); return; }
    if (!q || !a) { toast("Add both a question and an answer."); (q ? $("cA") : $("cQ")).focus(); return; }
    if (editingId) {
      const c = byId(editingId);
      if (c) { c.sub = sub; c.topic = topic; c.q = q; c.a = a; }
      persist(); resetForm(); renderStats(); refreshStudy();
      toast("Card updated"); setView("library");
      return;
    }
    cards.push({ id: uid(), sub, topic, q, a, box: 0, due: Date.now(), created: Date.now(), n: 0 });
    save(LAST_KEY, { sub, topic });
    persist(); renderStats(); refreshStudy();
    recent.unshift(q); renderRecent();
    toast(`Card added to ${subj(sub)?.name || "your deck"}`);
    $("cQ").value = ""; $("cA").value = ""; $("cQ").focus();
  });
  $("cardForm").addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); $("cardForm").requestSubmit(); } });
  $("cCancel").addEventListener("click", () => { resetForm(); setView("library"); });

  function renderRecent() {
    $("recentBox").hidden = !recent.length;
    $("recentList").innerHTML = recent.slice(0, 3).map(q => `<li>${esc(q)}</li>`).join("");
  }

  // bulk add
  function parseBulk(text) {
    const out = [], skipped = [];
    text.split(/\r?\n/).forEach(raw => {
      const line = raw.trim(); if (!line) return;
      let i = line.indexOf("::"), len = 2;
      if (i < 0) { i = line.indexOf("\t"); len = 1; }
      if (i < 0) { skipped.push(line); return; }
      const q = line.slice(0, i).trim(), a = line.slice(i + len).trim();
      if (q && a) out.push({ q, a }); else skipped.push(line);
    });
    return { out, skipped };
  }
  function updateBulk() {
    const { out, skipped } = parseBulk($("bulk").value);
    $("bulkAdd").disabled = !out.length;
    $("bulkAdd").textContent = out.length ? `Add ${plural(out.length, "card")}` : "Add cards";
    $("bulkInfo").textContent = skipped.length ? `${plural(skipped.length, "line")} skipped: needs “question :: answer”` : "";
  }
  $("bulk").addEventListener("input", updateBulk);
  $("bulkAdd").addEventListener("click", () => {
    const sub = $("cSubject").value, topic = $("cTopic").value;
    if (!sub) { toast("Choose a subject above the question box first."); $("cSubject").focus(); return; }
    const { out } = parseBulk($("bulk").value); if (!out.length) return;
    const now = Date.now();
    out.forEach((c, i) => cards.push({ id: uid() + i, sub, topic, q: c.q, a: c.a, box: 0, due: now, created: now, n: 0 }));
    save(LAST_KEY, { sub, topic });
    persist(); renderStats(); refreshStudy();
    out.slice().reverse().forEach(c => recent.unshift(c.q)); renderRecent();
    $("bulk").value = ""; updateBulk();
    toast(`${plural(out.length, "card")} added to ${subj(sub)?.name}`);
  });

  const setStudying = on => document.body.classList.toggle("studying", on);

  /* ---------- study ---------- */
  const pool = () => {
    const sel = $("studySubject").value;
    return cards.filter(c => sel === "all" || c.sub === sel);
  };
  function refreshStudy() {
    const sel = $("studySubject").value || "all";
    $("studySubject").innerHTML = subjectsWithCards("All subjects", sel);
    if (![...$("studySubject").options].some(o => o.value === sel)) $("studySubject").value = "all"; else $("studySubject").value = sel;
    renderSetup();
  }
  function renderSetup() {
    const p = pool(), due = p.filter(isDue);
    $("scopeDue").textContent = due.length; $("scopeAll").textContent = p.length;
    document.querySelectorAll("[data-scope]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.scope === scope)));
    const n = scope === "due" ? due.length : p.length;
    $("startStudy").disabled = n === 0;
    $("startStudy").textContent = n ? `Start studying ${plural(n, "card")}` : "Start studying";
    const hint = $("studyHint");
    if (!cards.length) hint.innerHTML = `You have no cards yet. <a class="lecture-note-link" href="#" id="goCreate">Create your first card</a>.`;
    else if (!n && scope === "due") hint.textContent = "Nothing is due right now. Switch to “All” to review anyway, or come back later.";
    else if (scope === "due") hint.textContent = "Cards you rate Again come back in this session. Others return after a longer gap.";
    else hint.textContent = "Reviewing everything, including cards that are not due yet.";
    $("goCreate")?.addEventListener("click", e => { e.preventDefault(); setView("create"); });
  }
  $("studySubject").addEventListener("change", renderSetup);
  document.querySelectorAll("[data-scope]").forEach(b => b.addEventListener("click", () => { scope = b.dataset.scope; renderSetup(); }));

  const shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  function dueLabel(box) {
    const d = INTERVALS[Math.min(box, 4)];
    return d <= 0 ? "this session" : d === 1 ? "tomorrow" : `in ${d} days`;
  }
  $("startStudy").addEventListener("click", () => {
    const p = pool().filter(c => scope === "all" || isDue(c));
    if (!p.length) return;
    run = { queue: shuffle(p.map(c => c.id)), total: p.length, cleared: 0, seen: 0, again: 0, easy: 0, flipped: false };
    $("studySetup").hidden = true; $("studyDone").hidden = true; $("studyRun").hidden = false;
    setStudying(true); window.scrollTo({ top: 0 });
    showCard();
  });
  function showCard() {
    while (run.queue.length && !byId(run.queue[0])) run.queue.shift();   // card deleted elsewhere
    if (!run.queue.length) return finishRun();
    const c = byId(run.queue[0]);
    const inner = document.querySelector(".flip-inner");
    inner.style.transition = "none";
    $("flip").classList.remove("is-flipped"); $("flip").setAttribute("aria-pressed", "false"); run.flipped = false;
    $("faceQ").textContent = c.q; $("faceA").textContent = c.a;
    $("faceMeta").textContent = `${subj(c.sub) ? subj(c.sub).name : "General"}${c.topic ? " · " + c.topic : ""}`;
    void inner.offsetWidth; inner.style.transition = "";
    $("rate").hidden = true; $("rateKeys").hidden = false;
    $("runCount").textContent = `${run.cleared} of ${run.total} done`;
    $("runBar").style.width = Math.round(run.cleared / run.total * 100) + "%";
    $("hintAgain").textContent = "this session";
    $("hintGood").textContent = dueLabel(Math.min(c.box + 1, 4));
    $("hintEasy").textContent = dueLabel(Math.min(c.box + 2, 4));
  }
  function flip() {
    if (!run) return;
    run.flipped = !run.flipped;
    $("flip").classList.toggle("is-flipped", run.flipped);
    $("flip").setAttribute("aria-pressed", String(run.flipped));
    $("rate").hidden = !run.flipped;
  }
  function rate(kind) {
    if (!run || !run.flipped) return;
    const id = run.queue[0], c = byId(id); run.queue.shift();
    if (c) {
      c.n = (c.n || 0) + 1;
      if (kind === "again") { c.box = 0; c.due = Date.now(); run.again++; run.queue.push(id); }
      else { c.box = Math.min(4, c.box + (kind === "easy" ? 2 : 1)); c.due = dueFor(c.box); run.cleared++; run.easy++; }
      run.seen++;
      persist(); renderStats();
    }
    showCard();
  }
  function finishRun() {
    const r = run; run = null; setStudying(false);
    $("studyRun").hidden = true; $("studyDone").hidden = false;
    $("doneSeen").textContent = r.total; $("doneAgain").textContent = r.again; $("doneEasy").textContent = r.easy;
    $("doneMsg").textContent = r.again ? "Cards you struggled with will come back sooner. That repetition is what makes them stick." : "Clean run. These cards will return after a longer gap.";
    refreshStudy();
  }
  $("flip").addEventListener("click", flip);
  $("rate").addEventListener("click", e => { const b = e.target.closest("[data-rate]"); if (b) rate(b.dataset.rate); });
  $("endStudy").addEventListener("click", () => { run = null; setStudying(false); $("studyRun").hidden = true; $("studySetup").hidden = false; refreshStudy(); });
  $("doneBack").addEventListener("click", () => { $("studyDone").hidden = true; $("studySetup").hidden = false; renderSetup(); });
  document.addEventListener("keydown", e => {
    if (!run || $("viewStudy").hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
    if (e.key === " " || e.key === "Enter") {
      if (tag === "BUTTON") return;                // let real buttons keep their native behaviour
      e.preventDefault(); flip();
    } else if (run.flipped && ["1", "2", "3"].includes(e.key)) rate(["again", "good", "easy"][Number(e.key) - 1]);
  });

  /* ---------- library ---------- */
  const fmtDate = ts => new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  function filteredLibrary() {
    const q = $("libSearch").value.trim().toLowerCase(), sub = $("libSubject").value || "all";
    return cards.filter(c => (sub === "all" || c.sub === sub) && (!q || (c.q + " " + c.a + " " + (c.topic || "")).toLowerCase().includes(q))).sort((a, b) => b.created - a.created);
  }
  function renderLibrary() {
    const sel = $("libSubject").value || "all";
    $("libSubject").innerHTML = subjectsWithCards("All subjects", sel);
    if (![...$("libSubject").options].some(o => o.value === sel)) $("libSubject").value = "all"; else $("libSubject").value = sel;
    const list = filteredLibrary();
    $("libInfo").textContent = cards.length ? `Showing ${list.length} of ${plural(cards.length, "card")}` : "";
    $("exportCards").disabled = !list.length;
    if (!cards.length) { $("cardList").innerHTML = `<div class="empty"><strong>No cards yet</strong>Your cards will appear here once you create them.<br><button class="btn btn-primary" type="button" data-go="create">Create a card</button></div>`; return; }
    if (!list.length) { $("cardList").innerHTML = `<div class="empty"><strong>No matches</strong>Try a different word or subject.</div>`; return; }
    $("cardList").innerHTML = list.map(c => {
      const s = subj(c.sub);
      return `<article class="card-row" data-id="${c.id}">
        <div><p class="q">${esc(c.q)}</p><p class="a">${esc(c.a)}</p></div>
        <div class="actions">
          <button class="icon-sm" type="button" data-edit="${c.id}" aria-label="Edit card" title="Edit"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg></button>
          <button class="icon-sm" type="button" data-del="${c.id}" aria-label="Delete card" title="Delete"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 11v6M14 11v6M6.5 7l.8 12h9.4l.8-12M9.5 7V4.5h5V7"/></svg></button>
        </div>
        <div class="meta"><span class="pill">${s ? s.icon + " " + esc(s.name) : "General"}</span>${c.topic ? `<span class="pill">${esc(c.topic)}</span>` : ""}
          <span class="dots" title="Memory strength ${c.box} of 4" aria-label="Memory strength ${c.box} of 4">${[1, 2, 3, 4].map(i => `<i class="${c.box >= i ? "on" : ""}"></i>`).join("")}</span>
          <span class="due">${!c.n ? "New" : isDue(c) ? "Due now" : "Next " + fmtDate(c.due)}</span></div>
      </article>`;
    }).join("");
  }
  $("libSearch").addEventListener("input", renderLibrary);
  $("libSubject").addEventListener("change", renderLibrary);
  $("cardList").addEventListener("click", e => {
    const go = e.target.closest("[data-go]"); if (go) return setView(go.dataset.go);
    const ed = e.target.closest("[data-edit]"), del = e.target.closest("[data-del]");
    if (ed) {
      const c = byId(ed.dataset.edit); if (!c) return;
      editingId = c.id; fillCreateSelects(c.sub, c.topic);
      $("cQ").value = c.q; $("cA").value = c.a;
      $("formTitle").textContent = "Edit card"; $("cSubmit").textContent = "Save changes"; $("cCancel").hidden = false;
      setView("create"); window.scrollTo({ top: 0, behavior: "smooth" }); $("cQ").focus({ preventScroll: true });
    }
    if (del) {
      const i = cards.findIndex(c => c.id === del.dataset.del); if (i < 0) return;
      const [gone] = cards.splice(i, 1);
      persist(); renderStats(); renderLibrary(); refreshStudy();
      toast("Card deleted", { action: { label: "Undo", run: () => { cards.splice(i, 0, gone); persist(); renderStats(); renderLibrary(); refreshStudy(); } }, ms: 6000 });
    }
  });
  $("exportCards").addEventListener("click", () => {
    const list = filteredLibrary(); if (!list.length) return;
    const flat = s => s.replace(/\s*\n\s*/g, " ");
    const text = list.map(c => `${flat(c.q)} :: ${flat(c.a)}`).join("\n") + "\n";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = "asharchives-flashcards.txt"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(`Exported ${plural(list.length, "card")}. You can paste the file into “Add many at once” later.`);
  });

  window.addEventListener("storage", e => {
    if (e.key !== K.cards || run) return;
    const c = parse(K.cards, []); cards = Array.isArray(c) ? c : [];
    renderStats(); refreshStudy(); if (!$("viewLibrary").hidden) renderLibrary();
  });

  /* ---------- start up ---------- */
  const params = new URLSearchParams(location.search);
  let preSub = params.get("subject") || last.sub || "";
  if (!subj(preSub)) preSub = "";
  let preTopic = last.topic || "";
  const tIdx = params.get("topic");
  if (params.get("subject") && tIdx !== null && subj(preSub) && subj(preSub).topics[Number(tIdx)]) preTopic = subj(preSub).topics[Number(tIdx)];
  else if (params.get("subject")) preTopic = "";
  fillCreateSelects(preSub, preTopic);
  renderStats(); refreshStudy(); renderRecent(); updateBulk();
  setView(params.get("new") || !cards.length ? "create" : "study");
})();
