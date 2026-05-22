#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const options = {
  targetDate: null,
  maxFiles: 200
};
const positional = [];

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--target-date") {
    options.targetDate = args[++i] || null;
  } else if (arg === "--max-files") {
    options.maxFiles = Number.parseInt(args[++i] || "200", 10);
  } else {
    positional.push(arg);
  }
}

if (positional.length < 2) {
  console.error("Usage: node scripts/daily-capture.mjs <vault-path> <source-path> [...] [--target-date YYYY-MM-DD] [--max-files 200]");
  process.exit(2);
}

const [vaultArg, ...sourceArgs] = positional;
const vaultRoot = path.resolve(expandHome(vaultArg));
const targetDate = options.targetDate || previousLocalDate();
const capturedAt = new Date();
const capturedAtIso = capturedAt.toISOString();
const runStamp = `${capturedAtIso.replace(/[:.]/g, "-")}-${process.pid}`;
const packetFileName = `${targetDate}-daily-capture-${runStamp}.md`;
const { start, end } = localDateWindow(targetDate);
const sources = sourceArgs.map((source) => path.resolve(expandHome(source)));
const skipDirs = new Set([".git", ".tmp", "node_modules", "dist", "build", ".next", "__pycache__"]);
const skipFileNames = new Set([".DS_Store"]);

if (!fs.existsSync(vaultRoot)) {
  console.error(`Vault does not exist: ${vaultRoot}`);
  process.exit(1);
}

const changedFiles = [];
const missingSources = [];

for (const source of sources) {
  if (!fs.existsSync(source)) {
    missingSources.push(source);
    continue;
  }
  scanSource(source);
}

changedFiles.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
const limitedFiles = changedFiles.slice(0, options.maxFiles);
const overflow = Math.max(0, changedFiles.length - limitedFiles.length);

const packetPath = writeSourcePacket();
const ledgerPath = writeCaptureLedger();
const logPath = writeDailyLog();

console.log(`Daily capture target date: ${targetDate}`);
console.log(`Changed files found: ${changedFiles.length}`);
console.log(`Changed files recorded: ${limitedFiles.length}`);
if (overflow > 0) console.log(`Overflow omitted: ${overflow}`);
if (missingSources.length > 0) console.log(`Missing sources: ${missingSources.length}`);
console.log(`Source packet: ${packetPath}`);
console.log(`Capture ledger: ${ledgerPath}`);
console.log(`Daily log: ${logPath}`);

function expandHome(input) {
  return input.replace(/^~(?=$|\/)/, process.env.HOME || "~");
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function previousLocalDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

function localDateWindow(dateText) {
  const [year, month, day] = dateText.split("-").map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) {
    console.error(`Invalid --target-date: ${dateText}`);
    process.exit(2);
  }
  const windowStart = new Date(year, month - 1, day, 0, 0, 0, 0);
  const windowEnd = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  return { start: windowStart, end: windowEnd };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function scanSource(source) {
  const info = fs.statSync(source);
  if (info.isDirectory()) {
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
      if (entry.isDirectory() && skipDirs.has(entry.name)) continue;
      if (skipFileNames.has(entry.name)) continue;
      scanSource(path.join(source, entry.name));
    }
    return;
  }

  if (!info.isFile()) return;
  if (info.mtime < start || info.mtime >= end) return;
  if (info.size > 15 * 1024 * 1024) return;

  changedFiles.push({
    path: source,
    modifiedAt: info.mtime.toISOString(),
    size: info.size,
    kind: classifyFile(source)
  });
}

function classifyFile(file) {
  const ext = path.extname(file).toLowerCase();
  if ([".md", ".txt"].includes(ext)) return "note";
  if ([".js", ".mjs", ".ts", ".tsx", ".jsx", ".py", ".rb", ".sh", ".css", ".html"].includes(ext)) return "code";
  if ([".json", ".csv", ".tsv", ".yaml", ".yml", ".toml"].includes(ext)) return "data";
  if ([".docx", ".pptx", ".xlsx", ".pdf"].includes(ext)) return "document";
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) return "media";
  return "file";
}

function relativeOrAbsolute(file) {
  const rel = path.relative(process.cwd(), file);
  if (rel && !rel.startsWith("..") && !path.isAbsolute(rel)) return rel;
  return file;
}

function writeSourcePacket() {
  const packetDir = path.join(vaultRoot, "00-inbox", "source-packets");
  ensureDir(packetDir);
  const packetPath = path.join(packetDir, packetFileName);
  const sourceLines = sources.map((source) => `- ${source}${fs.existsSync(source) ? "" : " (missing)"}`).join("\n");
  const fileLines = limitedFiles.length === 0
    ? "- No changed files found in the target window."
    : limitedFiles.map((file) => `- ${file.kind}: \`${relativeOrAbsolute(file.path)}\` (${file.modifiedAt}, ${file.size} bytes)`).join("\n");
  const missingLines = missingSources.length === 0
    ? "- None."
    : missingSources.map((source) => `- ${source}`).join("\n");

  const body = `---
title: Daily Capture ${targetDate}
type: source-packet
domain: knowledge-vault
status: evidence
sensitivity: private
updated: ${formatDate(capturedAt)}
tags: [source-packet, daily-capture]
---

# Daily Capture ${targetDate}

## Metadata

- source_id: local_projects
- captured_at: ${capturedAtIso}
- source_window: ${targetDate} 00:00:00-23:59:59 local time
- sensitivity: private
- decision: review

## Sources

${sourceLines}

## Changed Files

${fileLines}

## Missing Sources

${missingLines}

## Stable Claims

- TBD. A human or Codex should review the changed files before promotion.

## Promotion Target

- TBD.

## Risk Note

- This packet records local file evidence only. It does not read private account systems, summarize file contents deeply, or decide that evidence should become durable knowledge.
`;
  fs.writeFileSync(packetPath, body, "utf8");
  return packetPath;
}

function writeCaptureLedger() {
  const ledgerDir = path.join(vaultRoot, "_maintenance", "capture-ledger");
  ensureDir(ledgerDir);
  const month = targetDate.slice(0, 7);
  const ledgerPath = path.join(ledgerDir, `${month}.md`);
  if (!fs.existsSync(ledgerPath)) {
    const initial = `---
title: Capture Ledger ${month}
type: capture-ledger
domain: knowledge-vault
status: active
sensitivity: private
updated: ${formatDate(capturedAt)}
tags: [maintenance, capture-ledger]
---

# Capture Ledger ${month}

| date | source | value level | stable conclusion | writeback target | compile status | sensitivity | next action |
|---|---|---|---|---|---|---|---|
`;
    fs.writeFileSync(ledgerPath, initial, "utf8");
  }
  const row = `| ${targetDate} | daily-capture (${limitedFiles.length}/${changedFiles.length} files) | evidence | Review changed files before promotion | 00-inbox/source-packets/${packetFileName} | review | private | Run compile review and promote only stable claims |\n`;
  fs.appendFileSync(ledgerPath, row, "utf8");
  return ledgerPath;
}

function writeDailyLog() {
  const logPath = path.join(vaultRoot, "_maintenance", "daily-log.md");
  ensureDir(path.dirname(logPath));
  if (!fs.existsSync(logPath)) {
    const initial = `---
title: Daily Log
type: maintenance-log
domain: knowledge-vault
status: active
sensitivity: private
updated: ${formatDate(capturedAt)}
tags: [maintenance, daily-log]
---

# Daily Log
`;
    fs.writeFileSync(logPath, initial, "utf8");
  }

  const entry = `### Daily Capture ${capturedAtIso}

- Daily capture scanned ${sources.length} source root(s) and found ${changedFiles.length} changed file(s); ${limitedFiles.length} file(s) were recorded in the source packet.
- Source packet: \`00-inbox/source-packets/${packetFileName}\`.
- Capture ledger updated: \`_maintenance/capture-ledger/${targetDate.slice(0, 7)}.md\`.
- Next triage:
  1. Review the source packet for reusable conclusions.
  2. Mark packets as \`decision: compile\` only when stable claims and promotion targets are clear.
  3. Run \`compile-inbox\` after the packet is ready.
`;
  const original = fs.readFileSync(logPath, "utf8");
  fs.writeFileSync(logPath, appendDateEntry(original, targetDate, entry), "utf8");
  return logPath;
}

function appendDateEntry(text, dateText, entry) {
  const marker = `## ${dateText}`;
  const startIndex = text.indexOf(marker);
  if (startIndex === -1) {
    const insertAt = text.indexOf("\n## ");
    const section = `${marker}\n\n${entry}`;
    if (insertAt === -1) return `${text.trimEnd()}\n\n${section}`;
    return `${text.slice(0, insertAt).trimEnd()}\n\n${section}\n${text.slice(insertAt + 1)}`;
  }
  const nextIndex = text.indexOf("\n## ", startIndex + marker.length);
  if (nextIndex === -1) {
    return `${text.trimEnd()}\n\n${entry}`;
  }
  return `${text.slice(0, nextIndex).trimEnd()}\n\n${entry}\n${text.slice(nextIndex + 1)}`;
}
