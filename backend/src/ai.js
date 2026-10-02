const SYSTEM = `You write academic project documentation for Indian BCA/MCA/BTech/Diploma students.
Rules:
- Use only facts in the JSON evidence. Never invent tables, modules, APIs, actors, or technologies.
- If a fact is missing, write "Not detected in source" or omit the section. Do not guess.
- English only. Concrete, short sentences. No filler, no Hindi, no emojis.
- Return valid JSON only.`;

export function llmConfigured() {
  return Boolean(process.env.USER_LLM_API_KEY && process.env.USER_LLM_BASE_URL);
}

export async function understandProject(intel, answers) {
  const payload = compactIntel(intel, answers);
  if (!llmConfigured()) {
    return { mode: "deterministic", understanding: groundedUnderstanding(payload) };
  }
  try {
    const raw = await chatJson([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content:
          "Summarize this repository for a college report. Return JSON with keys: summary, problemFromCode, modules, architecture, data, auth, limitations, vivaAngles. Each claim must cite evidence paths from the input.\n" +
          JSON.stringify(payload),
      },
    ]);
    return { mode: "ai", understanding: raw };
  } catch {
    return { mode: "deterministic", understanding: groundedUnderstanding(payload) };
  }
}

export async function polishSection(name, draft, intel) {
  if (!llmConfigured()) return draft;
  try {
    const raw = await chatJson([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Rewrite the ${name} section. Keep every technical fact. Do not add new technologies or tables. Return JSON { "text": "..." }.\nFacts:\n${JSON.stringify(compactIntel(intel, {}))}\nDraft:\n${draft}`,
      },
    ]);
    return typeof raw?.text === "string" && raw.text.trim() ? raw.text.trim() : draft;
  } catch {
    return draft;
  }
}

async function chatJson(messages) {
  const base = String(process.env.USER_LLM_BASE_URL || "").replace(/\/$/, "");
  const model = process.env.USER_LLM_MODEL || "deepseek-chat";
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.USER_LLM_API_KEY}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.2, response_format: { type: "json_object" } }),
  });
  if (!res.ok) throw new Error("LLM request failed");
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "{}";
  return JSON.parse(text);
}

function compactIntel(intel, answers) {
  const i = intel?.intelligence || intel || {};
  return {
    title: answers?.title || i.projectName,
    languages: i.detectedLanguages || intel.languages,
    frameworks: i.frameworks || intel.stack?.frameworks,
    databases: i.databases || intel.stack?.database,
    tables: (i.databaseTables || intel.tables || []).map((t) => ({ name: t.name, columns: (t.columns || []).map((c) => c.name), evidence: t.evidence })),
    routes: (i.routes || intel.routes || []).slice(0, 25).map((r) => `${r.method} ${r.path} (${r.file})`),
    models: (i.models || intel.models || []).map((m) => `${m.name} ${m.file}`),
    auth: i.authentication || intel.authentication,
    modules: (i.modules || []).map((m) => (typeof m === "string" ? m : m.name)),
    features: (i.features || []).map((f) => f.name || f),
    tests: i.tests || { hasTests: intel.hasTests },
    readme: i.documentation?.hasReadme || intel.hasReadme,
    fileCount: intel.fileCount,
    warnings: i.warnings || intel.warnings,
  };
}

function groundedUnderstanding(p) {
  return {
    summary: `${p.title || "This project"} is implemented with ${(p.frameworks || []).join(", ") || (p.languages || []).join(", ") || "the files in the repository"}${p.databases?.length ? " and stores data in " + p.databases.join(", ") : ""}.`,
    problemFromCode: p.modules?.length ? `The code organizes ${p.modules.slice(0, 4).join(", ").toLowerCase()}.` : "The business problem is not fully described in source.",
    modules: p.modules || [],
    architecture: {
      frontend: (p.frameworks || []).filter((f) => /react|vue|angular|next/i.test(f)),
      backend: (p.frameworks || []).filter((f) => /laravel|express|django|flask|spring|php|node/i.test(f)),
      database: p.databases || [],
    },
    data: p.tables || [],
    auth: p.auth || { method: "Not detected in source" },
    limitations: [
      p.tests?.hasTests ? null : "No automated tests detected",
      p.readme ? null : "README incomplete or missing",
      p.auth?.method === "Not detected in source" ? "Authentication method not detected in source" : null,
    ].filter(Boolean),
    vivaAngles: (p.tables || []).slice(0, 3).map((t) => t.name).concat((p.routes || []).slice(0, 3)),
  };
}
