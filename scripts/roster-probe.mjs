// PHASE 2.75g PROOF — THE ROSTER (§21). Each kind gets a CLEAN yard (page reload),
// its lesson checked the way a player would learn it. Real keys.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/roster";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);
const state = () => ev("window.__somnium.state()");
const shades = () => ev("window.__somnium.shades()");
const wounds = () => ev("window.__somnium.wounds()");
const still = async (n) => { await page.screenshot({ path: `${OUT}/${n}.png` }); };
const waitIdle = async (ms = 12000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms && (await state()) !== "idle") await sleep(80);
};
const freshYard = async (spawnKey) => {
  await page.goto("http://localhost:5131/?yard", { waitUntil: "load" });
  await page.bringToFront();
  await waitIdle();
  await page.keyboard.press(spawnKey);
  await sleep(400);
};
const hold = async (key, ms) => { await page.keyboard.down(key); await sleep(ms); await page.keyboard.up(key); };
const waitShade = async (sub, ms = 12000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms && !(await shades()).includes(sub)) await sleep(50);
  return (await shades()).includes(sub);
};

// ---- 1 THE SEALED: front glances; the flank finds the seam ----
await freshYard("Digit2");
await hold("KeyD", 900); // stand at its face; it stirs from proximity
await sleep(2000);
await page.keyboard.press("KeyJ");
await sleep(700);
console.log("[sealed] front light (expect p4 glance):", await shades(), "| wounds:", await wounds());
await still("r1-sealed-wall");
await hold("KeyS", 600);   // step into the near lane
await page.keyboard.down("KeyK"); await hold("KeyD", 900); await page.keyboard.up("KeyK"); // sprint past the wall
await hold("KeyW", 550);   // back to its lane, behind it — it turns like a door
await hold("KeyA", 450);   // close to the seam
await page.keyboard.press("KeyJ");
await sleep(700);
console.log("[sealed] flank light (expect p3 — the seam):", await shades(), "| wounds:", await wounds());
await still("r2-sealed-flanked");

// ---- 2 THE STARTLED: the lunge is dodged by the depth-roll; the whiff sprawls it ----
await freshYard("Digit3");
// keep the noise up — silence would let it re-sleep (the de-escalation law)
await page.keyboard.down("KeyD");
let ok = await waitShade("attack", 9000);
await page.keyboard.up("KeyD");
if (ok) {
  await page.keyboard.down("KeyW");
  await page.keyboard.press("KeyK");
  await page.keyboard.up("KeyW");
  for (let i = 0; i < 8; i++) { // catch the sprawl window
    await sleep(220);
    const s = await shades();
    if (s.includes("stagger")) { console.log("[startled] SPRAWLED after whiff:", s); break; }
    if (i === 7) console.log("[startled] no sprawl seen (check):", s);
  }
  await still("r3-startled-sprawl");
  console.log("[startled] wounds after dodge:", await wounds());
}

// ---- 3 THE BURDENED: lights glance; dodge its arc, then the heavy speaks ----
await freshYard("Digit4");
await hold("KeyD", 1000); // approach the mass
await sleep(1200);
await page.keyboard.press("KeyJ");
await sleep(700);
console.log("[burdened] light (expect p6 glance):", await shades());
ok = await waitShade("attack", 14000); // its rear-up is half a breath longer
if (ok) {
  await page.keyboard.press("KeyK"); // backstep out of the arc
  await sleep(1300);                 // its heavy recovery is the window
  await page.keyboard.down("KeyD"); await sleep(260); await page.keyboard.up("KeyD");
  await page.keyboard.down("KeyI"); await sleep(500); await page.keyboard.up("KeyI");
  await sleep(1100);
  console.log("[burdened] heavy in its recovery (expect p<6 + dent):", await shades(), "| wounds:", await wounds());
  await still("r4-burdened-bell");
}

// ---- 4 THE CRIER: it kites, the wail shoves (no wound), it wakes the sleeping ----
await freshYard("Digit5");
await page.keyboard.press("Digit1"); // a second sleeper — the cry should stir it
await sleep(300);
await hold("KeyD", 700);
const w0 = await wounds();
// pace — a quiet knight is invisible to a thing that hunts noise
let cried = false;
for (let i = 0; i < 10 && !cried; i++) {
  await hold(i % 2 ? "KeyA" : "KeyD", 650);
  cried = (await shades()).includes("cry");
}
ok = cried || await waitShade("cry", 3000);
await still("r5-crier-wail");
await sleep(1500);
console.log(`[crier] wounds ${w0} → ${await wounds()} (expect equal) | field:`, await shades());
await still("r5b-crier-aftermath");

// ---- 5 THE REMEMBERED: draw it with one ring of steel, then parry the drill ----
await freshYard("Digit6");
await hold("KeyD", 900); // close enough that plate creaks (proximity whisper)
await sleep(2400);       // it rises like a lesson beginning
console.log("[remembered] drawn:", await shades());
ok = await waitShade("attack", 12000);
if (ok) {
  await sleep(240); // the rear-up is ~24f; the catch window sits at the crash
  await page.keyboard.press("KeyO");
  await sleep(500);
  const s = await shades();
  console.log("[remembered] after parry (stalled = the kneel):", s, "| wounds:", await wounds());
  await still("r6-remembered-kneel");
}

const fps = Math.round(await ev("window.__perf.fps"));
console.log("PERF fps=" + fps, fps >= 58 ? "OK" : "FAIL");
await browser.close();
console.log("ROSTER PROBE DONE");
