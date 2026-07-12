# GATE 0 REPORT — knight animation spike + atmosphere benchmark
**Date:** 2026-07-12 · **Status: AWAITING IAN'S GRADE — nothing gets built past this until he passes it.**

> **Pass 4 — Ian's art-direction directive executed** (`docs/ART_DIRECTION.md`): no
> content added; the Red-Sun Field got the full atmosphere pass — 9 depth layers
> (sky/stars → 2 drifting cloud layers → ridge w/ broken watchtower → valley w/ mist +
> sun-bleed → drifting far fog → rolling midhill w/ ruined arch + tree line → drifting
> near fog → rolling ground), environmental storytelling (arch ruin, wayshrine stone,
> watchtower foreshadowing the finale), vegetation variety (stones/branches/ferns/
> seed-stalks/worn path), living atmosphere (fireflies w/ baked glow, flower petals on
> the wind, raven flights, rare shooting stars, cloud/fog drift), stronger red key
> light (grass kiss band, valley pool, long knight shadow), camera pulled back so the
> world dominates. Perf after all of it: 165fps, render 0.44–0.61ms.

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
9. (pass 5, Ian's "keep iterating" notes) Field de-uniformed: soil patches, flattened
   wind trails, tall-grass islands, dead shrubs, mossy boulders; disc made celestial
   (two-stage glow, haze veils, star-dissolve near the light, atmospheric extinction
   darkening the lower limb); distinct dark-forest band added between valley and hill
   (pines, skeletal dead trees, leaning monolith, two faint window-lights); second
   tiny ruin far west; near-frame layer (giant flowers, tall blades, fallen log);
   knight shrunk (zoom 1.30 → 1.08); warm glaze pass unifies all layers.
10. (pass 5) Path read as a scar through the flowers — rerouted east to the
   wayshrine, narrowed, lightened. Cloud crossing the sun was an opaque bite —
   made translucent. Corner canopy cut: invisible under the vignette (an unseen
   element isn't "intentionally placed").
11. (perf hunt) Recorded fps ≠ game fps on this box: sub-native viewports throttle
   Chromium's compositor to ~28fps (native 1920×1080 runs 165 — proof in
   `scripts/diag-fps2.mjs`); in-page MediaRecorder drops frames AND compresses
   timestamps (fast-motion lie). Final pipeline: native-res recordVideo, wall-true
   timing, game at 165fps throughout, honest fps read from `window.__perf` only.
12. (iteration 3, vs Ian's benchmark board — all five gaps worked in priority order)
   **Sky/cloud drama:** painterly `cloudMass` builder (52 low-alpha bulk dabs +
   billow domes + crimson under-lit base keyed to sun distance); banked masses
   across the upper sky, three massive masses behind the disc, billows clipping
   both limbs, four soft slivers crossing the face, light shafts fanning off the
   rim, horizon bloom; both drifting cloud layers rebuilt on the same builder.
   **Field density:** 6400 grass dabs in a 6-color warm palette (olive/brown/rust
   minorities), dusty ground swaths, 245 more readable daisies full-width + a west
   drift, thorn bushes with barbs, more stones/branches/seed-heads, wider red kiss.
   **Haze separation:** glowing warm air band behind every silhouette crest (ridge,
   valley, forest, midhill — sun-column boosted), fog layers +50% alpha, warmer;
   ridge colors lifted off true black. **Ruined tower** on its own mound at the
   eastern midhill roll, haze pool behind it, two kept-lit warm windows.
   **Thorn sentinel:** new parallax-1.12 layer, gnarled tapered-bezier limbs.
   **Near frame:** corner brambles + baked soft-focus blur (painted DOF).
13. (iteration 3 QA, caught by LOOKING at native stills) Face-crossing wisps read
   as straight scratches → rebuilt as 3 overlapping rows of fuzzy soft-ended dabs.
   Billow dabs read as circle "bubbles" against the bright disc → 52 dabs at 0.62×
   alpha instead of 30 strong ones; bodies warmed (blue-leaning read as gray bruise).
   Thorn tree read as an invisible sapling (ink on black, floating rim whiskers) →
   trunk 54px w/ deep gnarl bulges, limbs re-anchored high against the lit sky,
   warm west veil added behind it, hot 2.4px rims, east-facing thorns burn whole.
   Perf after everything: 165fps, sim 0.15ms, render 0.82ms during action.
14. (iteration 4 — the Creative Review Board directive, 2026-07-12) **THE EMBER
   BREATHES** — World Bible §1's dormant hook implemented: an ~8.5s breath swell
   (draw-time "lighter" veil anchored to the disc + whole-frame glaze swell; the
   foreground lean now rides the breath, not a wind — Ch1 air is dead-still).
   Keeper-lights and fireflies deliberately do NOT pulse (Law 6: the Dreamer's
   light vs somebody's work). First bake measured 16.7% swing at the disc —
   too visible for "barely perceptible" — trimmed ~25%. **Ash-petals off the
   Ember** built (§4 Ch1 weather): dark flecks falling in the disc's column,
   visible only against its light. **Sky sculpted:** bank masses carry hot
   under-lit rims (form from the lit edge, never body alpha); the disc face
   de-striped (4 even wisps → 1 strong + 1 faint, odd rhythm); the face-crossing
   mass thinned back to smoke after one bake rolled it into a "bruise" (body
   0.13→0.10 — the many-and-weak law re-proven). **Thorn sentinel:** +2 mid
   limbs, hotter rims, a warm pocket behind the crown — reads whole. **Flowers
   recomposed:** ambient scatter thinned 200→120; a composed drift arcs
   wake-patch → sentinel so the eye reads knight → flowers → tree; a trickle
   climbs to the wayshrine. Tower haze pool + kept lights lifted. Perf: 165fps,
   render 0.37ms. Proof: `docs/gate0/review/{hero,breath-min,breath-max}.png`;
   `scripts/review-stills.mjs` measures the breath objectively (disc-region
   mean-R over a full cycle) at native 1080p in a visible window.
