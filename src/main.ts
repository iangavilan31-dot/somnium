// SOMNIUM — Gate 0 spike: one knight, one painted slice of the Red-Sun Field.
// Pipeline: plates → world (knight+fx) → foreground → grain → vignette → lifted blacks.

import { clamp, damp, easeInOutCubic, lerp, noise1 } from "./math";
import { bakeEmberVeil, bakeGrainTiles, bakeScene, bakeVignette, GROUND_Y, PLATE_RES, SUN_R, SUN_X, SUN_Y, WORLD_W } from "./paint";
import { Knight } from "./knight";
import { Fx } from "./fx";
import { Input } from "./input";
import { drawDebug, type Perf } from "./debug";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const dpr = Math.min(devicePixelRatio || 1, 2);

let cw = 0, ch = 0; // canvas pixels
let vignette: HTMLCanvasElement;
function resize() {
  cw = canvas.width = Math.floor(innerWidth * dpr);
  ch = canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  vignette = bakeVignette(cw, ch);
}
addEventListener("resize", resize);
resize();

const scene = bakeScene();
const grain = bakeGrainTiles();
const emberVeil = bakeEmberVeil();
const fx = new Fx();
const knight = new Knight(1250);
const input = new Input();

const ZOOM_WIDE = 0.88, ZOOM_MID = 1.08; // the world dwarfs the knight
const cam = { x: 1200, zoom: ZOOM_WIDE };
let t = 0;
const skipTitle = location.search.includes("skip");
let seqT = skipTitle ? 4.55 : 0;
let wakeStarted = false;
let titleSkipped = skipTitle;
let whisperT = -1;
let debugOn = false;

// deterministic replay for capture: R restarts wake (not title)
function replay() {
  knight.resetToLying(1250);
  seqT = 4.55;
  wakeStarted = false;
  titleSkipped = true;
  whisperT = -1;
  cam.x = 1200; cam.zoom = ZOOM_WIDE;
}
declare global {
  interface Window {
    __perf: Perf;
    __somnium: { replay: () => void; state: () => string; attack: () => void; hit: () => void; walk: (ax: number) => void };
  }
}
let forcedAxis = 0;
window.__somnium = {
  replay,
  state: () => knight.state,
  attack: () => knight.tryAttack(),
  hit: () => knight.tryHit(fx),
  walk: (ax: number) => { forcedAxis = ax; },
};

const perf: Perf = { fps: 60, simMs: 0, renderMs: 0 };
window.__perf = perf;

// ---------- sim ----------
const DT = 1 / 120;
let acc = 0, last = performance.now();

function sim(dt: number) {
  t += dt;
  seqT += dt;
  input.pollPad();

  if (!wakeStarted && seqT >= 4.9) {
    wakeStarted = true;
    knight.startWake();
  }
  if (input.anyKeyThisFrame && seqT < 4.4 && !titleSkipped) {
    titleSkipped = true;
    seqT = 4.55;
  }

  const playable = knight.wakeDone;
  const axis = playable ? (forcedAxis !== 0 ? forcedAxis : input.axis()) : 0;
  if (playable) {
    if (input.attackPressed()) knight.tryAttack();
    if (input.hitPressed()) knight.tryHit(fx);
  }
  if (input.replayPressed()) replay();
  if (input.debugPressed()) debugOn = !debugOn;

  knight.update(dt, axis, t, fx);
  if (knight.attackSmearActive()) {
    const [tx, ty] = knight.swordTipWorld();
    const [gx, gy] = knight.swordGuardWorld();
    fx.smear(tx, ty, gx, gy);
  }
  fx.update(dt);

  // camera
  if (wakeStarted && !knight.wakeDone) {
    const p = clamp(knight.stateT / 4.25, 0, 1);
    cam.zoom = lerp(ZOOM_WIDE, ZOOM_MID, easeInOutCubic(p));
    cam.x = damp(cam.x, knight.x + knight.facing * 30, 2.5, dt);
  } else if (knight.wakeDone) {
    cam.zoom = ZOOM_MID + Math.sin(t * 0.5) * 0.006;
    cam.x = damp(cam.x, knight.x + knight.facing * 46, 3.2, dt);
    if (whisperT < 0) whisperT = 0; else whisperT += dt;
  } else {
    cam.x = 1200 + noise1(t * 0.1) * 6; // title drift
  }
  const vs = Math.max(cw / 1920, ch / 1080);
  const halfView = cw / (2 * vs * cam.zoom);
  cam.x = halfView >= WORLD_W / 2 ? WORLD_W / 2 : clamp(cam.x, halfView, WORLD_W - halfView);

  input.endFrame();
}

// ---------- render ----------
function render() {
  const vs = Math.max(cw / 1920, ch / 1080);
  const z = cam.zoom;
  const s = vs * z;
  const gsY = ch * 0.75; // ground anchor on screen
  const cx = cw / 2;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#050406";
  ctx.fillRect(0, 0, cw, ch);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "medium";

  const drawLayer = (layer: { canvas: HTMLCanvasElement; parallax: number; yOff: number; drift?: number }, alpha = 1) => {
    const p = layer.parallax;
    const redCam = cam.x * p + (1 - p) * (WORLD_W / 2);
    const dy = gsY + (layer.yOff - GROUND_Y) * s;
    const w = (layer.canvas.width / PLATE_RES) * s;
    const h = (layer.canvas.height / PLATE_RES) * s;
    ctx.globalAlpha = alpha;
    if (layer.drift) {
      // wrap-drift (clouds, fog): draw twice for a seamless pass-through
      const shift = (((t * layer.drift) % WORLD_W) + WORLD_W) % WORLD_W;
      const dx = cx + (shift - redCam) * s;
      ctx.drawImage(layer.canvas, dx, dy, w, h);
      ctx.drawImage(layer.canvas, dx - w, dy, w, h);
    } else {
      ctx.drawImage(layer.canvas, cx + (0 - redCam) * s, dy, w, h);
    }
    ctx.globalAlpha = 1;
  };

  for (const l of scene.layers) drawLayer(l);

  // THE EMBER BREATHES (World Bible §1) — an ~8.5s swell over everything the
  // Ember lights. Keeper-lights (tower windows, fireflies) keep their own time:
  // two kinds of light in this world — the Dreamer's, and somebody's work (Law 6).
  const breath = Math.pow(0.5 + 0.5 * Math.sin(t * ((Math.PI * 2) / 8.5)), 1.35);
  {
    const pSky = 0.04; // the sky plate's parallax — anchors the veil on the disc
    const skyCam = cam.x * pSky + (1 - pSky) * (WORLD_W / 2);
    const sx = cx + (SUN_X - skyCam) * s;
    const sy = gsY + (SUN_Y - GROUND_Y) * s;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const rOut = SUN_R * 4.6 * s;
    ctx.globalAlpha = 0.058 * breath;
    ctx.drawImage(emberVeil, sx - rOut, sy - rOut, rOut * 2, rOut * 2);
    const rIn = SUN_R * 2.1 * s;
    ctx.globalAlpha = 0.078 * breath;
    ctx.drawImage(emberVeil, sx - rIn, sy - rIn, rIn * 2, rIn * 2);
    ctx.restore();
  }

  // world pass (knight + fx share world coords)
  ctx.save();
  ctx.translate(cx + (0 - cam.x) * s, gsY + (0 - GROUND_Y) * s);
  ctx.scale(s, s);
  fx.draw(ctx);
  knight.draw(ctx);
  ctx.restore();

  // thorn sentinel — just in front of the play plane, frames the west edge
  drawLayer(scene.thorn);
  // foreground tufts — two baked variants crossfaded; the air is dead-still
  // (Chapter 1 law), so the lean rides the Ember's breath, not a wind
  const wA = 0.5 + 0.42 * Math.sin(t * 0.85 + noise1(t * 0.3) * 1.3) + 0.16 * (breath - 0.5);
  drawLayer(scene.fgA, wA);
  drawLayer(scene.fgB, 1 - wA);
  // nearest framing silhouettes (giant flowers, overhanging branch)
  drawLayer(scene.near);

  // ---- grade passes ----
  // film grain (overlay, animated between 3 tiles)
  const tile = grain[Math.floor(t * 9) % 3];
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.26;
  ctx.fillStyle = ctx.createPattern(tile, "repeat")!;
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();
  // vignette
  ctx.drawImage(vignette, 0, 0);
  // painterly glaze — one warm translucent wash unifies every layer
  // (plain source-over: 'soft-light' is not GPU-accelerated in Chromium and
  // collapsed rAF to ~26fps under the screen recorder)
  ctx.save();
  ctx.globalAlpha = 0.050 + 0.010 * breath; // the whole frame inhales warmth with the Ember
  ctx.fillStyle = "#8a4a30";
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();
  // lifted blacks — nothing in a scanned paperback is true black
  ctx.save();
  ctx.globalCompositeOperation = "lighten";
  ctx.fillStyle = "#150e0b";
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();

  drawText(vs);
  if (debugOn) drawDebug(ctx, perf, knight.state, cam.zoom, dpr);
}

function fadeAlpha(x: number, inS: number, inE: number, outS: number, outE: number) {
  if (x < inS || x > outE) return 0;
  if (x < inE) return (x - inS) / (inE - inS);
  if (x > outS) return 1 - (x - outS) / (outE - outS);
  return 1;
}

function drawText(vs: number) {
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = innerWidth, h = innerHeight;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (!titleSkipped) {
    const aT = fadeAlpha(seqT, 0.9, 2.0, 3.5, 4.5);
    if (aT > 0) {
      ctx.globalAlpha = aT * 0.88;
      ctx.fillStyle = "#d9cfc0";
      ctx.font = `500 ${Math.round(72 * (vs / dpr))}px "Cormorant Garamond", Georgia, serif`;
      try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "14px"; } catch { /* older engines */ }
      ctx.fillText("SOMNIUM", w / 2 + 7, h * 0.40);
    }
    const aTag = fadeAlpha(seqT, 1.7, 2.5, 3.4, 4.3);
    if (aTag > 0) {
      ctx.globalAlpha = aTag * 0.6;
      ctx.fillStyle = "#c9bda9";
      ctx.font = `400 ${Math.round(21 * (vs / dpr))}px "Cormorant Garamond", Georgia, serif`;
      try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "4px"; } catch { /* older engines */ }
      ctx.fillText("wake in a world", w / 2 + 2, h * 0.40 + 52 * (vs / dpr));
    }
  }

  if (whisperT >= 0) {
    const aW = fadeAlpha(whisperT, 0.8, 2.0, 4.6, 6.2);
    if (aW > 0) {
      ctx.globalAlpha = aW * 0.68;
      ctx.fillStyle = "#d5cabc";
      ctx.font = `400 ${Math.round(26 * (vs / dpr))}px "Cormorant Garamond", Georgia, serif`;
      try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "3px"; } catch { /* older engines */ }
      ctx.fillText("What will you do?", w / 2, h * 0.34);
    }
  }

  // opening fade from black
  const aBlack = 1 - clamp(seqT / 1.4, 0, 1);
  if (aBlack > 0) {
    ctx.globalAlpha = aBlack;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ---------- loop ----------
let fpsEma = 60;
function frame(now: number) {
  const rawDt = Math.min((now - last) / 1000, 0.1);
  last = now;
  fpsEma = fpsEma * 0.95 + (1 / Math.max(rawDt, 1e-4)) * 0.05;
  perf.fps = fpsEma;

  const s0 = performance.now();
  acc += rawDt;
  while (acc >= DT) { sim(DT); acc -= DT; }
  const s1 = performance.now();
  render();
  const s2 = performance.now();
  perf.simMs = perf.simMs * 0.9 + (s1 - s0) * 0.1;
  perf.renderMs = perf.renderMs * 0.9 + (s2 - s1) * 0.1;

  requestAnimationFrame(frame);
}

// wait for the serif (title is the first thing seen) — but never block forever
Promise.race([
  document.fonts.load('500 72px "Cormorant Garamond"'),
  new Promise((r) => setTimeout(r, 1500)),
]).then(() => {
  last = performance.now();
  requestAnimationFrame(frame);
});
