import { useEffect, useMemo, useState } from "react";
import Landing from "./Landing.jsx";

const NAV_LINKS = [
  ["#how", "How it works"],
  ["#pack", "What's included"],
  ["#diagrams", "Diagrams"],
  ["#pricing", "Pricing"],
  ["#faq", "FAQ"],
];

export default function App() {
  const [step, setStep] = useState("home");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [project, setProject] = useState(null);
  const [github, setGithub] = useState("");
  const [drag, setDrag] = useState(false);
  const [tab, setTab] = useState("report");
  const [answers, setAnswers] = useState(emptyAnswers());
  const [editOpen, setEditOpen] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("pb-theme") || "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("pb-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!project?.id) return;
    if (!["scanning", "generating"].includes(project.status)) return;
    const t = setInterval(async () => {
      try {
        const data = await api(`/api/projects/${project.id}`);
        setProject(data);
        if (data.status === "scanned") {
          setAnswers((a) => ({
            ...a,
            modules: data.scan?.modules || [],
            title: a.title || data.scan?.suggestedTitle || guessTitle(data.scan),
            problem: a.problem || data.scan?.suggestedProblem || "",
            futureWork: a.futureWork || data.scan?.suggestedFuture || "",
          }));
          setStep("questions");
          setBusy(false);
        }
        if (data.status === "ready") {
          setStep("preview");
          setTab("report");
          setBusy(false);
        }
        if (["rejected", "failed", "failed_generate"].includes(data.status)) {
          setError(data.error || "Something went wrong.");
          setBusy(false);
        }
      } catch (e) {
        setError(e.message);
        setBusy(false);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [project?.id, project?.status]);

  const stackLine = useMemo(() => {
    const s = project?.scan?.stack;
    if (!s) return "";
    return [s.language, ...(s.frameworks || []), ...(s.database || [])].filter(Boolean).join(" · ");
  }, [project]);

  async function startZip(file) {
    setError("");
    if (!file || !file.name.toLowerCase().endsWith(".zip")) {
      setError("Upload a .zip of your project folder.");
      return;
    }
    setBusy(true);
    setStep("scan");
    try {
      const res = await fetch("/api/projects/upload", {
        method: "POST",
        headers: { "Content-Type": "application/zip" },
        body: file,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setProject(data);
    } catch (e) {
      setError(e.message);
      setBusy(false);
      setStep("home");
    }
  }

  async function startGithub(e) {
    e.preventDefault();
    setError("");
    if (!github.trim()) {
      setError("Paste a public GitHub URL, or upload a zip.");
      return;
    }
    setBusy(true);
    setStep("scan");
    try {
      const data = await api("/api/projects", { method: "POST", json: { github } });
      setProject(data);
    } catch (e) {
      setError(e.message);
      setBusy(false);
      setStep("home");
    }
  }

  async function generate(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    setStep("scan");
    try {
      const data = await api(`/api/projects/${project.id}/generate`, {
        method: "POST",
        json: { answers },
      });
      setProject((p) => ({ ...p, ...data }));
    } catch (e) {
      setError(e.message);
      setBusy(false);
      setStep("questions");
    }
  }

  async function unlockAndDownload() {
    setError("");
    setBusy(true);
    try {
      await api(`/api/projects/${project.id}/unlock`, { method: "POST", json: {} });
      const data = await api(`/api/projects/${project.id}`);
      setProject(data);
      window.location.href = `/api/projects/${project.id}/download`;
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function downloadFile(rel) {
    setError("");
    try {
      if (!project.paid) {
        await api(`/api/projects/${project.id}/unlock`, { method: "POST", json: {} });
        const data = await api(`/api/projects/${project.id}`);
        setProject(data);
      }
      const a = document.createElement("a");
      a.href = `/api/projects/${project.id}/file?path=${encodeURIComponent(rel)}&download=1`;
      a.download = rel.split("/").pop();
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      setError(e.message);
    }
  }

  function reset() {
    setStep("home");
    setError("");
    setProject(null);
    setGithub("");
    setAnswers(emptyAnswers());
  }

  async function regenerate(section) {
    setError("");
    setBusy(true);
    try {
      const data = await api(`/api/projects/${project.id}/regenerate`, { method: "POST", json: { section } });
      setProject(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const preview = project?.preview || {};

  return (
    <div className="shell">
      <div className="topbar">
        <span className="mono">From code to submission</span> — report, diagrams, deck and viva from
        your own repository
      </div>

      <header className="nav">
        <div className="wrap nav-inner">
          <button className="brand" type="button" onClick={reset}>
            <div className="mark">P</div> ProjectBuddy
          </button>
          {step === "home" ? (
            <nav className="nav-links">
              {NAV_LINKS.map(([href, label]) => (
                <a key={href} href={href}>{label}</a>
              ))}
            </nav>
          ) : (
            <nav className="nav-links">
              <button className="btn link" type="button" onClick={reset}>
                ← New project
              </button>
            </nav>
          )}
          <div className="nav-right">
            <button
              className="icon-btn"
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <a className="btn primary" href="#start" onClick={(e) => { if (step !== "home") { e.preventDefault(); reset(); } }}>
              Create project
            </a>
          </div>
        </div>
      </header>

      {step === "home" && (
        <Landing
          github={github}
          setGithub={setGithub}
          drag={drag}
          setDrag={setDrag}
          startZip={startZip}
          startGithub={startGithub}
          error={error}
        />
      )}

      {step === "scan" && (
        <main className="wrap page studio">
          <div className="panel" style={{ maxWidth: 660, margin: "40px auto 0" }}>
            <div className="kicker">{project?.status === "generating" ? "Generating" : "Analyzing"}</div>
            <h2>
              {project?.status === "generating"
                ? "Building your pack from source"
                : "Reading your project"}
            </h2>
            <p className="muted">
              {project?.status === "generating"
                ? (project.progress?.label || "Writing only what the repository supports.")
                : "Detecting languages, frameworks, tables, models and routes. Missing pieces will be omitted."}
            </p>
            <ProgressList project={project} />
            <p><span className="spinner" /> {project?.progress?.percent ? `${project.progress.percent}%` : "Please wait…"}</p>
            {error && <div className="err">{error}</div>}
          </div>
        </main>
      )}

      {step === "questions" && project?.scan && (
        <main className="wrap page studio">
          <div className="panel" style={{ maxWidth: 860, margin: "0 auto" }}>
            <div className="kicker">Scan complete — your project, not a template</div>
            <h2>{project.scan.stackLabel || stackLine || "Project scan"}</h2>
            <p className="muted">
              {project.scan.fileCount} files · {project.scan.tables?.length || 0} tables ·{" "}
              {project.scan.routes?.length || 0} routes · {project.scan.models?.length || 0} models
              {project.scan.confidence != null ? ` · confidence ${Math.round(project.scan.confidence * 100)}%` : ""}
            </p>
            <div className="chips">{(project.scan.modules || []).map((m) => <span className="chip" key={m}>{m}</span>)}</div>
            {!!project.scan.warnings?.length && <div className="warn">{project.scan.warnings.join(" ")}</div>}
            <HealthBlock health={project.scan.health} />
            <EvidenceBlock evidence={project.scan.evidence} />
            <form onSubmit={generate}>
              <div className="form">
                <div><label>Student name</label><input required value={answers.studentName} onChange={(e) => setAnswers({ ...answers, studentName: e.target.value })} /></div>
                <div><label>Enrollment number</label><input required value={answers.enrollment} onChange={(e) => setAnswers({ ...answers, enrollment: e.target.value })} /></div>
                <div><label>College</label><input required value={answers.college} onChange={(e) => setAnswers({ ...answers, college: e.target.value })} /></div>
                <div>
                  <label>Course</label>
                  <select value={answers.course} onChange={(e) => setAnswers({ ...answers, course: e.target.value })}>
                    <option>BCA</option><option>MCA</option><option>BTech</option><option>Diploma</option><option>BSc IT</option>
                  </select>
                </div>
                <div><label>Guide name</label><input value={answers.guide} onChange={(e) => setAnswers({ ...answers, guide: e.target.value })} /></div>
                <div><label>Year</label><input value={answers.year} onChange={(e) => setAnswers({ ...answers, year: e.target.value })} /></div>
                <div className="full"><label>Project title</label><input required value={answers.title} onChange={(e) => setAnswers({ ...answers, title: e.target.value })} /></div>
                <div className="full"><label>Problem statement</label><textarea required value={answers.problem} onChange={(e) => setAnswers({ ...answers, problem: e.target.value })} /></div>
                <div className="full"><label>Future work</label><textarea value={answers.futureWork} onChange={(e) => setAnswers({ ...answers, futureWork: e.target.value })} /></div>
              </div>
              {error && <div className="err">{error}</div>}
              <p style={{ marginTop: 20 }}>
                <button className="btn primary lg" type="submit" disabled={busy}>Generate pack</button>
              </p>
            </form>
          </div>
        </main>
      )}

      {step === "preview" && (
        <main className="wrap page studio">
          <div className="studio-head">
            <div>
              <div className="kicker">Pack ready · grounded in source</div>
              <h2>{preview.title || "Your project pack"}</h2>
              <p className="muted">{preview.student} · {preview.course} · {preview.college} · {preview.stackLabel}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn ghost" onClick={() => regenerate("all")} disabled={busy}>Regenerate pack</button>
              <button className="btn primary" onClick={unlockAndDownload} disabled={busy}>Download all (zip)</button>
            </div>
          </div>
          <HealthBlock health={preview.health || project.scan?.health} />
          <EvidenceBlock evidence={preview.evidence || project.scan?.evidence} />

          <div className="tabs">
            {[
              ["report", "Report"],
              ["diagrams", "Diagrams"],
              ["slides", "PPT"],
              ["viva", "Viva"],
              ["demo", "Demo"],
              ["files", "Files"],
            ].map(([id, label]) => (
              <button key={id} className={`tab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>

          {tab === "report" && (
            <div>
              <SectionBar onEdit={() => setEditOpen("report")} onRegen={() => regenerate("report")} />
              <div className="doc" dangerouslySetInnerHTML={{ __html: innerHtml(preview.reportHtml) }} />
            </div>
          )}

          {tab === "diagrams" && (
            <div className="diagram-grid">
              {(preview.diagrams || []).map((d) => (
                <article className="diagram-card" key={d.id}>
                  <header>
                    {d.title}{d.omitted ? " (omitted)" : ""}
                    <button className="btn ghost sm" onClick={() => downloadFile(`03-diagrams/${d.id}.svg`)}>Download SVG</button>
                  </header>
                  <div className="canvas" dangerouslySetInnerHTML={{ __html: d.svg }} />
                </article>
              ))}
            </div>
          )}

          {tab === "slides" && (
            <div>
              <SectionBar onRegen={() => regenerate("slides")} />
              <div className="slides">
                {(preview.slides || []).map((s, i) => (
                  <article className="slide" key={s.title + i}>
                    <div className="num">Slide {i + 1} / {(preview.slides || []).length}</div>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.body}</p>
                    </div>
                  </article>
                ))}
                <p><button className="btn ghost" onClick={() => downloadFile("06-presentation.html")}>Download presentation HTML</button></p>
              </div>
            </div>
          )}

          {tab === "viva" && (
            <div>
              <SectionBar onRegen={() => regenerate("viva")} />
              <div className="qa">
                {(preview.viva || []).map((item, i) => (
                  <article key={i}>
                    <div className="tag">{item.category || "Viva"} · {item.source || "code"}</div>
                    <strong>Q{i + 1}. {item.q}</strong>
                    <p>{item.a}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === "demo" && (
            <div>
              <SectionBar onEdit={() => setEditOpen("demo")} onRegen={() => regenerate("demo")} />
              <div className="doc" dangerouslySetInnerHTML={{ __html: innerHtml(preview.demoHtml) }} />
            </div>
          )}

          {tab === "files" && (
            <div className="files">
              {(preview.files || project.packFiles || []).map((f) => (
                <div className="file-row" key={f.id || f.path}>
                  <span>{f.label || f.path}</span>
                  <button className="btn ghost sm" onClick={() => downloadFile(f.path)}>Download</button>
                </div>
              ))}
              <button className="btn primary" onClick={unlockAndDownload}>Download all as zip</button>
            </div>
          )}
          {error && <div className="err">{error}</div>}
          {editOpen && (
            <EditModal
              section={editOpen}
              onClose={() => setEditOpen(null)}
              onSave={async (text) => {
                await api(`/api/projects/${project.id}/section`, { method: "POST", json: { section: editOpen, text } });
                const data = await api(`/api/projects/${project.id}`);
                setProject(data);
                setEditOpen(null);
              }}
            />
          )}
        </main>
      )}
    </div>
  );
}

function ProgressList({ project }) {
  const steps = project?.steps || [
    { id: "scan", label: "Reading repository evidence" },
    { id: "understand", label: "Understanding the project" },
    { id: "report", label: "Writing the report" },
    { id: "diagrams", label: "Drawing diagrams" },
    { id: "pack", label: "Assembling the pack" },
  ];
  const current = project?.progress?.step;
  const percent = project?.progress?.percent || 0;
  return (
    <div className="progress">
      <div className="bar"><span style={{ width: Math.max(8, percent) + "%" }} /></div>
      <ul>
        {steps.map((s) => (
          <li key={s.id} className={s.id === current ? "on" : percent === 100 ? "done" : ""}>{s.label}</li>
        ))}
      </ul>
    </div>
  );
}

function HealthBlock({ health }) {
  if (!health) return null;
  const groups = Object.entries(health);
  return (
    <div className="health">
      {groups.map(([k, items]) => (
        <div key={k} className="health-col">
          <div className="health-k">{k}</div>
          {(items || []).slice(0, 4).map((it) => (
            <div key={it.label} className={`health-item ${it.ok ? "ok" : "miss"}`}>
              <strong>{it.label}</strong>
              <span>{it.detail}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function EvidenceBlock({ evidence }) {
  if (!evidence?.length) return null;
  return (
    <div className="evidence">
      <div className="health-k">Evidence from source</div>
      {evidence.slice(0, 8).map((e, i) => (
        <div key={i} className="ev-row">
          <strong>{e.fact}</strong> {String(e.value)}
          <em>{(e.evidence || []).slice(0, 2).join(" · ")}</em>
        </div>
      ))}
    </div>
  );
}

function SectionBar({ onEdit, onRegen }) {
  return (
    <div className="section-bar">
      {onEdit && <button className="btn ghost sm" type="button" onClick={onEdit}>Edit</button>}
      {onRegen && <button className="btn ghost sm" type="button" onClick={onRegen}>Regenerate</button>}
    </div>
  );
}

function EditModal({ section, onClose, onSave }) {
  const [text, setText] = useState("");
  return (
    <div className="modal">
      <div className="modal-card">
        <h3>Edit {section}</h3>
        <p className="muted">Replace only this section. Do not invent tables or APIs that are not in your repo.</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste corrected text" />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn primary" type="button" onClick={() => onSave(text)}>Save</button>
          <button className="btn ghost" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function SunIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function emptyAnswers() {
  return {
    studentName: "",
    enrollment: "",
    college: "",
    course: "BCA",
    guide: "",
    title: "",
    problem: "",
    futureWork: "",
    year: String(new Date().getFullYear()),
    modules: [],
  };
}

function guessTitle(scan) {
  const m = scan?.modules?.[0] || "College Project";
  return m.replace(/ module$/i, "").replace(/ management$/i, "") + " System";
}

function innerHtml(full) {
  if (!full) return "<p>Document is not ready.</p>";
  const m = String(full).match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : full;
}

async function api(url, opts = {}) {
  const res = await fetch(url, {
    method: opts.method || "GET",
    headers: opts.json ? { "Content-Type": "application/json" } : undefined,
    body: opts.json ? JSON.stringify(opts.json) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
