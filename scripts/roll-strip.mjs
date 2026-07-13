// Roll pose strip: slow 0.1×, burst stills through the whole 26f roll.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("docs/moveset/strip", { recursive: true });
const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);

await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
let t0 = Date.now();
while (Date.now() - t0 < 12000 && (await ev("window.__somnium.state()")) !== "idle") await sleep(100);
await sleep(500);

await ev("window.__somnium.slow(0.1)");
await page.keyboard.down("ArrowRight");
await sleep(150);
await page.keyboard.press("KeyK");
for (let i = 0; i < 10; i++) {
  const st = await ev("window.__somnium.state()");
  await page.screenshot({ path: `docs/moveset/strip/roll-${String(i).padStart(2, "0")}-${st}.png`, clip: { x: 660, y: 480, width: 600, height: 520 } });
  await sleep(420); // ≈42ms sim ≈ 5 frames per still
}
await page.keyboard.up("ArrowRight"); // held THROUGH the roll: slowmo eats late edges
await ev("window.__somnium.slow(1)");
await browser.close();
console.log("strip done");
