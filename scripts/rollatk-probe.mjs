import { chromium } from "playwright";
const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);
await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
let t0 = Date.now();
while (Date.now() - t0 < 12000 && (await ev("window.__somnium.state()")) !== "idle") await sleep(100);
await sleep(400);
await page.keyboard.down("ArrowRight");
await page.keyboard.press("KeyK");
await sleep(280); // late in the 433ms roll
await page.keyboard.press("KeyJ");
await page.keyboard.up("ArrowRight");
const states = [];
for (let i = 0; i < 20; i++) { states.push(await ev("window.__somnium.state()")); await sleep(30); }
console.log("roll→J:", states.join(","));
await browser.close();
