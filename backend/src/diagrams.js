function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeId(s) {
  return String(s || "item")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/^(\d)/, "n$1")
    .replace(/_+/g, "_") || "item";
}

function safeLabel(s) {
  return String(s || "")
    .replace(/"/g, "'")
    .slice(0, 72);
}

export function buildDiagrams(ctx) {
  const actors = (ctx.actors || ["User"]).slice(0, 4);
  const useCases = (ctx.modules || []).slice(0, 6).map((m) =>
    String(m).replace(/ module$/i, "").replace(/ management$/i, "")
  );
  const tables = (ctx.tables || []).slice(0, 8);
  const route = ctx.routes?.[0] || null;
  const intel = ctx.intel || ctx.scan?.intelligence || {};
  const fw = (intel.backend || ctx.scan.stack?.frameworks || [])[0] || ctx.scan.stack?.language || "Application";
  const db = (intel.databases || ctx.scan.stack?.database || [])[0] || null;
  const hasDocker = !!(ctx.scan.hasDocker || intel.configuration?.docker);
  const processes = useCases.slice(0, 5);

  const items = [];
  items.push({
    id: "use-case",
    title: "Use Case Diagram",
    file: "use-case",
    mermaid: useCaseMermaid(ctx.title, actors, useCases.length ? useCases : ["Use the application"]),
    svg: useCaseSvg(ctx.title, actors, useCases.length ? useCases : ["Use the application"]),
  });
  if (tables.length) {
    items.push({
      id: "er-diagram",
      title: "ER Diagram",
      file: "er-diagram",
      mermaid: erMermaid(tables),
      svg: erSvg(tables),
    });
  } else {
    items.push(omitted("er-diagram", "ER Diagram", "No tables or schema were detected in source."));
  }
  if (db || tables.length) {
    items.push({
      id: "dfd-level-0",
      title: "DFD Level 0",
      file: "dfd-level-0",
      mermaid: dfd0Mermaid(ctx.title, db || tables[0].name, actors),
      svg: dfd0Svg(ctx.title, db || tables[0].name, actors),
    });
  } else {
    items.push(omitted("dfd-level-0", "DFD Level 0", "No data store was detected in source."));
  }
  if (processes.length || tables.length) {
    items.push({
      id: "dfd-level-1",
      title: "DFD Level 1",
      file: "dfd-level-1",
      mermaid: dfd1Mermaid(tables, processes),
      svg: dfd1Svg(processes),
    });
  } else {
    items.push(omitted("dfd-level-1", "DFD Level 1", "No processes were detected in source."));
  }
  items.push({
    id: "architecture",
    title: "Architecture Diagram",
    file: "architecture",
    mermaid: archMermaid(fw, db || "Not detected in source", hasDocker),
    svg: archSvg(fw, db || "Not detected", hasDocker),
  });
  if (route) {
    items.push({
      id: "sequence",
      title: "Sequence Diagram",
      file: "sequence",
      mermaid: sequenceMermaid(`${route.method} ${route.path}`),
      svg: sequenceSvg(`${route.method} ${route.path}`),
    });
  } else {
    items.push(omitted("sequence", "Sequence Diagram", "No HTTP routes were detected in source."));
  }
  items.push({
    id: "activity",
    title: "Activity Diagram",
    file: "activity",
    mermaid: activityMermaid(intel.authentication, ctx.modules[0]),
    svg: activitySvg(intel.authentication, ctx.modules[0]),
  });
  items.push({
    id: "deployment",
    title: "Deployment Diagram",
    file: "deployment",
    mermaid: deployMermaid(fw, db || "Data store not detected", hasDocker),
    svg: deploySvg(fw, db || "Data store not detected", hasDocker),
  });
  return items;
}

function omitted(id, title, reason) {
  const svg = wrapSvg(
    720,
    180,
    `<rect x="40" y="50" width="640" height="90" rx="12" fill="#fff" stroke="#cbd5e1"/>
     <text x="360" y="90" text-anchor="middle" font-size="16" fill="#0f172a">${esc(title)} omitted</text>
     <text x="360" y="114" text-anchor="middle" font-size="13" fill="#64748b">${esc(reason)}</text>`,
    title
  );
  return {
    id,
    title,
    file: id,
    omitted: true,
    mermaid: `flowchart LR\n    N["${safeLabel(reason)}"]\n`,
    svg,
  };
}

function useCaseMermaid(title, actors, useCases) {
  const uc = useCases.length ? useCases : ["Manage records", "View reports"];
  return `flowchart LR
    ${actors.map((a, i) => `A${i}["${safeLabel(a)}"]`).join("\n    ")}
    subgraph SYS["${safeLabel(title)}"]
      ${uc.map((u, i) => `U${i}(["${safeLabel(u)}"])`).join("\n      ")}
    end
    ${actors.map((_, ai) => uc.map((_, ui) => (ui % actors.length === ai ? `A${ai} --> U${ui}` : "")).filter(Boolean).join("\n    ")).join("\n    ")}
`;
}

function erMermaid(tables) {
  const lines = ["erDiagram"];
  for (const t of tables) {
    const cols = (t.columns?.length ? t.columns : [{ name: "id", type: "int" }]).slice(0, 6);
    lines.push(`    ${safeId(t.name)} {`);
    for (const c of cols) lines.push(`        ${safeId(c.type || "string")} ${safeId(c.name)}`);
    lines.push("    }");
  }
  const names = tables.map((t) => safeId(t.name));
  for (let i = 1; i < names.length; i++) lines.push(`    ${names[0]} ||--o{ ${names[i]} : has`);
  return lines.join("\n") + "\n";
}

function dfd0Mermaid(title, db, actors) {
  return `flowchart TB
    User["${safeLabel(actors[0] || "User")}"] -->|"request"| Sys["${safeLabel(title)}"]
    Sys -->|"store"| DB[("${safeLabel(db)}")]
    Sys -->|"output"| Out["Reports"]
    Admin["${safeLabel(actors[1] || "Admin")}"] -->|"manage"| Sys
`;
}

function dfd1Mermaid(tables, processes) {
  const t0 = tables[0]?.name || "records";
  const procs = (processes.length ? processes : ["Capture", "Store"]).slice(0, 5);
  const nodes = procs.map((p, i) => `    P${i}["${i + 1}.0 ${safeLabel(p)}"]`).join("\n");
  const links = procs.map((_, i) => (i ? `    P${i - 1} --> P${i}` : `    U["User"] --> P0`)).join("\n");
  return `flowchart TB
${nodes}
${links}
    P${Math.max(procs.length - 1, 0)} --> DB[("${safeLabel(t0)}")]
`;
}

function archMermaid(fw, db, docker) {
  return `flowchart LR
    Browser["Web client"] --> App["${safeLabel(fw)}"]
    App --> API["Routes / services"]
    API --> DB["${safeLabel(db)}"]
    ${docker ? 'App --> Runtime["Docker"]' : ""}
`;
}

function sequenceMermaid(route) {
  return `sequenceDiagram
    actor User
    participant UI as Interface
    participant API as Application
    participant DB as Database
    User->>UI: Open ${safeLabel(route)}
    UI->>API: Submit request
    API->>DB: Read or write
    DB-->>API: Result
    API-->>UI: Response
    UI-->>User: Updated screen
`;
}

function activityMermaid(auth, moduleName) {
  const authStep = auth && auth.method && auth.method !== "Not detected in source" ? `Auth["${safeLabel(auth.method)}"]` : `Open["Open application"]`;
  const work = safeLabel(moduleName ? String(moduleName).replace(/ module$/i, "") : "Detected flow");
  return `flowchart TD
    Start(["Start"]) --> ${authStep}
    ${auth && auth.method && auth.method !== "Not detected in source" ? "Auth" : "Open"} --> Work["${work}"]
    Work --> Done(["Complete"])
`;
}

function deployMermaid(fw, db, docker) {
  if (docker) {
    return `flowchart LR
    Dev["Developer"] --> Image["Container image"]
    Image --> Host["Host"]
    Host --> App["${safeLabel(fw)}"]
    Host --> DB["${safeLabel(db)}"]
`;
  }
  return `flowchart LR
    Code["Source"] --> Server["Application server"]
    Server --> App["${safeLabel(fw)}"]
    App --> DB["${safeLabel(db)}"]
`;
}

function useCaseSvg(title, actors, useCases) {
  const uc = useCases.length ? useCases : ["Manage records", "View reports"];
  const h = Math.max(360, 120 + uc.length * 58);
  const actorCol = actors
    .map((a, i) => {
      const y = 80 + i * 70;
      return `<rect x="24" y="${y}" width="120" height="44" rx="8" fill="#eef2ff" stroke="#4338ca"/>
        <text x="84" y="${y + 28}" text-anchor="middle" font-size="13" fill="#1e1b4b" font-family="Inter,system-ui">${esc(a)}</text>`;
    })
    .join("");
  const sysH = 56 + uc.length * 52;
  const ovals = uc
    .map((u, i) => {
      const y = 70 + i * 52;
      return `<ellipse cx="470" cy="${y}" rx="130" ry="20" fill="#ecfdf5" stroke="#047857"/>
        <text x="470" y="${y + 5}" text-anchor="middle" font-size="13" fill="#064e3b" font-family="Inter,system-ui">${esc(u)}</text>
        <line x1="144" y1="${80 + (i % Math.max(actors.length, 1)) * 70 + 22}" x2="340" y2="${y}" stroke="#94a3b8" marker-end="url(#arr)"/>`;
    })
    .join("");
  return wrapSvg(
    720,
    h,
    `${actorCol}
    <rect x="300" y="36" width="340" height="${sysH}" rx="16" fill="#fff" stroke="#0f766e" stroke-dasharray="6 4"/>
    <text x="470" y="58" text-anchor="middle" font-size="13" fill="#0f766e" font-family="Inter,system-ui">${esc(title)}</text>
    ${ovals}`,
    "Use case"
  );
}

function erSvg(tables) {
  const list = tables.length ? tables : [{ name: "entity", columns: [{ name: "id", type: "int" }] }];
  const w = 180;
  const gap = 24;
  const cols = Math.min(4, list.length);
  const boxH = (t) => 42 + Math.max(1, (t.columns || []).slice(0, 6).length) * 20 + 12;
  let x = 24;
  let y = 56;
  let rowH = 0;
  let maxX = 400;
  const boxes = list
    .map((t, i) => {
      if (i && i % cols === 0) {
        x = 24;
        y += rowH + gap;
        rowH = 0;
      }
      const h = boxH(t);
      rowH = Math.max(rowH, h);
      const bx = x;
      const by = y;
      x += w + gap;
      maxX = Math.max(maxX, x);
      const attrs = (t.columns?.length ? t.columns : [{ name: "id", type: "int" }])
        .slice(0, 6)
        .map((c, ci) => `<text x="${bx + 12}" y="${by + 58 + ci * 20}" font-size="12" fill="#334155" font-family="ui-monospace,monospace">${esc(c.name)}: ${esc(c.type || "string")}</text>`)
        .join("");
      return `<rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="10" fill="#fff" stroke="#cbd5e1"/>
        <rect x="${bx}" y="${by}" width="${w}" height="34" rx="10" fill="#0f766e"/>
        <rect x="${bx}" y="${by + 18}" width="${w}" height="16" fill="#0f766e"/>
        <text x="${bx + 12}" y="${by + 22}" font-size="13" fill="white" font-family="Inter,system-ui" font-weight="600">${esc(t.name)}</text>
        ${attrs}`;
    })
    .join("");
  return wrapSvg(Math.max(720, maxX), y + rowH + 40, boxes, "Entity relationship");
}

function dfd0Svg(title, db, actors) {
  return wrapSvg(
    760,
    320,
    `<rect x="30" y="120" width="130" height="50" fill="#eef2ff" stroke="#4338ca"/>
     <text x="95" y="150" text-anchor="middle" font-size="13">${esc(actors[0] || "User")}</text>
     <circle cx="380" cy="145" r="58" fill="#ecfdf5" stroke="#047857"/>
     <text x="380" y="150" text-anchor="middle" font-size="13">${esc(title).slice(0, 22)}</text>
     <ellipse cx="640" cy="145" rx="80" ry="36" fill="#fff7ed" stroke="#c2410c"/>
     <text x="640" y="150" text-anchor="middle" font-size="13">${esc(db)}</text>
     <rect x="30" y="230" width="130" height="50" fill="#eef2ff" stroke="#4338ca"/>
     <text x="95" y="260" text-anchor="middle" font-size="13">${esc(actors[1] || "Admin")}</text>
     <line x1="160" y1="145" x2="322" y2="145" stroke="#64748b" marker-end="url(#arr)"/>
     <line x1="438" y1="145" x2="560" y2="145" stroke="#64748b" marker-end="url(#arr)"/>
     <line x1="160" y1="245" x2="340" y2="185" stroke="#64748b" marker-end="url(#arr)"/>`,
    "Context diagram"
  );
}

function dfd1Svg(processes) {
  const nodes = (processes.length ? processes : ["Detected flow"]).slice(0, 5).map((p, i) => `${i + 1}.0 ${p}`);
  const pos = [
    [120, 80],
    [360, 80],
    [600, 80],
    [360, 220],
    [600, 220],
  ];
  const circles = nodes
    .map((n, i) => `<circle cx="${pos[i][0]}" cy="${pos[i][1]}" r="42" fill="#ecfdf5" stroke="#047857"/>
      <text x="${pos[i][0]}" y="${pos[i][1] + 4}" text-anchor="middle" font-size="12">${esc(n)}</text>`)
    .join("");
  return wrapSvg(
    760,
    300,
    `${circles}
     <line x1="162" y1="80" x2="318" y2="80" stroke="#64748b" marker-end="url(#arr)"/>
     <line x1="402" y1="80" x2="558" y2="80" stroke="#64748b" marker-end="url(#arr)"/>
     <line x1="360" y1="122" x2="360" y2="178" stroke="#64748b" marker-end="url(#arr)"/>
     <line x1="600" y1="122" x2="600" y2="178" stroke="#64748b" marker-end="url(#arr)"/>`,
    "Level 1 processes"
  );
}

function archSvg(fw, db, docker) {
  const boxes = [
    [40, "Web client", "#eef2ff", "#4338ca"],
    [230, fw, "#ecfdf5", "#047857"],
    [420, "Routes / services", "#fef3c7", "#b45309"],
    [610, db, "#ffe4e6", "#be123c"],
  ];
  const rects = boxes
    .map(
      (b, i) => `<rect x="${b[0]}" y="110" width="150" height="64" rx="12" fill="${b[2]}" stroke="${b[3]}"/>
      <text x="${b[0] + 75}" y="148" text-anchor="middle" font-size="13">${esc(b[1])}</text>
      ${i < 3 ? `<line x1="${b[0] + 150}" y1="142" x2="${boxes[i + 1][0]}" y2="142" stroke="#64748b" marker-end="url(#arr)"/>` : ""}`
    )
    .join("");
  const dock = docker
    ? `<rect x="230" y="200" width="150" height="40" rx="8" fill="#f1f5f9" stroke="#475569"/><text x="305" y="225" text-anchor="middle" font-size="12">Docker runtime</text>`
    : "";
  return wrapSvg(800, 280, rects + dock, "Architecture");
}

function sequenceSvg(route) {
  const xs = [80, 250, 430, 610];
  const labels = ["User", "Interface", "Application", "Database"];
  const heads = labels
    .map((l, i) => `<rect x="${xs[i] - 50}" y="40" width="100" height="32" rx="6" fill="#0f172a"/>
      <text x="${xs[i]}" y="61" text-anchor="middle" font-size="12" fill="white">${l}</text>
      <line x1="${xs[i]}" y1="72" x2="${xs[i]}" y2="250" stroke="#cbd5e1" stroke-dasharray="4 4"/>`)
    .join("");
  const msgs = [
    [80, 250, 100, `Open ${route}`],
    [250, 430, 130, "Submit request"],
    [430, 610, 160, "Read / write"],
    [610, 430, 190, "Result"],
    [430, 250, 220, "Response"],
  ];
  const arrows = msgs
    .map(([x1, x2, y, label]) => {
      const left = Math.min(x1, x2);
      return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#2563eb" marker-end="url(#arr)"/>
        <text x="${left + Math.abs(x2 - x1) / 2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="#1e3a8a">${esc(label)}</text>`;
    })
    .join("");
  return wrapSvg(700, 280, heads + arrows, "Sequence");
}

function activitySvg(auth, moduleName) {
  const mid = auth && auth.method && auth.method !== "Not detected in source" ? String(auth.method).slice(0, 18) : "Open app";
  const work = String(moduleName || "Detected flow").replace(/ module$/i, "").slice(0, 18);
  const boxes = [
    [300, 30, 140, 36, "Start", true],
    [300, 96, 140, 36, mid, false],
    [300, 162, 140, 36, work, false],
    [300, 228, 140, 36, "Complete", true],
  ];
  const r = boxes
    .map((b, i) => {
      const [x, y, w, h, t, round] = b;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${round ? 18 : 8}" fill="${round ? "#0f766e" : "#fff"}" stroke="#0f766e"/>
        <text x="${x + w / 2}" y="${y + 23}" text-anchor="middle" font-size="13" fill="${round ? "white" : "#134e4a"}">${t}</text>
        ${i < boxes.length - 1 ? `<line x1="${x + w / 2}" y1="${y + h}" x2="${x + w / 2}" y2="${boxes[i + 1][1]}" stroke="#64748b" marker-end="url(#arr)"/>` : ""}`;
    })
    .join("");
  return wrapSvg(740, 320, r, "Activity");
}

function deploySvg(fw, db, docker) {
  const mid = docker ? "Container host" : "Application server";
  return wrapSvg(
    760,
    240,
    `<rect x="40" y="90" width="160" height="60" rx="10" fill="#eef2ff" stroke="#4338ca"/><text x="120" y="125" text-anchor="middle">Source / Dev</text>
     <rect x="300" y="90" width="160" height="60" rx="10" fill="#ecfdf5" stroke="#047857"/><text x="380" y="125" text-anchor="middle">${esc(mid)}</text>
     <rect x="560" y="50" width="160" height="50" rx="10" fill="#fff7ed" stroke="#c2410c"/><text x="640" y="80" text-anchor="middle">${esc(fw)}</text>
     <rect x="560" y="130" width="160" height="50" rx="10" fill="#ffe4e6" stroke="#be123c"/><text x="640" y="160" text-anchor="middle">${esc(db)}</text>
     <line x1="200" y1="120" x2="300" y2="120" stroke="#64748b" marker-end="url(#arr)"/>
     <line x1="460" y1="120" x2="560" y2="75" stroke="#64748b" marker-end="url(#arr)"/>
     <line x1="460" y1="120" x2="560" y2="155" stroke="#64748b" marker-end="url(#arr)"/>`,
    "Deployment"
  );
}

function wrapSvg(w, h, inner, caption) {
  const mid = "arr_" + Math.random().toString(36).slice(2, 8);
  const withMarks = inner.replaceAll("url(#arr)", `url(#${mid})`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <marker id="${mid}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#64748b"/>
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <text x="20" y="24" font-size="12" fill="#64748b" font-family="Inter,system-ui">${esc(caption)}</text>
  <g font-family="Inter,system-ui" fill="#0f172a">${withMarks}</g>
</svg>`;
}

function toSnake(name) {
  return String(name)
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase();
}
