// PHASE 2.75h REGRESSION — the journey with the kinded spawns: every scene enters
// clean, spawns exist with right kinds, no console errors, fps holds. S1 walked
// with real keys; later scenes entered via hook (smoke regression, not proof).
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);
const state = () => ev("window.__somnium.state()");
const waitIdle = async (ms = 12000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms && (await state()) !== "idle") await sleep(80);
};

await page.goto("http://localhost:5131/?skip", { waitUntil: "load" });
await page.bringToFront();
await waitIdle();

// S1: real-key SPRINT east past the teacher to the dusk exit — a knight who has
// learned the lesson outruns it (walking blindly into the Stirred is death, correctly)
await page.keyboard.down("KeyK"); // held = sprint (roll now fires only on short release)
await page.keyboard.down("KeyD");
let t0 = Date.now();
let sceneWas = 1;
while (Date.now() - t0 < 30000) {
  const sc = await ev("window.__somnium.scene()");
  if (sc !== sceneWas) { console.log("scene advanced:", sceneWas, "→", sc); sceneWas = sc; break; }
  await sleep(150);
}
await page.keyboard.up("KeyD");
await page.keyboard.up("KeyK");
console.log("S1 exit reached:", sceneWas === 2 ? "OK" : "FAIL (still scene " + sceneWas + ")", "| wounds:", await ev("window.__somnium.wounds()"));

// smoke-enter every scene FRESH (reload isolates state; settle before reading fps)
for (const id of [2, 3, 4, 5, 6]) {
  await page.goto("http://localhost:5131/?skip", { waitUntil: "load" });
  await waitIdle();
  await ev(`window.__somnium.skipToScene(${id})`);
  await sleep(6000); // bake + EMA settle
  const sc = await ev("window.__somnium.scene()");
  const sh = await ev("window.__somnium.shades()");
  const fps = Math.round(await ev("window.__perf.fps"));
  console.log(`scene ${id}: entered=${sc === id ? "OK" : "FAIL"} | spawns: ${sh || "(none)"} | fps ${fps}${fps >= 58 ? "" : " FAIL"}`);
}

console.log("page errors:", errors.length ? errors.join(" || ") : "NONE");
await browser.close();
console.log("JOURNEY REGRESSION DONE");
