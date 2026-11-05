(() => {
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 }) : null;
  const sel = ".subject-card,.notes-card,.playlist-card,.topic-card,.stat-card,.feature-card,.section-heading,.qb-card";
  const scan = () => document.querySelectorAll(sel).forEach((el, n) => { if (el.dataset.rv) return; el.dataset.rv = 1; el.style.setProperty("--i", n % 10); el.classList.add("reveal"); io ? io.observe(el) : el.classList.add("in"); });
  const go = () => { scan(); new MutationObserver(scan).observe(document.body, { childList: true, subtree: true }); };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
})();
/* glass dock: sliding highlight pill that follows hover/focus and rests on the active tab */
(() => {
  function setup() {
    const d = document.querySelector(".dock"); if (!d) return false;
    if (d.querySelector(".dock-ind")) return true;
    const tabs = [...d.querySelectorAll(".dock-tab")]; if (!tabs.length) return false;
    const ind = document.createElement("i"); ind.className = "dock-ind"; d.prepend(ind);
    const act = () => d.querySelector(".dock-tab.is-active") || tabs[0];
    const move = t => { ind.style.width = t.offsetWidth + "px"; ind.style.transform = "translateX(" + t.offsetLeft + "px)"; };
    ind.style.transition = "none"; move(act()); void ind.offsetWidth; ind.style.transition = "";
    tabs.forEach(t => { t.addEventListener("pointerenter", () => move(t)); t.addEventListener("focus", () => move(t)); });
    d.addEventListener("pointerleave", () => move(act()));
    addEventListener("resize", () => move(act()));
    return true;
  }
  let n = 0; const iv = setInterval(() => { if (setup() || ++n > 50) clearInterval(iv); }, 100);
})();
