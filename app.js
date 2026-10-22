(() => {
  "use strict";
  const SUBJECTS = [
    {id:"anatomy",name:"Anatomy",year:1,icon:"🦴",color:"blue",desc:"Structure, regions and clinical anatomy",count:12},
    {id:"physiology",name:"Physiology",year:1,icon:"🫀",color:"pink",desc:"How the human body functions",count:12},
    {id:"biochemistry",name:"Biochemistry",year:1,icon:"🧬",color:"purple",desc:"Molecules, metabolism and enzymes",count:10},
    {id:"pathology",name:"Pathology",year:2,icon:"🔬",color:"yellow",desc:"Disease mechanisms and morphology",count:14},
    {id:"pharmacology",name:"Pharmacology",year:2,icon:"💊",color:"green",desc:"Drugs, actions and therapeutics",count:14},
    {id:"microbiology",name:"Microbiology",year:2,icon:"🦠",color:"cyan",desc:"Microbes, infections and immunity",count:14},
    {id:"forensic-medicine",name:"Forensic Medicine",year:2,icon:"⚖️",color:"orange",desc:"Medical law and forensic practice",count:8},
    {id:"community-medicine",name:"Community Medicine",year:2,icon:"🌍",color:"green",desc:"Public health and epidemiology",count:12},
    {id:"ent",name:"ENT",year:3,icon:"👂",color:"pink",desc:"Ear, nose and throat",count:8},
    {id:"ophthalmology",name:"Ophthalmology",year:3,icon:"👁️",color:"blue",desc:"Eye diseases and examination",count:8},
    {id:"general-medicine",name:"General Medicine",year:3,icon:"🩺",color:"cyan",desc:"Adult medicine and clinical care",count:16},
    {id:"general-surgery",name:"General Surgery",year:3,icon:"🩹",color:"yellow",desc:"Surgical principles and practice",count:14},
    {id:"obgyn",name:"Obstetrics & Gynaecology",year:3,icon:"🤰",color:"pink",desc:"Pregnancy and reproductive health",count:12},
    {id:"paediatrics",name:"Paediatrics",year:3,icon:"🧸",color:"purple",desc:"Health and diseases of children",count:10},
    {id:"orthopaedics",name:"Orthopaedics",year:4,icon:"🦴",color:"orange",desc:"Bones, joints and trauma",count:8},
    {id:"dermatology",name:"Dermatology",year:4,icon:"🧴",color:"rose",desc:"Skin, hair and nail disorders",count:8},
    {id:"psychiatry",name:"Psychiatry",year:4,icon:"🧠",color:"purple",desc:"Mental health and behaviour",count:8},
    {id:"anaesthesia",name:"Anaesthesia",year:4,icon:"💉",color:"blue",desc:"Perioperative and pain care",count:8},
    {id:"radiology",name:"Radiology",year:4,icon:"🩻",color:"cyan",desc:"Imaging and interpretation",count:8}
  ];
  const $ = id => document.getElementById(id);
  const safeParse = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  function setTheme(theme) { document.documentElement.dataset.theme = theme; localStorage.setItem("asharrow-theme", theme); }
  const savedTheme = localStorage.getItem("asharrow-theme");
  setTheme(savedTheme || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  $("themeToggle")?.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  const completed = safeParse("asharrow-completed", []);
  const saved = safeParse("asharrow-saved", []);
  const progress = id => {
    const topics = completed.filter(x => x.startsWith(id + "::"));
    const subject = SUBJECTS.find(s => s.id === id);
    return subject ? Math.min(100, Math.round(topics.length / subject.count * 100)) : 0;
  };
  function renderSubjects() {
    const grid = $("subjectGrid"); if (!grid) return;
    const query = ($("subjectSearch")?.value || "").trim().toLowerCase();
    const year = $("yearFilter")?.value || "all";
    const matches = SUBJECTS.filter(s => (s.name + " " + s.desc).toLowerCase().includes(query) && (year === "all" || String(s.year) === year));
    grid.innerHTML = matches.map(s => {
      const pct = progress(s.id);
      const yearLabel = s.year === 4 ? "Final year" : `${s.year}${s.year===1?"st":s.year===2?"nd":"rd"} year`;
      return `<a class="subject-card" href="lecture.html?subject=${encodeURIComponent(s.id)}" aria-label="Open ${s.name}">
        <div class="subject-top"><span class="subject-icon ${s.color}">${s.icon}</span><span class="subject-arrow" aria-hidden="true">↗</span></div>
        <h3>${s.name}</h3><p>${s.desc}</p>
        <div class="subject-bottom"><span>${s.count} lecture topics</span><span class="year-pill">${yearLabel}</span></div>
        <div class="subject-bottom"><span>${pct}% complete</span><span class="progress-track"><span style="width:${pct}%"></span></span></div>
      </a>`;
    }).join("");
    $("emptyState").hidden = matches.length !== 0;
  }
  $("subjectSearch")?.addEventListener("input", renderSubjects);
  $("yearFilter")?.addEventListener("change", renderSubjects);
  document.addEventListener("keydown", e => {
    if (e.key === "/" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)) { e.preventDefault(); $("subjectSearch")?.focus(); }
  });

  function renderActivity() {
    const dates = [...new Set(completed.map(item => item.split("::")[2]).filter(Boolean))].sort();
    const today = new Date(); today.setHours(0,0,0,0);
    const todayKey = dateKey(today);
    const active = new Set(dates);
    let streak = 0;
    const cursor = new Date(today);
    if (!active.has(todayKey)) cursor.setDate(cursor.getDate()-1);
    while (active.has(dateKey(cursor))) { streak++; cursor.setDate(cursor.getDate()-1); }
    $("streakCount").textContent = streak;
    $("completedCount").textContent = completed.length;
    $("savedCount").textContent = saved.length;
    $("streakMessage").textContent = streak ? "Nice work — keep your learning rhythm going." : "Your streak starts when you complete a lecture.";
    const labels = ["S","M","T","W","T","F","S"];
    const days = [];
    for (let i=6;i>=0;i--) { const d=new Date(today); d.setDate(today.getDate()-i); const key=dateKey(d); days.push(`<div class="week-day"><span class="week-dot ${active.has(key)?"active":""}">${active.has(key)?"✓":""}</span><span>${labels[d.getDay()]}</span></div>`); }
    $("weekRow").innerHTML = days.join("");
  }
  function dateKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
  renderSubjects(); renderActivity();
})();