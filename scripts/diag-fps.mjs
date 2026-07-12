// Isolate what throttles rAF: baseline → screenshot → captureStream → stopped.
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false, args: ["--window-position=80,60"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await page.goto("http://localhost:5131/?skip", { waitUntil: "load" });
await page.bringToFront();
await sleep(2500);

const readFps = async (label) => {
  await page.evaluate(() => { window.__perf.fps = 60; });
  await sleep(3500);
  const p = await page.evaluate(() => window.__perf);
  console.log(label.padEnd(24), "fps", p.fps.toFixed(1), "render", p.renderMs.toFixed(2) + "ms");
};

await readFps("baseline");
await page.screenshot({ path: "docs/gate0/raw/diag.png" });
await readFps("after-1-screenshot");
await page.evaluate(() => {
  const c = document.getElementById("game");
  window.__s = c.captureStream(60);
});
await readFps("captureStream-on");
await page.evaluate(() => { window.__s.getTracks().forEach((t) => t.stop()); window.__s = null; });
await readFps("captureStream-stopped");
await browser.close();
