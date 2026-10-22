/* Asharchives — glass + MBBS motion layer.
   Adds: a scrolling ECG heartbeat strip, floating medical symbols in the background,
   and a soft light that follows the cursor across glass cards.
   Safe to delete: the pages still work without it. */
(() => {
  "use strict";
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ECG heartbeat: one 1000-unit strip of five beats. Two identical copies scroll seamlessly.
  const beats = [];
  for (let k = 0; k < 5; k++) {
    const o = k * 200;
    beats.push(`L${o+60} 30 L${o+68} 30 L${o+74} 18 L${o+82} 44 L${o+90} 4 L${o+98} 36 L${o+104} 30 L${o+200} 30`);
  }
  const ecgPath = "M0 30 " + beats.join(" ");
  const ecgSvg = `<svg viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true"><path vector-effect="non-scaling-stroke" d="${ecgPath}"/></svg>`;
  document.querySelectorAll("[data-ecg]").forEach(el => {
    el.innerHTML = `<div class="ecg-track">${ecgSvg}${ecgSvg}</div>`;
  });

  // Floating medical symbols (crosses and capsules) behind the page.
  const layer = document.createElement("div");
  layer.className = "med-bg";
  layer.setAttribute("aria-hidden", "true");
  const cross = `<svg viewBox="0 0 24 24"><path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z"/></svg>`;
  // [type, size px, left %, top %, delay s, duration s]
  const items = [
    ["cross", 26, 6, 14, 0, 9], ["pill", 16, 18, 72, 2, 11], ["cross", 18, 86, 18, 1, 8],
    ["pill", 14, 92, 60, 3, 12], ["cross", 34, 72, 84, 0.5, 10], ["cross", 14, 40, 8, 4, 9],
    ["pill", 18, 52, 46, 1.5, 13], ["cross", 22, 12, 88, 2.5, 8.5]
  ];
  items.forEach(([type, size, left, top, delay, dur]) => {
    const span = document.createElement("span");
    span.className = type;
    span.style.cssText = `--s:${size}px;left:${left}%;top:${top}%;animation-delay:${delay}s;--d:${dur}s`;
    if (type === "cross") span.innerHTML = cross;
    layer.appendChild(span);
  });
  document.body.appendChild(layer);

  // Cursor glare on glass surfaces (event delegation, so dynamically rendered cards work too).
  if (!reduce) {
    const sel = ".subject-card,.hero-card,.course-hero,.daily-card,.topic-item,.educator-banner";
    document.addEventListener("pointermove", e => {
      const el = e.target.closest && e.target.closest(sel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }
})();
