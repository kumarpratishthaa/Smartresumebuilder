const $ = id => document.getElementById(id);
const fields = ["title","name","email","phone","location","summary","skills","education","experience","projects","template"];
let currentId = null;
let savedResumes = [];

function getFormData() {
  const data = {};
  fields.forEach(field => data[field] = $(field).value);
  return data;
}
function setFormData(data = {}) {
  fields.forEach(field => { $(field).value = data[field] || (field === "template" ? "modern" : ""); });
  currentId = data.id || null;
  updatePreview();
}
function updatePreview() {
  const d = getFormData();
  $("pName").textContent = d.name || "Your Name";
  const contact = [d.email, d.phone, d.location].filter(Boolean).join("  ·  ");
  $("pContact").textContent = contact || "Email · Phone · Location";
  $("pSummary").textContent = d.summary || "Your professional summary will appear here.";
  $("pEducation").textContent = d.education || "Your education details will appear here.";
  $("pExperience").textContent = d.experience || "Your experience will appear here.";
  $("pProjects").textContent = d.projects || "Your projects will appear here.";
  $("pSkills").innerHTML = "";
  const skills = d.skills.split(",").map(s => s.trim()).filter(Boolean);
  if (skills.length) skills.forEach(skill => {
    const span = document.createElement("span");
    span.className = "skill"; span.textContent = skill; $("pSkills").appendChild(span);
  });
  else { const span = document.createElement("span"); span.className = "skill"; span.textContent = "Your skills"; $("pSkills").appendChild(span); }
  $("resumePreview").className = "resume-paper " + d.template;
  ["summary","skills","education","experience","projects"].forEach(key => {
    const value = d[key];
    $(key + "Section").classList.toggle("hidden", !value.trim());
  });
}
async function api(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  const result = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(result?.error || "Something went wrong");
  return result;
}
function showMessage(message, error = false) {
  $("message").textContent = message;
  $("message").style.color = error ? "#b64e4e" : "#28664f";
}
async function saveResume() {
  const data = getFormData();
  if (!data.name.trim()) { showMessage("Please enter your full name before saving.", true); $("name").focus(); return; }
  try {
    const result = currentId
      ? await api("/api/resumes/" + encodeURIComponent(currentId), { method: "PUT", body: JSON.stringify(data) })
      : await api("/api/resumes", { method: "POST", body: JSON.stringify(data) });
    currentId = result.id;
    $("title").value = result.title;
    showMessage("Saved successfully! Your resume is stored on the server.");
    await loadResumes();
  } catch (error) { showMessage(error.message, true); }
}
async function loadResumes() {
  try {
    savedResumes = await api("/api/resumes");
    $("resumeCount").textContent = savedResumes.length;
    renderSaved();
  } catch (error) { console.error(error); }
}
function renderSaved() {
  const list = $("savedList");
  list.innerHTML = "";
  $("emptyState").classList.toggle("hidden", savedResumes.length > 0);
  savedResumes.forEach(resume => {
    const card = document.createElement("article");
    card.className = "resume-card";
    const icon = document.createElement("div"); icon.className = "card-icon"; icon.textContent = "▤";
    const title = document.createElement("h3"); title.textContent = resume.title || resume.name + "'s Resume";
    const detail = document.createElement("p");
    const date = new Date(resume.updatedAt).toLocaleDateString();
    detail.textContent = `${resume.name} · Updated ${date}`;
    const actions = document.createElement("div"); actions.className = "card-actions";
    const edit = makeButton("Edit", () => openResume(resume.id));
    const duplicate = makeButton("Duplicate", () => duplicateResume(resume));
    const remove = makeButton("Delete", () => deleteResume(resume.id), true);
    actions.append(edit, duplicate, remove);
    card.append(icon, title, detail, actions); list.appendChild(card);
  });
}
function makeButton(label, action, danger = false) {
  const button = document.createElement("button");
  button.className = "small-btn" + (danger ? " danger" : "");
  button.textContent = label; button.addEventListener("click", action); return button;
}
async function openResume(id) {
  try {
    const resume = await api("/api/resumes/" + encodeURIComponent(id));
    setFormData(resume); showView("builder"); showMessage("Loaded saved resume. Make changes and click Save resume.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) { alert(error.message); }
}
async function deleteResume(id) {
  if (!confirm("Delete this saved resume? This cannot be undone.")) return;
  try { await api("/api/resumes/" + encodeURIComponent(id), { method: "DELETE" }); await loadResumes(); }
  catch (error) { alert(error.message); }
}
async function duplicateResume(resume) {
  const copy = { ...resume, id: undefined, title: (resume.title || resume.name + "'s Resume") + " (Copy)" };
  delete copy.id; delete copy.createdAt; delete copy.updatedAt;
  try { await api("/api/resumes", { method: "POST", body: JSON.stringify(copy) }); await loadResumes(); }
  catch (error) { alert(error.message); }
}
function showView(view) {
  const builder = view === "builder";
  $("builderView").classList.toggle("hidden", !builder);
  $("savedView").classList.toggle("hidden", builder);
  $("builderTab").classList.toggle("active", builder);
  $("savedTab").classList.toggle("active", !builder);
  if (!builder) loadResumes();
}
function clearForm() {
  if (!confirm("Clear the form and start a new resume? Unsaved changes will be lost.")) return;
  setFormData(); showMessage(""); window.scrollTo({ top: 0, behavior: "smooth" });
}

fields.forEach(field => $(field).addEventListener("input", updatePreview));
$("saveBtn").addEventListener("click", saveResume);
$("downloadBtn").addEventListener("click", () => {
  updatePreview();
  if (!$("name").value.trim()) { showMessage("Enter your name before downloading.", true); return; }
  window.print();
});
$("newBtn").addEventListener("click", clearForm);
$("createNewBtn").addEventListener("click", () => { setFormData(); showView("builder"); showMessage(""); });
$("emptyCreateBtn").addEventListener("click", () => { setFormData(); showView("builder"); });
$("builderTab").addEventListener("click", () => showView("builder"));
$("savedTab").addEventListener("click", () => showView("saved"));
updatePreview();
loadResumes();