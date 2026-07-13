# BUILD LEDGER — full-game run (Gate 0 closed by Ian 2026-07-12)
_The durable mirror of the session task list. Update at every commit. Resume = top unchecked item._
_Laws in force: Review Board /goal (approaches → critique → synthesize per element) ·
Feel Gate (M&C §0) + World Gate (WB §0) → CANON_LOG line · 60fps headed on the RX 6600 ·
animation-first (GEEKED/RIFT WARDEN died ignoring it) · banned list absolute._

## Phase 1 — Spine ✅ COMPLETE 2026-07-12 (proof: docs/journey/journey-v1.mp4 + full-0*.png)
- [x] Gate 0 closed in docs (CLAUDE.md rule 3, SESSION_START, CANON_LOG)
- [x] 1a. Scene system: SceneDef + journey registry, lazy bakes, per-scene glaze/light/veil/whisper(+tint)
- [x] 1b. Two-knight drop-in co-op (kbd=P1; pad claims P1 if kbd silent, else P2-join = wake-in; fit-both camera)
- [x] 1c. Scene 2 CAMPFIRE NIGHT (closed-eye moon iter 3, Loud Age castle on knoll, monument monoliths w/ carved eyes, procession lantern-line, kettle tripod)
- [x] 1d. Scene 3 BLUE-HOUR VILLAGE (vista town + kneeling sleep-tower + window constellation + star-dust river; street iter 4: real roofs, sleepers in windows, feral daisy box, garden walls, 2nd-rank layer, Warden's bracket lamp + moths)
- [x] 1e. Scene 4 GOTHIC STAIR (inverted-horizon magenta slit, far wall w/ stair ribbon + wax rivulets + slit lights, punched arcade, mold choir, kneeling keepers, weirs + barge below, updraft bats)
- [x] 1f. Scene 5 BLACK TOWER (mute Great Bell, dim Ember + breath veil, statue-ambiguous kneeling colossus, clapper trench, snowfall) + EPILOGUE (pink moon, floating tree on torn root-island, journey-complete → title loop)
- [x] 1g. Fire ritual = transition = save = drop-in (proven by real input S1→…→title); whispers per chapter; light repose (full authored anchors → 4b); END-TO-END WALK RECORDED

### Carried to Phase 4b (board notes)
- S2 flame licks refine · S3 vista window readability at spawn · S4 crest softness, keeper prominence, buttress texture · S5 colossus stays ambiguous until Phase 3 · moving procession lanterns (S2) · full Painter's-Camera anchor fields · per-scene fg tuft pairs for S4/S5

## Phase 2 — Encounters
- [x] 2a. Full moveset ✅ 2026-07-12 (proof: docs/moveset/). §10 table = literal contract data in knight.ts.
  Sprint (12f ramp/6f skid, camera widen 4%) · roll (fixed 140px, i-frames 4–18f, tuck fixed after board fail) ·
  backstep · L1 descending / L2 cross / L3 rising (coil re-authored; held cover frame) · charge heavy (head-up fix) ·
  running/rolling attacks + backstep poke (probe-proven) · guard + chip jolt · Hush-parry (1f+8f window, fx.stall
  held breath — petals freeze, wounds 0 proof — riposte window, melt-to-guard, dual-parry wired) · quieting
  (true kneel re-authored) · collapse→crawl→rise · embrace-revive (46px shoulder offset, held through rise) ·
  wounds 0–3 read as breath/stance (never a bar), fire mends · noise values stored per verb for 2b aggro.
  Inputs: J/A light (fires on PRESS), I/RT charge heavy, K/B roll+sprint-hold, L/LB guard, O·;/RB parry.
  **Carried to 2b:** hitstop application when strikes land · dual-parry live test · kick (shove) · loudness aggro
  consumes knight.noise · solo-rally 6s is provisional death rule. Traversal verbs (jump/slide/mantle) = later, per BRIEF flag.
- [x] 2b. The Stirred ✅ 2026-07-12 (proof: docs/stirred/). src/stirred.ts: shade-knights = broken
  mirrors of the player rig rendered as unstable ink (drifting edges, drips) over denting Loud Age
  plate (seams leak; dents = dark bites). ATTENTION-IS-NOISE live: knight.loudness() envelope +
  proximity whisper (<170px — plate creaks, §1) + fire ward (hearth = lawful quiet, rest ritual safe).
  Loop proven with real keys: sprint-noise stirs → 24f telegraph → parry STALLS its ink (§11) →
  lights glance off undented plate (heavy teach §13) → heavy dents → stagger → THE QUIETING = the
  tend-gesture (rest/revive/still, one family) → settles to fading ink pool → last one gone =
  2s world-breath. De-escalation: silence + distance walks it home, posture knits in sleep.
  §10 hitstop lands only on hits (input still buffers at dt=0). Ring v1 = every whiffed heavy digs
  the earth (loud 5); ravens bank toward any noise ≥3.5 (§12 punctuation). All-down death rule:
  re-dream the chapter from its start. Spawns sparse: S1 [1900] teacher · S2 [1300,1660] singles ·
  S4 [1310,1530] pair. Journey regression green WITH live encounters.
  **Carried:** crows/bats as true swoopers (currently ambient + noise-answering) · joint quieting for
  large Stirred · dual-parry + toll-sync live tests (need 2 pads → Ian) · S4 shade-vs-black-stone
  palette check (4b) · stagger posture-knit tuning after pad feel.

## Phase 2.75 — THE DEPTH AMENDMENT (master prompt v2, GYAT run 2026-07-12 — M&C §18–§22)
_Order chosen so every step is provable in the yard before it touches the journey._
- [x] 2.75a. Depth plumbing ✅ 2026-07-12 (commit 25efd8f, proof docs/depth/01–07):
      (x,z) world model + z-sorted world pass + banded rigs/cloak/shadows; SceneDef.bandMin/
      bandMax (min = away, max = toward reader); W/S + stick-Y depth axis (REST GESTURE
      MOVED: KeyE hold on kbd, pad B unchanged); diagonal-normalized locomotion; circling
      depth-roll (fixed 140px vector); generous-to-hit (Z_TOL 26) / honest-to-dodge (hurtZ
      24→15 while depth-moving); Shade lane-alignment AI (38px/s, strikes only |dz|<20) +
      kin repulsion + elliptical hearing; buffer-clear-on-hit landed early (§19).
      157fps, sim 0.10ms. Probe: scripts/depth-probe.mjs.
- [x] 2.75b. THE YARD ✅ 2026-07-12 (?yard, proof docs/depth/y1–y5): scene 90 outside the
      journey order (YARD_IDX=-1, transitions guarded), S1-slice bake, widest band ±48,
      the Bound Post (felt thud, wobble spring, knitting dents, takes hitstop), Digit1
      spawn sparring Stirred / Digit0 settle, whisper "practice, quietly". 158fps.
      Probe: scripts/yard-probe.mjs.
- [x] 2.75c. Chain flow §19 ✅ 2026-07-12 (commit 84037bb, proof docs/depth/chain-*/fin-*):
      L2/L3 first keys = previous cut's follow-through (L1_FOLLOW/L2_FOLLOW consts) — the
      sentence gathers, never resets; buffered heavy-finisher slot (heavyBuf 0.18s,
      m.heavyFrom; L3 grants it after the held cover frame only); ALL buffers clear on hit.
- [x] 2.75d. Depth combat ✅ — landed inside 2.75a (z-tol strikes, hurtZ narrowing,
      circling roll, Shade alignment + repulsion). No separate work remained.
- [x] 2.75e. Context camera §20 ✅ 2026-07-12: combatT eases in 1.5s / out 2.6s,
      zoom ×1.07 toward the fight centroid, fit-both-knights always wins; boss lock intact.
- [x] 2.75f. Jump ✅ 2026-07-12 (proof docs/depth/j1–j3): Space/pad-Y, (x,z)+h arc
      (JUMP_V 280 / GRAV 880 ≈ 45px peak, 38f), takeoff momentum carried + 0.4× air steer,
      grounded shrinking shadow = landing telegraph, airborne cut (6f gather → falling
      strike, one per flight), lands into the 6f settle; **freeJump = yard only — the
      journey's jumps stay authored** (Space in journey = nothing, probe-verified).
      REMAINING (moved to 2.75h): slide (S2 hill / S5 drifts), slide-under, vault, mantle —
      authored set-piece verbs, built with their journey geometry per §1.5.
- [x] 2.75g. Roster §21 ✅ 2026-07-12 (commit 7984a10, proof docs/roster/): all five
      variants live, lessons probe-verified (sealed wall+seam, startled sprawl, burdened
      mass+glance, crier shove+wake-kin, remembered drill+parry-kneel); KINDS table in
      stirred.ts; yard keys Digit1-6/0. INPUT LAW FIXED: roll on short-release (<180ms),
      hold-sprint never rolls (found by a failed probe sprint-past; CANON_LOG line).
- [x] 2.75h. Journey integration ✅ 2026-07-12: kinded spawns S1 teacher / S2 sealed+stirred
      / S3 startled+crier / S4 burdened+remembered; regression green (S1 sprint-exit
      wounds 0, scenes 2-6 enter clean, 165fps each). NOTE: walking blindly into the S1
      teacher = death loop (correct fiction — regression must play like a player).
      OPEN NOISE: one 404 resource on boot (favicon-level, pre-existing) — check in 4b.

## Phase 3 — THE FIRST AWAKE
- [x] 3a. THE REVEAL ✅ BOARD-PASSED 2026-07-12 (proof docs/awake/, esp. 08-the-ward = the poster)
  Built: src/awake.ts — statue mode = EXACT live replica of the board-passed bake (seed 541, drawn
  between plate layers 3/4 so the field buries his knees, breathing with the Ember); buried-floor
  tolls (walk/sprint strides + rolls/strikes ring it, fx.tollRing snow-blooms); 2 tolls → LISTEN
  (ear flick, the first thing to move in 400 years); 6 tolls or pressing within 130px → RISE
  (5 beats: stand-hold-stand-hold-stand, ~8.6s; wheels west DURING the first standing; snow-shed
  covers the statue→rig swap); WARD (palm-down off-hand: *quiet. stay.*); re-kneels if the field
  empties. Camera locks wide (0.74) through the drama. 165fps all scenes (perf-probe).
  Form iterations (board): 21-point shared contour so legs EMERGE from the drift as the gap opens
  upward; head low-slung in front of the mountain hump w/ boxy muzzle; horns wrap DOWN around the
  face; pelt = ONE wind-stripped flank patch + strays (never confetti); wax drips hang down the
  east slope inside the crest; ward arm = real two-segment mass + garland on the warding wrist;
  gripped clapper dragged east w/ ember-rimmed west edge (64px triad: hunch+horns+dragged line).
  Static harness scripts/awake-pose.mjs (__somnium.awakePose) for fast pose iteration.
- [ ] 3b. THE WATCH: warning arcs, clapper shockwaves (snow-bloom rings), the mid-fight hour-toll
  he refuses to skip; threshold = pressing past him; never pursues beyond the buried floor.
- [ ] 3c. THE FEAR (red deepens, horizontal snow, down-horns lead) + THE MEMORY (keeper's staff-drill;
  **if a knight falls he WAITS**) + death kneel (plants clapper, kneels, greys — the stair statues
  were never statues) + the world grows quieter + "the watch is kept."
  Notes: mid-rise horn morph slightly tubes (motion covers; check in 4b capture) · s5Ground hummocks
  scatter as pancakes at 0.74 zoom (soften in 4b) · journey full-0X stills mistimed vs scenes (fix script).

## Phase 4 — Polish
- [ ] 4a. Audio: lullaby (unresolved until epilogue), toll accelerando, per-scene beds, ringing blade, scored silences
- [ ] 4b. Interactive grass band, juice audit, per-scene grade pass, 60fps+ proven, full-journey capture + stills
- [ ] 4c. 3 blind critics ≥85 → docs/GRADES.md (no ship under gate), PROJECTS.md + vault + memory updates. Ian's pad playtest = final word.

## Standing notes
- Port 5131 strict; dev server may already be running — reuse.
- Capture: visible window, native 1920×1080 ONLY (sub-native throttles compositor to 28fps).
- Never shadowBlur per-entity; glows are baked sprites; plates bake once at boot.
- The Ember breath flag: §1 said "post-Gate" — built during Gate 0, Ian may veto (one draw block).
