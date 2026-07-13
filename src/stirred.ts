// THE STIRRED — Loud Age nightmares of ink and noise (WORLD_BIBLE §7, M&C §13/§14).
// Shade-knights: broken mirrors of the player rig, rendered as unstable ink over
// denting Loud Age armor. They are drawn to sound (ATTENTION IS NOISE); fights are
// accidents that can be un-had (de-escalation); the only true ending is the quieting.
// No blood, ever: they bleed ink and noise.

import { clamp, damp, easeInCubic, easeInOutCubic, easeOutCubic, lerp, noise1, rad, TAU } from "./math";
import { GROUND_Y } from "./paint";
import { P, sampleTimeline, legIK, type Key, type Pose, type Knight } from "./knight";
import type { Fx } from "./fx";

const POSE_KEYS = [
  "pelvisX", "pelvisY", "bodyRot", "torso", "head",
  "shL", "elL", "shR", "elR", "hipL", "shinL", "hipR", "shinR", "sword",
] as const;

// ---- poses (hunched, wrong; the armor remembers a knight, the ink forgot) ----
const SETTLED = P({
  pelvisY: 26, bodyRot: 10, torso: 38, head: 30,
  shL: -6, elL: 8, shR: 4, elR: 6, sword: -80,
  hipL: 70, shinL: -100, hipR: -30, shinR: -80,
});
const RISEN = P({
  pelvisY: 64, torso: 26, head: 18,
  shL: 10, elL: 20, shR: 18, elR: 10, sword: -95, // the blade DRAGS
  hipL: 12, shinL: -6, hipR: -14, shinR: -20,
});
const STAGGERP = P({
  pelvisX: -10, pelvisY: 56, torso: -18, head: -14,
  shL: -40, elL: 40, shR: -30, elR: 30, sword: -70,
  hipL: 20, shinL: -10, hipR: -30, shinR: -44,
});
// attack: long readable rear-up (24f), ink crash (4f), heavy recover (20f)
const ATTACK: Key[] = [
  { t: 0, pose: RISEN, ease: easeInOutCubic },
  { t: 24 / 60, pose: P({ pelvisX: -8, pelvisY: 70, torso: -6, head: 4, shL: 24, elL: 20, shR: -120, elR: 30, sword: -30, hipL: 16, shinL: -6, hipR: -20, shinR: -30 }), ease: easeInOutCubic },
  { t: 28 / 60, pose: P({ pelvisX: 14, pelvisY: 66, torso: 30, head: 8, shL: -16, elL: 26, shR: 70, elR: 8, sword: 10, hipL: 26, shinL: 2, hipR: -28, shinR: -36 }), ease: easeInCubic },
  { t: 40 / 60, pose: P({ pelvisX: 8, pelvisY: 64, torso: 24, head: 14, shL: -8, elL: 20, shR: 52, elR: 14, sword: -10, hipL: 20, shinL: 0, hipR: -22, shinR: -30 }), ease: easeOutCubic },
  { t: 48 / 60, pose: RISEN, ease: easeInOutCubic },
];
const ATK_STRIKE_T = 24 / 60; // the crash begins here — the knight's answer window ends
const ATK_TOTAL = 48 / 60;

export type ShadeState =
  | "settled" | "stir" | "drawn" | "attack" | "stagger" | "stalled" | "quieted" | "gone";

export class Shade {
  x: number; facing = 1;
  home: number;               // where it slept for centuries; de-escalation returns it
  state: ShadeState = "settled";
  stateT = 0;
  posture = 3;                // stagger at 0
  dents = 0;                  // heavies cave the Loud Age plates; dented = lights connect
  cur: Pose = { ...SETTLED };
  walkPhase = 0;
  hitFlash = 0;
  poolA = 0;                  // the quiet sediment left behind
  private seed: number;
  private strikeFired = false;
  private calmT = 0;          // silence accumulator → settling back
  private attackCd = 0;       // breath between blows — readable, answerable

  constructor(x: number) {
    this.x = x; this.home = x;
    this.seed = (x * 7.13) % 10;
  }

  get staggered() { return this.state === "stagger" || this.state === "stalled"; }
  get alive() { return this.state !== "quieted" && this.state !== "gone"; }
  get threatening() { return this.alive && this.state !== "settled" && this.state !== "stir"; }

  // a knight's blade arrives. Returns what the steel found.
  struck(heavy: boolean, fromX: number, fx: Fx): "glance" | "hit" | "stagger" {
    if (!this.alive) return "glance";
    const dir = this.x >= fromX ? 1 : -1;
    // Loud Age plate: undented shades GLANCE light blows away (teaches the heavy —
    // §13) unless caught open (recovering, staggered, stalled, or still asleep)
    const open = this.state === "stagger" || this.state === "stalled" || this.state === "settled"
      || (this.state === "attack" && this.stateT > ATK_STRIKE_T + 4 / 60);
    if (!heavy && this.dents === 0 && !open) {
      fx.glance(this.x - dir * 18, GROUND_Y - 58, dir);
      return "glance";
    }
    if (heavy) { this.dents = Math.min(3, this.dents + 1); }
    this.posture = Math.max(0, this.posture - (heavy ? 2 : 1));
    this.hitFlash = 0.12;
    this.x += dir * (heavy ? 26 : 12);
    fx.inkSplash(this.x - dir * 10, GROUND_Y - 52, dir, heavy ? 10 : 6);
    if (this.posture === 0 && !this.staggered) {
      this.state = "stagger"; this.stateT = 0;
      return "stagger";
    }
    if (!this.staggered) { this.state = "stagger"; this.stateT = 0.9; } // flinch: short reel
    return "hit";
  }

  // the parry stalled its ink mid-stroke (§11)
  stall() {
    if (this.state === "attack") { this.state = "stalled"; this.stateT = 0; }
  }
  // the vow begins — the knight kneels; the ink settles beneath the blade
  beginQuieting() {
    this.state = "quieted"; this.stateT = 0;
  }

  // returns a pending strike zone once per attack, at the crash frame
  strikeEvent(): { x: number; reach: number } | null {
    if (this.state !== "attack") { this.strikeFired = false; return null; }
    if (this.strikeFired || this.stateT < ATK_STRIKE_T) return null;
    this.strikeFired = true;
    return { x: this.x + this.facing * 62, reach: 78 };
  }

  update(dt: number, t: number, knights: (Knight | null)[], fx: Fx, fireX: number | null = null) {
    this.stateT += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.state === "gone") return;

    // --- attention: who rang loudest, weighted by distance? ---
    // §1: the knights cannot be silent, only careful — plate CREAKS up close,
    // so proximity itself is a whisper (0.45: holds a drawn one, spares a sleeper)
    let target: Knight | null = null;
    let best = 0;
    for (const k of knights) {
      if (!k || k.downed) continue;
      // THE HEARTH IS KEPT: a knight beside a lit fire is lawful quiet —
      // the Stirred lose the scent at its edge (the rest ritual is safe ground)
      if (fireX != null && Math.abs(k.x - fireX) < 220) continue;
      const d = Math.abs(k.x - this.x);
      const heard = Math.max(
        k.loudness(t) * clamp(1 - d / 700, 0, 1),
        d < 170 ? 0.45 : 0,
      );
      if (heard > best) { best = heard; target = k; }
    }

    let pose: Pose;
    let rate = 10;
    switch (this.state) {
      case "settled": {
        pose = { ...SETTLED };
        pose.torso += rad(Math.sin(t * 0.5 + this.seed) * 1.2); // it breathes. slowly.
        if (best > 0.5) { this.state = "stir"; this.stateT = 0; }
        break;
      }
      case "stir": {
        // rising takes a long moment — dread, and a fair warning
        const u = clamp(this.stateT / 1.1, 0, 1);
        pose = { ...RISEN };
        pose.pelvisY = lerp(SETTLED.pelvisY, RISEN.pelvisY, easeInOutCubic(u));
        pose.bodyRot = lerp(SETTLED.bodyRot, 0, u);
        rate = 14;
        if (u >= 1) { this.state = "drawn"; this.stateT = 0; }
        if (target) this.facing = target.x >= this.x ? 1 : -1;
        break;
      }
      case "drawn": {
        pose = this.shamblePose(t);
        this.attackCd -= dt;
        if (target && best > 0.25) {
          this.calmT = 0;
          this.facing = target.x >= this.x ? 1 : -1;
          const gap = Math.abs(target.x - this.x);
          if (gap > 88) {
            this.x += 55 * this.facing * dt;
            this.walkPhase += 2.4 * dt;
          } else if (this.attackCd <= 0) {
            this.state = "attack"; this.stateT = 0; this.strikeFired = false;
            this.attackCd = 1.1 + (noise1(this.seed * 5) + 1) * 0.35;
          }
        } else {
          // silence. the fight can be un-had — drift home, kneel back into the dream
          this.calmT += dt;
          const dh = this.home - this.x;
          if (Math.abs(dh) > 8) {
            this.x += Math.sign(dh) * 30 * dt;
            this.walkPhase += 1.4 * dt;
            this.facing = dh >= 0 ? 1 : -1;
          } else if (this.calmT > 6) {
            this.state = "settled"; this.stateT = 0;
            this.posture = Math.min(3, this.posture + 1); // sleep knits posture
          }
        }
        break;
      }
      case "attack": {
        pose = sampleTimeline(ATTACK, this.stateT);
        rate = 18;
        if (this.stateT >= ATK_TOTAL) { this.state = "drawn"; this.stateT = 0; }
        break;
      }
      case "stagger": {
        pose = { ...STAGGERP };
        pose.torso += rad(noise1(t * 6 + this.seed) * 3);
        rate = 14;
        if (this.stateT > 2.2) {
          this.state = "drawn"; this.stateT = 0;
          this.posture = 1; // it gathers itself, barely — the quieting was the answer
        }
        break;
      }
      case "stalled": {
        // ink caught mid-stroke by the hush — held wrong, trembling
        pose = sampleTimeline(ATTACK, ATK_STRIKE_T * 0.85);
        pose = { ...pose };
        pose.torso += rad(noise1(t * 11 + this.seed) * 1.6);
        rate = 20;
        if (this.stateT > 1.6) { this.state = "stagger"; this.stateT = 0.4; }
        break;
      }
      case "quieted": {
        // it settles into quiet sediment beneath the planted blade (2s vow)
        const u = clamp(this.stateT / 2.0, 0, 1);
        pose = { ...SETTLED };
        pose.pelvisY = lerp(this.cur.pelvisY, 8, easeInOutCubic(u));
        pose.bodyRot = this.cur.bodyRot + (rad(64) - this.cur.bodyRot) * easeInOutCubic(u);
        pose.torso = this.cur.torso;
        this.poolA = Math.min(0.5, this.poolA + dt * 0.35);
        rate = 6;
        if (u >= 1) { this.state = "gone"; this.stateT = 0; fx.inkSplash(this.x, GROUND_Y - 6, 0, 8); }
        break;
      }
      default:
        pose = { ...SETTLED };
    }

    for (const k of POSE_KEYS) this.cur[k] = damp(this.cur[k], pose[k], rate, dt);
  }

  private shamblePose(t: number): Pose {
    const p = { ...RISEN };
    const ph = this.walkPhase;
    p.pelvisY = 62 + Math.sin(ph * 2) * 1.8;
    p.torso = rad(26 + Math.sin(ph * 2 + this.seed) * 2);
    p.head = rad(18 + noise1(t * 0.7 + this.seed) * 6);
    const stride = 24, lift = 8;
    const foot = (phase: number): [number, number] => [
      Math.cos(phase) * stride,
      p.pelvisY - Math.max(0, Math.sin(phase)) * lift,
    ];
    const [flx, fly] = foot(ph);
    const [frx, fry] = foot(ph + Math.PI);
    const [hl, sl] = legIK(-3, 0, flx, fly);
    const [hr, sr] = legIK(3, 0, frx, fry);
    p.hipL = hl; p.shinL = sl; p.hipR = hr; p.shinR = sr;
    return p;
  }

  // ---- FK (mirror of the knight's, same conventions) ----
  private compute() {
    const c = this.cur;
    const S = 1.12; // a head taller than it should be
    const pel: [number, number] = [c.pelvisX, -c.pelvisY * S];
    const dirD = (a: number, len: number): [number, number] => [Math.sin(a) * len, Math.cos(a) * len];
    const dirU = (a: number, len: number): [number, number] => [Math.sin(a) * len, -Math.cos(a) * len];
    const add = (p: [number, number], d: [number, number]): [number, number] => [p[0] + d[0], p[1] + d[1]];
    const TORSO = 50, UARM = 32, FARM = 30, THIGH = 42, SHIN = 42, BLADE = 104;

    const neck = add(pel, dirU(c.torso, TORSO));
    const headC = add(neck, dirU(c.torso + c.head, 15));
    const shF = add(neck, [-5, 6]);
    const shN = add(neck, [5, 7]);
    const hipF = add(pel, [-3, 0]);
    const hipN = add(pel, [3, 0]);
    const elbF = add(shF, dirD(c.shL, UARM));
    const hndF = add(elbF, dirD(c.shL + c.elL, FARM));
    const elbN = add(shN, dirD(c.shR, UARM));
    const hndN = add(elbN, dirD(c.shR + c.elR, FARM));
    const kneF = add(hipF, dirD(c.hipL, THIGH));
    const ftF = add(kneF, dirD(c.shinL, SHIN));
    const kneN = add(hipN, dirD(c.hipR, THIGH));
    const ftN = add(kneN, dirD(c.shinR, SHIN));
    const swordA = c.shR + c.elR + c.sword;
    const tip = add(hndN, dirD(swordA, BLADE));
    const guard = add(hndN, dirD(swordA, 14));

    const cs = Math.cos(c.bodyRot), sn = Math.sin(c.bodyRot);
    const rot = (p: [number, number]): [number, number] => {
      const dx = p[0] - pel[0], dy = p[1] - pel[1];
      return [pel[0] + dx * cs - dy * sn, pel[1] + dx * sn + dy * cs];
    };
    const pts = { pel, neck, headC, shF, shN, elbF, hndF, elbN, hndN, hipF, hipN, kneF, ftF, kneN, ftN, tip, guard };
    const out: Record<string, [number, number]> = {};
    for (const k in pts) out[k] = rot((pts as Record<string, [number, number]>)[k]);
    return out as Record<keyof typeof pts, [number, number]>;
  }

  // ---- render: ink over dented plate; edges drift; no blood, no glow ----
  draw(ctx: CanvasRenderingContext2D, t: number) {
    if (this.state === "gone") {
      if (this.poolA > 0.01) this.drawPool(ctx);
      return;
    }
    const p = this.compute();
    ctx.save();
    ctx.translate(this.x, GROUND_Y);
    ctx.scale(this.facing, 1);

    // shadow
    const feetX = (p.ftF[0] + p.ftN[0]) / 2;
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#020202";
    ctx.beginPath();
    ctx.ellipse(feetX, -2, 36, 6.5, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (this.poolA > 0.01) { ctx.restore(); this.drawPool(ctx); ctx.save(); ctx.translate(this.x, GROUND_Y); ctx.scale(this.facing, 1); }

    const agitated = this.threatening ? 1 : 0.35;
    const INK = "#0a0714", PLATE = "#141019";
    const SEAM = this.hitFlash > 0 ? "#7a2c3a" : "#3d1622";

    // limbs as unstable ink
    this.inkLimb(ctx, p.shF, p.elbF, 8, 6.5, INK, t, 1, agitated);
    this.inkLimb(ctx, p.elbF, p.hndF, 6.5, 5.5, INK, t, 2, agitated);
    this.inkLimb(ctx, p.hipF, p.kneF, 10, 8.5, INK, t, 3, agitated);
    this.inkLimb(ctx, p.kneF, p.ftF, 8.5, 6, INK, t, 4, agitated);

    // torso plate (Loud Age slab) + dents
    this.plate(ctx, p.pel, p.neck, PLATE, SEAM, t, agitated);

    this.inkLimb(ctx, p.hipN, p.kneN, 10.5, 9, INK, t, 5, agitated);
    this.inkLimb(ctx, p.kneN, p.ftN, 9, 6.5, INK, t, 6, agitated);

    // head: a great helm long empty — ink coils where the face was
    const ha = Math.atan2(p.headC[0] - p.neck[0], -(p.headC[1] - p.neck[1]));
    ctx.save();
    ctx.translate(p.headC[0], p.headC[1]);
    ctx.rotate(ha);
    ctx.fillStyle = PLATE;
    ctx.beginPath();
    ctx.moveTo(-10, 12); ctx.lineTo(-11, -5);
    ctx.quadraticCurveTo(-9, -13, 0, -13);
    ctx.quadraticCurveTo(9, -13, 11, -5);
    ctx.lineTo(10, 12);
    ctx.closePath(); ctx.fill();
    // the slit leaks
    ctx.strokeStyle = SEAM;
    ctx.globalAlpha = 0.55 + 0.25 * agitated * (0.5 + 0.5 * Math.sin(t * 2.3 + this.seed));
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(-7, -1); ctx.lineTo(9, -1); ctx.stroke();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-4, 0); ctx.lineTo(-5 - noise1(t * 1.8 + this.seed) * 2, 9 + noise1(t * 1.3 + this.seed) * 3);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    // near arm + the dragged blade (ink-caked steel; a smear when it moves fast)
    this.inkLimb(ctx, p.shN, p.elbN, 8.5, 7, INK, t, 7, agitated);
    this.inkLimb(ctx, p.elbN, p.hndN, 7, 6, INK, t, 8, agitated);
    const bd = Math.hypot(p.tip[0] - p.guard[0], p.tip[1] - p.guard[1]) || 1;
    const bnx = -(p.tip[1] - p.guard[1]) / bd, bny = (p.tip[0] - p.guard[0]) / bd;
    ctx.fillStyle = "#100c18";
    ctx.beginPath();
    ctx.moveTo(p.guard[0] + bnx * 4, p.guard[1] + bny * 4);
    ctx.lineTo(p.tip[0] + bnx * 0.8, p.tip[1] + bny * 0.8);
    ctx.lineTo(p.tip[0] - bnx * 0.8, p.tip[1] - bny * 0.8);
    ctx.lineTo(p.guard[0] - bnx * 4, p.guard[1] - bny * 4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = SEAM;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(p.guard[0] + bnx * 3, p.guard[1] + bny * 3);
    ctx.lineTo(p.tip[0], p.tip[1]);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  private drawPool(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.state === "gone" ? this.poolA * Math.max(0, 1 - this.stateT / 14) : this.poolA;
    ctx.fillStyle = "#07050c";
    ctx.beginPath();
    ctx.ellipse(this.x, GROUND_Y - 2, 40, 7, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private inkLimb(
    ctx: CanvasRenderingContext2D,
    a: [number, number], b: [number, number],
    w1: number, w2: number, color: string, t: number, idx: number, agit: number,
  ) {
    // endpoints drift — ink refusing the shape it was given
    const j1 = noise1(t * 1.7 + this.seed + idx * 3.1) * 1.8 * agit;
    const j2 = noise1(t * 1.9 + this.seed + idx * 5.7) * 2.2 * agit;
    const ax = a[0] + j1, ay = a[1] + j1 * 0.6;
    const bx = b[0] + j2, by = b[1] + j2 * 0.6;
    const dx = bx - ax, dy = by - ay;
    const d = Math.hypot(dx, dy) || 1;
    const nx = -dy / d, ny = dx / d;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ax + nx * w1, ay + ny * w1);
    ctx.lineTo(bx + nx * w2, by + ny * w2);
    ctx.lineTo(bx - nx * w2, by - ny * w2);
    ctx.lineTo(ax - nx * w1, ay - ny * w1);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(ax, ay, w1 * 1.05, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(bx, by, w2 * 1.05, 0, TAU); ctx.fill();
    // one drip from the low edge, sometimes
    if (noise1(this.seed * 3 + idx) > 0.1) {
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      const mx = ax + dx * 0.6, my = ay + dy * 0.6;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + noise1(t * 1.1 + idx) * 2, my + 7 + noise1(t * 0.9 + idx) * 4 * agit);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  private plate(
    ctx: CanvasRenderingContext2D,
    pel: [number, number], neck: [number, number],
    plateC: string, seam: string, t: number, agit: number,
  ) {
    const dx = neck[0] - pel[0], dy = neck[1] - pel[1];
    const d = Math.hypot(dx, dy) || 1;
    const nx = -dy / d, ny = dx / d;
    ctx.fillStyle = plateC;
    ctx.beginPath();
    ctx.moveTo(neck[0] + nx * 14, neck[1] + ny * 14);
    ctx.lineTo(neck[0] - nx * 14, neck[1] - ny * 14);
    ctx.lineTo(pel[0] - nx * 10, pel[1] - ny * 10);
    ctx.lineTo(pel[0] + nx * 10, pel[1] + ny * 10);
    ctx.closePath(); ctx.fill();
    // pauldron slab
    ctx.beginPath(); ctx.arc(neck[0], neck[1] + 4, 12.5, 0, TAU); ctx.fill();
    // dents: plates cave — dark bites out of the silhouette edge, seams leaking
    for (let i = 0; i < this.dents; i++) {
      const du = 0.28 + i * 0.24;
      const px = pel[0] + (neck[0] - pel[0]) * du + nx * 11;
      const py = pel[1] + (neck[1] - pel[1]) * du + ny * 11;
      ctx.fillStyle = "#050308";
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = seam;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px, py + 3);
      ctx.lineTo(px + noise1(t * 1.5 + i) * 2, py + 12);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = plateC;
    }
    // the seams breathe with agitation (noise made visible, not glow)
    ctx.strokeStyle = seam;
    ctx.globalAlpha = 0.35 + 0.3 * agit * (0.5 + 0.5 * Math.sin(t * 2.1 + this.seed * 2));
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(neck[0] + nx * 12, neck[1] + ny * 12);
    ctx.lineTo(pel[0] + nx * 8, pel[1] + ny * 8);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// authored, sparse encounters (BRIEF §7.7) — the journey is the game
export const SHADE_SPAWNS: Record<number, number[]> = {
  1: [1900],       // one lone teacher before the dusk exit
  2: [1300, 1660], // two singles spaced along the road to the fire
  4: [1310, 1530], // the stair's pair — the co-op formation moment
};
