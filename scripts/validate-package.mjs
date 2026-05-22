#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
const skillPath = path.join(pluginRoot, "skills", "knowledge-vault-os", "SKILL.md");
const checks = [];

function pass(name) {
  checks.push({ name, ok: true });
}

function fail(name, message) {
  checks.push({ name, ok: false, message });
}

function runNodeScript(script, args) {
  return spawnSync(process.execPath, [path.join(pluginRoot, "scripts", script), ...args], {
    cwd: pluginRoot,
    encoding: "utf8"
  });
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const key of ["name", "version", "description", "skills", "interface"]) {
    if (!manifest[key]) throw new Error(`missing ${key}`);
  }
  pass("plugin manifest");
} catch (error) {
  fail("plugin manifest", error.message);
}

try {
  const text = fs.readFileSync(skillPath, "utf8");
  if (!text.startsWith("---\n")) throw new Error("missing frontmatter");
  const end = text.indexOf("\n---", 4);
  if (end < 0) throw new Error("unterminated frontmatter");
  const frontmatter = text.slice(4, end);
  for (const field of ["name:", "description:"]) {
    if (!frontmatter.split("\n").some((line) => line.startsWith(field))) {
      throw new Error(`missing ${field}`);
    }
  }
  pass("skill frontmatter");
} catch (error) {
  fail("skill frontmatter", error.message);
}

const demoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "kvo-demo-"));
try {
  const init = runNodeScript("init-vault.mjs", [demoRoot]);
  if (init.status !== 0) throw new Error(init.stderr || init.stdout);
  const scan = runNodeScript("scan-sources.mjs", [demoRoot, "README.md", "--level", "L1", "--sensitivity", "private", "--decision", "inbox"]);
  if (scan.status !== 0) throw new Error(scan.stderr || scan.stdout);
  const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "kvo-source-"));
  fs.writeFileSync(path.join(sourceRoot, "changed-note.md"), "# Changed Note\n", "utf8");
  const today = formatDate(new Date());
  const daily = runNodeScript("daily-capture.mjs", [demoRoot, sourceRoot, "--target-date", today]);
  if (daily.status !== 0) throw new Error(daily.stderr || daily.stdout);
  const packetDir = path.join(demoRoot, "00-inbox", "source-packets");
  const dailyAgain = runNodeScript("daily-capture.mjs", [demoRoot, sourceRoot, "--target-date", today]);
  if (dailyAgain.status !== 0) throw new Error(dailyAgain.stderr || dailyAgain.stdout);
  const dailyPackets = fs.readdirSync(packetDir).filter((file) => file.startsWith(`${today}-daily-capture-`) && file.endsWith(".md"));
  if (dailyPackets.length < 2) throw new Error("daily capture rerun did not create a separate source packet");
  const dailyLog = fs.readFileSync(path.join(demoRoot, "_maintenance", "daily-log.md"), "utf8");
  const dailyLogEntries = dailyLog.match(new RegExp(`### Daily Capture`, "g")) || [];
  if (dailyLogEntries.length < 2) throw new Error("daily capture rerun did not append a daily log entry");
  fs.writeFileSync(path.join(packetDir, "compile-test.md"), `---
title: Compile Test
type: source-packet
domain: knowledge-vault
status: evidence
sensitivity: private
updated: ${today}
tags: [source-packet]
---

# Compile Test

## Metadata

- decision: compile

## Stable Claims

- This is a reusable test claim.

## Promotion Target

- 40-methods/Test Method.md
`, "utf8");
  const compile = runNodeScript("compile-inbox.mjs", [demoRoot]);
  if (compile.status !== 0) throw new Error(compile.stderr || compile.stdout);
  const compileAgain = runNodeScript("compile-inbox.mjs", [demoRoot]);
  if (compileAgain.status !== 0) throw new Error(compileAgain.stderr || compileAgain.stdout);
  const compiledTarget = fs.readFileSync(path.join(demoRoot, "40-methods", "Test Method.md"), "utf8");
  const sourceRefs = compiledTarget.match(/Source packet: `00-inbox\/source-packets\/compile-test\.md`/g) || [];
  if (sourceRefs.length !== 1) throw new Error("compile inbox rerun duplicated the compiled section");
  const dashboardOut = path.join(os.tmpdir(), `kvo-dashboard-${Date.now()}.json`);
  const dashboard = runNodeScript("build-dashboard-lite.mjs", [demoRoot, "--out", dashboardOut]);
  if (dashboard.status !== 0) throw new Error(dashboard.stderr || dashboard.stdout);
  if (!fs.existsSync(dashboardOut)) throw new Error("dashboard output missing");
  const lint = runNodeScript("wiki-lint.mjs", [demoRoot]);
  if (lint.status !== 0) throw new Error(lint.stderr || lint.stdout);
  pass("demo vault workflow");
} catch (error) {
  fail("demo vault workflow", error.message);
} finally {
  fs.rmSync(demoRoot, { recursive: true, force: true });
}

const riskyPatterns = [
  /PersonalKnowledgeVault/,
  /\/Users\/aijiayu/,
  /醉清风/,
  /api[_-]?key\s*[:=]/i,
  /password\s*[:=]/i,
  /secret\s*[:=]/i,
  /cookie\s*[:=]/i,
  /token\s*[:=]/i
];
const safetyScanAllowlist = new Set([
  "SECURITY.md",
  "docs/RELEASE-CHECKLIST.md",
  "scripts/validate-package.mjs"
]);

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".tmp", "node_modules", "dist", ".DS_Store"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

try {
  const hits = [];
  for (const file of walk(pluginRoot)) {
    const rel = path.relative(pluginRoot, file);
    if (safetyScanAllowlist.has(rel)) continue;
    const text = fs.readFileSync(file, "utf8");
    for (const pattern of riskyPatterns) {
      if (pattern.test(text)) {
        hits.push(`${rel} :: ${pattern}`);
      }
    }
  }
  if (hits.length > 0) throw new Error(hits.join("\n"));
  pass("public-safety scan");
} catch (error) {
  fail("public-safety scan", error.message);
}

for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}${check.message ? `\n${check.message}` : ""}`);
}

if (checks.some((check) => !check.ok)) process.exit(1);
