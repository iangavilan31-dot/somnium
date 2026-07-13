// The knight — skeletal 2D rig + animation. This IS the Gate 0 product.
// Principles enforced here: anticipation, follow-through, weight, silhouette.
// Phase 2a: the full M&C §10 moveset. Frame budgets are CONTRACTS (F = 1/60s);
// every move declares impact + cancel window in the MOVES table, never fudged.

import { clamp, damp, easeInCubic, easeInOutCubic, easeOutCubic, lerp, noise1, rad, TAU, type Ease } from "./math";
import { BAND_FAR, BAND_NEAR, DEPTH_SPEED, GROUND_Y, Z_SCALE, Z_SLOPE, Z_TOL } from "./paint";
import type { Fx } from "./fx";

// ---- proportions (world px) ----
const THIGH = 40, SHIN = 40, TORSO = 48, UARM = 30, FARM = 28, BLADE = 92;
const STAND_PELVIS = 74;
const F = 1 / 60; // one animation frame at the §10 baseline

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

export function P(deg: Partial<Record<keyof Pose, number>>): Pose {
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
export interface Key { t: number; pose: Pose; ease: Ease }

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

const HIT: Key[] = [
  { t: 0.0, pose: IDLE, ease: easeOutCubic },
  { t: 0.09, pose: P({ pelvisX: -13, pelvisY: 69, torso: -17, head: -15, shL: -36, elL: 56, shR: -28, elR: 50, sword: -35, hipL: 12, shinL: -6, hipR: -20, shinR: -26 }), ease: easeOutCubic },
  { t: 0.32, pose: P({ pelvisX: -4, pelvisY: 71, torso: -6, head: -5, shL: -18, elL: 30, shR: -4, elR: 32, sword: -22 }), ease: easeInOutCubic },
  { t: 0.60, pose: IDLE, ease: easeInOutCubic },
];

// ==== THE MOVESET (M&C §10 — frame budgets are contracts) ====
// impact = strike frames begin; strikeEnd = strike frames end (smear window);
// cancelFrom = roll/backstep/chain window opens; Infinity = commit.

interface Move {
  name: string;
  keys: Key[];
  impact: number; strikeEnd: number; total: number;
  cancelFrom: number;
  chain?: string;   // next light in the combo
  lunge: number;    // forward px carried through the strike (momentum honesty)
  dust: number;     // painted flecks at impact
  loud: number;     // ATTENTION-IS-NOISE value (consumed in Phase 2b)
  stop: number;     // §10 hitstop, applied ONLY when the strike lands
}

// L1 — THE DESCENDING CUT. 8f anticip · 3f strike · 12f follow. Cancel: impact+2f.
const L1: Move = {
  name: "L1",
  keys: [
    { t: 0, pose: IDLE, ease: easeInOutCubic },
    { t: 8 * F, pose: P({ pelvisX: -9, pelvisY: 68, torso: -16, head: 6, shR: -138, elR: 62, sword: -12, shL: 30, elL: 26, hipL: 15, shinL: -4, hipR: -19, shinR: -24 }), ease: easeInOutCubic },
    { t: 11 * F, pose: P({ pelvisX: 14, pelvisY: 70, torso: 21, head: -2, shR: 66, elR: 6, sword: 14, shL: -20, elL: 32, hipL: 24, shinL: 2, hipR: -26, shinR: -30 }), ease: easeInCubic },
    { t: 17 * F, pose: P({ pelvisX: 10, pelvisY: 71, torso: 15, head: -1, shR: 50, elR: 15, sword: 26, shL: -14, elL: 26, hipL: 18, shinL: 0, hipR: -20, shinR: -24 }), ease: easeOutCubic },
    { t: 23 * F, pose: IDLE, ease: easeInOutCubic },
  ],
  impact: 8 * F, strikeEnd: 11 * F, total: 23 * F, cancelFrom: 13 * F,
  chain: "L2", lunge: 10, dust: 6, loud: 3, stop: 2 * F,
};

// L2 — THE CROSS. 6f anticip · 3f strike · 12f follow. Coil across the body,
// untwist through a level sweep. Chain L3 or roll.
const L2: Move = {
  name: "L2",
  keys: [
    { t: 0, pose: P({ pelvisX: -6, pelvisY: 69, torso: -12, head: 4, shR: -50, elR: 80, sword: -120, shL: 26, elL: 20, hipL: 14, shinL: -2, hipR: -18, shinR: -26 }), ease: easeInOutCubic },
    { t: 6 * F, pose: P({ pelvisX: -8, pelvisY: 69, torso: -15, head: 5, shR: -58, elR: 84, sword: -124, shL: 28, elL: 22, hipL: 14, shinL: -2, hipR: -18, shinR: -26 }), ease: easeInCubic },
    { t: 9 * F, pose: P({ pelvisX: 12, pelvisY: 70, torso: 18, head: -3, shR: 55, elR: 8, sword: 55, shL: -18, elL: 30, hipL: 22, shinL: 0, hipR: -24, shinR: -28 }), ease: easeInCubic },
    { t: 15 * F, pose: P({ pelvisX: 8, pelvisY: 70, torso: 12, head: -2, shR: 70, elR: 12, sword: 72, shL: -12, elL: 26, hipL: 18, shinL: 0, hipR: -20, shinR: -26 }), ease: easeOutCubic },
    { t: 21 * F, pose: IDLE, ease: easeInOutCubic },
  ],
  impact: 6 * F, strikeEnd: 9 * F, total: 21 * F, cancelFrom: 11 * F,
  chain: "L3", lunge: 12, dust: 6, loud: 3, stop: 2 * F,
};

// L3 — THE RISING CUT (capstone). 12f anticip · 4f strike · 18f follow. Commit —
// no cancel. Deep crouch load, explosive rise, HELD pose at the top (cover frame).
const L3: Move = {
  name: "L3",
  keys: [
    { t: 0, pose: P({ pelvisX: -4, pelvisY: 62, torso: 18, head: 2, shR: -10, elR: 12, sword: -50, shL: 24, elL: 30, hipL: 30, shinL: -16, hipR: -22, shinR: -52 }), ease: easeInOutCubic },
    { t: 12 * F, pose: P({ pelvisX: -10, pelvisY: 52, torso: 30, head: 6, shR: -24, elR: 14, sword: -40, shL: 34, elL: 40, hipL: 40, shinL: -20, hipR: -20, shinR: -70 }), ease: easeInCubic },
    { t: 16 * F, pose: P({ pelvisX: 12, pelvisY: 82, torso: -18, head: -8, shR: 85, elR: 6, sword: 62, shL: -26, elL: 24, hipL: 10, shinL: 6, hipR: -22, shinR: -18 }), ease: easeInCubic },
    { t: 25 * F, pose: P({ pelvisX: 10, pelvisY: 78, torso: -14, head: -6, shR: 82, elR: 8, sword: 58, shL: -22, elL: 24, hipL: 10, shinL: 4, hipR: -20, shinR: -18 }), ease: easeOutCubic },
    { t: 34 * F, pose: IDLE, ease: easeInOutCubic },
  ],
  impact: 12 * F, strikeEnd: 16 * F, total: 34 * F, cancelFrom: Infinity,
  lunge: 14, dust: 9, loud: 3.4, stop: 3 * F,
};

// HEAVY — release of the charge. 4f strike · 20f follow. Overhead smash to the
// ground ahead; a whiffed heavy pulls the knight a half-step (§9 momentum).
const HEAVY: Move = {
  name: "HEAVY",
  keys: [
    { t: 0, pose: P({ pelvisX: -12, pelvisY: 66, torso: -22, head: -8, shR: -155, elR: 40, sword: -20, shL: 36, elL: 30, hipL: 18, shinL: -6, hipR: -24, shinR: -34 }), ease: easeInCubic },
    { t: 4 * F, pose: P({ pelvisX: 18, pelvisY: 64, torso: 30, head: -4, shR: 92, elR: 4, sword: -40, shL: -24, elL: 30, hipL: 30, shinL: 6, hipR: -30, shinR: -40 }), ease: easeInCubic },
    { t: 9 * F, pose: P({ pelvisX: 16, pelvisY: 63, torso: 33, head: -2, shR: 90, elR: 6, sword: -38, shL: -22, elL: 30, hipL: 30, shinL: 6, hipR: -30, shinR: -40 }), ease: easeOutCubic },
    { t: 24 * F, pose: IDLE, ease: easeInOutCubic },
  ],
  impact: 0, strikeEnd: 4 * F, total: 24 * F, cancelFrom: Infinity,
  lunge: 18, dust: 12, loud: 4, stop: 4 * F,
};

// RUNNING ATTACK — 6f sprint-cancel · 4f strike · 16f follow. A cross-slash
// that rides the sprint's momentum out through a long skid stance.
const RUNATK: Move = {
  name: "RUNATK",
  keys: [
    { t: 0, pose: P({ pelvisX: -4, pelvisY: 66, torso: 24, head: 2, shR: -40, elR: 30, sword: -110, shL: 30, elL: 24, hipL: 34, shinL: 8, hipR: -30, shinR: -58 }), ease: easeInOutCubic },
    { t: 6 * F, pose: P({ pelvisX: -6, pelvisY: 65, torso: 27, head: 4, shR: -48, elR: 34, sword: -116, shL: 32, elL: 26, hipL: 36, shinL: 10, hipR: -32, shinR: -62 }), ease: easeInCubic },
    { t: 10 * F, pose: P({ pelvisX: 12, pelvisY: 66, torso: 16, head: -3, shR: 62, elR: 6, sword: 48, shL: -18, elL: 28, hipL: 40, shinL: 10, hipR: -36, shinR: -70 }), ease: easeInCubic },
    { t: 17 * F, pose: P({ pelvisX: 8, pelvisY: 69, torso: 10, head: -2, shR: 68, elR: 10, sword: 60, shL: -12, elL: 24, hipL: 28, shinL: 4, hipR: -28, shinR: -46 }), ease: easeOutCubic },
    { t: 26 * F, pose: IDLE, ease: easeInOutCubic },
  ],
  impact: 6 * F, strikeEnd: 10 * F, total: 26 * F, cancelFrom: 18 * F,
  lunge: 26, dust: 8, loud: 3.6, stop: 3 * F,
};

// ROLLING ATTACK — 4f out of the roll's plant · 3f strike · 14f follow.
// A short rising rip straight out of the crouch.
const ROLLATK: Move = {
  name: "ROLLATK",
  keys: [
    { t: 0, pose: P({ pelvisX: -2, pelvisY: 46, torso: 28, head: 8, shR: -30, elR: 20, sword: -140, shL: 30, elL: 44, hipL: 52, shinL: -28, hipR: -38, shinR: -66 }), ease: easeInCubic },
    { t: 4 * F, pose: P({ pelvisX: -4, pelvisY: 44, torso: 30, head: 10, shR: -36, elR: 22, sword: -144, shL: 32, elL: 46, hipL: 54, shinL: -30, hipR: -40, shinR: -68 }), ease: easeInCubic },
    { t: 7 * F, pose: P({ pelvisX: 10, pelvisY: 74, torso: -8, head: -6, shR: 70, elR: 10, sword: 55, shL: -20, elL: 26, hipL: 14, shinL: 2, hipR: -20, shinR: -22 }), ease: easeInCubic },
    { t: 21 * F, pose: IDLE, ease: easeInOutCubic },
  ],
  impact: 4 * F, strikeEnd: 7 * F, total: 21 * F, cancelFrom: Infinity,
  lunge: 12, dust: 7, loud: 3.2, stop: 2 * F,
};

// BACKSTEP POKE — 5f · 2f · 10f. A straight thrust out of the backstep;
// the spacing answer. Cancel: backstep again.
const POKE: Move = {
  name: "POKE",
  keys: [
    { t: 0, pose: P({ pelvisX: -6, pelvisY: 70, torso: -6, head: 2, shR: -18, elR: 60, sword: 48, shL: 24, elL: 40, hipL: 12, shinL: -4, hipR: -20, shinR: -30 }), ease: easeInOutCubic },
    { t: 5 * F, pose: P({ pelvisX: -8, pelvisY: 70, torso: -8, head: 3, shR: -22, elR: 64, sword: 44, shL: 26, elL: 42, hipL: 12, shinL: -4, hipR: -20, shinR: -30 }), ease: easeInCubic },
    { t: 7 * F, pose: P({ pelvisX: 8, pelvisY: 71, torso: 14, head: -2, shR: 62, elR: 22, sword: 6, shL: -14, elL: 28, hipL: 20, shinL: 0, hipR: -24, shinR: -30 }), ease: easeInCubic },
    { t: 17 * F, pose: IDLE, ease: easeInOutCubic },
  ],
  impact: 5 * F, strikeEnd: 7 * F, total: 17 * F, cancelFrom: 9 * F,
  lunge: 8, dust: 4, loud: 2.8, stop: 1 * F,
};

const MOVES: Record<string, Move> = { L1, L2, L3, HEAVY, RUNATK, ROLLATK, POKE };

// ---- non-attack timelines ----

// ROLL — 26f, FIXED distance (ER honesty), i-frames 4f–18f, heavy plant exit.
// bodyRot carries a true forward somersault; limbs tuck; cloak wraps.
const ROLL_T = 26 * F, ROLL_DIST = 140;
const ROLL_IV0 = 4 * F, ROLL_IV1 = 18 * F;
const ROLL: Key[] = [
  { t: 0, pose: P({ pelvisY: 46, bodyRot: 30, torso: 30, head: 30, shL: 40, elL: 80, shR: 44, elR: 76, sword: -150, hipL: 60, shinL: -70, hipR: 44, shinR: -50 }), ease: easeInCubic },
  { t: 6 * F, pose: P({ pelvisY: 32, bodyRot: 150, torso: 34, head: 40, shL: 55, elL: 105, shR: 60, elR: 100, sword: -170, hipL: 95, shinL: -130, hipR: 80, shinR: -110 }), ease: easeInOutCubic },
  { t: 13 * F, pose: P({ pelvisY: 30, bodyRot: 260, torso: 34, head: 40, shL: 55, elL: 105, shR: 60, elR: 100, sword: -170, hipL: 95, shinL: -130, hipR: 80, shinR: -110 }), ease: easeInOutCubic },
  { t: 19 * F, pose: P({ pelvisY: 36, bodyRot: 342, torso: 30, head: 26, shL: 46, elL: 90, shR: 50, elR: 84, sword: -160, hipL: 80, shinL: -100, hipR: 60, shinR: -84 }), ease: easeInOutCubic },
  { t: 22 * F, pose: P({ pelvisY: 52, bodyRot: 360, torso: 22, head: 8, shL: 26, elL: 40, shR: 20, elR: 34, sword: -120, hipL: 55, shinL: -30, hipR: -40, shinR: -70 }), ease: easeOutCubic },
  { t: 26 * F, pose: P({ bodyRot: 360, pelvisY: 70, torso: 12 }), ease: easeInOutCubic },
];

// BACKSTEP — 16f grounded hop back, ~66px. The spacing verb.
const BSTEP_T = 16 * F, BSTEP_DIST = 66;
const BSTEP: Key[] = [
  { t: 0, pose: P({ pelvisY: 72, torso: -4, head: 0, hipL: -10, shinL: -30, hipR: 25, shinR: 5, shL: 4, elL: 30, shR: 20, elR: 40, sword: -30 }), ease: easeOutCubic },
  { t: 6 * F, pose: P({ pelvisY: 78, torso: -10, head: -2, hipL: 16, shinL: -20, hipR: 30, shinR: -6, shL: 10, elL: 36, shR: 24, elR: 44, sword: -34 }), ease: easeInOutCubic },
  { t: 12 * F, pose: P({ pelvisY: 68, torso: -4, head: -1, hipL: 18, shinL: -6, hipR: -30, shinR: -50, shL: 0, elL: 24, shR: 18, elR: 30, sword: -22 }), ease: easeOutCubic },
  { t: 16 * F, pose: IDLE, ease: easeInOutCubic },
];

// HUSH-PARRY (§11) — 1f startup, 8f window, whiff recovery to 33f (exposed).
// The catch is a SMOTHER: cloak forearm wraps the strike; no spark, ever.
const PARRY_W0 = 1 * F, PARRY_W1 = 9 * F, PARRY_T = 33 * F;
const PARRY: Key[] = [
  { t: 0, pose: P({ pelvisX: -4, pelvisY: 70, torso: -6, head: 0, shL: 40, elL: 60, shR: 30, elR: 70, sword: -110, hipL: 18, shinL: -8, hipR: -24, shinR: -38 }), ease: easeOutCubic },
  { t: 2 * F, pose: P({ pelvisX: -5, pelvisY: 70, torso: -4, head: -4, shL: 66, elL: 104, shR: 46, elR: 88, sword: -170, hipL: 18, shinL: -8, hipR: -24, shinR: -38 }), ease: easeOutCubic },
  { t: 18 * F, pose: P({ pelvisX: -5, pelvisY: 70, torso: -4, head: -4, shL: 64, elL: 100, shR: 44, elR: 86, sword: -168, hipL: 18, shinL: -8, hipR: -24, shinR: -38 }), ease: easeInOutCubic },
  { t: 33 * F, pose: IDLE, ease: easeInOutCubic },
];
const PARRY_CATCH = PARRY[1].pose;

// GUARD — 4f raise · 6f lower. Blade vertical, cloak forearm leading, braced.
const GUARD_POSE = P({
  pelvisX: -4, pelvisY: 70, torso: -8, head: 2,
  shL: 58, elL: 96, shR: 40, elR: 95, sword: -125,
  hipL: 20, shinL: -8, hipR: -26, shinR: -40,
});

// CHARGE — blade cocked high behind the shoulder; trembles as it fills.
// The head stays UP: a knight charging a blow watches what he means to end.
const CHARGE_POSE = P({
  pelvisX: -12, pelvisY: 66, torso: -22, head: -8,
  shR: -155, elR: 40, sword: -20, shL: 36, elL: 30,
  hipL: 18, shinL: -6, hipR: -24, shinR: -34,
});

// SKID — the sprint's 6f settle: plant, dust, cloak overtakes and falls back.
const SKID_POSE = P({
  pelvisX: -6, pelvisY: 66, torso: 16, head: -4,
  shL: 18, elL: 30, shR: 24, elR: 36, sword: -26,
  hipL: 46, shinL: 18, hipR: -36, shinR: -64,
});

// COLLAPSE — knees buckle, forward fall, sprawled. Wounds did this.
const DOWNED = P({
  pelvisX: 0, pelvisY: 12, bodyRot: 78, torso: 26, head: 24,
  shL: -20, elL: 30, shR: 62, elR: 30, sword: -60,
  hipL: 14, shinL: -8, hipR: -20, shinR: -34,
});
const COLLAPSE: Key[] = [
  { t: 0, pose: P({ pelvisX: -14, pelvisY: 62, torso: -20, head: -18, shL: -30, elL: 46, shR: -20, elR: 40, sword: -40, hipL: 14, shinL: -6, hipR: -22, shinR: -30 }), ease: easeOutCubic },
  { t: 0.25, pose: P({ pelvisY: 38, torso: 18, head: 8, shL: 10, elL: 34, shR: 24, elR: 30, sword: -55, hipL: 70, shinL: -110, hipR: 60, shinR: -100 }), ease: easeInCubic },
  { t: 0.55, pose: P({ pelvisY: 20, bodyRot: 55, torso: 26, head: 18, shL: 40, elL: 30, shR: 50, elR: 20, sword: -60, hipL: 30, shinL: -40, hipR: 10, shinR: -50 }), ease: easeInCubic },
  { t: 0.9, pose: DOWNED, ease: easeOutCubic },
];

// RISE — the revive/rally: push up, kneel, stand. Shorter than the wake —
// there is no ceremony the second time, only effort.
const RISE: Key[] = [
  { t: 0, pose: DOWNED, ease: easeInOutCubic },
  { t: 0.45, pose: P({ pelvisY: 30, bodyRot: 40, torso: 24, head: 4, shL: 30, elL: 40, shR: 44, elR: 24, sword: -50, hipL: 40, shinL: -30, hipR: 10, shinR: -60 }), ease: easeInOutCubic },
  { t: 0.85, pose: P({ pelvisY: 43, bodyRot: 5, torso: 20, head: -4, shL: 8, elL: 30, shR: 20, elR: 24, sword: -30, hipL: 62, shinL: -8, hipR: -30, shinR: -92 }), ease: easeInOutCubic },
  { t: 1.3, pose: IDLE, ease: easeOutCubic },
];

// EMBRACE — the reviver kneels and wraps arms around the fallen. Held.
const EMBRACE_POSE = P({
  pelvisY: 40, torso: 24, head: 14,
  shL: 46, elL: 60, shR: 58, elR: 70, sword: -95,
  hipL: 78, shinL: -60, hipR: -52, shinR: 40,
});

// QUIETING (§13) — plant the blade through the ink and HOLD, kneeling, until
// it settles. Two seconds, uninterruptible, tender. A vow, not a move.
const QUIET_T = 2.8;
const QUIETING: Key[] = [
  { t: 0, pose: IDLE, ease: easeInOutCubic },
  { t: 0.35, pose: P({ pelvisY: 76, torso: 6, head: -6, shR: 58, elR: 34, sword: -87, shL: 44, elL: 52, hipL: 10, shinL: -2, hipR: -14, shinR: -18 }), ease: easeInOutCubic },
  { t: 0.6, pose: P({ pelvisY: 48, torso: 20, head: 10, shR: 34, elR: 26, sword: -55, shL: 30, elL: 40, hipL: 50, shinL: -20, hipR: -26, shinR: -80 }), ease: easeInCubic },
  { t: 0.8, pose: P({ pelvisY: 40, torso: 14, head: 24, shR: 28, elR: 28, sword: -52, shL: 26, elL: 36, hipL: 62, shinL: -8, hipR: -30, shinR: -92 }), ease: easeOutCubic },
  { t: 2.45, pose: P({ pelvisY: 40, torso: 15, head: 25, shR: 28, elR: 28, sword: -52, shL: 26, elL: 36, hipL: 62, shinL: -8, hipR: -30, shinR: -92 }), ease: easeInOutCubic },
  { t: 2.8, pose: IDLE, ease: easeInOutCubic },
];

export function sampleTimeline(keys: Key[], t: number): Pose {
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
export function legIK(hipX: number, hipY: number, footX: number, footY: number): [number, number] {
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

export type KnightState =
  | "prelude" | "wake" | "idle" | "walk" | "sprint" | "skid"
  | "roll" | "backstep" | "act" | "charge" | "guard" | "parry"
  | "quieting" | "collapse" | "crawl" | "rise" | "embrace"
  | "hit" | "sit";

// what a player (or the QA harness) asks of the knight this frame
export interface Intents {
  axis: number; axisZ: number; sprint: boolean;
  attackTap: boolean;
  heavyTap: boolean; heavyHeld: boolean;
  roll: boolean;
  guardHeld: boolean;
  parryTap: boolean;
}
export const NO_INTENT: Intents = {
  axis: 0, axisZ: 0, sprint: false, attackTap: false,
  heavyTap: false, heavyHeld: false, roll: false,
  guardHeld: false, parryTap: false,
};

// seated at the fire — legs folded, sword across the lap, head toward the flame
const SIT = P({
  pelvisY: 33, torso: 18, head: 10,
  shL: 14, elL: 44, shR: 26, elR: 50, sword: -84,
  hipL: 82, shinL: -64, hipR: -58, shinR: 48,
});

const WALK_SPEED = 150, SPRINT_SPEED = 268, CRAWL_SPEED = 26, GUARD_SHUFFLE = 40;

export class Knight {
  x: number; facing = 1;
  z = 0;                         // depth in the band (M&C §18); +z toward the reader
  state: KnightState = "prelude";
  stateT = 0;
  cur: Pose = { ...LYING };
  walkPhase = 0;
  vx = 0; // knockback impulse velocity
  boundsL = 320; boundsR = 2100; // set per scene by the journey
  bandN = BAND_NEAR; bandF = BAND_FAR; // the scene's designed depth band
  lightX = 1150;                 // key-light x — shadows point away (set per scene)
  wounds = 0;                    // 3 = collapse; read as breath + stance, never a bar
  reviveT = 0;                   // filled by a partner's embrace
  parryRipT = 0;                 // riposte window after a successful hush-parry
  lastParryT = -1e9;             // world-time of last catch (dual-parry detection)
  noise = 0; noiseT = -1e9;      // ATTENTION-IS-NOISE hooks (Phase 2b reads these)
  private lastStepSign = 0;
  private cloak: CNode[] = [];
  private actFired = false;
  private act: Move | null = null;
  private chainBuf = 0;          // buffered attack tap (s remaining)
  private rollBuf = 0;           // buffered roll tap
  private rollAxisBuf = 0;       // direction held AT the tap (intent fidelity)
  private rollAxisZBuf = 0;      // depth held at the tap — the circling verb (§18)
  private depthMoveT = 0;        // recently walking the band → hurt z-band narrows
  private heavyCharge = 0;       // 0..1 at release
  private parryHold = 0;         // the held breath after a catch
  private guardJolt = 0;         // chip-jolt timer while guarding
  private sprintT = 0;
  private crawlPhase = 0;
  private soloDownT = 0;         // provisional: solo knights rally after a while
  private moveX0 = 0;            // scripted displacement origin (roll/backstep)
  private moveZ0 = 0;
  private moveDir = 1;           // x-component of the scripted direction (normalized)
  private moveDirZ = 0;          // z-component — a roll can circle (§18)
  private tNow = 0;
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
    this.x = x; this.z = 0; this.facing = 1; this.state = "prelude"; this.stateT = 0;
    this.cur = { ...LYING }; this.vx = 0; this.wakeDone = false;
    this.wounds = 0; this.reviveT = 0; this.act = null;
  }

  // ---- the depth band (M&C §18) ----
  groundY() { return GROUND_Y + this.z * Z_SLOPE; }
  zScale() { return 1 + this.z * Z_SCALE; }
  // generous to hit, honest to dodge: the hurt band narrows while walking the band
  hurtZ() { return this.depthMoveT > 0 ? 15 : 24; }

  // ---- state queries ----
  get sitting() { return this.state === "sit"; }
  get sitSettled() { return this.state === "sit" && this.stateT > 1.1; }
  get downed() { return this.state === "crawl"; }
  get sprinting() { return this.state === "sprint"; }
  get invulnerable() { return this.state === "roll" && this.stateT >= ROLL_IV0 && this.stateT <= ROLL_IV1; }
  private get parryOpen() { return this.state === "parry" && this.parryHold <= 0 && this.stateT >= PARRY_W0 && this.stateT <= PARRY_W1; }
  private mobile() {
    return this.state === "idle" || this.state === "walk" || this.state === "sprint" || this.state === "skid";
  }
  private busy() {
    return !(this.mobile() || this.state === "guard" || this.state === "sit");
  }

  // ---- verb entries ----
  tryAttack() { this.chainBuf = 0.18; } // legacy API — consumed like a buffered tap
  private startAct(m: Move, charge = 0) {
    this.state = "act"; this.stateT = 0; this.act = m;
    this.actFired = false; this.chainBuf = 0; this.heavyCharge = charge;
    this.noise = m.loud; this.noiseT = this.tNow;
  }
  private startRollOrBackstep(axisNow: number, axisZNow: number, fx: Fx) {
    this.rollBuf = 0;
    // the direction held at the TAP wins; the stick's current whisper is the fallback
    const buffered = Math.hypot(this.rollAxisBuf, this.rollAxisZBuf) > 0.2;
    const ax = buffered ? this.rollAxisBuf : axisNow;
    const az = buffered ? this.rollAxisZBuf : axisZNow;
    this.rollAxisBuf = 0; this.rollAxisZBuf = 0;
    const mag = Math.hypot(ax, az);
    if (mag > 0.2) {
      // the circling verb: the roll aims along the held vector, same fixed distance,
      // same honest i-frames — depth costs nothing and hides nothing (§18)
      if (Math.abs(ax) > 0.2) this.facing = ax > 0 ? 1 : -1;
      this.state = "roll"; this.stateT = 0;
      this.moveX0 = this.x; this.moveZ0 = this.z;
      this.moveDir = ax / mag; this.moveDirZ = az / mag;
      this.noise = 2.5; this.noiseT = this.tNow;
      // the cloak wraps into the tumble
      for (const n of this.cloak) { n.px = n.x = lerp(n.x, this.x, 0.55); n.py = n.y = lerp(n.y, this.groundY() - 40, 0.4); }
      fx.dust(this.x, this.groundY() - 2, 4, -this.facing * 0.5);
    } else {
      // backstep stays pure retreat along the blade line — the 1D spacing verb
      this.state = "backstep"; this.stateT = 0;
      this.moveX0 = this.x; this.moveZ0 = this.z;
      this.moveDir = -this.facing; this.moveDirZ = 0;
      this.noise = 2; this.noiseT = this.tNow;
      fx.dust(this.x + this.facing * 6, this.groundY() - 2, 3, this.facing * 0.6);
    }
  }
  startQuieting(): boolean {
    if (this.busy() && this.state !== "guard") return false;
    this.state = "quieting"; this.stateT = 0;
    return true;
  }
  startRise(soloRally = false) {
    if (this.state !== "crawl" && this.state !== "collapse") return;
    this.state = "rise"; this.stateT = 0; this.reviveT = 0;
    this.wounds = soloRally ? 2 : 1; // rallied alone = still ragged
  }
  // the same held gesture as the fire-rest, aimed at a fallen partner
  private embraceTX = 0;
  setEmbrace(active: boolean, faceX: number) {
    if (active && this.mobile()) {
      this.state = "embrace"; this.stateT = 0;
      this.facing = faceX >= this.x ? 1 : -1;
      this.embraceTX = faceX - this.facing * 46; // kneel at the shoulder, not on top
    } else if (!active && this.state === "embrace") {
      this.state = "idle"; this.stateT = 0;
    }
  }
  // the rest ritual: caller decides eligibility (near a fire); any movement stands back up
  setRest(held: boolean, faceX: number) {
    if (held && (this.state === "idle" || this.state === "walk")) {
      this.state = "sit"; this.stateT = 0;
      this.facing = faceX >= this.x ? 1 : -1;
    } else if (!held && this.state === "sit") {
      this.state = "idle"; this.stateT = 0;
    }
  }

  // ATTENTION IS NOISE (§14): the world hears a decaying envelope of the last act
  loudness(tNow: number): number {
    const base = this.state === "sprint" ? 2 : this.state === "walk" ? 1
      : this.state === "crawl" ? 0.4 : 0.15;
    const impulse = this.noise * Math.exp(-(tNow - this.noiseT) / 1.4);
    return Math.max(base, impulse);
  }

  tryHit(fx: Fx, heavy = false): "immune" | "parried" | "blocked" | "hit" | "downed" {
    if (this.state === "wake" || this.state === "prelude" || this.state === "rise") return "immune";
    if (this.state === "collapse" || this.state === "crawl") return "immune";
    if (this.state === "quieting") return "immune"; // a vow is kept (§13)
    if (this.invulnerable) return "immune";         // honest i-frames (ER law)
    // the hush-parry catch — the strike is smothered, the world holds its breath
    if (this.parryOpen) {
      this.parryHold = 0.3;
      this.lastParryT = this.tNow;
      this.noise = 0.2; this.noiseT = this.tNow; // a parry is the QUIET answer
      fx.stall(0.3);
      return "parried";
    }
    // guard chips but holds against light blows; heavies break through
    if (this.state === "guard" && !heavy) {
      this.vx = -this.facing * 90;
      this.guardJolt = 0.12;
      this.hitFlash = 0.06;
      fx.dust(this.x + this.facing * 24, this.groundY() - 34, 3, this.facing * 0.4);
      return "blocked";
    }
    this.wounds++;
    this.hitFlash = 0.14;
    this.vx = -this.facing * 240;
    // §19 buffer honesty: a landed hit CLEARS every buffered intent —
    // no roll from beyond the grave (the Elden Ring lesson, research canon)
    this.chainBuf = 0; this.rollBuf = 0; this.rollAxisBuf = 0; this.rollAxisZBuf = 0;
    for (const n of this.cloak) { n.px -= this.facing * 7; } // whip
    fx.dust(this.x, this.groundY() - 2, 6, -this.facing);
    if (this.wounds >= 3) {
      this.state = "collapse"; this.stateT = 0; this.soloDownT = 0;
      return "downed";
    }
    this.state = "hit"; this.stateT = 0;
    return "hit";
  }

  update(dt: number, ii: Intents, t: number, fx: Fx) {
    this.tNow = t;
    this.stateT += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.parryRipT = Math.max(0, this.parryRipT - dt);
    this.guardJolt = Math.max(0, this.guardJolt - dt);
    this.chainBuf = Math.max(0, this.chainBuf - dt);
    this.rollBuf = Math.max(0, this.rollBuf - dt);
    if (ii.attackTap) this.chainBuf = 0.18;
    if (ii.roll) { this.rollBuf = 0.15; this.rollAxisBuf = ii.axis; this.rollAxisZBuf = ii.axisZ; }

    // ---- verb starts from mobile/guard states ----
    if (this.mobile() || this.state === "guard") {
      if (this.rollBuf > 0) {
        this.startRollOrBackstep(ii.axis, ii.axisZ, fx);
      } else if (ii.heavyTap && this.state !== "guard") {
        this.state = "charge"; this.stateT = 0;
        // facing locks toward the stick if it speaks, else stays
        if (Math.abs(ii.axis) > 0.2) this.facing = ii.axis > 0 ? 1 : -1;
      } else if (this.chainBuf > 0) {
        if (Math.abs(ii.axis) > 0.2) this.facing = ii.axis > 0 ? 1 : -1;
        this.startAct(this.state === "sprint" ? RUNATK : L1);
        if (this.act === RUNATK) this.vx = SPRINT_SPEED * this.facing * 0.5;
      } else if (ii.parryTap && this.state !== "guard") {
        this.state = "parry"; this.stateT = 0; this.parryHold = 0;
      } else if (ii.guardHeld && this.state !== "guard") {
        this.state = "guard"; this.stateT = 0;
      }
    }

    // ---- locomotion (walk / sprint / guard shuffle; moving stands a sitter up) ----
    // §18: movement is a vector across the band; facing only ever comes from x —
    // the knights are side-view creatures, walking the band never flips them
    const moveMag = Math.hypot(ii.axis, ii.axisZ);
    const inv = moveMag > 1 ? 1 / moveMag : 1; // diagonals honest, cardinal speeds kept
    if (this.mobile()) {
      if (moveMag > 0.2) {
        const wantSprint = ii.sprint;
        if (wantSprint && this.state !== "sprint") { this.state = "sprint"; this.stateT = 0; this.sprintT = 0; this.noise = 2; this.noiseT = t; }
        if (!wantSprint && this.state === "sprint") { this.state = "skid"; this.stateT = 0; fx.dust(this.x, this.groundY() - 2, 6, this.facing); }
        if (this.state !== "skid") {
          if (this.state !== "sprint") this.state = "walk";
          if (Math.abs(ii.axis) > 0.2) this.facing = ii.axis > 0 ? 1 : -1;
          let speed = WALK_SPEED;
          if (this.state === "sprint") {
            this.sprintT += dt;
            // §4 ramp: 12 frames of true acceleration — the first strides DIG
            speed = lerp(WALK_SPEED, SPRINT_SPEED, clamp(this.sprintT / (12 * F), 0, 1));
          }
          this.x += speed * ii.axis * inv * dt;
          this.z += speed * DEPTH_SPEED * ii.axisZ * inv * dt;
          this.walkPhase += ((speed * Math.min(moveMag, 1)) / (this.state === "sprint" ? 31 : 26)) * dt;
          this.depthMoveT = Math.abs(ii.axisZ) > 0.25 ? 0.12 : Math.max(0, this.depthMoveT - dt);
        }
      } else if (this.state === "walk") {
        this.state = "idle"; this.stateT = 0;
      } else if (this.state === "sprint") {
        // §4: stopping takes 6 frames of settle — plant, skid-dust, cloak overtakes
        this.state = "skid"; this.stateT = 0;
        fx.dust(this.x + this.facing * 10, this.groundY() - 2, 7, this.facing);
      }
      if (moveMag <= 0.2) this.depthMoveT = Math.max(0, this.depthMoveT - dt);
      if (this.state === "skid" && this.stateT >= 6 * F) { this.state = "idle"; this.stateT = 0; }
    } else if (this.state === "guard" && moveMag > 0.2) {
      // guarded shuffle — facing stays locked
      this.x += GUARD_SHUFFLE * ii.axis * inv * dt;
      this.z += GUARD_SHUFFLE * DEPTH_SPEED * ii.axisZ * inv * dt;
    } else if (this.state === "crawl" && moveMag > 0.2) {
      this.x += CRAWL_SPEED * ii.axis * inv * dt;
      this.z += CRAWL_SPEED * DEPTH_SPEED * ii.axisZ * inv * dt;
      this.crawlPhase += dt * 2.2;
    }
    this.x += this.vx * dt;
    this.vx = damp(this.vx, 0, 9, dt);

    // scripted displacement — roll/backstep distances are FIXED (spacing honesty)
    if (this.state === "roll") {
      const u = easeInOutCubic(clamp(this.stateT / ROLL_T, 0, 1));
      this.x = this.moveX0 + ROLL_DIST * u * this.moveDir;
      this.z = this.moveZ0 + ROLL_DIST * u * this.moveDirZ;
    } else if (this.state === "backstep") {
      this.x = this.moveX0 + BSTEP_DIST * easeOutCubic(clamp(this.stateT / BSTEP_T, 0, 1)) * this.moveDir;
    }
    this.x = clamp(this.x, this.boundsL, this.boundsR);
    this.z = clamp(this.z, this.bandN, this.bandF);

    // fatigue reads as slower recoveries — never a bar (§8)
    const fatigue = this.wounds >= 2 ? 0.86 : 1;

    // ---- pose target ----
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
      case "act": {
        const m = this.act!;
        target = sampleTimeline(m.keys, this.stateT);
        rate = 26 * fatigue;
        // momentum through the strike (whiffed heavies pull a half-step — §9)
        if (this.stateT >= m.impact && this.stateT <= m.strikeEnd + 0.05) {
          const lungeV = (m.lunge * (1 + this.heavyCharge * 0.6)) / (m.strikeEnd + 0.05 - m.impact);
          this.x = clamp(this.x + lungeV * this.facing * dt, this.boundsL, this.boundsR);
        }
        if (!this.actFired && this.stateT >= m.impact) {
          this.actFired = true;
          const n = m.dust + Math.round(this.heavyCharge * 8);
          fx.dust(this.x + this.facing * 66, this.groundY() - 8, n, this.facing);
        }
        // the cancel window is a contract (§10)
        if (this.stateT >= m.cancelFrom) {
          if (this.rollBuf > 0) this.startRollOrBackstep(ii.axis, ii.axisZ, fx);
          else if (this.chainBuf > 0 && m.chain) this.startAct(MOVES[m.chain]);
        }
        if (this.state === "act" && this.stateT >= m.total) {
          this.state = "idle"; this.stateT = 0; this.act = null;
        }
        break;
      }
      case "charge": {
        target = { ...CHARGE_POSE };
        // the blade fills: 10f–45f of hold (§10); trembling scales with charge
        const charge = clamp((this.stateT - 10 * F) / (35 * F), 0, 1);
        const tremor = noise1(t * 13) * rad(1.6) * (0.3 + charge);
        target.torso += tremor; target.shR += tremor * 1.4;
        target.pelvisY -= charge * 2;
        rate = 14;
        if (!ii.heavyHeld) this.startAct(HEAVY, charge);
        break;
      }
      case "roll": {
        target = sampleTimeline(ROLL, this.stateT);
        rate = 30; // the somersault must track its own rotation
        if (this.stateT >= ROLL_T) {
          if (this.chainBuf > 0) this.startAct(ROLLATK);
          else { this.state = "idle"; this.stateT = 0; }
        }
        break;
      }
      case "backstep": {
        target = sampleTimeline(BSTEP, this.stateT);
        rate = 26;
        if (this.chainBuf > 0 && this.stateT >= 9 * F) this.startAct(POKE);
        else if (this.stateT >= BSTEP_T) { this.state = "idle"; this.stateT = 0; }
        break;
      }
      case "guard": {
        target = { ...GUARD_POSE };
        if (this.guardJolt > 0) { // the chip: braced, jolted, holding
          target.torso -= rad(9) * (this.guardJolt / 0.12);
          target.pelvisX -= 4 * (this.guardJolt / 0.12);
        }
        rate = this.stateT < 4 * F ? 26 : 10; // 4f raise, then settled
        if (!ii.guardHeld) { this.state = "idle"; this.stateT = 0; rate = 10; } // 6f lower via blend
        break;
      }
      case "parry": {
        if (this.parryHold > 0) {
          // THE HELD BREATH — the catch holds while the world stops (§11)
          this.parryHold -= dt;
          target = { ...PARRY_CATCH };
          rate = 24;
          if (this.parryHold <= 0) {
            this.parryRipT = 0.8; // the riposte window opens as breath returns
            this.state = ii.guardHeld ? "guard" : "idle"; this.stateT = 0;
          }
        } else {
          target = sampleTimeline(PARRY, this.stateT);
          rate = 26;
          if (this.stateT >= PARRY_T) { this.state = ii.guardHeld ? "guard" : "idle"; this.stateT = 0; }
          else if (this.stateT > PARRY_W1 && ii.guardHeld) { this.state = "guard"; this.stateT = 0; } // melt to guard
        }
        break;
      }
      case "quieting": {
        target = sampleTimeline(QUIETING, this.stateT);
        // kneeling breath while the ink settles beneath the blade
        if (this.stateT > 0.8 && this.stateT < 2.45) {
          target = { ...target };
          target.torso += rad(Math.sin(t * 1.6) * 1.1);
          target.head += rad(Math.sin(t * 1.6 + 0.5) * 0.8);
        }
        rate = 16;
        if (this.stateT === 0.6 || (this.stateT >= 0.6 && this.stateT - dt < 0.6)) {
          fx.dust(this.x + this.facing * 30, this.groundY() - 2, 5, this.facing * 0.3);
        }
        if (this.stateT >= QUIET_T) { this.state = "idle"; this.stateT = 0; }
        break;
      }
      case "collapse": {
        target = sampleTimeline(COLLAPSE, this.stateT);
        rate = 20;
        if (this.stateT >= COLLAPSE[COLLAPSE.length - 1].t) { this.state = "crawl"; this.stateT = 0; }
        break;
      }
      case "crawl": {
        // downed: dragging forward on one arm, breath ragged
        target = { ...DOWNED };
        const drag = Math.abs(ii.axis) > 0.2 ? 1 : 0;
        target.shR += rad(Math.sin(this.crawlPhase) * 24 * drag);
        target.elR += rad(Math.max(0, Math.cos(this.crawlPhase)) * 18 * drag);
        target.pelvisX += Math.sin(this.crawlPhase) * 2 * drag;
        target.torso += rad(Math.sin(t * 2.6) * 1.6); // heaving breath
        target.head += rad(Math.sin(t * 2.6 + 0.4) * 2 - 6);
        rate = 8;
        // embrace-revive fills reviveT (main.ts drives it); alone, the knight rallies
        this.soloDownT += dt;
        if (this.reviveT >= 1.2) this.startRise(false);
        else if (this.soloDownT > 6) this.startRise(true); // provisional until 2b death rules
        break;
      }
      case "rise": {
        target = sampleTimeline(RISE, this.stateT);
        rate = 18;
        if (this.stateT >= RISE[RISE.length - 1].t) { this.state = "idle"; this.stateT = 0; }
        break;
      }
      case "embrace": {
        target = { ...EMBRACE_POSE };
        target.torso += rad(Math.sin(t * 1.1) * 1.0);
        target.head += rad(Math.sin(t * 1.1 + 0.6) * 0.8);
        rate = 11; // kneel with purpose — the fallen shouldn't wait
        this.x = damp(this.x, this.embraceTX, 6, dt); // two figures, readable as two
        break;
      }
      case "hit": {
        target = sampleTimeline(HIT, this.stateT);
        rate = 24 * fatigue;
        if (this.stateT >= HIT[HIT.length - 1].t) { this.state = "idle"; this.stateT = 0; }
        break;
      }
      case "sit": {
        // ease down slowly (a knight in plate does not flop), then breathe by the fire
        target = { ...SIT };
        target.pelvisY += Math.sin(t * 0.85) * 1.2;
        target.torso += rad(Math.sin(t * 0.85) * 0.8);
        target.head += rad(noise1(t * 0.22) * 4);
        rate = this.stateT < 1.0 ? 5 : 9;
        if (this.stateT > 2 && this.wounds > 0) this.wounds = 0; // the fire mends
        break;
      }
      case "skid": {
        target = SKID_POSE;
        rate = 24;
        break;
      }
      case "sprint": {
        target = this.sprintPose();
        rate = 18;
        const s = Math.sign(Math.sin(this.walkPhase));
        if (s !== this.lastStepSign) {
          this.lastStepSign = s;
          fx.dust(this.x - this.facing * 10, this.groundY() - 2, 5, -this.facing * 0.6);
        }
        break;
      }
      case "walk": {
        target = this.walkPose();
        rate = 16;
        // footstep dust on plant
        const s = Math.sign(Math.sin(this.walkPhase));
        if (s !== this.lastStepSign) {
          this.lastStepSign = s;
          fx.dust(this.x - this.facing * 8, this.groundY() - 2, 3, -this.facing * 0.4);
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
    // wounded knights breathe harder and stand heavier — readability, never a bar
    const hurt = this.wounds >= 2;
    const freq = hurt ? 1.65 : 1.15, amp = hurt ? 2.3 : 1.5;
    p.pelvisY += Math.sin(t * freq) * amp - (hurt ? 3 : 0);
    p.torso += rad(Math.sin(t * freq) * (hurt ? 1.4 : 0.9) + (hurt ? 4 : 0));
    p.head += rad(noise1(t * 0.35) * 6 - (hurt ? 6 : 0));
    p.shL += rad(Math.sin(t * freq + 0.6) * 1.5);
    p.shR += rad(Math.sin(t * freq + 0.9) * 1.2);
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

  // §4: powerful, never floaty — deep lean, digging strides, sword trailing
  private sprintPose(): Pose {
    const p = { ...IDLE };
    const ph = this.walkPhase;
    const ramp = clamp(this.sprintT / (12 * F), 0, 1); // the lean arrives with the speed
    p.pelvisY = 66 + Math.sin(ph * 2) * 3.4;
    p.torso = rad(9 + 13 * ramp + Math.sin(ph * 2) * 1.6);
    p.head = rad(-3);
    p.shL = rad(30 * Math.sin(ph) - 2);
    p.elL = rad(22 + Math.max(0, 16 * Math.sin(ph)));
    p.shR = rad(14 * Math.sin(ph + Math.PI) + 6);
    p.elR = rad(26);
    p.sword = rad(-30); // the blade trails — haste is a wakeful thing
    const stride = 34 + 16 * ramp, lift = 15 + 7 * ramp;
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
        if (p1.y > this.groundY() - 2) p1.y = this.groundY() - 2; // pools on ground when lying
      }
    }
  }
  private vxEstimate() {
    if (this.state === "walk") return WALK_SPEED * this.facing;
    if (this.state === "sprint") return SPRINT_SPEED * this.facing; // full trail (§4)
    if (this.state === "roll") return 300 * this.moveDir;
    return this.vx;
  }

  // ---- FK ----
  private anchors() {
    // cloak attach point in WORLD space (cloak sim is world-space)
    const pts = this.compute();
    const s = this.zScale();
    return { cloakX: this.x + pts.cloak[0] * this.facing * s, cloakY: this.groundY() + pts.cloak[1] * s };
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
    const s = this.zScale();
    ctx.save();
    // §18: the band offsets the feet line and breathes the scale, anchored at the feet
    ctx.translate(this.x, this.groundY());
    ctx.scale(this.facing * s, s);

    // long shadow thrown away from the sun (cinematic key light)
    const lowY = Math.max(p.ftF[1], p.ftN[1], p.pel[1] + 8);
    const feetX = (p.ftF[0] + p.ftN[0]) / 2;
    const shadowDir = (this.x >= this.lightX ? 1 : -1) * this.facing; // world dir → local
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
    const s = this.zScale();
    return [this.x + p.tip[0] * this.facing * s, this.groundY() + p.tip[1] * s];
  }
  swordGuardWorld(): [number, number] {
    const p = this.compute();
    const s = this.zScale();
    return [this.x + p.guard[0] * this.facing * s, this.groundY() + p.guard[1] * s];
  }
  attackSmearActive(): boolean {
    if (this.state !== "act" || !this.act) return false;
    return this.stateT >= this.act.impact - F && this.stateT <= this.act.strikeEnd + 2 * F;
  }
  // fires EXACTLY ONCE per act, at the strike frame — main.ts resolves the hit
  private strikeConsumed = false;
  strikeEvent(): { x: number; z: number; zTol: number; reach: number; heavy: boolean; ring: boolean; loud: number; stop: number } | null {
    if (this.state !== "act" || !this.act) { this.strikeConsumed = false; return null; }
    if (this.strikeConsumed || this.stateT < this.act.impact) return null;
    this.strikeConsumed = true;
    const heavy = this.act === MOVES.HEAVY;
    return {
      x: this.x + this.facing * (66 + this.act.lunge),
      z: this.z,
      zTol: Z_TOL, // generous to hit (§18) — the band never makes a swing feel robbed
      reach: 92,
      heavy,
      ring: heavy, // a heavy digs the earth — every whiffed heavy IS the Ring (§14 v1 form)
      loud: this.act.loud + this.heavyCharge,
      stop: this.act.stop,
    };
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
    const s = this.zScale();
    ctx.save();
    ctx.scale(this.facing / s, 1 / s); // undo flip + band scale (cloak sim is world-space)
    ctx.translate(-this.x, -this.groundY());
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
