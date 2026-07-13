// Diagnostic: does the roll state machine actually fire on a real K tap?
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);

await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
let t0 = Date.now();
while (Date.now() - t0 < 12000 && (await ev("window.__somnium.state()")) !== "idle") await sleep(100);
await sleep(500);

console.log("x before:", await ev("window.__somnium.x()"));
await page.keyboard.down("ArrowRight");
await sleep(300);
await page.keyboard.press("KeyK");
const states = [];
for (let i = 0; i < 24; i++) {
  states.push(await ev("window.__somnium.state()"));
  await sleep(30);
}
await page.keyboard.up("ArrowRight");
console.log("states after K tap:", states.join(","));
console.log("x after:", await ev("window.__somnium.x()"));

// neutral backstep
await sleep(600);
await page.keyboard.press("KeyK");
const st2 = [];
for (let i = 0; i < 14; i++) {
  st2.push(await ev("window.__somnium.state()"));
  await sleep(30);
}
console.log("states after neutral K:", st2.join(","));
await browser.close();
