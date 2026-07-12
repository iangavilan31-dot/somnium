# SOMNIUM — wake in a world
## Goal-locked autonomous build brief · compiled 2026-07-12 · locked by Ian

---

## 1. GOAL / NON-GOALS / DONE-BAR (the lock — everything below serves this)

**GOAL** — A co-op journey Ian actually feels: two knights trekking through the painted
dark-fantasy world of the reference slides, where the animation and atmosphere are good
enough that *playing it feels like being inside the paintings* — awe first, systems second.

**NON-GOALS**
- NOT a horde survivor (CROAKDOWN owns that lane — no wave counters, no upgrade shops).
- NOT true 3D or a shader research project.
- NOT online multiplayer (local pads only in v1).
- NOT a text/menu RPG — no dialog trees, no stat screens, no tutorial text.

**DONE-BAR**
- **Gate 0 (hard stop):** animation spike — one knight (idle / walk / attack / hit-react
  / wake-up rise) inside one painted slice of Scene 1, grain + grade pass on, headed
  60fps capture — presented to **Ian personally** for grading before ANY systems,
  levels, or menus are built. QA judge scores do not substitute (this law exists because
  GEEKED and RIFT WARDEN died ignoring it).
- **V1 done:** title → 5-scene journey playable start-to-finish with drop-in pad co-op,
  minotaur set-piece finale, 60fps headed, 3 blind adversarial critics ≥85/100 recorded
  in `docs/GRADES.md`. No deploy under the gate. Final word is Ian's pad playtest.

> **If any instruction below conflicts with the GOAL, the GOAL wins.
> Re-read the GOAL before every major decision.**

---

## 2. Visual identity (non-negotiable)

SOMNIUM has its own art direction — the **dark-fantasy-paperback** style of the reference
slides (@twistedw1zard, saved in Ian's session 2026-07-12). It overrides the house *site*
palette; the banned list stays absolute.

**The style recipe:**
- Late-70s/80s fantasy oil-painting look: Frazetta, Angus McBride (Osprey plates),
  Ted Nasmith. Visible brushwork, soft edges — never crisp vector, never pixel-art.
- **Aged-print pass over everything:** uniform film grain + slightly lifted blacks, so
  every frame reads as *scanned from a 1978 paperback*. The grain launders all synthetic
  slickness — it is load-bearing, not decoration.
- **One flat screaming accent hue per scene**, everything else crushed near-black:
  blood-red sun / ember fire / orange fields on ultramarine / magenta sky / blood sky.
- **Massive negative space. Tiny figures vs huge world.** Scale contrast = awe.
- Text (when it exists at all): quiet centered serif (Cormorant Garamond / EB Garamond),
  2–5 words, low opacity, slide-caption style.

**BANNED (absolute — Ian has killed these 3× already, never re-litigate):** neon cyan
holo HUD, scanlines, mono microtype, cursive gold slop, cluttered HUD, generic
"AI-made template" feel.

**Reference frames (burn these in):** knight collapsed in flower field under a huge red
sun · two knights at a red campfire, moonlit castle behind · blue-hour village over
orange fields · gothic stair under a blood-red sky with bats · red minotaur with
greatsword under a black tower, tiny cloaked traveler below · knight before a floating
tree, pink moon, crows.

---

## 3. Ian's taste (the customer)

Visual-first: **bosses, animation, spectacle, juice.** Animated art carries meaning —
never explanatory text. A title + one short tag max ("SOMNIUM — wake in a world").
No HUD numbers, no minimap, no tutorial prompts: health reads as posture/armor damage,
mechanics teach themselves through visual language. If a feature needs a paragraph to
explain, it's the wrong feature.

---

## 4. Autonomy contract

- Work continuously. If blocked: mock it, scaffold it, QA it, polish it, continue.
  Never idle, never ask questions mid-run. Decide everything yourself under the GOAL.
- **The one exception — Gate 0 is a HARD STOP:** build the animation spike, capture
  headed proof (video/GIF + stills into `docs/gate0/`), write `docs/GATE0_REPORT.md`,
  commit, then STOP the run and present to Ian. Nothing past Gate 0 gets built until
  Ian grades it. Do not soften this.

---

## 5. Self-QA loop

- Screenshot/record your own work repeatedly and **actually look at it** against the
  reference frames. "Does this frame belong in the slide deck?" is the test.
- Real clicks/inputs only — never `dispatchEvent` (it masked an invisible-overlay bug
  once). Gamepad paths: test with real pad where possible, else honest keyboard fallback.
- Canvas/WebGL capture via a **visible** Playwright page — hidden preview tabs freeze
  rAF and produce lies.
- **Headless canvas perf numbers are lies.** Instrument sim-ms / render-ms inside the
  game (debug overlay, off by default) and confirm 60fps headed.
- Quality-critical milestones: 3 blind adversarial critics → `docs/GRADES.md`, honest
  verdict vs the 85 gate. Do not deploy under the gate.

---

## 6. Session durability

- Maintain `SESSION_START.md` at repo root — the resume-after-/clear boot file: current
  phase, what's done, exact next step, run commands.
- Run `/project-safe-reset` before context bloats; obey `[seatbelt]` messages.
- Update PROJECTS.md status + the vault entity page (`ObsidianPKM\entities\somnium.md`)
  at milestones. Commit at every working state.

---

## 7. Build spec

### 7.1 Project facts
- Path `C:\Projects with Code\creative\somnium` · port **5131** (`--strictPort`, never
  change it) · Vite + TypeScript + raw Canvas 2D (the CROAKDOWN pipeline) · own git repo.

### 7.2 The fiction (played straight, wordlessly)
The isekai hook from the slides: going to sleep… and waking up in a world. Cold open =
title card, then Scene 1: a knight collapsed in a flower field under a red sun, rising.
Player 2 doesn't "join a lobby" — they wake up too (see 7.5). The journey ends where
dreams do: waking. The slide captions ("Imagine", "What will you do?") are the ONLY
narrative text — 2–5 serif words as chapter whispers.

### 7.3 The five scenes (journey spine — each owns ONE accent hue)
1. **Red-Sun Field** — wake-up rise, learn walk/roll by walking, first skirmish at dusk.
   Accent: blood-red sun on black mountains, white flowers below.
2. **Campfire Night** — rest beat; P2's canonical wake-in point; night ambush; moonlit
   castle silhouette. Accent: ember red in blue-green dark.
3. **Blue-Hour Village** — trek across orange fields toward lit windows; skirmishes;
   the beauty beat (biggest vista). Accent: orange fields on ultramarine night.
4. **Gothic Stair** — vertical climb, bats, waterfall chasm; tension build, tougher
   encounters. Accent: blood/magenta sky on black stone.
5. **Black Tower — THE MINOTAUR** — set-piece boss finale: huge red-furred minotaur with
   a greatsword, tiny knights below (the poster shot). Multi-phase. Then the closing
   image: the knight(s) before the floating tree under the pink moon — "And waking up" —
   cut to title. Accent: red beast in blue-white snow.

### 7.4 Rendering & tech
- **2.5D painted:** each scene = 4–6 parallax painted backdrop layers + a shallow
  playable depth band (characters move in x + a narrow y band; y maps to scale + draw
  order). Camera drifts cinematically, framing both players (clamped leash).
- **Backdrop plates are baked assets, never runtime-generated.** Author them offline —
  procedural painting scripts, ComfyUI (local SD1.5 DirectML at :8188) or gpt-image if
  available — then hand-finish with the grain + grade pass so nothing reads AI-slop.
  Plates ship as pre-graded PNGs/WebPs at 2 sizes.
- **Grain + grade are cheap composites:** pre-baked tiling grain textures (2–3 frames
  cycled slowly), one `globalCompositeOperation` grade pass per frame — never per-pixel
  loops, never runtime noise generation, never CSS filters on the canvas.
- **Perf laws:** no `shadowBlur` in per-entity loops — bake glows into cached sprites;
  sprite atlases for all animation frames; sim/render instrumented in-game; 60fps headed
  on Ian's box (RX 6600) is the bar.

### 7.5 Characters & animation (THE product — everything else is staging)
- **Knight rig:** pick the pipeline in the spike — hand-drawn frame animation (8–12+
  frames per action) or 2D bone rig with real easing; whichever hits paperback-painting
  quality in motion. Silhouette-first: readable at tiny scale against bright accents.
- **Required move set (v1):** wake-up rise (the opening — make it a moment), idle
  (breathing, cloak in wind), walk, run, light attack combo (anticipation → smear →
  follow-through), heavy attack, dodge roll (i-frames), hit-react, guard(?), collapse,
  campfire sit, revive-partner.
- **Animation principles are the grade:** anticipation, follow-through, smears, weight.
  A slow good walk beats ten stiff attacks. This is precisely where GEEKED and RIFT
  WARDEN failed — no real animation sequence. Do not fail it again.
- **Enemies (3–4 types + boss):** shade-knights / crows / stair-bats — few, distinct,
  each with telegraphed, animated attacks.
- **The Minotaur:** fills 60%+ of screen height. Telegraph → strike → recover cycles,
  2–3 phases, ground shockwaves, tower-shaking spectacle. The whole game earns this.

### 7.6 Co-op (the CROAKDOWN model)
- Shared screen, local drop-in: P1 keyboard or pad, P2 pad (DualSense tested). P2
  presses a button at any time → their knight wakes into the scene (fiction-native join).
- Downed partner → crawl + revive (hold near them). Both down → scene restarts at its
  chapter whisper. No lives, no counters.

### 7.7 Combat (in service of the journey, never the point)
- Light/heavy melee, dodge roll with i-frames, full juice stack: hitstop, hit-flash,
  knockback, camera trauma (restrained — painterly, not arcade), spark/dust bursts as
  painted flecks. Encounters are sparse and placed, not spawned in waves.

### 7.8 Audio
- Quiet ambient beds per scene (wind, crows, fire crackle, distant thunder) + sparse
  music swells at beats (wake-up, vista reveal, boss phases). Procedural Web Audio or
  baked stems — whatever hits quality; silence is a valid choice in this world.

### 7.9 Phases (after Gate 0 passes — not before)
1. **Phase 1 — Spine:** all 5 scenes traversable with plates + parallax + chapter
   whispers; co-op drop-in; walk the whole journey end to end.
2. **Phase 2 — Encounters:** enemy types, combat feel, juice, revive loop.
3. **Phase 3 — The Minotaur:** the set-piece, phases, spectacle.
4. **Phase 4 — Polish:** audio, grading pass per scene, perf, critics → `docs/GRADES.md`,
   ≥85 or iterate. Then Ian's pad playtest is the real verdict.
