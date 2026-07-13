// PHASE 2.75a PROOF — the depth band, driven by real keys (M&C §18):
// walk the band (S toward / W away), diagonal, depth-roll (the circling verb),
// shade z-alignment AI, draw-order sanity, fps. Stills → docs/depth/.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/depth";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);
const kz = async () => +(await ev("window.__somnium.z()")).toFixed(1);
const kx = async () => Math.round(await ev("window.__somnium.x()"));
const state = () => ev("window.__somnium.state()");
const still = async (n, note = "") => {
  await page.screenshot({ path: `${OUT}/${n}.png` });
  console.log("still:", n, "| state:", await state(), "| x:", await kx(), "| z:", await kz(), note);
};
const waitIdle = async (ms = 12000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms && (await state()) !== "idle") await sleep(80);
};

await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
await waitIdle();
console.log("woke. z:", await kz());

// 1 — walk TOWARD the reader (S): z must rise, knight drops down-screen and grows
await still("01-before", "(band center)");
await page.keyboard.down("KeyS");
await sleep(1400);
await page.keyboard.up("KeyS");
const zNear = await kz();
await still("02-toward-reader", zNear > 20 ? "OK +z" : "FAIL: z did not rise");

// 2 — walk AWAY (W): z must fall past center to the far edge
await page.keyboard.down("KeyW");
await sleep(2600);
await page.keyboard.up("KeyW");
const zFar = await kz();
await still("03-away-far-edge", zFar < -20 ? "OK -z clamped" : "FAIL: z did not fall");

// 3 — diagonal (D+S): both axes move, speed normalized
const x0 = await kx();
await page.keyboard.down("KeyD");
await page.keyboard.down("KeyS");
await sleep(1000);
await page.keyboard.up("KeyD");
await page.keyboard.up("KeyS");
await still("04-diagonal", (await kx()) > x0 ? "OK x+z together" : "FAIL diagonal");

// 4 — depth-roll (the circling verb): hold W, tap K → roll should carry -z
const zBefore = await kz();
await page.keyboard.down("KeyW");
await sleep(60);
await page.keyboard.press("KeyK");
await sleep(120);
await page.keyboard.up("KeyW");
await sleep(150);
await still("05-depth-roll-mid", "(mid-roll)");
await sleep(700);
const zAfter = await kz();
console.log("depth-roll:", zBefore, "→", zAfter, zAfter < zBefore - 25 ? "OK circles" : "FAIL: roll ignored depth");

// 5 — shade alignment: sprint loud toward the teacher at x≈1900, then hold a
// different depth lane; the shade must walk its z toward ours before striking
await page.keyboard.down("KeyS"); // take the near lane
await sleep(1200);
await page.keyboard.up("KeyS");
await page.keyboard.down("KeyK"); // sprint-hold
await page.keyboard.down("KeyD");
const t0 = Date.now();
while (Date.now() - t0 < 15000 && (await kx()) < 1720) await sleep(80);
await page.keyboard.up("KeyD");
await page.keyboard.up("KeyK");
await sleep(400);
console.log("shades:", await ev("window.__somnium.shades()"), "| knight z:", await kz());
await sleep(2500); // let it stir + align
const shadeInfo = await ev("window.__somnium.shades()");
console.log("after stir:", shadeInfo, "| knight z:", await kz());
await still("06-shade-aligns", "(it should be walking into our lane)");
await sleep(2500);
await still("07-engagement");

// 6 — fps truth (in-page, headed, native res)
const fps = Math.round(await ev("window.__perf.fps"));
const simMs = (await ev("window.__perf.simMs")).toFixed(2);
const renderMs = (await ev("window.__perf.renderMs")).toFixed(2);
console.log(`PERF fps=${fps} sim=${simMs}ms render=${renderMs}ms`, fps >= 58 ? "OK" : "FAIL");

await browser.close();
console.log("DEPTH PROBE DONE");
