// PHASE 2B REVIEW v2 — the S1 lone shade, fought with REAL keys, staying adjacent:
// stir → telegraph → parry stalls its ink → glance teach → heavy dent →
// lights connect → stagger → THE QUIETING → the world settles.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/stirred";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);
const shades = () => ev("window.__somnium.shades()");
const shadeX = async () => parseInt((await shades()).match(/@(-?\d+)/)[1], 10);
const myX = () => ev("window.__somnium.x()");
const still = async (n) => {
  const sx = await ev("window.__somnium.sx()");
  const x = Math.max(0, Math.min(1920 - 760, sx - 330));
  await page.screenshot({ path: `${OUT}/${n}.png`, clip: { x, y: 430, width: 760, height: 580 } });
  console.log("still:", n, "|", await shades(), "| wounds:", await ev("window.__somnium.wounds()"));
};
const waitIdle = async (ms = 9000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms && (await ev("window.__somnium.state()")) !== "idle") await sleep(60);
};
// keep the knight at fighting distance of the shade
const closeTo = async (gapWanted) => {
  for (let i = 0; i < 80; i++) {
    const [sx, mx] = [await shadeX(), await myX()];
    const gap = sx - mx;
    if (Math.abs(gap) <= gapWanted + 14 && Math.abs(gap) >= gapWanted - 26) return;
    const key = gap > 0 === Math.abs(gap) > gapWanted ? "ArrowRight" : "ArrowLeft";
    await page.keyboard.down(key);
    await sleep(90);
    await page.keyboard.up(key);
  }
};

await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
await waitIdle(12000);
await sleep(400);
console.log("spawn:", await shades());

// 1. sprint east — the noise stirs it
await page.keyboard.down("ArrowRight");
await page.keyboard.down("ShiftLeft");
let t0 = Date.now();
while (Date.now() - t0 < 20000 && (await myX()) < 1680) await sleep(90);
await page.keyboard.up("ShiftLeft");
await page.keyboard.up("ArrowRight");
await sleep(900);
await still("01-stirred");

// 2. stand close (proximity whisper holds it); parry its telegraphed crash
t0 = Date.now();
let parryOutcome = "none";
while (Date.now() - t0 < 15000) {
  await closeTo(80);
  const s = await shades();
  if (s.startsWith("attack")) {
    await sleep(230); // windup is 400ms — press O into the crash
    await page.keyboard.press("KeyO");
    await sleep(320);
    parryOutcome = await shades();
    break;
  }
  await sleep(50);
}
console.log("after parry attempt:", parryOutcome);
await still("02-parry-stall");

// 3. while it reels: light should CONNECT (it's open), then let it recover
await sleep(400);
await page.keyboard.press("KeyJ");
await sleep(600);
await still("03-light-on-open");

// 4. once it's composed (drawn, not open): light must GLANCE
t0 = Date.now();
while (Date.now() - t0 < 8000 && !(await shades()).startsWith("drawn")) await sleep(80);
await closeTo(80);
await page.keyboard.press("KeyJ");
await sleep(350);
await still("04-glance-teach");

// 5. heavy → DENT
await closeTo(80);
await page.keyboard.down("KeyI");
await sleep(550);
await page.keyboard.up("KeyI");
await sleep(600);
await still("05-dent");

// 6. now lights connect on the dented plate — push to stagger
for (let i = 0; i < 4; i++) {
  await closeTo(80);
  await page.keyboard.press("KeyJ");
  await sleep(500);
  if ((await shades()).startsWith("stagger")) break;
}
await still("06-stagger");

// 7. THE QUIETING — step in, hold the tend gesture, keep the vow
await closeTo(30);
await page.keyboard.down("KeyS");
await sleep(1000);
await still("07-vow");
await sleep(1100);
await still("08-settling");
await page.keyboard.up("KeyS");
await sleep(2400);
await still("09-quiet-again");
console.log("final:", await shades(), "| p1:", await ev("window.__somnium.state()"));
console.log("perf:", JSON.stringify(await ev("window.__perf")));
await browser.close();
console.log("STIRRED REVIEW v2 DONE →", OUT);
