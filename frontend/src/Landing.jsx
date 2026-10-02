import { useState } from "react";

const STACKS = [
  "Laravel", "PHP", "React", "Node.js", "Next.js", "Vue", "Angular",
  "Python", "Django", "Flask", "Java", "Spring Boot", "MySQL", "PostgreSQL", "MongoDB", "SQLite",
];

const DIAGRAMS = [
  { id: "architecture", label: "Architecture" },
  { id: "er", label: "ER Diagram" },
  { id: "usecase", label: "Use Case" },
  { id: "dfd0", label: "DFD Level 0" },
  { id: "dfd1", label: "DFD Level 1" },
  { id: "sequence", label: "Sequence" },
  { id: "activity", label: "Activity" },
  { id: "deployment", label: "Deployment" },
];

const SLIDES = [
  ["Title", "Project title\nYour name · course · year"],
  ["Problem", "What the submitted system is meant to solve."],
  ["Objectives", "1. Working application\n2. Persistent records\n3. Demonstrable flows"],
  ["Architecture", "Client → API → Data store"],
  ["Modules", "Detected from source files"],
  ["Database", "Tables found in migrations or models"],
  ["Implementation", "Key files from the repository"],
  ["Results", "What actually runs in the demo"],
  ["Future scope", "Honest next steps from gaps in source"],
  ["Conclusion", "Documented from the uploaded project"],
];

const FAQS = [
  ["What can I upload?", "A ZIP of your project folder, without node_modules or vendor. Public GitHub URLs also work."],
  ["Can I use a GitHub repository?", "Yes. Paste a public repository URL. Private repos are not supported in this version."],
  ["Does it analyze my actual code?", "Yes. Stack, tables, routes and modules come from files in the upload. Missing pieces are omitted, not invented."],
  ["What files will I receive?", "Project report, system diagrams, presentation, viva Q&A, demo script, analysis notes, and a complete ZIP."],
  ["Can I edit generated content?", "Yes. Preview in the browser, edit a section, regenerate, then download individual files or the full ZIP."],
  ["Which technologies are supported?", "Common student stacks: Laravel, PHP, React, Node, Python, Django, Flask, Java, Spring Boot, and usual SQL/NoSQL stores. Support depends on what the scanner can detect in source."],
  ["Is my project data safe?", "Uploads stay on this instance for generation. Do not include live secrets. Configuration values are redacted when detected."],
  ["Can I download individual files?", "Yes. Download the full ZIP or each report, diagram, slide deck, viva file, or demo script on its own."],
];

export default function Landing({ github, setGithub, drag, setDrag, startZip, startGithub, error }) {
  const [diagram, setDiagram] = useState("architecture");
  const [liveTab, setLiveTab] = useState("report");
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <main>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="badge">From code to submission</div>
          <h1>
            Your Project In.
            <br />
            <span className="grad">Everything You Need to Submit</span> — Out.
          </h1>
          <p className="lead">
            Upload a ZIP file or paste a GitHub repository. ProjectBuddy reads your project and creates the documents, diagrams, slides and viva material you need for submission.
          </p>
          <div className="hero-actions">
            <label className="btn primary file-btn">
              Upload Project ZIP
              <input type="file" accept=".zip" hidden onChange={(e) => startZip(e.target.files[0])} />
            </label>
            <a className="btn ghost" href="#start">Paste GitHub URL</a>
          </div>
          <div className="trust">
            <span>ZIP or public GitHub repository</span>
            <span>Preview before download</span>
            <span>Works with common project stacks</span>
          </div>
        </div>

        <div className="dash" aria-hidden="true">
          <div className="dash-bar">
            <span className="dots"><i /><i /><i /></span>
            <span>ProjectBuddy</span>
            <span className="ok-pill">Scan complete</span>
          </div>
          <div className="dash-body">
            <aside>
              {["Overview", "Report", "Diagrams", "Presentation", "Viva Q&A", "Demo"].map((x, i) => (
                <div key={x} className={i === 0 ? "on" : ""}>{x}</div>
              ))}
            </aside>
            <div>
              <div className="ex-label">Example project</div>
              <h3>Detected repository</h3>
              <p className="muted sm">React · Node.js · PostgreSQL</p>
              <div className="stat-row">
                {[
                  ["42", "Files"],
                  ["14", "API routes"],
                  ["7", "Tables"],
                  ["9", "Modules"],
                ].map(([n, l]) => (
                  <div key={l}><strong>{n}</strong><span>{l}</span></div>
                ))}
              </div>
              <div className="mini-outs">
                {["Report", "8 Diagrams", "Presentation", "Viva Q&A", "Demo script"].map((x) => (
                  <span key={x}>{x}</span>
                ))}
              </div>
              <div className="mini-diagrams">
                <ArchMini />
                <ErMini />
                <FlowMini />
              </div>
              <div className="hero-slide">
                <span>Slide 04</span>
                <strong>System architecture</strong>
                <p>Web application to API to data store</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap upload-sec" id="start">
        <div
          className={`drop ${drag ? "drag" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); startZip(e.dataTransfer.files[0]); }}
        >
          <h2>Drop your project here</h2>
          <p className="muted">ZIP up your project folder or paste a public GitHub URL</p>
          <div className="hero-actions">
            <label className="btn primary file-btn">
              Choose ZIP
              <input type="file" accept=".zip" hidden onChange={(e) => startZip(e.target.files[0])} />
            </label>
          </div>
          <div className="or">or</div>
          <form className="row" onSubmit={startGithub}>
            <input type="url" placeholder="https://github.com/username/project" value={github} onChange={(e) => setGithub(e.target.value)} />
            <button className="btn dark" type="submit">Analyze Project</button>
          </form>
          <p className="hint">ZIP up to 50 MB · node_modules/vendor not required</p>
          {error && <div className="err">{error}</div>}
        </div>
      </section>

      <section className="wrap section" id="how">
        <h2>From repository to submission</h2>
        <p className="muted">ProjectBuddy does the boring work after you finish the code.</p>
        <div className="flow">
          {[
            ["01", "Upload", "Upload a ZIP or GitHub repository."],
            ["02", "Analyze", "We inspect your files, routes, modules, database and project structure."],
            ["03", "Generate", "Reports, diagrams, presentation, viva and demo material are created from your project."],
            ["04", "Download", "Review everything and download individual files or the complete package."],
          ].map(([n, t, d]) => (
            <article key={n} className="flow-card">
              <div className="n">{n}</div>
              <h3>{t}</h3>
              <p className="muted">{d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section" id="pack">
        <h2>Everything your project needs</h2>
        <p className="muted">Generated from your actual repository — not copied from a generic template.</p>
        <div className="out-grid">
          <article className="out-card">
            <div className="ico">01</div>
            <h3>Project Report</h3>
            <div className="preview report-mini">
              <div className="line w80" />
              <div className="line w60" />
              <div className="line w90" />
              <div className="line w40" />
            </div>
            <p className="muted">Chapters built from detected stack, modules and routes.</p>
            <a href="#live">View example →</a>
          </article>
          <article className="out-card">
            <div className="ico">02</div>
            <h3>System Diagrams</h3>
            <div className="preview diag-row">
              <ArchMini />
              <ErMini />
              <UseCaseMini />
            </div>
            <p className="muted">Architecture, ER, DFD, use case, sequence, activity, deployment.</p>
            <a href="#diagrams">View example →</a>
          </article>
          <article className="out-card">
            <div className="ico ico-warm">03</div>
            <h3>Presentation</h3>
            <div className="preview slides-mini">
              <div><b>Title</b><span /></div>
              <div><b>Architecture</b><span /></div>
              <div><b>Modules</b><span /></div>
            </div>
            <p className="muted">A structured slide deck you can present as-is or edit.</p>
            <a href="#ppt">View example →</a>
          </article>
          <article className="out-card">
            <div className="ico">04</div>
            <h3>Viva Q&amp;A</h3>
            <div className="preview qa-mini">
              <p><strong>Q.</strong> Which stack did you use?</p>
              <p><strong>Q.</strong> What does this route do?</p>
              <p><strong>Q.</strong> How is data stored?</p>
            </div>
            <p className="muted">Questions tied to files, plus standard concept prompts.</p>
            <a href="#live">View example →</a>
          </article>
          <article className="out-card">
            <div className="ico ico-ok">05</div>
            <h3>Demo Script</h3>
            <div className="preview">
              <ol className="demo-ol">
                <li>Open the detected home route</li>
                <li>Show one real create or list flow</li>
                <li>Stop. Do not demo missing features</li>
              </ol>
            </div>
            <p className="muted">A short timed walkthrough of what actually exists.</p>
            <a href="#live">View example →</a>
          </article>
          <article className="out-card">
            <div className="ico">06</div>
            <h3>Project Analysis</h3>
            <div className="preview code-mini">
              stack: detected from source{"\n"}
              routes: HTTP entry points{"\n"}
              tables: schema or models{"\n"}
              gaps: omitted, not invented
            </div>
            <p className="muted">Stack, routes, modules, database and dependencies.</p>
            <a href="#live">View example →</a>
          </article>
        </div>
      </section>

      <section className="wrap section" id="diagrams">
        <h2>See the project before you explain it.</h2>
        <div className="workspace">
          <aside>
            <div className="health-k">Diagrams</div>
            {DIAGRAMS.map((d) => (
              <button key={d.id} className={diagram === d.id ? "on" : ""} type="button" onClick={() => setDiagram(d.id)}>{d.label}</button>
            ))}
          </aside>
          <div className="canvas-wrap">
            <div className="canvas-tools">
              <span>Zoom −</span>
              <span>100%</span>
              <span>Zoom +</span>
              <span className="spacer" />
              <span>Download SVG</span>
            </div>
            <DiagramPreview kind={diagram} />
          </div>
          <div className="canvas-meta">
            <div className="health-k">Generated from your repository</div>
            <p>Detected components</p>
            <ul>
              <li>Frontend</li>
              <li>API</li>
              <li>Database</li>
              <li>Authentication</li>
            </ul>
            <p className="muted sm">Omitted if that layer is not in source.</p>
          </div>
        </div>
      </section>

      <section className="wrap section" id="ppt">
        <h2>Presentation, already structured.</h2>
        <p className="muted">12-slide presentation · Editable content · Based on your project</p>
        <div className="ppt-track">
          {SLIDES.map(([t, b]) => (
            <article key={t} className="ppt-slide">
              <div className="num">{t}</div>
              <p>{b}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section" id="live">
        <h2>Preview before you download</h2>
        <div className="live">
          <div className="tabs">
            {["report", "diagrams", "presentation", "viva", "demo"].map((id) => (
              <button key={id} className={`tab ${liveTab === id ? "on" : ""}`} type="button" onClick={() => setLiveTab(id)}>
                {id[0].toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
          <div className="live-frame">
            <div className="live-bar">
              <span>Preview</span>
              <div className="section-bar">
                <span className="btn ghost sm">Edit</span>
                <span className="btn ghost sm">Regenerate</span>
                <span className="btn dark sm">Download</span>
              </div>
            </div>
            <div className="live-body">
              {liveTab === "report" && (
                <div className="doc-fake">
                  <h3>Project Report</h3>
                  <p>Abstract, problem, stack, modules and routes — written only from detected source.</p>
                  <p>Empty sections are skipped instead of filled with generic essays.</p>
                </div>
              )}
              {liveTab === "diagrams" && <ArchMini large />}
              {liveTab === "presentation" && (
                <div className="ppt-slide live-slide">
                  <div className="num">Architecture</div>
                  <p>Client → Application → Data store</p>
                </div>
              )}
              {liveTab === "viva" && (
                <div className="doc-fake">
                  <p><strong>Q. What stack did you use?</strong></p>
                  <p>Answer from package/composer files in the upload.</p>
                </div>
              )}
              {liveTab === "demo" && (
                <div className="doc-fake">
                  <p>0:00 introduce the aim. 0:40 open a detected screen. 1:10 show one real data flow. 2:40 stop.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="wrap section" id="examples">
        <h2>Built for real-world student projects</h2>
        <p className="muted">ProjectBuddy is not tied to one language or framework. Detection quality depends on what is in the repository.</p>
        <div className="chips">
          {STACKS.map((s) => <span className="chip" key={s}>{s}</span>)}
        </div>
      </section>

      <section className="wrap section">
        <h2>Stop rebuilding your submission from scratch.</h2>
        <div className="compare">
          <div className="card">
            <h3>Without ProjectBuddy</h3>
            <ul className="minus">
              <li>Find templates</li>
              <li>Rewrite project details</li>
              <li>Draw diagrams manually</li>
              <li>Prepare PPT</li>
              <li>Prepare viva questions</li>
              <li>Fix everything at the last minute</li>
            </ul>
          </div>
          <div className="card good">
            <h3>With ProjectBuddy</h3>
            <ul className="plus">
              <li>Upload project</li>
              <li>Analyze repository</li>
              <li>Generate diagrams</li>
              <li>Generate presentation</li>
              <li>Generate report</li>
              <li>Prepare viva</li>
              <li>Download everything</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="wrap section" id="pricing">
        <h2>One project. One simple price.</h2>
        <div className="price-card">
          <div className="amount">₹249</div>
          <p className="muted">per project</p>
          <ul className="checks">
            <li>Project analysis</li>
            <li>Project report</li>
            <li>System diagrams</li>
            <li>Presentation</li>
            <li>Viva Q&amp;A</li>
            <li>Demo script</li>
            <li>Individual downloads</li>
            <li>Complete ZIP download</li>
          </ul>
          <a className="btn primary" href="#start">Create My Project Pack</a>
        </div>
      </section>

      <section className="wrap section" id="faq">
        <h2>Frequently asked questions</h2>
        <div className="faq">
          {FAQS.map(([q, a], i) => (
            <button key={q} type="button" className={`faq-item ${openFaq === i ? "open" : ""}`} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
              <div className="faq-q">{q}<span>{openFaq === i ? "−" : "+"}</span></div>
              {openFaq === i && <p className="muted">{a}</p>}
            </button>
          ))}
        </div>
      </section>

      <footer className="foot">
        <div className="wrap foot-grid">
          <div>
            <div className="brand"><div className="mark">P</div> ProjectBuddy</div>
            <p>Turn finished code into submission-ready material.</p>
          </div>
          <div>
            <h4>Product</h4>
            <a href="#how">How it works</a>
            <a href="#pack">What's included</a>
            <a href="#examples">Examples</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div>
            <h4>Resources</h4>
            <a href="#faq">Documentation</a>
            <a href="#faq">Student Guide</a>
            <a href="#faq">Blog</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#faq">About</a>
            <a href="#faq">Contact</a>
            <a href="#faq">Support</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#faq">Privacy</a>
            <a href="#faq">Terms</a>
            <a href="#faq">Refund Policy</a>
          </div>
        </div>
        <div className="wrap foot-bottom">
          <span>© 2026 ProjectBuddy · Built for developers and students.</span>
          <span className="socials">
            <a href="https://github.com/MadinBloch/ProjectBuddy-" target="_blank" rel="noreferrer">GitHub</a>
            <span>LinkedIn</span>
            <span>X</span>
          </span>
        </div>
      </footer>
    </main>
  );
}

function ArchMini({ large }) {
  return (
    <svg viewBox="0 0 220 120" className={large ? "svg-lg" : "svg-sm"} aria-hidden="true">
      <rect x="8" y="44" width="56" height="28" rx="6" fill="var(--chip)" stroke="var(--line)" />
      <text x="36" y="62" textAnchor="middle" fontSize="9" fill="var(--ink)">User</text>
      <rect x="82" y="44" width="56" height="28" rx="6" fill="var(--ok-soft)" stroke="var(--ok)" />
      <text x="110" y="62" textAnchor="middle" fontSize="8" fill="var(--ink)">Web app</text>
      <rect x="156" y="20" width="56" height="28" rx="6" fill="var(--chip)" stroke="var(--brand)" />
      <text x="184" y="38" textAnchor="middle" fontSize="9" fill="var(--ink)">API</text>
      <rect x="156" y="72" width="56" height="28" rx="6" fill="var(--warm-soft)" stroke="var(--warm)" />
      <text x="184" y="90" textAnchor="middle" fontSize="8" fill="var(--ink)">Database</text>
      <path d="M64 58 H82" stroke="var(--muted)" fill="none" />
      <path d="M138 58 H156" stroke="var(--muted)" fill="none" />
      <path d="M184 48 V72" stroke="var(--muted)" fill="none" />
    </svg>
  );
}

function ErMini() {
  return (
    <svg viewBox="0 0 160 90" className="svg-sm" aria-hidden="true">
      <rect x="8" y="18" width="64" height="54" rx="6" fill="var(--paper)" stroke="var(--line)" />
      <rect x="8" y="18" width="64" height="16" fill="var(--ok)" />
      <text x="16" y="30" fontSize="8" fill="#fff">users</text>
      <rect x="88" y="18" width="64" height="54" rx="6" fill="var(--paper)" stroke="var(--line)" />
      <rect x="88" y="18" width="64" height="16" fill="var(--brand)" />
      <text x="96" y="30" fontSize="8" fill="#fff">records</text>
    </svg>
  );
}

function FlowMini() {
  return (
    <svg viewBox="0 0 120 90" className="svg-sm" aria-hidden="true">
      <rect x="30" y="8" width="60" height="18" rx="9" fill="var(--ok)" />
      <rect x="30" y="36" width="60" height="18" rx="4" fill="var(--paper)" stroke="var(--ok)" />
      <rect x="30" y="64" width="60" height="18" rx="9" fill="var(--ink)" />
      <path d="M60 26 V36 M60 54 V64" stroke="var(--muted)" />
    </svg>
  );
}

function UseCaseMini() {
  return (
    <svg viewBox="0 0 160 90" className="svg-sm" aria-hidden="true">
      <ellipse cx="80" cy="28" rx="36" ry="14" fill="var(--paper)" stroke="var(--brand)" />
      <ellipse cx="80" cy="62" rx="36" ry="14" fill="var(--paper)" stroke="var(--ok)" />
      <text x="80" y="32" textAnchor="middle" fontSize="8" fill="var(--ink)">Sign in</text>
      <text x="80" y="66" textAnchor="middle" fontSize="8" fill="var(--ink)">Create record</text>
      <circle cx="18" cy="45" r="8" fill="none" stroke="var(--ink)" />
      <path d="M18 53 V72 M12 58 H24" stroke="var(--ink)" fill="none" />
    </svg>
  );
}

function DfdMini() {
  return (
    <svg viewBox="0 0 220 140" className="svg-lg" aria-hidden="true">
      <circle cx="40" cy="70" r="18" fill="var(--chip)" stroke="var(--line)" />
      <text x="40" y="74" textAnchor="middle" fontSize="9" fill="var(--ink)">User</text>
      <rect x="86" y="52" width="52" height="36" rx="18" fill="var(--ok-soft)" stroke="var(--ok)" />
      <text x="112" y="74" textAnchor="middle" fontSize="8" fill="var(--ink)">Process</text>
      <rect x="164" y="54" width="48" height="32" fill="var(--paper)" stroke="var(--warm)" />
      <text x="188" y="74" textAnchor="middle" fontSize="8" fill="var(--ink)">Store</text>
      <path d="M58 70 H86 M138 70 H164" stroke="var(--muted)" fill="none" />
    </svg>
  );
}

function SequenceMini() {
  return (
    <svg viewBox="0 0 220 140" className="svg-lg" aria-hidden="true">
      <text x="40" y="18" textAnchor="middle" fontSize="9" fill="var(--ink)">Client</text>
      <text x="110" y="18" textAnchor="middle" fontSize="9" fill="var(--ink)">API</text>
      <text x="180" y="18" textAnchor="middle" fontSize="9" fill="var(--ink)">Store</text>
      <path d="M40 24 V130 M110 24 V130 M180 24 V130" stroke="var(--line)" />
      <path d="M40 48 H110" stroke="var(--brand)" />
      <path d="M110 78 H180" stroke="var(--ok)" />
      <path d="M180 108 H40" stroke="var(--muted)" />
    </svg>
  );
}

function DeployMini() {
  return (
    <svg viewBox="0 0 220 140" className="svg-lg" aria-hidden="true">
      <rect x="16" y="28" width="188" height="84" rx="10" fill="var(--paper)" stroke="var(--line)" />
      <text x="110" y="48" textAnchor="middle" fontSize="9" fill="var(--muted)">Host environment</text>
      <rect x="32" y="62" width="68" height="32" rx="6" fill="var(--chip)" stroke="var(--brand)" />
      <text x="66" y="82" textAnchor="middle" fontSize="8" fill="var(--ink)">App</text>
      <rect x="120" y="62" width="68" height="32" rx="6" fill="var(--ok-soft)" stroke="var(--ok)" />
      <text x="154" y="82" textAnchor="middle" fontSize="8" fill="var(--ink)">Database</text>
    </svg>
  );
}

function DiagramPreview({ kind }) {
  if (kind === "er") return <ErMini />;
  if (kind === "activity") return <FlowMini />;
  if (kind === "usecase") return <UseCaseMini />;
  if (kind === "dfd0" || kind === "dfd1") return <DfdMini />;
  if (kind === "sequence") return <SequenceMini />;
  if (kind === "deployment") return <DeployMini />;
  return <ArchMini large />;
}
