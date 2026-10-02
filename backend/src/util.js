import path from "path";

export function unique(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

export function uniqueBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr || []) {
    const k = keyFn(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

export function toSnake(name) {
  return String(name || "")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

export function capitalize(s) {
  return String(s || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function posix(rel) {
  return String(rel || "").replaceAll("\\", "/");
}

export function readJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function findFile(texts, pred) {
  return (texts || []).find((t) => pred(posix(t.rel), t));
}

export function fileNamed(texts, filename) {
  const base = filename.toLowerCase();
  return (texts || []).find((t) => path.basename(posix(t.rel)).toLowerCase() === base);
}

export function fact(name, value, evidence, confidence = 0.8) {
  return {
    fact: name,
    value,
    evidence: unique((evidence || []).filter(Boolean)).slice(0, 8),
    confidence,
  };
}

export function redactSecrets(content) {
  if (!content) return "";
  return String(content)
    .replace(/(api[_-]?key|secret|password|token|passwd|private_key)\s*[=:]\s*["']?[^"' \n]+/gi, "$1=***REDACTED***")
    .replace(/(sk-|ghp_|glpat-|AKIA)[A-Za-z0-9._-]{8,}/g, "***REDACTED***");
}

export function envKeysOnly(content) {
  const keys = [];
  const re = /^\s*([A-Z][A-Z0-9_]{2,})\s*=/gm;
  let m;
  while ((m = re.exec(content || ""))) keys.push(m[1]);
  return unique(keys);
}

export function snippet(content, max = 240) {
  return String(content || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function nowIso() {
  return new Date().toISOString();
}
