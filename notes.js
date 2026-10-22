/* Asharchives — Notes.
   "My notes": what the student writes from memory after a lecture (saved in "asharrow-journal").
   "From lectures": read-only view of the Quick notes typed on each lecture page ("asharrow-notes"). */
(() => {
  "use strict";
  const { toast, esc, parse, save, K } = window.AshUI;
  const SUBJECTS = window.ASH_SUBJECTS || [];
  const $ = id => document.getElementById(id);
  const DRAFT = "asharrow-journal-draft";
  const LECTURE_KEY = "asharrow-notes";
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const subj = id => SUBJECTS.find(s => s.id === id);
  const yearLabel = y => (y === 4 ? "Final year" : `${y}${y === 1 ? "st" : y === 2 ? "nd" : "rd"} year`);
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const fmtDate = ts => new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  let notes = (() => { const n = parse(K.notes, []); return Array.isArray(n) ? n.filter(x => x && typeof x.body === "string") : []; })();
  const persist = () => { save(K.notes, notes); window.AshUI.refreshToday(); };
  let tab = "mine", editingId = null;
  const expanded = new Set();

  const lectureNotes = () => {
    const obj = parse(LECTURE_KEY, {});
    return Object.entries(obj).filter(([, v]) => typeof v === "string" && v.trim()).map(([key, body]) => {
      const [sid, idx] = key.split("::"), i = Number(idx), s = subj(sid);
      return { id: key, sub: s ? sid : "", idx: i, topic: s && s.topics[i] ? s.topics[i] : `Lecture ${i + 1}`, body, title: "" };
    });
  };

  /* ---------- composer ---------- */
  function subjectGroups(selected) {
    let html = `<option value="">General (no subject)</option>`;
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
  function fillSelects(sub, topic) {
    $("nSubject").innerHTML = subjectGroups(sub);
    $("nTopic").innerHTML = topicOptions(sub, topic);
    $("nTopic").disabled = !sub;
  }
  $("nSubject").addEventListener("change", () => { $("nTopic").innerHTML = topicOptions($("nSubject").value, ""); $("nTopic").disabled = !$("nSubject").value; saveDraft(); });

  let draftTimer = 0;
  function saveDraft() {
    if (editingId) return;
    const d = { sub: $("nSubject").value, topic: $("nTopic").value, title: $("nTitle").value, body: $("nBody").value };
    if (!d.title.trim() && !d.body.trim()) { try { localStorage.removeItem(DRAFT); } catch { /* ignore */ } $("draftStatus").textContent = ""; return; }
    save(DRAFT, d);
    $("draftStatus").textContent = "Draft saved";
    clearTimeout(draftTimer); draftTimer = setTimeout(() => { $("draftStatus").textContent = ""; }, 1800);
  }
  ["nTitle", "nBody", "nTopic"].forEach(id => $(id).addEventListener("input", saveDraft));
  $("nTopic").addEventListener("change", saveDraft);

  document.querySelectorAll("[data-starter]").forEach(b => b.addEventListener("click", () => {
    const ta = $("nBody"), v = ta.value;
    const gap = !v ? "" : v.endsWith("\n\n") ? "" : v.endsWith("\n") ? "\n" : "\n\n";
    ta.value = v + gap + b.dataset.starter + ":\n";
    ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
    saveDraft();
  }));

  function resetForm() {
    editingId = null;
    $("nTitle").value = ""; $("nBody").value = "";
    $("formTitle").textContent = "What did you retain?";
    $("nSubmit").textContent = "Save note"; $("nCancel").hidden = true;
  }
  $("noteForm").addEventListener("submit", e => {
    e.preventDefault();
    const body = $("nBody").value.trim();
    if (!body) { toast("Write something first, even one line."); $("nBody").focus(); return; }
    const sub = $("nSubject").value, topic = sub ? $("nTopic").value : "", title = $("nTitle").value.trim();
    const now = Date.now();
    if (editingId) {
      const n = notes.find(x => x.id === editingId);
      if (n) Object.assign(n, { sub, topic, title, body, updated: now });
      toast("Note updated");
    } else {
      notes.unshift({ id: uid(), sub, topic, title, body, created: now, updated: now, pinned: false });
      toast("Note saved");
    }
    try { localStorage.removeItem(DRAFT); } catch { /* ignore */ }
    persist(); resetForm(); $("draftStatus").textContent = ""; render();
  });
  $("noteForm").addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); $("noteForm").requestSubmit(); } });
  $("nCancel").addEventListener("click", () => { resetForm(); restoreDraft(); });

  /* ---------- list ---------- */
  const source = () => (tab === "mine" ? notes : lectureNotes());
  function visible() {
    const q = $("noteSearch").value.trim().toLowerCase(), sub = $("noteSubject").value || "all";
    return source().filter(n => {
      if (sub === "general" ? n.sub : sub !== "all" && n.sub !== sub) return false;
      if (!q) return true;
      return ((n.title || "") + " " + n.body + " " + (n.topic || "") + " " + (subj(n.sub)?.name || "")).toLowerCase().includes(q);
    }).sort((a, b) => (tab === "mine" ? (b.pinned - a.pinned) || (b.updated - a.updated) : a.sub.localeCompare(b.sub) || a.idx - b.idx));
  }
  function renderFilter() {
    const sel = $("noteSubject").value || "all";
    const data = source();
    const ids = [...new Set(data.map(n => n.sub).filter(Boolean))];
    let html = `<option value="all">All subjects</option>`;
    if (data.some(n => !n.sub)) html += `<option value="general">General</option>`;
    html += SUBJECTS.filter(s => ids.includes(s.id)).map(s => `<option value="${s.id}">${s.icon} ${esc(s.name)}</option>`).join("");
    $("noteSubject").innerHTML = html;
    $("noteSubject").value = [...$("noteSubject").options].some(o => o.value === sel) ? sel : "all";
  }
  const icon = {
    pin: '<svg viewBox="0 0 24 24"><path d="M9 4h6l-1 6 3 3H7l3-3-1-6Z"/><path d="M12 13v7"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
    del: '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 11v6M14 11v6M6.5 7l.8 12h9.4l.8-12M9.5 7V4.5h5V7"/></svg>',
    card: '<svg viewBox="0 0 24 24"><rect x="3.5" y="7" width="13" height="12.5" rx="2.5"/><path d="M7.5 4.2h11A2 2 0 0 1 20.5 6.2v10.3"/></svg>'
  };
  function cardHtml(n) {
    const s = subj(n.sub), long = n.body.length > 360 || n.body.split("\n").length > 7, open = expanded.has(n.id);
    const mine = tab === "mine";
    let cardHref = "flashcards.html?new=1";
    if (mine && n.sub) { cardHref += "&subject=" + encodeURIComponent(n.sub); const i = s ? s.topics.indexOf(n.topic) : -1; if (i >= 0) cardHref += "&topic=" + i; }
    const actions = mine
      ? `<button class="icon-sm${n.pinned ? " on" : ""}" type="button" data-pin="${n.id}" aria-label="${n.pinned ? "Unpin note" : "Pin note"}" aria-pressed="${!!n.pinned}" title="${n.pinned ? "Unpin" : "Pin to top"}">${icon.pin}</button>
         <a class="icon-sm" href="${cardHref}" aria-label="Make a flashcard" title="Make a flashcard">${icon.card}</a>
         <button class="icon-sm" type="button" data-edit="${n.id}" aria-label="Edit note" title="Edit">${icon.edit}</button>
         <button class="icon-sm" type="button" data-del="${n.id}" aria-label="Delete note" title="Delete">${icon.del}</button>`
      : "";
    const foot = mine
      ? `<time datetime="${new Date(n.updated).toISOString()}">${fmtDate(n.updated)}</time>`
      : `<a class="lecture-note-link" href="lecture.html?subject=${encodeURIComponent(n.sub)}&topic=${n.idx}">Open lecture</a>`;
    return `<article class="note-card${n.pinned ? " pinned" : ""}" data-id="${esc(n.id)}">
      <div class="note-top"><span class="pill">${s ? s.icon + " " + esc(s.name) : "General"}</span></div>
      ${n.title ? `<h3>${esc(n.title)}</h3>` : ""}
      ${n.topic ? `<p class="note-topic">${esc(n.topic)}</p>` : ""}
      <p class="note-body${long && !open ? " clamp" : ""}">${esc(n.body)}</p>
      ${long ? `<button class="note-more" type="button" data-more="${esc(n.id)}">${open ? "Show less" : "Show more"}</button>` : ""}
      <div class="note-foot">${foot}<div class="note-actions">${actions}</div></div>
    </article>`;
  }
  function render() {
    $("statNotes").textContent = notes.length;
    $("statPinned").textContent = notes.filter(n => n.pinned).length;
    $("statLecture").textContent = lectureNotes().length;
    renderFilter();
    const list = visible(), total = source().length;
    $("noteInfo").textContent = total ? `Showing ${list.length} of ${plural(total, "note")}` : "";
    $("exportNotes").disabled = !list.length;
    if (!total) {
      $("noteList").innerHTML = tab === "mine"
        ? `<div class="empty" style="grid-column:1/-1"><strong>No notes yet</strong>Use the box above to write what you remember from your last lecture.</div>`
        : `<div class="empty" style="grid-column:1/-1"><strong>No lecture notes yet</strong>Anything you type in “Quick notes” on a lecture page shows up here.<br><a class="btn" href="index.html#subjects">Browse subjects</a></div>`;
      return;
    }
    if (!list.length) { $("noteList").innerHTML = `<div class="empty" style="grid-column:1/-1"><strong>No matches</strong>Try a different word or subject.</div>`; return; }
    $("noteList").innerHTML = list.map(cardHtml).join("");
  }
  $("noteSearch").addEventListener("input", render);
  $("noteSubject").addEventListener("change", render);

  $("noteList").addEventListener("click", e => {
    const more = e.target.closest("[data-more]"), pin = e.target.closest("[data-pin]"), ed = e.target.closest("[data-edit]"), del = e.target.closest("[data-del]");
    if (more) { const id = more.dataset.more; expanded.has(id) ? expanded.delete(id) : expanded.add(id); render(); }
    if (pin) { const n = notes.find(x => x.id === pin.dataset.pin); if (n) { n.pinned = !n.pinned; persist(); render(); } }
    if (ed) {
      const n = notes.find(x => x.id === ed.dataset.edit); if (!n) return;
      editingId = n.id; fillSelects(n.sub, n.topic);
      $("nTitle").value = n.title || ""; $("nBody").value = n.body;
      $("formTitle").textContent = "Edit note"; $("nSubmit").textContent = "Save changes"; $("nCancel").hidden = false;
      $("draftStatus").textContent = "";
      window.scrollTo({ top: 0, behavior: "smooth" }); $("nBody").focus({ preventScroll: true });
    }
    if (del) {
      const i = notes.findIndex(x => x.id === del.dataset.del); if (i < 0) return;
      const [gone] = notes.splice(i, 1);
      if (editingId === gone.id) { resetForm(); restoreDraft(); }
      persist(); render();
      toast("Note deleted", { action: { label: "Undo", run: () => { notes.splice(i, 0, gone); persist(); render(); } }, ms: 6000 });
    }
  });

  /* ---------- tabs ---------- */
  document.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => {
    tab = b.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach(x => x.setAttribute("aria-selected", String(x === b)));
    $("composerView").hidden = tab !== "mine";
    $("noteSubject").value = "all"; $("noteSearch").value = "";
    render();
  }));

  /* ---------- export ---------- */
  $("exportNotes").addEventListener("click", () => {
    const list = visible(); if (!list.length) return;
    const md = "# Asharchives notes\n\n" + list.map(n => {
      const s = subj(n.sub);
      const meta = [s ? s.name : "General", n.topic, n.updated ? fmtDate(n.updated) : ""].filter(Boolean).join(" · ");
      return `## ${n.title || n.topic || "Note"}\n*${meta}*\n\n${n.body}\n`;
    }).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    a.download = tab === "mine" ? "asharchives-notes.md" : "asharchives-lecture-notes.md";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(`Exported ${plural(list.length, "note")}`);
  });

  window.addEventListener("storage", e => {
    if (e.key === K.notes) { const n = parse(K.notes, []); notes = Array.isArray(n) ? n : []; render(); }
    if (e.key === LECTURE_KEY) render();
  });

  /* ---------- start up ---------- */
  function restoreDraft() {
    const d = parse(DRAFT, null);
    if (d && (d.title || d.body)) {
      fillSelects(d.sub || "", d.topic || "");
      $("nTitle").value = d.title || ""; $("nBody").value = d.body || "";
      $("draftStatus").textContent = "Draft restored";
    } else fillSelects("", "");
  }
  restoreDraft();
  render();
})();
