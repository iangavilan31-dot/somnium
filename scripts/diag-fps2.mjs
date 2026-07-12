// Which condition unthrottles rAF? Sweep viewport sizes + focus states.
import { chromium } from "playwright";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const vp of [{ width: 1920, height: 1080 }, { width: 1600, height: 900 }, { width: 1280, height: 720 }]) {
  const browser = await chromium.launch({ headless: false, args: ["--window-position=40,40"] });
  const page = await browser.newPage({ viewport: vp });
  await page.goto("http://localhost:5131/?skip", { waitUntil: "load" });
  await page.bringToFront();
  await sleep(2500);
  await page.evaluate(() => { window.__perf.fps = 60; });
  await sleep(3000);
  let p = await page.evaluate(() => window.__perf);
  console.log(`${vp.width}x${vp.height}`.padEnd(12), "fps", p.fps.toFixed(1), "render", p.renderMs.toFixed(2) + "ms");
  // after a real key press (user activation)
  await page.keyboard.press("KeyD");
  await page.evaluate(() => { window.__perf.fps = 60; });
  await sleep(3000);
  p = await page.evaluate(() => window.__perf);
  console.log("  +keypress ".padEnd(12), "fps", p.fps.toFixed(1));
  await browser.close();
}
