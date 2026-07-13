// PHASE 2.75c PROOF — §19 chain flow: J·J·J full sentence at 0.35× (arc review),
// then J·J + buffered I = the finisher slot. Real keys, strip stills → docs/depth/.
// PASS = no neutral reset between cuts; the finisher gathers from the follow-through.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/depth";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);
const state = () => ev("window.__somnium.state()");
const waitIdle = async (ms = 12000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms && (await state()) !== "idle") await sleep(80);
};

await page.goto("http://localhost:5131/?yard", { waitUntil: "load" });
await page.bringToFront();
await waitIdle();

// walk into post range
await page.keyboard.down("KeyD");
const t0 = Date.now();
while (Date.now() - t0 < 12000 && (await ev("window.__somnium.x()")) < 1330) await sleep(60);
await page.keyboard.up("KeyD");
await sleep(400);

// --- strip 1: the full light sentence at 0.35× (slowmo eats late key edges —
// buffers are 0.18s real-time, so tap on the STATE, not the clock) ---
await ev("window.__somnium.slow(0.35)");
let shot = 0;
const strip = async (tag) => { await page.screenshot({ path: `${OUT}/c${tag}-${String(shot++).padStart(2, "0")}.png` }); };
const tapWhenActing = async () => { // buffer the next cut mid-swing (real chain input)
  await page.keyboard.press("KeyJ");
  console.log("tap J | state:", await state());
};

await tapWhenActing();          // L1 begins
await sleep(320); await strip("hain");   // L1 windup/strike zone
await tapWhenActing();          // buffer L2 during L1
await sleep(430); await strip("hain");   // L1→L2 gather (NO neutral expected)
await sleep(320); await strip("hain");   // L2 strike
await tapWhenActing();          // buffer L3
await sleep(500); await strip("hain");   // L2→L3 gather into crouch load
await sleep(430); await strip("hain");   // L3 rise
await sleep(600); await strip("hain");   // L3 held cover frame
await ev("window.__somnium.slow(1)");
await waitIdle();
console.log("sentence complete. state:", await state());

// --- strip 2: the finisher slot — J·J then I buffered during L2's recovery ---
await sleep(400);
await ev("window.__somnium.slow(0.35)");
await page.keyboard.press("KeyJ");
await sleep(430);
await page.keyboard.press("KeyJ");
await sleep(600);                 // L2 mid-swing
await page.keyboard.press("KeyI"); // buffer the finisher (tap = quick release)
console.log("tapped I | state:", await state());
await sleep(400); await strip("fin");
await sleep(400); await strip("fin");   // charge gather from L2 follow-through
await sleep(500); await strip("fin");   // the heavy falls
await ev("window.__somnium.slow(1)");
await waitIdle();
console.log("finisher complete. state:", await state());

const fps = Math.round(await ev("window.__perf.fps"));
console.log("PERF fps=" + fps, fps >= 58 ? "OK" : "FAIL");
await browser.close();
console.log("CHAIN PROBE DONE");
