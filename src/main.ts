// SOMNIUM — the journey. Pipeline: plates → world (knights+fx+fire) → foreground →
// grain → vignette → glaze → lifted blacks. Scenes bake lazily; the campfire ritual
// (rest together) re-dreams the world forward. Two knights, local drop-in.

import { clamp, damp, easeInOutCubic, lerp, noise1 } from "./math";
import { bakeEmberVeil, bakeGrainTiles, bakeGlowSprite, bakeVignette, GROUND_Y, PLATE_RES, WORLD_W } from "./paint";
import { Knight, NO_INTENT, type Intents } from "./knight";
import { Fx } from "./fx";
import { InputHub, type PlayerInput } from "./input";
import { drawDebug, type Perf } from "./debug";
import { Campfire, SCENES, type SceneBake, type SceneDef } from "./journey";
import { Shade, SHADE_SPAWNS } from "./stirred";
import { FirstAwake, AWAKE_X, FLOOR_L, FLOOR_R } from "./awake";
import "./scenes/index"; // registers scenes 2+ into SCENES

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

const grain = bakeGrainTiles();
const emberVeil = bakeEmberVeil();
const fireGlow = bakeGlowSprite();
const fx = new Fx();
const hub = new InputHub();

// ---------- scenes ----------
const bakes = new Map<number, SceneBake>();
let sceneIdx = 0; // index into SCENES
let scene: SceneDef = SCENES[0];
let bake: SceneBake;
let fire: Campfire | null = null;

function enterScene(idx: number, freshKnights: boolean) {
  sceneIdx = idx;
  scene = SCENES[idx];
  if (!bakes.has(scene.id)) bakes.set(scene.id, scene.bake());
  bake = bakes.get(scene.id)!;
  fire = scene.fireX != null ? new Campfire(scene.fireX) : null;
  fx.setScene(scene.id);
  shades = (SHADE_SPAWNS[scene.id] ?? []).map((x) => new Shade(x));
  hushBeatArmed = shades.length > 0;
  awake = scene.id === 5 ? new FirstAwake() : null;
  tollAcc = 0;
  for (const k of knights) {
    if (!k) continue;
    k.boundsL = scene.boundsL; k.boundsR = scene.boundsR;
    k.lightX = scene.lightX;
    if (freshKnights) {
      k.resetToLying(scene.spawnX + (k === knights[1] ? 70 : 0));
      k.startWake(); // every chapter opens with rising — the fiction of shared sleep
    }
  }
  cam.x = scene.spawnX;
  whisperT = scene.id === 1 ? -1 : 0; // scene 1's whisper waits for the wake
}

// ---------- knights ----------
const knights: (Knight | null)[] = [new Knight(SCENES[0].spawnX), null];
const p1 = knights[0]!;

// ---------- the Stirred ----------
let shades: Shade[] = [];
let hitstopT = 0;        // §10: applied only when a strike LANDS
let hushBeatArmed = false; // the 2s held breath when the LAST one settles (§9 canon)

// ---------- THE FIRST AWAKE (scene 5) ----------
let awake: FirstAwake | null = null;
let tollAcc = 0; // walked distance on the buried floor since the last toll

function joinP2() {
  if (knights[1]) return;
  const k = new Knight(clamp(p1.x + 80, scene.boundsL, scene.boundsR));
  k.boundsL = scene.boundsL; k.boundsR = scene.boundsR; k.lightX = scene.lightX;
  k.resetToLying(k.x);
  k.startWake(); // P2 does not join a lobby. P2 wakes up.
  knights[1] = k;
}

const ZOOM_WIDE = 0.88, ZOOM_MID = 1.08; // the world dwarfs the knights
const cam = { x: SCENES[0].spawnX - 50, zoom: ZOOM_WIDE };
let t = 0;
const skipTitle = location.search.includes("skip");
let seqT = skipTitle ? 4.55 : 0;
let wakeStarted = false;
let titleSkipped = skipTitle;
let whisperT = -1;
let debugOn = false;
let lastInputT = 0; // the repose: stillness invites the wide painting (M&C §1.5)
let lastDualT = -1e9; // last dual-parry (so one catch can't retrigger the full breath)
let timeScale = 1;    // QA-only slow motion (animation arc review); never shipped UI
let resetPending = false; // every knight down → re-dream this chapter from its start

// scene transition (the world re-dreams forward)
let trans: "none" | "out" | "in" = skipTitle ? "none" : "none";
let transT = 0;
const TRANS_S = 1.8;
function beginTransition() {
  if (trans !== "none") return;
  trans = "out"; transT = 0;
}

// deterministic replay for capture: R restarts the current scene's entry
function replay() {
  if (scene.id === 1) {
    p1.resetToLying(scene.spawnX);
    seqT = 4.55;
    wakeStarted = false;
    titleSkipped = true;
    whisperT = -1;
    if (knights[1]) { knights[1].resetToLying(scene.spawnX + 70); knights[1].startWake(); }
  } else {
    enterScene(sceneIdx, true);
  }
  cam.x = scene.spawnX; cam.zoom = ZOOM_WIDE;
}
declare global {
  interface Window {
    __perf: Perf;
    __somnium: {
      replay: () => void; state: () => string; attack: () => void; hit: () => void;
      walk: (ax: number) => void; scene: () => number; join2: () => void;
      rest: (held: boolean) => void; skipToScene: (id: number) => void; x: () => number;
      // Phase 2a QA hooks (real keys are still the law for proof captures)
      tap: (n: "attack" | "heavy" | "roll" | "parry") => void;
      sprint: (b: boolean) => void; guard: (b: boolean) => void;
      heavyHold: (b: boolean) => void; quiet: () => void;
      collapse: () => void; collapse2: () => void; wounds: () => number;
      slow: (f: number) => void; sx: (p2?: boolean) => number;
      shades: () => string;
      awake: () => string;
    };
  }
}
let forcedAxis = 0;
let forcedRest = false;
let forcedSprint = false;
let forcedGuard = false;
let forcedHeavyHold = false;
let forcedTap: Partial<Intents> = {};
window.__somnium = {
  replay,
  state: () => p1.state,
  attack: () => p1.tryAttack(),
  hit: () => p1.tryHit(fx),
  walk: (ax: number) => { forcedAxis = ax; },
  scene: () => scene.id,
  join2: joinP2,
  rest: (held: boolean) => { forcedRest = held; },
  skipToScene: (id: number) => {
    const i = SCENES.findIndex((s) => s.id === id);
    if (i >= 0) { enterScene(i, true); trans = "in"; transT = 0; }
  },
  x: () => p1.x,
  tap: (n) => {
    if (n === "attack") forcedTap.attackTap = true;
    else if (n === "heavy") forcedTap.heavyTap = true;
    else if (n === "roll") forcedTap.roll = true;
    else forcedTap.parryTap = true;
  },
  sprint: (b) => { forcedSprint = b; },
  guard: (b) => { forcedGuard = b; },
  heavyHold: (b) => { if (b && !forcedHeavyHold) forcedTap.heavyTap = true; forcedHeavyHold = b; },
  quiet: () => p1.startQuieting(),
  collapse: () => { p1.wounds = 2; p1.tryHit(fx); },
  collapse2: () => { const k = knights[1]; if (k) { k.wounds = 2; k.tryHit(fx); } },
  wounds: () => p1.wounds,
  slow: (f: number) => { timeScale = clamp(f, 0.05, 1); },
  sx: (p2 = false) => { // knight's CSS-px screen x (QA capture framing)
    const k = p2 ? knights[1] : p1;
    if (!k) return -1;
    const vs = Math.max(cw / 1920, ch / 1080);
    return (cw / 2 + (k.x - cam.x) * vs * cam.zoom) / dpr;
  },
  shades: () => shades.map((s) => `${s.state}@${Math.round(s.x)}p${s.posture}d${s.dents}`).join("|"),
  awake: () => (awake ? `${awake.state} t${awake.tolls}` : "none"),
};

const perf: Perf = { fps: 60, simMs: 0, renderMs: 0 };
window.__perf = perf;

// ---------- sim ----------
const DT = 1 / 120;
let acc = 0, last = performance.now();

function knightInput(k: Knight, partner: Knight | null, inp: PlayerInput, dt: number, forced: boolean) {
  const axis = forced && forcedAxis !== 0 ? forcedAxis : inp.axis();
  if (inp.hitPressed()) k.tryHit(fx);
  const nearFire = fire != null && Math.abs(k.x - fire.x) < 90;
  const stationary = Math.abs(axis) < 0.2;
  const held = (forced && forcedRest) || inp.restHeld();
  // ONE held gesture, two meanings: tend a fallen partner first, else rest at the fire
  const partnerDown = !!partner && partner.downed && Math.abs(k.x - partner.x) < 56;
  k.setEmbrace(partnerDown && held && stationary, partner ? partner.x : k.x);
  // THE QUIETING (§13): the same tend-gesture, aimed at a staggered Stirred —
  // rest, revive, still: one gesture family, three mercies
  if (held && stationary && (k.state === "idle" || k.state === "walk")) {
    const q = shades.find((s) => s.staggered && Math.abs(s.x - k.x) < 64);
    if (q && k.startQuieting()) q.beginQuieting();
  }
  k.setRest(held && nearFire && stationary && !partnerDown, fire ? fire.x : k.x);
  const ii: Intents = {
    axis: k.sitting || k.state === "embrace" ? 0 : axis,
    sprint: inp.sprintHeld() || (forced && forcedSprint),
    attackTap: inp.attackPressed() || !!(forced && forcedTap.attackTap),
    heavyTap: inp.heavyPressed() || !!(forced && forcedTap.heavyTap),
    heavyHeld: inp.heavyHeld() || (forced && forcedHeavyHold),
    // the settling gesture wins over the backstep at the fire
    roll: (inp.rollPressed() || !!(forced && forcedTap.roll)) && !(nearFire && stationary && held),
    guardHeld: inp.guardHeld() || (forced && forcedGuard),
    parryTap: inp.parryPressed() || !!(forced && forcedTap.parryTap),
  };
  if (forced) forcedTap = {};
  k.update(dt, ii, t, fx);
  if (k.attackSmearActive()) {
    const [tx, ty] = k.swordTipWorld();
    const [gx, gy] = k.swordGuardWorld();
    fx.smear(tx, ty, gx, gy);
  }
}

function sim(dt: number) {
  t += dt;
  seqT += dt;
  hub.pollPads();

  // title → scene 1 wake (first boot only)
  if (scene.id === 1 && !wakeStarted && seqT >= 4.9) {
    wakeStarted = true;
    p1.startWake();
  }
  if (hub.anyKeyThisFrame && seqT < 4.4 && !titleSkipped) {
    titleSkipped = true;
    seqT = 4.55;
  }

  // drop-in
  if (hub.p2JoinRequested) joinP2();

  const playable = p1.wakeDone && trans === "none";
  const k2 = knights[1];
  // §10 hitstop: actors freeze for the blow's weight; input still lands in buffers
  const adt = hitstopT > 0 ? 0 : dt;
  if (hitstopT > 0) hitstopT -= dt;
  if (playable) knightInput(p1, k2, hub.p1, adt, true);
  else p1.update(adt, NO_INTENT, t, fx);
  if (k2) {
    if (trans === "none") knightInput(k2, p1, hub.p2, adt, false);
    else k2.update(adt, NO_INTENT, t, fx);
  }

  // ---- the Stirred: strikes resolve, attention shifts, silence returns ----
  for (const k of [p1, k2]) {
    if (!k) continue;
    const ev = k.strikeEvent();
    if (!ev) continue;
    let landed = false;
    for (const s of shades) {
      if (!s.alive) continue;
      if (Math.abs(s.x - ev.x) < ev.reach) {
        if (s.struck(ev.heavy, k.x, fx) !== "glance") landed = true;
      }
    }
    if (landed) hitstopT = Math.max(hitstopT, ev.stop);
    if (ev.ring) { k.noise = Math.max(k.noise, 5); k.noiseT = t; } // the unlawful bell
    fx.notifyNoise(k.x, ev.loud + (landed ? 0.5 : 0)); // the ravens answer
  }
  for (const s of shades) {
    const sev = s.strikeEvent();
    if (sev) {
      for (const k of [p1, k2]) {
        if (!k || Math.abs(k.x - sev.x) >= sev.reach) continue;
        const out = k.tryHit(fx);
        if (out === "parried") s.stall(); // its ink caught mid-stroke (§11)
        else if (out === "hit" || out === "downed") hitstopT = Math.max(hitstopT, 3 / 60);
      }
    }
    s.update(adt, t, knights, fx, fire ? fire.x : null);
  }
  // when the LAST accident of noise is un-had, the world holds its breath (§9)
  if (hushBeatArmed && shades.length > 0 && shades.every((s) => !s.alive)) {
    hushBeatArmed = false;
    fx.stall(2.0);
  }

  // ---- THE FIRST AWAKE: the knights' own footsteps toll the buried floor ----
  if (awake) {
    let anyOnFloor = false;
    let nearestX: number | null = null;
    for (const k of [p1, k2]) {
      if (!k) continue;
      const onFloor = k.x > FLOOR_L && k.x < FLOOR_R;
      if (onFloor && !k.downed) {
        anyOnFloor = true;
        if (nearestX == null || Math.abs(k.x - AWAKE_X) < Math.abs(nearestX - AWAKE_X)) nearestX = k.x;
        if (k.state === "walk" || k.state === "sprint") {
          tollAcc += (k.state === "sprint" ? 268 : 150) * adt;
          if (tollAcc > 62) {
            tollAcc = 0;
            fx.tollRing(k.x, GROUND_Y + 4);
            awake.toll(t, k.state === "sprint" ? 2 : 1);
          }
        }
        if (k.state === "roll" || k.state === "act") {
          // steel and tumbling ring the bronze harder than any step
          if (k.stateT < dt * 2) { fx.tollRing(k.x, GROUND_Y + 4); awake.toll(t, 2); }
        }
      }
    }
    awake.update(adt, t, nearestX, anyOnFloor, fx);
  }
  // every knight down → the dream takes them back to the chapter's opening
  const p1Down = p1.downed || p1.state === "collapse";
  const k2Down = !k2 || k2.downed || k2.state === "collapse";
  if (playable && p1Down && k2Down && !resetPending) {
    resetPending = true;
    beginTransition();
  }

  // the embrace fills the fallen knight's rise; letting go interrupts it
  for (const [a, b] of [[p1, k2], [k2, p1]] as const) {
    if (!a || !b) continue;
    if (a.state === "embrace") {
      if (b.downed && Math.abs(a.x - b.x) < 64 && a.stateT > 0.35) b.reviveT += dt;
      // stay kneeling THROUGH the partner's rise — you don't let go early
      else if (!b.downed && b.state !== "rise") a.setEmbrace(false, b.x);
    }
  }
  // DUAL PARRY (§11): both knights catch the same beat → the FULL held breath
  if (k2 && Math.abs(p1.lastParryT - k2.lastParryT) < 0.25 && Math.min(p1.lastParryT, k2.lastParryT) > lastDualT) {
    lastDualT = t;
    fx.stall(1.0);
  }

  if (hub.p1.replayPressed()) replay();
  if (hub.debugPressed()) debugOn = !debugOn;

  fx.update(dt);
  fire?.update(dt);

  // ---- transitions ----
  if (trans === "none" && playable) {
    // edge-exit scenes (S1: dusk takes the field; epilogue: waking OUT)
    if (scene.exitEastX != null && p1.x >= scene.exitEastX && (!k2 || k2.x >= scene.exitEastX - 140)) {
      beginTransition();
    }
    // fire-rest scenes: every present knight settled at the fire
    if (sceneIdx + 1 < SCENES.length && fire && p1.sitSettled && (!k2 || k2.sitSettled)) {
      beginTransition();
    }
  }
  if (trans !== "none") {
    transT += dt;
    if (trans === "out" && transT >= TRANS_S) {
      if (resetPending) {
        resetPending = false;
        enterScene(sceneIdx, true); // wake again at the last fire's chapter
      } else if (sceneIdx + 1 < SCENES.length) {
        enterScene(sceneIdx + 1, true);
      } else {
        // "And waking up." — the journey ends where dreams do. Cut to title.
        knights[1] = null;
        enterScene(0, false);
        p1.resetToLying(SCENES[0].spawnX);
        seqT = 0; titleSkipped = false; wakeStarted = false; whisperT = -1;
        cam.x = SCENES[0].spawnX - 50; cam.zoom = ZOOM_WIDE;
      }
      trans = "in"; transT = 0;
    } else if (trans === "in" && transT >= TRANS_S) {
      trans = "none"; transT = 0;
    }
  }

  // ---- camera: frame every knight, keep the painting ----
  const present = knights.filter((k): k is Knight => !!k);
  const minX = Math.min(...present.map((k) => k.x));
  const maxX = Math.max(...present.map((k) => k.x));
  const spread = maxX - minX;
  const vs = Math.max(cw / 1920, ch / 1080);

  if (scene.id === 1 && wakeStarted && !p1.wakeDone) {
    const p = clamp(p1.stateT / 4.25, 0, 1);
    cam.zoom = lerp(ZOOM_WIDE, ZOOM_MID, easeInOutCubic(p));
    cam.x = damp(cam.x, p1.x + p1.facing * 30, 2.5, dt);
  } else if (p1.wakeDone) {
    if (hub.anyKeyThisFrame || Math.abs(hub.p1.axis()) > 0.2 || Math.abs(hub.p2.axis()) > 0.2 || forcedAxis !== 0) {
      lastInputT = t;
    }
    // the repose (light v1): both knights still ~4s → the camera exhales into the
    // wide painting; any input takes it back instantly. Every pause is concept art.
    const reposing = t - lastInputT > 4 && p1.state === "idle" && (!k2 || k2.state === "idle" || k2.state === "sit");
    // §4: sprint widens the frame ~4% — the world rushes, the knight shrinks in it
    const anySprint = p1.sprinting || (k2 ? k2.sprinting : false);
    const fitZoom = spread > 10 ? (cw * 0.55) / (vs * Math.max(spread, 1)) : ZOOM_MID;
    let targetZoom = (clamp(Math.min(ZOOM_MID, fitZoom), 0.74, ZOOM_MID) + Math.sin(t * 0.5) * 0.006)
      * (reposing ? 0.92 : 1) * (anySprint ? 0.96 : 1);
    let targetX = (minX + maxX) / 2 + (present.length > 1 ? 0 : p1.facing * 46);
    // §5 camera law: the reveal is LOCKED WIDE — both knights and his full height
    if (awake && awake.dramatic) {
      targetZoom = 0.74;
      targetX = lerp(targetX, (targetX + AWAKE_X) / 2, 0.75);
    }
    cam.zoom = damp(cam.zoom, targetZoom, reposing ? 0.8 : 2.2, dt);
    cam.x = damp(cam.x, targetX, 3.2, dt);
    if (whisperT >= 0 || scene.id !== 1) { if (whisperT < 0) whisperT = 0; else whisperT += dt; }
  } else {
    cam.x = scene.spawnX - 50 + noise1(t * 0.1) * 6; // title drift
  }
  const halfView = cw / (2 * vs * cam.zoom);
  cam.x = halfView >= WORLD_W / 2 ? WORLD_W / 2 : clamp(cam.x, halfView, WORLD_W - halfView);

  hub.endFrame();
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

  // THE WORLD BREATHES (World Bible §1) — an ~8.5s swell of everything the world's
  // own light touches. Keeper-lights and fireflies keep their own time (Law 6).
  const breath = Math.pow(0.5 + 0.5 * Math.sin(t * ((Math.PI * 2) / 8.5)), 1.35);

  bake.layers.forEach((l, li) => {
    drawLayer(l);
    // THE FIRST AWAKE sits INSIDE the plate stack, as the bake did — the near
    // drift and the snowfield bury his knees (scene 5: after layer 3, drift-571)
    if (awake && scene.id === 5 && li === 3) {
      ctx.save();
      ctx.translate(cx + (0 - cam.x) * s, gsY + (0 - GROUND_Y) * s);
      ctx.scale(s, s);
      awake.draw(ctx, t, breath);
      ctx.restore();
    }
  });
  if (scene.veil) {
    const v = scene.veil;
    const skyCam = cam.x * v.parallax + (1 - v.parallax) * (WORLD_W / 2);
    const sx = cx + (v.x - skyCam) * s;
    const sy = gsY + (v.y - GROUND_Y) * s;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const rOut = v.r * 4.6 * s;
    ctx.globalAlpha = v.outA * breath;
    ctx.drawImage(emberVeil, sx - rOut, sy - rOut, rOut * 2, rOut * 2);
    const rIn = v.r * 2.1 * s;
    ctx.globalAlpha = v.inA * breath;
    ctx.drawImage(emberVeil, sx - rIn, sy - rIn, rIn * 2, rIn * 2);
    ctx.restore();
  }

  // world pass (fire + knights + fx share world coords)
  ctx.save();
  ctx.translate(cx + (0 - cam.x) * s, gsY + (0 - GROUND_Y) * s);
  ctx.scale(s, s);
  fx.draw(ctx);
  fire?.draw(ctx, GROUND_Y, fireGlow, t);
  for (const s of shades) s.draw(ctx, t); // the Stirred stand behind the living
  for (const k of knights) k?.draw(ctx);
  ctx.restore();

  // mid layers — just in front of the play plane (thorn sentinel etc.)
  if (bake.mid) for (const m of bake.mid) drawLayer(m);
  // foreground tufts — the lean rides the world's breath (the air is dead-still)
  if (bake.fgA && bake.fgB) {
    const wA = 0.5 + 0.42 * Math.sin(t * 0.85 + noise1(t * 0.3) * 1.3) + 0.16 * (breath - 0.5);
    drawLayer(bake.fgA, wA);
    drawLayer(bake.fgB, 1 - wA);
  }
  if (bake.near) drawLayer(bake.near);

  // ---- grade passes ----
  const tile = grain[Math.floor(t * 9) % 3];
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.26;
  ctx.fillStyle = ctx.createPattern(tile, "repeat")!;
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();
  ctx.drawImage(vignette, 0, 0);
  // painterly glaze — the scene's unifying wash, breathing gently
  ctx.save();
  ctx.globalAlpha = scene.glazeBase + scene.glazeBreath * breath;
  ctx.fillStyle = scene.glaze;
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();
  // lifted blacks — nothing in a scanned paperback is true black
  ctx.save();
  ctx.globalCompositeOperation = "lighten";
  ctx.fillStyle = "#150e0b";
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();

  drawText(vs);
  if (debugOn) drawDebug(ctx, perf, p1.state, cam.zoom, dpr);
}

function fadeAlpha(x: number, inS: number, inE: number, outS: number, outE: number) {
  if (x < inS || x > outE) return 0;
  if (x < inE) return (x - inS) / (inE - inS);
  if (x > outS) return 1 - (x - outS) / (outE - outS);
  return 1;
}

function serif(px: number, vs: number) {
  return `400 ${Math.round(px * (vs / dpr))}px "Cormorant Garamond", Georgia, serif`;
}

function drawText(vs: number) {
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = innerWidth, h = innerHeight;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (!titleSkipped && scene.id === 1) {
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
      ctx.font = serif(21, vs);
      try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "4px"; } catch { /* older engines */ }
      ctx.fillText("wake in a world", w / 2 + 2, h * 0.40 + 52 * (vs / dpr));
    }
  }

  if (whisperT >= 0) {
    const aW = fadeAlpha(whisperT, 0.8, 2.0, 4.6, 6.2);
    if (aW > 0) {
      ctx.globalAlpha = aW * 0.68;
      ctx.fillStyle = scene.whisperColor ?? "#d5cabc";
      ctx.font = serif(26, vs);
      try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "3px"; } catch { /* older engines */ }
      ctx.fillText(scene.whisper, w / 2, h * 0.34);
    }
  }

  // opening fade from black + scene transitions
  let black = 1 - clamp(seqT / 1.4, 0, 1);
  if (trans === "out") black = Math.max(black, easeInOutCubic(clamp(transT / TRANS_S, 0, 1)));
  if (trans === "in") black = Math.max(black, 1 - easeInOutCubic(clamp(transT / TRANS_S, 0, 1)));
  if (black > 0) {
    ctx.globalAlpha = black;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ---------- boot ----------
enterScene(0, false);

// ---------- loop ----------
let fpsEma = 60;
function frame(now: number) {
  const rawDt = Math.min((now - last) / 1000, 0.1);
  last = now;
  fpsEma = fpsEma * 0.95 + (1 / Math.max(rawDt, 1e-4)) * 0.05;
  perf.fps = fpsEma;

  const s0 = performance.now();
  acc += rawDt * timeScale;
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
