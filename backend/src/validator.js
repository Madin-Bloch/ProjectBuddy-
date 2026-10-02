const GENERIC = [
  /as we all know/i,
  /in today's world/i,
  /this project is very useful/i,
  /cutting[- ]edge/i,
  /revolutionize/i,
  /in conclusion, the system is perfect/i,
];

const FAKE_STACK = ["kubernetes", "microservices mesh", "blockchain", "hadoop", "spark", "kafka"];

export function validatePack(text, intel) {
  const issues = [];
  const body = String(text || "");
  const allowed = allowedTokens(intel);
  for (const re of GENERIC) {
    if (re.test(body)) issues.push("Removed generic filler language.");
  }
  for (const fake of FAKE_STACK) {
    if (new RegExp("\\b" + fake + "\\b", "i").test(body) && !allowed.has(fake.toLowerCase())) {
      issues.push(`Removed unverified technology: ${fake}`);
    }
  }
  return { ok: issues.length === 0, issues };
}

export function stripUnverified(text, intel) {
  let out = String(text || "");
  for (const re of GENERIC) out = out.replace(re, "");
  const allowed = allowedTokens(intel);
  for (const fake of FAKE_STACK) {
    if (!allowed.has(fake.toLowerCase())) {
      out = out.replace(new RegExp("\\b" + fake + "\\b", "gi"), "Not detected in source");
    }
  }
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

export function missingNotice(label, present) {
  if (present) return "";
  return `${label} was not detected in the submitted source, so this section is omitted instead of inventing details.\n`;
}

function allowedTokens(intel) {
  const i = intel?.intelligence || intel || {};
  const bits = [
    ...(i.frameworks || intel.stack?.frameworks || []),
    ...(i.databases || intel.stack?.database || []),
    ...(i.detectedLanguages || intel.languages || []),
    ...(i.libraries || []),
    ...(intel.stack?.tools || []),
  ];
  return new Set(bits.map((b) => String(b).toLowerCase()));
}
