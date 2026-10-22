(() => {
  "use strict";
  const SUBJECTS = [
    {id:"anatomy",name:"Anatomy",year:1,icon:"🦴",desc:"Structure, regions and clinical anatomy",topics:["Introduction to anatomy","Upper limb: overview","Brachial plexus","Thorax: overview","Heart and pericardium","Lungs and pleura","Abdomen: overview","Portal system","Pelvis and perineum","Head and neck overview","Cranial nerves","Clinical anatomy revision", "Test lecture"]},
    {id:"physiology",name:"Physiology",year:1,icon:"🫀",desc:"How the human body functions",topics:["Cell physiology and transport","Blood: composition and functions","Haemostasis","Nerve and muscle","Cardiac cycle","ECG basics","Blood pressure regulation","Respiratory mechanics","Oxygen transport","Renal clearance","Endocrine physiology","Integrated revision"]},
    {id:"biochemistry",name:"Biochemistry",year:1,icon:"🧬",desc:"Molecules, metabolism and enzymes",topics:["Enzymes and kinetics","Carbohydrate metabolism","Glycolysis and TCA cycle","Lipid metabolism","Amino acid metabolism","Vitamins","Molecular biology","Liver function tests","Renal function tests","Clinical biochemistry revision"]},
    {id:"pathology",name:"Pathology",year:2,icon:"🔬",desc:"Disease mechanisms, morphology and clinicopathological correlation",topics:["Cell injury and adaptation","Acute and chronic inflammation","Tissue repair and healing","Haemodynamic disorders","Genetic disorders","Immunopathology","Neoplasia: introduction","Anaemia: approach","Leukaemia overview","Lymph node pathology","Lung pathology","Renal pathology","Liver pathology","General pathology revision"]},
    {id:"pharmacology",name:"Pharmacology",year:2,icon:"💊",desc:"Drug actions, mechanisms and rational therapeutics",topics:["Introduction and Routes of Drug Administration","Pharmacokinetics: Absorption","Pharmacokinetics: Distribution","Pharmacokinetics: Metabolism","Pharmacokinetics: Excretion","Kinetics of Elimination","Pharmacodynamics: Introduction and Enzyme Inhibitors","Pharmacodynamics: Receptors","Dose Response Curve","Clinical Trials and Pharmacovigilance","Factors Affecting Drug Action","Combined effect of Drugs","Practicals in General Pharmacology","Basics and Cholinergic Drugs","Anti-Cholinergic Drugs","Adrenergic Drugs","Anti-Adrenergic Drugs","Glucoma","Practicals in ANS","Histamine and Serotonin","Migraine","PG and NSAIDs","Gout and Rheumatoid Arthritis","Congestive Heart Failure","Ischemic Heart Disease","Drug Used in Hypertension","Anti-Arrythmic Drugs","Anti-Dyslipidemic","Diuretics","Pituitary Hypothalamic System","Thyroid","Pancreas","Adrenal","Osteoporosis","Sex Hormones","Oral Contraceptives","Sedative Hypnotics","Neurodegenerative Diseases","Anti-Epileptic Drug","Anti-Psychotic Drugs","Drugs for Mania and Depression","Drugs of Abuse","Local Anaesthetics and Skeletal Muscle Relaxant","General Anaesthetics","Drugs Affecting Blood Flow","Drugs Affecting Cells of Blood","Cough and Bronchial Asthma","Gastrointestinal Tract (GIT)","General Consideration about Anti-Microbial Agents","Drugs Inhibiting Cell Wall Synthesis","AMA Acting by Other Mechanisms","Tuberculosis and Leprosy","Anti-Viral Drugs","Anti-Fungal Drugs","Malaria and Other Parasites","Cytotoxic Drugs","Targeted Anti-Cancer Drugs","Immunosuppressant Drugs","Monoclonal Antibodies","Drug Interactions and Antidotes","Miscellaneous Topics","New Drugs"]},
    {id:"microbiology",name:"Microbiology",year:2,icon:"🦠",desc:"Microbes, infectious diseases and laboratory diagnosis",topics:["Sterilisation and disinfection","Immunity and hypersensitivity","Staphylococcus and Streptococcus","Mycobacterium tuberculosis","Enteric infections","Hepatitis viruses","HIV infection","Malaria","Leishmaniasis","Dermatophytes","Systemic mycoses","Hospital-acquired infections","Antimicrobial resistance","Microbiology revision"]},
    {id:"forensic-medicine",name:"Forensic Medicine",year:2,icon:"⚖️",desc:"Medical law, ethics and forensic practice",topics:["Definitions in Forensic Medicine","Blunt Trauma Injuries","Sharp Trauma Injuries","Regional Injuries : Part 1","Regional Injuries : Part 2","Thermal Injuries","Proximal Ballistics","Intermediate and Terminal Ballistics : Part 1","Intermediate and Terminal Ballistics : Part 2","Electrical Injuries, Explosion Injuries and Torture Methods","Transportation Injuries","Indian Legal System","Medical Ethics","Medical Negligence","Consent in Medical Practice","Autopsy Procedures","Early Postmortem Changes","Late Postmortem Changes","Human Identification : Part 1","Human Identification : Part 2","Human Identification : Part 3","Hanging","Strangulation","Suffocation","Drowning","Impotence, Virginity and Delivery","Abortion","Infant Deaths and Child Abuse","Sexual Offences","General Toxicology","Duties of a Doctor in a Case of Poisoning","Corrosive Poisons","Metallic Irritants","Non-Metallic Irritants","Organic Irritants","Neurotoxic Poisons: Deliriants","Neurotoxic Poisons: Inebriants","Neurotoxic Poisons: Somniferous and Spinal Poisons","Asphyxiants and Cardiac Poisons","Agricultural Poisons","Forensic Psychiatry","Trace Evidence","Acts and Legal Sections of Importance"]},
    {id:"community-medicine",name:"Community Medicine",year:2,icon:"🌍",desc:"Epidemiology, prevention and public health",topics:["Health and disease concepts","Epidemiology basics","Screening tests","Biostatistics","Communicable disease control","Immunisation","Nutrition","National health programmes","Environment and sanitation","Demography","Occupational health","PSM revision"]},
    {id:"ent",name:"ENT",year:3,icon:"👂",desc:"Ear, nose, throat and head-neck disorders",topics:["Ear examination","Otitis media","Hearing loss","Vertigo","Nasal obstruction","Sinusitis","Pharynx and larynx","ENT revision"]},
    {id:"ophthalmology",name:"Ophthalmology",year:3,icon:"👁️",desc:"Eye examination, disease and vision care",topics:["Ocular examination","Refractive errors","Cataract","Glaucoma","Uveitis","Retinal disorders","Red eye approach","Ophthalmology revision"]},
    {id:"general-medicine",name:"General Medicine",year:3,icon:"🩺",desc:"Adult medicine and clinical care",topics:["History and examination","Approach to fever","Anaemia","Hypertension","Diabetes mellitus","Ischaemic heart disease","Heart failure","Asthma and COPD","Pneumonia","Chronic kidney disease","Liver disease","Stroke","Thyroid disorders","Rheumatology overview","Emergency medicine","Medicine revision"]},
    {id:"general-surgery",name:"General Surgery",year:3,icon:"🩹",desc:"Surgical principles, emergencies and common conditions",topics:["Surgical history and examination","Wound healing","Shock","Fluid and electrolytes","Thyroid swelling","Breast diseases","Hernia","Acute abdomen","Appendicitis","Intestinal obstruction","Gallstones","Burns","Trauma","Surgery revision"]},
    {id:"obgyn",name:"Obstetrics & Gynaecology",year:3,icon:"🤰",desc:"Pregnancy, childbirth and reproductive health",topics:["Normal pregnancy","Antenatal care","Labour and delivery","Postpartum care","Hypertensive disorders of pregnancy","Antepartum haemorrhage","Family planning","Menstrual disorders","Fibroid uterus","Cervical cancer","Infertility overview","OBGYN revision"]},
    {id:"paediatrics",name:"Paediatrics",year:3,icon:"🧸",desc:"Child health, development and common paediatric illness",topics:["Growth and development","Newborn examination","Neonatal jaundice","Breastfeeding and nutrition","Immunisation","Pneumonia in children","Diarrhoeal disease","Congenital heart disease","Paediatric emergencies","Paediatrics revision"]},
    {id:"orthopaedics",name:"Orthopaedics",year:4,icon:"🦴",desc:"Musculoskeletal conditions, fractures and trauma",topics:["Fracture healing","Fracture principles","Upper limb fractures","Lower limb fractures","Spinal injuries","Osteomyelitis","Arthritis","Orthopaedics revision"]},
    {id:"dermatology",name:"Dermatology",year:4,icon:"🧴",desc:"Skin, hair, nail and sexually transmitted disorders",topics:["Approach to skin lesions","Eczema and dermatitis","Psoriasis","Acne","Fungal skin infections","Bacterial and viral skin infections","STI overview","Dermatology revision"]},
    {id:"psychiatry",name:"Psychiatry",year:4,icon:"🧠",desc:"Mental health, diagnosis and treatment principles",topics:["Psychiatric history","Depressive disorders","Bipolar disorder","Schizophrenia","Anxiety disorders","Substance use disorders","Psychiatric emergencies","Psychiatry revision"]},
    {id:"anaesthesia",name:"Anaesthesia",year:4,icon:"💉",desc:"Perioperative medicine, airway and pain management",topics:["Pre-anaesthetic assessment","Airway management","General anaesthesia","Regional anaesthesia","Local anaesthetics","Monitoring","CPR and resuscitation","Anaesthesia revision"]},
    {id:"radiology",name:"Radiology",year:4,icon:"🩻",desc:"Imaging basics and systematic interpretation",topics:["Imaging modalities","Chest X-ray approach","Abdominal X-ray","Ultrasound basics","CT basics","MRI basics","Contrast and safety","Radiology revision"]}
  ];
  const $ = id => document.getElementById(id);
  const parse = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const todayKey = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  let completed = parse("asharrow-completed", []);
  let saved = parse("asharrow-saved", []);
  let notes = parse("asharrow-notes", {});
  const params = new URLSearchParams(location.search);
  const requested = (params.get("subject") || "anatomy").toLowerCase();
  const subject = SUBJECTS.find(s => s.id === requested) || SUBJECTS[0];
  let selectedTopic = 0;
  const topicKey = (index) => `${subject.id}::${index}`;
  const completionKey = index => `${subject.id}::${index}::${todayKey()}`;
  // Keep theme consistent across both pages.
  function setTheme(theme){document.documentElement.dataset.theme=theme;localStorage.setItem("asharrow-theme",theme);}
  const initialTheme = localStorage.getItem("asharrow-theme");
  setTheme(initialTheme || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  $("themeToggle").addEventListener("click",()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));

  const yearLabel = subject.year===4 ? "Final year MBBS" : `${subject.year}${subject.year===1?"st":subject.year===2?"nd":"rd"} year MBBS`;
  document.title = `${subject.name} — Asharchives`;
  $("breadcrumbSubject").textContent = subject.name;
  $("courseTitle").textContent = subject.name;
  $("courseDescription").textContent = subject.desc + ". Select a topic from the playlist to start learning.";
  $("courseYear").textContent = yearLabel.toUpperCase();
  $("topicCount").textContent = `${subject.topics.length} topics`;
  $("courseEmoji").textContent = subject.icon;
  $("playlistCount").textContent = subject.topics.length;

  function isCompleted(index){ return completed.some(x=>x.startsWith(topicKey(index)+"::")); }
  function renderProgress(){
    const count=subject.topics.filter((_,i)=>isCompleted(i)).length;
    const pct=Math.round(count/subject.topics.length*100);
    $("progressText").textContent=pct+"%";
    $("progressBar").style.width=pct+"%";
  }
  function renderPlaylist(){
    const query=$("lectureSearch").value.trim().toLowerCase();
    const matches=subject.topics.map((title,index)=>({title,index})).filter(t=>t.title.toLowerCase().includes(query));
    $("playlistList").innerHTML=matches.length?matches.map(({title,index})=>`<button class="topic-item ${index===selectedTopic?"active":""} ${isCompleted(index)?"completed":""}" type="button" data-topic="${index}"><span class="topic-number">${isCompleted(index)?"✓":String(index+1).padStart(2,"0")}</span><span class="topic-copy"><strong>${title}</strong><span>${isCompleted(index)?"Completed":"Lecture topic"} · ${index===selectedTopic?"Selected":"Tap to open"}</span></span><span class="topic-play">${index===selectedTopic?"▶":"›"}</span></button>`).join(""):`<p class="small-muted">No topics match that search.</p>`;
    $("playlistList").querySelectorAll("[data-topic]").forEach(button=>button.addEventListener("click",()=>{selectTopic(Number(button.dataset.topic));$("videoFrame").scrollIntoView({block:"nearest",behavior:"smooth"});}));
  }
  // ---- Video player: YouTube, Google Drive, Vimeo, direct video files, or any link ----
  // Links pasted by the student are saved on this device and win over videos.js.
  const VIDEOS = window.ASHARCHIVES_VIDEOS || {};
  const LINKS_KEY = "asharrow-links";
  let userLinks = parse(LINKS_KEY, {});
  const videoKey = index => `${subject.id}::${subject.topics[index]}`;
  let loadedTopic = -1;

  // Turns any supported link into something the page can show.
  // kind "iframe"  -> embedded in the frame (YouTube, Drive, Vimeo, other pages)
  // kind "video"   -> direct .mp4/.webm file, played with the native player
  // kind "external"-> pages that refuse to be embedded (Google Photos); opened in a new tab
  function resolveVideo(raw){
    let s = String(raw || "").trim();
    if(!s) return null;
    if(/^[\w-]{20,}$/.test(s)) s = `https://drive.google.com/file/d/${s}/view`; // bare Drive file ID
    if(!/^https?:\/\//i.test(s)) s = "https://" + s;
    let u; try { u = new URL(s); } catch { return null; }
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname)) return null; // must look like a real domain
    const host = u.hostname.toLowerCase().replace(/^(www|m)\./, "");
    const path = u.pathname;
    const pick = re => { const m = path.match(re); return m ? m[1] : ""; };

    // YouTube: watch?v=, youtu.be/, shorts/, live/, embed/
    if (host === "youtu.be" || host === "youtube.com" || host === "youtube-nocookie.com") {
      const yt = host === "youtu.be" ? path.slice(1).split("/")[0]
        : (u.searchParams.get("v") || pick(/^\/(?:embed|shorts|live|v)\/([\w-]+)/));
      if (/^[\w-]{6,}$/.test(yt || "")) return { kind:"iframe", source:"YouTube", open:s,
        src:`https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1&playsinline=1` };
    }
    // Google Drive: /file/d/ID/view, /open?id=ID, /uc?id=ID
    if (host === "drive.google.com") {
      const id = pick(/\/d\/([\w-]+)/) || u.searchParams.get("id") || "";
      if (/^[\w-]{10,}$/.test(id)) return { kind:"iframe", source:"Google Drive", open:s,
        src:`https://drive.google.com/file/d/${id}/preview` };
      return null;
    }
    // Google Photos: its pages refuse to load inside another site, so open them in a tab
    if (host === "photos.google.com" || host === "photos.app.goo.gl" || (host === "goo.gl" && path.startsWith("/photos")))
      return { kind:"external", source:"Google Photos", open:s };
    // Vimeo
    if (host === "vimeo.com") {
      const id = pick(/\/(\d+)/);
      if (id) return { kind:"iframe", source:"Vimeo", open:s, src:`https://player.vimeo.com/video/${id}` };
    }
    // Direct video file
    if (/\.(mp4|webm|ogg|m4v|mov)$/i.test(path)) return { kind:"video", source:"Direct video", open:s, src:s };
    // Anything else: try to embed it
    return { kind:"iframe", source:host, open:s, src:s };
  }

  function currentLink(){
    return userLinks[videoKey(selectedTopic)] || (VIDEOS[subject.id] || {})[subject.topics[selectedTopic]] || "";
  }
  function stopAll(){
    $("drivePlayer").hidden = true; $("drivePlayer").src = "about:blank";
    const v = $("nativeVideo"); v.pause(); v.removeAttribute("src"); v.load(); v.hidden = true;
    $("externalCard").hidden = true;
  }
  function showPlaceholder(){
    stopAll();
    $("videoToolbar").hidden = true;
    $("videoPlaceholder").hidden = false;
    $("linkInput").value = currentLink();
  }
  function showVideo(res){
    stopAll();
    if(res.kind === "video"){ const v = $("nativeVideo"); v.src = res.src; v.hidden = false; }
    else if(res.kind === "iframe"){ const f = $("drivePlayer"); f.src = res.src; f.hidden = false; }
    else {
      $("externalTitle").textContent = `Watch on ${res.source}`;
      $("externalText").textContent = `${res.source} pages can't be shown inside another website. Tap below to watch it in a new tab, or use a YouTube or Google Drive link for in-page playback.`;
      $("externalOpen").href = res.open;
      $("externalCard").hidden = false;
    }
    $("videoPlaceholder").hidden = true;
    $("videoSource").textContent = `Source: ${res.source}`;
    $("openOriginal").href = res.open;
    $("videoToolbar").hidden = false;
  }
  function loadVideo(){
    if(loadedTopic === selectedTopic) return; // Save / Complete clicks must not restart the video
    loadedTopic = selectedTopic;
    const raw = currentLink();
    const res = resolveVideo(raw);
    $("linkError").hidden = true;
    if(res) showVideo(res);
    else showPlaceholder();
  }
  function renderSelected(){
    const title=subject.topics[selectedTopic];
    $("lectureTitle").textContent=title;
    $("lectureDescription").textContent=`Study notes and video for ${title.toLowerCase()} in ${subject.name}. If you encounter any issue while playing the lecture please wait 5 seconds without touching the screen (Prefer Fullscreen mode) .`;
    const key=topicKey(selectedTopic);
    $("saveButton").classList.toggle("is-saved",saved.includes(key));
    $("saveButton").setAttribute("aria-pressed",String(saved.includes(key)));
    $("saveButton").innerHTML=saved.includes(key)?"♥ <span>Saved</span>":"♡ <span>Save</span>";
    const done=isCompleted(selectedTopic);
    $("completeButton").classList.toggle("done",done);
    $("completeButton").textContent=done?"Completed ✓":"Mark as complete ✓";
    $("lectureNotes").value=notes[key]||"";
    $("notesStatus").textContent="Saved on this device";
    // A video is never silently carried over from a different selected lecture.
    loadVideo();
    renderPlaylist();renderProgress();
  }
  function selectTopic(index){if(index<0||index>=subject.topics.length)return;selectedTopic=index;renderSelected();}
  $("lectureSearch").addEventListener("input",renderPlaylist);
  $("saveButton").addEventListener("click",()=>{
    const key=topicKey(selectedTopic);
    saved=saved.includes(key)?saved.filter(x=>x!==key):[...saved,key];
    localStorage.setItem("asharrow-saved",JSON.stringify(saved));renderSelected();
  });
  $("completeButton").addEventListener("click",()=>{
    const key=completionKey(selectedTopic);
    if(!isCompleted(selectedTopic)){completed=[...completed,key];localStorage.setItem("asharrow-completed",JSON.stringify(completed));}
    renderSelected();
  });
  $("lectureNotes").addEventListener("input",()=>{
    const key=topicKey(selectedTopic);notes[key]=$("lectureNotes").value;localStorage.setItem("asharrow-notes",JSON.stringify(notes));$("notesStatus").textContent="Saving…";
    clearTimeout(window.__asharrowNoteTimer);window.__asharrowNoteTimer=setTimeout(()=>$("notesStatus").textContent="Saved on this device",250);
  });
  $("linkForm").addEventListener("submit", e => {
    e.preventDefault();
    const raw = $("linkInput").value.trim();
    if(!resolveVideo(raw)){
      $("linkError").textContent = "That doesn't look like a valid link. Paste the full address from YouTube, Google Drive, Google Photos or a direct video file.";
      $("linkError").hidden = false;
      return;
    }
    userLinks = { ...userLinks, [videoKey(selectedTopic)]: raw };
    localStorage.setItem(LINKS_KEY, JSON.stringify(userLinks));
    loadedTopic = -1;
    loadVideo();
  });
  // Fullscreen: real fullscreen where the browser allows it, otherwise a full-screen overlay (iPhone Safari)
  (function(){
    const frame = $("videoFrame");
    const expand = () => { frame.classList.add("is-expanded"); document.documentElement.classList.add("player-expanded"); };
    const collapse = () => { frame.classList.remove("is-expanded"); document.documentElement.classList.remove("player-expanded"); };
    const inFs = () => document.fullscreenElement || document.webkitFullscreenElement;
    $("fullscreenBtn").addEventListener("click", () => {
      if(inFs()){ (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      if(frame.classList.contains("is-expanded")){ collapse(); return; }
      const req = frame.requestFullscreen || frame.webkitRequestFullscreen;
      if(!req){ expand(); return; }
      try{ const p = req.call(frame); if(p && p.catch) p.catch(expand); }catch(e){ expand(); }
    });
    $("exitExpanded").addEventListener("click", collapse);
    document.addEventListener("keydown", e => { if(e.key === "Escape") collapse(); });
  })();
  $("changeLink").addEventListener("click", () => { loadedTopic = -1; showPlaceholder(); $("linkInput").focus(); });
  $("shareButton").addEventListener("click",async()=>{
    const url=location.href;
    try{await navigator.clipboard.writeText(url);$("shareButton").textContent="Link copied ✓";}
    catch{prompt("Copy this course link:",url);}
    setTimeout(()=>$("shareButton").textContent="Copy course link ↗",1800);
  });
  const wanted = Number(params.get("topic"));
  selectTopic(Number.isInteger(wanted) && wanted >= 0 && wanted < subject.topics.length ? wanted : 0);
})();
