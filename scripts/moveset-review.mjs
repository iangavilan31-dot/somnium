// PHASE 2A REVIEW — every M&C §10 move driven by REAL key input on a visible
// window at native 1920×1080, captured as pose strips for the Review Board.
// Time is slowed 4× during captures so 3-frame strikes are photographable;
// the contracts themselves are unchanged (frame budgets scale with sim time).

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/moveset";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (code) => page.evaluate(code);
const still = async (n) => { await page.screenshot({ path: `${OUT}/${n}.png` }); console.log("still:", n); };
const state = () => ev("window.__somnium.state()");
const waitIdle = async (ms = 8000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms && (await state()) !== "idle") await sleep(60);
};
const slow = (f) => ev(`window.__somnium.slow(${f})`);

console.log("loading…");
await page.goto("http://localhost:5131?skip", { waitUntil: "load" });
await page.bringToFront();
await waitIdle(12000);
await sleep(800);

// ---- 1. SPRINT (§4): ramp, full stride, skid settle ----
await page.keyboard.down("ArrowRight");
await sleep(500); // settle into walk first
await page.keyboard.down("ShiftLeft");
await sleep(120);
await still("sprint-1-ramp");
await sleep(700);
await still("sprint-2-full");
await page.keyboard.up("ShiftLeft");
await sleep(70);
await still("sprint-3-skid");
await page.keyboard.up("ArrowRight");
await waitIdle();

// ---- 2. ROLL: tuck, mid-somersault, plant (slowed; arrow held THROUGH — slowmo eats late edges) ----
await slow(0.25);
await page.keyboard.down("ArrowRight");
await page.keyboard.press("KeyK");
await sleep(220);
await still("roll-1-tuck");
await sleep(330);
await still("roll-2-mid");
await sleep(400);
await still("roll-3-plant");
await page.keyboard.up("ArrowRight");
await slow(1);
await waitIdle();

// ---- 3. BACKSTEP (neutral roll-tap) ----
await slow(0.25);
await page.keyboard.press("KeyK");
await sleep(260);
await still("backstep-1-air");
await sleep(300);
await still("backstep-2-land");
await slow(1);
await waitIdle();

// ---- 4. LIGHT COMBO L1→L2→L3 (slowed; buffered real taps) ----
await slow(0.25);
await page.keyboard.press("KeyJ");
await sleep(520);
await still("combo-1-L1windup");
await sleep(180);
await still("combo-2-L1strike");
await page.keyboard.press("KeyJ"); // buffer L2
await sleep(500);
await still("combo-3-L2strike");
await page.keyboard.press("KeyJ"); // buffer L3
await sleep(700);
await still("combo-4-L3load");
await sleep(280);
await still("combo-5-L3strike");
await sleep(500);
await still("combo-6-L3held");
await slow(1);
await waitIdle();

// ---- 5. HEAVY: charge tremble, release smash ----
await page.keyboard.down("KeyI");
await sleep(650); // real-time charge
await still("heavy-1-charge");
await slow(0.25);
await page.keyboard.up("KeyI");
await sleep(220);
await still("heavy-2-strike");
await sleep(400);
await still("heavy-3-dig");
await slow(1);
await waitIdle();

// ---- 6. GUARD + chip ----
await page.keyboard.down("KeyL");
await sleep(400);
await still("guard-1-raise");
await ev("window.__somnium.hit()"); // a light blow chips the guard
await sleep(90);
await still("guard-2-chip");
await page.keyboard.up("KeyL");
await waitIdle();

// ---- 7. HUSH-PARRY: the catch, the held breath (petals frozen) ----
await slow(0.5);
await page.keyboard.press("KeyO");
await sleep(120); // inside the 8f window at 0.5×
await ev("window.__somnium.hit()");
await sleep(150);
await still("parry-1-catch");
await sleep(250);
await still("parry-2-heldbreath");
await slow(1);
await waitIdle();
console.log("parry state check — wounds after parry:", await ev("window.__somnium.wounds()"));

// ---- 8. QUIETING: raise, plant, kneel-hold ----
await ev("window.__somnium.quiet()");
await sleep(400);
await still("quiet-1-raise");
await sleep(350);
await still("quiet-2-plant");
await sleep(700);
await still("quiet-3-kneel");
await waitIdle(6000);

// ---- 9. COLLAPSE → CRAWL → SOLO RALLY ----
await ev("window.__somnium.collapse()");
await sleep(400);
await still("down-1-buckle");
await sleep(700);
await still("down-2-downed");
await page.keyboard.down("ArrowRight"); // crawl
await sleep(1200);
await still("down-3-crawl");
await page.keyboard.up("ArrowRight");
await sleep(5500); // solo rally kicks in at 6s down
await still("down-4-rise");
await waitIdle();
console.log("wounds after solo rally (expect 2):", await ev("window.__somnium.wounds()"));

// ---- 10. EMBRACE-REVIVE: P2 falls, P1 tends ----
await ev("window.__somnium.join2()");
await sleep(6000); // P2 wake
await ev("window.__somnium.collapse2()");
await sleep(1400);
await still("revive-1-p2down");
// P1 stands beside the fallen (P2 spawns ~80px right of P1) and holds the gesture
await page.keyboard.down("ArrowRight");
await sleep(300);
await page.keyboard.up("ArrowRight");
await sleep(300);
await page.keyboard.down("KeyS");
await sleep(700);
await still("revive-2-embrace");
await sleep(900);
await still("revive-3-rising");
await page.keyboard.up("KeyS");
await sleep(1600);
await still("revive-4-up");

const perf = await ev("window.__perf");
console.log("perf:", JSON.stringify(perf));
console.log("MOVESET REVIEW CAPTURED →", OUT);
await browser.close();
