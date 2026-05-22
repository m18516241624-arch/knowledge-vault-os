#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginRoot = path.resolve(__dirname, "..");
const templateRoot = path.join(pluginRoot, "assets", "vault-template");

const args = process.argv.slice(2);
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");
const targetArg = args.find((arg) => !arg.startsWith("--"));

if (!targetArg) {
  console.error("Usage: node scripts/init-vault.mjs <target-vault-path> [--force] [--dry-run]");
  process.exit(2);
}

const targetRoot = path.resolve(targetArg.replace(/^~(?=$|\/)/, process.env.HOME || "~"));

if (!fs.existsSync(templateRoot)) {
  console.error(`Template not found: ${templateRoot}`);
  process.exit(1);
}

const stats = {
  dirs: 0,
  created: 0,
  skipped: 0,
  overwritten: 0
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    stats.dirs += 1;
    if (!dryRun) fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursive(source, target) {
  const info = fs.statSync(source);
  if (info.isDirectory()) {
    ensureDir(target);
    for (const child of fs.readdirSync(source)) {
      copyRecursive(path.join(source, child), path.join(target, child));
    }
    return;
  }

  if (fs.existsSync(target) && !force) {
    stats.skipped += 1;
    return;
  }

  ensureDir(path.dirname(target));
  if (fs.existsSync(target) && force) {
    stats.overwritten += 1;
  } else {
    stats.created += 1;
  }
  if (!dryRun) fs.copyFileSync(source, target);
}

copyRecursive(templateRoot, targetRoot);

console.log(`Knowledge Vault OS template ${dryRun ? "dry run" : "initialized"} at: ${targetRoot}`);
console.log(`Directories created: ${stats.dirs}`);
console.log(`Files created: ${stats.created}`);
console.log(`Files skipped: ${stats.skipped}`);
console.log(`Files overwritten: ${stats.overwritten}`);

if (stats.skipped > 0 && !force) {
  console.log("Existing files were preserved. Re-run with --force only after reviewing conflicts.");
}
