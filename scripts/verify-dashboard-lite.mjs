#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

let chromium;
let PNG;
try {
  ({ chromium } = await import("playwright"));
  ({ PNG } = await import("pngjs"));
} catch {
  console.error("Dashboard visual verification needs dev dependencies.");
  console.error("Run: npm install && npm run browsers:install");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginRoot = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const options = {
  headed: args.includes("--headed"),
  keepTemp: args.includes("--keep-temp"),
  screenshotDir: path.resolve(pluginRoot, ".tmp", "dashboard-lite-screenshots")
};

for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--out") {
    options.screenshotDir = path.resolve(args[++i]);
  }
}

const tmpRoot = path.join(pluginRoot, ".tmp", "dashboard-lite-verify");
const siteDir = path.join(tmpRoot, "site");
const demoVault = path.join(tmpRoot, "vault");
const templateVault = path.join(pluginRoot, "assets", "vault-template");
const dashboardSource = path.join(pluginRoot, "dashboard-lite");
const dataPath = path.join(siteDir, "vault-lite.json");

fs.rmSync(tmpRoot, { recursive: true, force: true });
fs.mkdirSync(siteDir, { recursive: true });
fs.mkdirSync(options.screenshotDir, { recursive: true });
fs.cpSync(dashboardSource, siteDir, { recursive: true });
fs.cpSync(templateVault, demoVault, { recursive: true });
writeDemoNotes(demoVault);

const build = spawnSync(process.execPath, [
  path.join(pluginRoot, "scripts", "build-dashboard-lite.mjs"),
  demoVault,
  "--out",
  dataPath
], {
  cwd: pluginRoot,
  encoding: "utf8"
});

if (build.status !== 0) {
  console.error(build.stderr || build.stdout || "Dashboard data build failed.");
  process.exit(build.status || 1);
}

const server = await startStaticServer(siteDir);
const baseUrl = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: !options.headed });
let failure = null;

const cases = [
  { name: "desktop", viewport: { width: 1440, height: 1000 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true }
];

try {
  for (const testCase of cases) {
    await verifyCase(testCase);
  }
  console.log("Dashboard visual verification passed.");
  console.log(`Screenshots: ${options.screenshotDir}`);
} catch (error) {
  failure = error;
  console.error(error.message);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  if (!options.keepTemp) fs.rmSync(tmpRoot, { recursive: true, force: true });
}

if (failure) process.exit(1);

async function verifyCase(testCase) {
  const context = await browser.newContext({
    viewport: testCase.viewport,
    isMobile: Boolean(testCase.isMobile),
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Number(document.querySelector("#noteCount")?.textContent || "0") > 0);
  await page.selectOption("#distributionSelect", "byType");

  const screenshotPath = path.join(options.screenshotDir, `dashboard-${testCase.name}.png`);
  const screenshot = await page.screenshot({ path: screenshotPath, fullPage: true });
  const imageStats = analyzeScreenshot(screenshot);
  const layout = await page.evaluate(() => {
    const rects = Array.from(document.querySelectorAll(".summary-grid article, .panel")).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        text: element.textContent.trim().slice(0, 80)
      };
    });
    return {
      title: document.querySelector("h1")?.textContent || "",
      noteCount: Number(document.querySelector("#noteCount")?.textContent || "0"),
      projectCount: Number(document.querySelector("#projectCount")?.textContent || "0"),
      distributionRows: document.querySelectorAll("#distribution .bar-row").length,
      panels: document.querySelectorAll(".panel").length,
      horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
      zeroSizedBlocks: rects.filter((rect) => rect.width < 20 || rect.height < 20)
    };
  });

  const failures = [];
  if (layout.title !== "Dashboard Lite") failures.push("title did not render");
  if (layout.noteCount <= 0) failures.push("note count did not load from generated JSON");
  if (layout.projectCount <= 0) failures.push("project cards did not render");
  if (layout.distributionRows <= 0) failures.push("distribution rows did not render");
  if (layout.panels < 4) failures.push("expected dashboard panels are missing");
  if (layout.horizontalOverflow > 2) failures.push(`horizontal overflow: ${layout.horizontalOverflow}px`);
  if (layout.zeroSizedBlocks.length > 0) failures.push("some dashboard blocks rendered at near-zero size");
  if (imageStats.uniqueSamples < 24) failures.push(`screenshot appears too visually flat: ${imageStats.uniqueSamples} sampled colors`);
  if (imageStats.nonTransparentRatio < 0.98) failures.push("screenshot contains unexpected transparency");
  if (consoleErrors.length > 0) failures.push(`browser console errors: ${consoleErrors.join(" | ")}`);

  await context.close();

  if (failures.length > 0) {
    throw new Error(`${testCase.name} dashboard verification failed:\n- ${failures.join("\n- ")}`);
  }
  console.log(`${testCase.name}: ok -> ${screenshotPath}`);
}

function analyzeScreenshot(buffer) {
  const png = PNG.sync.read(buffer);
  const seen = new Set();
  let samples = 0;
  let nonTransparent = 0;
  const step = Math.max(1, Math.floor(Math.min(png.width, png.height) / 80));

  for (let y = 0; y < png.height; y += step) {
    for (let x = 0; x < png.width; x += step) {
      const idx = (png.width * y + x) << 2;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const a = png.data[idx + 3];
      seen.add(`${Math.round(r / 8)},${Math.round(g / 8)},${Math.round(b / 8)},${Math.round(a / 8)}`);
      samples += 1;
      if (a > 245) nonTransparent += 1;
    }
  }

  return {
    uniqueSamples: seen.size,
    nonTransparentRatio: nonTransparent / Math.max(samples, 1)
  };
}

function writeDemoNotes(vaultRoot) {
  const projectDir = path.join(vaultRoot, "20-projects");
  const packetDir = path.join(vaultRoot, "00-inbox", "source-packets");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(packetDir, { recursive: true });

  fs.writeFileSync(path.join(projectDir, "Demo Project.md"), `---
title: Demo Project
type: project
domain: knowledge-vault
status: active
sensitivity: public
project_stage: "demo"
latest_progress: "Dashboard verification fixture for public release checks."
next_action: "Keep visual checks reproducible."
updated: 2026-05-22
tags: [demo, dashboard]
---

# Demo Project

This generated note exists only in the temporary visual verification vault.
`, "utf8");

  fs.writeFileSync(path.join(packetDir, "demo-source-packet.md"), `---
title: Demo Source Packet
type: source-packet
domain: knowledge-vault
status: evidence
sensitivity: public
updated: 2026-05-22
tags: [demo, source-packet]
---

# Demo Source Packet

## Metadata

- decision: review

## Stable Claims

- TBD.
`, "utf8");
}

function startStaticServer(rootDir) {
  const root = path.resolve(rootDir);
  const types = new Map([
    [".html", "text/html; charset=utf-8"],
    [".css", "text/css; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".png", "image/png"]
  ]);

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const filePath = path.resolve(root, `.${path.normalize(requested)}`);

    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "content-type": types.get(path.extname(filePath)) || "application/octet-stream"
    });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}
