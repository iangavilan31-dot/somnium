// Pre-grade sanity: Ian grades live at 1920×1080 — verify composition + R-replay there.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("docs/gate0", { recursive: true });
const browser = await chromium.launch({ headless: false, args: ["--window-position=40,40"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const state = () => page.evaluate(() => window.__somnium.state());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await page.goto("http://localhost:5131/?skip", { waitUntil: "load" });
const t0 = Date.now();
while ((await state()) !== "idle" && Date.now() - t0 < 15000) await sleep(150);
await sleep(1000);
await page.screenshot({ path: "docs/gate0/12-native-1080p.png" });
console.log("1080p idle ok, state:", await state());

// R-replay: must return to wake and complete again
await page.keyboard.press("KeyR");
await sleep(600);
const midState = await state();
const t1 = Date.now();
while ((await state()) !== "idle" && Date.now() - t1 < 15000) await sleep(150);
console.log("replay path:", midState, "→", await state());

const perf = await page.evaluate(() => window.__perf);
console.log("perf@1080p:", JSON.stringify(perf));
await browser.close();
