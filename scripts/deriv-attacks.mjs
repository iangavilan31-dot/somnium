// The three derivative attacks: running attack, rolling attack, backstep poke.
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);
const clipStill = async (n) => {
  const sx = await ev("window.__somnium.sx()");
  const x = Math.max(0, Math.min(1920 - 620, sx - 310));
  await page.screenshot({ path: `docs/moveset/fix-${n}.png`, clip: { x, y: 460, width: 620, height: 540 } });
  console.log("still:", n);
};
const waitIdle = async (ms = 9000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms && (await ev("window.__somnium.state()")) !== "idle") await sleep(60);
};
const slow = (f) => ev(`window.__somnium.slow(${f})`);

await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
await waitIdle(12000);
await sleep(600);

// RUNNING ATTACK: sprint, then J mid-stride
await page.keyboard.down("ArrowRight");
await page.keyboard.down("ShiftLeft");
await sleep(700);
await slow(0.25);
await page.keyboard.press("KeyJ");
await sleep(500);
await clipStill("runatk-strike");
await sleep(350);
await clipStill("runatk-skid");
await page.keyboard.up("ShiftLeft");
await page.keyboard.up("ArrowRight");
await slow(1);
await waitIdle();

// ROLLING ATTACK: roll with J buffered late
await slow(0.25);
await page.keyboard.down("ArrowLeft");
await page.keyboard.press("KeyK");
await sleep(1100); // late in the roll
await page.keyboard.press("KeyJ");
await page.keyboard.up("ArrowLeft");
await sleep(750);
await clipStill("rollatk-strike");
await slow(1);
await waitIdle();

// BACKSTEP POKE: neutral K, J buffered
await slow(0.25);
await page.keyboard.press("KeyK");
await sleep(300);
await page.keyboard.press("KeyJ");
await sleep(650);
await clipStill("poke-thrust");
await slow(1);
await browser.close();
console.log("DERIV ATTACKS DONE");
