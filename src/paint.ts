// Scene 1 plate baker — "Red-Sun Field".
// Plates are baked ONCE at boot into offscreen canvases (never per-frame).
// Style: dark-fantasy paperback — crushed near-black, ONE accent hue (blood red),
// visible dab strokes, massive negative space.

import { mulberry32, TAU } from "./math";

export const WORLD_W = 2400;
export const GROUND_Y = 940;
export const DESIGN_H = 1080;
export const PLATE_H = 1280; // plates extend below design height — wide camera sees to ~1250
export const PLATE_RES = 1.3; // bake resolution multiplier (max zoom ~1.25)

export interface Layer {
  canvas: HTMLCanvasElement;
  parallax: number;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * PLATE_RES);
  c.height = Math.ceil(h * PLATE_RES);
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

// ---------- layers ----------

function bakeSky(): Layer {
  const [c, ctx] = makeCanvas(WORLD_W, PLATE_H);
  const R = mulberry32(11);

  // Near-black sky falling to a deep umber horizon.
  const g = ctx.createLinearGradient(0, 0, 0, 820);
  g.addColorStop(0, "#050406");
  g.addColorStop(0.55, "#0b0507");
  g.addColorStop(0.85, "#1c0a08");
  g.addColorStop(1, "#2a0e09");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD_W, 860);

  // Broad horizontal paint pulls in the sky (barely visible).
  for (let i = 0; i < 120; i++) {
    const y = R() * 760;
    dab(ctx, R() * WORLD_W, y, 90 + R() * 160, 5 + R() * 9, 0,
      y > 500 ? "#20090a" : "#0a0508", 0.16);
  }
  // Faint cloud masses in the upper sky — kill the dead black.
  for (let i = 0; i < 26; i++) {
    const cx0 = R() * WORLD_W, cy0 = 40 + R() * 380;
    const near = Math.abs(cx0 - 1150) < 500;
    for (let j = 0; j < 14; j++) {
      dab(ctx, cx0 + (R() - 0.5) * 340, cy0 + (R() - 0.5) * 70,
        50 + R() * 110, 12 + R() * 26, (R() - 0.5) * 0.3,
        near ? "#1c0808" : "#0c0709", 0.10);
    }
  }

  // THE red sun — the one accent of the scene. Flat disc, faint halo, textured edge.
  const sx = 1150, sy = 555, sr = 235;
  const halo = ctx.createRadialGradient(sx, sy, sr * 0.8, sx, sy, sr * 2.1);
  halo.addColorStop(0, "rgba(140,26,18,0.30)");
  halo.addColorStop(1, "rgba(140,26,18,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(sx - sr * 2.2, sy - sr * 2.2, sr * 4.4, sr * 4.4);

  ctx.fillStyle = "#b8261b";
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, TAU);
  ctx.fill();
  // barely-there mottling — print texture, not craters
  for (let i = 0; i < 220; i++) {
    const a = R() * TAU, d = Math.sqrt(R()) * sr * 0.97;
    dab(ctx, sx + Math.cos(a) * d, sy + Math.sin(a) * d,
      5 + R() * 16, 3 + R() * 7, R() * TAU, R() < 0.5 ? "#ad2118" : "#c02c1d", 0.10);
  }
  // slightly hotter core, darker limb — painted sphere hint
  const core = ctx.createRadialGradient(sx, sy - sr * 0.1, sr * 0.15, sx, sy, sr);
  core.addColorStop(0, "rgba(205,58,34,0.35)");
  core.addColorStop(0.75, "rgba(184,38,27,0)");
  core.addColorStop(1, "rgba(90,14,10,0.35)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, TAU);
  ctx.fill();

  // Far jagged ridge cutting the sun's lower edge — organic, not triangle clipart:
  // random-walk ridgeline in small steps with occasional sharp rises.
  const ridge = (baseY: number, amp: number, color: string, seed: number) => {
    const r2 = mulberry32(seed);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, PLATE_H);
    let y = baseY - r2() * amp * 0.4;
    ctx.lineTo(0, y);
    let trend = 0;
    for (let x = 0; x <= WORLD_W; x += 10) {
      if (r2() < 0.08) trend = (r2() - 0.5) * amp * 0.22; // new slope impulse
      y += trend * 0.12 + (r2() - 0.5) * 7;
      y = Math.min(baseY + amp * 0.1, Math.max(baseY - amp, y));
      // gravity toward base so it always comes back down
      y += (baseY - amp * 0.35 - y) * 0.012;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(WORLD_W, PLATE_H);
    ctx.closePath();
    ctx.fill();
  };
  ridge(770, 180, "#140b0d", 21); // behind, faint red bleed
  ridge(800, 215, "#070506", 22); // front, near-black

  return { canvas: c, parallax: 0.05 };
}

function bakeValley(): Layer {
  const [c, ctx] = makeCanvas(WORLD_W, PLATE_H);
  const R = mulberry32(31);
  // Rolling dark valley floor under the ridge — deep green-black.
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

  // Mist band where valley meets ridge.
  for (let i = 0; i < 60; i++) {
    dab(ctx, R() * WORLD_W, 818 + R() * 26, 60 + R() * 120, 6 + R() * 10, 0, "#241512", 0.10);
  }
  // Distant tree clumps.
  for (let i = 0; i < 90; i++) {
    const x = R() * WORLD_W, y = 830 + R() * 60;
    dab(ctx, x, y, 6 + R() * 16, 8 + R() * 18, 0, "#050904", 0.9);
  }
  return { canvas: c, parallax: 0.16 };
}

function bakeMidHill(): Layer {
  const [c, ctx] = makeCanvas(WORLD_W, PLATE_H);
  const R = mulberry32(41);
  // The hill our field sits on, rising from the right (like the reference frame).
  ctx.fillStyle = "#060a06";
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, 900);
  for (let x = 0; x <= WORLD_W; x += 50) {
    ctx.lineTo(x, 894 - Math.sin(x * 0.0021) * 26 + R() * 5);
  }
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();

  // Big framing tree/bush silhouettes near the edges (negative-space gates).
  const bush = (bx: number, by: number, s: number) => {
    for (let i = 0; i < 38; i++) {
      const a = R() * TAU, d = Math.sqrt(R());
      dab(ctx, bx + Math.cos(a) * d * 46 * s, by - Math.abs(Math.sin(a)) * d * 88 * s,
        (10 + R() * 22) * s, (12 + R() * 26) * s, R() * 0.8, "#040704", 0.95);
    }
  };
  bush(120, 930, 1.25);
  bush(2320, 920, 1.5);
  bush(2180, 930, 0.8);

  // Sparse tree line along the ridge — kills the dead-black mid band.
  for (let i = 0; i < 150; i++) {
    const x = R() * WORLD_W;
    const ridgeY = 894 - Math.sin(x * 0.0021) * 26;
    const h = 8 + R() * R() * 26;
    ctx.strokeStyle = "#040704";
    ctx.lineWidth = 1.5 + R() * 2;
    ctx.beginPath();
    ctx.moveTo(x, ridgeY + 4);
    ctx.lineTo(x + (R() - 0.5) * 4, ridgeY - h);
    ctx.stroke();
    dab(ctx, x, ridgeY - h, 3 + R() * 5, 4 + R() * 7, 0, "#040704", 0.9);
  }
  // Red backlight ticks on the ridge crest under the sun.
  for (let i = 0; i < 90; i++) {
    const x = 850 + R() * 700;
    const ridgeY = 894 - Math.sin(x * 0.0021) * 26;
    dab(ctx, x, ridgeY + 2 + R() * 6, 1, 2.5 + R() * 3.5, (R() - 0.5) * 0.6, "#4a170f", 0.4);
  }
  return { canvas: c, parallax: 0.45 };
}

function bakeGround(): Layer {
  const [c, ctx] = makeCanvas(WORLD_W, PLATE_H);
  const R = mulberry32(51);

  // Grass slope band.
  const g = ctx.createLinearGradient(0, 830, 0, PLATE_H);
  g.addColorStop(0, "#0a1109");
  g.addColorStop(0.4, "#0c140b");
  g.addColorStop(1, "#060905");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, 856);
  for (let x = 0; x <= WORLD_W; x += 40) {
    ctx.lineTo(x, 850 - Math.sin(x * 0.0021) * 14 + R() * 4);
  }
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();

  // Thousands of grass dab strokes, denser + larger near the bottom.
  for (let i = 0; i < 5200; i++) {
    const y = 860 + Math.pow(R(), 0.7) * (PLATE_H - 860);
    const depth = (y - 860) / (PLATE_H - 860); // 0 far, 1 near
    const x = R() * WORLD_W;
    const shade = R();
    const color = shade < 0.55 ? "#0f1a0e" : shade < 0.85 ? "#13210f" : "#1a2b16";
    dab(ctx, x, y, 1.2 + depth * 2.2, 4 + depth * 11, (R() - 0.5) * 0.9, color, 0.6 + depth * 0.3);
  }

  // Red sunlight kiss on grass tips in a band under the sun (accent bleed).
  for (let i = 0; i < 260; i++) {
    const x = 900 + R() * 700, y = 865 + R() * 90;
    dab(ctx, x, y, 1, 3 + R() * 5, (R() - 0.5) * 0.8, "#5c1c12", 0.35);
  }

  // White flower clusters — concentrated around the wake-up patch (x 1100–1500).
  const flower = (x: number, y: number, s: number) => {
    dab(ctx, x, y + 5 * s, 0.8 * s, 4 * s, (R() - 0.5) * 0.6, "#16240f", 0.8); // stem
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * TAU + R() * 0.6;
      dab(ctx, x + Math.cos(a) * 2.4 * s, y + Math.sin(a) * 1.8 * s,
        1.7 * s, 1.2 * s, a, "#cfd0bd", 0.85);
    }
    dab(ctx, x, y, 1.1 * s, 1.1 * s, 0, "#8a7d5a", 0.9); // center
  };
  for (let i = 0; i < 130; i++) {
    const cxx = 1100 + R() * 420, cy = 950 + R() * 120;
    flower(cxx + (R() - 0.5) * 60, cy + (R() - 0.5) * 30, 0.8 + ((cy - 950) / 120) * 1.4);
  }
  for (let i = 0; i < 60; i++) { // sparse strays elsewhere
    flower(R() * WORLD_W, 950 + R() * 120, 0.7 + R() * 0.9);
  }
  return { canvas: c, parallax: 1.0 };
}

function bakeForeground(sway: number): Layer {
  // Two variants baked with different sway → crossfaded slowly = wind illusion.
  const [c, ctx] = makeCanvas(WORLD_W, PLATE_H);
  const R = mulberry32(61); // SAME seed both variants — same tufts, shifted tips
  for (let i = 0; i < 320; i++) {
    const x = R() * WORLD_W;
    const y = 1035 + R() * 210;
    const h = 30 + R() * 55;
    const lean = (R() - 0.5) * 0.5 + sway * 0.22;
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

// ---------- grade passes (screen-space, cheap) ----------

export function bakeGrainTiles(): HTMLCanvasElement[] {
  const tiles: HTMLCanvasElement[] = [];
  for (let t = 0; t < 3; t++) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(256, 256);
    const R = mulberry32(100 + t);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 110 + R() * 90; // mid-gray noise for 'overlay' compositing
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

export function bakeScene(): { layers: Layer[]; fgA: Layer; fgB: Layer } {
  const layers = [bakeSky(), bakeValley(), bakeMidHill(), bakeGround()];
  return { layers, fgA: bakeForeground(-1), fgB: bakeForeground(1) };
}
