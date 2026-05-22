#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
const args = process.argv.slice(2);
const homeDir = process.env.HOME || process.env.USERPROFILE || "";

if (!homeDir) {
  console.error("Cannot determine the home directory. Set HOME or USERPROFILE before installing.");
  process.exit(1);
}

const options = {
  dryRun: args.includes("--dry-run"),
  force: args.includes("--force"),
  marketplacePath: path.join(homeDir, ".agents", "plugins", "marketplace.json"),
  targetDir: path.join(homeDir, ".agents", "plugins", "plugins", "knowledge-vault-os")
};

for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--marketplace") {
    options.marketplacePath = path.resolve(expandHome(args[++i]));
  } else if (args[i] === "--target") {
    options.targetDir = path.resolve(expandHome(args[++i]));
  }
}

if (!fs.existsSync(manifestPath)) {
  console.error(`Plugin manifest not found: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const pluginName = manifest.name;
const marketplaceRoot = path.dirname(options.marketplacePath);

if (path.resolve(options.targetDir).startsWith(path.resolve(pluginRoot) + path.sep)) {
  console.error("Refusing to install inside the source checkout.");
  process.exit(1);
}

const exclude = new Set([".git", ".tmp", "node_modules", "dist", ".DS_Store"]);
const excludedRelativeFiles = new Set(["dashboard-lite/vault-lite.json"]);
const stats = { dirs: 0, files: 0, skipped: 0 };

function expandHome(input) {
  return input.replace(/^~(?=$|\/)/, homeDir);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    stats.dirs += 1;
    if (!options.dryRun) fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursive(source, target) {
  const base = path.basename(source);
  if (exclude.has(base)) return;
  const rel = path.relative(pluginRoot, source).split(path.sep).join("/");
  if (excludedRelativeFiles.has(rel)) return;

  const info = fs.statSync(source);
  if (info.isDirectory()) {
    ensureDir(target);
    for (const child of fs.readdirSync(source)) {
      copyRecursive(path.join(source, child), path.join(target, child));
    }
    return;
  }

  if (fs.existsSync(target) && !options.force) {
    stats.skipped += 1;
    return;
  }

  ensureDir(path.dirname(target));
  stats.files += 1;
  if (!options.dryRun) fs.copyFileSync(source, target);
}

function readMarketplace() {
  if (!fs.existsSync(options.marketplacePath)) {
    return {
      name: "personal",
      interface: { displayName: "Personal" },
      plugins: []
    };
  }
  try {
    return JSON.parse(fs.readFileSync(options.marketplacePath, "utf8"));
  } catch (error) {
    console.error(`Cannot read marketplace JSON: ${options.marketplacePath}`);
    console.error(error.message);
    process.exit(1);
  }
}

function writeMarketplace() {
  const marketplace = readMarketplace();
  if (!Array.isArray(marketplace.plugins)) marketplace.plugins = [];

  const relativePath = `./${path.relative(marketplaceRoot, options.targetDir).split(path.sep).join("/")}`;
  const entry = {
    name: pluginName,
    source: {
      source: "local",
      path: relativePath
    },
    policy: {
      installation: "AVAILABLE",
      authentication: "ON_INSTALL"
    },
    category: "Productivity"
  };

  const index = marketplace.plugins.findIndex((plugin) => plugin.name === pluginName);
  if (index >= 0) {
    marketplace.plugins[index] = entry;
  } else {
    marketplace.plugins.push(entry);
  }

  if (!options.dryRun) {
    fs.mkdirSync(path.dirname(options.marketplacePath), { recursive: true });
    fs.writeFileSync(options.marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`, "utf8");
  }
}

copyRecursive(pluginRoot, options.targetDir);
writeMarketplace();

console.log(`${options.dryRun ? "Dry run" : "Installed"} ${pluginName}`);
console.log(`Target: ${options.targetDir}`);
console.log(`Marketplace: ${options.marketplacePath}`);
console.log(`Directories created: ${stats.dirs}`);
console.log(`Files copied: ${stats.files}`);
console.log(`Files skipped: ${stats.skipped}`);
if (stats.skipped > 0 && !options.force) {
  console.log("Existing files were preserved. Re-run with --force only after reviewing the target.");
}
