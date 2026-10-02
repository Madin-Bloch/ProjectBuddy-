import express from "express";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { unzipTo, fetchGithubZip, scanProject } from "./scan.js";
import { generatePack, STEPS } from "./generate.js";
import { buildContext, buildContent } from "./content.js";
import { buildDiagrams } from "./diagrams.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DATA = path.join(ROOT, "data");
const PROJECTS = path.join(DATA, "projects");
const TMP = path.join(DATA, "tmp");
const STORE = path.join(DATA, "store.json");

fs.mkdirSync(PROJECTS, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });
if (!fs.existsSync(STORE)) fs.writeFileSync(STORE, "{}");

const app = express();
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.end();
  next();
});

function loadStore() {
  try {
    return JSON.parse(fs.readFileSync(STORE, "utf8"));
  } catch {
    return {};
  }
}

function saveStore(store) {
  fs.writeFileSync(STORE, JSON.stringify(store, null, 2));
}

function id() {
  return "pb_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getProject(pid) {
  const store = loadStore();
  const p = store[pid];
  if (!p) return null;
  return p;
}

function updateProject(pid, patch) {
  const store = loadStore();
  store[pid] = { ...store[pid], ...patch, updatedAt: new Date().toISOString() };
  saveStore(store);
  return store[pid];
}

function publicProject(p) {
  if (!p) return null;
  return {
    id: p.id,
    status: p.status,
    error: p.error || null,
    scan: p.scan || null,
    answers: p.answers || null,
    preview: p.preview || null,
    paid: !!p.paid,
    github: p.github || "",
    files: p.files || [],
    packFiles: p.packFiles || [],
    diagrams: p.diagrams || [],
    progress: p.progress || null,
    steps: STEPS,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "ProjectBuddy" });
});

app.post("/api/projects", async (req, res) => {
  try {
    const { github } = req.body || {};
    if (!github || typeof github !== "string") {
      return res.status(400).json({ error: "Paste a public GitHub URL or upload a zip." });
    }
    const pid = id();
    const dir = path.join(PROJECTS, pid);
    fs.mkdirSync(dir, { recursive: true });
    updateProject(pid, { id: pid, status: "scanning", github: github.trim(), dir, paid: false });
    res.json({ id: pid, status: "scanning" });
    runScanFromGithub(pid, github.trim()).catch((err) => {
      updateProject(pid, { status: "failed", error: err.message || String(err) });
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Could not start scan." });
  }
});

app.post("/api/projects/upload", express.raw({ type: "*/*", limit: "40mb" }), async (req, res) => {
  try {
    if (!req.body || !req.body.length) {
      return res.status(400).json({ error: "Zip file is empty." });
    }
    const pid = id();
    const dir = path.join(PROJECTS, pid);
    fs.mkdirSync(dir, { recursive: true });
    const zipPath = path.join(dir, "source.zip");
    fs.writeFileSync(zipPath, req.body);
    updateProject(pid, { id: pid, status: "scanning", github: "", dir, paid: false });
    res.json({ id: pid, status: "scanning" });
    runScanFromZip(pid, zipPath).catch((err) => {
      updateProject(pid, { status: "failed", error: err.message || String(err) });
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Upload failed." });
  }
});

app.get("/api/projects/:id", (req, res) => {
  const p = getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "Project not found." });
  res.json(publicProject(p));
});

app.post("/api/projects/:id/generate", (req, res) => {
  const p = getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "Project not found." });
  if (p.status !== "scanned" && p.status !== "ready" && p.status !== "failed_generate") {
    return res.status(400).json({ error: "Scan the project first." });
  }
  const answers = req.body?.answers || {};
  updateProject(p.id, {
    status: "generating",
    answers,
    error: null,
    progress: { step: "intelligence", percent: 2, label: "Reading repository evidence" },
  });
  res.json({ id: p.id, status: "generating", progress: { step: "intelligence", percent: 2, label: "Reading repository evidence" } });
  runGenerate(p.id).catch((err) => {
    updateProject(p.id, { status: "failed_generate", error: err.message || String(err) });
  });
});

app.post("/api/projects/:id/section", (req, res) => {
  const p = getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "Project not found." });
  if (p.status !== "ready") return res.status(400).json({ error: "Pack is not ready." });
  const section = String(req.body?.section || "");
  const text = typeof req.body?.text === "string" ? req.body.text : "";
  if (!section) return res.status(400).json({ error: "Missing section." });
  try {
    const preview = { ...(p.preview || {}) };
    if (section === "problem" || section === "future") {
      const answers = { ...(p.answers || {}) };
      if (section === "problem" && text) answers.problem = text;
      if (section === "future" && text) answers.futureWork = text;
      updateProject(p.id, { answers });
    }
    if (section === "report" && text) {
      preview.reportHtml = patchHtml(preview.reportHtml, text);
    }
    if (section === "demo" && text) {
      preview.demoHtml = patchHtml(preview.demoHtml, text);
    }
    updateProject(p.id, { preview });
    res.json({ id: p.id, preview: getProject(p.id).preview, paid: !!p.paid });
  } catch (err) {
    res.status(500).json({ error: err.message || "Could not update section." });
  }
});

app.post("/api/projects/:id/regenerate", (req, res) => {
  const p = getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "Project not found." });
  if (p.status !== "ready" && p.status !== "failed_generate") {
    return res.status(400).json({ error: "Generate the pack first." });
  }
  const section = String(req.body?.section || "all");
  try {
    const ctx = buildContext(p.answers || {}, p.scan, p.github);
    const content = buildContent(ctx);
    const preview = { ...(p.preview || {}) };
    if (section === "all" || section === "report") preview.reportHtml = mdToSimpleHtml("Project Report", content.reportMd, ctx);
    if (section === "all" || section === "viva") preview.viva = content.vivaItems;
    if (section === "all" || section === "demo") preview.demoHtml = mdToSimpleHtml("Demo script", content.demo, ctx);
    if (section === "all" || section === "slides") preview.slides = content.slides;
    if (section === "all" || section === "diagrams") {
      preview.diagrams = buildDiagrams(ctx).map((d) => ({
        id: d.id,
        title: d.title,
        omitted: !!d.omitted,
        svg: d.svg.replace(/^<\?xml[^>]*>\s*/i, ""),
      }));
    }
    preview.suggestions = content.suggestions;
    updateProject(p.id, { preview, answers: p.answers });
    res.json(publicProject(getProject(p.id)));
  } catch (err) {
    res.status(500).json({ error: err.message || "Regenerate failed." });
  }
});

app.post("/api/projects/:id/unlock", (req, res) => {
  const p = getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "Project not found." });
  if (p.status !== "ready") return res.status(400).json({ error: "Pack is not ready." });
  updateProject(p.id, { paid: true, payment: { method: "preview-unlock", amount: 249, currency: "INR" } });
  res.json({ id: p.id, paid: true });
});

app.get("/api/projects/:id/download", (req, res) => {
  const p = getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "Project not found." });
  if (!p.paid) return res.status(402).json({ error: "Unlock the pack first." });
  const zipPath = path.join(p.dir, "projectbuddy-pack.zip");
  if (!fs.existsSync(zipPath)) return res.status(404).json({ error: "Pack zip missing." });
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="ProjectBuddy-pack.zip"');
  fs.createReadStream(zipPath).pipe(res);
});

app.get("/api/projects/:id/file", (req, res) => {
  const p = getProject(req.params.id);
  if (!p) return res.status(404).json({ error: "Project not found." });
  if (p.status !== "ready") return res.status(400).json({ error: "Pack is not ready." });
  const rel = String(req.query.path || "").replace(/^\/+/, "");
  if (!rel || rel.includes("..") || path.isAbsolute(rel)) {
    return res.status(400).json({ error: "Invalid file path." });
  }
  const packRoot = path.join(p.dir, "pack");
  const aliases = {
    "01-project-report.html": "01-report/project-report.html",
    "06-presentation.html": "06-presentation/presentation.html",
  };
  const resolved = aliases[rel] || rel;
  const abs = path.join(packRoot, resolved);
  if (!abs.startsWith(packRoot) || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    return res.status(404).json({ error: "File missing." });
  }
  const download = req.query.download === "1";
  const name = path.basename(rel);
  if (download) {
    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
  }
  const ext = path.extname(name).toLowerCase();
  const types = { ".html": "text/html", ".md": "text/markdown", ".svg": "image/svg+xml", ".txt": "text/plain", ".mmd": "text/plain" };
  res.setHeader("Content-Type", types[ext] || "application/octet-stream");
  fs.createReadStream(abs).pipe(res);
});

app.use(express.static(path.join(ROOT, "frontend", "dist")));
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  const index = path.join(ROOT, "frontend", "dist", "index.html");
  if (fs.existsSync(index)) return res.sendFile(index);
  res.status(404).send("Frontend is not built yet.");
});

async function runScanFromGithub(pid, github) {
  const p = getProject(pid);
  const zipPath = path.join(p.dir, "source.zip");
  const extract = path.join(p.dir, "src");
  await fetchGithubZip(github, zipPath);
  const root = unzipTo(zipPath, extract);
  const scan = scanProject(root);
  if (!scan.ok) {
    updateProject(pid, { status: "rejected", error: scan.reason, scan });
    return;
  }
  updateProject(pid, { status: "scanned", scan });
}

async function runScanFromZip(pid, zipPath) {
  const p = getProject(pid);
  const extract = path.join(p.dir, "src");
  const root = unzipTo(zipPath, extract);
  const scan = scanProject(root);
  if (!scan.ok) {
    updateProject(pid, { status: "rejected", error: scan.reason, scan });
    return;
  }
  updateProject(pid, { status: "scanned", scan });
}

async function runGenerate(pid) {
  const p = getProject(pid);
  const result = await generatePack({
    projectDir: p.dir,
    answers: p.answers || {},
    scan: p.scan,
    github: p.github,
    onProgress: (progress) => updateProject(pid, { progress }),
  });
  const packDir = path.join(p.dir, "pack");
  const zipPath = path.join(p.dir, "projectbuddy-pack.zip");
  try {
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  } catch {
    /* ignore */
  }
  execZip(packDir, zipPath);
  updateProject(pid, {
    status: "ready",
    preview: result.preview,
    files: result.files,
    packFiles: result.packFiles,
    diagrams: result.diagrams,
    progress: { step: "pack", percent: 100, label: "Pack ready" },
  });
}

function patchHtml(full, text) {
  const safe = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\n/g, "<br/>");
  if (!full) return `<p>${safe}</p>`;
  return String(full).replace(/<body[^>]*>[\s\S]*<\/body>/i, `<body><p>${safe}</p></body>`);
}

function mdToSimpleHtml(title, md, ctx) {
  const body = String(md)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "<br/><br/>");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${body}<p>Prepared with ProjectBuddy for ${ctx.student}</p></body></html>`;
}

function execZip(packDir, zipPath) {
  execFileSync("zip", ["-r", "-q", zipPath, "."], { cwd: packDir, timeout: 30000 });
}

const port = Number(process.env.API_PORT || 3001);
app.listen(port, "0.0.0.0", () => {
  console.log(`ProjectBuddy API on ${port}`);
});
