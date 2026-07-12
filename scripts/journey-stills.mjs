// Journey spine review — VISIBLE window, native 1920×1080 (both mandatory).
// Exercises the real flow: S1 idle → walk east → dusk transition → S2 → walk to the
// fire → rest ritual (sit). Stills at each beat + P2 drop-in smoke test.
// Outputs: docs/journey/*.png

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

console.log("loading…");
await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
await sleep(1600);

// S1: wait for idle
let t0 = Date.now();
while (Date.now() - t0 < 15000 && (await ev("window.__somnium.state()")) !== "idle") await sleep(150);
await sleep(1200);
await still("s1-idle");

// walk east to the dusk exit (real key input)
await page.keyboard.down("ArrowRight");
t0 = Date.now();
while (Date.now() - t0 < 16000 && (await ev("window.__somnium.scene()")) !== 2) await sleep(200);
await page.keyboard.up("ArrowRight");
const inS2 = (await ev("window.__somnium.scene()")) === 2;
console.log(inS2 ? "S1→S2 transition fired (dusk edge-exit)" : "FAIL: never left scene 1");
await sleep(2400); // fade-in + wake
await still("s2-entry");

// wait for the chapter wake to finish, then compose a beat
t0 = Date.now();
while (Date.now() - t0 < 12000 && (await ev("window.__somnium.state()")) !== "idle") await sleep(150);
await sleep(900);
await still("s2-idle");

// walk to the fire (stop just west of it)
await page.keyboard.down("ArrowRight");
t0 = Date.now();
while (Date.now() - t0 < 18000) {
  const x = await ev("window.__somnium.x()");
  if (x > 1770) break;
  await sleep(180);
}
await page.keyboard.up("ArrowRight");
await sleep(700);
await still("s2-at-fire");

// the rest ritual — hold S (rest) near the fire; the sit is the door
await page.keyboard.down("KeyS");
await sleep(1800);
await still("s2-resting");
await page.keyboard.up("KeyS");

// P2 drop-in smoke test (no pad in CI: use the API hook; real-pad test is Ian's)
await ev("window.__somnium.join2()");
await sleep(2600);
await still("s2-two-knights");

const perf = await ev("window.__perf");
console.log("perf:", JSON.stringify(perf));
await browser.close();
console.log("journey capture complete →", OUT);
