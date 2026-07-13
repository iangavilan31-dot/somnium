// THE FIRST AWAKE — the v1 finale (WORLD_BIBLE §5, BRIEF-locked silhouette).
// A keeper who woke four hundred years ago and was painted vast and horned by the
// dream's fear. His greatsword is the clapper of the Great Bell. He kneels at the
// tower's foot, snow-drifted, indistinguishable from a statue — until the knights'
// own footsteps toll the buried bronze floor. His ear moves first.
//
// Boss Law: peace first · the threshold is chosen · reluctance · the fight mourns
// itself · defeat leaves the world quieter. He is not a hunter. He is a door.

import { clamp, easeInOutCubic, lerp, mulberry32, TAU } from "./math";
import { dab } from "./paint";
import type { Fx } from "./fx";

export const AWAKE_X = 1520;      // his knees' place, worn into the field
export const AWAKE_BASE = 1006;   // the snowfield dips below the play plane here
export const FLOOR_L = 1150, FLOOR_R = 1850; // the buried bronze floor (the threshold)
const S = 4.0;

// ---- silhouettes: 21-point closed contours (p0 · 10×[ctrl,anchor]), S units, y UP.
// Both poses share the point count so the rise is a clean morph. The kneel keeps
// degenerate ground points where the stand opens a gap between the legs — so the
// legs EMERGE from the drift as he rises, the gap growing upward out of the snow.
type Pt = [number, number];
type Path7 = Pt[];

// kneeling, head EAST toward the bell he keeps (matches the Phase-1 bake)
const KNEEL_E: Path7 = [
  [-21, 0],
  [-26, 30], [-20, 48],
  [-12, 66], [6, 64],
  [22, 60], [26, 44],
  [34, 36], [30, 26],
  [26, 16], [18, 12],
  [17, 8], [16, 4],
  [16, 2], [16, 0],
  [10, 0], [4, 0],
  [-2, 0], [-8, 0],
  [-14, 0], [-18, 0],
];
// kneeling, head turned WEST over the shoulder — the moment he has heard them
const KNEEL_W: Path7 = [
  [-21, 0],
  [-26, 30], [-20, 48],
  [-12, 66], [2, 66],
  [10, 62], [2, 52],
  [-8, 46], [-14, 36],
  [-10, 24], [-2, 18],
  [4, 12], [10, 6],
  [14, 3], [16, 0],
  [10, 0], [4, 0],
  [-2, 0], [-8, 0],
  [-14, 0], [-18, 0],
];
// standing: mountain-shouldered hunch, head LOW-SLUNG in front of the hump,
// boxy muzzle jut, long back slope, two pillar legs with open sky between. ~152 S.
const STAND_W: Path7 = [
  [-20, 0],
  [-26, 30], [-24, 62],
  [-30, 78], [-28, 92],
  [-46, 94], [-42, 108],
  [-30, 124], [-14, 138],
  [2, 152], [14, 144],
  [26, 120], [26, 78],
  [28, 46], [22, 28],
  [18, 12], [14, 0],
  [10, 26], [0, 30],
  [-8, 28], [-12, 0],
];

// horns sweep DOWN (he lowers his head to LISTEN): per-pose [start, ctrl, end] ×2
type Horn = [Pt, Pt, Pt];
const HORNS_E: Horn[] = [
  [[20, 34], [38, 30], [40, 12]],
  [[14, 38], [-2, 44], [-10, 38]],
];
const HORNS_KW: Horn[] = [
  [[-8, 40], [-26, 36], [-28, 18]],
  [[-2, 44], [14, 50], [22, 44]],
];
const HORNS_SW: Horn[] = [
  [[-16, 128], [-40, 132], [-48, 104]],
  [[-4, 134], [16, 138], [24, 122]],
];
// ear anchor (the first thing that moves) per pose
const EAR_E: Pt = [22, 42]; const EAR_KW: Pt = [-2, 50]; const EAR_SW: Pt = [-8, 132];

function lerpPath(a: Path7, b: Path7, u: number): Path7 {
  return a.map((p, i) => [lerp(p[0], b[i][0], u), lerp(p[1], b[i][1], u)] as Pt);
}
function lerpHorns(a: Horn[], b: Horn[], u: number): Horn[] {
  return a.map((h, i) => h.map((p, j) => [lerp(p[0], b[i][j][0], u), lerp(p[1], b[i][j][1], u)] as Pt) as Horn);
}

export type AwakeState = "statue" | "listen" | "rise" | "ward" | "rekneel";

// the rise is three separate acts of standing, with holds — he stands, and
// stands, and stands (canon). Returns rise01 for a given stage-time.
const RISE_BEATS = [
  { to: 0.36, dur: 2.4 }, { to: 0.36, dur: 1.0 },
  { to: 0.74, dur: 2.2 }, { to: 0.74, dur: 1.1 },
  { to: 1.0, dur: 1.9 },
];
const RISE_TOTAL = RISE_BEATS.reduce((s, b) => s + b.dur, 0);
function riseAt(t: number): number {
  let from = 0;
  for (const b of RISE_BEATS) {
    if (t < b.dur) return lerp(from, b.to, easeInOutCubic(clamp(t / b.dur, 0, 1)));
    t -= b.dur; from = b.to;
  }
  return 1;
}

export class FirstAwake {
  state: AwakeState = "statue";
  stateT = 0;
  tolls = 0;
  private lastTollT = -1e9;
  private earFlick = 0;      // 0..1 pulse
  private headTurn = 0;      // kneel: E→W
  private rise = 0;          // kneel→stand
  private shed = false;      // drift shed fired
  private R = mulberry32(97);
  // pelt dabs pinned between anchor indices so they ride the morph
  private pelt: { i: number; j: number; f: number; ox: number; oy: number; w: number; h: number; rot: number; c: string }[] = [];

  constructor() {
    // ONE wind-stripped flank patch (the bake's law: many-and-weak, clustered) +
    // a few strays — never confetti
    for (let k = 0; k < 44; k++) {
      const stray = this.R() > 0.75;
      const [i, j] = stray
        ? ([[2, 4], [12, 14], [10, 12]] as [number, number][])[(this.R() * 3) | 0]
        : [4, 12] as [number, number]; // chest→mid-back: the flank
      this.pelt.push({
        i, j, f: stray ? this.R() : 0.3 + this.R() * 0.45,
        ox: (this.R() - 0.5) * 7, oy: -(this.R() * 8),
        w: (4 + this.R() * 6) * 0.35, h: (6 + this.R() * 9) * 0.35,
        rot: (this.R() - 0.5) * 0.5,
        c: this.R() < 0.6 ? "#4a1410" : "#5e1a12",
      });
    }
  }

  // QA-only: freeze the boss at a given rise for the pose harness
  debugFreeze = false;
  debugPose(r: number) {
    this.debugFreeze = true;
    this.rise = clamp(r, 0, 1);
    this.headTurn = this.rise > 0 ? clamp(this.rise / 0.15, 0, 1) : 0;
    this.state = r >= 1 ? "ward" : r > 0 ? "rise" : "statue";
    this.stateT = 3;
    this.shed = true;
  }

  get dramatic() { return this.state === "listen" || this.state === "rise" || this.state === "ward"; }
  get standing() { return this.rise > 0.95; }

  // a footstep (or worse) rings the buried floor
  toll(t: number, loud = 1) {
    if (t - this.lastTollT < 0.22) return;
    this.lastTollT = t;
    this.tolls += loud;
    if (this.state === "statue" && this.tolls >= 2) {
      this.state = "listen"; this.stateT = 0; this.earFlick = 1;
    } else if (this.state === "listen" && this.tolls >= 6) {
      this.state = "rise"; this.stateT = 0;
    } else if (this.state === "rekneel") {
      this.state = this.rise > 0.4 ? "ward" : "listen"; this.stateT = 0;
    }
  }

  update(dt: number, t: number, nearestKnightX: number | null, anyOnFloor: boolean, fx: Fx) {
    if (this.debugFreeze) return;
    this.stateT += dt;
    this.earFlick = Math.max(0, this.earFlick - dt * 2.2);

    switch (this.state) {
      case "statue":
        break;
      case "listen": {
        // the ear flicks. He does not turn — not yet. Pressing close is its own bell.
        if (nearestKnightX != null && Math.abs(nearestKnightX - AWAKE_X) < 130 && this.stateT > 1.2) {
          this.state = "rise"; this.stateT = 0;
        }
        break;
      }
      case "rise": {
        this.rise = riseAt(this.stateT);
        // he wheels to face them DURING the first standing — the mass comes around
        this.headTurn = clamp(this.rise / 0.15, 0, 1);
        if (!this.shed && this.rise > 0.05) {
          this.shed = true; // the drift of forty winters leaves his shoulders
          for (let i = 0; i < 5; i++) fx.snowShed(AWAKE_X - 60 + i * 40, AWAKE_BASE - 240 - i * 18);
        }
        if (this.stateT >= RISE_TOTAL) { this.state = "ward"; this.stateT = 0; }
        break;
      }
      case "ward": {
        this.rise = 1;
        // if the field falls silent and empty, he returns to the watch
        if (!anyOnFloor) {
          if (this.stateT > 6) { this.state = "rekneel"; this.stateT = 0; }
        } else this.stateT = Math.min(this.stateT, 5.5); // presence holds him risen
        break;
      }
      case "rekneel": {
        this.rise = Math.max(0, this.rise - dt / 3.2);
        if (this.rise <= 0) {
          this.headTurn = Math.max(0, this.headTurn - dt / 2);
          if (this.headTurn <= 0) { this.state = "statue"; this.stateT = 0; this.tolls = 0; this.shed = false; }
        }
        break;
      }
    }
  }

  // ---- the statue: an EXACT replica of the board-passed Phase-1 bake, drawn
  // live (deterministic seed) so nothing changes until the moment it does ----
  private drawStatue(ctx: CanvasRenderingContext2D, t: number, breathe: number) {
    const R = mulberry32(541);
    const KX = 0, KB = 0; // we draw in his local frame
    ctx.save();
    ctx.scale(1, breathe);
    ctx.fillStyle = "#0f0b0e";
    ctx.beginPath();
    ctx.moveTo(KX - 60 * S * 0.35, KB);
    ctx.quadraticCurveTo(KX - 26 * S, KB - 30 * S, KX - 20 * S, KB - 48 * S);
    ctx.quadraticCurveTo(KX - 12 * S, KB - 66 * S, KX + 6 * S, KB - 64 * S);
    ctx.quadraticCurveTo(KX + 22 * S, KB - 60 * S, KX + 26 * S, KB - 44 * S);
    ctx.quadraticCurveTo(KX + 34 * S, KB - 36 * S, KX + 30 * S, KB - 26 * S);
    ctx.quadraticCurveTo(KX + 26 * S, KB - 16 * S, KX + 18 * S, KB - 12 * S);
    ctx.lineTo(KX + 16 * S, KB);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#151018";
    ctx.lineCap = "round";
    ctx.lineWidth = 6.5 * S * 0.5;
    ctx.beginPath();
    ctx.moveTo(KX + 20 * S, KB - 34 * S);
    ctx.quadraticCurveTo(KX + 38 * S, KB - 30 * S, KX + 40 * S, KB - 12 * S);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(KX + 14 * S, KB - 38 * S);
    ctx.quadraticCurveTo(KX - 2 * S, KB - 44 * S, KX - 10 * S, KB - 38 * S);
    ctx.stroke();
    for (let i = 0; i < 40; i++) {
      const px = KX - 14 * S + R() * 26 * S;
      const py = KB - 12 * S - R() * 36 * S;
      dab(ctx, px, py, (3 + R() * 6) * S * 0.4, (5 + R() * 9) * S * 0.4, (R() - 0.5) * 0.5,
        R() < 0.6 ? "#4a1410" : "#5e1a12", 0.62);
    }
    ctx.strokeStyle = "#0a0c11";
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(KX - 30 * S, KB);
    ctx.lineTo(KX - 34 * S, KB - 58 * S);
    ctx.stroke();
    dab(ctx, KX - 34.5 * S, KB - 59 * S, 4.5 * S * 0.5, 6 * S * 0.5, 0.1, "#0a0c11", 1);
    dab(ctx, KX - 35 * S, KB - 59 * S, 2, 4.5, 0.2, "#7e2418", 0.55);
    dab(ctx, KX - 34 * S, KB - 62 * S, 3.5 * S * 0.5, 1.2 * S * 0.5, 0.1, "#9aacc0", 0.8);
    for (let i = 0; i < 30; i++) {
      const u = 0.06 + (i / 30) * 0.88;
      const px = KX - 20 * S + u * 46 * S;
      const along = Math.sin(u * Math.PI);
      const py = KB - 63 * S * along - 1.5 * S;
      dab(ctx, px, py, (9 + R() * 7) * S * 0.5, (1.4 + R() * 1.2) * S * 0.5,
        Math.cos(u * Math.PI) * -0.5, R() < 0.7 ? "#9aacc0" : "#b6c6d8", 0.8);
    }
    for (let i = 0; i < 10; i++) {
      dab(ctx, KX - 24 * S + R() * 50 * S, KB - 2 - R() * 4, (8 + R() * 12) * S * 0.4,
        (2 + R() * 2) * S * 0.4, (R() - 0.5) * 0.1, "#9aacc0", 0.7);
    }
    dab(ctx, KX - 26 * S, KB - 10 * S, 6 * S * 0.5, 2 * S * 0.5, 0.2, "#5a5040", 0.7);
    dab(ctx, KX - 22 * S, KB - 8 * S, 5 * S * 0.5, 2 * S * 0.5, -0.1, "#6a5a44", 0.6);
    for (let i = 0; i < 6; i++) {
      dab(ctx, KX - 4 * S + R() * 14 * S, KB - 50 * S - R() * 10 * S, 1.6 * S * 0.5,
        (5 + R() * 8) * S * 0.5, 0.05, "#8a7a62", 0.5);
    }
    ctx.strokeStyle = "#7e2418";
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(KX - 21 * S, KB - 46 * S);
    ctx.quadraticCurveTo(KX - 13 * S, KB - 64 * S, KX + 5 * S, KB - 63 * S);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // the ear — the first thing in four hundred years to move
    if (this.earFlick > 0) {
      ctx.save();
      ctx.translate(22 * S, -42 * S);
      ctx.rotate(Math.sin(t * 34) * 0.26 * this.earFlick);
      ctx.fillStyle = "#120d11";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-4 * S * 0.6, -5 * S * 0.6);
      ctx.lineTo(3 * S * 0.6, -6 * S * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // breath: the dream painted him in the Ember's red — he breathes WITH it
  draw(ctx: CanvasRenderingContext2D, t: number, breath: number) {
    const u = this.rise; // already eased per rise-beat
    const kneel = lerpPath(KNEEL_E, KNEEL_W, this.headTurn);
    const path = lerpPath(kneel, STAND_W, u);
    const horns = lerpHorns(lerpHorns(HORNS_E, HORNS_KW, this.headTurn), HORNS_SW, u);
    const ear: Pt = [
      lerp(lerp(EAR_E[0], EAR_KW[0], this.headTurn), EAR_SW[0], u),
      lerp(lerp(EAR_E[1], EAR_KW[1], this.headTurn), EAR_SW[1], u),
    ];
    const breathe = 1 + breath * 0.006 + Math.sin(t * 0.74) * 0.0035;

    ctx.save();
    ctx.translate(AWAKE_X, AWAKE_BASE);
    if (u <= 0.01) {
      // until the moment he moves, he IS the approved statue — to the pixel
      this.drawStatue(ctx, t, breathe);
      ctx.restore();
      return;
    }
    ctx.scale(1, breathe);

    const W = (p: Pt): Pt => [p[0] * S, -p[1] * S];

    // the body — the only warm-dark mountain in the blue-white
    ctx.fillStyle = "#140a0c"; // black pelt with the heart's red in it
    ctx.beginPath();
    const pts = path.map(W);
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i + 1 < pts.length; i += 2) {
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    }
    ctx.closePath();
    ctx.fill();

    // horns — down-swept; he lowers his head to listen
    ctx.strokeStyle = "#151018";
    ctx.lineCap = "round";
    ctx.lineWidth = 6.5 * S * 0.7;
    for (const h of horns) {
      const [a, c, b] = h.map(W);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.quadraticCurveTo(c[0], c[1], b[0], b[1]);
      ctx.stroke();
    }
    // the ear — the first thing in four hundred years to move
    const e = W(ear);
    ctx.save();
    ctx.translate(e[0], e[1]);
    ctx.rotate(this.earFlick > 0 ? Math.sin(t * 34) * 0.24 * this.earFlick : 0);
    ctx.fillStyle = "#120d11";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-4 * S * 0.6, -5 * S * 0.6);
    ctx.lineTo(3 * S * 0.6, -6 * S * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // pelt dabs riding the morph — the flank wind-stripped to the heart's red
    for (const d of this.pelt) {
      const a = pts[d.i], b = pts[d.j];
      const px = lerp(a[0], b[0], d.f) + d.ox * S * 0.4;
      const py = lerp(a[1], b[1], d.f) + d.oy * S * 0.4;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(d.rot);
      ctx.fillStyle = d.c;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, d.w * S, d.h * S, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // wax strata (generations of keepers anointed him) — drips hanging DOWN the
    // east shoulder slope, inside the silhouette, never breaking the crest line
    const humpTop = pts[10], slope = pts[12];
    for (let i = 0; i < 6; i++) {
      const f = 0.15 + (i / 6) * 0.6;
      const wx = lerp(humpTop[0], slope[0], f);
      const wy = lerp(humpTop[1], slope[1], f) + (8 + (i % 3) * 5) * S * 0.5;
      ctx.fillStyle = "#8a7a62";
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.ellipse(wx, wy, 1.6 * S * 0.5, (5 + (i * 7) % 8) * S * 0.5, 0.05, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // THE CLAPPER — planted while he kneels; taken up as he rises past half
    const grip = u < 0.5 ? null : lerp(0, 1, clamp((u - 0.5) / 0.3, 0, 1));
    ctx.strokeStyle = "#0a0c11";
    ctx.lineWidth = 11;
    if (grip == null || grip < 1) {
      // planted at his knees' side, snow-capped, as it has stood between hours
      ctx.beginPath();
      ctx.moveTo(-30 * S, 0);
      ctx.lineTo(-34 * S, -58 * S);
      ctx.stroke();
      ctx.fillStyle = "#0a0c11";
      ctx.beginPath(); ctx.ellipse(-34.5 * S, -59 * S, 4.5 * S * 0.5, 6 * S * 0.5, 0.1, 0, TAU); ctx.fill();
      ctx.fillStyle = "#9aacc0";
      ctx.globalAlpha = 0.8 * (1 - (grip ?? 0));
      ctx.beginPath(); ctx.ellipse(-34 * S, -62 * S, 3.5 * S * 0.5, 1.2 * S * 0.5, 0.1, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (grip != null && grip > 0) {
      // in his fist: dragged low behind him, tip deepening the 400-year trench
      const hx = lerp(-30, 20, grip) * S, hy = -lerp(40, 56, grip) * S;
      const tx = lerp(-34, 38, grip) * S, ty = -lerp(58, 1, grip) * S;
      ctx.globalAlpha = grip;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      // the Ember finds its west edge — the dragged line must read at 64px (§5)
      ctx.strokeStyle = "#7e2418";
      ctx.globalAlpha = grip * 0.55;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(hx - 4, hy);
      ctx.lineTo(tx - 4, ty);
      ctx.stroke();
      ctx.strokeStyle = "#0a0c11";
      ctx.lineWidth = 11;
      ctx.globalAlpha = grip;
      ctx.fillStyle = "#0a0c11";
      ctx.beginPath(); ctx.ellipse(tx, ty, 4.5 * S * 0.55, 5 * S * 0.4, 0.2, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // garlands gone to seed at the wrist (they loved him — it has to show)
    const wrist: Pt = grip != null && grip > 0
      ? [lerp(-30, -26, grip), lerp(10, 21.5, grip)]
      : [-26, 10];
    const wp = W(wrist);
    ctx.fillStyle = "#5a5040";
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.ellipse(wp[0], wp[1], 6 * S * 0.5, 2 * S * 0.5, 0.2, 0, TAU); ctx.fill();
    ctx.fillStyle = "#6a5a44";
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.ellipse(wp[0] + 4 * S * 0.8, wp[1] + 2 * S * 0.4, 5 * S * 0.5, 2 * S * 0.5, -0.1, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;

    // THE WARD — palm-down with the off-hand: *quiet. stay.* (he is still a keeper)
    if (this.state === "ward" || (this.state === "rise" && this.rise > 0.9)) {
      const wa = this.state === "ward" ? clamp(this.stateT / 1.4, 0, 1) : 0.2;
      // a real arm with mass: shoulder under the muzzle, elbow, flat-held palm
      const sh: Pt = [-20 * S, -92 * S];
      const el: Pt = [lerp(-22, -34, wa) * S, lerp(-80, -76, wa) * S];
      const hd: Pt = [lerp(-22, -46, wa) * S, lerp(-68, -62, wa) * S];
      ctx.strokeStyle = "#140a0c";
      ctx.lineCap = "round";
      ctx.lineWidth = 6.5 * S;
      ctx.beginPath();
      ctx.moveTo(sh[0], sh[1]);
      ctx.lineTo(el[0], el[1]);
      ctx.stroke();
      ctx.lineWidth = 5 * S;
      ctx.beginPath();
      ctx.moveTo(el[0], el[1]);
      ctx.lineTo(hd[0], hd[1]);
      ctx.stroke();
      // the palm, held flat over the earth
      ctx.fillStyle = "#140a0c";
      ctx.beginPath();
      ctx.ellipse(hd[0] - 3 * S * wa, hd[1] + 1.5 * S, 6.5 * S * 0.6, 2.4 * S * 0.6, 0.1, 0, TAU);
      ctx.fill();
      // garland on THIS wrist too — the warding hand wears their love
      ctx.fillStyle = "#5a5040";
      ctx.globalAlpha = 0.7 * wa;
      ctx.beginPath();
      ctx.ellipse(hd[0] + 2 * S, hd[1] - 1 * S, 3.4 * S * 0.6, 1.6 * S * 0.6, 0.2, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // drift piled where he knelt (stays — the field remembers his shape)
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = "#9aacc0";
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(-24 * S + ((i * 37) % 50) * S, -2 - (i * 11) % 4,
        (8 + (i * 17) % 12) * S * 0.4, (2 + (i * 5) % 2) * S * 0.4, 0, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ember rim along the west silhouette — the heart knows its own
    ctx.strokeStyle = "#7e2418";
    ctx.globalAlpha = 0.45 + breath * 0.1;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pts[2][0], pts[2][1]);
    ctx.quadraticCurveTo(pts[5][0], pts[5][1], pts[7][0], pts[7][1]);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.restore();
  }
}
