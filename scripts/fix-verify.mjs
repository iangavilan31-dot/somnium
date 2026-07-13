// Verify the four board fixes: L3 load coil, heavy charge head, quieting kneel,
// embrace held through the rise. Clips follow the knight via __somnium.sx().
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("docs/moveset", { recursive: true });
const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);
const clipStill = async (n, p2 = false) => {
  const sx = await ev(`window.__somnium.sx(${p2})`);
  const x = Math.max(0, Math.min(1920 - 620, sx - 310));
  await page.screenshot({ path: `docs/moveset/fix-${n}.png`, clip: { x, y: 460, width: 620, height: 540 } });
  console.log("still:", n);
};
const state = () => ev("window.__somnium.state()");
const waitIdle = async (ms = 9000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms && (await state()) !== "idle") await sleep(60);
};
const slow = (f) => ev(`window.__somnium.slow(${f})`);

await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
await waitIdle(12000);
await sleep(600);

// L3 load: J → J → J, still at the load
await slow(0.25);
await page.keyboard.press("KeyJ");
await sleep(900);
await page.keyboard.press("KeyJ");
await sleep(900);
await page.keyboard.press("KeyJ");
await sleep(1500); // L2 total ≈1.4s real; L3 load peaks ~0.8s in
await clipStill("L3load");
await sleep(300);
await clipStill("L3strike");
await slow(1);
await waitIdle();

// heavy charge: head up now
await page.keyboard.down("KeyI");
await sleep(650);
await clipStill("charge");
await page.keyboard.up("KeyI");
await waitIdle();

// quieting kneel
await ev("window.__somnium.quiet()");
await sleep(1500);
await clipStill("kneel");
await waitIdle(6000);

// embrace held through the rise
await ev("window.__somnium.join2()");
await sleep(6000);
await ev("window.__somnium.collapse2()");
await sleep(1400);
await page.keyboard.down("ArrowRight");
await sleep(280);
await page.keyboard.up("ArrowRight");
await sleep(200);
await page.keyboard.down("KeyS");
await sleep(1000);
await clipStill("embrace");
await sleep(700); // rise begins at 1.2s of embrace
await clipStill("embrace-rise");
await page.keyboard.up("KeyS");
await sleep(1500);
await clipStill("both-up");
await browser.close();
console.log("FIX VERIFY DONE");
