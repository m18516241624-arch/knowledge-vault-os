#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const options = {
  level: "L1",
  sensitivity: "private",
  decision: "inbox"
};
const positional = [];

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--level") {
    options.level = args[++i] || options.level;
  } else if (arg === "--sensitivity") {
    options.sensitivity = args[++i] || options.sensitivity;
  } else if (arg === "--decision") {
    options.decision = args[++i] || options.decision;
  } else {
    positional.push(arg);
  }
}

if (positional.length < 2) {
  console.error("Usage: node scripts/scan-sources.mjs <vault-path> <source-path-or-url> [...] [--level L1] [--sensitivity private] [--decision inbox]");
  process.exit(2);
}

const [vaultArg, ...sources] = positional;
const vaultRoot = path.resolve(vaultArg.replace(/^~(?=$|\/)/, process.env.HOME || "~"));
const packetDir = path.join(vaultRoot, "00-inbox", "source-packets");

if (!fs.existsSync(vaultRoot)) {
  console.error(`Vault does not exist: ${vaultRoot}`);
  process.exit(1);
}

fs.mkdirSync(packetDir, { recursive: true });

const now = new Date();
const iso = now.toISOString();
const fileStamp = iso.replace(/[:.]/g, "-");
const packetPath = path.join(packetDir, `${fileStamp}-source-packet.md`);

function sourceSummary(source) {
  if (/^https?:\/\//i.test(source)) {
    return `- ${source} (url)`;
  }
  const resolved = path.resolve(source.replace(/^~(?=$|\/)/, process.env.HOME || "~"));
  if (!fs.existsSync(resolved)) {
    return `- ${source} (missing local path, needs review)`;
  }
  const stat = fs.statSync(resolved);
  return `- ${resolved} (${stat.isDirectory() ? "directory" : "file"}, modified ${stat.mtime.toISOString()})`;
}

const body = `---
title: Source Packet ${iso.slice(0, 10)}
type: source-packet
domain: knowledge-vault
status: evidence
sensitivity: ${options.sensitivity}
updated: ${iso.slice(0, 10)}
tags: [source-packet, ingestion]
---

# Source Packet

## Metadata

- source_id: pending
- captured_at: ${iso}
- source_level: ${options.level}
- sensitivity: ${options.sensitivity}
- decision: ${options.decision}

## Sources

${sources.map(sourceSummary).join("\n")}

## Source Window

TBD.

## Summary

- TBD.

## Stable Claims

- TBD.

## Promotion Target

- TBD.

## Risk Note

- Confirm privacy, source quality, and whether this should remain evidence-only before compiling.
`;

fs.writeFileSync(packetPath, body, "utf8");
console.log(`Created source packet: ${packetPath}`);
