# GYAT — the combat overhaul run (2026-07-12)

_The single front door for this run. Goal-lock, research, the must-beat bar, the plan.
Nothing here is repeated elsewhere; everything else is linked._

## The lock (confirmed by Ian, 2026-07-12)

**GOAL** — Combat in SOMNIUM feels as good as walking through it looks: a combat sandbox +
one frightening boss so satisfying you'd replay them with no story reward. "Inside the
paintings" now applies to fighting.

**NON-GOALS** — No new weapon classes (one longsword, perfected). No world/chapter
expansion until sandbox + boss pass. No true 3D, no online, no gore, no UI clutter
(wounds stay breath + stance — never bars or damage numbers).

**DONE-BAR**
- Sandbox scene with training presence + full verb set: **2.75D depth movement** (circle,
  sidestep), sprint, dodge, slide, jump/vault/mantle/climb, running/sliding/jump/falling
  attacks, light chain flowing from end poses (no neutral-pose resets)
- Context camera: exploration wide / combat readable / boss pulled back, both knights framed
- Enemy roster as Stirred variants (each teaches one lesson, passes WORLD_BIBLE §0 → CANON_LOG)
- **THE FIRST AWAKE** as the one boss (= THE WATCH/FEAR/MEMORY phases, BUILD_LEDGER 3b/3c)
- 3 blind critics ≥85 in `docs/GRADES.md` · Ian's pad playtest = final word

**Scope amendment carried by this run (Ian's master prompt v2, goal-locked):** the §17
kill of "sidestep-as-verb / narrow y-band" is REVERSED by direct order — depth movement
inside designed play spaces is now in scope, plus the flagged jump verb and the authored
traversal verbs (vault/mantle/slide) at sandbox scope. M&C goes to v2.0; every other §17
kill stands.

## Source of truth map (read in this order on cold resume)
1. `SESSION_START.md` — boot
2. `BRIEF.md` — scope law · `WORLD_BIBLE.md` — meaning law · `docs/MOVEMENT_AND_COMBAT.md` — feel law (v2.0 pending)
3. `docs/BUILD_LEDGER.md` — the task mirror (resume = top unchecked item)
4. `docs/CANON_LOG.md` — every element's gate line
5. Research: `ObsidianPKM\research\somnium-combat-canon-2026-07-12.md` (this run's Phase 1 — pending)
6. Art canon: `ObsidianPKM\research\somnium-art-canon-2026-07-12.md`

## Build audit (2026-07-12, commit 40207c3 — what exists vs what the master prompt asks)

**Strong (preserve, do not rework):**
- Pose-keyframe knight rig w/ contract-data frame budgets (§10 as literal data in knight.ts)
- Full moveset 2a: L1/L2/L3 distinct cuts, charge heavy, running/rolling attacks, backstep,
  roll w/ honest i-frames, sprint, guard+chip, Hush-parry w/ world-stall, quieting,
  collapse/embrace-revive · Stirred 2b: attention-is-noise aggro, dent/glance armor language
- THE REVEAL 3a board-passed (statue→rig swap, footstep tolls, the ward)
- Painter's Camera v1: damped follow, fit-both zoom, repose, sprint widen, boss wide-lock
- Render stack: baked plates, parallax, grain/glaze/lifted blacks, 165fps headed

**Weak / missing (the run's work):**
- Movement is pure X — no depth axis anywhere (knight/shade/fx/camera/combat all 1D)
- No draw-order sorting; entity render order is hard-coded
- Light chain resets toward IDLE between swings (keys end at IDLE pose) — master prompt
  demands next-attack-from-end-pose flow
- No combat-state camera (closer framing when engaged); no depth framing
- One enemy (Stirred shade-knight); no roster teaching distinct lessons
- Boss fight itself (3b/3c) unbuilt — reveal only
- No sandbox scene for combat iteration/QA
- Traversal verbs (jump/vault/mantle/slide) still paper

## Phase plan (this run)
- [x] P0 goal-lock (Ian, 2026-07-12)
- [ ] P1 research → vault report (5 researchers + skeptic gate — RUNNING)
- [ ] P2 MUST-BEAT bar (distilled from research → table below)
- [x] P3 infra: this file; entity page refresh due at wrap
- [ ] P4 M&C v2.0 amendment + BRIEF addendum + CANON_LOG lines (fold research in)
- [ ] P5 build order: depth plumbing → sandbox scene → chain-flow rework → context camera
      → traversal verbs → enemy roster → 3b THE WATCH → 3c FEAR/MEMORY → atmosphere pass
- [ ] P6 /lookit + 3 blind critics ≥85 → docs/GRADES.md
- [ ] P7 wrap: PROJECTS.md, entity page, memory, SESSION_START refresh

## MUST-BEAT bar (P2 — distilled from the five teardowns, 2026-07-12)

Graded /10 on this project's surface. The line: **beat every reference on painted identity,
match the best on its home turf.**

| Reference | Home turf (their 10) | Their weakness on OUR surface | Somnium must… |
|---|---|---|---|
| Streets of Rage 4 | Depth-combat generosity: asym. hit tolerance, magnet repulsion, ~5-enemy cap, per-move hitstop (9) | Zero atmosphere/awe; arcade identity; camera hard-locks | MATCH its depth readability (shadow = depth UI, generous attack bands, honest hurtboxes) inside a painted world it can't touch |
| Hollow Knight | Legibility-licenses-difficulty; parallax+fog depth mood (9) | Bosses readable but never ENORMOUS; no co-op | MATCH tell-clarity; BEAT it on boss scale (contrast + heard-before-seen) |
| Shadow of the Colossus | Fear-and-mourning arc, contrast-sells-scale, aliveness via limb-lag (10) | 3D only — the 2D painted lane is EMPTY | TRANSLATE its arc: tiny knights, breathing colossus, mournful defeat. This is the open lane and the whole bet |
| God of War 1–3 | Authored per-space camera; pulled-back = all threats framed (9) | Framing serves spectacle, not painting; generic-mythic look | BEAT on composition: every repose = concept art (region anchors + Painter's Camera) |
| Cuphead | Readability-under-VFX discipline — cut any effect that hurts reads (9) | Not our genre; single-plane | MATCH the discipline: no effect ships that muddies a tell |

**The line in one sentence:** SOR4's combat honesty + Hollow Knight's tell-clarity +
SotC's scale-and-mourning + GoW's authored frame, all inside a 1978-paperback painting —
and if any one element must lose, it's never readability and never the painting.

## Decisions this run
- 2026-07-12 · THE WATCH = the minotaur (THE FIRST AWAKE) — the goal-lock's "one boss" and
  BRIEF's finale are the same creature; no scope fork.
- 2026-07-12 · Reuse existing memory system (ledger/canon log/boot file) — no parallel
  DECISIONS/BUGS files; creative decisions go to CANON_LOG, build decisions here.

## Bugs / gotchas this run
_none yet_
