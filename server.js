const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "resumes.json");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function readResumes() {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error("Could not read data/resumes.json. Check that it contains valid JSON.");
  }
}

function writeResumes(resumes) {
  ensureDataFile();
  const tempFile = DATA_FILE + ".tmp";
  fs.writeFileSync(tempFile, JSON.stringify(resumes, null, 2), "utf8");
  fs.renameSync(tempFile, DATA_FILE);
}

function cleanResume(body) {
  const fields = ["title", "name", "email", "phone", "location", "summary", "skills", "education", "experience", "projects", "template"];
  const result = {};
  for (const field of fields) {
    const value = body[field];
    result[field] = typeof value === "string" ? value.trim().slice(0, 12000) : "";
  }
  result.title = result.title || (result.name ? result.name + "'s Resume" : "Untitled Resume");
  result.template = ["modern", "classic", "minimal"].includes(result.template) ? result.template : "modern";
  return result;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Resume Builder API is running" });
});

app.get("/api/resumes", (req, res) => {
  try {
    const resumes = readResumes().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/resumes/:id", (req, res) => {
  const resume = readResumes().find(item => item.id === req.params.id);
  if (!resume) return res.status(404).json({ error: "Resume not found" });
  res.json(resume);
});

app.post("/api/resumes", (req, res) => {
  try {
    const resumes = readResumes();
    const data = cleanResume(req.body || {});
    if (!data.name) return res.status(400).json({ error: "Please enter your name before saving." });
    const now = new Date().toISOString();
    const resume = { id: crypto.randomUUID(), ...data, createdAt: now, updatedAt: now };
    resumes.push(resume);
    writeResumes(resumes);
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/resumes/:id", (req, res) => {
  try {
    const resumes = readResumes();
    const index = resumes.findIndex(item => item.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Resume not found" });
    const data = cleanResume(req.body || {});
    if (!data.name) return res.status(400).json({ error: "Please enter your name before saving." });
    resumes[index] = { ...resumes[index], ...data, updatedAt: new Date().toISOString() };
    writeResumes(resumes);
    res.json(resumes[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/resumes/:id", (req, res) => {
  try {
    const resumes = readResumes();
    const updated = resumes.filter(item => item.id !== req.params.id);
    if (updated.length === resumes.length) return res.status(404).json({ error: "Resume not found" });
    writeResumes(updated);
    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  ensureDataFile();
  console.log(`\nResume Builder is running at http://localhost:${PORT}`);
  console.log("Press Ctrl + C to stop the server.\n");
});