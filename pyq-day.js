/* PYQ of the day — one previous-year question on the home page, above the subject selector. */
(() => {
  "use strict";
  const root = document.getElementById("pyqDay");
  if (!root) return;
  const IDS = ["anatomy","physiology","biochemistry","pathology","pharmacology","microbiology","forensic-medicine","community-medicine","ent","ophthalmology","general-medicine","general-surgery","obgyn","paediatrics","orthopaedics","dermatology","psychiatry","anaesthesia","radiology"];
  const KEY = "asharrow-pyqotd";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const today = () => new Date().toISOString().slice(0, 10);
  const cache = {};
  const load = id => cache[id] || (cache[id] = new Promise(res => {
    const s = document.createElement("script");
    s.src = `qbank/pyq/${id}.js`;
    s.onload = () => res((window.ASH_PYQ || {})[id] || []);
    s.onerror = () => res([]);
    document.head.appendChild(s);
  }));
  const meta = id => { const s = (window.ASH_SUBJECTS || []).find(x => x.id === id); return { name: s ? s.name : id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), icon: s ? s.icon : "✦" }; };
  const imgs = a => (a || []).filter(u => /^(https?:\/\/|images\/|data:image\/)/.test(u)).map(u => `<img class="pd-img" src="${esc(u)}" alt="" loading="lazy">`).join("");

  root.addEventListener("error", e => {
    const t = e.target;
    if (t.classList && t.classList.contains("pd-img")) {
      const a = document.createElement("a"); a.href = t.src; a.target = "_blank"; a.rel = "noopener"; a.className = "pd-link";
      a.textContent = "Image could not load — open it in a new tab ↗"; t.replaceWith(a);
    }
  }, true);

  function skeleton() {
    root.innerHTML = `<div class="pd-skel" aria-hidden="true"><i></i><i></i><i></i></div>`;
  }

  function render(id, q) {
    const m = meta(id);
    root.innerHTML = `
      <div class="pd-head">
        <div><p class="eyebrow muted-eyebrow">PYQ OF THE DAY</p><h2>Try this one</h2></div>
        <button class="pd-another" id="pdAnother" type="button" aria-label="Show another question"><span aria-hidden="true">↻</span> Another</button>
      </div>
      <div class="pd-tags"><span class="pd-tag">${esc(m.icon)} ${esc(m.name)}</span>${q.x ? `<span class="pd-tag pd-tag-src">${esc(q.x)}</span>` : ""}</div>
      <div class="pd-q">${esc(q.q)}</div>${imgs(q.i)}
      <div class="pd-opts" role="group" aria-label="Answer options">${q.o.map((o, k) =>
        `<button class="pd-opt" type="button" data-k="${k}" style="--d:${k * 70 + 100}ms"><span class="pd-let">${"ABCD"[k] || k + 1}</span><span class="pd-ot">${esc(o)}</span><span class="pd-mark" aria-hidden="true"></span></button>`).join("")}</div>
      <div id="pdFb" aria-live="polite"></div>
      <a class="pd-link pd-more" href="qbank.html">Practise more in Qbank <span aria-hidden="true">→</span></a>`;
    const opts = [...root.querySelectorAll(".pd-opt")];
    opts.forEach(b => b.onclick = () => {
      const k = +b.dataset.k, ok = k === q.a;
      opts.forEach(x => x.disabled = true);
      if (opts[q.a]) opts[q.a].classList.add("right");
      if (!ok) b.classList.add("wrong");
      root.querySelector("#pdFb").innerHTML = `<div class="pd-exp ${ok ? "is-right" : "is-wrong"}"><b>${ok ? "Correct" : "Not quite"}</b>${esc(q.e || (ok ? "Well done." : "Review this topic."))}${imgs(q.ei)}</div>`;
    });
    root.querySelector("#pdAnother").onclick = () => pick(true);
  }

  async function pick(random) {
    skeleton();
    let id, k;
    const saved = store.get(KEY);
    if (!random && saved && saved.d === today() && IDS.includes(saved.s)) { id = saved.s; k = saved.k; }
    else if (!random) { const h = hash(today()); id = IDS[h % IDS.length]; k = hash(today() + id); }
    else { id = IDS[Math.floor(Math.random() * IDS.length)]; k = Math.floor(Math.random() * 1e9); }
    let list = await load(id);
    if (!list.length) { // subject file failed: try the others
      for (const alt of IDS.filter(x => x !== id)) { list = await load(alt); if (list.length) { id = alt; break; } }
    }
    list = list.filter(q => q && q.q && Array.isArray(q.o) && q.o.length > 1 && typeof q.a === "number");
    if (!list.length) { root.hidden = true; return; }
    const q = list[k % list.length];
    store.set(KEY, { d: today(), s: id, k: k % list.length });
    root.hidden = false; render(id, q);
  }

  pick(false);
})();
