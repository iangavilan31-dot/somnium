// EPILOGUE — the floating tree, the pink moon, "And waking up."
// PROTECTED MYSTERY (WORLD_BIBLE §1): never explained, never approached closer than
// the frame allows. The last verb is walk (M&C §1). The lullaby resolves here and
// nowhere else (Phase 4a). Reaching the tree wakes the knights OUT — cut to title.

import {
  makeCanvas, dab, soften,
  WORLD_W, PLATE_H, type Layer,
} from "../paint";
import { mulberry32, TAU } from "../math";
import type { SceneBake, SceneDef } from "../journey";

const MOON_X = 1420, MOON_Y = 430, MOON_R = 300; // enormous — the frame's whole heart
const TREE_X = 1430;

function epSky(): Layer {
  const [c, ctx] = makeCanvas(0, 960);
  const R = mulberry32(611);

  // plum dusk, warm-rose at the heart
  const g = ctx.createLinearGradient(0, 0, 0, 920);
  g.addColorStop(0, "#241322");
  g.addColorStop(0.45, "#3a1e34");
  g.addColorStop(0.8, "#592f48");
  g.addColorStop(1, "#6e3c54");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD_W, 940);

  for (let i = 0; i < 110; i++) {
    const y = R() * 860;
    dab(ctx, R() * WORLD_W, y, 90 + R() * 160, 5 + R() * 9, 0,
      y > 480 ? "#59304a" : "#2a1626", 0.15);
  }
  // a few patient stars
  for (let i = 0; i < 90; i++) {
    const x = R() * WORLD_W, y = R() * 420;
    const dM = Math.hypot(x - MOON_X, y - MOON_Y);
    if (dM < MOON_R + 60) continue;
    dab(ctx, x, y, 0.5 + R() * 0.7, 0.5 + R() * 0.7, 0, "#e0c8d4", 0.12 + R() * 0.2);
  }

  // THE PINK MOON — full, enormous, patient. The only full circle in the game.
  const halo = ctx.createRadialGradient(MOON_X, MOON_Y, MOON_R * 0.7, MOON_X, MOON_Y, MOON_R * 2.1);
  halo.addColorStop(0, "rgba(216,160,184,0.20)");
  halo.addColorStop(1, "rgba(216,160,184,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(MOON_X - MOON_R * 2.2, MOON_Y - MOON_R * 2.2, MOON_R * 4.4, MOON_R * 4.4);
  ctx.fillStyle = "#d8a0b8";
  ctx.beginPath();
  ctx.arc(MOON_X, MOON_Y, MOON_R, 0, TAU);
  ctx.fill();
  // her skin — rose mottle, soft seas
  for (let i = 0; i < 240; i++) {
    const a = R() * TAU, d = Math.sqrt(R()) * MOON_R * 0.97;
    dab(ctx, MOON_X + Math.cos(a) * d, MOON_Y + Math.sin(a) * d,
      6 + R() * 20, 4 + R() * 9, R() * TAU, R() < 0.5 ? "#cc92aa" : "#e2aec4", 0.10);
  }
  for (const [mx, my, mr] of [[-0.3, -0.2, 0.22], [0.25, 0.15, 0.3], [-0.1, 0.4, 0.16]] as [number, number, number][]) {
    dab(ctx, MOON_X + MOON_R * mx, MOON_Y + MOON_R * my, MOON_R * mr, MOON_R * mr * 0.7,
      R() * TAU, "#c188a0", 0.16);
  }
  // limb darkening — she is a body, not a disc
  const limb = ctx.createRadialGradient(MOON_X - MOON_R * 0.15, MOON_Y - MOON_R * 0.15, MOON_R * 0.3, MOON_X, MOON_Y, MOON_R);
  limb.addColorStop(0, "rgba(90,40,60,0)");
  limb.addColorStop(1, "rgba(90,40,60,0.28)");
  ctx.fillStyle = limb;
  ctx.beginPath();
  ctx.arc(MOON_X, MOON_Y, MOON_R, 0, TAU);
  ctx.fill();

  return { canvas: c, parallax: 0.04, yOff: 0 };
}

function epHills(): Layer {
  const [c, ctx] = makeCanvas(640, 960);
  const R = mulberry32(621);
  for (let i = 0; i < 46; i++) {
    dab(ctx, R() * WORLD_W, 800 + R() * 50, 100 + R() * 160, 9 + R() * 12, 0, "#4a2840", 0.10);
  }
  ctx.fillStyle = "#221224";
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, 850);
  for (let x = 0; x <= WORLD_W; x += 50) {
    ctx.lineTo(x, 838 + Math.sin(x * 0.002 + 2) * 14 + R() * 6);
  }
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();
  return { canvas: c, parallax: 0.12, yOff: 640 };
}

// THE FLOATING TREE — silhouetted against the moon, roots holding an island of
// earth that forgot to fall. Drawn once, never explained.
function epTree(): Layer {
  const [c, ctx] = makeCanvas(200, 1000);
  const R = mulberry32(631);
  const TX = TREE_X, TB = 560; // the island's underside hangs at ~560

  ctx.fillStyle = "#1c0e18";
  // the earth-island: a TORN clod — ragged underside, clumps mid-fall that never
  // fall, a fringe of hanging grass (the clean bowl read as a wok, board-killed)
  ctx.beginPath();
  ctx.moveTo(TX - 90, TB - 40);
  ctx.quadraticCurveTo(TX - 78, TB - 6, TX - 62, TB + 2);
  ctx.lineTo(TX - 54, TB + 18);
  ctx.lineTo(TX - 40, TB + 10);
  ctx.quadraticCurveTo(TX - 26, TB + 30, TX - 8, TB + 24);
  ctx.lineTo(TX + 4, TB + 34);
  ctx.lineTo(TX + 16, TB + 22);
  ctx.quadraticCurveTo(TX + 38, TB + 30, TX + 52, TB + 12);
  ctx.lineTo(TX + 62, TB + 18);
  ctx.quadraticCurveTo(TX + 76, TB + 2, TX + 78, TB - 14);
  ctx.quadraticCurveTo(TX + 88, TB - 34, TX + 82, TB - 48);
  ctx.lineTo(TX - 84, TB - 52);
  ctx.closePath();
  ctx.fill();
  // crumbs of earth suspended beneath — falling, asleep mid-fall
  for (const [cx0, cy0, cs] of [[-38, 52, 4], [-12, 68, 3], [22, 58, 5], [44, 44, 3], [4, 92, 2.4]] as [number, number, number][]) {
    dab(ctx, TX + cx0, TB + cy0, cs, cs * 0.75, R() * TAU, "#1c0e18", 1);
  }
  // hanging grass fringe along the torn edge
  ctx.strokeStyle = "#241226";
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 30; i++) {
    const fx0 = TX - 80 + R() * 160;
    const fy0 = TB + 8 + R() * 18;
    ctx.beginPath();
    ctx.moveTo(fx0, fy0);
    ctx.quadraticCurveTo(fx0 + (R() - 0.5) * 4, fy0 + 8, fx0 + (R() - 0.5) * 8, fy0 + 12 + R() * 10);
    ctx.stroke();
  }
  // trailing roots — tapered, forking, reaching for the ground they left
  ctx.strokeStyle = "#1c0e18";
  ctx.lineCap = "round";
  for (const [rx, rl, rw, bend] of [
    [-52, 95, 5, -14], [-18, 140, 7, 10], [16, 108, 5.5, -8], [48, 76, 4.2, 12], [2, 172, 4, -18],
  ] as [number, number, number, number][]) {
    let px = TX + rx, py = TB + 22, pw = rw;
    for (let sgm = 0; sgm < 3; sgm++) {
      const nx = px + bend * (0.4 - sgm * 0.15) + (R() - 0.5) * 6;
      const ny = py + rl / 3;
      ctx.lineWidth = pw;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + bend * 0.2, (py + ny) / 2, nx, ny);
      ctx.stroke();
      if (sgm === 1) { // a fork, thinner, wandering off
        ctx.lineWidth = pw * 0.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px - bend * 0.4, py + rl * 0.2, px - bend * 0.8, py + rl * 0.3);
        ctx.stroke();
      }
      px = nx; py = ny; pw *= 0.6;
    }
  }
  // the trunk — patient, leaning slightly, alive
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(TX - 4, TB - 44);
  ctx.quadraticCurveTo(TX - 10, TB - 130, TX + 6, TB - 176);
  ctx.stroke();
  // limbs opening into the moon
  const limb = (x0: number, y0: number, a: number, len: number, w: number) => {
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x0 + Math.cos(a) * len * 0.5, y0 + Math.sin(a) * len * 0.5 - 14,
      x0 + Math.cos(a) * len, y0 + Math.sin(a) * len);
    ctx.stroke();
    return [x0 + Math.cos(a) * len, y0 + Math.sin(a) * len];
  };
  const l1 = limb(TX + 2, TB - 150, -2.4, 84, 7);
  const l2 = limb(TX + 4, TB - 168, -0.7, 96, 7);
  const l3 = limb(TX - 2, TB - 120, -2.9, 66, 5.5);
  const l4 = limb(TX + 5, TB - 176, -1.6, 70, 6);
  // canopy — soft leaf-mass clouds on the limb ends, dark rose-black
  for (const [lx, ly] of [l1, l2, l3, l4, [TX + 6, TB - 186]] as [number, number][]) {
    for (let i = 0; i < 16; i++) {
      dab(ctx, lx + (R() - 0.5) * 66, ly + (R() - 0.5) * 34 - 8,
        14 + R() * 22, 9 + R() * 13, (R() - 0.5) * 0.4, R() < 0.7 ? "#241020" : "#301828", 0.85);
    }
  }
  // moonlight lifts the canopy's upper leaf-masses — a tone, not a ring
  for (const [lx, ly] of [l1, l2, l4] as [number, number][]) {
    for (let i = 0; i < 7; i++) {
      dab(ctx, lx + (R() - 0.5) * 50, ly - 16 - R() * 12, 9 + R() * 12, 6 + R() * 8,
        (R() - 0.5) * 0.4, "#463046", 0.55);
    }
  }
  // petals drifting off the canopy, falling UP-wind of gravity, gently
  for (let i = 0; i < 12; i++) {
    dab(ctx, TX - 60 + R() * 160, TB - 220 + R() * 260, 1.8, 1.2, R() * TAU, "#d8a0b8", 0.35);
  }

  return { canvas: c, parallax: 0.3, yOff: 200 };
}

const epGroundTop = (x: number) =>
  856 - Math.sin(x * 0.0012 + 0.7) * 16 - Math.sin(x * 0.004) * 5;

function epGround(): Layer {
  const [c, ctx] = makeCanvas(790, 1280);
  const R = mulberry32(641);
  const g = ctx.createLinearGradient(0, 840, 0, PLATE_H);
  g.addColorStop(0, "#1e1220");
  g.addColorStop(0.4, "#181018");
  g.addColorStop(1, "#0c080c");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, epGroundTop(0));
  for (let x = 0; x <= WORLD_W; x += 25) ctx.lineTo(x, epGroundTop(x) + R() * 2);
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();

  // quiet grass, rose-dusted toward the tree
  for (let i = 0; i < 4200; i++) {
    const x = R() * WORLD_W;
    const top = epGroundTop(x) + 4;
    const y = top + Math.pow(R(), 0.7) * (PLATE_H - top);
    const depth = (y - top) / (PLATE_H - top);
    const shade = R();
    const color =
      shade < 0.5 ? "#171019" : shade < 0.75 ? "#1c1420" : shade < 0.9 ? "#241a26" : "#2e2030";
    dab(ctx, x, y, 1.2 + depth * 2, 4 + depth * 10, (R() - 0.5) * 0.9, color, 0.6 + depth * 0.3);
  }
  for (let i = 0; i < 320; i++) {
    const x = R() * WORLD_W;
    const near = Math.max(0, 1 - Math.abs(x - TREE_X) / 900);
    dab(ctx, x, epGroundTop(x) + 8 + R() * 100, 1, 2.5 + R() * 4, (R() - 0.5) * 0.8,
      "#8a5a74", 0.14 + 0.3 * near);
  }
  // beneath the tree: the ground it left — a bare circle where nothing grows,
  // and fallen petals resting on it
  for (let i = 0; i < 30; i++) {
    const a = R() * TAU, d = Math.sqrt(R()) * 110;
    dab(ctx, TREE_X + Math.cos(a) * d, 1005 + Math.sin(a) * d * 0.3, 14 + R() * 20, 4 + R() * 5,
      (R() - 0.5) * 0.3, "#120c12", 0.5);
  }
  for (let i = 0; i < 26; i++) {
    const a = R() * TAU, d = Math.sqrt(R()) * 95;
    dab(ctx, TREE_X + Math.cos(a) * d, 1002 + Math.sin(a) * d * 0.3, 2, 1.3, R() * TAU, "#c188a0", 0.5);
  }

  return { canvas: c, parallax: 1.0, yOff: 790 };
}

function epForeground(sway: number): Layer {
  const [c, ctx] = makeCanvas(930, 1280);
  const R = mulberry32(651); // SAME seed both variants
  for (let i = 0; i < 260; i++) {
    const x = R() * WORLD_W;
    const y = 1035 + R() * 210;
    const h = 26 + R() * 46;
    const lean = (R() - 0.5) * 0.4 + sway * 0.22; // even the wind is nearly asleep
    ctx.strokeStyle = R() < 0.85 ? "#0e0a10" : "#241426";
    ctx.lineWidth = 2 + R() * 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.quadraticCurveTo(x + lean * h * 0.4, y - h * 0.55, x + lean * h, y - h);
    ctx.stroke();
  }
  return { canvas: soften(c, 1.6), parallax: 1.22, yOff: 930 };
}

export const EPILOGUE: SceneDef = {
  id: 6,
  name: "EPILOGUE",
  whisper: "And waking up.",
  whisperColor: "#2e1628", // deep plum — it must read against the moon's face
  boundsL: 320, boundsR: 1500, // the world simply ends past the tree
  spawnX: 400,
  lightX: MOON_X,
  glaze: "#6e4458", glazeBase: 0.05, glazeBreath: 0.008,
  veil: null,
  fireX: null,
  exitEastX: 1400, // beneath the tree — and waking up
  bake(): SceneBake {
    return {
      layers: [
        epSky(),
        epHills(),
        epTree(),
        epGround(),
      ],
      fgA: epForeground(-1),
      fgB: epForeground(1),
    };
  },
};
