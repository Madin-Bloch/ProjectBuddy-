import { useState } from "react";

const STACKS = [
  "Laravel", "PHP", "React", "Node.js", "Next.js", "Vue", "Angular",
  "Python", "Django", "Flask", "Java", "Spring Boot", "MySQL", "PostgreSQL", "MongoDB", "SQLite",
];

const DIAGRAMS = [
  { id: "architecture", label: "Architecture" },
  { id: "er", label: "ER diagram" },
  { id: "usecase", label: "Use case" },
  { id: "dfd0", label: "DFD level 0" },
  { id: "dfd1", label: "DFD level 1" },
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
      {/* ---------------------------------------------------------------- Hero */}
      <section className="hero wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="badge">
              <b>New</b> Grounded in your actual source
            </div>
            <h1>
              Ship the submission,
              <br />
              <em>not the busywork.</em>
            </h1>
            <p className="lead">
              Upload your project ZIP or paste a public GitHub repository. ProjectBuddy reads the
              real files and produces the report, diagrams, presentation and viva material your
              college expects.
            </p>
            <div className="hero-actions">
              <label className="btn primary lg file-btn">
                <UploadIcon />
                Upload project ZIP
                <input type="file" accept=".zip" hidden onChange={(e) => startZip(e.target.files[0])} />
              </label>
              <a className="btn ghost lg" href="#start">
                <GitHubIcon />
                Paste GitHub URL
              </a>
            </div>
            <div className="trust">
              <span><CheckIcon /> ZIP or public repository</span>
              <span><CheckIcon /> Preview before you download</span>
              <span><CheckIcon /> No setup required</span>
            </div>
          </div>

          <AppWindow />
        </div>
      </section>

      {/* -------------------------------------------------------- Stack strip */}
      <section className="stack-strip wrap">
        <div className="stack-label">Reads the stacks your course already teaches</div>
        <div className="marquee">
          <div className="marquee-track">
            {[...STACKS, ...STACKS].map((s, i) => (
              <span className="stack-pill" key={`${s}-${i}`}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Upload */}
      <section className="wrap" id="start">
        <div
          className={`drop ${drag ? "drag" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); startZip(e.dataTransfer.files[0]); }}
        >
          <div className="kicker" style={{ display: "inline-block" }}>Start here</div>
          <h2>Drop your project folder</h2>
          <p className="muted">ZIP it up, or paste a public GitHub URL. Nothing is invented — only what your code contains.</p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <label className="btn primary lg file-btn">
              <UploadIcon />
              Choose ZIP
              <input type="file" accept=".zip" hidden onChange={(e) => startZip(e.target.files[0])} />
            </label>
          </div>
          <div className="or">or</div>
          <form className="row" onSubmit={startGithub}>
            <input
              type="url"
              placeholder="https://github.com/username/project"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
            <button className="btn dark" type="submit">Analyze project</button>
          </form>
          <p className="hint">ZIP up to 50 MB · node_modules and vendor not required</p>
          {error && <div className="err" style={{ maxWidth: 620, margin: "14px auto 0" }}>{error}</div>}
        </div>
      </section>

      {/* -------------------------------------------------------------- Steps */}
      <section className="wrap section" id="how">
        <div className="section-head">
          <div className="kicker">How it works</div>
          <h2>From repository to submission in four steps</h2>
          <p>You already wrote the code. ProjectBuddy handles everything that comes after it.</p>
        </div>
        <div className="flow">
          {[
            ["01", "Upload", "Drop a ZIP or paste a public GitHub repository URL."],
            ["02", "Analyze", "We inspect your files, routes, modules, database and structure."],
            ["03", "Generate", "Report, diagrams, presentation, viva and demo material, built from your project."],
            ["04", "Download", "Review everything, edit if needed, then export individual files or the full pack."],
          ].map(([n, t, d]) => (
            <article key={n} className="flow-card">
              <div className="n">{n}</div>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- Pack */}
      <section className="wrap section" id="pack">
        <div className="section-head">
          <div className="kicker">What you get</div>
          <h2>Everything your submission needs</h2>
          <p>Generated from your actual repository — never copied from a generic template.</p>
        </div>
        <div className="out-grid">
          <article className="out-card">
            <div className="ico"><DocIcon /></div>
            <h3>Project report</h3>
            <div className="preview report-mini">
              <div className="line accent w70" />
              <div className="line w100" />
              <div className="line w85" />
              <div className="line w55" />
            </div>
            <p>Chapters built from the detected stack, modules and routes.</p>
            <a className="more" href="#live">View example <ArrowIcon /></a>
          </article>

          <article className="out-card">
            <div className="ico"><DiagramIcon /></div>
            <h3>System diagrams</h3>
            <div className="preview diag-row">
              <ArchMini />
              <ErMini />
              <UseCaseMini />
            </div>
            <p>Architecture, ER, DFD, use case, sequence, activity and deployment.</p>
            <a className="more" href="#diagrams">View example <ArrowIcon /></a>
          </article>

          <article className="out-card">
            <div className="ico warm"><DeckIcon /></div>
            <h3>Presentation</h3>
            <div className="preview slides-mini">
              <div>Title<span /></div>
              <div>Architecture<span className="short" /></div>
              <div>Modules<span /></div>
            </div>
            <p>A structured 12-slide deck you can present as-is or edit.</p>
            <a className="more" href="#ppt">View example <ArrowIcon /></a>
          </article>

          <article className="out-card">
            <div className="ico"><VivaIcon /></div>
            <h3>Viva Q&amp;A</h3>
            <div className="preview qa-mini">
              <p><strong>Q.</strong> Which stack did you use?</p>
              <p><strong>Q.</strong> What does this route do?</p>
              <p><strong>Q.</strong> How is data stored?</p>
            </div>
            <p>Questions tied to your files, plus standard concept prompts.</p>
            <a className="more" href="#live">View example <ArrowIcon /></a>
          </article>

          <article className="out-card">
            <div className="ico ok"><PlayIcon /></div>
            <h3>Demo script</h3>
            <div className="preview">
              <ol className="demo-ol">
                <li>Open the detected home route</li>
                <li>Show one real create or list flow</li>
                <li>Stop. Do not demo missing features</li>
              </ol>
            </div>
            <p>A short, timed walkthrough of what actually exists.</p>
            <a className="more" href="#live">View example <ArrowIcon /></a>
          </article>

          <article className="out-card">
            <div className="ico"><CodeIcon /></div>
            <h3>Project analysis</h3>
            <div className="preview">
              <p className="code-mini">
                <b>stack:</b> detected from source{"\n"}
                <b>routes:</b> HTTP entry points{"\n"}
                <b>tables:</b> schema or models{"\n"}
                <b>gaps:</b> omitted, not invented
              </p>
            </div>
            <p>Stack, routes, modules, database and dependencies — with evidence.</p>
            <a className="more" href="#live">View example <ArrowIcon /></a>
          </article>
        </div>
      </section>

      {/* ---------------------------------------------------------- Diagrams */}
      <section className="wrap section" id="diagrams">
        <div className="section-head">
          <div className="kicker">Diagram workspace</div>
          <h2>See the project before you explain it</h2>
          <p>Every diagram is drawn from structure the scanner found. Layers that don't exist are left out, not faked.</p>
        </div>
        <div className="workspace">
          <aside>
            <div className="rail-label">Diagrams</div>
            {DIAGRAMS.map((d) => (
              <button key={d.id} className={diagram === d.id ? "on" : ""} type="button" onClick={() => setDiagram(d.id)}>
                {d.label}
              </button>
            ))}
          </aside>
          <div className="canvas-wrap">
            <div className="canvas-tools">
              <span className="tool">−</span>
              <span>100%</span>
              <span className="tool">+</span>
              <span className="spacer" />
              <span className="tool">Download SVG</span>
            </div>
            <DiagramPreview kind={diagram} />
          </div>
          <div className="canvas-meta">
            <div className="health-k">Detected layers</div>
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

      {/* ------------------------------------------------------------- Deck */}
      <section className="wrap section" id="ppt">
        <div className="section-head">
          <div className="kicker">Presentation</div>
          <h2>A deck, already structured</h2>
          <p>Twelve slides that follow the story your guide expects — editable, and grounded in your project.</p>
        </div>
        <div className="ppt-track">
          {SLIDES.map(([t, b]) => (
            <article key={t} className="ppt-slide">
              <div className="num">{t}</div>
              <p>{b}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ Live preview */}
      <section className="wrap section" id="live">
        <div className="section-head">
          <div className="kicker">Preview &amp; edit</div>
          <h2>Preview everything before you download</h2>
          <p>Read it in the browser, fix a section, regenerate, then export.</p>
        </div>
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
              <span>Preview <span className="mono">· 01-project-report</span></span>
              <div className="section-bar" style={{ margin: 0 }}>
                <span className="btn ghost sm">Edit</span>
                <span className="btn ghost sm">Regenerate</span>
                <span className="btn dark sm">Download</span>
              </div>
            </div>
            <div className="live-body">
              {liveTab === "report" && (
                <div className="doc-fake">
                  <h3>Project report</h3>
                  <p>Abstract, problem statement, stack, modules and routes — written only from detected source.</p>
                  <p>Empty sections are skipped instead of padded with generic essays, so nothing in the document contradicts your code.</p>
                </div>
              )}
              {liveTab === "diagrams" && <ArchMini large />}
              {liveTab === "presentation" && (
                <div className="ppt-slide live-slide" style={{ maxWidth: 360 }}>
                  <div className="num">Slide 04 · Architecture</div>
                  <p>Client → Application → Data store</p>
                </div>
              )}
              {liveTab === "viva" && (
                <div className="doc-fake">
                  <p><strong>Q. What stack did you use?</strong></p>
                  <p>Answer is built from the package/composer files found in the upload.</p>
                </div>
              )}
              {liveTab === "demo" && (
                <div className="doc-fake">
                  <p>0:00 — introduce the aim. 0:40 — open a detected screen. 1:10 — show one real data flow. 2:40 — stop.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Compare */}
      <section className="wrap section">
        <div className="section-head center">
          <div className="kicker">The difference</div>
          <h2>Stop rebuilding your submission from scratch</h2>
        </div>
        <div className="compare">
          <div className="card">
            <h3>Without ProjectBuddy</h3>
            <ul className="minus">
              <li>Hunt for report templates</li>
              <li>Rewrite your project details by hand</li>
              <li>Draw every diagram manually</li>
              <li>Build the PPT the night before</li>
              <li>Guess the viva questions</li>
              <li>Fix everything at the last minute</li>
            </ul>
          </div>
          <div className="card good">
            <h3>With ProjectBuddy</h3>
            <ul className="plus">
              <li>Upload your project</li>
              <li>Analyze the real repository</li>
              <li>Generate the diagrams</li>
              <li>Generate the presentation</li>
              <li>Generate the report</li>
              <li>Prepare for viva, then export</li>
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Pricing */}
      <section className="wrap section" id="pricing">
        <div className="price-wrap">
          <div>
            <div className="kicker">Pricing</div>
            <h2>One project. One simple price.</h2>
            <p className="muted" style={{ fontSize: 16, lineHeight: 1.65 }}>
              No subscription, no per-seat pricing, no hidden add-ons. Pay once for the project you
              are submitting and keep every file.
            </p>
          </div>
          <div className="price-card">
            <div className="price-tag">Per project</div>
            <div className="amount">₹249 <span>one-time</span></div>
            <ul className="checks">
              <li>Project analysis &amp; evidence</li>
              <li>Full project report</li>
              <li>System diagrams (SVG)</li>
              <li>12-slide presentation</li>
              <li>Viva Q&amp;A</li>
              <li>Demo script</li>
              <li>Individual file downloads</li>
              <li>Complete ZIP download</li>
            </ul>
            <a className="btn primary lg" href="#start" style={{ width: "100%" }}>Create my project pack</a>
            <p className="price-note">Preview the full pack before you pay.</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ FAQ */}
      <section className="wrap section" id="faq">
        <div className="section-head center">
          <div className="kicker">FAQ</div>
          <h2>Frequently asked questions</h2>
        </div>
        <div className="faq">
          {FAQS.map(([q, a], i) => (
            <button
              key={q}
              type="button"
              className={`faq-item ${openFaq === i ? "open" : ""}`}
              onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
            >
              <div className="faq-q">{q}<span>{openFaq === i ? "−" : "+"}</span></div>
              {openFaq === i && <p>{a}</p>}
            </button>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- CTA band */}
      <section className="wrap section tight">
        <div className="cta-band">
          <h2>Your code is done. Finish the submission.</h2>
          <p>Upload your project and get a complete, evidence-backed pack in minutes.</p>
          <a className="btn primary lg" href="#start">Upload project ZIP</a>
        </div>
      </section>

      {/* ---------------------------------------------------------- Footer */}
      <footer className="foot">
        <div className="wrap foot-grid">
          <div>
            <div className="brand"><div className="mark">P</div> ProjectBuddy</div>
            <p>Turn finished code into submission-ready material. English only, grounded in your source.</p>
          </div>
          <div>
            <h4>Product</h4>
            <a href="#how">How it works</a>
            <a href="#pack">What's included</a>
            <a href="#diagrams">Diagrams</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div>
            <h4>Resources</h4>
            <a href="#faq">Documentation</a>
            <a href="#faq">Student guide</a>
            <a href="#faq">Supported stacks</a>
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
            <a href="#faq">Refund policy</a>
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

/* ------------------------------------------------------------------ Hero mock */
function AppWindow() {
  return (
    <div className="window">
      <div className="window-bar">
        <span className="dots"><i /><i /><i /></span>
        <span className="window-title">ProjectBuddy <span className="mono">/ studio</span></span>
        <span className="ok-pill" style={{ marginLeft: "auto", color: "var(--ok)", fontSize: 11, fontWeight: 600 }}>● Scan complete</span>
      </div>
      <div className="window-body">
        <aside className="window-rail">
          <div className="rail-label">Pack</div>
          <div className="rail-item on"><DocIcon /> Report <span className="tick"><CheckIcon /></span></div>
          <div className="rail-item"><DiagramIcon /> Diagrams <span className="tick"><CheckIcon /></span></div>
          <div className="rail-item"><DeckIcon /> Presentation <span className="tick"><CheckIcon /></span></div>
          <div className="rail-item"><VivaIcon /> Viva Q&amp;A <span className="tick"><CheckIcon /></span></div>
          <div className="rail-item"><PlayIcon /> Demo script <span className="tick"><CheckIcon /></span></div>
          <div className="rail-label" style={{ marginTop: 8 }}>Source</div>
          <div className="rail-item"><CodeIcon /> Detected repo</div>
        </aside>
        <div className="window-main">
          <div className="doc-tag">Example project</div>
          <h3>Detected repository</h3>
          <p className="muted sm" style={{ margin: 0 }}>React · Node.js · PostgreSQL</p>
          <div className="stat-row">
            {[["42", "Files"], ["14", "Routes"], ["7", "Tables"], ["9", "Modules"]].map(([n, l]) => (
              <div key={l}><strong>{n}</strong><span>{l}</span></div>
            ))}
          </div>
          <div className="doc-lines">
            <div className="line accent w55" />
            <div className="line w100" />
            <div className="line w85" />
            <div className="line w40" />
          </div>
          <div className="mini-diagrams">
            <ArchMini />
            <ErMini />
            <FlowMini />
          </div>
          <div className="mini-outs">
            <span className="ok">Report</span>
            <span>8 diagrams</span>
            <span>Presentation</span>
            <span>Viva Q&amp;A</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Diagram SVGs */
function ArchMini({ large }) {
  return (
    <svg viewBox="0 0 220 120" className={large ? "svg-lg" : "svg-sm"} aria-hidden="true">
      <rect x="8" y="44" width="56" height="28" rx="7" fill="var(--surface-3)" stroke="var(--line-2)" />
      <text x="36" y="62" textAnchor="middle" fontSize="9" fill="var(--ink-2)">User</text>
      <rect x="82" y="44" width="56" height="28" rx="7" fill="var(--brand-soft)" stroke="var(--brand)" />
      <text x="110" y="62" textAnchor="middle" fontSize="8.5" fill="var(--brand-strong)">Web app</text>
      <rect x="156" y="20" width="56" height="28" rx="7" fill="var(--surface-3)" stroke="var(--brand)" />
      <text x="184" y="38" textAnchor="middle" fontSize="9" fill="var(--ink-2)">API</text>
      <rect x="156" y="72" width="56" height="28" rx="7" fill="var(--accent-soft)" stroke="var(--accent)" />
      <text x="184" y="90" textAnchor="middle" fontSize="8.5" fill="var(--accent)">Database</text>
      <path d="M64 58 H82" stroke="var(--faint)" fill="none" />
      <path d="M138 58 H156" stroke="var(--faint)" fill="none" />
      <path d="M184 48 V72" stroke="var(--faint)" fill="none" />
    </svg>
  );
}

function ErMini() {
  return (
    <svg viewBox="0 0 160 90" className="svg-sm" aria-hidden="true">
      <rect x="8" y="18" width="64" height="54" rx="7" fill="var(--surface)" stroke="var(--line-2)" />
      <rect x="8" y="18" width="64" height="17" rx="7" fill="var(--brand)" />
      <text x="16" y="30" fontSize="8" fill="#fff">users</text>
      <rect x="88" y="18" width="64" height="54" rx="7" fill="var(--surface)" stroke="var(--line-2)" />
      <rect x="88" y="18" width="64" height="17" rx="7" fill="var(--accent)" />
      <text x="96" y="30" fontSize="8" fill="#fff">records</text>
    </svg>
  );
}

function FlowMini() {
  return (
    <svg viewBox="0 0 120 90" className="svg-sm" aria-hidden="true">
      <rect x="30" y="8" width="60" height="18" rx="9" fill="var(--brand)" />
      <rect x="30" y="36" width="60" height="18" rx="4" fill="var(--surface)" stroke="var(--brand)" />
      <rect x="30" y="64" width="60" height="18" rx="9" fill="var(--ink)" />
      <path d="M60 26 V36 M60 54 V64" stroke="var(--faint)" />
    </svg>
  );
}

function UseCaseMini() {
  return (
    <svg viewBox="0 0 160 90" className="svg-sm" aria-hidden="true">
      <ellipse cx="84" cy="28" rx="36" ry="14" fill="var(--surface)" stroke="var(--brand)" />
      <ellipse cx="84" cy="62" rx="36" ry="14" fill="var(--surface)" stroke="var(--accent)" />
      <text x="84" y="32" textAnchor="middle" fontSize="8" fill="var(--ink-2)">Sign in</text>
      <text x="84" y="66" textAnchor="middle" fontSize="8" fill="var(--ink-2)">Create record</text>
      <circle cx="20" cy="45" r="8" fill="none" stroke="var(--ink-2)" />
      <path d="M20 53 V72 M14 58 H26" stroke="var(--ink-2)" fill="none" />
    </svg>
  );
}

function DfdMini() {
  return (
    <svg viewBox="0 0 220 140" className="svg-lg" aria-hidden="true">
      <circle cx="40" cy="70" r="18" fill="var(--surface-3)" stroke="var(--line-2)" />
      <text x="40" y="74" textAnchor="middle" fontSize="9" fill="var(--ink-2)">User</text>
      <rect x="86" y="52" width="52" height="36" rx="18" fill="var(--brand-soft)" stroke="var(--brand)" />
      <text x="112" y="74" textAnchor="middle" fontSize="8" fill="var(--brand-strong)">Process</text>
      <rect x="164" y="54" width="48" height="32" fill="var(--surface)" stroke="var(--accent)" />
      <text x="188" y="74" textAnchor="middle" fontSize="8" fill="var(--ink-2)">Store</text>
      <path d="M58 70 H86 M138 70 H164" stroke="var(--faint)" fill="none" />
    </svg>
  );
}

function SequenceMini() {
  return (
    <svg viewBox="0 0 220 140" className="svg-lg" aria-hidden="true">
      <text x="40" y="18" textAnchor="middle" fontSize="9" fill="var(--ink-2)">Client</text>
      <text x="110" y="18" textAnchor="middle" fontSize="9" fill="var(--ink-2)">API</text>
      <text x="180" y="18" textAnchor="middle" fontSize="9" fill="var(--ink-2)">Store</text>
      <path d="M40 24 V130 M110 24 V130 M180 24 V130" stroke="var(--line-2)" />
      <path d="M40 48 H110" stroke="var(--brand)" />
      <path d="M110 78 H180" stroke="var(--accent)" />
      <path d="M180 108 H40" stroke="var(--faint)" />
    </svg>
  );
}

function DeployMini() {
  return (
    <svg viewBox="0 0 220 140" className="svg-lg" aria-hidden="true">
      <rect x="16" y="28" width="188" height="84" rx="12" fill="var(--surface)" stroke="var(--line-2)" />
      <text x="110" y="48" textAnchor="middle" fontSize="9" fill="var(--faint)">Host environment</text>
      <rect x="32" y="62" width="68" height="32" rx="7" fill="var(--brand-soft)" stroke="var(--brand)" />
      <text x="66" y="82" textAnchor="middle" fontSize="8" fill="var(--brand-strong)">App</text>
      <rect x="120" y="62" width="68" height="32" rx="7" fill="var(--accent-soft)" stroke="var(--accent)" />
      <text x="154" y="82" textAnchor="middle" fontSize="8" fill="var(--ink-2)">Database</text>
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

/* ------------------------------------------------------------------- Icons */
function svgProps(size = 16) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
}

function CheckIcon({ size }) {
  return (
    <svg {...svgProps(size || 14)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg {...svgProps(17)}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg {...svgProps(17)} fill="currentColor" stroke="none">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg {...svgProps(17)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </svg>
  );
}

function DiagramIcon() {
  return (
    <svg {...svgProps(17)}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <path d="M10 6.5h7v7" />
    </svg>
  );
}

function DeckIcon() {
  return (
    <svg {...svgProps(17)}>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M12 17v4M8 21h8" />
    </svg>
  );
}

function VivaIcon() {
  return (
    <svg {...svgProps(17)}>
      <path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12Z" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg {...svgProps(17)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5 16 12l-6 3.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg {...svgProps(17)}>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg {...svgProps(15)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
