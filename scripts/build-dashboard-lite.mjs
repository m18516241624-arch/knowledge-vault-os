#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const vaultArg = args.find((arg) => !arg.startsWith("--"));
let outPath = path.join(process.cwd(), "dashboard-lite", "vault-lite.json");

for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--out") outPath = path.resolve(expandHome(args[++i] || outPath));
}

if (!vaultArg) {
  console.error("Usage: node scripts/build-dashboard-lite.mjs <vault-path> [--out dashboard-lite/vault-lite.json]");
  process.exit(2);
}

const vaultRoot = path.resolve(expandHome(vaultArg));
if (!fs.existsSync(vaultRoot)) {
  console.error(`Vault does not exist: ${vaultRoot}`);
  process.exit(1);
}

const markdownFiles = walk(vaultRoot).filter((file) => file.endsWith(".md"));
const notes = markdownFiles.map((file) => readNote(file));
const data = {
  generatedAt: new Date().toISOString(),
  vaultName: path.basename(vaultRoot),
  noteCount: notes.length,
  distributions: {
    byFolder: countBy(notes, (note) => note.folder),
    byStatus: countBy(notes, (note) => note.frontmatter.status || "missing"),
    bySensitivity: countBy(notes, (note) => note.frontmatter.sensitivity || "missing"),
    byType: countBy(notes, (note) => note.frontmatter.type || "missing")
  },
  recentNotes: notes
    .slice()
    .sort((a, b) => (b.updated || "").localeCompare(a.updated || ""))
    .slice(0, 20),
  projects: notes
    .filter((note) => note.relativePath.startsWith(`20-projects${path.sep}`))
    .map((note) => ({
      title: note.title,
      path: note.relativePath,
      stage: note.frontmatter.project_stage || "",
      latestProgress: note.frontmatter.latest_progress || "",
      nextAction: note.frontmatter.next_action || "",
      blockers: note.frontmatter.blockers || "",
      updated: note.updated
    }))
    .slice(0, 50),
  evidenceQueue: notes
    .filter((note) => note.relativePath.startsWith(`00-inbox${path.sep}`) || note.frontmatter.status === "evidence")
    .map((note) => ({
      title: note.title,
      path: note.relativePath,
      status: note.frontmatter.status || "",
      sensitivity: note.frontmatter.sensitivity || "",
      updated: note.updated
    }))
    .slice(0, 100),
  health: buildHealth(notes)
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

console.log(`Dashboard lite data written: ${outPath}`);
console.log(`Notes indexed: ${data.noteCount}`);
console.log(`Health issues: ${data.health.length}`);

function expandHome(input) {
  return input.replace(/^~(?=$|\/)/, process.env.HOME || "~");
}

function walk(dir) {
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".tmp", "node_modules", "dist"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...walk(full));
    else if (entry.isFile()) output.push(full);
  }
  return output;
}

function readNote(file) {
  const text = fs.readFileSync(file, "utf8");
  const frontmatter = parseFrontmatter(text);
  const relativePath = path.relative(vaultRoot, file);
  const stat = fs.statSync(file);
  return {
    title: frontmatter.title || firstHeading(text) || path.basename(file, ".md"),
    relativePath,
    folder: relativePath.includes(path.sep) ? relativePath.split(path.sep)[0] : ".",
    frontmatter,
    updated: frontmatter.updated || stat.mtime.toISOString().slice(0, 10)
  };
}

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return {};
  const end = text.indexOf("\n---", 4);
  if (end === -1) return {};
  const output = {};
  for (const line of text.slice(4, end).split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    output[key] = value;
  }
  return output;
}

function firstHeading(text) {
  const line = text.split("\n").find((candidate) => candidate.startsWith("# "));
  return line ? line.slice(2).trim() : "";
}

function countBy(items, mapper) {
  return items.reduce((acc, item) => {
    const key = mapper(item) || "missing";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function buildHealth(items) {
  const issues = [];
  const required = ["title", "type", "status", "sensitivity", "updated", "tags"];
  for (const note of items) {
    for (const field of required) {
      if (!note.frontmatter[field]) {
        issues.push({
          severity: "metadata",
          path: note.relativePath,
          message: `missing ${field}`
        });
      }
    }
  }
  return issues.slice(0, 200);
}
