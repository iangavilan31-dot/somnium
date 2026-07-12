# GATE 0 REPORT — knight animation spike
**Date:** 2026-07-12 · **Status: AWAITING IAN'S GRADE — nothing gets built past this until he passes it.**

## What to look at
- **Video (46s, the whole thing):** `docs/gate0/gate0.mp4` — title → wake-up in the
  flower field → idle → walk → attack ×2 → hit-react → walk left (facing flip) → perf overlay.
- **Stills:** `docs/gate0/01…11.png` — numbered in sequence order.
- **Run it live:** `npm run dev` → http://localhost:5131 (it may already be running).

## The move set delivered (all keyframe/procedural rig, no static sprites)
| Move | What to judge |
|---|---|
| Wake-up rise | lying face-down in the flowers → stir → push-up → kneel → breath-hold → rise. ~4.3s, camera pushes in from wide as he rises. The opening moment of the game. |
| Idle | breathing (pelvis+torso+shoulders), slow head look-around, cloak alive in the wind, sword tip resting near the grass |
| Walk | procedural stride with 2-bone leg IK, pelvis bob, counter-swinging arms (sword arm damped), footstep dust on plant, facing flip works both directions |
| Attack | 3-phase: anticipation coil (0.30s, weight back, blade cocked behind shoulder) → strike whip (90ms, smear trail) → follow-through settle. Impact dust. |
| Hit-react | flinch + stagger-back impulse, cloak whips forward, rim flashes hot, recover |

## Controls (live grading)
`←→/A·D` walk · `J/X` attack · `H` take a hit · `R` replay wake-up · `F1` perf overlay · gamepad: stick/d-pad + face buttons (implemented, needs a real pad to verify).

## Style checklist vs the law
- One accent hue (blood-red sun) on crushed near-black ✓ · film grain pass ✓ · lifted blacks ✓
- Massive negative space, tiny knight vs huge sun ✓ · serif whispers only, zero HUD ✓
- Banned list: no cyan, no scanlines, no microtype ✓

## Perf (headed, visible window — the honest numbers)
`fps 165 · sim 0.038ms · render 0.44ms` (`docs/gate0/perf.json`, overlay proof in still 11).
Budget headroom is enormous; 60fps bar cleared ~2.7× at the display's refresh cap.

## Honest self-assessment (not a substitute for Ian's grade)
- Strongest: wake-up sequence composition (still 02 belongs in the slide deck), walk cycle weight, cloak physics after the gravity fix.
- Weakest: the knight is still a rig drawn in code (now with painted plate bands, brush strokes, chainmail speckle, tabard folds) — if the bar is true hand-painted Osprey-plate frames, that's the named upgrade path for after the grade.
- Gamepad path untested against real hardware (Playwright drives keyboard only — real key events, no dispatchEvent).

## Iteration log (what the two QA passes caught by LOOKING)
1. Cloak read as a rigid horizontal plank — wind accel was 5× gravity (unit bug). Fixed.
2. Sun had a pale "crater band" (oversized highlight dab) — replaced with 220 subtle mottle dabs + radial core/limb grade.
3. Mountains read as triangle clipart — replaced with random-walk organic ridgeline.
4. Grain invisible at 0.16 overlay — raised to 0.26; the aged-print look now carries.
5. Every limb rim-lit = wireframe look — rims rebalanced (far limbs ~0.13, helm/torso lead).
6. Camera too far to grade animation — gameplay zoom 1.18 → 1.38.
7. (pass 3) Knight read as flat rig shapes — added painted armor texture: plate
   separation bands, axial brush strokes, chainmail speckle, tabard fold shadows.
8. (pass 3) Attack anticipation blade overlapped the helm — windup re-posed
   (arm higher/deeper behind, blade angle flattened); silhouette now clean.
