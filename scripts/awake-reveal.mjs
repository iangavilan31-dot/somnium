// PHASE 3A PROOF — the reveal, driven by real footsteps on the buried floor:
// statue (indistinguishable) → tolls → ear moves FIRST → head turns over the
// shoulder → he stands, and stands, and stands → the ward: *quiet. stay.*
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/awake";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);
const boss = () => ev("window.__somnium.awake()");
const still = async (n) => {
  await page.screenshot({ path: `${OUT}/${n}.png` });
  console.log("still:", n, "|", await boss(), "| x:", Math.round(await ev("window.__somnium.x()")));
};
const waitIdle = async (ms = 9000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms && (await ev("window.__somnium.state()")) !== "idle") await sleep(60);
};

await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
await waitIdle(12000);
await ev("window.__somnium.skipToScene(5)");
await sleep(2500);
await waitIdle(12000);
await sleep(800);
console.log("scene 5 entered:", await boss());
await still("01-statue-peace");

// walk east onto the buried floor — each stride tolls
await page.keyboard.down("ArrowRight");
let t0 = Date.now();
while (Date.now() - t0 < 20000) {
  const b = await boss();
  if (b.startsWith("listen")) break;
  await sleep(80);
}
await page.keyboard.up("ArrowRight");
await still("02-ear-moves-first");
await sleep(2200); // the head comes around
await still("03-head-turn");

// more steps — he has heard enough
await page.keyboard.down("ArrowRight");
t0 = Date.now();
while (Date.now() - t0 < 15000) {
  if ((await boss()).startsWith("rise")) break;
  if ((await ev("window.__somnium.x()")) > 1470) break;
  await sleep(80);
}
await page.keyboard.up("ArrowRight");
console.log("rise begins:", await boss());
await sleep(1500);
await still("04-first-standing");
await sleep(2600);
await still("05-second-standing");
await sleep(2600);
await still("06-third-standing");
await sleep(2200);
await still("07-full-height");
t0 = Date.now();
while (Date.now() - t0 < 12000 && !(await boss()).startsWith("ward")) await sleep(100);
await sleep(1600);
await still("08-the-ward");
await sleep(2000);
await still("09-ward-held");

console.log("final:", await boss());
console.log("perf:", JSON.stringify(await ev("window.__perf")));
await browser.close();
console.log("REVEAL CAPTURED →", OUT);
