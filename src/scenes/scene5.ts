// CHAPTER 5 — BLACK TOWER · the First Awake
// Accent: red beast in blue-white snow. The quietest place in the world guards the
// loudest object in it (WORLD_BIBLE §5). Phase 1 stages the poster: the tower with
// the mute Great Bell in its belfry mouth, the Ember low and dim behind snow-veils,
// the kneeling colossus snow-drifted at the tower's foot — indistinguishable from a
// statue (the reveal is Phase 3's; this bake IS the "peace first" beat), the
// clapper's 400-year trench arcing through virgin snow, offering-bowls at its rim.

import {
  makeCanvas, dab, ridgeline, soften,
  WORLD_W, PLATE_H, type Layer,
} from "../paint";
import { mulberry32, TAU } from "../math";
import type { SceneBake, SceneDef } from "../journey";

const TOWER_X = 1790;
export const S5_EMBER = { x: 1430, y: 792, r: 150 }; // low, behind the snow

function s5Sky(): Layer {
  const [c, ctx] = makeCanvas(0, 940);
  const R = mulberry32(511);

  // cold, close sky — snow-light has no depth, only breath
  const g = ctx.createLinearGradient(0, 0, 0, 900);
  g.addColorStop(0, "#141c28");
  g.addColorStop(0.5, "#233043");
  g.addColorStop(0.8, "#3c4c60");
  g.addColorStop(1, "#556678");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD_W, 920);

  // slow cold pulls
  for (let i = 0; i < 120; i++) {
    const y = R() * 840;
    dab(ctx, R() * WORLD_W, y, 90 + R() * 160, 5 + R() * 9, 0,
      y > 500 ? "#46586c" : "#1c2634", 0.14);
  }

  // THE EMBER — low, dim, seen through snowfall: the heart still burns under the cold
  const E = S5_EMBER;
  const halo = ctx.createRadialGradient(E.x, E.y, E.r * 0.5, E.x, E.y, E.r * 2.6);
  halo.addColorStop(0, "rgba(120,26,16,0.30)");
  halo.addColorStop(1, "rgba(120,26,16,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(E.x - E.r * 2.7, E.y - E.r * 2.7, E.r * 5.4, E.r * 5.4);
  ctx.fillStyle = "#8a2018";
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(E.x, E.y, E.r, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  for (let i = 0; i < 120; i++) {
    const a = R() * TAU, d = Math.sqrt(R()) * E.r * 0.96;
    dab(ctx, E.x + Math.cos(a) * d, E.y + Math.sin(a) * d,
      4 + R() * 12, 2.5 + R() * 5, R() * TAU, R() < 0.5 ? "#7e1c15" : "#962419", 0.12);
  }
  // snow-veils crossing the disc — the cold breathing over the heart
  for (let i = 0; i < 5; i++) {
    const vy = E.y - E.r * 0.8 + R() * E.r * 1.6;
    for (let j = 0; j <= 24; j++) {
      const u = j / 24;
      const tt = Math.sin(Math.PI * u);
      dab(ctx, E.x - E.r * 1.3 + u * E.r * 2.6, vy + Math.sin(u * 5 + i) * 7,
        12 + tt * 22, 2 + tt * 4, 0.02, "#3c4c60", 0.4 * (0.4 + 0.6 * tt));
    }
  }
  // high snow-haze bands
  for (let i = 0; i < 40; i++) {
    dab(ctx, R() * WORLD_W, 120 + R() * 420, 120 + R() * 220, 12 + R() * 20, 0, "#2c3a4c", 0.10);
  }

  return { canvas: c, parallax: 0.04, yOff: 0 };
}

function s5Far(): Layer {
  const [c, ctx] = makeCanvas(600, 960);
  const R = mulberry32(521);
  // dream-altitude ranges, barely there through the snow-air
  for (let i = 0; i < 50; i++) {
    dab(ctx, R() * WORLD_W, 760 + R() * 60, 100 + R() * 170, 10 + R() * 14, 0, "#3a4a5e", 0.10);
  }
  ctx.save();
  ctx.globalAlpha = 0.7;
  ridgeline(ctx, 790, 130, "#2a3648", 523);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.85;
  ridgeline(ctx, 828, 150, "#1e2a3a", 524);
  ctx.restore();
  return { canvas: c, parallax: 0.1, yOff: 600 };
}

// THE BLACK TOWER — the journey's period. It is TALL: the top leaves the frame.
function s5Tower(): Layer {
  const [c, ctx] = makeCanvas(0, 1060);
  const R = mulberry32(531);
  const TX = TOWER_X;

  // glowing haze at its foot — even here, Law 4 holds
  for (let i = 0; i < 40; i++) {
    dab(ctx, TX + (R() - 0.5) * 500, 940 + R() * 60, 70 + R() * 120, 10 + R() * 16, 0,
      "#4a3038", 0.10);
  }

  // the shaft — tapered, black, wind-scoured
  ctx.fillStyle = "#0c0e14";
  ctx.beginPath();
  ctx.moveTo(TX - 150, 1010);
  ctx.lineTo(TX - 96, 60);
  ctx.lineTo(TX + 96, 60);
  ctx.lineTo(TX + 150, 1010);
  ctx.closePath();
  ctx.fill();
  // buttress roots gripping the field
  for (const [bx, bw] of [[-170, 54], [170, 54], [-120, 40], [120, 40]] as [number, number][]) {
    ctx.beginPath();
    ctx.moveTo(TX + bx - bw / 2, 1010);
    ctx.quadraticCurveTo(TX + bx, 880, TX + bx * 0.55, 760);
    ctx.lineTo(TX + bx * 0.55 + (bx > 0 ? -30 : 30), 780);
    ctx.quadraticCurveTo(TX + bx * 0.8, 900, TX + bx + bw / 2 - bw, 1010);
    ctx.closePath();
    ctx.fill();
  }
  // stone courses — the tower is built, not extruded (width follows the taper)
  for (let i = 0; i < 90; i++) {
    const y = 90 + R() * 880;
    dab(ctx, TX + (R() - 0.5) * (150 * (y / 1010) + 60), y, 20 + R() * 34, 4 + R() * 6,
      (R() - 0.5) * 0.04, R() < 0.5 ? "#0a0c11" : "#101420", 0.55);
  }

  // THE BELFRY MOUTH — a tall arched void near the top; inside hangs the Great Bell,
  // mute, clapperless. The loudest voice in the world, kept.
  const BY = 300; // mouth center
  ctx.fillStyle = "#05060a";
  ctx.beginPath();
  ctx.moveTo(TX - 62, BY + 130);
  ctx.lineTo(TX - 62, BY - 60);
  ctx.quadraticCurveTo(TX, BY - 128, TX + 62, BY - 60);
  ctx.lineTo(TX + 62, BY + 130);
  ctx.closePath();
  ctx.fill();
  // the Ember's light grazes the mouth's west jamb
  ctx.strokeStyle = "#7e2418";
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(TX - 60, BY + 124);
  ctx.lineTo(TX - 60, BY - 56);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // THE GREAT BELL — hanging, still. Its silhouette must read at a glance.
  ctx.fillStyle = "#111722";
  ctx.beginPath();
  ctx.moveTo(TX - 4, BY - 96); // the crown loop
  ctx.lineTo(TX + 4, BY - 96);
  ctx.lineTo(TX + 5, BY - 82);
  ctx.quadraticCurveTo(TX + 34, BY - 66, TX + 38, BY + 6);
  ctx.quadraticCurveTo(TX + 40, BY + 26, TX + 46, BY + 34); // the lip flares
  ctx.lineTo(TX - 46, BY + 34);
  ctx.quadraticCurveTo(TX - 40, BY + 26, TX - 38, BY + 6);
  ctx.quadraticCurveTo(TX - 34, BY - 66, TX - 5, BY - 82);
  ctx.closePath();
  ctx.fill();
  // its inner dark — NO clapper. The absence is the whole story.
  ctx.fillStyle = "#020304";
  ctx.beginPath();
  ctx.ellipse(TX, BY + 34, 42, 7, 0, 0, Math.PI, false);
  ctx.fill();
  // ember rim on the bell's west shoulder
  ctx.strokeStyle = "#6e2014";
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(TX - 36, BY + 2);
  ctx.quadraticCurveTo(TX - 32, BY - 58, TX - 6, BY - 78);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // snow on west-facing ledges — pale shelves up the shaft (NEVER inside the
  // belfry mouth: snow dabs there turned the mute bell into an onion, board-caught)
  for (let i = 0; i < 16; i++) {
    const y = 120 + R() * 820;
    const off = (R() - 0.5) * (150 * (y / 1010) + 40);
    if (y > BY - 130 && y < BY + 135 && Math.abs(off) < 70) continue;
    dab(ctx, TX + off, y, 8 + R() * 14, 1.8 + R() * 2, (R() - 0.5) * 0.06, "#9aacc0", 0.5);
  }
  // a cold top-light finds the bell's crown — the eye must land on it
  dab(ctx, TX, BY - 88, 10, 2.5, 0, "#8ea4bc", 0.5);
  // the Ember rims the tower's west edge, all the way up
  ctx.strokeStyle = "#7e2418";
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(TX - 148, 1000);
  ctx.lineTo(TX - 95, 70);
  ctx.stroke();
  ctx.globalAlpha = 1;

  return { canvas: c, parallax: 0.28, yOff: 0 };
}

// snow-drift bands (the fog of this scene — pale, alive)
function s5Drift(seed: number, near: boolean): Layer {
  const [c, ctx] = makeCanvas(near ? 840 : 760, near ? 1050 : 980);
  const R = mulberry32(seed);
  for (let i = 0; i < (near ? 24 : 30); i++) {
    const cx0 = 150 + R() * (WORLD_W - 300);
    const cy0 = (near ? 880 : 800) + R() * 120;
    for (let j = 0; j < 6; j++) {
      dab(ctx, cx0 + (R() - 0.5) * 240, cy0 + (R() - 0.5) * 24,
        110 + R() * 200, 8 + R() * (near ? 18 : 13), 0, "#8ea4bc", near ? 0.09 : 0.08);
    }
  }
  return { canvas: c, parallax: near ? 0.62 : 0.24, yOff: near ? 840 : 760, drift: near ? -14 : -9 };
}

const s5GroundTop = (x: number) =>
  852 - Math.sin(x * 0.001 + 1.3) * 18 - Math.sin(x * 0.0033) * 6;

function s5Ground(): Layer {
  const [c, ctx] = makeCanvas(790, 1280);
  const R = mulberry32(551);

  // THE SNOWFIELD — the one pale ground of the journey; the knights become the
  // dark marks on it (the poster's contrast, inverted from every other chapter)
  const g = ctx.createLinearGradient(0, 840, 0, PLATE_H);
  g.addColorStop(0, "#8ea4bc");
  g.addColorStop(0.35, "#7e94ac");
  g.addColorStop(1, "#5a7088");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, s5GroundTop(0));
  for (let x = 0; x <= WORLD_W; x += 25) ctx.lineTo(x, s5GroundTop(x) + R() * 2);
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();

  // blue shadow dunes — the wind wrote these
  for (let i = 0; i < 240; i++) {
    const x = R() * WORLD_W;
    const y = s5GroundTop(x) + 10 + Math.pow(R(), 0.8) * 380;
    dab(ctx, x, y, 22 + R() * 46, 4 + R() * 8, (R() - 0.5) * 0.1,
      R() < 0.6 ? "#6a8098" : "#5c7288", 0.30);
  }
  // wind-polished shine lines
  for (let i = 0; i < 130; i++) {
    const x = R() * WORLD_W;
    dab(ctx, x, s5GroundTop(x) + 14 + R() * 300, 26 + R() * 60, 1.6 + R() * 2,
      0.02 + (R() - 0.5) * 0.05, "#c2d2e2", 0.30);
  }
  // buried grass tips + stones with snow caps
  for (let i = 0; i < 120; i++) {
    const x = R() * WORLD_W, y = 930 + R() * 290;
    ctx.strokeStyle = "#3a4a5c";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (R() - 0.5) * 5, y - 5 - R() * 7);
    ctx.stroke();
  }
  for (let i = 0; i < 26; i++) {
    const x = R() * WORLD_W, y = 940 + R() * 280;
    const s = 4 + R() * 7;
    dab(ctx, x, y, s, s * 0.6, (R() - 0.5) * 0.3, "#2a3644", 1);
    dab(ctx, x - s * 0.1, y - s * 0.5, s * 0.9, s * 0.35, 0, "#b6c6d8", 0.9);
  }

  // THE TRENCH — four hundred years of the dragged clapper, a perfect circle
  // around the tower; the field's one scripture. Seen here as its western arc.
  for (let t0 = 0; t0 <= 1; t0 += 0.006) {
    const a = Math.PI * 0.86 + t0 * Math.PI * 0.5;
    const tx = TOWER_X + Math.cos(a) * 560;
    const ty = 1064 + Math.sin(a) * 150;
    if (tx < 0 || tx > WORLD_W) continue;
    dab(ctx, tx, ty, 16 + R() * 8, 5 + R() * 3, Math.atan2(150 * Math.cos(a), -560 * Math.sin(a)) * 0.2,
      "#46586c", 0.5);
    if (R() < 0.4) dab(ctx, tx, ty - 5, 12 + R() * 8, 2 + R() * 1.6, 0, "#c2d2e2", 0.5);
  }
  // offering-bowls at the trench's rim — snow-filled, kept anyway
  for (const [ox, oy] of [[1180, 1010], [1420, 1075], [1960, 1120]] as [number, number][]) {
    dab(ctx, ox, oy, 11, 4.5, 0, "#242e3c", 1);
    dab(ctx, ox, oy - 2.5, 8.5, 2.6, 0, "#b6c6d8", 0.95);
    dab(ctx, ox - 4, oy - 4, 3, 1, -0.2, "#d6e2ee", 0.5);
  }

  return { canvas: c, parallax: 1.0, yOff: 790 };
}

function s5Near(): Layer {
  const [c, ctx] = makeCanvas(1000, 1280);
  const R = mulberry32(561);
  // near drift mounds swallowing the frame's bottom
  for (let i = 0; i < 14; i++) {
    const x = R() * WORLD_W;
    dab(ctx, x, 1220 + R() * 60, 120 + R() * 160, 30 + R() * 40, (R() - 0.5) * 0.06, "#4a5e74", 1);
    dab(ctx, x - 20, 1196 + R() * 40, 90 + R() * 120, 14 + R() * 18, 0, "#7e94ac", 0.8);
  }
  // one frozen thorn bush reaching into frame, west — the field remembers Chapter 1
  ctx.strokeStyle = "#1a222e";
  ctx.lineCap = "round";
  for (let j = 0; j < 7; j++) {
    const a = -0.4 - R() * 2.2, len = 90 + R() * 110;
    ctx.lineWidth = 4 + R() * 3;
    ctx.beginPath();
    ctx.moveTo(360, 1290);
    ctx.quadraticCurveTo(360 + Math.cos(a) * len * 0.5, 1290 + Math.sin(a) * len * 0.7, 360 + Math.cos(a) * len, 1290 + Math.sin(a) * len);
    ctx.stroke();
    dab(ctx, 360 + Math.cos(a) * len, 1290 + Math.sin(a) * len, 5, 2, a, "#b6c6d8", 0.8);
  }
  return { canvas: soften(c, 2.4), parallax: 1.32, yOff: 1000 };
}

export const SCENE5: SceneDef = {
  id: 5,
  name: "BLACK TOWER",
  whisper: "You have heard him before.",
  boundsL: 320, boundsR: 2080,
  spawnX: 400,
  lightX: S5_EMBER.x, // the dim Ember owns what warmth there is
  glaze: "#4a5a70", glazeBase: 0.05, glazeBreath: 0.008,
  veil: { x: S5_EMBER.x, y: S5_EMBER.y, r: S5_EMBER.r, parallax: 0.04, outA: 0.045, inA: 0.06 },
  fireX: null,
  exitEastX: 2060, // past the kneeling watch — Phase 3 will make this a threshold
  bake(): SceneBake {
    return {
      layers: [
        s5Sky(),
        s5Far(),
        s5Tower(),
        s5Drift(571, false),
        // THE FIRST AWAKE lives at runtime now (src/awake.ts) — Phase 3 gave the
        // statue its four-hundred-year heartbeat. The bake keeps only his world.
        s5Drift(573, true),
        s5Ground(),
      ],
      near: s5Near(),
    };
  },
};
