#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginRoot = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"));
const distDir = path.join(pluginRoot, "dist");
const archiveName = `${manifest.name}-${manifest.version}.tar.gz`;
const archivePath = path.join(distDir, archiveName);

fs.mkdirSync(distDir, { recursive: true });
if (fs.existsSync(archivePath)) fs.rmSync(archivePath);

const excludeArgs = [
  "--exclude=.git",
  "--exclude=.tmp",
  "--exclude=node_modules",
  "--exclude=dist",
  "--exclude=.DS_Store",
  "--exclude=dashboard-lite/vault-lite.json"
];
const result = spawnSync("tar", [
  ...excludeArgs,
  "-czf",
  archivePath,
  "-C",
  path.dirname(pluginRoot),
  path.basename(pluginRoot)
], { stdio: "inherit" });

if (result.status !== 0) {
  console.error("tar packaging failed");
  process.exit(result.status || 1);
}

const size = fs.statSync(archivePath).size;
console.log(`Created ${archivePath}`);
console.log(`Size: ${size} bytes`);
