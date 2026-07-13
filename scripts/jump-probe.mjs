// PHASE 2.75f PROOF — the jump (gap verb): running jump arc, shadow stays grounded,
// depth-steer damped, the falling cut lands on the Bound Post. Real keys.
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

// running jump: sprint east, Space mid-stride
await page.keyboard.down("KeyK");
await page.keyboard.down("KeyD");
await sleep(700);
await page.keyboard.press("Space");
await sleep(180);
await page.screenshot({ path: `${OUT}/j1-running-jump-air.png` });
console.log("air state:", await state()); // expect jump
await sleep(500);
await page.keyboard.up("KeyD");
await page.keyboard.up("KeyK");
console.log("after landing:", await state());
await waitIdle();

// walk near the post, jump + falling cut onto it
const t0 = Date.now();
await page.keyboard.down("KeyD");
while (Date.now() - t0 < 12000 && (await ev("window.__somnium.x()")) < 1290) await sleep(60);
await page.keyboard.up("KeyD");
await sleep(300);
await ev("window.__somnium.slow(0.45)");
await page.keyboard.down("KeyD");
await page.keyboard.press("Space");
await sleep(250);
await page.keyboard.press("KeyJ"); // the airborne cut
await sleep(320);
await page.screenshot({ path: `${OUT}/j2-falling-cut.png` });
console.log("mid-cut state:", await state());
await page.keyboard.up("KeyD");
await ev("window.__somnium.slow(1)");
await sleep(900);
await page.screenshot({ path: `${OUT}/j3-landed.png` });
console.log("landed state:", await state());

// journey must NOT allow free jump: reload plain, try Space
await page.goto("http://localhost:5131/?skip", { waitUntil: "load" });
await waitIdle();
await page.keyboard.press("Space");
await sleep(250);
const s2 = await state();
console.log("journey Space →", s2, s2 !== "jump" ? "OK (authored-only)" : "FAIL: free jump leaked");

const fps = Math.round(await ev("window.__perf.fps"));
console.log("PERF fps=" + fps, fps >= 58 ? "OK" : "FAIL");
await browser.close();
console.log("JUMP PROBE DONE");
