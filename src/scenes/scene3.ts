// CHAPTER 3 — BLUE-HOUR VILLAGE · the Lying-Down town
// Accent: orange windows & fields on ultramarine night. The biggest vista in the game.
// Canon (WORLD_BIBLE §4): a town that lay down together a century ago and is still
// KEPT — lamps lit, thresholds swept. Houses read as hoods and cradles; windows are
// shaped to show the sleepers are safe (two street windows frame them — the gut-punch);
// window boxes gone feral with wake-daisies are the warning the Warden prunes.
// Review Board: the scene is two acts — the far vista earned from the fields (west),
// then the street itself at play depth (east). Same town, seen twice: approach as awe,
// arrival as trespass. The sky stays quiet — the windows are the constellation here.

import {
  makeCanvas, dab, ridgeline, soften, bakeFog,
  WORLD_W, PLATE_H, type Layer,
} from "../paint";
import { mulberry32, TAU } from "../math";
import type { SceneBake, SceneDef } from "../journey";

const FIRE_X = 1950;
export const S3_LAMP = { x: 1985, y: 872 }; // the one street lamp — moths orbit it

// a kept window: warm glass, halo, and (optionally) the sleeper it was shaped to show
function keptWindow(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  glow: number, sleeper: boolean,
) {
  // halo only at vista scale — on a close wall it reads as a porthole disc (board-killed)
  if (w < 10) dab(ctx, x, y, w * 1.9, h * 1.7, 0, "#7a3a14", 0.14 * glow);
  ctx.fillStyle = "#e8964a";
  ctx.globalAlpha = 0.92 * glow;
  ctx.beginPath();
  // cradle-arched head — no window in this town is a hard rectangle
  ctx.moveTo(x - w / 2, y + h / 2);
  ctx.lineTo(x - w / 2, y - h * 0.28);
  ctx.quadraticCurveTo(x, y - h * 0.62, x + w / 2, y - h * 0.28);
  ctx.lineTo(x + w / 2, y + h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  if (sleeper && w > 10) {
    // the bed sits against the glass — a headboard and a resting form, at peace
    ctx.fillStyle = "#3a1e0c";
    ctx.beginPath();
    ctx.ellipse(x - w * 0.16, y + h * 0.18, w * 0.34, h * 0.14, 0, 0, TAU);
    ctx.fill();
    ctx.fillRect(x - w * 0.42, y - h * 0.05, w * 0.1, h * 0.4); // headboard
    ctx.beginPath(); // the sleeper's shoulder-line under the blanket
    ctx.ellipse(x + w * 0.05, y + h * 0.1, w * 0.2, h * 0.1, -0.2, 0, TAU);
    ctx.fill();
  }
}

function s3Sky(): Layer {
  const [c, ctx] = makeCanvas(0, 920);
  const R = mulberry32(311);
  const g = ctx.createLinearGradient(0, 0, 0, 880);
  g.addColorStop(0, "#060a18");
  g.addColorStop(0.45, "#0a1226");
  g.addColorStop(0.8, "#122040");
  g.addColorStop(1, "#1c3054");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD_W, 900);

  for (let i = 0; i < 110; i++) { // broad pulls
    const y = R() * 780;
    dab(ctx, R() * WORLD_W, y, 90 + R() * 150, 5 + R() * 8, 0,
      y > 520 ? "#14223c" : "#080e1e", 0.15);
  }
  // the deepest star field of the journey — the town answers it from below
  for (let i = 0; i < 420; i++) {
    const x = R() * WORLD_W, y = R() * 620;
    const big = R() < 0.06;
    dab(ctx, x, y, big ? 1.6 : 0.5 + R() * 0.7, big ? 1.6 : 0.5 + R() * 0.7, 0,
      "#c0cbe0", (big ? 0.7 : 0.15 + R() * 0.32) * (0.35 + 0.65 * (1 - y / 700)));
  }
  // a river of star-dust crossing the upper sky — the dream's own road overhead,
  // answering the Pilgrim Road below (soft dabs, never a hard band)
  for (let i = 0; i < 240; i++) {
    const u = R();
    const bx = 260 + u * 1500, by = 90 + u * 330;
    const off = (R() + R() - 1) * 90;
    dab(ctx, bx + off * 0.35, by + off, 20 + R() * 44, 6 + R() * 12, 0.24, "#25335c", 0.10);
    if (R() < 0.55) {
      dab(ctx, bx + off * 0.35, by + off, 0.5 + R() * 0.8, 0.5 + R() * 0.8, 0, "#cdd8ea", 0.3 + R() * 0.3);
    }
  }
  // west afterglow — the blue hour's last breath (the Ember's side of the sky)
  const after = ctx.createRadialGradient(220, 900, 60, 220, 900, 680);
  after.addColorStop(0, "rgba(78,84,158,0.34)");
  after.addColorStop(0.6, "rgba(48,56,124,0.16)");
  after.addColorStop(1, "rgba(48,56,124,0)");
  ctx.fillStyle = after;
  ctx.fillRect(0, 260, 1100, 640);
  // thin high veils
  for (let i = 0; i < 8; i++) {
    const cx0 = 200 + R() * (WORLD_W - 400), cy0 = 80 + R() * 320;
    for (let j = 0; j < 5; j++) {
      dab(ctx, cx0 + (R() - 0.5) * 280, cy0 + (R() - 0.5) * 16,
        100 + R() * 150, 3 + R() * 4.5, (R() - 0.5) * 0.07, "#0c1428", 0.35);
    }
  }
  return { canvas: c, parallax: 0.04, yOff: 0 };
}

function s3Hills(): Layer {
  const [c, ctx] = makeCanvas(560, 920);
  const R = mulberry32(317);
  for (let i = 0; i < 70; i++) {
    dab(ctx, R() * WORLD_W, 720 + R() * 80, 100 + R() * 160, 9 + R() * 13, 0, "#1a2a4c", 0.09);
  }
  ridgeline(ctx, 775, 150, "#101c36", 319);
  ridgeline(ctx, 802, 180, "#0a1426", 320);
  return { canvas: c, parallax: 0.1, yOff: 560 };
}

// THE VISTA — the town on its hill, a constellation of kept windows.
// (Iteration 2: the board killed the first pass — the hill vanished into the valley
// sky and the town read as two floating cottages. The glow bowl now sits BEHIND the
// crest, the hill reads against it, and the roofline carries blue moon-rims.)
function s3Town(): Layer {
  const [c, ctx] = makeCanvas(500, 980);
  const R = mulberry32(331);
  const HX = 1500, HB = 806; // hill crest — high and west enough to OWN the horizon
                             // from spawn (iter 3: at 866 the fields buried it)
  // the town's warmth first — a bowl of lamp-fed air the hill silhouettes against
  for (let i = 0; i < 70; i++) {
    const ox = (R() + R() - 1) * 0.5 * 640;
    dab(ctx, HX + ox, HB - 66 - R() * 90 - Math.abs(ox) * 0.06, 70 + R() * 120, 12 + R() * 18, 0,
      R() < 0.6 ? "#5a3416" : "#6e4018", 0.12);
  }
  // the hill the town sleeps on — readable against its own glow
  ctx.fillStyle = "#0c1426";
  ctx.beginPath();
  ctx.moveTo(HX - 560, PLATE_H);
  ctx.quadraticCurveTo(HX - 420, HB + 30, HX - 190, HB - 26);
  ctx.quadraticCurveTo(HX, HB - 74, HX + 210, HB - 30);
  ctx.quadraticCurveTo(HX + 420, HB + 22, HX + 560, PLATE_H);
  ctx.closePath();
  ctx.fill();
  // warm leak along the crest line where the lamps breathe over the edge
  for (let i = 0; i < 40; i++) {
    const ox = (R() - 0.5) * 500;
    const crestY = HB - 74 + Math.abs(ox) * 0.14;
    dab(ctx, HX + ox, crestY - 4 - R() * 8, 24 + R() * 40, 4 + R() * 6, 0, "#3a2210", 0.22);
  }
  // houses — hoods and cradles, never boxes; roofline stacked up the rise
  const house = (hx: number, hy: number, s: number, loft: boolean) => {
    ctx.fillStyle = "#0c141f";
    if (loft) {
      // a lamp-loft: tall hood with a paper-glow crown (the Warden's quarter)
      ctx.beginPath();
      ctx.moveTo(hx - 9 * s, hy);
      ctx.lineTo(hx - 7 * s, hy - 26 * s);
      ctx.quadraticCurveTo(hx, hy - 34 * s, hx + 7 * s, hy - 26 * s);
      ctx.lineTo(hx + 9 * s, hy);
      ctx.closePath();
      ctx.fill();
      dab(ctx, hx, hy - 27 * s, 4.5 * s, 5 * s, 0, "#e8a054", 0.5); // horn-paper glow
      dab(ctx, hx, hy - 27 * s, 9 * s, 10 * s, 0, "#7a3a14", 0.16);
    } else {
      // a hood-house: deep eave curled over like a blanket's edge
      ctx.beginPath();
      ctx.moveTo(hx - 12 * s, hy);
      ctx.lineTo(hx - 11 * s, hy - 13 * s);
      ctx.quadraticCurveTo(hx - 6 * s, hy - 21 * s, hx + 4 * s, hy - 20 * s);
      ctx.quadraticCurveTo(hx + 12 * s, hy - 19 * s, hx + 13 * s, hy - 9 * s);
      ctx.lineTo(hx + 13 * s, hy);
      ctx.closePath();
      ctx.fill();
    }
  };
  const spots: [number, number, number, boolean][] = [
    [HX - 168, HB - 18, 1.0, false], [HX - 118, HB - 34, 0.9, false],
    [HX - 66, HB - 48, 1.1, true], [HX - 8, HB - 60, 1.0, false],
    [HX + 52, HB - 52, 1.2, false], [HX + 112, HB - 38, 0.9, true],
    [HX + 164, HB - 22, 1.0, false], [HX + 8, HB - 40, 0.8, false],
    [HX - 40, HB - 26, 0.85, false], [HX + 78, HB - 26, 0.8, false],
    [HX - 210, HB - 8, 0.9, false], [HX + 205, HB - 10, 0.95, false],
    [HX - 92, HB - 20, 0.75, false], [HX + 140, HB - 16, 0.8, false],
  ];
  for (const [hx, hy, s, loft] of spots) house(hx, hy, s, loft);
  // the sleep-tower — a kneeling figure over the town (hood/cradle/kneeling law);
  // the vista's anchor, three watch-windows stacked up its spine
  const KX = HX - 4, KB = HB - 58;
  ctx.fillStyle = "#0c141f";
  ctx.beginPath();
  ctx.moveTo(KX - 16, KB);
  ctx.lineTo(KX - 13, KB - 44);          // back rising
  ctx.quadraticCurveTo(KX - 12, KB - 66, KX - 2, KB - 70); // hunched shoulders
  ctx.quadraticCurveTo(KX + 8, KB - 73, KX + 10, KB - 62); // bowed head
  ctx.quadraticCurveTo(KX + 16, KB - 58, KX + 15, KB - 46); // face folded down
  ctx.lineTo(KX + 18, KB);
  ctx.closePath();
  ctx.fill();
  for (const [wy, ww] of [[-18, 2.0], [-34, 1.8], [-50, 1.6]] as [number, number][]) {
    dab(ctx, KX + 1, KB + wy, ww, ww * 1.3, 0, "#f6b060", 0.9);
    dab(ctx, KX + 1, KB + wy, ww * 2.6, ww * 3, 0, "#8a4218", 0.25);
  }
  // blue moon-rims along the rooflines — the silhouettes must read, not vanish
  ctx.strokeStyle = "#4a5c80";
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1.3;
  for (const [hx, hy, s] of spots) {
    ctx.beginPath();
    ctx.moveTo(hx - 9 * s, hy - (16 + 3) * s);
    ctx.quadraticCurveTo(hx - 2 * s, hy - 21.5 * s, hx + 6 * s, hy - 19.5 * s);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(KX - 12, KB - 64);
  ctx.quadraticCurveTo(KX - 2, KB - 71.5, KX + 9, KB - 63);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // the windows — every one a kept promise; they must cut THROUGH the glow bowl,
  // hot and readable: the constellation IS the vista (final size bump, board-timed)
  for (let i = 0; i < 52; i++) {
    const [hx, hy, s] = spots[i % spots.length];
    const wx = hx + (R() - 0.5) * 16 * s, wy = hy - (2 + R() * 8) * s;
    dab(ctx, wx, wy, 2.8 + R() * 1.1, 3.6 + R() * 1.1, 0, "#ffc070", 1.0);
    dab(ctx, wx, wy, 6.5, 7.8, 0, "#a04e1c", 0.32);
  }
  // roosting ravens on two rooflines — sound-eaters, off duty
  ctx.fillStyle = "#050810";
  for (const [rx, ry] of [[HX - 60, HB - 62], [HX - 52, HB - 61], [HX + 120, HB - 47]]) {
    dab(ctx, rx, ry, 2.2, 1.6, 0, "#050810", 0.9);
  }
  // the swept path climbing the hill — kept, even now
  for (let t0 = 0; t0 <= 1; t0 += 0.04) {
    dab(ctx, HX - 260 + t0 * 240 + Math.sin(t0 * 3) * 14, HB + 40 - t0 * 62,
      9 - t0 * 4, 2.2, 0.1, "#263450", 0.6);
  }
  return { canvas: c, parallax: 0.3, yOff: 600 };
}

// midground field rolls — the orange fields the knights trek across
const s3MidY = (x: number) => 888 - Math.sin(x * 0.001 + 0.5) * 34 - Math.sin(x * 0.003 + 1.4) * 10;

function s3Fields(): Layer {
  const [c, ctx] = makeCanvas(760, 1020);
  const R = mulberry32(337);
  for (let x = 0; x <= WORLD_W; x += 20) { // crest haze, blue
    dab(ctx, x + (R() - 0.5) * 14, s3MidY(x) - 8 - R() * 20, 40 + R() * 60, 6 + R() * 9, 0,
      "#20355c", 0.06);
  }
  ctx.fillStyle = "#0a1424";
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, s3MidY(0));
  for (let x = 0; x <= WORLD_W; x += 25) ctx.lineTo(x, s3MidY(x) + R() * 4);
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();
  // the amber grain — orange field bands catching what light remains
  for (let i = 0; i < 1500; i++) {
    const x = R() * WORLD_W;
    const y = s3MidY(x) + 6 + Math.pow(R(), 0.8) * 90;
    dab(ctx, x, y, 1, 2.5 + R() * 4, (R() - 0.5) * 0.7,
      R() < 0.55 ? "#8a5a20" : R() < 0.8 ? "#a86c28" : "#5a3c16", 0.42);
  }
  // hedgerow clumps
  for (let i = 0; i < 90; i++) {
    const x = R() * WORLD_W;
    dab(ctx, x, s3MidY(x) + 2 - R() * 6, 5 + R() * 12, 6 + R() * 12, 0, "#060c16", 0.9);
  }
  return { canvas: c, parallax: 0.45, yOff: 760 };
}

// the second rank — rooflines behind the street, one lane deeper into the town.
// Between the front houses you see more kept windows, not empty night: fabric.
function s3StreetBack(): Layer {
  const [c, ctx] = makeCanvas(560, 1050);
  const R = mulberry32(343);
  const hood = (hx: number, hb: number, s: number, nWin: number) => {
    ctx.fillStyle = "#0b1320";
    ctx.beginPath();
    ctx.moveTo(hx - 34 * s, hb);
    ctx.lineTo(hx - 32 * s, hb - 40 * s);
    ctx.quadraticCurveTo(hx - 28 * s, hb - 58 * s, hx - 2 * s, hb - 60 * s);
    ctx.quadraticCurveTo(hx + 24 * s, hb - 58 * s, hx + 30 * s, hb - 42 * s);
    ctx.lineTo(hx + 33 * s, hb);
    ctx.closePath();
    ctx.fill();
    dab(ctx, hx - 4 * s, hb - 56 * s, 26 * s, 2 * s, 0.05, "#32436a", 0.22); // moon rim
    for (let i = 0; i < nWin; i++) {
      const wx = hx - 14 * s + i * 18 * s + (R() - 0.5) * 6;
      const wy = hb - (18 + R() * 16) * s;
      dab(ctx, wx, wy, 3.2, 4, 0, "#e8a054", 0.7);
      dab(ctx, wx, wy, 7.5, 9, 0, "#8a4218", 0.18);
    }
  };
  hood(1590, 940, 1.7, 1);
  hood(1830, 952, 1.9, 2);
  hood(2040, 946, 1.6, 1);
  hood(2260, 955, 2.0, 2);
  // a lamp-loft tower rising behind the Warden's quarter
  ctx.fillStyle = "#0b1320";
  ctx.beginPath();
  ctx.moveTo(2150, 930);
  ctx.lineTo(2156, 812);
  ctx.quadraticCurveTo(2162, 796, 2174, 795);
  ctx.quadraticCurveTo(2186, 796, 2190, 810);
  ctx.lineTo(2198, 930);
  ctx.closePath();
  ctx.fill();
  dab(ctx, 2173, 806, 8, 9, 0, "#e8a054", 0.55); // the horn-paper crown
  dab(ctx, 2173, 806, 18, 20, 0, "#7a3a14", 0.16);
  return { canvas: c, parallax: 0.82, yOff: 560 };
}

const s3GroundTop = (x: number) =>
  850 - Math.sin(x * 0.0012 + 0.9) * 24 - Math.sin(x * 0.0039 + 2.2) * 7;

function s3Ground(): Layer {
  // taller plate than the other grounds: the street houses rise well above the
  // horizon line (a house is 2.5 knights tall — dollhouse scale was the board's
  // hardest kill on this scene)
  const [c, ctx] = makeCanvas(560, 1280);
  const R = mulberry32(347);

  const g = ctx.createLinearGradient(0, 830, 0, PLATE_H);
  g.addColorStop(0, "#0c1526");
  g.addColorStop(0.4, "#0e182a");
  g.addColorStop(1, "#060a14");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, s3GroundTop(0));
  for (let x = 0; x <= WORLD_W; x += 25) ctx.lineTo(x, s3GroundTop(x) + R() * 3);
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();

  // ultramarine grass with amber tips — the orange fields at walking depth
  for (let i = 0; i < 5800; i++) {
    const x = R() * WORLD_W;
    const top = s3GroundTop(x) + 4;
    const y = top + Math.pow(R(), 0.7) * (PLATE_H - top);
    const depth = (y - top) / (PLATE_H - top);
    const shade = R();
    const color =
      shade < 0.4 ? "#0d1626" : shade < 0.62 ? "#101c30" : shade < 0.78 ? "#15243c" :
      shade < 0.9 ? "#1c2c46" : "#243654";
    dab(ctx, x, y, 1.2 + depth * 2.2, 4 + depth * 11, (R() - 0.5) * 0.9, color, 0.6 + depth * 0.3);
  }
  // amber tips — strongest in the west fields, thinning at the street
  for (let i = 0; i < 760; i++) {
    const x = R() * WORLD_W;
    const west = Math.max(0, 1 - x / 1500);
    if (R() > 0.25 + west) continue;
    dab(ctx, x, s3GroundTop(x) + 8 + R() * 110, 1, 2.5 + R() * 4.5, (R() - 0.5) * 0.8,
      R() < 0.6 ? "#8a5a20" : "#b87830", 0.4);
  }

  // the worn path west→east, aiming at the street
  for (let t0 = 0; t0 <= 1; t0 += 0.008) {
    const x = t0 * WORLD_W;
    const y = 1075 + Math.sin(t0 * 4.6) * 22 + Math.sin(t0 * 11) * 7;
    dab(ctx, x, y, 16 + R() * 12, 4 + R() * 2.6, 0.02, "#101a28", 0.5);
  }

  // THE STREET (east half) — house fronts at walking depth, windows kept warm.
  // Thresholds swept. Two windows frame their sleepers. This is somebody's promise.
  // (Iteration 3: the pod-row died at the board — real roofs with weight, timber,
  // staggered baselines, garden walls closing the gaps, light spilling on the ground.)
  const houseFront = (hx: number, hb: number, s: number, sleeper: boolean, daisies: boolean) => {
    const wallW = 40 * s, wallH = 60 * s;
    // wall — plaster over a stone footing
    ctx.fillStyle = "#0b131e";
    ctx.beginPath();
    ctx.moveTo(hx - wallW, hb);
    ctx.lineTo(hx - wallW + 2 * s, hb - wallH);
    ctx.lineTo(hx + wallW - 2 * s, hb - wallH);
    ctx.lineTo(hx + wallW, hb);
    ctx.closePath();
    ctx.fill();
    // plaster wear — the wall is a surface, not a panel
    for (let i = 0; i < 14; i++) {
      dab(ctx, hx + (R() - 0.5) * wallW * 1.7, hb - 14 * s - R() * (wallH - 18 * s),
        4 * s * R() + 2, 2.5 * s * R() + 1.5, R() * TAU,
        R() < 0.5 ? "#0a111b" : "#0d1622", 0.5);
    }
    ctx.fillStyle = "#0a1119"; // stone footing band
    ctx.beginPath();
    ctx.moveTo(hx - wallW, hb);
    ctx.lineTo(hx - wallW + 0.8 * s, hb - 12 * s);
    ctx.lineTo(hx + wallW - 0.8 * s, hb - 12 * s);
    ctx.lineTo(hx + wallW, hb);
    ctx.closePath();
    ctx.fill();
    // timber bones — dark posts the plaster grew old around
    ctx.strokeStyle = "#070d16";
    ctx.lineWidth = 2.6 * s * 0.5;
    for (const tx of [-0.62, 0.05, 0.66]) {
      ctx.beginPath();
      ctx.moveTo(hx + wallW * tx, hb - 11 * s);
      ctx.lineTo(hx + wallW * tx + 1.5 * s, hb - wallH + 2 * s);
      ctx.stroke();
    }
    // THE ROOF — seated ON the wall (the mushroom-cap float was board-killed):
    // low pitch, modest eaves, bottom edge overlapping the wall top by a full course
    ctx.fillStyle = "#080e18";
    ctx.beginPath();
    ctx.moveTo(hx - wallW - 4.5 * s, hb - wallH + 3.5 * s);
    ctx.quadraticCurveTo(hx - wallW + 6 * s, hb - wallH - 13 * s, hx - 4 * s, hb - wallH - 17 * s);
    ctx.quadraticCurveTo(hx + 22 * s, hb - wallH - 17.5 * s, hx + wallW - 2 * s, hb - wallH - 8 * s);
    ctx.quadraticCurveTo(hx + wallW + 5 * s, hb - wallH - 3 * s, hx + wallW + 4.5 * s, hb - wallH + 3.5 * s);
    ctx.closePath();
    ctx.fill();
    // thatch course lines sagging with age
    ctx.strokeStyle = "#060b13";
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 1.3;
    for (const cu of [0.35, 0.68]) {
      ctx.beginPath();
      ctx.moveTo(hx - wallW - (4.5 - cu * 6) * s, hb - wallH + 3.5 * s - cu * 14 * s);
      ctx.quadraticCurveTo(hx, hb - wallH - cu * 19 * s, hx + wallW + (4.5 - cu * 7) * s, hb - wallH + 3.5 * s - cu * 9 * s);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // under-eave shadow ON the wall — the roof presses down, it does not hover
    dab(ctx, hx, hb - wallH + 2.5 * s, wallW * 1.0, 3.5 * s, 0.015, "#050a12", 0.85);
    // moon-blue rim along the roof's western shoulder
    ctx.strokeStyle = "#3c4e74";
    ctx.globalAlpha = 0.38;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(hx - wallW - 3 * s, hb - wallH + 2 * s);
    ctx.quadraticCurveTo(hx - wallW + 7 * s, hb - wallH - 12 * s, hx - 5 * s, hb - wallH - 16 * s);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // chimney — squat, felt-capped (muffled geometry: even smoke is kept quiet)
    ctx.fillStyle = "#0a1119";
    ctx.fillRect(hx + 16 * s, hb - wallH - 26 * s, 7 * s, 13 * s);
    dab(ctx, hx + 19.5 * s, hb - wallH - 27 * s, 5.5 * s, 2.4 * s, 0, "#101a28", 1);
    // the kept window + its light spilling onto the swept ground
    keptWindow(ctx, hx - 10 * s, hb - 34 * s, 15 * s, 19 * s, 1, sleeper);
    dab(ctx, hx - 10 * s, hb + 2, 20 * s, 4 * s, 0, "#c07830", 0.10);
    dab(ctx, hx - 10 * s, hb + 1, 11 * s, 2.4 * s, 0, "#e09040", 0.10);
    // door — muffled: felt-wrapped latch, moss-padded threshold
    ctx.fillStyle = "#081018";
    ctx.beginPath();
    ctx.moveTo(hx + 20 * s, hb);
    ctx.lineTo(hx + 20 * s, hb - 28 * s);
    ctx.quadraticCurveTo(hx + 27 * s, hb - 34 * s, hx + 34 * s, hb - 28 * s);
    ctx.lineTo(hx + 34 * s, hb);
    ctx.closePath();
    ctx.fill();
    dab(ctx, hx + 22 * s, hb - 14 * s, 1.4 * s, 1.4 * s, 0, "#1c2838", 1); // wrapped latch
    dab(ctx, hx + 27 * s, hb + 2, 11 * s, 2.2 * s, 0, "#0f1a14", 0.55); // moss threshold
    ctx.strokeStyle = "#1c2a40"; // swept doorstep arc
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(hx + 27 * s, hb + 4, 15 * s, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (daisies) {
      // the window box gone feral — wake-daisies where none were planted. A warning.
      dab(ctx, hx - 10 * s, hb - 22 * s, 14 * s, 2 * s, 0, "#0a1018", 0.9); // the box
      for (let i = 0; i < 7; i++) {
        const fx0 = hx - 20 * s + R() * 20 * s, fy0 = hb - 24 * s + R() * 4;
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * TAU;
          dab(ctx, fx0 + Math.cos(a) * 2, fy0 + Math.sin(a) * 1.5, 1.4, 1, a, "#cfd0bd", 0.85);
        }
        dab(ctx, fx0, fy0, 1, 1, 0, "#8a7d5a", 0.9);
      }
    }
  };
  // garden walls FIRST (behind the fronts) — the town is a fabric, not parked wagons
  const gardenWall = (x0: number, x1: number, yb: number) => {
    ctx.fillStyle = "#0a1220";
    ctx.beginPath();
    ctx.moveTo(x0, yb);
    ctx.lineTo(x0, yb - 20);
    for (let x = x0; x <= x1; x += 26) {
      ctx.lineTo(x + 13, yb - 20 - ((x * 7) % 5));
    }
    ctx.lineTo(x1, yb - 18);
    ctx.lineTo(x1, yb);
    ctx.closePath();
    ctx.fill();
    dab(ctx, (x0 + x1) / 2, yb - 21, (x1 - x0) * 0.42, 1.4, 0, "#3c4e74", 0.25);
  };
  gardenWall(1400, 1478, 968);
  gardenWall(1596, 1678, 986);
  gardenWall(1788, 1868, 974);
  gardenWall(1975, 2050, 990);
  houseFront(1490, 965, 2.3, true, false);
  houseFront(1735, 985, 2.65, false, true);
  houseFront(1930, 972, 2.4, true, false);
  // the Warden's tall front at the street's end — her lamp burns beside the door
  houseFront(2140, 990, 2.9, false, false);
  // her street lamp: horn-paper hung from a bracket post (moths orbit it at runtime).
  // The post carries a moon rim or the head floats as a sticker (board-caught).
  ctx.strokeStyle = "#060c14";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(S3_LAMP.x + 9, 990);
  ctx.lineTo(S3_LAMP.x + 6, S3_LAMP.y - 16);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath(); // the bracket arm reaching over the street
  ctx.moveTo(S3_LAMP.x + 6, S3_LAMP.y - 14);
  ctx.quadraticCurveTo(S3_LAMP.x - 2, S3_LAMP.y - 16, S3_LAMP.x - 4, S3_LAMP.y - 9);
  ctx.stroke();
  ctx.strokeStyle = "#4a5c80"; // moonlight finds the post's west edge
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(S3_LAMP.x + 6.5, 984);
  ctx.lineTo(S3_LAMP.x + 4, S3_LAMP.y - 12);
  ctx.stroke();
  ctx.globalAlpha = 1;
  dab(ctx, S3_LAMP.x - 3, S3_LAMP.y, 5.5, 7.5, 0, "#f0b268", 0.95);
  dab(ctx, S3_LAMP.x - 3, S3_LAMP.y - 1, 2.2, 3, 0, "#ffd9a0", 0.9); // the wick's heart
  dab(ctx, S3_LAMP.x - 3, S3_LAMP.y, 13, 16, 0, "#8a4a1c", 0.22);
  dab(ctx, S3_LAMP.x - 3, 986, 24, 4.5, 0, "#c07830", 0.10); // her light on the street

  // stones + night shrubs in the fields
  for (let i = 0; i < 40; i++) {
    const x = R() * 1450;
    const y = Math.max(s3GroundTop(x) + 24, 900) + R() * 320;
    const s = 3 + R() * 6;
    dab(ctx, x, y, s, s * 0.7, (R() - 0.5) * 0.4, "#0a0e16", 1);
    dab(ctx, x + s * 0.3, y - s * 0.4, s * 0.4, 1, -0.3, "#3c5070", 0.3);
  }

  // the rest-fire's warm stain — hugging the play plane where the fire actually burns
  const fy = 944;
  for (let i = 0; i < 40; i++) {
    const a = R() * TAU, d = Math.sqrt(R()) * 80;
    dab(ctx, FIRE_X + Math.cos(a) * d, fy + Math.sin(a) * d * 0.35, 12 + R() * 20, 4 + R() * 6,
      (R() - 0.5) * 0.3, R() < 0.6 ? "#241610" : "#301a10", 0.15 * (1 - d / 100));
  }

  return { canvas: c, parallax: 1.0, yOff: 560 }; // yOff MUST match makeCanvas yTop

}

function s3Foreground(sway: number): Layer {
  const [c, ctx] = makeCanvas(930, 1280);
  const R = mulberry32(353); // SAME seed both variants
  for (let i = 0; i < 300; i++) {
    const x = R() * WORLD_W;
    const y = 1035 + R() * 210;
    const h = 28 + R() * 50;
    const lean = (R() - 0.5) * 0.5 + sway * 0.3;
    const amber = R() < 0.3 && x < 1500;
    ctx.strokeStyle = amber ? "#3a2810" : "#040608";
    ctx.lineWidth = 2 + R() * 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.quadraticCurveTo(x + lean * h * 0.4, y - h * 0.55, x + lean * h, y - h);
    ctx.stroke();
  }
  return { canvas: soften(c, 1.6), parallax: 1.22, yOff: 930 };
}

function s3Near(): Layer {
  const [c, ctx] = makeCanvas(940, 1280);
  const R = mulberry32(359);
  for (let i = 0; i < 38; i++) {
    const x = R() * WORLD_W;
    const y = 1195 + R() * 85;
    const h = 85 + R() * 110;
    const lean = (R() - 0.5) * 0.7;
    ctx.strokeStyle = "#020306";
    ctx.lineWidth = 3.5 + R() * 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.quadraticCurveTo(x + lean * h * 0.4, y - h * 0.5, x + lean * h, y - h);
    ctx.stroke();
  }
  // heavy grain heads nodding into frame, west
  for (let i = 0; i < 12; i++) {
    const x = 100 + R() * 1200, y = 1210 + R() * 60;
    const h = 100 + R() * 90, lean = (R() - 0.5) * 0.5;
    ctx.strokeStyle = "#0a0806";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.quadraticCurveTo(x + lean * h * 0.5, y - h * 0.6, x + lean * h, y - h);
    ctx.stroke();
    dab(ctx, x + lean * h, y - h, 4, 9, lean * 0.4, "#241606", 0.95);
    dab(ctx, x + lean * h + 1, y - h - 2, 2.5, 6, lean * 0.4, "#4a3010", 0.5);
  }
  return { canvas: soften(c, 3.2), parallax: 1.45, yOff: 940 };
}

export const SCENE3: SceneDef = {
  id: 3,
  name: "BLUE-HOUR VILLAGE",
  whisper: "They are only sleeping.",
  boundsL: 320, boundsR: 2050,
  spawnX: 420,
  lightX: 1720, // the town's glow owns the light until the street lamp takes over
  glaze: "#2a3a6e", glazeBase: 0.046, glazeBreath: 0.009,
  veil: null,
  fireX: FIRE_X,
  exitEastX: null,
  bake(): SceneBake {
    return {
      layers: [
        s3Sky(),
        s3Hills(),
        s3Town(),
        bakeFog(381, 800, 890, "#16223c", false),
        s3Fields(),
        bakeFog(383, 855, 950, "#131e34", true),
        s3StreetBack(),
        s3Ground(),
      ],
      fgA: s3Foreground(-1),
      fgB: s3Foreground(1),
      near: s3Near(),
    };
  },
};
