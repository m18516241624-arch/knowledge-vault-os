#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const vaultArg = process.argv[2];

if (!vaultArg) {
  console.error("Usage: node scripts/wiki-lint.mjs <vault-path>");
  process.exit(2);
}

const vaultRoot = path.resolve(vaultArg.replace(/^~(?=$|\/)/, process.env.HOME || "~"));
const requiredFiles = [
  "全局索引.md",
  "80-agent-briefs/knowledge-vault-entry.md",
  "80-agent-briefs/current-focus.md",
  "80-agent-briefs/wiki-maintenance-protocol.md",
  "_maintenance/source-registry.md",
  "_maintenance/daily-log.md"
];
const requiredFrontmatterFields = ["title", "type", "status", "sensitivity", "updated", "tags"];
const issues = [];

if (!fs.existsSync(vaultRoot)) {
  console.error(`Vault does not exist: ${vaultRoot}`);
  process.exit(1);
}

function walk(dir) {
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      output.push(full);
    }
  }
  return output;
}

for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(vaultRoot, rel))) {
    issues.push(`missing required file: ${rel}`);
  }
}

for (const file of walk(vaultRoot)) {
  const rel = path.relative(vaultRoot, file);
  if (rel.startsWith(`_templates${path.sep}`)) continue;

  const text = fs.readFileSync(file, "utf8");
  if (!text.startsWith("---\n")) {
    issues.push(`missing frontmatter: ${rel}`);
    continue;
  }
  const end = text.indexOf("\n---", 4);
  if (end === -1) {
    issues.push(`unterminated frontmatter: ${rel}`);
    continue;
  }
  const frontmatter = text.slice(4, end);
  for (const field of requiredFrontmatterFields) {
    const pattern = new RegExp(`^${field}:`, "m");
    if (!pattern.test(frontmatter)) {
      issues.push(`missing frontmatter field "${field}": ${rel}`);
    }
  }
}

if (issues.length === 0) {
  console.log(`Vault lint passed: ${vaultRoot}`);
  process.exit(0);
}

console.log(`Vault lint found ${issues.length} issue(s):`);
for (const issue of issues) {
  console.log(`- ${issue}`);
}
process.exit(1);
