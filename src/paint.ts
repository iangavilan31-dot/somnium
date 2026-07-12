// Scene 1 plate baker — "Red-Sun Field".
// Plates are baked ONCE at boot into offscreen canvases (never per-frame).
// Style: dark-fantasy paperback — crushed near-black, ONE accent hue (blood red),
// visible dab strokes, massive negative space, layer after layer of distance.
// Art direction law: docs/ART_DIRECTION.md — atmosphere before everything.

import { mulberry32, TAU } from "./math";

export const WORLD_W = 2400;
export const GROUND_Y = 940;
export const DESIGN_H = 1080;
export const PLATE_H = 1280; // plates extend below design height — wide camera sees to ~1250
export const PLATE_RES = 1.3;
export const SUN_X = 1150, SUN_Y = 555, SUN_R = 235;

export interface Layer {
  canvas: HTMLCanvasElement;
  parallax: number;
  drift?: number; // px/s horizontal wrap-drift (clouds, fog)
}

function makeCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = Math.ceil(WORLD_W * PLATE_RES);
  c.height = Math.ceil(PLATE_H * PLATE_RES);
  const ctx = c.getContext("2d")!;
  ctx.scale(PLATE_RES, PLATE_RES);
  return [c, ctx];
}

function dab(
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
function ridgeline(
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

// ---------- layers ----------

function bakeSky(): Layer {
  const [c, ctx] = makeCanvas();
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

  // stars — upper sky only, none over the sun
  for (let i = 0; i < 110; i++) {
    const x = R() * WORLD_W, y = R() * 430;
    if (Math.hypot(x - SUN_X, y - SUN_Y) < SUN_R + 90) continue;
    const big = R() < 0.08;
    dab(ctx, x, y, big ? 1.4 : 0.6 + R() * 0.7, big ? 1.4 : 0.6 + R() * 0.7, 0,
      "#c8b7a3", big ? 0.5 : 0.15 + R() * 0.3);
  }

  // faintest, farthest ridge — barely there
  ctx.save();
  ctx.globalAlpha = 0.75;
  ridgeline(ctx, 745, 65, "#0e0709", 19);
  ctx.restore();

  // THE red sun
  const halo = ctx.createRadialGradient(SUN_X, SUN_Y, SUN_R * 0.8, SUN_X, SUN_Y, SUN_R * 2.1);
  halo.addColorStop(0, "rgba(140,26,18,0.30)");
  halo.addColorStop(1, "rgba(140,26,18,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(SUN_X - SUN_R * 2.2, SUN_Y - SUN_R * 2.2, SUN_R * 4.4, SUN_R * 4.4);

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

  return { canvas: c, parallax: 0.04 };
}

function bakeClouds(seed: number, big: boolean): Layer {
  const [c, ctx] = makeCanvas();
  const R = mulberry32(seed);
  const n = big ? 6 : 9;
  for (let i = 0; i < n; i++) {
    // keep clusters off the plate edges so the wrap seam crosses clear sky
    const cx0 = 200 + R() * (WORLD_W - 400);
    const cy0 = big ? 140 + R() * 220 : 30 + R() * 170;
    const spread = big ? 300 : 190;
    for (let j = 0; j < (big ? 10 : 7); j++) {
      const px = cx0 + (R() - 0.5) * spread, py = cy0 + (R() - 0.5) * (big ? 64 : 26);
      dab(ctx, px, py, (big ? 70 : 90) + R() * (big ? 120 : 160), (big ? 14 : 4) + R() * (big ? 22 : 6),
        (R() - 0.5) * 0.2, big ? "#150607" : "#0d0509", big ? 0.16 : 0.28); // translucent — sun glows through
    }
    if (big) {
      // under-lit edges near the sun's altitude
      for (let j = 0; j < 4; j++) {
        dab(ctx, cx0 + (R() - 0.5) * spread * 0.8, cy0 + 24 + (R() - 0.5) * 18,
          40 + R() * 70, 4 + R() * 7, 0, "#2a0c09", 0.16);
      }
    }
  }
  return { canvas: c, parallax: big ? 0.07 : 0.055, drift: big ? -9 : -14 };
}

function bakeRidge(): Layer {
  const [c, ctx] = makeCanvas();
  ridgeline(ctx, 770, 180, "#140b0d", 21);
  ridgeline(ctx, 800, 215, "#070506", 22);

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

  return { canvas: c, parallax: 0.1 };
}

function bakeValley(): Layer {
  const [c, ctx] = makeCanvas();
  const R = mulberry32(31);
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
    dab(ctx, R() * WORLD_W, 814 + R() * 36, 70 + R() * 150, 7 + R() * 12, 0, "#241512", 0.12);
  }
  // red sun-bleed pooling on the valley floor under the sun column
  for (let i = 0; i < 60; i++) {
    const x = 880 + R() * 620, y = 826 + R() * 50;
    dab(ctx, x, y, 26 + R() * 60, 3 + R() * 5, 0, "#3a120c", 0.3);
  }
  for (let i = 0; i < 110; i++) { // distant tree clumps — silhouetted against the mist
    const x = R() * WORLD_W, y = 830 + R() * 60;
    dab(ctx, x, y, 6 + R() * 16, 8 + R() * 18, 0, "#050904", 0.9);
  }
  return { canvas: c, parallax: 0.16 };
}

function bakeFog(seed: number, yLo: number, yHi: number, color: string, near: boolean): Layer {
  const [c, ctx] = makeCanvas();
  const R = mulberry32(seed);
  for (let i = 0; i < (near ? 26 : 34); i++) {
    const cx0 = 150 + R() * (WORLD_W - 300);
    const cy0 = yLo + R() * (yHi - yLo);
    for (let j = 0; j < 6; j++) {
      dab(ctx, cx0 + (R() - 0.5) * 260, cy0 + (R() - 0.5) * 14,
        120 + R() * 220, 8 + R() * (near ? 20 : 14), 0, color, near ? 0.06 : 0.05);
    }
  }
  return { canvas: c, parallax: near ? 0.62 : 0.24, drift: near ? -18 : -12 };
}

// midhill top edge — big sweeping roll
const midY = (x: number) => 890 - Math.sin(x * 0.0011 + 1.2) * 44 - Math.sin(x * 0.0031) * 10;

function bakeMidHill(): Layer {
  const [c, ctx] = makeCanvas();
  const R = mulberry32(41);
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
  return { canvas: c, parallax: 0.45 };
}

// ground top edge — rolling, with a soft valley dip east of the flower patch
const groundTop = (x: number) =>
  846 - Math.sin(x * 0.0013 + 0.6) * 26 - Math.sin(x * 0.0037) * 8;

function bakeGround(): Layer {
  const [c, ctx] = makeCanvas();
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

  // grass dabs, denser + larger near the bottom
  for (let i = 0; i < 5200; i++) {
    const x = R() * WORLD_W;
    const top = groundTop(x) + 4;
    const y = top + Math.pow(R(), 0.7) * (PLATE_H - top);
    const depth = (y - top) / (PLATE_H - top);
    const shade = R();
    const color = shade < 0.55 ? "#0f1a0e" : shade < 0.85 ? "#13210f" : "#1a2b16";
    dab(ctx, x, y, 1.2 + depth * 2.2, 4 + depth * 11, (R() - 0.5) * 0.9, color, 0.6 + depth * 0.3);
  }

  // red sunlight kiss — stronger, in the sun's column
  for (let i = 0; i < 420; i++) {
    const x = 850 + R() * 800;
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

  // scattered stones — red-kissed on the sun side
  for (let i = 0; i < 26; i++) {
    const x = R() * WORLD_W;
    const y = Math.max(groundTop(x) + 24, 880) + R() * 330;
    const s = 3 + R() * 7;
    dab(ctx, x, y, s, s * 0.7, (R() - 0.5) * 0.4, "#0a0a0d", 1);
    dab(ctx, x - s * 0.2, y - s * 0.3, s * 0.7, s * 0.45, 0.2, "#0d0d11", 1);
    dab(ctx, x - s * 0.45, y - s * 0.42, s * 0.4, 1, -0.3, "#5c1c12", 0.4);
  }

  // dead branches
  for (let i = 0; i < 12; i++) {
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
  for (let i = 0; i < 30; i++) {
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
  for (let i = 0; i < 60; i++) {
    flower(R() * WORLD_W, 950 + R() * 260, 0.7 + R() * 0.9);
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

  return { canvas: c, parallax: 1.0 };
}

function bakeForeground(sway: number): Layer {
  const [c, ctx] = makeCanvas();
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
  return { canvas: c, parallax: 1.22 };
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

export function bakeScene(): { layers: Layer[]; fgA: Layer; fgB: Layer } {
  const layers = [
    bakeSky(),
    bakeClouds(71, false), // high thin streaks
    bakeClouds(72, true),  // low masses
    bakeRidge(),
    bakeValley(),
    bakeFog(81, 795, 885, "#2a1210", false),
    bakeMidHill(),
    bakeFog(82, 850, 950, "#241010", true),
    bakeGround(),
  ];
  return { layers, fgA: bakeForeground(-1), fgB: bakeForeground(1) };
}
