// The knight — skeletal 2D rig + animation. This IS the Gate 0 product.
// Principles enforced here: anticipation, follow-through, weight, silhouette.

import { clamp, damp, easeInCubic, easeInOutCubic, easeOutCubic, lerp, noise1, rad, TAU, type Ease } from "./math";
import { GROUND_Y, SUN_X } from "./paint";
import type { Fx } from "./fx";

// ---- proportions (world px) ----
const THIGH = 40, SHIN = 40, TORSO = 48, UARM = 30, FARM = 28, BLADE = 92;
const STAND_PELVIS = 74;

// Pose: every field numeric so blending is generic.
// Angles in RADIANS at runtime; authored below in degrees.
// Limb angles measured from straight-down; positive = toward facing (+x).
// Legs use ABSOLUTE shin angles (IK-friendly). Arms: elbow is relative bend.
export interface Pose {
  pelvisX: number; pelvisY: number; bodyRot: number;
  torso: number; head: number;
  shL: number; elL: number; shR: number; elR: number;
  hipL: number; shinL: number; hipR: number; shinR: number;
  sword: number;
}
const POSE_KEYS = [
  "pelvisX", "pelvisY", "bodyRot", "torso", "head",
  "shL", "elL", "shR", "elR", "hipL", "shinL", "hipR", "shinR", "sword",
] as const;

function P(deg: Partial<Record<keyof Pose, number>>): Pose {
  // author in degrees (px fields pass through)
  const base: Pose = {
    pelvisX: 0, pelvisY: STAND_PELVIS, bodyRot: 0, torso: 5, head: 0,
    shL: -8, elL: 12, shR: 14, elR: 18,
    hipL: 3, shinL: 0, hipR: -5, shinR: -8, sword: -12,
  };
  const merged = { ...base, ...deg };
  const out = {} as Pose;
  for (const k of POSE_KEYS) {
    const v = merged[k];
    out[k] = k === "pelvisX" || k === "pelvisY" ? v : rad(v);
  }
  return out;
}

const IDLE = P({});

// ---- keyframe timelines ----
interface Key { t: number; pose: Pose; ease: Ease }

const LYING = P({
  pelvisX: 0, pelvisY: 13, bodyRot: 84, torso: 8, head: 20,
  shL: -32, elL: 52, shR: 58, elR: 42,
  hipL: 10, shinL: -6, hipR: -16, shinR: -30, sword: -70,
});

const WAKE: Key[] = [
  { t: 0.0, pose: LYING, ease: easeInOutCubic },
  { t: 0.5, pose: P({ pelvisY: 14, bodyRot: 82, torso: 12, head: 8, shL: -32, elL: 52, shR: 58, elR: 42, hipL: 10, shinL: -6, hipR: -16, shinR: -30, sword: -70 }), ease: easeInOutCubic },
  { t: 1.5, pose: P({ pelvisY: 27, bodyRot: 50, torso: 20, head: -2, shL: -14, elL: 36, shR: 28, elR: 8, hipL: 26, shinL: -14, hipR: -20, shinR: -52, sword: -55 }), ease: easeInOutCubic },
  { t: 2.35, pose: P({ pelvisY: 42, bodyRot: 6, torso: 24, head: -8, shL: 8, elL: 30, shR: 20, elR: 24, hipL: 62, shinL: -8, hipR: -30, shinR: -92, sword: -30 }), ease: easeInOutCubic },
  { t: 3.0, pose: P({ pelvisY: 43, bodyRot: 4, torso: 18, head: 2, shL: 4, elL: 26, shR: 16, elR: 22, hipL: 62, shinL: -8, hipR: -30, shinR: -92, sword: -24 }), ease: easeInOutCubic },
  { t: 3.95, pose: P({ pelvisY: STAND_PELVIS, torso: 9, head: 1, hipL: 5, shinL: -2, hipR: -7, shinR: -11 }), ease: easeInCubic },
  { t: 4.25, pose: IDLE, ease: easeOutCubic },
];

const ATTACK: Key[] = [
  { t: 0.0, pose: IDLE, ease: easeInOutCubic },
  { t: 0.30, pose: P({ pelvisX: -9, pelvisY: 68, torso: -16, head: 6, shR: -138, elR: 62, sword: -12, shL: 30, elL: 26, hipL: 15, shinL: -4, hipR: -19, shinR: -24 }), ease: easeInOutCubic },
  { t: 0.34, pose: P({ pelvisX: -8, pelvisY: 68, torso: -14, head: 5, shR: -130, elR: 54, sword: -12, shL: 28, elL: 26, hipL: 15, shinL: -4, hipR: -19, shinR: -24 }), ease: easeInCubic },
  { t: 0.43, pose: P({ pelvisX: 14, pelvisY: 70, torso: 21, head: -2, shR: 66, elR: 6, sword: 14, shL: -20, elL: 32, hipL: 24, shinL: 2, hipR: -26, shinR: -30 }), ease: easeInCubic },
  { t: 0.60, pose: P({ pelvisX: 10, pelvisY: 71, torso: 15, head: -1, shR: 50, elR: 15, sword: 26, shL: -14, elL: 26, hipL: 18, shinL: 0, hipR: -20, shinR: -24 }), ease: easeOutCubic },
  { t: 0.88, pose: IDLE, ease: easeInOutCubic },
];

const HIT: Key[] = [
  { t: 0.0, pose: IDLE, ease: easeOutCubic },
  { t: 0.09, pose: P({ pelvisX: -13, pelvisY: 69, torso: -17, head: -15, shL: -36, elL: 56, shR: -28, elR: 50, sword: -35, hipL: 12, shinL: -6, hipR: -20, shinR: -26 }), ease: easeOutCubic },
  { t: 0.32, pose: P({ pelvisX: -4, pelvisY: 71, torso: -6, head: -5, shL: -18, elL: 30, shR: -4, elR: 32, sword: -22 }), ease: easeInOutCubic },
  { t: 0.60, pose: IDLE, ease: easeInOutCubic },
];

function sampleTimeline(keys: Key[], t: number): Pose {
  if (t <= keys[0].t) return keys[0].pose;
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i].t) {
      const a = keys[i - 1], b = keys[i];
      const u = b.ease((t - a.t) / (b.t - a.t));
      const out = {} as Pose;
      for (const k of POSE_KEYS) out[k] = lerp(a.pose[k], b.pose[k], u);
      return out;
    }
  }
  return keys[keys.length - 1].pose;
}

// ---- 2-bone leg IK (absolute angles from straight-down) ----
function legIK(hipX: number, hipY: number, footX: number, footY: number): [number, number] {
  const dx = footX - hipX, dy = footY - hipY;
  const d = clamp(Math.hypot(dx, dy), 6, THIGH + SHIN - 0.5);
  const phi = Math.atan2(dx, dy);
  const cosA = clamp((THIGH * THIGH + d * d - SHIN * SHIN) / (2 * THIGH * d), -1, 1);
  const hip = phi + Math.acos(cosA); // knee bends toward +x (forward)
  const kx = hipX + Math.sin(hip) * THIGH, ky = hipY + Math.cos(hip) * THIGH;
  const shin = Math.atan2(footX - kx, footY - ky);
  return [hip, shin];
}

// stable pseudo-random per-limb variation (indexed by draw order)
const LIMB_JIT = [0.3, -0.2, 0.45, -0.4, 0.1, -0.15, 0.5, -0.35, 0.2, -0.05, 0.4, -0.25];
// chainmail speckle positions in torso frame: [along 0..1, across -1..1]
const SPECKLE: [number, number][] = [
  [0.12, -0.5], [0.18, 0.3], [0.25, -0.1], [0.3, 0.6], [0.34, -0.7], [0.4, 0.15],
  [0.46, -0.35], [0.5, 0.5], [0.55, -0.6], [0.6, 0.05], [0.64, 0.65], [0.7, -0.25],
  [0.74, 0.35], [0.8, -0.55], [0.84, 0.1], [0.88, 0.55], [0.2, -0.8], [0.66, -0.8],
];

// ---- cloak (verlet chain) ----
const CLOAK_N = 7, CLOAK_LINK = 12.5;
interface CNode { x: number; y: number; px: number; py: number }

export type KnightState = "prelude" | "wake" | "idle" | "walk" | "attack" | "hit";

export class Knight {
  x: number; facing = 1;
  state: KnightState = "prelude";
  stateT = 0;
  cur: Pose = { ...LYING };
  walkPhase = 0;
  vx = 0; // knockback impulse velocity
  private lastStepSign = 0;
  private cloak: CNode[] = [];
  private smearFrom = 0;
  hitFlash = 0;
  wakeDone = false;

  constructor(x: number) {
    this.x = x;
    for (let i = 0; i < CLOAK_N; i++) {
      this.cloak.push({ x: x - i * 4, y: GROUND_Y - 20 - i * 2, px: x - i * 4, py: GROUND_Y - 20 - i * 2 });
    }
  }

  startWake() {
    this.state = "wake"; this.stateT = 0; this.wakeDone = false;
  }
  resetToLying(x: number) {
    this.x = x; this.facing = 1; this.state = "prelude"; this.stateT = 0;
    this.cur = { ...LYING }; this.vx = 0; this.wakeDone = false;
  }
  tryAttack() {
    if (this.state === "idle" || this.state === "walk") { this.state = "attack"; this.stateT = 0; }
  }
  tryHit(fx: Fx) {
    if (this.state === "wake" || this.state === "prelude") return;
    this.state = "hit"; this.stateT = 0;
    this.vx = -this.facing * 240;
    this.hitFlash = 0.14;
    for (const n of this.cloak) { n.px -= this.facing * 7; } // whip
    fx.dust(this.x, GROUND_Y - 2, 6, -this.facing);
  }

  private busy() { return this.state === "attack" || this.state === "hit" || this.state === "wake" || this.state === "prelude"; }

  update(dt: number, axis: number, t: number, fx: Fx) {
    this.stateT += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt);

    // locomotion
    if (!this.busy()) {
      if (Math.abs(axis) > 0.2) {
        this.state = "walk";
        this.facing = axis > 0 ? 1 : -1;
        const speed = 150 * Math.abs(axis);
        this.x += speed * this.facing * dt;
        this.walkPhase += (speed / 26) * dt; // stride frequency
      } else if (this.state === "walk") {
        this.state = "idle"; this.stateT = 0;
      }
    }
    this.x += this.vx * dt;
    this.vx = damp(this.vx, 0, 9, dt);
    this.x = clamp(this.x, 320, 2100);

    // pose target
    let target: Pose;
    let rate = 12;
    switch (this.state) {
      case "prelude": target = LYING; rate = 6; break;
      case "wake": {
        target = sampleTimeline(WAKE, this.stateT);
        rate = 22; // timeline carries the easing; follow it closely
        if (this.stateT >= WAKE[WAKE.length - 1].t) { this.state = "idle"; this.stateT = 0; this.wakeDone = true; }
        break;
      }
      case "attack": {
        target = sampleTimeline(ATTACK, this.stateT);
        rate = 26;
        if (this.stateT >= 0.40 && this.smearFrom < 0.30) {
          // impact dust where the blade meets ground-ish arc
          fx.dust(this.x + this.facing * 66, GROUND_Y - 8, 8, this.facing);
          this.smearFrom = 1;
        }
        if (this.stateT >= ATTACK[ATTACK.length - 1].t) { this.state = "idle"; this.stateT = 0; this.smearFrom = 0; }
        break;
      }
      case "hit": {
        target = sampleTimeline(HIT, this.stateT);
        rate = 24;
        if (this.stateT >= HIT[HIT.length - 1].t) { this.state = "idle"; this.stateT = 0; }
        break;
      }
      case "walk": {
        target = this.walkPose();
        rate = 16;
        // footstep dust on plant
        const s = Math.sign(Math.sin(this.walkPhase));
        if (s !== this.lastStepSign) {
          this.lastStepSign = s;
          fx.dust(this.x - this.facing * 8, GROUND_Y - 2, 3, -this.facing * 0.4);
        }
        break;
      }
      default: {
        target = this.idlePose(t);
        rate = 8;
      }
    }

    // prelude breathes too — a collapsed body that's alive
    if (this.state === "prelude") {
      target = { ...target };
      target.pelvisY += Math.sin(t * 0.9) * 1.1;
      target.torso += rad(Math.sin(t * 0.9) * 0.7);
    }
    for (const k of POSE_KEYS) this.cur[k] = damp(this.cur[k], target[k], rate, dt);
    this.cloakSim(dt, t);
  }

  private idlePose(t: number): Pose {
    const p = { ...IDLE };
    p.pelvisY += Math.sin(t * 1.15) * 1.5;
    p.torso += rad(Math.sin(t * 1.15) * 0.9);
    p.head += rad(noise1(t * 0.35) * 6);
    p.shL += rad(Math.sin(t * 1.15 + 0.6) * 1.5);
    p.shR += rad(Math.sin(t * 1.15 + 0.9) * 1.2);
    return p;
  }

  private walkPose(): Pose {
    const p = { ...IDLE };
    const ph = this.walkPhase;
    p.pelvisY = 71 + Math.sin(ph * 2) * 2.6;
    p.torso = rad(9 + Math.sin(ph * 2) * 1.2);
    p.head = rad(-1);
    // arms counter-swing (sword arm damped — he's carrying steel)
    p.shL = rad(16 * Math.sin(ph) - 4);
    p.elL = rad(16 + Math.max(0, 10 * Math.sin(ph)));
    p.shR = rad(9 * Math.sin(ph + Math.PI) + 12);
    p.elR = rad(20);
    p.sword = rad(-14);
    // legs via IK from foot targets (local: +x forward, y down from pelvis)
    const stride = 34, lift = 15;
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

  // ---- cloak ----
  private cloakSim(dt: number, t: number) {
    const a = this.anchors();
    const n0 = this.cloak[0];
    n0.x = a.cloakX; n0.y = a.cloakY; n0.px = n0.x; n0.py = n0.y;
    // accel in px/s² — gravity must dominate or the cloak reads as a flag
    const wind = ((noise1(t * 0.8) * 0.5 + 0.7) * 46) * -this.facing - this.vxEstimate() * 0.4;
    for (let i = 1; i < CLOAK_N; i++) {
      const n = this.cloak[i];
      const vx = (n.x - n.px) * 0.965, vy = (n.y - n.py) * 0.965;
      n.px = n.x; n.py = n.y;
      n.x += vx + wind * dt * dt;
      n.y += vy + 520 * dt * dt;
    }
    for (let iter = 0; iter < 3; iter++) {
      for (let i = 1; i < CLOAK_N; i++) {
        const p0 = this.cloak[i - 1], p1 = this.cloak[i];
        const dx = p1.x - p0.x, dy = p1.y - p0.y;
        const d = Math.hypot(dx, dy) || 1;
        const diff = (d - CLOAK_LINK) / d;
        p1.x -= dx * diff; p1.y -= dy * diff;
        if (p1.y > GROUND_Y - 2) p1.y = GROUND_Y - 2; // pools on ground when lying
      }
    }
  }
  private vxEstimate() {
    return this.state === "walk" ? 150 * this.facing : this.vx;
  }

  // ---- FK ----
  private anchors() {
    // cloak attach point in WORLD space (cloak sim is world-space)
    const pts = this.compute();
    return { cloakX: this.x + pts.cloak[0] * this.facing, cloakY: GROUND_Y + pts.cloak[1] };
  }

  compute() {
    const c = this.cur;
    const pel: [number, number] = [c.pelvisX, -c.pelvisY];
    const dirD = (a: number, len: number): [number, number] => [Math.sin(a) * len, Math.cos(a) * len];
    const dirU = (a: number, len: number): [number, number] => [Math.sin(a) * len, -Math.cos(a) * len];
    const add = (p: [number, number], d: [number, number]): [number, number] => [p[0] + d[0], p[1] + d[1]];

    const neck = add(pel, dirU(c.torso, TORSO));
    const headC = add(neck, dirU(c.torso + c.head, 16));
    const shF: [number, number] = add(neck, [-5, 5]); // far shoulder (left)
    const shN: [number, number] = add(neck, [5, 6]);  // near shoulder (right)
    const hipF: [number, number] = add(pel, [-3, 0]);
    const hipN: [number, number] = add(pel, [3, 0]);

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
    const guard = add(hndN, dirD(swordA, 12));

    // whole-body rotation around pelvis (lying)
    const cs = Math.cos(c.bodyRot), sn = Math.sin(c.bodyRot);
    const rot = (p: [number, number]): [number, number] => {
      const dx = p[0] - pel[0], dy = p[1] - pel[1];
      return [pel[0] + dx * cs - dy * sn, pel[1] + dx * sn + dy * cs];
    };
    const pts = { pel, neck, headC, shF, shN, hipF, hipN, elbF, hndF, elbN, hndN, kneF, ftF, kneN, ftN, tip, guard };
    const out: Record<string, [number, number]> = {};
    for (const k in pts) out[k] = rot((pts as Record<string, [number, number]>)[k]);

    // cloak anchor: behind the neck
    const ca = rot(add(neck, [-7, 4]));
    return { ...out, cloak: ca } as Record<string, [number, number]> & { cloak: [number, number] };
  }

  // ---- painted render ----
  draw(ctx: CanvasRenderingContext2D) {
    const p = this.compute();
    this.limbIdx = 0; // stable per-limb variation each frame
    ctx.save();
    ctx.translate(this.x, GROUND_Y);
    ctx.scale(this.facing, 1);

    // long shadow thrown away from the sun (cinematic key light)
    const lowY = Math.max(p.ftF[1], p.ftN[1], p.pel[1] + 8);
    const feetX = (p.ftF[0] + p.ftN[0]) / 2;
    const shadowDir = (this.x >= SUN_X ? 1 : -1) * this.facing; // world dir → local
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#020302";
    ctx.beginPath();
    ctx.ellipse(feetX + shadowDir * 42, Math.min(-2, lowY + 6), 58, 5.5, 0, 0, TAU);
    ctx.fill();
    // contact shadow
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#030403";
    ctx.beginPath();
    ctx.ellipse(feetX, Math.min(-2, lowY + 6), 34, 7, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;

    // cloak (behind everything)
    this.drawCloak(ctx);

    const FAR = "#0b0b10", NEAR = "#12121a", RIM = this.hitFlash > 0 ? "#c9502e" : "#8e2a1a";
    const rimA = this.hitFlash > 0 ? 0.95 : 0.75;

    // far arm + far leg — nearly rimless (depth), silhouette does the work
    this.limb(ctx, p.shF, p.elbF, 7.5, 6, FAR, RIM, rimA * 0.14);
    this.limb(ctx, p.elbF, p.hndF, 6, 5, FAR, RIM, rimA * 0.14);
    this.limb(ctx, p.hipF, p.kneF, 9.5, 8, FAR, RIM, rimA * 0.12);
    this.limb(ctx, p.kneF, p.ftF, 8, 6, FAR, RIM, rimA * 0.12);
    this.foot(ctx, p.kneF, p.ftF, FAR);

    // torso + tabard
    this.torso(ctx, p.pel, p.neck, RIM, rimA * 0.6);

    // neck stub under the helm
    ctx.strokeStyle = NEAR;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.neck[0], p.neck[1]);
    ctx.lineTo(p.headC[0], p.headC[1]);
    ctx.stroke();

    // near leg
    this.limb(ctx, p.hipN, p.kneN, 10, 8.5, NEAR, RIM, rimA * 0.55);
    this.limb(ctx, p.kneN, p.ftN, 8.5, 6.5, NEAR, RIM, rimA * 0.45);
    this.foot(ctx, p.kneN, p.ftN, NEAR);

    // helm
    this.helm(ctx, p.neck, p.headC, RIM, rimA);

    // near arm + sword
    this.limb(ctx, p.shN, p.elbN, 8, 6.5, NEAR, RIM, rimA * 0.4);
    this.limb(ctx, p.elbN, p.hndN, 6.5, 5.5, NEAR, RIM, rimA * 0.4);
    this.sword(ctx, p.hndN, p.guard, p.tip, RIM, rimA);
    // gauntlet
    ctx.fillStyle = NEAR;
    ctx.beginPath(); ctx.arc(p.hndN[0], p.hndN[1], 5, 0, TAU); ctx.fill();

    ctx.restore();
  }

  swordTipWorld(): [number, number] {
    const p = this.compute();
    return [this.x + p.tip[0] * this.facing, GROUND_Y + p.tip[1]];
  }
  swordGuardWorld(): [number, number] {
    const p = this.compute();
    return [this.x + p.guard[0] * this.facing, GROUND_Y + p.guard[1]];
  }
  attackSmearActive(): boolean {
    return this.state === "attack" && this.stateT > 0.31 && this.stateT < 0.52;
  }

  private limbIdx = 0;
  private limb(
    ctx: CanvasRenderingContext2D,
    a: [number, number], b: [number, number],
    w1: number, w2: number, color: string, rim: string, rimAlpha: number,
  ) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.hypot(dx, dy) || 1;
    const nx = -dy / d, ny = dx / d;
    const ux = dx / d, uy = dy / d;
    const jit = LIMB_JIT[this.limbIdx++ % LIMB_JIT.length]; // stable per draw order
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(a[0] + nx * w1, a[1] + ny * w1);
    ctx.lineTo(b[0] + nx * w2, b[1] + ny * w2);
    ctx.lineTo(b[0] - nx * w2, b[1] - ny * w2);
    ctx.lineTo(a[0] - nx * w1, a[1] - ny * w1);
    ctx.closePath();
    ctx.fill();
    // joints read as armor plates
    ctx.beginPath(); ctx.arc(a[0], a[1], w1 * 1.05, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(b[0], b[1], w2 * 1.05, 0, TAU); ctx.fill();
    // painted form: plate separation bands across the limb
    ctx.strokeStyle = "#06060a";
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.4;
    for (const bu of [0.3 + jit * 0.1, 0.68 + jit * 0.08]) {
      const px = a[0] + ux * d * bu, py = a[1] + uy * d * bu;
      const w = lerp(w1, w2, bu) * 0.92;
      ctx.beginPath();
      ctx.moveTo(px + nx * w, py + ny * w);
      ctx.lineTo(px - nx * w, py - ny * w);
      ctx.stroke();
    }
    // axial brush stroke — a soft mid-tone catch inside the upper edge
    ctx.strokeStyle = "#232330";
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.6;
    const side0 = ny < 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(a[0] + nx * w1 * 0.55 * side0 + ux * d * 0.12, a[1] + ny * w1 * 0.55 * side0 + uy * d * 0.12);
    ctx.lineTo(a[0] + nx * w2 * 0.5 * side0 + ux * d * 0.62, a[1] + ny * w2 * 0.5 * side0 + uy * d * 0.62);
    ctx.stroke();
    // red rim on the upper edge (sun side)
    ctx.strokeStyle = rim;
    ctx.globalAlpha = rimAlpha;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a[0] + nx * w1 * side0, a[1] + ny * w1 * side0);
    ctx.lineTo(b[0] + nx * w2 * side0, b[1] + ny * w2 * side0);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  private torso(
    ctx: CanvasRenderingContext2D,
    pel: [number, number], neck: [number, number],
    rim: string, rimAlpha: number,
  ) {
    const dx = neck[0] - pel[0], dy = neck[1] - pel[1];
    const d = Math.hypot(dx, dy) || 1;
    const nx = -dy / d, ny = dx / d;
    // torso quad: shoulders 13, waist 9
    ctx.fillStyle = "#101018";
    ctx.beginPath();
    ctx.moveTo(neck[0] + nx * 13, neck[1] + ny * 13);
    ctx.lineTo(neck[0] - nx * 13, neck[1] - ny * 13);
    ctx.lineTo(pel[0] - nx * 9.5, pel[1] - ny * 9.5);
    ctx.lineTo(pel[0] + nx * 9.5, pel[1] + ny * 9.5);
    ctx.closePath();
    ctx.fill();
    // pauldron hump
    ctx.beginPath(); ctx.arc(neck[0], neck[1] + 4, 11, 0, TAU); ctx.fill();
    // chainmail speckle — painted texture, stable positions in torso frame
    ctx.fillStyle = "#1d1d26";
    ctx.globalAlpha = 0.5;
    for (const [su, sv] of SPECKLE) {
      const w = lerp(9.5, 13, su) * 0.8;
      const px = pel[0] + (neck[0] - pel[0]) * su + nx * sv * w;
      const py = pel[1] + (neck[1] - pel[1]) * su + ny * sv * w;
      ctx.beginPath();
      ctx.arc(px, py, 1.1, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // tabard skirt — the ONLY colored cloth: deep dried-blood red
    ctx.fillStyle = "#2a100d";
    ctx.beginPath();
    ctx.moveTo(pel[0] + nx * 9, pel[1] + ny * 9);
    ctx.lineTo(pel[0] - nx * 9, pel[1] - ny * 9);
    ctx.lineTo(pel[0] - nx * 11 + 2, pel[1] + 20);
    ctx.lineTo(pel[0] + nx * 11 + 2, pel[1] + 20);
    ctx.closePath();
    ctx.fill();
    // tabard fold shadows
    ctx.strokeStyle = "#170a08";
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1.5;
    for (const fv of [-0.35, 0.3]) {
      ctx.beginPath();
      ctx.moveTo(pel[0] + nx * 9 * fv, pel[1] + ny * 9 * fv);
      ctx.lineTo(pel[0] + nx * 11 * fv + 2, pel[1] + 19);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // chest rim light
    ctx.strokeStyle = rim;
    ctx.globalAlpha = rimAlpha;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(neck[0] + nx * 12, neck[1] + ny * 12);
    ctx.lineTo(pel[0] + nx * 8.5, pel[1] + ny * 8.5);
    ctx.stroke();
    // shoulder top highlight (pale, faint)
    ctx.strokeStyle = "#b98d6e";
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.arc(neck[0], neck[1] + 4, 11, -2.4, -0.6);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  private helm(
    ctx: CanvasRenderingContext2D,
    neck: [number, number], headC: [number, number],
    rim: string, rimAlpha: number,
  ) {
    const a = Math.atan2(headC[0] - neck[0], -(headC[1] - neck[1])); // head tilt
    ctx.save();
    ctx.translate(headC[0], headC[1]);
    ctx.rotate(a);
    // great helm: flat-ish dome + straight sides
    ctx.fillStyle = "#14141c";
    ctx.beginPath();
    ctx.moveTo(-10, 12);
    ctx.lineTo(-10.5, -6);
    ctx.quadraticCurveTo(-9, -13, 0, -13.5);
    ctx.quadraticCurveTo(9, -13, 10.5, -6);
    ctx.lineTo(10, 12);
    ctx.closePath();
    ctx.fill();
    // eye slit
    ctx.strokeStyle = "#040406";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(-7, -1.5); ctx.lineTo(9, -1.5);
    ctx.stroke();
    // cross ridge
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(1.5, -12); ctx.lineTo(1.5, 10); ctx.stroke();
    // rim light — dome top + face edge
    ctx.strokeStyle = rim;
    ctx.globalAlpha = rimAlpha;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(10.5, -5);
    ctx.quadraticCurveTo(9, -12.5, 0, -13);
    ctx.stroke();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = "#b98d6e";
    ctx.beginPath();
    ctx.moveTo(-9.5, -8); ctx.quadraticCurveTo(-4, -12.5, 2, -12.8);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private foot(ctx: CanvasRenderingContext2D, knee: [number, number], ft: [number, number], color: string) {
    const a = Math.atan2(ft[0] - knee[0], ft[1] - knee[1]);
    ctx.save();
    ctx.translate(ft[0], ft[1]);
    ctx.rotate(-a);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(3.5, -1, 8, 4.5, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private sword(
    ctx: CanvasRenderingContext2D,
    hand: [number, number], guard: [number, number], tip: [number, number],
    rim: string, rimAlpha: number,
  ) {
    const dx = tip[0] - guard[0], dy = tip[1] - guard[1];
    const d = Math.hypot(dx, dy) || 1;
    const nx = -dy / d, ny = dx / d;
    // blade
    ctx.fillStyle = "#1c1c24";
    ctx.beginPath();
    ctx.moveTo(guard[0] + nx * 3.4, guard[1] + ny * 3.4);
    ctx.lineTo(tip[0] + nx * 0.6, tip[1] + ny * 0.6);
    ctx.lineTo(tip[0] - nx * 0.6, tip[1] - ny * 0.6);
    ctx.lineTo(guard[0] - nx * 3.4, guard[1] - ny * 3.4);
    ctx.closePath();
    ctx.fill();
    // fuller sheen
    ctx.strokeStyle = "#4a4a58";
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(guard[0], guard[1]);
    ctx.lineTo(tip[0] * 0.35 + guard[0] * 0.65, tip[1] * 0.35 + guard[1] * 0.65);
    ctx.stroke();
    // blade rim (sun catch)
    ctx.strokeStyle = rim;
    ctx.globalAlpha = rimAlpha * 0.8;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(guard[0] + nx * 3, guard[1] + ny * 3);
    ctx.lineTo(tip[0] + nx * 0.5, tip[1] + ny * 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // crossguard
    ctx.strokeStyle = "#0d0d12";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(guard[0] + nx * 9, guard[1] + ny * 9);
    ctx.lineTo(guard[0] - nx * 9, guard[1] - ny * 9);
    ctx.stroke();
    // grip below hand
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(hand[0], hand[1]);
    ctx.lineTo(hand[0] - (tip[0] - guard[0]) / d * 10, hand[1] - (tip[1] - guard[1]) / d * 10);
    ctx.stroke();
  }

  private drawCloak(ctx: CanvasRenderingContext2D) {
    const n = this.cloak;
    // cloak nodes are in WORLD space; we're inside local transform — convert
    ctx.save();
    ctx.scale(this.facing, 1); // undo flip (cloak sim is world-space)
    ctx.translate(-this.x, -GROUND_Y);
    ctx.fillStyle = "#0c0912";
    ctx.beginPath();
    const w = (i: number) => 7 + (i / (CLOAK_N - 1)) * 13;
    for (let i = 0; i < CLOAK_N; i++) {
      const dxn = i < CLOAK_N - 1 ? n[i + 1].x - n[i].x : n[i].x - n[i - 1].x;
      const dyn = i < CLOAK_N - 1 ? n[i + 1].y - n[i].y : n[i].y - n[i - 1].y;
      const d = Math.hypot(dxn, dyn) || 1;
      const px = n[i].x + (-dyn / d) * w(i), py = n[i].y + (dxn / d) * w(i);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    for (let i = CLOAK_N - 1; i >= 0; i--) {
      const dxn = i < CLOAK_N - 1 ? n[i + 1].x - n[i].x : n[i].x - n[i - 1].x;
      const dyn = i < CLOAK_N - 1 ? n[i + 1].y - n[i].y : n[i].y - n[i - 1].y;
      const d = Math.hypot(dxn, dyn) || 1;
      ctx.lineTo(n[i].x - (-dyn / d) * w(i), n[i].y - (dxn / d) * w(i));
    }
    ctx.closePath();
    ctx.fill();
    // cloak rim
    ctx.strokeStyle = "#6e2418";
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      if (i === 0) ctx.moveTo(n[i].x, n[i].y - w(i));
      else ctx.lineTo(n[i].x, n[i].y - w(i));
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
