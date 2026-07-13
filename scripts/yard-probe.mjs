// PHASE 2.75b PROOF — THE YARD (?yard): wake in the yard, strike the Bound Post
// (light glance vs heavy dent + wobble + hitstop), spawn a sparring Stirred with
// Digit1, settle it with Digit0. Real keys. Stills → docs/depth/.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/depth";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);
const state = () => ev("window.__somnium.state()");
const still = async (n, note = "") => {
  await page.screenshot({ path: `${OUT}/${n}.png` });
  console.log("still:", n, "| state:", await state(), "| x:", Math.round(await ev("window.__somnium.x()")), "| z:", +(await ev("window.__somnium.z()")).toFixed(1), note);
};
const waitIdle = async (ms = 12000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms && (await state()) !== "idle") await sleep(80);
};

await page.goto("http://localhost:5131/?yard", { waitUntil: "load" });
await page.bringToFront();
await waitIdle();
console.log("woke in the yard. scene:", await ev("window.__somnium.scene()"));
await still("y1-yard-wake", "(the yard, the post east)");

// walk to the post (x=1420) and test the strikes
await page.keyboard.down("KeyD");
const t0 = Date.now();
while (Date.now() - t0 < 12000 && (await ev("window.__somnium.x()")) < 1310) await sleep(60);
await page.keyboard.up("KeyD");
await sleep(300);

// three lights — post takes them (felt: no glance rule, always a thud)
for (let i = 0; i < 3; i++) { await page.keyboard.press("KeyJ"); await sleep(650); }
await still("y2-post-lights", "(dust + wobble expected)");

// charge heavy — big dent
await page.keyboard.down("KeyI");
await sleep(650);
await page.keyboard.up("KeyI");
await sleep(900);
await still("y3-post-heavy", "(dents visible on the wraps)");

// spawn a sparring Stirred, let it engage, then settle it
await page.keyboard.press("Digit1");
await sleep(2600);
await still("y4-sparring-spawned", "| shades: " + (await ev("window.__somnium.shades()")));
await page.keyboard.press("Digit0");
await sleep(2600);
await still("y5-settled", "| shades: " + (await ev("window.__somnium.shades()")));

const fps = Math.round(await ev("window.__perf.fps"));
console.log("PERF fps=" + fps, fps >= 58 ? "OK" : "FAIL");
await browser.close();
console.log("YARD PROBE DONE");
