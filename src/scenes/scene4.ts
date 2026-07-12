// CHAPTER 4 — GOTHIC STAIR · the spiral descent-and-climb
// Accent: blood/magenta sky on black stone. Emotion: dread + reverence, tightening.
// Canon (WORLD_BIBLE §4): wax-fall architecture (the Tallowwright's centuries),
// the Bellbinder's filled molds ranked like a choir, kneeling keeper statues (some
// are not statues — none of them are, §5), the chasm that ROARS (the Ferrier's one
// failure, his weirs and barge below), bats riding the updraft.
// Review Board: the sky is a SLIT — an inverted horizon. Magenta burns in a band
// between two canyon rims; dark above, dark below. The opposite wall carries the
// cover painting: spiral stair ribbon, ivory wax-falls, lit slit windows.

import {
  makeCanvas, dab, soften,
  WORLD_W, PLATE_H, type Layer,
} from "../paint";
import { mulberry32, TAU } from "../math";
import type { SceneBake, SceneDef } from "../journey";

const FIRE_X = 1910;
const BAND_Y = 620; // the magenta slit's heart

function s4Sky(): Layer {
  const [c, ctx] = makeCanvas(0, 920);
  const R = mulberry32(411);

  // inverted horizon: canyon shadow above, the burning slit LOW-MID (the far wall
  // must silhouette against it — board restage), depth-dark below
  const g = ctx.createLinearGradient(0, 0, 0, 900);
  g.addColorStop(0, "#0e050a");
  g.addColorStop(0.34, "#2a0c1c");
  g.addColorStop(0.56, "#6e2440");
  g.addColorStop(0.68, "#8a2c4e");
  g.addColorStop(0.84, "#3a1226");
  g.addColorStop(1, "#160810");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD_W, 900);

  // broad paint pulls in the band — the sky is molten, slow
  for (let i = 0; i < 130; i++) {
    const y = 420 + R() * 380;
    const heat = Math.max(0, 1 - Math.abs(y - BAND_Y) / 220);
    dab(ctx, R() * WORLD_W, y, 90 + R() * 170, 5 + R() * 9, 0,
      R() < 0.5 ? "#7e2846" : "#4a1830", 0.10 + heat * 0.08);
  }
  // hot streaks where the light escapes between the rims
  for (let i = 0; i < 26; i++) {
    const y = 560 + R() * 160;
    dab(ctx, R() * WORLD_W, y, 120 + R() * 200, 3 + R() * 4, (R() - 0.5) * 0.03,
      "#b04060", 0.10);
  }
  // a few dim stars only in the upper shadow — the world is mostly ceiling here
  for (let i = 0; i < 60; i++) {
    const x = R() * WORLD_W, y = R() * 260;
    dab(ctx, x, y, 0.5 + R() * 0.6, 0.5 + R() * 0.6, 0, "#c8a8b8", 0.10 + R() * 0.16);
  }
  // THE OPPOSITE RIM — a ceiling of stone hanging over the whole scene
  ctx.fillStyle = "#0a0508";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 300);
  let ry = 300;
  for (let x = 0; x <= WORLD_W; x += 40) {
    if (R() < 0.12) ry = 260 + R() * 90;
    ctx.lineTo(x, ry + Math.sin(x * 0.006) * 18);
  }
  ctx.lineTo(WORLD_W, 0);
  ctx.closePath();
  ctx.fill();
  // magenta rim-light licking the underside of the ceiling
  for (let x = 0; x <= WORLD_W; x += 26) {
    const yy = 300 + Math.sin(x * 0.006) * 18 + (R() - 0.5) * 30;
    dab(ctx, x, yy + 8, 20 + R() * 30, 2.5 + R() * 3, 0.02, "#a03858", 0.14);
  }

  return { canvas: c, parallax: 0.04, yOff: 0 };
}

// THE OPPOSITE WALL — the cover painting's far plane: spiral ribbon, wax-falls, slits
function s4FarWall(): Layer {
  const [c, ctx] = makeCanvas(300, 1100);
  const R = mulberry32(421);

  // the wall's great mass rising from the depth into the band
  // (crest heights recorded so parapet fragments sit ON the crest, never floating)
  const crest: [number, number][] = [];
  ctx.fillStyle = "#120a10";
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, 720);
  let wy = 700;
  for (let x = 0; x <= WORLD_W; x += 60) {
    if (R() < 0.14) wy = 640 + R() * 130;
    const yy = wy + Math.sin(x * 0.004 + 1) * 22;
    ctx.lineTo(x, yy);
    crest.push([x, yy]);
  }
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();
  // buttress towers stepping up out of the wall into the light
  for (const [bx, bw, bh] of [
    [280, 60, 380], [760, 78, 470], [1250, 66, 420], [1740, 84, 500], [2180, 58, 360],
  ] as [number, number, number][]) {
    ctx.fillStyle = "#140b12";
    ctx.beginPath();
    ctx.moveTo(bx - bw / 2, PLATE_H);
    ctx.lineTo(bx - bw / 2 + 6, 1100 - bh);
    ctx.quadraticCurveTo(bx, 1100 - bh - 26, bx + bw / 2 - 6, 1100 - bh);
    ctx.lineTo(bx + bw / 2, PLATE_H);
    ctx.closePath();
    ctx.fill();
    // magenta catches every western shoulder
    dab(ctx, bx - bw * 0.28, 1100 - bh + 6, bw * 0.3, 4, -0.2, "#a03858", 0.30);
    // slit windows — the light lives INSIDE the stone (2-3 per tower)
    for (let i = 0; i < 2 + (bx % 2); i++) {
      const sy = 1100 - bh + 60 + i * (70 + (bx % 30));
      const sx0 = bx - 2 + (R() - 0.5) * bw * 0.3;
      ctx.fillStyle = "#d05878";
      ctx.globalAlpha = 0.9;
      ctx.fillRect(sx0, sy, 4.5, 24 + R() * 10);
      ctx.globalAlpha = 0.25;
      ctx.fillRect(sx0 - 2, sy - 3, 8.5, 30 + R() * 10); // its breath in the stone
      ctx.globalAlpha = 1;
    }
  }
  // haze at the wall's foot — Law 4: glowing air between every band
  for (let i = 0; i < 50; i++) {
    dab(ctx, R() * WORLD_W, 1010 + R() * 90, 80 + R() * 140, 10 + R() * 16, 0, "#3a1a2c", 0.11);
  }
  // THE SPIRAL STAIR RIBBON — a real stair cut across the wall, climbing west→east:
  // broad band, lit tread edge, tick-marks reading as steps at distance
  for (const [x0, y0, x1, y1] of [
    [80, 1010, 560, 880], [560, 880, 460, 830], [460, 830, 980, 740],
    [980, 740, 1460, 840], [1460, 840, 1980, 720], [1980, 720, 2340, 780],
  ] as [number, number, number, number][]) {
    ctx.strokeStyle = "#241420";
    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    // lit tread edge along the top
    ctx.strokeStyle = "#8a2c4e";
    ctx.lineWidth = 2.4;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(x0, y0 - 7);
    ctx.lineTo(x1, y1 - 7);
    ctx.stroke();
    // step ticks
    const d = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.floor(d / 26);
    ctx.strokeStyle = "#0e0810";
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.8;
    for (let i = 1; i < n; i++) {
      const u = i / n;
      const px = x0 + (x1 - x0) * u, py = y0 + (y1 - y0) * u;
      ctx.beginPath();
      ctx.moveTo(px, py - 6);
      ctx.lineTo(px - 3, py + 6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // WAX-FALLS — the Tallowwright's cascades: RIVULETS, not slabs (the board killed
  // two geometric attempts — wax is thin, gravity-drawn, bulb-ended, candle-dim)
  const waxfall = (wx: number, top: number, bot: number, w: number) => {
    for (let r = 0; r < 6; r++) {
      const off = (R() - 0.5) * w;
      const len = bot - top;
      let px = wx + off, py = top + R() * 24;
      const segs = 8 + (R() * 4) | 0;
      for (let sgi = 0; sgi < segs; sgi++) {
        const u = sgi / segs;
        const ww = (1.6 + Math.sin(u * 7 + off) * 0.8 + R() * 1.4) * (1 + u * 0.5);
        const ny = top + (u + 1 / segs) * len * (0.86 + R() * 0.1);
        dab(ctx, px, (py + ny) / 2, ww, (ny - py) * 0.62, 0.02 + (R() - 0.5) * 0.04,
          R() < 0.6 ? "#6e6250" : "#8a7a62", 0.55);
        px += (R() - 0.5) * 4;
        py = ny;
      }
      // the bulb where the pour froze
      dab(ctx, px, py + 5, 3 + R() * 2.5, 5 + R() * 5, 0, "#8a7a62", 0.6);
      dab(ctx, px - 1, py + 3, 1.4, 3, 0.1, "#a8987c", 0.4);
    }
    // one pale catch-light down the flow's heart, and magenta on the west air
    dab(ctx, wx, (top + bot) / 2, 2, (bot - top) * 0.34, 0.015, "#a8987c", 0.30);
    dab(ctx, wx - w * 0.7, (top + bot) / 2, 4, (bot - top) * 0.28, 0.05, "#b04060", 0.16);
  };
  waxfall(500, 760, 1060, 46);
  waxfall(1080, 700, 1150, 60);
  waxfall(1560, 780, 1120, 40);
  waxfall(2050, 700, 1080, 54);
  // parapet fragments ON the recorded crest — teeth of the dead wall-walk
  for (let i = 0; i < crest.length; i += 2) {
    if ((i * 7) % 5 < 2) continue;
    const [px, py] = crest[i];
    dab(ctx, px, py - 3, 12 + (i % 9), 7 + (i % 6), 0.05, "#120a10", 1);
  }

  return { canvas: c, parallax: 0.09, yOff: 300 };
}

// the chasm floor, impossibly far below — the Ferrier's world
function s4Depth(): Layer {
  const [c, ctx] = makeCanvas(1040, 1280);
  const R = mulberry32(431);
  // depth gradient — the dark eats everything below the wall's foot
  const g = ctx.createLinearGradient(0, 1040, 0, PLATE_H);
  g.addColorStop(0, "rgba(10,5,8,0)");
  g.addColorStop(0.5, "#0c060a");
  g.addColorStop(1, "#060305");
  ctx.fillStyle = g;
  ctx.fillRect(0, 1040, WORLD_W, PLATE_H - 1040);
  // the river — thin cold glints where the roar lives
  for (let i = 0; i < 110; i++) {
    const x = R() * WORLD_W, y = 1160 + R() * 90;
    dab(ctx, x, y, 8 + R() * 22, 1 + R() * 1.4, (R() - 0.5) * 0.08, "#5a6a88", 0.14 + R() * 0.12);
  }
  // the Ferrier's weirs — moon-silver curves combing the water into murmurs
  ctx.strokeStyle = "#4a5878";
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  for (const wx of [520, 1060, 1620, 2120]) {
    ctx.beginPath();
    ctx.arc(wx, 1240, 90 + (wx % 40), Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // the barge-mill — one wheel, one warm lantern, eternally ashamed
  const bx = 1330, by = 1206;
  ctx.fillStyle = "#0a070a";
  ctx.beginPath();
  ctx.ellipse(bx, by + 8, 34, 7, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#0e0a0e";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(bx + 22, by - 2, 13, 0, TAU); // the wheel
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx + 9, by - 2); ctx.lineTo(bx + 35, by - 2);
  ctx.moveTo(bx + 22, by - 15); ctx.lineTo(bx + 22, by + 11);
  ctx.stroke();
  dab(ctx, bx - 14, by - 8, 1.6, 2, 0, "#e8a054", 0.8); // his lantern
  dab(ctx, bx - 14, by - 8, 4.5, 5.5, 0, "#8a4a1c", 0.25);

  return { canvas: c, parallax: 0.16, yOff: 1040 };
}

// rising spray — the roar made visible, drifting up the walls
function s4Spray(seed: number, near: boolean): Layer {
  const [c, ctx] = makeCanvas(near ? 780 : 900, near ? 1120 : 1240);
  const R = mulberry32(seed);
  for (let i = 0; i < (near ? 22 : 30); i++) {
    const cx0 = 150 + R() * (WORLD_W - 300);
    const cy0 = (near ? 820 : 960) + R() * 200;
    for (let j = 0; j < 6; j++) {
      dab(ctx, cx0 + (R() - 0.5) * 220, cy0 + (R() - 0.5) * 60,
        90 + R() * 170, 10 + R() * (near ? 22 : 16), (R() - 0.5) * 0.1,
        "#3a1828", near ? 0.10 : 0.09);
    }
  }
  return { canvas: c, parallax: near ? 0.62 : 0.3, yOff: near ? 780 : 900, drift: near ? 13 : 8 };
}

// THE TERRACE — the ledge the knights walk: wall, niches, molds, statues, rim, void
const s4GroundTop = (x: number) => 850 - Math.sin(x * 0.0016 + 0.4) * 10;

function s4Terrace(): Layer {
  // The ledge is OPEN to the chasm (board restage: a backdrop wall here turned the
  // canyon into a corridor and hid every far plane). What stands on the ledge is a
  // BROKEN ARCADE — free-standing arch piers the knights walk past, each framing
  // the magenta sky through its opening (the canon slit-window beat, diegetic).
  const [c, ctx] = makeCanvas(560, 1280);
  const R = mulberry32(441);

  // Each arch is a monolithic slab with the pointed opening PUNCHED THROUGH
  // (destination-out) — the opening is guaranteed to read as sky through stone.
  const arch = (ax: number, s: number, broken: boolean) => {
    const ab = 872;
    const H = 230 * s, W = 64 * s;
    ctx.fillStyle = "#130b13";
    ctx.beginPath();
    ctx.moveTo(ax - W, ab);
    ctx.lineTo(ax - W + 5 * s, ab - H * 0.92);
    ctx.quadraticCurveTo(ax - W + 8 * s, ab - H - 8 * s, ax - W * 0.3, ab - H);
    if (broken) {
      // the crown is gone — a jagged breach where the span fell
      ctx.lineTo(ax - W * 0.12, ab - H * 0.98);
      ctx.lineTo(ax + W * 0.05, ab - H * 0.8);
      ctx.lineTo(ax + W * 0.3, ab - H * 0.86);
    } else {
      ctx.quadraticCurveTo(ax, ab - H - 12 * s, ax + W * 0.3, ab - H);
    }
    ctx.quadraticCurveTo(ax + W - 8 * s, ab - H - 6 * s, ax + W - 5 * s, ab - H * 0.9);
    ctx.lineTo(ax + W, ab);
    ctx.closePath();
    ctx.fill();
    // punch the pointed opening
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.moveTo(ax - W * 0.42, ab);
    ctx.lineTo(ax - W * 0.42, ab - H * 0.5);
    ctx.quadraticCurveTo(ax - W * 0.38, ab - H * 0.76, ax, ab - H * 0.82);
    ctx.quadraticCurveTo(ax + W * 0.38, ab - H * 0.76, ax + W * 0.42, ab - H * 0.5);
    ctx.lineTo(ax + W * 0.42, ab);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // fallen voussoirs at its feet
    dab(ctx, ax + W * 0.62, ab - 4, 9 * s, 5 * s, 0.3, "#130b13", 1);
    dab(ctx, ax - W * 0.7, ab - 2, 7 * s, 4 * s, -0.2, "#130b13", 1);
    // magenta rims: outer west edge + the opening's inner east curve (light wraps in)
    ctx.strokeStyle = "#a03858";
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ax - W + 2 * s, ab - 8);
    ctx.lineTo(ax - W + 6.5 * s, ab - H * 0.88);
    ctx.stroke();
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(ax + W * 0.42, ab - H * 0.5);
    ctx.quadraticCurveTo(ax + W * 0.38, ab - H * 0.74, ax + W * 0.05, ab - H * 0.8);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // wax crusts run down the west jamb
    for (let i = 0; i < 3; i++) {
      const wx = ax - W + (4 + R() * 8) * s;
      dab(ctx, wx, ab - H * (0.25 + R() * 0.4), 1.8 * s, (10 + R() * 16) * s, 0.03, "#8a7a62", 0.5);
    }
    // a votive candle at the west jamb's foot
    dab(ctx, ax - W * 0.55, ab - 5, 1.3, 2, 0, "#e8a054", 0.85);
    dab(ctx, ax - W * 0.55, ab - 5, 3.6, 4.4, 0, "#8a4a1c", 0.22);
    dab(ctx, ax - W * 0.55, ab - 1, 3, 1.4, 0, "#8a7a62", 0.5);
  };
  arch(620, 1.0, false);
  arch(1300, 1.2, true);
  arch(1760, 0.9, false);

  // THE BELLBINDER'S CHOIR — filled molds ranked along the wall's foot.
  // Every one filled. Players who stop and look will ask the right question.
  for (const [mx, ms] of [[700, 1.0], [800, 0.85], [890, 1.1], [1350, 0.9], [1450, 1.05]] as [number, number][]) {
    const mb = 866;
    ctx.fillStyle = "#241a2c";
    ctx.beginPath(); // an upturned bell shape on a plinth
    ctx.moveTo(mx - 26 * ms, mb);
    ctx.lineTo(mx - 24 * ms, mb - 8 * ms);
    ctx.quadraticCurveTo(mx - 22 * ms, mb - 46 * ms, mx - 8 * ms, mb - 58 * ms);
    ctx.quadraticCurveTo(mx, mb - 62 * ms, mx + 8 * ms, mb - 58 * ms);
    ctx.quadraticCurveTo(mx + 22 * ms, mb - 46 * ms, mx + 24 * ms, mb - 8 * ms);
    ctx.lineTo(mx + 26 * ms, mb);
    ctx.closePath();
    ctx.fill();
    // the bell's shoulder catches the band — the body must READ before the seal can ask
    ctx.strokeStyle = "#a03858";
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(mx - 21 * ms, mb - 42 * ms);
    ctx.quadraticCurveTo(mx - 16 * ms, mb - 54 * ms, mx - 6 * ms, mb - 58 * ms);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // the wax seal at its mouth — pale, final, low
    dab(ctx, mx, mb - 2 * ms, 20 * ms, 3 * ms, 0, "#8a7a62", 0.65);
  }

  // KNEELING KEEPERS — the statue rank. (They are not statues. §5 says so, quietly.)
  const kneeler = (kx: number, ks: number, crust: number) => {
    const kb = 872;
    ctx.fillStyle = "#181022";
    ctx.beginPath(); // hooded figure kneeling, hands on knees, facing the chasm
    ctx.moveTo(kx - 16 * ks, kb);
    ctx.lineTo(kx - 15 * ks, kb - 14 * ks);        // folded legs
    ctx.quadraticCurveTo(kx - 16 * ks, kb - 40 * ks, kx - 6 * ks, kb - 52 * ks); // back
    ctx.quadraticCurveTo(kx - 1 * ks, kb - 60 * ks, kx + 5 * ks, kb - 55 * ks);  // hood
    ctx.quadraticCurveTo(kx + 11 * ks, kb - 50 * ks, kx + 10 * ks, kb - 42 * ks); // bowed face
    ctx.quadraticCurveTo(kx + 14 * ks, kb - 24 * ks, kx + 12 * ks, kb - 10 * ks); // arms to knees
    ctx.lineTo(kx + 14 * ks, kb);
    ctx.closePath();
    ctx.fill();
    // votive wax crusted down the shoulders — someone still anoints them
    if (crust > 0) {
      for (let i = 0; i < 4; i++) {
        const cx0 = kx - 6 * ks + R() * 10 * ks;
        dab(ctx, cx0, kb - 48 * ks + R() * 10 * ks, 2.2 * ks, (6 + R() * 10) * ks, 0.05,
          "#a89878", 0.5);
      }
    }
    // magenta rims the hood — the sky finds every keeper
    ctx.strokeStyle = "#a03858";
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(kx - 5 * ks, kb - 57 * ks);
    ctx.quadraticCurveTo(kx + 1 * ks, kb - 60 * ks, kx + 6 * ks, kb - 54 * ks);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // a votive candle at the knees — kept lit (Law 6: light is somebody's work)
    dab(ctx, kx + 18 * ks, kb - 3, 1.4, 2.2, 0, "#e8a054", 0.85);
    dab(ctx, kx + 18 * ks, kb - 3, 4, 5, 0, "#8a4a1c", 0.25);
    dab(ctx, kx + 18 * ks, kb + 1, 3.5, 1.6, 0, "#a89878", 0.6); // its wax pool
  };
  kneeler(560, 1.15, 1);
  kneeler(1160, 1.0, 1);
  kneeler(2050, 1.25, 1);

  // the walking surface — long worn flags, step-lines, the center polished by feet
  const g = ctx.createLinearGradient(0, 850, 0, 1010);
  g.addColorStop(0, "#171019");
  g.addColorStop(0.5, "#120c14");
  g.addColorStop(1, "#0b070d");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 1010);
  ctx.lineTo(0, s4GroundTop(0));
  for (let x = 0; x <= WORLD_W; x += 25) ctx.lineTo(x, s4GroundTop(x) + R() * 2);
  ctx.lineTo(WORLD_W, 1010);
  ctx.closePath();
  ctx.fill();
  // flag joints + step breaks
  for (let x = 40; x < WORLD_W; x += 90 + (x % 50)) {
    ctx.strokeStyle = "#080510";
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x, s4GroundTop(x) + 2);
    ctx.lineTo(x - 6, 1006);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // magenta sheen along the walk — wet stone remembers the sky
  for (let i = 0; i < 200; i++) {
    const x = R() * WORLD_W;
    dab(ctx, x, s4GroundTop(x) + 8 + R() * 60, 8 + R() * 18, 1.2 + R() * 1.6,
      (R() - 0.5) * 0.06, R() < 0.6 ? "#3a1226" : "#5a1c36", 0.22);
  }
  // (walk-crossing wax spills killed — they read as white blobs; wax on the walk
  // lives only as small pools at the votive candles now)

  // THE RIM — the outer edge, then nothing. The void is the scene's second character.
  ctx.fillStyle = "#0a060c";
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, 1010);
  for (let x = 0; x <= WORLD_W; x += 60) ctx.lineTo(x, 1008 + R() * 8);
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();
  // rim stones — teeth over the drop
  for (let x = 20; x < WORLD_W; x += 46 + (x % 30)) {
    dab(ctx, x, 1014 + R() * 6, 14 + R() * 12, 5 + R() * 4, (R() - 0.5) * 0.12, "#120c14", 1);
    dab(ctx, x - 4, 1010, 8 + R() * 8, 1.6, 0, "#5a1c36", 0.35);
  }
  // the void swallows the plate below the rim
  const v = ctx.createLinearGradient(0, 1030, 0, PLATE_H);
  v.addColorStop(0, "rgba(6,3,5,0)");
  v.addColorStop(0.6, "rgba(6,3,5,0.85)");
  v.addColorStop(1, "#060305");
  ctx.fillStyle = v;
  ctx.fillRect(0, 1020, WORLD_W, PLATE_H - 1020);

  // the rest-alcove at the east end — a fire-cradle worn into the wall's foot
  const fy = 944;
  for (let i = 0; i < 40; i++) {
    const a = R() * TAU, d = Math.sqrt(R()) * 78;
    dab(ctx, FIRE_X + Math.cos(a) * d, fy + Math.sin(a) * d * 0.35, 12 + R() * 18, 4 + R() * 6,
      (R() - 0.5) * 0.3, R() < 0.6 ? "#241410" : "#2c1810", 0.16 * (1 - d / 95));
  }
  // alcove arch behind it
  ctx.fillStyle = "#0a0710";
  ctx.beginPath();
  ctx.moveTo(FIRE_X - 56, 866);
  ctx.lineTo(FIRE_X - 52, 760);
  ctx.quadraticCurveTo(FIRE_X, 726, FIRE_X + 52, 760);
  ctx.lineTo(FIRE_X + 56, 866);
  ctx.closePath();
  ctx.fill();
  dab(ctx, FIRE_X, 748, 40, 6, 0, "#a03858", 0.2); // magenta on the arch crown

  return { canvas: c, parallax: 1.0, yOff: 560 }; // yOff MUST match makeCanvas yTop
}

// near frame — broken balustrade stumps over the void (the cones were board-killed;
// the frame's job is one quiet edge, not a spectacle)
function s4Near(): Layer {
  const [c, ctx] = makeCanvas(1000, 1280);
  const R = mulberry32(451);
  for (let x = 60; x < WORLD_W; x += 170 + (x % 90)) {
    const h = 60 + R() * 90;
    const base = 1180; // stumps must PEEK into the frame at play zoom (board-caught)
    ctx.fillStyle = "#050308";
    ctx.beginPath();
    ctx.moveTo(x - 16, base);
    ctx.lineTo(x - 12, base - h);
    ctx.quadraticCurveTo(x, base - h - 12 - R() * 16, x + 12, base - h + 4);
    ctx.lineTo(x + 16, base);
    ctx.closePath();
    ctx.fill();
    dab(ctx, x - 8, base - h + 2, 8, 2, -0.2, "#6e2440", 0.4);
    // a sagging wrapped chain between some stumps — the keepers left nothing bare
    if (x % 3 < 1.5) {
      ctx.strokeStyle = "#0a0710";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 16, base - h + 14);
      ctx.quadraticCurveTo(x + 90, base - h + 60 + R() * 20, x + 168, base - h + 10 + R() * 30);
      ctx.stroke();
    }
  }
  return { canvas: soften(c, 2.6), parallax: 1.4, yOff: 1000 };
}

export const SCENE4: SceneDef = {
  id: 4,
  name: "GOTHIC STAIR",
  whisper: "Climb quietly.",
  boundsL: 320, boundsR: 2050,
  spawnX: 410,
  lightX: 1200, // the slit sky overhead is the key light
  glaze: "#5a2038", glazeBase: 0.050, glazeBreath: 0.009,
  veil: null,
  fireX: FIRE_X,
  exitEastX: null,
  bake(): SceneBake {
    return {
      layers: [
        s4Sky(),
        s4FarWall(),
        s4Depth(),
        s4Spray(461, false),
        s4Spray(463, true),
        s4Terrace(),
      ],
      near: s4Near(),
    };
  },
};
