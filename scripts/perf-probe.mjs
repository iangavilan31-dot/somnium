// Perf probe — is the fps drop real or a bake-stall EMA artifact?
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);

await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
await sleep(6000);
console.log("S1 settled:", JSON.stringify(await ev("window.__perf")));

for (const id of [2, 3, 4, 5, 6]) {
  await ev(`window.__somnium.skipToScene(${id})`);
  await sleep(6000); // bake + full EMA recovery time
  console.log(`S${id} settled:`, JSON.stringify(await ev("window.__perf")));
}
await browser.close();
