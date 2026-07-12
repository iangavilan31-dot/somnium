// CHAPTER 2 — CAMPFIRE NIGHT · the Pilgrim Road
// Accent: ember red in blue-green dark. The warmest frame in the game.
// Canon (WORLD_BIBLE §4): mile-monoliths marching toward the Ember (they LEAN west,
// toward the warm glow below the horizon — the must-ask question); a dead Loud Age
// castle on the moonlit ridge (the ONLY place battlements may exist: on the corpse
// layer); a keeper procession as a lantern-line on the far valley floor; the crescent
// moon is a CLOSED EYELID (iconography §3 — no crescent in this world is a moon).
// Review Board notes: the fire is the subject; the castle watches from the edge and
// never competes; the eyelid-moon is the scene's celestial body (S1 law carried over).

import {
  makeCanvas, dab, ridgeline, soften, bakeFog,
  WORLD_W, PLATE_H, type Layer,
} from "../paint";
import { mulberry32, TAU } from "../math";
import type { SceneBake, SceneDef } from "../journey";

const MOON_X = 1640, MOON_Y = 352, MOON_R = 102;
const FIRE_X = 1850;
const EMBER_GLOW_X = 140; // the Ember is below the west horizon; its light is not

function s2Sky(): Layer {
  const [c, ctx] = makeCanvas(0, 920);
  const R = mulberry32(211);

  const g = ctx.createLinearGradient(0, 0, 0, 860);
  g.addColorStop(0, "#04070a");
  g.addColorStop(0.5, "#071013");
  g.addColorStop(0.85, "#0b1a1a");
  g.addColorStop(1, "#102420");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD_W, 880);

  // broad night paint pulls
  for (let i = 0; i < 110; i++) {
    const y = R() * 800;
    dab(ctx, R() * WORLD_W, y, 90 + R() * 150, 5 + R() * 8, 0,
      y > 520 ? "#0c1a18" : "#060b0d", 0.15);
  }

  // clear-night stars — denser than Scene 1; they thin near the moon's light
  for (let i = 0; i < 260; i++) {
    const x = R() * WORLD_W, y = R() * 560;
    const dMoon = Math.hypot(x - MOON_X, y - MOON_Y);
    const fade = Math.min(1, Math.max(0, (dMoon - MOON_R - 40) / 220));
    const big = R() < 0.06;
    dab(ctx, x, y, big ? 1.5 : 0.5 + R() * 0.7, big ? 1.5 : 0.5 + R() * 0.7, 0,
      "#c3d2cd", (big ? 0.55 : 0.14 + R() * 0.3) * (0.2 + 0.8 * fade));
  }

  // THE CLOSED EYE — the crescent drawn DIRECTLY as a lid shape (outer arc below,
  // inner arc above), never as a bite-disc: a dark circle over a halo'd sky reads
  // as an eclipse bug, not an eyelid (iteration-1 kill, see GATE0_REPORT §15).
  const halo = ctx.createRadialGradient(MOON_X, MOON_Y, MOON_R * 0.4, MOON_X, MOON_Y, MOON_R * 3.0);
  halo.addColorStop(0, "rgba(150,180,172,0.13)");
  halo.addColorStop(1, "rgba(150,180,172,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(MOON_X - MOON_R * 3.1, MOON_Y - MOON_R * 3.1, MOON_R * 6.2, MOON_R * 6.2);
  // the lid (iteration 3 — the board killed the "smile"): outer + inner arcs meet at
  // TRUE intersection points (sharp horns, no chords); the lid line is a FLATTER arc
  // (bigger radius, center high) so the shape reads heavy-lidded, not banana; the fill
  // is dim and painterly with halation, never crisp vector (Law 10). No lashes — they
  // read as drips at every size tried.
  ctx.save();
  ctx.translate(MOON_X, MOON_Y);
  ctx.rotate(-0.05); // nothing celestial is set square
  const LID_CY = -MOON_R * 0.55, LID_R = MOON_R * 1.18;
  // horn tips where the two circles genuinely intersect (precomputed): outer α≈0.082,
  // inner-angle for the same points ≈0.565
  const lune = () => {
    ctx.beginPath();
    ctx.arc(0, 0, MOON_R, 0.082, Math.PI - 0.082);
    ctx.arc(0, LID_CY, LID_R, Math.PI - 0.565, 0.565, true);
    ctx.closePath();
  };
  ctx.fillStyle = "#b4c4be";
  ctx.globalAlpha = 0.92;
  lune();
  ctx.fill();
  // halation — soft light bleeding past the edge, painted not blurred
  ctx.strokeStyle = "#b4c4be";
  ctx.lineCap = "round";
  for (const [lw, la] of [[3, 0.10], [6.5, 0.055], [11, 0.03]] as [number, number][]) {
    ctx.globalAlpha = la;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(0, 0, MOON_R + lw * 0.4, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }
  // mottle clipped to the lune — the lid has skin, not enamel
  ctx.save();
  lune();
  ctx.clip();
  for (let i = 0; i < 110; i++) {
    const a = 0.1 + R() * (Math.PI - 0.2);
    const d = MOON_R * (0.55 + R() * 0.45);
    dab(ctx, Math.cos(a) * d, Math.sin(a) * d, 3 + R() * 8, 2 + R() * 3.5, R() * TAU,
      R() < 0.55 ? "#a3b4ae" : "#c6d6d0", 0.14);
  }
  // shadow pooling under the lid line, fading toward the bright lower limb
  const lidShade = ctx.createLinearGradient(0, LID_CY + LID_R - MOON_R * 0.34, 0, MOON_R * 0.9);
  lidShade.addColorStop(0, "rgba(90,110,105,0.5)");
  lidShade.addColorStop(0.45, "rgba(90,110,105,0.12)");
  lidShade.addColorStop(1, "rgba(90,110,105,0)");
  ctx.fillStyle = lidShade;
  ctx.globalAlpha = 1;
  ctx.fillRect(-MOON_R, -MOON_R, MOON_R * 2, MOON_R * 2);
  ctx.restore();
  // the lid line itself — one confident stroke, the fold of a sleeping eye
  ctx.strokeStyle = "#5e746e";
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(0, LID_CY, LID_R, Math.PI - 0.52, 0.52, true);
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;

  // moonlit cloud banks — lit from ABOVE-side (pale top rims), unlike S1's under-lit
  const moonMass = (cx0: number, cy0: number, w: number, h: number, alpha: number, rim: number) => {
    for (let i = 0; i < 46; i++) {
      const ox = (R() + R() - 1) * 0.5 * w;
      const oy = (R() + R() - 1) * 0.5 * h - Math.abs(ox / w) * h * 0.35;
      dab(ctx, cx0 + ox, cy0 + oy, w * (0.10 + R() * 0.18), h * (0.16 + R() * 0.28),
        (R() - 0.5) * 0.35, "#081114", alpha * 0.6);
    }
    if (rim > 0) {
      for (let i = 0; i < 14; i++) {
        const ox = (R() + R() - 1) * 0.5 * w;
        const px = cx0 + ox;
        const near = Math.max(0, 1 - Math.hypot(px - MOON_X, cy0 - MOON_Y) / 900);
        dab(ctx, px, cy0 - h * (0.32 + R() * 0.2) - Math.abs(ox / w) * h * 0.3,
          w * (0.05 + R() * 0.08), 2 + R() * 3, (R() - 0.5) * 0.12,
          R() < 0.6 ? "#5f7a74" : "#8ba49d", rim * (0.08 + 0.14 * (0.3 + 0.7 * near)));
      }
    }
  };
  moonMass(420, 250, 520, 100, 0.11, 0.3);
  moonMass(1150, 180, 560, 90, 0.10, 0.4);
  moonMass(2200, 300, 420, 95, 0.10, 0.35);
  // one sliver resting across the eyelid — the sky tucks it in
  for (let i = 0; i <= 26; i++) {
    const u = i / 26;
    const tt = Math.sin(Math.PI * u);
    dab(ctx, 1500 + u * 300, 322 + Math.sin(u * 5.2) * 5, 12 + tt * 22, 1.6 + tt * 3.4,
      0.03, "#0a1215", 0.4 * (0.4 + 0.6 * tt));
  }

  // the Ember below the west horizon — its light stains the sky it can't reach into
  const ember = ctx.createRadialGradient(EMBER_GLOW_X, 880, 40, EMBER_GLOW_X, 880, 560);
  ember.addColorStop(0, "rgba(140,36,18,0.20)");
  ember.addColorStop(0.5, "rgba(110,26,14,0.10)");
  ember.addColorStop(1, "rgba(110,26,14,0)");
  ctx.fillStyle = ember;
  ctx.fillRect(0, 340, 900, 560);
  for (let i = 0; i < 26; i++) {
    dab(ctx, R() * 560, 700 + R() * 150, 80 + R() * 130, 8 + R() * 13, 0, "#3a1009", 0.10);
  }

  return { canvas: c, parallax: 0.04, yOff: 0 };
}

function s2Clouds(): Layer {
  const [c, ctx] = makeCanvas(0, 520);
  const R = mulberry32(217);
  // thin drifting streaks, faintly pale-edged
  for (let i = 0; i < 9; i++) {
    const cx0 = 260 + R() * (WORLD_W - 520);
    const cy0 = 60 + R() * 300;
    for (let j = 0; j < 6; j++) {
      dab(ctx, cx0 + (R() - 0.5) * 300, cy0 + (R() - 0.5) * 20,
        100 + R() * 160, 3.5 + R() * 5, (R() - 0.5) * 0.08, "#0a1316", 0.32);
    }
    dab(ctx, cx0, cy0 - 6, 90 + R() * 110, 1.6, 0, "#7e968f", 0.06);
  }
  return { canvas: c, parallax: 0.06, yOff: 0, drift: -7 };
}

function s2Ridge(): Layer {
  const [c, ctx] = makeCanvas(520, 920);
  const R = mulberry32(223);
  // moon-silver scattering above the ridgeline
  for (let i = 0; i < 70; i++) {
    const x = R() * WORLD_W;
    const near = Math.max(0, 1 - Math.abs(x - MOON_X) / 1100);
    dab(ctx, x, 690 + R() * 90, 100 + R() * 170, 9 + R() * 14, 0, "#16262a", 0.10 + 0.10 * near);
  }
  ridgeline(ctx, 760, 170, "#0d1719", 227);
  ridgeline(ctx, 792, 200, "#081012", 228);

  // THE LOUD AGE CASTLE — dead, broken, moon-rimmed. Battlements live ONLY here.
  const cxx = 700, cb = 742;
  // its own knoll first — the random-walk ridge won't promise contact, so the
  // castle brings the hill it died on (floating ruins read as a bug, not a myth)
  ctx.fillStyle = "#0d1719";
  ctx.beginPath();
  ctx.moveTo(cxx - 260, PLATE_H);
  ctx.lineTo(cxx - 190, 830);
  ctx.quadraticCurveTo(cxx - 120, cb + 18, cxx - 20, cb - 2);
  ctx.quadraticCurveTo(cxx + 60, cb - 8, cxx + 130, cb + 14);
  ctx.quadraticCurveTo(cxx + 190, cb + 34, cxx + 230, 830);
  ctx.lineTo(cxx + 300, PLATE_H);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#070d10";
  const merlons = (x0: number, y0: number, w: number, n: number) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    const step = w / (n * 2 - 1);
    for (let i = 0; i < n; i++) {
      const mx = x0 + i * step * 2;
      ctx.lineTo(mx, y0 - 6);
      ctx.lineTo(mx + step, y0 - 6);
      ctx.lineTo(mx + step, y0);
      if (i < n - 1) ctx.lineTo(mx + step * 2, y0);
    }
    ctx.lineTo(x0 + w, y0 + 4);
    ctx.lineTo(x0, y0 + 4);
    ctx.closePath();
    ctx.fill();
  };
  // keep tower (tallest, cracked crown)
  ctx.beginPath();
  ctx.moveTo(cxx - 14, cb);
  ctx.lineTo(cxx - 11, cb - 92);
  ctx.lineTo(cxx - 4, cb - 96);
  ctx.lineTo(cxx - 4, cb - 88);
  ctx.lineTo(cxx + 3, cb - 88);
  ctx.lineTo(cxx + 3, cb - 96);
  ctx.lineTo(cxx + 9, cb - 90);
  ctx.lineTo(cxx + 12, cb);
  ctx.closePath();
  ctx.fill();
  merlons(cxx - 11, cb - 88, 20, 3);
  // leaning drum tower east — losing to the hill
  ctx.save();
  ctx.translate(cxx + 92, cb + 2);
  ctx.rotate(0.07);
  ctx.beginPath();
  ctx.moveTo(-11, 0);
  ctx.lineTo(-9, -58);
  ctx.lineTo(9, -58);
  ctx.lineTo(11, 0);
  ctx.closePath();
  ctx.fill();
  merlons(-10, -58, 20, 3);
  ctx.restore();
  // curtain wall between, breached mid-span
  ctx.beginPath();
  ctx.moveTo(cxx + 12, cb - 40);
  ctx.lineTo(cxx + 34, cb - 38);
  ctx.lineTo(cxx + 42, cb - 20);
  ctx.lineTo(cxx + 58, cb - 36);
  ctx.lineTo(cxx + 82, cb - 38);
  ctx.lineTo(cxx + 84, cb + 6);
  ctx.lineTo(cxx + 10, cb + 6);
  ctx.closePath();
  ctx.fill();
  merlons(cxx + 12, cb - 38, 22, 3);
  merlons(cxx + 60, cb - 36, 22, 3);
  // swallowing trees at the base
  for (let i = 0; i < 26; i++) {
    const tx = cxx - 40 + R() * 170;
    dab(ctx, tx, cb + 2 - R() * 10, 4 + R() * 9, 6 + R() * 12, 0, "#060b0a", 0.95);
  }
  // moonlight rims the dead stone — pale, the only kindness it gets
  ctx.strokeStyle = "#7e968f";
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cxx + 9, cb - 90); ctx.lineTo(cxx + 11.5, cb - 8);
  ctx.moveTo(cxx + 100, cb - 54); ctx.lineTo(cxx + 102, cb - 4);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // NO lit windows. Nobody keeps the Loud Age.

  return { canvas: c, parallax: 0.1, yOff: 520 };
}

function s2Valley(): Layer {
  const [c, ctx] = makeCanvas(740, 960);
  const R = mulberry32(229);
  // cool haze the ridge floats on
  for (let i = 0; i < 60; i++) {
    const x = R() * WORLD_W;
    dab(ctx, x, 800 + R() * 26, 90 + R() * 150, 8 + R() * 11, 0, "#14262b", 0.12);
  }
  ctx.fillStyle = "#060c0c";
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, 828);
  for (let x = 0; x <= WORLD_W; x += 60) {
    ctx.lineTo(x, 814 + Math.sin(x * 0.0037 + 1.1) * 12 + R() * 7);
  }
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 100; i++) { // valley mist
    dab(ctx, R() * WORLD_W, 818 + R() * 30, 70 + R() * 140, 6 + R() * 10, 0, "#1a2c2c", 0.15);
  }
  for (let i = 0; i < 90; i++) { // tree clumps
    dab(ctx, R() * WORLD_W, 832 + R() * 55, 6 + R() * 14, 8 + R() * 16, 0, "#040807", 0.9);
  }

  // THE PROCESSION — a lantern-line crossing the far floor toward the Ember.
  // Unreachable staging (canon): seven warm sparks, swaying height, hooded smudges
  // beneath. They rested here a moment ago; the hum they carry arrives in Phase 4.
  const py = 852;
  for (let i = 0; i < 7; i++) {
    const px = 1180 - i * 46 + (R() - 0.5) * 8;
    const ly = py - 6 - Math.sin(i * 1.2) * 2;
    dab(ctx, px, ly + 7, 2.6, 5, 0, "#050a09", 0.9); // the bearer, barely a mark
    dab(ctx, px, ly, 1.5, 1.9, 0, "#f0b268", 0.9);   // the lantern
    dab(ctx, px, ly, 5, 6, 0, "#8a4a1c", 0.3);       // its breath of glow
  }

  return { canvas: c, parallax: 0.16, yOff: 740 };
}

// midground: the Pilgrim Road band with the mile-monolith row
const s2MidY = (x: number) => 884 - Math.sin(x * 0.0009 + 0.8) * 30 - Math.sin(x * 0.0027 + 2) * 9;

function s2Road(): Layer {
  const [c, ctx] = makeCanvas(750, 1020);
  const R = mulberry32(233);
  // crest haze — cool, moon-fed
  for (let x = 0; x <= WORLD_W; x += 20) {
    const near = Math.max(0, 1 - Math.abs(x - MOON_X) / 950);
    dab(ctx, x + (R() - 0.5) * 14, s2MidY(x) - 8 - R() * 22, 40 + R() * 60, 6 + R() * 10, 0,
      "#1c3034", 0.05 + 0.08 * near);
  }
  ctx.fillStyle = "#070d0b";
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, s2MidY(0));
  for (let x = 0; x <= WORLD_W; x += 25) ctx.lineTo(x, s2MidY(x) + R() * 4);
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();

  // sparse midfield trees
  for (let i = 0; i < 110; i++) {
    const x = R() * WORLD_W;
    const ry = s2MidY(x);
    const h = 7 + R() * R() * 22;
    ctx.strokeStyle = "#050a08";
    ctx.lineWidth = 1.4 + R() * 1.6;
    ctx.beginPath();
    ctx.moveTo(x, ry + 4);
    ctx.lineTo(x + (R() - 0.5) * 4, ry - h);
    ctx.stroke();
    dab(ctx, x, ry - h, 2.5 + R() * 4.5, 3.5 + R() * 6, 0, "#050a08", 0.9);
  }

  // THE MILE-MONOLITHS — marking watches, not miles; every one leans toward the
  // Ember below the west horizon. The lean is the scene's question.
  // (Review Board, iter 2: fence-post scale killed — these are the High Hush's
  // great works; a knight should feel WATCHED walking past them)
  for (const [mx, mh, lean] of [
    [430, 118, -0.10], [810, 138, -0.085], [1195, 108, -0.115],
    [1560, 128, -0.095], [1930, 146, -0.08],
  ] as [number, number, number][]) {
    const mb = s2MidY(mx) + 6;
    ctx.save();
    ctx.translate(mx, mb);
    ctx.rotate(lean);
    ctx.fillStyle = "#0a1210";
    ctx.beginPath(); // tapered standing stone, weather-rounded crown
    ctx.moveTo(-12, 0);
    ctx.lineTo(-9, -mh * 0.9);
    ctx.quadraticCurveTo(-6, -mh, 1.5, -mh);
    ctx.quadraticCurveTo(8, -mh * 0.98, 9.5, -mh * 0.82);
    ctx.lineTo(12, 0);
    ctx.closePath();
    ctx.fill();
    // moon rims the east face; the west face carries the faintest ember stain
    ctx.strokeStyle = "#7e968f";
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(10.5, -6);
    ctx.lineTo(8.4, -mh * 0.8);
    ctx.stroke();
    ctx.strokeStyle = "#6e2818";
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-10.8, -8);
    ctx.lineTo(-8.4, -mh * 0.85);
    ctx.stroke();
    // the closed eye, carved near the crown — worn almost away (iconography §3)
    ctx.strokeStyle = "#050a08";
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -mh * 0.82, 5, 0.25, Math.PI - 0.25);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
    dab(ctx, mx - 13, mb + 2, 5, 3, 0.2, "#0a1210", 1);
    dab(ctx, mx + 12, mb + 3, 4, 2.5, -0.3, "#0a1210", 1);
  }

  // mid-band anchors between the stones — dead trees + boulder clusters, so the
  // middle distance is never an empty stripe
  for (const dx0 of [620, 1390, 2120]) {
    const by = s2MidY(dx0) + 4, h = 40 + (dx0 % 11);
    ctx.strokeStyle = "#060a08";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(dx0, by);
    ctx.lineTo(dx0 + 2, by - h * 0.55);
    ctx.lineTo(dx0 - 2, by - h);
    ctx.moveTo(dx0 + 1, by - h * 0.5);
    ctx.lineTo(dx0 + 13, by - h * 0.76);
    ctx.moveTo(dx0 + 1.5, by - h * 0.6);
    ctx.lineTo(dx0 - 10, by - h * 0.85);
    ctx.stroke();
  }
  for (const bx of [980, 1750]) {
    const by = s2MidY(bx) + 10;
    for (let i = 0; i < 5; i++) {
      dab(ctx, bx + (R() - 0.5) * 40, by + (R() - 0.5) * 8, 7 + R() * 9, 5 + R() * 6,
        (R() - 0.5) * 0.4, "#0a1112", 1);
    }
    dab(ctx, bx - 6, by - 9, 8, 1.4, -0.2, "#54706a", 0.35); // moon catches the top
  }

  // the road itself — a pale worn ribbon running the band, patient as liturgy
  for (let x = 0; x <= WORLD_W; x += 14) {
    const y = s2MidY(x) + 34 + Math.sin(x * 0.004) * 5;
    dab(ctx, x + (R() - 0.5) * 6, y, 12 + R() * 12, 2.5 + R() * 2, 0.02, "#121c17", 0.5);
    if (R() < 0.2) dab(ctx, x, y - 1, 5 + R() * 7, 1.2, 0, "#1e2c24", 0.5);
  }

  return { canvas: c, parallax: 0.45, yOff: 750 };
}

const s2GroundTop = (x: number) =>
  848 - Math.sin(x * 0.0011 + 1.9) * 22 - Math.sin(x * 0.0041) * 7;

function s2Ground(): Layer {
  const [c, ctx] = makeCanvas(790, 1280);
  const R = mulberry32(239);

  const g = ctx.createLinearGradient(0, 830, 0, PLATE_H);
  g.addColorStop(0, "#0a1210");
  g.addColorStop(0.4, "#0c1512");
  g.addColorStop(1, "#050908");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, PLATE_H);
  ctx.lineTo(0, s2GroundTop(0));
  for (let x = 0; x <= WORLD_W; x += 25) ctx.lineTo(x, s2GroundTop(x) + R() * 3);
  ctx.lineTo(WORLD_W, PLATE_H);
  ctx.closePath();
  ctx.fill();

  // night grass — cool blue-greens, moon-dusted tips
  for (let i = 0; i < 5600; i++) {
    const x = R() * WORLD_W;
    const top = s2GroundTop(x) + 4;
    const y = top + Math.pow(R(), 0.7) * (PLATE_H - top);
    const depth = (y - top) / (PLATE_H - top);
    const shade = R();
    const color =
      shade < 0.42 ? "#0b1512" : shade < 0.66 ? "#0e1a15" : shade < 0.82 ? "#132019" :
      shade < 0.92 ? "#18271e" : "#1e3026";
    dab(ctx, x, y, 1.2 + depth * 2.2, 4 + depth * 11, (R() - 0.5) * 0.9, color, 0.6 + depth * 0.3);
  }
  // moonlight dust on the tips, strongest under the eyelid
  for (let i = 0; i < 360; i++) {
    const x = R() * WORLD_W;
    const near = Math.max(0, 1 - Math.abs(x - MOON_X) / 1200);
    dab(ctx, x, s2GroundTop(x) + 6 + R() * 90, 1, 2.5 + R() * 4, (R() - 0.5) * 0.8,
      "#3c554e", 0.22 + 0.3 * near);
  }

  // THE ROAD crossing the play band — twin wheel-ruts, worn pale, mended once
  for (let t0 = 0; t0 <= 1; t0 += 0.008) {
    const x = t0 * WORLD_W;
    const y = 1060 + Math.sin(t0 * 5.2) * 26 + Math.sin(t0 * 13) * 8;
    dab(ctx, x, y, 20 + R() * 14, 4.5 + R() * 3, 0.02 + (R() - 0.5) * 0.06, "#0e1410", 0.5);
    if (R() < 0.5) dab(ctx, x, y - 7, 8 + R() * 8, 1.6, 0, "#182018", 0.5);
    if (R() < 0.5) dab(ctx, x, y + 8, 8 + R() * 8, 1.6, 0, "#161e16", 0.45);
  }

  // stones, branches, night shrubs — the S1 vocabulary in the night palette
  for (let i = 0; i < 44; i++) {
    const x = R() * WORLD_W;
    const y = Math.max(s2GroundTop(x) + 24, 880) + R() * 330;
    const s = 3 + R() * 6 + (R() < 0.08 ? 7 : 0);
    dab(ctx, x, y, s, s * 0.7, (R() - 0.5) * 0.4, "#0a0d0e", 1);
    dab(ctx, x - s * 0.3, y - s * 0.35, s * 0.6, s * 0.4, 0.2, "#0d1113", 1);
    dab(ctx, x + s * 0.3, y - s * 0.4, s * 0.4, 1, -0.3, "#54706a", 0.3); // moon kiss
  }
  for (let i = 0; i < 16; i++) {
    const x = R() * WORLD_W, y = 920 + R() * 300;
    const len = 18 + R() * 30, a = (R() - 0.5) * 0.5;
    ctx.strokeStyle = "#070908";
    ctx.lineWidth = 2 + R() * 1.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len * 0.5, y - 4, x + len * Math.cos(a), y + len * Math.sin(a));
    ctx.stroke();
  }

  // moonflowers — sparse pale night-bloomers, cousins of the wake-daisies
  const moonflower = (x: number, y: number, s: number) => {
    dab(ctx, x, y + 5 * s, 0.8 * s, 4 * s, (R() - 0.5) * 0.6, "#0e1a14", 0.8);
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * TAU + R() * 0.6;
      dab(ctx, x + Math.cos(a) * 2.2 * s, y + Math.sin(a) * 1.7 * s,
        1.5 * s, 1.1 * s, a, "#aebfb4", 0.6);
    }
    dab(ctx, x, y, 1 * s, 1 * s, 0, "#6a7a6e", 0.7);
  };
  for (let i = 0; i < 46; i++) moonflower(R() * WORLD_W, 960 + R() * 260, 0.7 + R() * 0.9);
  // a listening cluster around the rest-station
  for (let i = 0; i < 14; i++) moonflower(FIRE_X - 120 + R() * 240, 990 + R() * 130, 0.8 + R() * 0.8);

  // THE REST-STATION at the fire — worn by ten thousand kettles.
  // (The living fire is runtime and burns at the play plane, GROUND_Y≈940 —
  // every prop here shares that baseline or the fire floats. Board-caught.)
  const fy = 944;
  // warm stain the fire has fed into the soil for centuries
  for (let i = 0; i < 46; i++) {
    const a = R() * TAU, d = Math.sqrt(R()) * 90;
    dab(ctx, FIRE_X + Math.cos(a) * d, fy + Math.sin(a) * d * 0.35, 12 + R() * 22, 4 + R() * 7,
      (R() - 0.5) * 0.3, R() < 0.6 ? "#241410" : "#31190f", 0.16 * (1 - d / 110));
  }
  // the sitting-log, polished smooth on top by generations
  ctx.save();
  ctx.translate(FIRE_X - 70, fy + 8);
  ctx.rotate(-0.03);
  ctx.fillStyle = "#0b0906";
  ctx.beginPath();
  ctx.moveTo(-44, 0);
  ctx.quadraticCurveTo(0, -9, 44, -3);
  ctx.lineTo(43, 7);
  ctx.quadraticCurveTo(0, 1, -43, 9);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3a2a18";
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-40, -1);
  ctx.quadraticCurveTo(0, -8, 40, -3);
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;
  // kettle-hook tripod straddling the flame, felt-wrapped feet (muffled geometry);
  // the kettle hangs INTO the licks — it is being kept warm, that's the point
  ctx.strokeStyle = "#0d0b08";
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(FIRE_X - 24, fy + 4); ctx.lineTo(FIRE_X + 2, fy - 72);
  ctx.moveTo(FIRE_X + 28, fy + 3); ctx.lineTo(FIRE_X + 2, fy - 72);
  ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(FIRE_X + 2, fy - 72); ctx.lineTo(FIRE_X + 1, fy - 52); // the chain
  ctx.stroke();
  dab(ctx, FIRE_X + 1, fy - 46, 5, 6, 0, "#0f0c08", 1); // the hanging kettle
  dab(ctx, FIRE_X - 1, fy - 50, 3, 1.2, -0.2, "#8a5a2c", 0.55); // fire catches its shoulder

  return { canvas: c, parallax: 1.0, yOff: 790 };
}

function s2Foreground(sway: number): Layer {
  const [c, ctx] = makeCanvas(930, 1280);
  const R = mulberry32(241); // SAME seed both variants
  const rock = (rx: number, ry: number, s: number) => {
    for (let i = 0; i < 8; i++) {
      dab(ctx, rx + (R() - 0.5) * 66 * s, ry + (R() - 0.5) * 24 * s,
        (24 + R() * 30) * s, (16 + R() * 20) * s, (R() - 0.5) * 0.5, "#030504", 1);
    }
  };
  rock(300, 1250, 1.1);
  rock(1400, 1265, 1.0);
  for (let i = 0; i < 300; i++) {
    const x = R() * WORLD_W;
    const y = 1035 + R() * 210;
    const h = 28 + R() * 52;
    const lean = (R() - 0.5) * 0.5 + sway * 0.34; // the humming wind is real here
    ctx.strokeStyle = R() < 0.82 ? "#040604" : "#0a1410";
    ctx.lineWidth = 2 + R() * 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.quadraticCurveTo(x + lean * h * 0.4, y - h * 0.55, x + lean * h, y - h);
    ctx.stroke();
  }
  return { canvas: soften(c, 1.6), parallax: 1.22, yOff: 930 };
}

function s2Near(): Layer {
  const [c, ctx] = makeCanvas(940, 1280);
  const R = mulberry32(251);
  // tall blades crossing the frame
  for (let i = 0; i < 40; i++) {
    const x = R() * WORLD_W;
    const y = 1195 + R() * 85;
    const h = 85 + R() * 115;
    const lean = (R() - 0.5) * 0.7;
    ctx.strokeStyle = "#020403";
    ctx.lineWidth = 3.5 + R() * 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.quadraticCurveTo(x + lean * h * 0.4, y - h * 0.5, x + lean * h, y - h);
    ctx.stroke();
  }
  // one bare branch reaching over the fire's corner, ember-warmed underneath
  ctx.strokeStyle = "#040302";
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(2400, 1010);
  ctx.quadraticCurveTo(2200, 1030, 2020, 1082);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(2210, 1032);
  ctx.lineTo(2130, 1000);
  ctx.moveTo(2100, 1062);
  ctx.lineTo(2030, 1030);
  ctx.stroke();
  ctx.strokeStyle = "#6e3418";
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(2200, 1038);
  ctx.quadraticCurveTo(2100, 1058, 2028, 1086);
  ctx.stroke();
  ctx.globalAlpha = 1;
  return { canvas: soften(c, 3.2), parallax: 1.45, yOff: 940 };
}

export const SCENE2: SceneDef = {
  id: 2,
  name: "CAMPFIRE NIGHT",
  whisper: "The road remembers.",
  boundsL: 320, boundsR: 2050,
  spawnX: 430,
  lightX: FIRE_X, // the fire is the key light — shadows lean away from warmth
  glaze: "#2c4a40", glazeBase: 0.048, glazeBreath: 0.009,
  veil: null, // the Ember is below the horizon; the world still breathes via the glaze
  fireX: FIRE_X,
  exitEastX: null, // rest together to leave — the fire is the door
  bake(): SceneBake {
    return {
      layers: [
        s2Sky(),
        s2Clouds(),
        s2Ridge(),
        s2Valley(),
        bakeFog(281, 795, 885, "#152528", false),
        s2Road(),
        bakeFog(283, 850, 950, "#122022", true),
        s2Ground(),
      ],
      fgA: s2Foreground(-1),
      fgB: s2Foreground(1),
      near: s2Near(),
    };
  },
};
