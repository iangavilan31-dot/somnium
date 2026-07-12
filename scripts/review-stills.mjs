// Iteration review capture — VISIBLE window at native 1920×1080 (both mandatory:
// hidden tabs freeze rAF; sub-native viewports throttle the compositor to ~28fps).
// Measures the Ember breath objectively (disc-region brightness over one ~8.5s cycle)
// and saves stills at the brightest/dimmest sampled phases + the hero frame.
// Outputs: docs/gate0/review/*.png + breath report on stdout.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/gate0/review";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

console.log("loading…");
await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
await new Promise((r) => setTimeout(r, 1500));

// wait for the wake to finish → idle (the gradeable resting frame)
const t0 = Date.now();
while (Date.now() - t0 < 15000) {
  const s = await page.evaluate(() => window.__somnium.state());
  if (s === "idle") break;
  await new Promise((r) => setTimeout(r, 150));
}
console.log("idle reached — settling…");
await new Promise((r) => setTimeout(r, 2500)); // whisper fades, camera settles

// perf BEFORE any readbacks
const perfBefore = await page.evaluate(() => ({ ...window.__perf }));
console.log("perf (clean):", JSON.stringify(perfBefore));

// sample the disc region's mean red channel over ~9.4s (just over one breath cycle)
// disc screen pos at this cam: ~(902, 394); sample a 36px box safely inside the limb
const samples = [];
const N = 24;
for (let i = 0; i < N; i++) {
  const v = await page.evaluate(() => {
    const c = document.getElementById("game");
    const d = c.getContext("2d").getImageData(884, 376, 36, 36).data;
    let r = 0;
    for (let p = 0; p < d.length; p += 4) r += d[p];
    return r / (d.length / 4);
  });
  samples.push({ i, v, t: Date.now() });
  if (i === 0 || v <= Math.min(...samples.map((s) => s.v)))
    await page.screenshot({ path: `${OUT}/breath-min.png` });
  if (v >= Math.max(...samples.map((s) => s.v)))
    await page.screenshot({ path: `${OUT}/breath-max.png` });
  await new Promise((r) => setTimeout(r, 390));
}
const vals = samples.map((s) => s.v);
const lo = Math.min(...vals), hi = Math.max(...vals);
console.log(`breath: disc mean-R ${lo.toFixed(1)} → ${hi.toFixed(1)}  (swing ${(((hi - lo) / lo) * 100).toFixed(1)}%)`);

// hero frame, settled
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: `${OUT}/hero.png` });

// perf AFTER (readbacks may have dented it — the clean number is the truth)
const perfAfter = await page.evaluate(() => ({ ...window.__perf }));
console.log("perf (after readbacks):", JSON.stringify(perfAfter));

await browser.close();
console.log("review capture complete →", OUT);
