// Gate 0 headed capture — VISIBLE window (hidden tabs freeze rAF and lie about perf).
// Records the full boot (title → wake) then drives walk/attack/hit with REAL key events.
// Outputs: docs/gate0/raw/*.webm + PNG stills + perf.json

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/gate0";
mkdirSync(`${OUT}/raw`, { recursive: true });

const browser = await chromium.launch({ headless: false, args: ["--window-position=80,60"] });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  recordVideo: { dir: `${OUT}/raw`, size: { width: 1600, height: 900 } },
});
const page = await context.newPage();

const still = async (name) => {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("still:", name);
};
const state = () => page.evaluate(() => window.__somnium.state());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log("loading…");
await page.goto("http://localhost:5131", { waitUntil: "load" });
await sleep(1800); // fonts + plate bake + fade from black

await still("01-title");
await sleep(2200);

// wake begins at seq 4.9s
const t0 = Date.now();
while ((await state()) !== "wake" && Date.now() - t0 < 8000) await sleep(100);
console.log("wake started");
await sleep(1400); await still("02-wake-pushup");
await sleep(1000); await still("03-wake-kneel");
await sleep(1400); await still("04-wake-rise");

const t1 = Date.now();
while ((await state()) !== "idle" && Date.now() - t1 < 8000) await sleep(100);
console.log("wake done → idle");
await sleep(1200); await still("05-idle");

// walk right — REAL key input
await page.keyboard.down("ArrowRight");
await sleep(700); await still("06-walk");
await sleep(1100);
await page.keyboard.up("ArrowRight");
await sleep(500);

// attack ×2 — stills at anticipation and strike
await page.keyboard.press("KeyJ");
await sleep(280); await still("07-attack-anticipation");
await sleep(140); await still("08-attack-strike");
await sleep(700);
await page.keyboard.press("KeyJ");
await sleep(1000);

// hit react
await page.keyboard.press("KeyH");
await sleep(120); await still("09-hit-react");
await sleep(900);

// walk left (facing flip)
await page.keyboard.down("ArrowLeft");
await sleep(900); await still("10-walk-left");
await page.keyboard.up("ArrowLeft");
await sleep(600);

// perf proof with debug overlay on
await page.keyboard.press("F1");
await sleep(1500);
const perf = await page.evaluate(() => window.__perf);
await still("11-perf-overlay");
await page.keyboard.press("F1");
writeFileSync(`${OUT}/perf.json`, JSON.stringify(perf, null, 2));
console.log("perf:", JSON.stringify(perf));

// one more idle beat so the video ends calm
await sleep(1200);

await context.close(); // flushes video
await browser.close();
console.log("capture complete");
