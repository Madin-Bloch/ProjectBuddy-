import { useEffect, useMemo, useState } from "react";

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
      <header className="nav">
        <div className="wrap nav-inner">
          <div className="brand"><div className="mark">P</div> ProjectBuddy</div>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#pack">What’s included</a>
            <a href="#pricing">Pricing</a>
            <span>Rs 249 / project</span>
            <button className="btn ghost sm" onClick={reset}>New project</button>
          </div>
        </div>
      </header>

      {step === "home" && (
        <main>
          <section className="wrap hero">
            <div>
              <div className="kicker">SaaS for BCA · MCA · BTech · Diploma</div>
              <h1>Turn your project files into a submission-ready college pack.</h1>
              <p className="lead">
                Upload a zip. ProjectBuddy reads the real code and builds the report, diagrams, slides and viva answers — so you stop pasting ChatGPT essays that do not match your project.
              </p>
              <div className="hero-actions">
                <label className="btn primary file-btn">
                  Upload project zip
                  <input type="file" accept=".zip" hidden onChange={(e) => startZip(e.target.files[0])} />
                </label>
                <a className="btn ghost" href="#start">Paste GitHub instead</a>
              </div>
              <div className="trust">
                <span>Grounded in your files</span>
                <span>8 diagrams included</span>
                <span>12-slide presentation</span>
                <span>English only</span>
              </div>
            </div>
            <div className="product-card">
              <div className="product-top">
                <div className="window"><span className="dot" /><span className="dot" /><span className="dot" /></div>
                <div className="slide-preview">
                  <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>SLIDE 07 · ER DIAGRAM</div>
                  <h3>Library Management System</h3>
                  <ul>
                    <li>books, members, issues</li>
                    <li>Detected from Laravel migrations</li>
                    <li>Export SVG for the bound report</li>
                  </ul>
                </div>
              </div>
              <div className="product-bottom">
                <div className="mini"><strong>IEEE report</strong><span>Abstract to references</span></div>
                <div className="mini"><strong>Viva Q&amp;A</strong><span>From tables and routes</span></div>
              </div>
            </div>
          </section>

          <section className="wrap section" id="pack">
            <h2>Everything your college asks for</h2>
            <p className="muted">One pack. Download all, or each file on its own.</p>
            <div className="grid4">
              {[
                ["01", "Project report", "IEEE-style chapters from your stack and modules."],
                ["02", "Diagrams", "Use case, ER, DFD 0/1, architecture, sequence, activity, deployment."],
                ["03", "Presentation", "12 slides you can present in internal or external."],
                ["04", "Viva + demo", "Questions from your code, plus a 3-minute demo script."],
              ].map(([n, t, d]) => (
                <div className="card" key={n}>
                  <div className="ico">{n}</div>
                  <h3>{t}</h3>
                  <p className="muted">{d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="wrap section" id="how">
            <h2>How it works</h2>
            <div className="steps">
              {[
                ["1", "Upload zip or GitHub", "No private login. Zip is enough."],
                ["2", "Confirm the scan", "Stack, tables, routes, modules."],
                ["3", "Add college details", "Name, enrollment, title, problem."],
                ["4", "Preview and download", "All files, or one file at a time."],
              ].map(([n, t, d]) => (
                <div className="card step" key={n}>
                  <div className="n">{n}</div>
                  <h3>{t}</h3>
                  <p className="muted">{d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="wrap section" id="pricing">
            <div className="pricing">
              <div className="card price-box">
                <div className="kicker">Simple pricing</div>
                <div className="amount">Rs 249</div>
                <p className="muted">Per project. Preview this build unlocks download without a live UPI charge.</p>
                <ul>
                  <li>Report, SRS, 8 diagrams, 12 slides</li>
                  <li>Viva Q&amp;A, demo script, suggestions</li>
                  <li>Download the full zip or separate files</li>
                </ul>
              </div>
              <div className="card" id="start">
                <h3>Start from a zip</h3>
                <p className="muted">Zip the project folder. Skip node_modules and vendor.</p>
                <div
                  className={`drop ${drag ? "drag" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); startZip(e.dataTransfer.files[0]); }}
                >
                  <label className="btn primary file-btn">
                    Choose zip
                    <input type="file" accept=".zip" hidden onChange={(e) => startZip(e.target.files[0])} />
                  </label>
                  <div className="or">or public GitHub URL</div>
                  <form className="row" onSubmit={startGithub}>
                    <input type="url" placeholder="https://github.com/username/project" value={github} onChange={(e) => setGithub(e.target.value)} />
                    <button className="btn ghost" type="submit">Scan</button>
                  </form>
                  {error && <div className="err">{error}</div>}
                </div>
              </div>
            </div>
          </section>
          <footer className="wrap site">ProjectBuddy reads your files. It does not invent tables that are not in the project.</footer>
        </main>
      )}

      {step === "scan" && (
        <main className="wrap page">
          <div className="panel">
            <div className="kicker">Working</div>
            <h2>{project?.status === "generating" ? "Building your pack from source" : "Reading your project"}</h2>
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
        <main className="wrap page">
          <div className="panel">
            <div className="kicker">Scan complete — your project, not a template</div>
            <h2>{project.scan.stackLabel || stackLine || "Project scan"}</h2>
            <p className="muted">
              {project.scan.fileCount} files · {project.scan.tables?.length || 0} tables · {project.scan.routes?.length || 0} routes · {project.scan.models?.length || 0} models
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
              <p><button className="btn primary" type="submit" disabled={busy}>Generate pack</button></p>
            </form>
          </div>
        </main>
      )}

      {step === "preview" && (
        <main className="wrap page">
          <div className="studio-head">
            <div>
              <div className="kicker">Pack ready · grounded in source</div>
              <h2>{preview.title || "Your project pack"}</h2>
              <p className="muted">{preview.student} · {preview.course} · {preview.college} · {preview.stackLabel}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn ghost" onClick={() => regenerate("all")} disabled={busy}>Regenerate pack</button>
              <button className="btn dark" onClick={unlockAndDownload} disabled={busy}>Download all (zip)</button>
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
              <button className="btn dark" onClick={unlockAndDownload}>Download all as zip</button>
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
