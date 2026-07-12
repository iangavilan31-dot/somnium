// Scene review pass — VISIBLE window, native 1920×1080 (mandatory on this box).
// Jumps to S2, walks to the fire, holds the rest ritual and rides the transition
// into S3 (proving the fire door), then reviews S3's vista and street.
// Outputs: docs/journey/r2-*.png, r3-*.png

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/journey";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const still = async (n) => { await page.screenshot({ path: `${OUT}/${n}.png` }); console.log("still:", n); };
const ev = (code) => page.evaluate(code);
const waitIdle = async (ms = 12000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms && (await ev("window.__somnium.state()")) !== "idle") await sleep(150);
};

console.log("loading…");
await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
await sleep(1600);
await waitIdle();

// ---- SCENE 2 (post-fix review) ----
await ev("window.__somnium.skipToScene(2)");
await sleep(2200); // bake + fade-in
await waitIdle();
await sleep(800);
await still("r2-spawn");

await ev("window.__somnium.walk(1)");
let t0 = Date.now();
while (Date.now() - t0 < 16000 && (await ev("window.__somnium.x()")) < 1785) await sleep(150);
await ev("window.__somnium.walk(0)");
await sleep(700);
await still("r2-fire");

// the rest ritual — hold it and ride the door into Scene 3
await ev("window.__somnium.rest(true)");
t0 = Date.now();
while (Date.now() - t0 < 12000 && (await ev("window.__somnium.scene()")) !== 3) await sleep(200);
await ev("window.__somnium.rest(false)");
const inS3 = (await ev("window.__somnium.scene()")) === 3;
console.log(inS3 ? "S2→S3 fire-door transition fired" : "FAIL: rest ritual did not open the door");
await sleep(400);
await still("r3-doorway"); // mid-fade or early entry — honest look at the seam

// ---- SCENE 3 ----
await sleep(2200);
await waitIdle();
await sleep(900);
await still("r3-vista");

await ev("window.__somnium.walk(1)");
t0 = Date.now();
while (Date.now() - t0 < 18000 && (await ev("window.__somnium.x()")) < 1860) await sleep(200);
await ev("window.__somnium.walk(0)");
await sleep(800);
await still("r3-street");

// ---- SCENE 4 ----
await ev("window.__somnium.skipToScene(4)");
await sleep(2400);
await waitIdle();
await sleep(900);
await still("r4-spawn");
await ev("window.__somnium.walk(1)");
t0 = Date.now();
while (Date.now() - t0 < 16000 && (await ev("window.__somnium.x()")) < 1300) await sleep(180);
await ev("window.__somnium.walk(0)");
await sleep(700);
await still("r4-mid");

const perf = await ev("window.__perf");
console.log("perf:", JSON.stringify(perf));
await browser.close();
console.log("scene review complete →", OUT);
