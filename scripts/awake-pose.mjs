// Static pose harness: freeze THE FIRST AWAKE at fixed rise values and look.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("docs/awake", { recursive: true });
const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);

await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
let t0 = Date.now();
while (Date.now() - t0 < 12000 && (await ev("window.__somnium.state()")) !== "idle") await sleep(100);
await ev("window.__somnium.skipToScene(5)");
await sleep(2500);
t0 = Date.now();
while (Date.now() - t0 < 12000 && (await ev("window.__somnium.state()")) !== "idle") await sleep(100);
// stand the knight near him for scale
await page.keyboard.down("ArrowRight");
t0 = Date.now();
while (Date.now() - t0 < 15000 && (await ev("window.__somnium.x()")) < 1330) await sleep(80);
await page.keyboard.up("ArrowRight");
await sleep(600);

for (const r of [0.25, 0.5, 0.75, 1.0]) {
  await ev(`window.__somnium.awakePose(${r})`);
  await sleep(700); // pose blend settles (rig lerps are instant; camera drifts)
  await page.screenshot({ path: `docs/awake/pose-${String(r).replace(".", "_")}.png` });
  console.log("pose still:", r);
}
await browser.close();
console.log("POSE HARNESS DONE");
