#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const vaultArg = args.find((arg) => !arg.startsWith("--"));

if (!vaultArg) {
  console.error("Usage: node scripts/compile-inbox.mjs <vault-path> [--dry-run]");
  process.exit(2);
}

const vaultRoot = path.resolve(expandHome(vaultArg));
const packetDir = path.join(vaultRoot, "00-inbox", "source-packets");
const allowedFolders = ["20-projects", "30-decisions", "40-methods", "50-context", "60-ai-skills", "80-agent-briefs"];
const compileResults = [];
const skippedResults = [];
const reviewItems = [];

if (!fs.existsSync(vaultRoot)) {
  console.error(`Vault does not exist: ${vaultRoot}`);
  process.exit(1);
}

if (!fs.existsSync(packetDir)) {
  console.log(`No source packet directory found: ${packetDir}`);
  process.exit(0);
}

for (const packet of fs.readdirSync(packetDir).filter((file) => file.endsWith(".md")).sort()) {
  const packetPath = path.join(packetDir, packet);
  const text = fs.readFileSync(packetPath, "utf8");
  const parsed = parsePacket(text);

  if (parsed.decision !== "compile") {
    reviewItems.push({ packet, reason: `decision is ${parsed.decision || "missing"}` });
    continue;
  }
  if (parsed.claims.length === 0) {
    reviewItems.push({ packet, reason: "no stable claims" });
    continue;
  }
  if (!parsed.target) {
    reviewItems.push({ packet, reason: "no promotion target" });
    continue;
  }
  const targetRel = normalizeTarget(parsed.target);
  if (!targetRel) {
    reviewItems.push({ packet, reason: `unsafe promotion target: ${parsed.target}` });
    continue;
  }

  const targetPath = path.join(vaultRoot, targetRel);
  const section = buildCompileSection(packet, targetRel, parsed.claims);
  if (targetAlreadyContainsPacket(targetPath, packet)) {
    skippedResults.push({ packet, target: targetRel, reason: "already compiled" });
    continue;
  }

  if (!dryRun) {
    ensureDir(path.dirname(targetPath));
    if (fs.existsSync(targetPath)) {
      fs.appendFileSync(targetPath, `\n\n${section}`, "utf8");
    } else {
      fs.writeFileSync(targetPath, buildNewTopicPage(targetRel, section), "utf8");
    }
    appendCompileLog(packetPath, targetRel);
  }
  compileResults.push({ packet, target: targetRel });
}

writeReviewSummary();

console.log(`${dryRun ? "Dry run" : "Compiled"} source packets`);
console.log(`Compiled: ${compileResults.length}`);
console.log(`Skipped: ${skippedResults.length}`);
console.log(`Needs review: ${reviewItems.length}`);
for (const result of compileResults) {
  console.log(`- ${result.packet} -> ${result.target}`);
}
for (const result of skippedResults) {
  console.log(`- skipped ${result.packet} -> ${result.target} (${result.reason})`);
}

function expandHome(input) {
  return input.replace(/^~(?=$|\/)/, process.env.HOME || "~");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function parsePacket(text) {
  return {
    title: parseFrontmatterField(text, "title") || "Source Packet",
    decision: parseMetadataField(text, "decision").toLowerCase(),
    target: firstUsefulLine(sectionLines(text, "Promotion Target")),
    claims: sectionLines(text, "Stable Claims")
      .map(cleanListLine)
      .filter((line) => line && !/^tbd\.?$/i.test(line))
  };
}

function parseFrontmatterField(text, field) {
  if (!text.startsWith("---\n")) return "";
  const end = text.indexOf("\n---", 4);
  if (end === -1) return "";
  const frontmatter = text.slice(4, end);
  const line = frontmatter.split("\n").find((candidate) => candidate.startsWith(`${field}:`));
  return line ? line.slice(field.length + 1).trim().replace(/^["']|["']$/g, "") : "";
}

function parseMetadataField(text, field) {
  const lines = sectionLines(text, "Metadata");
  const match = lines
    .map(cleanListLine)
    .find((line) => line.toLowerCase().startsWith(`${field.toLowerCase()}:`));
  return match ? match.slice(field.length + 1).trim() : "";
}

function sectionLines(text, heading) {
  const pattern = new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m");
  const match = pattern.exec(text);
  if (!match) return [];
  const start = match.index + match[0].length;
  const rest = text.slice(start);
  const next = rest.search(/^## /m);
  return (next === -1 ? rest : rest.slice(0, next)).split("\n").map((line) => line.trim()).filter(Boolean);
}

function cleanListLine(line) {
  return line.replace(/^[-*]\s*/, "").trim();
}

function firstUsefulLine(lines) {
  return lines.map(cleanListLine).find((line) => line && !/^tbd\.?$/i.test(line)) || "";
}

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTarget(target) {
  let value = target.replace(/^`|`$/g, "").trim();
  value = value.replace(/^\.?\//, "");
  if (!value.endsWith(".md")) value = `${value}.md`;
  if (value.includes("..") || path.isAbsolute(value)) return "";
  const first = value.split(/[\\/]/)[0];
  if (!allowedFolders.includes(first)) return "";
  return value.split(/[\\/]/).join(path.sep);
}

function buildCompileSection(packet, targetRel, claims) {
  const claimLines = claims.map((claim) => `- ${claim}`).join("\n");
  return `## Compiled From ${packet}

${claimLines}

${sourcePacketLine(packet)}

Compiled at: ${new Date().toISOString()}
Target: \`${targetRel}\``;
}

function targetAlreadyContainsPacket(targetPath, packet) {
  if (!fs.existsSync(targetPath)) return false;
  const text = fs.readFileSync(targetPath, "utf8");
  return text.includes(sourcePacketLine(packet));
}

function sourcePacketLine(packet) {
  return `Source packet: \`00-inbox/source-packets/${packet}\``;
}

function buildNewTopicPage(targetRel, section) {
  const base = path.basename(targetRel, ".md");
  const folder = targetRel.split(path.sep)[0];
  const typeMap = {
    "20-projects": "project",
    "30-decisions": "decision",
    "40-methods": "method",
    "50-context": "context",
    "60-ai-skills": "method",
    "80-agent-briefs": "agent-brief"
  };
  return `---
title: ${base}
type: ${typeMap[folder] || "note"}
domain: knowledge-vault
status: active
sensitivity: private
updated: ${today()}
tags: [compiled]
---

# ${base}

${section}
`;
}

function appendCompileLog(packetPath, targetRel) {
  const text = fs.readFileSync(packetPath, "utf8");
  if (text.includes(`compiled into \`${targetRel}\``)) return;
  const log = `\n## Compile Log\n\n- ${new Date().toISOString()}: compiled into \`${targetRel}\`.\n`;
  fs.appendFileSync(packetPath, log, "utf8");
}

function writeReviewSummary() {
  const reviewPath = path.join(vaultRoot, "_maintenance", "compile-review.md");
  const lines = reviewItems.length === 0
    ? ["- No source packets need review."]
    : reviewItems.map((item) => `- \`${item.packet}\`: ${item.reason}`);
  const body = `---
title: Compile Review
type: maintenance-log
domain: knowledge-vault
status: active
sensitivity: private
updated: ${today()}
tags: [maintenance, compile-review]
---

# Compile Review

## ${today()}

${lines.join("\n")}
`;
  if (!dryRun) {
    ensureDir(path.dirname(reviewPath));
    fs.writeFileSync(reviewPath, body, "utf8");
  }
}
