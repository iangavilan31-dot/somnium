// PHASE 1 EXIT PROOF — the whole journey walked end-to-end with REAL key input,
// recorded on a visible window at native 1920×1080. Title → wake → S1 dusk exit →
// S2 fire → S3 fire → S4 fire → S5 threshold → epilogue tree → "And waking up." →
// title. Output: docs/journey/raw/*.webm + full-run stills.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/journey";
mkdirSync(`${OUT}/raw`, { recursive: true });

const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: `${OUT}/raw`, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);
const still = async (n) => { await page.screenshot({ path: `${OUT}/${n}.png` }); console.log("still:", n); };

console.log("loading (title plays)…");
await page.goto("http://localhost:5131", { waitUntil: "load" });
await page.bringToFront();
await sleep(2200);
await still("full-01-title");

// wait through title + wake
let t0 = Date.now();
while (Date.now() - t0 < 20000 && (await ev("window.__somnium.state()")) !== "idle") await sleep(200);
await sleep(1500);
await still("full-02-wake");

const FIRES = { 2: 1850, 3: 1950, 4: 1910 };
const walkUntil = async (cond, timeout = 40000) => {
  await page.keyboard.down("ArrowRight");
  const s0 = Date.now();
  while (Date.now() - s0 < timeout && !(await cond())) await sleep(200);
  await page.keyboard.up("ArrowRight");
};

// S1 → dusk exit
await walkUntil(async () => (await ev("window.__somnium.scene()")) === 2);
console.log("→ Scene 2");
await sleep(2600);
t0 = Date.now();
while (Date.now() - t0 < 12000 && (await ev("window.__somnium.state()")) !== "idle") await sleep(200);
await still("full-03-s2");

// fire scenes: walk to the fire, rest together, ride the door
for (const [id, fx] of [[2, 3], [3, 4], [4, 5]]) {
  const fireX = FIRES[id];
  await walkUntil(async () => (await ev("window.__somnium.x()")) >= fireX - 62, 40000);
  await sleep(400);
  await page.keyboard.down("KeyS");
  t0 = Date.now();
  while (Date.now() - t0 < 14000 && (await ev("window.__somnium.scene()")) !== fx) await sleep(200);
  await page.keyboard.up("KeyS");
  console.log(`→ Scene ${fx}`);
  await sleep(2600);
  t0 = Date.now();
  while (Date.now() - t0 < 12000 && (await ev("window.__somnium.state()")) !== "idle") await sleep(200);
  await still(`full-0${fx + 1}-s${fx}`);
}

// S5 → threshold exit (past the kneeling watch)
await walkUntil(async () => (await ev("window.__somnium.scene()")) === 6, 45000);
console.log("→ Epilogue");
await sleep(2600);
t0 = Date.now();
while (Date.now() - t0 < 12000 && (await ev("window.__somnium.state()")) !== "idle") await sleep(200);
await still("full-07-epilogue");

// the last verb is walk
await walkUntil(async () => (await ev("window.__somnium.scene()")) === 1, 30000);
console.log("→ And waking up. (title)");
await sleep(3000);
await still("full-08-title-return");

const perf = await ev("window.__perf");
console.log("perf (end of run):", JSON.stringify(perf));
await context.close(); // flush video
await browser.close();
console.log("FULL JOURNEY COMPLETE — recorded to docs/journey/raw/");
