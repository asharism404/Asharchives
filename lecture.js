(() => {
  "use strict";
  const SUBJECTS = [
    {id:"anatomy",name:"Anatomy",year:1,icon:"🦴",desc:"Structure, regions and clinical anatomy",topics:["Introduction to anatomy","Upper limb: overview","Brachial plexus","Thorax: overview","Heart and pericardium","Lungs and pleura","Abdomen: overview","Portal system","Pelvis and perineum","Head and neck overview","Cranial nerves","Clinical anatomy revision"]},
    {id:"physiology",name:"Physiology",year:1,icon:"🫀",desc:"How the human body functions",topics:["Cell physiology and transport","Blood: composition and functions","Haemostasis","Nerve and muscle","Cardiac cycle","ECG basics","Blood pressure regulation","Respiratory mechanics","Oxygen transport","Renal clearance","Endocrine physiology","Integrated revision"]},
    {id:"biochemistry",name:"Biochemistry",year:1,icon:"🧬",desc:"Molecules, metabolism and enzymes",topics:["Enzymes and kinetics","Carbohydrate metabolism","Glycolysis and TCA cycle","Lipid metabolism","Amino acid metabolism","Vitamins","Molecular biology","Liver function tests","Renal function tests","Clinical biochemistry revision"]},
    {id:"pathology",name:"Pathology",year:2,icon:"🔬",desc:"Disease mechanisms, morphology and clinicopathological correlation",topics:["Cell injury and adaptation","Acute and chronic inflammation","Tissue repair and healing","Haemodynamic disorders","Genetic disorders","Immunopathology","Neoplasia: introduction","Anaemia: approach","Leukaemia overview","Lymph node pathology","Lung pathology","Renal pathology","Liver pathology","General pathology revision"]},
    {id:"pharmacology",name:"Pharmacology",year:2,icon:"💊",desc:"Drug actions, mechanisms and rational therapeutics",topics:["General pharmacology","Pharmacokinetics","Autonomic nervous system","Cholinergic drugs","Adrenergic drugs","Antihypertensives","Diuretics","Antimicrobials overview","Anti-TB drugs","Antimalarial drugs","NSAIDs","Corticosteroids","Adverse drug reactions","Pharmacology revision"]},
    {id:"microbiology",name:"Microbiology",year:2,icon:"🦠",desc:"Microbes, infectious diseases and laboratory diagnosis",topics:["Sterilisation and disinfection","Immunity and hypersensitivity","Staphylococcus and Streptococcus","Mycobacterium tuberculosis","Enteric infections","Hepatitis viruses","HIV infection","Malaria","Leishmaniasis","Dermatophytes","Systemic mycoses","Hospital-acquired infections","Antimicrobial resistance","Microbiology revision"]},
    {id:"forensic-medicine",name:"Forensic Medicine",year:2,icon:"⚖️",desc:"Medical law, ethics and forensic practice",topics:["Introduction and legal procedures","Identification","Thanatology","Mechanical injuries","Asphyxial deaths","Toxicology overview","Medical jurisprudence","Forensic revision"]},
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
    $("playlistList").querySelectorAll("[data-topic]").forEach(button=>button.addEventListener("click",()=>selectTopic(Number(button.dataset.topic))));
  }
  // ---- Video linking: edit videos.js to map each lecture to its Google Drive video ----
  const VIDEOS = window.ASHARCHIVES_VIDEOS || {};
  const driveId = v => { v=String(v||"").trim(); const m=v.match(/\/d\/([\w-]+)/)||v.match(/[?&]id=([\w-]+)/); const id=m?m[1]:v; return /^[\w-]{10,}$/.test(id)?id:""; };
  let loadedTopic = -1;
  function loadVideo(){
    if(loadedTopic===selectedTopic) return; // Save / Complete clicks must not restart the video
    loadedTopic=selectedTopic;
    const id=driveId((VIDEOS[subject.id]||{})[subject.topics[selectedTopic]]);
    const player=$("drivePlayer");
    if(id){player.src=`https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;player.hidden=false;$("videoPlaceholder").hidden=true;}
    else{player.hidden=true;player.removeAttribute("src");$("videoPlaceholder").hidden=false;}
  }
  function renderSelected(){
    const title=subject.topics[selectedTopic];
    $("lectureTitle").textContent=title;
    $("lectureDescription").textContent=`Study notes and video for ${title.toLowerCase()} in ${subject.name}. Add your authorised lecture video using its Google Drive file ID. This topic list is a starter template and should be checked against your syllabus.`;
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
  $("addDriveButton").addEventListener("click",()=>{
    const id=prompt("Paste the Google Drive file ID (not the full URL). Make sure the video is shared so intended viewers can access it.");
    if(id===null)return;
    const clean=id.trim().replace(/^.*\/d\//,"").split(/[/?#]/)[0];
    if(!/^[a-zA-Z0-9_-]{10,}$/.test(clean)){alert("That doesn't look like a Drive file ID. Open the file URL and copy the long ID between /d/ and /view.");return;}
    $("drivePlayer").src=`https://drive.google.com/file/d/${encodeURIComponent(clean)}/preview`;
    $("drivePlayer").hidden=false;$("videoPlaceholder").hidden=true;
  });
  $("shareButton").addEventListener("click",async()=>{
    const url=location.href;
    try{await navigator.clipboard.writeText(url);$("shareButton").textContent="Link copied ✓";}
    catch{prompt("Copy this course link:",url);}
    setTimeout(()=>$("shareButton").textContent="Copy course link ↗",1800);
  });
  selectTopic(0);
})();