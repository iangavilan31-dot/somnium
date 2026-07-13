// Scene 1 plate baker — "Red-Sun Field".
// Plates are baked ONCE at boot into offscreen canvases (never per-frame).
// Style: dark-fantasy paperback — crushed near-black, ONE accent hue (blood red),
// visible dab strokes, massive negative space, layer after layer of distance.
// Art direction law: docs/ART_DIRECTION.md — atmosphere before everything.

import { mulberry32, TAU } from "./math";

export const WORLD_W = 2400;
export const GROUND_Y = 940;
// THE DEPTH BAND (M&C §18): actors live at (x, z, h); +z walks toward the frame's
// reader. GROUND_Y is the band's center line; the shadow is the only depth instrument.
export const Z_SLOPE = 1.0;      // screen px per z unit at the feet line
export const Z_SCALE = 0.0012;   // scale per z unit (±~5% across a default band) TUNE
export const Z_TOL = 26;         // generous attack z-tolerance (SoR4 pick) TUNE
export const BAND_MIN = -40, BAND_MAX = 40; // band edges: min = away, max = toward the reader
export const DEPTH_SPEED = 0.6;  // z moves at 0.6× walk cadence (belt-scroller) TUNE
export const DESIGN_H = 1080;
export const PLATE_H = 1280; // plates extend below design height — wide camera sees to ~1250
export const PLATE_RES = 1.3;
export const SUN_X = 1150, SUN_Y = 555, SUN_R = 235;

export interface Layer {
  canvas: HTMLCanvasElement;
  parallax: number;
  yOff: number; // world y of the plate's top edge (plates are content-band strips)
  drift?: number; // px/s horizontal wrap-drift (clouds, fog)
}

// Banded plates: full-height plates (14 × 3120×1664 ≈ 280MB of textures) thrashed
// GPU memory under any per-frame capture readback. Each plate spans only its band;
// content is still authored in world coords via the translate.
export function makeCanvas(yTop: number, yBot: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = Math.ceil(WORLD_W * PLATE_RES);
  c.height = Math.ceil((yBot - yTop) * PLATE_RES);
  const ctx = c.getContext("2d")!;
  ctx.scale(PLATE_RES, PLATE_RES);
  ctx.translate(0, -yTop);
  return [c, ctx];
}

export function dab(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, rot: number,
  color: string, alpha = 1,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, w, h, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// organic ridgeline: random-walk in small steps, gravity toward base
export function ridgeline(
  ctx: CanvasRenderingContext2D, baseY: number, amp: number, color: string, seed: number,
) {
  const r2 = mulberry32(seed);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  let y = baseY - r2() * amp * 0.4;
  ctx.lineTo(0, y);
  let trend = 0;
  for (let x = 0; x <= WORLD_W; x += 10) {
    if (r2() < 0.08) trend = (r2() - 0.5) * amp * 0.22;
    y += trend * 0.12 + (r2() - 0.5) * 7;
    y = Math.min(baseY + amp * 0.1, Math.max(baseY - amp, y));
    y += (baseY - amp * 0.35 - y) * 0.012;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();
}

// painterly cumulus mass — billowed body dabs + crimson under-lit base edge.
// rim = strength of the sun-side under-lighting (0 = unlit silhouette).
export function cloudMass(
  ctx: CanvasRenderingContext2D, R: () => number,
  cx: number, cy: number, w: number, h: number,
  body: string, alpha: number, rim: number,
) {
  // bulk — center-biased scatter, edges sag so the mass reads domed.
  // many low-alpha dabs, never few strong ones: single ellipse edges read as
  // digital "bubbles" against the bright disc.
  for (let i = 0; i < 52; i++) {
    const ox = (R() + R() - 1) * 0.5 * w;
    const oy = (R() + R() - 1) * 0.5 * h - Math.abs(ox / w) * h * 0.35;
    dab(ctx, cx + ox, cy + oy, w * (0.10 + R() * 0.20), h * (0.18 + R() * 0.30),
      (R() - 0.5) * 0.35, body, alpha * 0.62);
  }
  // billow domes along the top arc
  for (let i = 0; i < 18; i++) {
    const ox = (R() + R() - 1) * 0.5 * w * 0.9;
    dab(ctx, cx + ox, cy - h * (0.34 + R() * 0.3) - Math.abs(ox / w) * h * 0.3,
      w * (0.05 + R() * 0.11), h * (0.12 + R() * 0.18), (R() - 0.5) * 0.5, body, alpha * 0.5);
  }
  if (rim > 0) {
    // crimson under-lighting along the base — hotter the closer it hangs to the sun
    for (let i = 0; i < 16; i++) {
      const ox = (R() + R() - 1) * 0.55 * w;
      const px = cx + ox;
      const hot = Math.max(0, 1 - Math.hypot(px - SUN_X, cy - SUN_Y) / 1100);
      dab(ctx, px, cy + h * (0.3 + R() * 0.18) - Math.abs(ox / w) * h * 0.3,
        w * (0.05 + R() * 0.08), 2.5 + R() * 3.5, (R() - 0.5) * 0.12,
        R() < 0.6 ? "#5a1a0e" : "#8a2a14", rim * (0.10 + 0.16 * (0.4 + 0.6 * hot)));
    }
  }
}

// ---------- layers ----------

function bakeSky(): Layer {
  const [c, ctx] = makeCanvas(0, 920);
  const R = mulberry32(11);

  const g = ctx.createLinearGradient(0, 0, 0, 820);
  g.addColorStop(0, "#050406");
  g.addColorStop(0.55, "#0b0507");
  g.addColorStop(0.85, "#1c0a08");
  g.addColorStop(1, "#2a0e09");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD_W, 860);

  // broad horizontal paint pulls
  for (let i = 0; i < 120; i++) {
    const y = R() * 760;
    dab(ctx, R() * WORLD_W, y, 90 + R() * 160, 5 + R() * 9, 0,
      y > 500 ? "#20090a" : "#0a0508", 0.16);
  }

  // stars — upper sky only; they dissolve as they near the sun's light
  for (let i = 0; i < 130; i++) {
    const x = R() * WORLD_W, y = R() * 430;
    const dSun = Math.hypot(x - SUN_X, y - SUN_Y);
    if (dSun < SUN_R + 70) continue;
    const fade = Math.min(1, (dSun - SUN_R - 70) / 260); // dim inside the glow
    const big = R() < 0.08;
    dab(ctx, x, y, big ? 1.4 : 0.6 + R() * 0.7, big ? 1.4 : 0.6 + R() * 0.7, 0,
      "#c8b7a3", (big ? 0.5 : 0.15 + R() * 0.3) * (0.25 + 0.75 * fade));
  }

  // the sky is FULL of weather — banked cloud masses, red-bellied, gaps for stars.
  // The bank is SCULPTED, not murk: every mass near the sun column carries a hot
  // under-lit base rim — form comes from the lit edge, never from body brightness.
  cloudMass(ctx, R, 430, 235, 560, 110, "#160607", 0.11, 0.40);
  cloudMass(ctx, R, 1080, 130, 660, 100, "#130507", 0.10, 0.48);
  cloudMass(ctx, R, 1830, 250, 600, 120, "#170708", 0.11, 0.52);
  cloudMass(ctx, R, 2300, 140, 420, 90, "#130507", 0.09, 0.15);
  cloudMass(ctx, R, 150, 120, 380, 85, "#130507", 0.09, 0.12);

  // low warm veil in the west — enough light for the thorn sentinel to stand against
  cloudMass(ctx, R, 330, 530, 500, 130, "#1d0908", 0.12, 0.7);
  for (let i = 0; i < 24; i++) {
    dab(ctx, 120 + R() * 520, 430 + R() * 260, 90 + R() * 140, 14 + R() * 18, 0, "#2a0c08", 0.12);
  }
  // a warmer pocket directly behind the sentinel's crown — its dark limbs need lit air
  for (let i = 0; i < 10; i++) {
    dab(ctx, 280 + R() * 300, 470 + R() * 180, 70 + R() * 110, 12 + R() * 16, 0, "#341009", 0.10);
  }

  // faintest, farthest ridge — barely there
  ctx.save();
  ctx.globalAlpha = 0.75;
  ridgeline(ctx, 745, 65, "#0e0709", 19);
  ctx.restore();

  // thin haze veils crossing the disc's latitudes — celestial, not clipart
  // (few: the face must not read as evenly striped)
  for (let i = 0; i < 4; i++) {
    const vy = 440 + R() * 240;
    dab(ctx, SUN_X + (R() - 0.5) * 300, vy, 160 + R() * 180, 4 + R() * 8, (R() - 0.5) * 0.06,
      "#3f0f0c", 0.10);
  }

  // massive masses the disc rises through — under-lit crimson where they face it.
  // Bodies stay SMOKE-THIN over the bright face (a dense roll reads as a bruise);
  // the hot rim is what carries the form.
  cloudMass(ctx, R, 1150, 400, 640, 130, "#1a0606", 0.10, 0.85);
  cloudMass(ctx, R, 700, 480, 460, 110, "#180606", 0.12, 0.6);
  cloudMass(ctx, R, 1640, 445, 500, 115, "#190606", 0.12, 0.75);

  // THE red sun — deep two-stage atmospheric glow
  const haloWide = ctx.createRadialGradient(SUN_X, SUN_Y, SUN_R * 0.9, SUN_X, SUN_Y, SUN_R * 3.1);
  haloWide.addColorStop(0, "rgba(120,20,14,0.22)");
  haloWide.addColorStop(1, "rgba(120,20,14,0)");
  ctx.fillStyle = haloWide;
  ctx.fillRect(SUN_X - SUN_R * 3.2, SUN_Y - SUN_R * 3.2, SUN_R * 6.4, SUN_R * 6.4);
  const halo = ctx.createRadialGradient(SUN_X, SUN_Y, SUN_R * 0.8, SUN_X, SUN_Y, SUN_R * 1.9);
  halo.addColorStop(0, "rgba(150,28,19,0.34)");
  halo.addColorStop(1, "rgba(150,28,19,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(SUN_X - SUN_R * 2, SUN_Y - SUN_R * 2, SUN_R * 4, SUN_R * 4);

  ctx.fillStyle = "#b8261b";
  ctx.beginPath();
  ctx.arc(SUN_X, SUN_Y, SUN_R, 0, TAU);
  ctx.fill();
  for (let i = 0; i < 220; i++) {
    const a = R() * TAU, d = Math.sqrt(R()) * SUN_R * 0.97;
    dab(ctx, SUN_X + Math.cos(a) * d, SUN_Y + Math.sin(a) * d,
      5 + R() * 16, 3 + R() * 7, R() * TAU, R() < 0.5 ? "#ad2118" : "#c02c1d", 0.10);
  }
  const core = ctx.createRadialGradient(SUN_X, SUN_Y - SUN_R * 0.1, SUN_R * 0.15, SUN_X, SUN_Y, SUN_R);
  core.addColorStop(0, "rgba(205,58,34,0.35)");
  core.addColorStop(0.75, "rgba(184,38,27,0)");
  core.addColorStop(1, "rgba(90,14,10,0.35)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(SUN_X, SUN_Y, SUN_R, 0, TAU);
  ctx.fill();
  // atmospheric extinction — the disc darkens toward the horizon it sinks into
  ctx.save();
  ctx.beginPath();
  ctx.arc(SUN_X, SUN_Y, SUN_R, 0, TAU);
  ctx.clip();
  const ext = ctx.createLinearGradient(0, SUN_Y - SUN_R, 0, SUN_Y + SUN_R);
  ext.addColorStop(0, "rgba(60,10,8,0)");
  ext.addColorStop(0.6, "rgba(60,10,8,0.05)");
  ext.addColorStop(1, "rgba(60,10,8,0.34)");
  ctx.fillStyle = ext;
  ctx.fillRect(SUN_X - SUN_R, SUN_Y - SUN_R, SUN_R * 2, SUN_R * 2);
  ctx.restore();

  // the disc sits IN the weather: billows clip its limbs…
  // (warm-black bodies — anything blue-leaning reads as a gray bruise on the disc)
  // One BOLD mass on the upper-left limb + one low-right: an odd, asymmetric rhythm —
  // a painter's composition, never evenly-spaced strips.
  cloudMass(ctx, R, 950, 355, 360, 88, "#1a0505", 0.11, 1.0);
  cloudMass(ctx, R, 1400, 705, 340, 80, "#180404", 0.13, 1.0);

  // …and slivers cross its face — soft ragged cloud strips, not scratches:
  // three overlapping rows of fuzzy dabs with a warm under-glow
  const wisp = (x0: number, y0: number, len: number, th: number, sag: number, a: number) => {
    for (let row = -1; row <= 1; row++) {
      for (let i = 0; i <= 30; i++) {
        const u = i / 30;
        const tt = 0.35 + 0.65 * Math.sin(Math.PI * u); // soft ends, no knife points
        const jy = Math.sin(u * 7.3 + x0 + row * 2.1) * th * 0.5;
        dab(ctx, x0 + u * len + (Math.sin(u * 13 + row) * 6),
          y0 + Math.sin(u * Math.PI) * sag + row * th * 0.7 + jy,
          14 + tt * 26, (1.6 + tt * th * 0.45) * (row === 0 ? 1 : 0.7),
          0.03, "#170505", a * 0.34 * tt * (row === 0 ? 1 : 0.6));
      }
    }
    for (let i = 6; i <= 24; i++) {
      const u = i / 30;
      const tt = Math.sin(Math.PI * u);
      dab(ctx, x0 + u * len, y0 + Math.sin(u * Math.PI) * sag + th * 1.1 + 1.5,
        10 + tt * 16, 1.4, 0.03, "#d84a24", 0.07 * tt);
    }
  };
  // two face wisps only — one strong mid, one faint low; weight varies, spacing
  // varies. Four even bands read as stripes cut through the disc (iteration-4 kill).
  wisp(980, 585, 470, 10, -8, 0.66);
  wisp(870, 672, 560, 6, 6, 0.42);

  // soft scattering — faint shafts fanning off the rim, and a horizon bloom
  for (const [ang, len] of [[-2.35, 780], [-1.95, 880], [-1.5, 920], [-1.05, 840], [-0.65, 760]] as [number, number][]) {
    dab(ctx, SUN_X + Math.cos(ang) * (SUN_R + len * 0.5), SUN_Y + Math.sin(ang) * (SUN_R + len * 0.5),
      len * 0.5, 26 + Math.abs(Math.sin(ang)) * 26, ang, "#69190e", 0.05);
  }
  dab(ctx, SUN_X, 802, 560, 46, 0, "#5a170c", 0.13);

  return { canvas: c, parallax: 0.04, yOff: 0 };
}

function bakeClouds(seed: number, big: boolean): Layer {
  const [c, ctx] = makeCanvas(0, big ? 560 : 500);
  const R = mulberry32(seed);
  if (big) {
    // massive drifting cumulus — bodies that read, bases burning crimson.
    // clusters stay off the plate edges so the wrap seam crosses clear sky.
    for (let i = 0; i < 5; i++) {
      const cx0 = 320 + R() * (WORLD_W - 640);
      const cy0 = 210 + R() * 260;
      cloudMass(ctx, R, cx0, cy0, 300 + R() * 240, 70 + R() * 60, "#130506", 0.14, 0.5 + R() * 0.5);
    }
  } else {
    // high streaks…
    for (let i = 0; i < 8; i++) {
      const cx0 = 260 + R() * (WORLD_W - 520);
      const cy0 = 40 + R() * 200;
      for (let j = 0; j < 6; j++) {
        dab(ctx, cx0 + (R() - 0.5) * 300, cy0 + (R() - 0.5) * 22,
          110 + R() * 170, 4 + R() * 6, (R() - 0.5) * 0.1, "#0f0406", 0.30);
      }
    }
    // …and slivers at the disc's latitude that cross its face as they drift
    for (let i = 0; i < 7; i++) {
      const cx0 = 200 + R() * (WORLD_W - 400);
      const cy0 = 330 + R() * 150;
      const len = 130 + R() * 200;
      for (let t = 0; t <= 1; t += 0.08) {
        const tt = Math.sin(Math.PI * t);
        dab(ctx, cx0 + (t - 0.5) * len, cy0 + Math.sin(t * 2.4 + i) * 6,
          10 + tt * 26, 1.5 + tt * 3.5, 0.02, "#160505", 0.5 * (0.4 + 0.6 * tt));
      }
    }
  }
  return { canvas: c, parallax: big ? 0.07 : 0.055, yOff: 0, drift: big ? -9 : -14 };
}

function bakeRidge(): Layer {
  const [c, ctx] = makeCanvas(540, 920);
  const R = mulberry32(23);
  // warm scattering above the far ridgeline — the land floats on glowing air
  for (let i = 0; i < 80; i++) {
    const x = R() * WORLD_W;
    const sunBoost = Math.max(0, 1 - Math.abs(x - SUN_X) / 1000);
    dab(ctx, x, 700 + R() * 90, 100 + R() * 180, 10 + R() * 16, 0, "#3a100b", 0.06 + 0.10 * sunBoost);
  }
  // lifted a step toward the sky — atmospheric perspective, not black-on-black
  ridgeline(ctx, 770, 180, "#1c0f10", 21);
  ridgeline(ctx, 800, 215, "#0c0709", 22);

  // a second, smaller ruin far west — barely there, reward observation
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "#0b0708";
  ctx.beginPath();
  ctx.moveTo(316, 780); ctx.lineTo(318, 752); ctx.lineTo(322, 750); ctx.lineTo(323, 758);
  ctx.lineTo(327, 757); ctx.lineTo(329, 780);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // broken watchtower on the eastern ridge — the first hint of where this ends
  const tx = 1980, tb = 792;
  ctx.fillStyle = "#0a0607";
  dab(ctx, tx, tb + 6, 26, 12, 0, "#0a0607", 1); // mound
  ctx.beginPath();
  ctx.moveTo(tx - 7.5, tb);
  ctx.lineTo(tx - 5.5, tb - 52);
  ctx.lineTo(tx - 2, tb - 52); ctx.lineTo(tx - 2, tb - 58); ctx.lineTo(tx + 1.5, tb - 58); // broken merlons
  ctx.lineTo(tx + 1.5, tb - 50); ctx.lineTo(tx + 5, tb - 46);
  ctx.lineTo(tx + 7, tb);
  ctx.closePath();
  ctx.fill();
  // red rim, sun side
  ctx.strokeStyle = "#5c1c12";
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(tx - 6.5, tb - 8);
  ctx.lineTo(tx - 5, tb - 52);
  ctx.stroke();
  ctx.globalAlpha = 1;

  return { canvas: c, parallax: 0.1, yOff: 540 };
}

function bakeValley(): Layer {
  const [c, ctx] = makeCanvas(740, 960);
  const R = mulberry32(31);
  // glowing haze the far ridge rests on — separation before the valley floor
  for (let i = 0; i < 70; i++) {
    const x = R() * WORLD_W;
    const sunBoost = Math.max(0, 1 - Math.abs(x - SUN_X) / 900);
    dab(ctx, x, 795 + R() * 30, 90 + R() * 160, 8 + R() * 12, 0, "#481610", 0.07 + 0.09 * sunBoost);
  }
  ctx.fillStyle = "#080d08";
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, 830);
  for (let x = 0; x <= WORLD_W; x += 60) {
    ctx.lineTo(x, 812 + Math.sin(x * 0.004 + 2) * 16 + R() * 8);
  }
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 120; i++) { // mist where valley meets ridge — full width
    dab(ctx, R() * WORLD_W, 814 + R() * 36, 70 + R() * 150, 7 + R() * 12, 0, "#2a1712", 0.16);
  }
  // red sun-bleed pooling on the valley floor under the sun column
  for (let i = 0; i < 90; i++) {
    const x = 880 + R() * 620, y = 826 + R() * 50;
    dab(ctx, x, y, 26 + R() * 60, 3 + R() * 5, 0, "#3a120c", 0.36);
  }
  for (let i = 0; i < 110; i++) { // distant tree clumps — silhouetted against the mist
    const x = R() * WORLD_W, y = 830 + R() * 60;
    dab(ctx, x, y, 6 + R() * 16, 8 + R() * 18, 0, "#050904", 0.9);
  }
  return { canvas: c, parallax: 0.16, yOff: 740 };
}

export function bakeFog(seed: number, yLo: number, yHi: number, color: string, near: boolean): Layer {
  const [c, ctx] = makeCanvas(near ? 810 : 740, near ? 990 : 930);
  const R = mulberry32(seed);
  for (let i = 0; i < (near ? 26 : 34); i++) {
    const cx0 = 150 + R() * (WORLD_W - 300);
    const cy0 = yLo + R() * (yHi - yLo);
    for (let j = 0; j < 6; j++) {
      dab(ctx, cx0 + (R() - 0.5) * 260, cy0 + (R() - 0.5) * 14,
        120 + R() * 220, 8 + R() * (near ? 20 : 14), 0, color, near ? 0.085 : 0.075);
    }
  }
  return { canvas: c, parallax: near ? 0.62 : 0.24, yOff: near ? 810 : 740, drift: near ? -18 : -12 };
}

// dark forest band — a visually distinct layer between valley and midhill
function bakeForest(): Layer {
  const [c, ctx] = makeCanvas(780, 960);
  const R = mulberry32(45);
  const base = (x: number) => 872 - Math.sin(x * 0.0017 + 0.4) * 14;
  // valley mist the forest rises out of — separates the bands
  for (let i = 0; i < 60; i++) {
    const x = R() * WORLD_W;
    const sunBoost = Math.max(0, 1 - Math.abs(x - SUN_X) / 900);
    dab(ctx, x, 845 + R() * 26, 80 + R() * 150, 7 + R() * 10, 0, "#401410", 0.06 + 0.08 * sunBoost);
  }
  // solid under-mass so the band reads as one dark body
  ctx.fillStyle = "#04060a";
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, base(0) + 8);
  for (let x = 0; x <= WORLD_W; x += 30) ctx.lineTo(x, base(x) + 8 + R() * 3);
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();
  // tree silhouettes — mixed pines and broadleaf clumps, cool black
  for (let i = 0; i < 380; i++) {
    const x = R() * WORLD_W;
    const by = base(x) + 6;
    const h = 10 + R() * R() * 30;
    if (R() < 0.4) { // pine: narrow triangle strokes
      ctx.strokeStyle = "#04060a";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, by - h);
      ctx.lineTo(x - 2.5 - h * 0.14, by);
      ctx.moveTo(x, by - h);
      ctx.lineTo(x + 2.5 + h * 0.14, by);
      ctx.stroke();
      dab(ctx, x, by - h * 0.5, 2 + h * 0.16, h * 0.55, 0, "#04060a", 1);
    } else {
      dab(ctx, x, by - h * 0.75, 3.5 + R() * 6, 4 + h * 0.35, 0, "#04060a", 1);
      ctx.strokeStyle = "#04060a";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x, by); ctx.lineTo(x, by - h * 0.6);
      ctx.stroke();
    }
  }
  // skeletal dead trees — taller, bare, distinct
  for (const dx0 of [310, 785, 2055]) {
    const by = base(dx0) + 4, h = 44 + (dx0 % 13);
    ctx.strokeStyle = "#060505";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(dx0, by);
    ctx.lineTo(dx0 + 2, by - h * 0.55);
    ctx.lineTo(dx0 - 1, by - h);
    ctx.moveTo(dx0 + 1, by - h * 0.5);
    ctx.lineTo(dx0 + 12, by - h * 0.78);
    ctx.moveTo(dx0 + 1.5, by - h * 0.62);
    ctx.lineTo(dx0 - 9, by - h * 0.88);
    ctx.stroke();
  }
  // a leaning monolith — someone raised this long ago
  ctx.save();
  ctx.translate(2262, base(2262) + 6);
  ctx.rotate(0.1);
  ctx.fillStyle = "#050608";
  ctx.fillRect(-3.5, -30, 7, 30);
  ctx.restore();
  // faint red crowns where the sun grazes the canopy
  for (let i = 0; i < 60; i++) {
    const x = 880 + R() * 620;
    dab(ctx, x, base(x) - 12 - R() * 16, 2 + R() * 4, 1.5 + R() * 2, 0, "#4a170f", 0.22);
  }
  // two far window-lights deep in the trees — tiny, warm, easy to miss
  for (const [lx, ly] of [[1355, 869], [660, 873]] as [number, number][]) {
    dab(ctx, lx, ly, 1.1, 1.4, 0, "#d98a4a", 0.5);
    dab(ctx, lx, ly, 2.6, 3, 0, "#7a3a1c", 0.18);
  }
  return { canvas: c, parallax: 0.3, yOff: 780 };
}

// midhill top edge — big sweeping roll
const midY = (x: number) => 890 - Math.sin(x * 0.0011 + 1.2) * 44 - Math.sin(x * 0.0031) * 10;

function bakeMidHill(): Layer {
  const [c, ctx] = makeCanvas(750, 1020);
  const R = mulberry32(41);
  // crest haze — the hill floats on glowing air, hugging the roll of the silhouette
  for (let x = 0; x <= WORLD_W; x += 18) {
    const sunBoost = Math.max(0, 1 - Math.abs(x - SUN_X) / 850);
    dab(ctx, x + (R() - 0.5) * 14, midY(x) - 8 - R() * 26, 40 + R() * 70, 7 + R() * 11, 0,
      "#451509", 0.05 + 0.10 * sunBoost);
  }
  ctx.fillStyle = "#060a06";
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, midY(0));
  for (let x = 0; x <= WORLD_W; x += 25) ctx.lineTo(x, midY(x) + R() * 4);
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();

  const bush = (bx: number, by: number, s: number) => {
    for (let i = 0; i < 38; i++) {
      const a = R() * TAU, d = Math.sqrt(R());
      dab(ctx, bx + Math.cos(a) * d * 46 * s, by - Math.abs(Math.sin(a)) * d * 88 * s,
        (10 + R() * 22) * s, (12 + R() * 26) * s, R() * 0.8, "#040704", 0.95);
    }
  };
  bush(120, 935, 1.25);
  bush(2320, 915, 1.5);
  bush(2180, 925, 0.8);

  // ruined arch on the western hill — someone built here once
  const ax = 640, ab = midY(640) + 6;
  ctx.fillStyle = "#04070a";
  ctx.beginPath(); // left pillar, taller, carries the broken spring of the arch
  ctx.moveTo(ax - 30, ab);
  ctx.lineTo(ax - 27, ab - 34);
  ctx.quadraticCurveTo(ax - 24, ab - 46, ax - 10, ab - 46);
  ctx.lineTo(ax - 8, ab - 40);
  ctx.quadraticCurveTo(ax - 19, ab - 40, ax - 20, ab - 32);
  ctx.lineTo(ax - 21, ab);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath(); // right stub
  ctx.moveTo(ax + 18, ab);
  ctx.lineTo(ax + 19, ab - 22);
  ctx.lineTo(ax + 26, ab - 24);
  ctx.lineTo(ax + 28, ab);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6b2114"; // sun-side rim
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ax - 26, ab - 33);
  ctx.quadraticCurveTo(ax - 23, ab - 45, ax - 11, ab - 45);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // sparse tree line along the roll
  for (let i = 0; i < 150; i++) {
    const x = R() * WORLD_W;
    const ry = midY(x);
    const h = 8 + R() * R() * 26;
    ctx.strokeStyle = "#040704";
    ctx.lineWidth = 1.5 + R() * 2;
    ctx.beginPath();
    ctx.moveTo(x, ry + 4);
    ctx.lineTo(x + (R() - 0.5) * 4, ry - h);
    ctx.stroke();
    dab(ctx, x, ry - h, 3 + R() * 5, 4 + R() * 7, 0, "#040704", 0.9);
  }
  // red backlight ticks on the crest under the sun
  for (let i = 0; i < 90; i++) {
    const x = 850 + R() * 700;
    dab(ctx, x, midY(x) + 2 + R() * 6, 1, 2.5 + R() * 3.5, (R() - 0.5) * 0.6, "#4a170f", 0.4);
  }

  // ruined watch-tower on the eastern roll — the journey's midground promise
  const tX = 1830, tB = midY(1830) + 4;
  for (let i = 0; i < 26; i++) { // its own hill
    dab(ctx, tX + (R() - 0.5) * 150, tB - 8 - R() * R() * 26, 30 + R() * 40, 12 + R() * 14,
      (R() - 0.5) * 0.2, "#060a06", 0.9);
  }
  for (let i = 0; i < 22; i++) { // warm haze pool behind the silhouette so it reads
    dab(ctx, tX + (R() - 0.5) * 220, tB - 60 - R() * 55, 60 + R() * 80, 10 + R() * 14, 0,
      "#4d1810", 0.13);
  }
  ctx.save();
  ctx.translate(tX, tB - 24);
  ctx.rotate(-0.02);
  ctx.fillStyle = "#05080a";
  ctx.beginPath(); // tapered shaft, broken crown
  ctx.moveTo(-13, 0);
  ctx.lineTo(-10, -78);
  ctx.lineTo(-11, -84);
  ctx.lineTo(-6, -84);
  ctx.lineTo(-6, -90);
  ctx.lineTo(-1, -90);
  ctx.lineTo(-1, -83);
  ctx.lineTo(4, -83);
  ctx.lineTo(5, -74);
  ctx.lineTo(9, -70);
  ctx.lineTo(11, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath(); // collapsed wall running downhill
  ctx.moveTo(11, 0);
  ctx.lineTo(11, -26);
  ctx.lineTo(30, -18);
  ctx.lineTo(46, -6);
  ctx.lineTo(48, 4);
  ctx.closePath();
  ctx.fill();
  dab(ctx, -20, 2, 7, 4, 0.3, "#05080a", 1); // rubble
  dab(ctx, 26, 6, 6, 3.5, -0.2, "#05080a", 1);
  ctx.strokeStyle = "#6b2114"; // sun-side rim (the sun is west of here)
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-12, -4);
  ctx.lineTo(-9.6, -78);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // two faint warm lights — someone, or something, keeps them lit.
  // They hold steady while the Ember breathes: a keeper's light keeps its own time.
  dab(ctx, -3, -56, 1.5, 2, 0, "#e0904e", 0.85);
  dab(ctx, -3, -56, 4, 5, 0, "#7a3a1c", 0.28);
  dab(ctx, 4, -34, 1.2, 1.6, 0, "#c97c40", 0.65);
  dab(ctx, 4, -34, 3, 4, 0, "#6b3218", 0.20);
  ctx.restore();

  return { canvas: c, parallax: 0.45, yOff: 750 };
}

// ground top edge — rolling, with a soft valley dip east of the flower patch
const groundTop = (x: number) =>
  846 - Math.sin(x * 0.0013 + 0.6) * 26 - Math.sin(x * 0.0037) * 8;

function bakeGround(): Layer {
  const [c, ctx] = makeCanvas(790, 1280);
  const R = mulberry32(51);

  const g = ctx.createLinearGradient(0, 830, 0, PLATE_H);
  g.addColorStop(0, "#0a1109");
  g.addColorStop(0.4, "#0c140b");
  g.addColorStop(1, "#060905");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, groundTop(0));
  for (let x = 0; x <= WORLD_W; x += 25) ctx.lineTo(x, groundTop(x) + R() * 3);
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();

  // dusty warm swaths — the field's coat is patched, not uniform
  for (let i = 0; i < 26; i++) {
    const x0 = R() * WORLD_W, y0 = 920 + R() * 320;
    const col = R() < 0.5 ? "#1c2410" : R() < 0.8 ? "#241f10" : "#2a180d";
    for (let j = 0; j < 7; j++) {
      dab(ctx, x0 + (R() - 0.5) * 130, y0 + (R() - 0.5) * 40, 26 + R() * 44, 8 + R() * 12,
        (R() - 0.5) * 0.25, col, 0.14);
    }
  }

  // grass dabs, denser + larger near the bottom — warm dusty variation, nothing uniform
  for (let i = 0; i < 6400; i++) {
    const x = R() * WORLD_W;
    const top = groundTop(x) + 4;
    const y = top + Math.pow(R(), 0.7) * (PLATE_H - top);
    const depth = (y - top) / (PLATE_H - top);
    const shade = R();
    const color =
      shade < 0.40 ? "#0f1a0e" : shade < 0.62 ? "#13210f" : shade < 0.78 ? "#1a2b16" :
      shade < 0.88 ? "#232a11" : shade < 0.95 ? "#2b2312" : "#34200f";
    dab(ctx, x, y, 1.2 + depth * 2.2, 4 + depth * 11, (R() - 0.5) * 0.9, color, 0.6 + depth * 0.3);
  }

  // red sunlight kiss — stronger, in the sun's column
  for (let i = 0; i < 640; i++) {
    const x = 800 + R() * 950;
    const y = groundTop(x) + 4 + R() * 95;
    dab(ctx, x, y, 1, 3 + R() * 5.5, (R() - 0.5) * 0.8,
      R() < 0.75 ? "#6b2114" : "#8a2a16", 0.5);
  }

  // ancient worn path — east of the flower patch, climbing to the wayshrine
  for (let t = 0; t <= 1; t += 0.01) {
    const x = 1790 - t * 230 + Math.sin(t * 2.6) * 26;
    const y = 1250 - t * 335;
    const w = 30 * (1 - t * 0.5);
    dab(ctx, x + (R() - 0.5) * 6, y, w * (0.7 + R() * 0.3), 6 + R() * 4, 0.05, "#090c07", 0.3);
  }

  // darker soil patches — centuries of use (subtle, not holes)
  for (let i = 0; i < 10; i++) {
    const x = R() * WORLD_W;
    const y = Math.max(groundTop(x) + 30, 900) + R() * 300;
    for (let j = 0; j < 4; j++) {
      dab(ctx, x + (R() - 0.5) * 60, y + (R() - 0.5) * 20, 18 + R() * 24, 6 + R() * 9,
        (R() - 0.5) * 0.3, "#080b07", 0.3);
    }
  }

  // flattened wind trails — swaths the wind has combed flat
  for (let i = 0; i < 8; i++) {
    const x0 = R() * WORLD_W, y0 = 940 + R() * 260;
    const len = 120 + R() * 160, bend = (R() - 0.5) * 40;
    for (let t = 0; t < 1; t += 0.06) {
      dab(ctx, x0 + t * len, y0 + Math.sin(t * 2.6) * bend * 0.3, 7 + R() * 9, 2 + R() * 1.5,
        0.12 + (R() - 0.5) * 0.15, "#18271a", 0.30);
    }
  }

  // taller grass islands
  for (let i = 0; i < 20; i++) {
    const x0 = R() * WORLD_W, y0 = 930 + R() * 300;
    for (let j = 0; j < 8 + R() * 6; j++) {
      const gx = x0 + (R() - 0.5) * 34, gy = y0 + (R() - 0.5) * 10;
      const gh = 12 + R() * 14;
      ctx.strokeStyle = "#0c1710";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.quadraticCurveTo(gx + (R() - 0.5) * 6, gy - gh * 0.6, gx + (R() - 0.5) * 12, gy - gh);
      ctx.stroke();
    }
  }

  // small dead shrubs
  for (let i = 0; i < 8; i++) {
    const x0 = R() * WORLD_W, y0 = 950 + R() * 280;
    for (let j = 0; j < 6; j++) {
      const a = -0.5 - R() * 2.2;
      const l = 7 + R() * 9;
      ctx.strokeStyle = "#0a0906";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + Math.cos(a) * l, y0 + Math.sin(a) * l);
      ctx.stroke();
    }
  }

  // thorny dead brush — arced canes with barbs
  const thornBush = (x0: number, y0: number, s: number) => {
    ctx.strokeStyle = "#0c0805";
    for (let j = 0; j < 7; j++) {
      const a = -0.2 - R() * 2.7, len = (9 + R() * 13) * s;
      const ex = x0 + Math.cos(a) * len, ey = y0 + Math.sin(a) * len;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x0 + Math.cos(a) * len * 0.5, y0 + Math.sin(a) * len * 0.6 - 3, ex, ey);
      ctx.stroke();
      for (let b = 0.3; b < 1; b += 0.28) {
        const bx = x0 + Math.cos(a) * len * b, by = y0 + Math.sin(a) * len * b - 2;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + (R() - 0.5) * 2, by - 3 - R() * 2.5);
        ctx.stroke();
      }
    }
  };
  for (let i = 0; i < 14; i++) thornBush(R() * WORLD_W, 940 + R() * 300, 0.8 + R() * 0.9);

  // scattered stones — red-kissed on the sun side
  for (let i = 0; i < 54; i++) {
    const x = R() * WORLD_W;
    const y = Math.max(groundTop(x) + 24, 880) + R() * 330;
    const s = 3 + R() * 7 + (R() < 0.1 ? 8 : 0); // a few true boulders
    dab(ctx, x, y, s, s * 0.7, (R() - 0.5) * 0.4, "#0a0a0d", 1);
    dab(ctx, x - s * 0.2, y - s * 0.3, s * 0.7, s * 0.45, 0.2, "#0d0d11", 1);
    dab(ctx, x - s * 0.45, y - s * 0.42, s * 0.4, 1, -0.3, "#5c1c12", 0.4);
    if (s > 9) dab(ctx, x + s * 0.2, y - s * 0.45, s * 0.5, s * 0.25, 0.3, "#0f1a10", 0.7); // moss
  }

  // dead branches
  for (let i = 0; i < 20; i++) {
    const x = R() * WORLD_W, y = 900 + R() * 320;
    const len = 20 + R() * 34, a = (R() - 0.5) * 0.5;
    ctx.strokeStyle = "#070806";
    ctx.lineWidth = 2 + R() * 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len * 0.5, y - 4 + Math.sin(a) * 6, x + len * Math.cos(a), y + len * Math.sin(a));
    ctx.stroke();
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x + len * 0.4, y - 1);
    ctx.lineTo(x + len * 0.55, y - 7 - R() * 5);
    ctx.stroke();
  }

  // ferns
  for (let i = 0; i < 14; i++) {
    const x = R() * WORLD_W, y = 1050 + R() * 210;
    for (let f = 0; f < 5; f++) {
      const fa = -0.9 + f * 0.45 + (R() - 0.5) * 0.2;
      const fh = 12 + R() * 9;
      ctx.strokeStyle = "#0e1c11";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.sin(fa) * fh * 0.5, y - fh * 0.7, x + Math.sin(fa) * fh, y - fh);
      ctx.stroke();
    }
  }

  // seed-head stalks
  for (let i = 0; i < 60; i++) {
    const x = R() * WORLD_W, y = 950 + R() * 300;
    const h = 14 + R() * 12;
    ctx.strokeStyle = "#131f12";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (R() - 0.5) * 5, y - h);
    ctx.stroke();
    dab(ctx, x + (R() - 0.5) * 5, y - h, 1.8, 2.6, 0, "#1c2916", 0.9);
  }

  // white flower clusters — the wake-up patch
  const flower = (x: number, y: number, s: number) => {
    dab(ctx, x, y + 5 * s, 0.8 * s, 4 * s, (R() - 0.5) * 0.6, "#16240f", 0.8);
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * TAU + R() * 0.6;
      dab(ctx, x + Math.cos(a) * 2.4 * s, y + Math.sin(a) * 1.8 * s,
        1.7 * s, 1.2 * s, a, "#cfd0bd", 0.85);
    }
    dab(ctx, x, y, 1.1 * s, 1.1 * s, 0, "#8a7d5a", 0.9);
  };
  for (let i = 0; i < 130; i++) {
    const cxx = 1100 + R() * 420, cy = 950 + R() * 120;
    flower(cxx + (R() - 0.5) * 60, cy + (R() - 0.5) * 30, 0.8 + ((cy - 950) / 120) * 1.4);
  }
  // ambient scatter, thinned — the drifts below carry the composition, not noise
  for (let i = 0; i < 120; i++) {
    flower(R() * WORLD_W, 950 + R() * 280, 0.75 + R() * 1.0);
  }
  // COMPOSED DRIFT — a sweeping arc from the wake patch toward the thorn sentinel:
  // the eye reads knight → flowers → tree, not a random sprinkle (iteration 4)
  for (let i = 0; i < 80; i++) {
    const u = R();
    const px = (1 - u) * (1 - u) * 1150 + 2 * (1 - u) * u * 760 + u * u * 470;
    const py = (1 - u) * (1 - u) * 985 + 2 * (1 - u) * u * 1080 + u * u * 1235;
    flower(px + (R() - 0.5) * (70 + u * 90), py + (R() - 0.5) * 34, 0.7 + u * 1.1 + R() * 0.3);
  }
  // …and a thin trickle east, climbing beside the path to the wayshrine
  for (let i = 0; i < 22; i++) {
    const u = R();
    flower(1400 + u * 150 + (R() - 0.5) * 40, 1005 - u * 75 + (R() - 0.5) * 22, 0.65 + R() * 0.5);
  }

  // leaning wayshrine stone beside the path — someone prayed here once
  const wx = 1560, wy = 916;
  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(-0.14);
  ctx.fillStyle = "#0c0c10";
  ctx.beginPath();
  ctx.moveTo(-5.5, 0);
  ctx.lineTo(-4.5, -26);
  ctx.quadraticCurveTo(0, -32, 4.5, -26);
  ctx.lineTo(5.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#060608"; // carved groove
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -24); ctx.lineTo(0, -10);
  ctx.moveTo(-2.6, -19); ctx.lineTo(2.6, -19);
  ctx.stroke();
  ctx.strokeStyle = "#7e2a1a"; // sun-side rim
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-4.7, -25);
  ctx.quadraticCurveTo(0, -31, 4.4, -25.5);
  ctx.stroke();
  ctx.restore();
  dab(ctx, wx - 7, wy + 2, 3.5, 2, 0.2, "#0a0a0d", 1);
  dab(ctx, wx + 6, wy + 3, 2.8, 1.8, -0.3, "#0a0a0d", 1);
  flower(wx - 12, wy + 4, 0.9);
  flower(wx + 11, wy + 5, 0.8);

  return { canvas: c, parallax: 1.0, yOff: 790 };
}

// one-time soft-focus for the nearest plates — painted depth-of-field, not runtime blur
export function soften(c: HTMLCanvasElement, px: number): HTMLCanvasElement {
  const b = document.createElement("canvas");
  b.width = c.width; b.height = c.height;
  const bctx = b.getContext("2d")!;
  bctx.filter = `blur(${px}px)`;
  bctx.drawImage(c, 0, 0);
  return b;
}

// ---------- the thorn sentinel ----------
// A gnarled dead thorn tree framing the west edge of the hero shot — its own layer,
// just in front of the play plane, behind the wind tufts. Red-lit on the sun side.
function bakeThornTree(): Layer {
  const [c, ctx] = makeCanvas(380, 1120);
  const R = mulberry32(77);
  const INK = "#060404";

  // tapered limb along a quadratic bezier; rim-light on the east (sun) edge
  const limb = (
    x0: number, y0: number, cx1: number, cy1: number, x1: number, y1: number,
    w0: number, w1: number, rim: number,
  ): [number, number][] => {
    const pts: [number, number][] = [];
    const left: [number, number][] = [], right: [number, number][] = [];
    for (let i = 0; i <= 14; i++) {
      const u = i / 14;
      const px = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx1 + u * u * x1;
      const py = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy1 + u * u * y1;
      const tx = 2 * (1 - u) * (cx1 - x0) + 2 * u * (x1 - cx1);
      const ty = 2 * (1 - u) * (cy1 - y0) + 2 * u * (y1 - cy1);
      const tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl, ny = tx / tl;
      const w = (w0 + (w1 - w0) * u) * 0.5;
      const kink = 1 + Math.sin(u * 9 + x0) * 0.3; // gnarl: slow, deep width bulges
      left.push([px + nx * w * kink, py + ny * w * kink]);
      right.push([px - nx * w * kink, py - ny * w * kink]);
      pts.push([px, py]);
    }
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (const [px, py] of left) ctx.lineTo(px, py);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();
    ctx.fill();
    if (rim > 0) {
      // the low sun burns the east edge — this rim is what makes the tree read
      // against the near-black west sky, so it stays hot and wide
      const side = left[7][0] > right[7][0] ? left : right; // whichever edge faces east
      ctx.strokeStyle = "#9c2c16";
      ctx.globalAlpha = rim;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(side[1][0], side[1][1]);
      for (let i = 2; i < side.length - 1; i++) ctx.lineTo(side[i][0], side[i][1]);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    return pts;
  };

  const thorns = (pts: [number, number][], every: number, len: number) => {
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    for (let i = 2; i < pts.length - 1; i += every) {
      const [px, py] = pts[i];
      const a = -0.3 - R() * 2.5;
      const l = len * (0.6 + R() * 0.8);
      const ex = px + Math.cos(a) * l, ey = py + Math.sin(a) * l;
      const sunlit = Math.cos(a) > 0.35; // east-facing thorns burn whole
      ctx.strokeStyle = sunlit ? "#7e2412" : INK;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      if (sunlit) dab(ctx, ex, ey, 1.6, 1.6, 0, "#a03318", 0.55);
    }
  };

  // root mound + root flares
  for (let i = 0; i < 14; i++) {
    dab(ctx, 470 + (R() - 0.5) * 110, 1072 + (R() - 0.5) * 18, 24 + R() * 30, 9 + R() * 10,
      (R() - 0.5) * 0.3, "#050703", 1);
  }
  limb(470, 1078, 420, 1066, 386, 1074, 26, 6, 0); // west root
  limb(474, 1078, 532, 1062, 566, 1072, 24, 5, 0.5); // east root

  // trunk in two gnarled stages — a TREE, not a sapling: it dominates the west edge.
  // The big limbs anchor high so their silhouettes live against the lit sky,
  // never black-on-black against the ridge bands.
  limb(470, 1082, 424, 900, 458, 740, 54, 30, 0.85);
  const t2 = limb(458, 744, 488, 620, 442, 470, 30, 14, 0.8);
  const a1 = limb(462, 690, 620, 590, 786, 548, 18, 4, 0.8);  // the great east limb
  const a2 = limb(452, 560, 566, 462, 706, 428, 12, 3, 0.7);
  const a3 = limb(448, 540, 374, 430, 318, 392, 12, 3, 0);    // up-west, off frame
  limb(466, 896, 396, 850, 344, 828, 10, 3, 0);               // low dead stub west
  const a5 = limb(442, 476, 462, 396, 440, 348, 10, 2.4, 0.6); // crown spike
  // iteration 4: two more mid limbs — the sentinel carries real mass, not whiskers
  const a6 = limb(456, 632, 556, 556, 662, 508, 11, 2.6, 0.7); // second east reach
  const a7 = limb(464, 800, 388, 742, 322, 700, 10, 2.6, 0);   // low west counterweight

  // secondary twigs off the big limbs
  const tw = (x: number, y: number, ang: number, len: number, w0 = 4) => {
    const mx = x + Math.cos(ang) * len * 0.5, my = y + Math.sin(ang) * len * 0.55;
    return limb(x, y, mx + (R() - 0.5) * 12, my - 8, x + Math.cos(ang) * len, y + Math.sin(ang) * len - 6, w0, 1.2, 0);
  };
  thorns(tw(600, 606, -0.95, 88, 5), 2, 8);
  thorns(tw(700, 566, -0.5, 66), 2, 7);
  thorns(tw(742, 556, 0.5, 58), 2, 7);
  thorns(tw(660, 586, 0.35, 52), 3, 6);
  thorns(tw(540, 490, -1.2, 72, 5), 2, 7);
  thorns(tw(640, 442, 0.2, 52), 2, 6);
  thorns(tw(620, 450, -0.7, 46), 3, 6);
  thorns(tw(392, 444, -1.5, 54), 3, 7);
  thorns(tw(350, 420, 0.35, 40), 3, 6);
  thorns(tw(452, 400, -0.4, 46), 3, 6);
  tw(392, 848, 0.55, 36, 3);

  thorns(a1, 1, 9);
  thorns(a2, 2, 8);
  thorns(a3, 2, 7);
  thorns(a5, 2, 7);
  thorns(t2, 3, 9);
  thorns(a6, 2, 8);
  thorns(a7, 3, 7);

  // grass and stones at the base tie it into the field
  for (let i = 0; i < 26; i++) {
    const gx = 470 + (R() - 0.5) * 130, gy = 1076 + (R() - 0.5) * 14;
    const gh = 14 + R() * 22;
    ctx.strokeStyle = "#081007";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.quadraticCurveTo(gx + (R() - 0.5) * 8, gy - gh * 0.6, gx + (R() - 0.5) * 16, gy - gh);
    ctx.stroke();
  }
  dab(ctx, 522, 1080, 6, 4, 0.2, "#0a0a0d", 1);
  dab(ctx, 415, 1086, 4.5, 3, -0.3, "#0a0a0d", 1);

  return { canvas: c, parallax: 1.12, yOff: 380 };
}

function bakeForeground(sway: number): Layer {
  const [c, ctx] = makeCanvas(930, 1280);
  const R = mulberry32(61); // SAME seed both variants — same tufts, shifted tips
  // framing rocks in the bottom corners
  const rock = (rx: number, ry: number, s: number) => {
    for (let i = 0; i < 9; i++) {
      dab(ctx, rx + (R() - 0.5) * 70 * s, ry + (R() - 0.5) * 26 * s,
        (26 + R() * 34) * s, (18 + R() * 22) * s, (R() - 0.5) * 0.5, "#030503", 1);
    }
  };
  rock(230, 1245, 1.15);
  rock(2130, 1260, 1.35);

  // fallen log, half-swallowed by the grass
  ctx.save();
  ctx.translate(1810, 1168);
  ctx.rotate(-0.06);
  ctx.fillStyle = "#040403";
  ctx.beginPath();
  ctx.moveTo(-130, 0);
  ctx.quadraticCurveTo(0, -14, 128, -6);
  ctx.lineTo(126, 8);
  ctx.quadraticCurveTo(0, 2, -128, 12);
  ctx.closePath();
  ctx.fill();
  // broken branch stubs
  ctx.strokeStyle = "#040403";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-46, -4); ctx.lineTo(-30, -26);
  ctx.moveTo(58, -6); ctx.lineTo(74, -20);
  ctx.stroke();
  ctx.restore();

  for (let i = 0; i < 320; i++) {
    const x = R() * WORLD_W;
    const y = 1035 + R() * 210;
    const h = 30 + R() * 55;
    const lean = (R() - 0.5) * 0.5 + sway * 0.3;
    ctx.strokeStyle = R() < 0.85 ? "#040704" : "#081007";
    ctx.lineWidth = 2 + R() * 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.quadraticCurveTo(x + lean * h * 0.4, y - h * 0.55, x + lean * h, y - h);
    ctx.stroke();
  }
  return { canvas: soften(c, 1.6), parallax: 1.22, yOff: 930 };
}

// nearest framing layer — giant soft silhouettes hugging the frame edges
function bakeNearFrame(): Layer {
  const [c, ctx] = makeCanvas(940, 1280);
  const R = mulberry32(67);

  // giant flowers very close to camera, bottom edge
  const bigFlower = (x: number, y: number, s: number, lean: number) => {
    ctx.strokeStyle = "#050803";
    ctx.lineWidth = 4 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + 60 * s);
    ctx.quadraticCurveTo(x + lean * 18 * s, y + 24 * s, x + lean * 30 * s, y);
    ctx.stroke();
    const hx = x + lean * 30 * s, hy = y;
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * TAU + lean * 0.3;
      dab(ctx, hx + Math.cos(a) * 9 * s, hy + Math.sin(a) * 7 * s, 7 * s, 4.5 * s, a, "#0a0c08", 0.98);
      dab(ctx, hx + Math.cos(a) * 12 * s, hy + Math.sin(a) * 9.5 * s, 3 * s, 1.6 * s, a, "#8f9080", 0.4);
    }
    dab(ctx, hx, hy, 4 * s, 4 * s, 0, "#060705", 1);
  };
  bigFlower(760, 1172, 1.15, -0.6);
  bigFlower(1010, 1206, 0.85, 0.4);
  bigFlower(1620, 1194, 1.0, -0.3);
  bigFlower(1960, 1168, 1.3, 0.5);

  // very tall grass blades, sparse, partially crossing the frame
  for (let i = 0; i < 46; i++) {
    const x = R() * WORLD_W;
    const y = 1195 + R() * 85;
    const h = 90 + R() * 120;
    const lean = (R() - 0.5) * 0.7;
    ctx.strokeStyle = "#030503";
    ctx.lineWidth = 3.5 + R() * 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.quadraticCurveTo(x + lean * h * 0.4, y - h * 0.5, x + lean * h, y - h);
    ctx.stroke();
  }

  // thorn brambles arcing through the bottom corners
  const bramble = (x0: number, y0: number, dir: number, s: number) => {
    ctx.strokeStyle = "#030402";
    ctx.lineCap = "round";
    for (let j = 0; j < 5; j++) {
      const a = -0.15 - R() * 0.9, len = (90 + R() * 120) * s;
      const ex = x0 + dir * Math.cos(a) * len, ey = y0 - Math.sin(a) * len * 0.8;
      ctx.lineWidth = (4 + R() * 3) * s;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x0 + dir * Math.cos(a) * len * 0.5, y0 - Math.sin(a) * len * 0.95, ex, ey);
      ctx.stroke();
      for (let b = 0.25; b < 1; b += 0.17) { // barbs
        const bx = x0 + dir * Math.cos(a) * len * b;
        const by = y0 - Math.sin(a) * len * 0.85 * b;
        ctx.lineWidth = 2.2 * s;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + dir * 6 * s, by - (6 + R() * 5) * s);
        ctx.stroke();
      }
    }
  };
  bramble(60, 1280, 1, 1.1);
  bramble(2340, 1290, -1, 1.3);
  bigFlower(390, 1180, 1.05, -0.5);

  // (no corner canopy: the vignette owns the top corners — a black mass there is
  // an invisible feature. Framing is carried by blades, rocks, giant flowers, log,
  // and now the corner brambles.)

  return { canvas: soften(c, 3.2), parallax: 1.45, yOff: 940 };
}

// ---------- grade passes ----------

export function bakeGrainTiles(): HTMLCanvasElement[] {
  const tiles: HTMLCanvasElement[] = [];
  for (let t = 0; t < 3; t++) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(256, 256);
    const R = mulberry32(100 + t);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 110 + R() * 90;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    tiles.push(c);
  }
  return tiles;
}

export function bakeVignette(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(w / 2, h * 0.55, Math.min(w, h) * 0.38, w / 2, h * 0.55, Math.max(w, h) * 0.78);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return c;
}

// the Ember's breath veil (World Bible §1: the disc breathes, ~8s, barely there).
// Drawn per-frame OVER the plates at a breath-keyed alpha — the plates never re-bake.
export function bakeEmberVeil(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(256, 256, 26, 256, 256, 254);
  g.addColorStop(0, "rgba(255,88,44,0.52)");
  g.addColorStop(0.3, "rgba(205,52,28,0.28)");
  g.addColorStop(1, "rgba(150,28,19,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  return c;
}

// baked radial glow sprite (fireflies) — glow WITHOUT shadowBlur
export function bakeGlowSprite(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 28;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(14, 14, 0.5, 14, 14, 13);
  g.addColorStop(0, "rgba(232,118,58,0.9)");
  g.addColorStop(0.35, "rgba(200,90,40,0.35)");
  g.addColorStop(1, "rgba(200,90,40,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 28, 28);
  return c;
}

export function bakeScene(): { layers: Layer[]; fgA: Layer; fgB: Layer; near: Layer; thorn: Layer } {
  const layers = [
    bakeSky(),
    bakeClouds(71, false), // high thin streaks + disc-crossing slivers
    bakeClouds(72, true),  // low massive cumulus
    bakeRidge(),
    bakeValley(),
    bakeFog(81, 795, 885, "#331611", false),
    bakeForest(),
    bakeMidHill(),
    bakeFog(82, 850, 950, "#2b1310", true),
    bakeGround(),
  ];
  return {
    layers,
    fgA: bakeForeground(-1),
    fgB: bakeForeground(1),
    near: bakeNearFrame(),
    thorn: bakeThornTree(),
  };
}
