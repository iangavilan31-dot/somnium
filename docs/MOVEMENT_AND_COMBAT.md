# SOMNIUM — MOVEMENT & COMBAT BIBLE
**The feel canon. · v2.0 · 2026-07-12 · sits under WORLD_BIBLE.md, peer to ART_DIRECTION.md**
*(v1.1 amendment: Ian's LAW OF STILLNESS chapter — the named root law, the Painter's
Camera, the ringing blade, attention-is-noise co-op, parry refinements, the Boss Law.)*
*(v2.0 amendment, same day: Ian's master prompt v2 goal-locked — THE DEPTH BAND §18,
chain-flow contract §19, the context camera §20, the Stirred roster §21, the sandbox §22.
Research canon: `ObsidianPKM\research\somnium-combat-canon-2026-07-12.md`. One §17 kill
reversed by direct order; every other kill stands.)*

> **Hierarchy:** `BRIEF.md` (scope — supreme) → `WORLD_BIBLE.md` (meaning) →
> { `docs/ART_DIRECTION.md` (how a frame looks) · **this doc** (how the knights feel) }.
> Every verb/attack here passed the World Bible §0 Gate and is logged in `docs/CANON_LOG.md`.
> **Gate 0 law unchanged: this is paper. Nothing here gets built until Ian passes the
> Red-Sun Field benchmark, and then only in BRIEF §7.9 phase order.**
>
> Source prompt was written for a 3D AAA action game. Principles were extracted; every
> demand was re-derived for a 2.5D painted side-view canvas journey or killed (§17).

---

## §0 · THE FEEL GATE (before building or approving ANY animation/mechanic)

1. **WEIGHT** — where is the mass? State anticipation/follow-through frame counts. If it can't be described, it isn't designed.
2. **SILHOUETTE** — readable as a black shape at gameplay zoom, every key frame.
3. **PAINT** — does it read as brushwork in motion (painted smears, held poses), never digital tweening?
4. **QUIET** — what sound does it deserve? Does it respect Law 8 (the mix whispers so one toll can matter)?
5. **LAW** — did THIS world demand it, or did another game donate it? Five sub-tests
   (Ian's ONE LAW): does it deepen the feeling of a silent painted world · preserve
   atmosphere · reinforce weight · create memorable composition · encourage wonder?
   Any "no" and it does not belong — even if every successful game has it.
6. **CLIP** — would someone clip it with zero UI and no damage numbers?
7. **CO-OP** — what does it look like when both knights do it together, or near each other?
8. **SCOPE** — which BRIEF phase? Cancel windows defined? Perf note (pooled particles, no shadowBlur, no per-pixel loops)?

---

## §1 · THE LAW OF STILLNESS (movement philosophy — the root law, named by Ian)

**The world existed in quiet for centuries. Only the knights make noise.
The player is not merely moving through the world — they are disturbing it.
Combat is not aggression; it is restoring silence.**

**The knights are the loudest things in this world.**

In a civilization built on quiet, their dreamed-on plate is the one truly loud object
left. Every footfall is the heaviest sound in the scene. They cannot be silent — they
can only be *careful*. This single fact generates the whole movement identity:

- Weight is not a flourish; it is the fiction. Heavy steps, armor shift, parting grass —
  the world physically registers the knights because they are wrong in it.
- The world watches them move: ravens lift ahead of a sprint, moths scatter, flowers
  they brush keep swaying after they've passed. Movement IS the dialogue.
- A trained knight, never an arcade character: acceleration is earned, stops carry
  through, turns bank. No verb snaps. No verb floats.
- **The last verb is walk.** The epilogue strips every mechanic; the final approach to
  the floating tree allows walking only. The game's mechanical quiet is its emotional
  landing. (Journey's lesson, our means.)
- Movement must be worth doing with nothing to fight — the journey IS the game (BRIEF).

---

## §1.5 · THE PAINTER'S CAMERA (the camera composes; it does not follow)

The camera's job is to keep every frame a painting while never fighting the player's
hands. In 2.5D terms:

- **Composition anchors, authored per scene region:** each stretch of world defines its
  intended painting — horizon height, where the accent subject sits (the Ember at the
  upper third, the tower at the right edge), which framing elements must stay in frame
  (the thorn sentinel at the west of Scene 1). The camera target is a weighted blend of
  the knights' midpoint and the local anchor field — the players move freely INSIDE the
  composition; the composition itself is protected and yields reluctantly.
- **The repose:** when both knights stand still ~4 seconds, the camera eases (2–3s)
  into the region's authored composition and holds — ambient drift continues, fireflies
  wander, the cloak settles. *Every pause looks like concept art* — by design, not by
  luck. Any input breaks it instantly; the camera never takes control, it accepts it.
- **Drift, never track:** damped follow with the existing leash (built); no snaps, no
  cuts during traversal; push-ins remain rationed (Berserk law — two per boss).
- **Verticality:** the Gothic Stair's anchors rotate the thirds vertically; climbing
  frames the knights small against the full height of what they're climbing (Law 2).
- **Co-op framing:** the leash frames both knights; when they split (the split climb),
  the camera widens to hold both — separation reads as one painting of two figures,
  the Rückenfigur doubled (Friedrich law).
- **Perf note:** this is camera math, not rendering — zero frame cost. Anchors are
  data authored per scene alongside the plates.

### Core verbs (v1 — BRIEF §7.5 locked set + two flagged additions)
| Verb | Weight spec / feel | Co-op shade | Home |
|---|---|---|---|
| Walk | the hero verb; full-body cadence, cloak echo, head turns to vistas | side-by-side framing (Rückenfigur) | all |
| Run/Sprint | §4 spec | drafting: trailing knight's cloak pulls harder | all |
| Dodge roll | locked; fixed distance, honest i-frames (ER law), heavy exit | roll-through-partner allowed, never collide | all |
| Backstep | short, grounded hop; the spacing verb (replaces "sidestep" — y-band too narrow) | — | combat |
| **Jump (gap)** | **ADDITION to BRIEF §7.5 — flag to Ian**: S4 demands gap-jumps; low, heavy, knightly arc; no bunny-hop (jump buffered only near edges) | the catch (§7) | S2→S5 |
| Crouch-walk / crawl | under collapsed Loud Age arches; slow, deliberate, cloak drags | single-file tension | S2, S4 |
| Vault | one-hand over fallen monoliths / low walls; momentum preserved | boost variant (§7) | S2+ |
| Wade | shallow murmur-channels; water hums at the ankles (the Ferrier's craft); heavy legs, ripple rings | wakes interfere beautifully | S3, S4 |
| Push/pull (heavy) | muffled doors (WORLD_BIBLE §10), counterweight ropes; slow = silent, rushed = groan | synchronized by design | S3, S4 |
| Campfire sit / revive / collapse / wake-rise | locked, already canon | embrace-revive | all |

### Authored set-piece verbs (v1, placed by hand — never free-form systems)
| Verb | The moment | Home |
|---|---|---|
| Slide (downhill) | §5 | S2 first hill, S5 drifts |
| Slide (under) | under a fallen thorn-trunk; under the collapsing gate beat | S2, S4 |
| Mantle / ledge climb | §6 | S4 |
| Ledge hang + shimmy | §6 | S4 chasm |
| Balance walk | fallen trunk over mist/stream; wind sways the knight, cloak counterweights; walk-only, no run | one crosses while one watches (gesture: *watch*) | S2, S3 |
| Ladder climb | moth-loft ladders; hand-over-hand weight | steady-the-base idle for partner | S3 |
| Rope climb | the Stair's bell-ropes: climb SLOWLY or the mute bell above creaks — the world's scariest sound | one climbs while one anchors | S4 |
| Counterweight lift | keeper-built, felt-lined: one knight cranks, one rides; swap mid-shaft | inherently two-player | S4 |
| Plunge (traversal) | drop from ledge with 3-point landing; heavy crater of dust/snow | — | S4, S5 |

### Post-v1 paper (gate-logged, not built)
Carry a downed partner (tender + practical) · deep-water boundary events (§3) ·
wall-shimmy variants · the Stair's split-path simultaneous climb as a repeatable system.

---

## §3 · FEEL LAWS (the world answers the knights)

1. **Cloth is the soul** (Journey law): the verlet cloak reacts to every verb — trails in
   sprint, wraps in roll, settles late after stops. Armor shifts with a half-frame lag
   (secondary motion on the rig; already proven in the Gate 0 spike).
2. **The interactive band:** a runtime strip of grass/flowers/reeds at play depth (pooled
   sprites, spring-hinged) — bends when touched, parts under sprint, keeps swaying after
   the knights pass. The painted plates stay static; only the band is alive. (Perf: one
   pooled layer, no shadowBlur, capped springs.)
3. **Surfaces remember:** snow compresses (S5: persistent footprint trail via an
   accumulating offscreen decal canvas — one extra composite); mud prints on the Pilgrim
   Road after ash-petal fall; wading leaves ripple rings that outlive the step.
4. **Dust is punctuation:** kick-up on sprint starts, roll exits, plunge landings, door
   shoves — painted flecks from the existing FX system, never particles-for-particles.
5. **Footsteps are scored:** the heaviest ambient sound in most scenes (§1). Surface
   layers: grass/stone/wax/bronze/snow. On the buried bell floor (S5) every step TOLLS.
6. **Deep water is deep dream:** no swimming, ever (§17). Wading is safe; past waist
   depth the dream takes the knight under — partner pulls them out (grab window) or they
   wake at the last fire. Water is a boundary with a meaning, not a missing feature.
7. **Nothing snaps** (TLOU2 law): every animation declares entry/exit blend frames and
   its cancel window in the moveset table. Interruptibility is designed, not patched.

---

## §4 · SPRINT

Powerful, never floaty. Sprint is *transgressive* here — haste is a wakeful thing.

- **Ramp:** 12 frames of true acceleration (lean forward, first two steps dig), full
  speed by stride three. Stopping takes 6 frames of settle — plant, skid-dust, cloak
  overtakes and falls back.
- **Camera:** y drops ~2%, zoom widens ~4% (the 2.5D translation of "camera lowers, FOV
  widens"), both eased — the existing cinematic camera absorbs it.
- **World response:** grass parts in the interactive band; dust/petals kick in the wake;
  ravens ahead lift off; in S3 the moths scatter and lamps flutter (the world noticing —
  never a punishment).
- **Sound:** footfalls become the loudest thing in the mix; ambience recedes slightly;
  when the sprint stops, one beat of held breath before the world resumes (§9 canon).
- **Cape:** full trail, tip snapping at stride rhythm.

## §5 · SLIDE

A traversal verb with a cinematic camera, used where the world asks:

- **Downhill:** steep grass (S2's first long hill = the teaching moment; joy, no threat),
  snow drifts (S5). Knight drops to hip-and-heel, cloak flares overhead, grass/snow
  spray line behind. Steerable ±y-band. Exit rolls or runs out — momentum honest.
- **Slide-under:** authored gaps — fallen thorn-trunks, the S4 collapsing gate beat
  (gate groans down over four seconds; both knights slide the closing slit — THE co-op
  clip). Slide window generous; failing = the slow-push alternative, never death.
- **Slide-attack:** §10. Camera holds wide; no speed lines, ever — speed reads through
  cloth, spray, and the world blurring in parallax, painterly to the end.

## §6 · CLIMBING & THE STAIR (deliberate, scale-reinforcing)

Climbing exists to make the world enormous (Nasmith law: the architecture agreed with
the mountain). It is deliberate — Uncharted's readable reach-grab, none of its speed.

- **Mantle:** chest-height ledges; two-beat (hands plant → knee up); auto-triggered on
  approach at walk (AC forgiveness law — no button mash), deliberate at height.
- **Ledge hang + shimmy:** the S4 chasm face; hand-over-hand, cloak hanging into the
  void below; bats cross behind (staging). Partner on the ledge above can kneel and
  offer a wrist (faster pull-up = optional co-op).
- **Rope climb:** §2 — the bell-rope tension beat. Slow input = silent; mashing makes
  the mute bell above CREAK (no failure state — just the worst sound in the world and
  both players' spines).
- **Counterweight lift:** the High Hush's felt-lined elevator; one cranks, one rides,
  swap halfway. The mechanism is visibly muffled — wrapped chains, waxed rails.
- **Ladders:** moth-lofts, weir platforms. Weighty, hand-over-hand, no slide-down (a
  knight in plate does not fireman-pole).
- Every climb surface is **authored** (this is not a climbing system — it is placed
  traversal theater, which is what a 5-scene journey can polish to AAA feel).

## §7 · CO-OP MOVEMENT MOMENTS (the memory list)

- **The boost:** knee-lift to a high ledge; the boosted knight reaches back down —
  optional wrist-grab pulls the booster up. Two animations, one memory.
- **The catch:** a missed gap-jump within reach of the partner = grab window (generous;
  slow-mo one beat, no HUD). The falling knight hangs; pull-up together. Forgiveness AS
  drama — the co-op story players retell.
- **The collapsing bridge (S4):** Loud Age bridge over the chasm goes as they cross —
  timed but fair; one knight ahead holding the last plank down for the other.
- **Split climb (S4):** the stair forks; both climb parallel faces framed in one wide
  shot (camera leash already supports it); reunite at the top — gesture: *I keep you*.
- **Muffled doors / rope-pulls / embrace-revive:** canon (WORLD_BIBLE §10).
- **All synchronization is diegetic:** no "PRESS X TOGETHER" prompts — the doors simply
  don't move for one knight, the lift simply needs a cranker. The world is the UI.

---

## §8 · COMBAT PHILOSOPHY

**Fights are accidents of noise, and the moveset exists to end noise.**

- Combat serves the journey (BRIEF §7.7 — sparse, placed, never the point). Every fight
  is a failure of quiet somewhere, and ending it is an act of keeping.
- Heavy, deliberate, cinematic: the weight of steel over the count of moves. **One
  weapon, mastered, per knight** — the template's own maxim ("a simple moveset executed
  perfectly") taken at its word (§17 kills the arsenal).
- No damage numbers, no bars (BRIEF-locked): enemy state reads as posture, armor
  damage, ink-bleed; knight fatigue reads as breath and stance — audible breathing and
  slower recoveries, never a stamina bar (v1: readability only, no hard gating).
- The combat arc IS the theme: the knights begin loud (their nature) and learn the
  world's language — the parry is a hush (§11), the finisher is a quieting (§13), and
  by the Black Tower they fight like keepers.

## §9 · THE BLADE (the one weapon, full identity)

- **Name (bible-canon):** the **dreamed sword** — it woke with them, already worn, as
  if it had been theirs for years in a life they can't remember. (Wear on day one:
  McBride law.)
- **Weight/reach/speed:** a longsword with presence — reach just past the knight's own
  height silhouette; cadence ~1 strike/sec light, heavies half that. Momentum carries:
  whiffed heavies pull the knight a half-step.
- **Damage philosophy:** few hits matter; every strike is a sentence, not a syllable.
  Posture damage first (stagger the Stirred), ink-damage second.
- **Animation style:** anticipation → acceleration → impact → follow-through → recovery
  on every swing (§10 table); painted smear on the strike frames (existing tech);
  held poses at combo ends (paperback cover frames mid-fight).
- **Sound profile:** **in a world where every bell is bound, each sword strike is a
  small unlawful bell.** Strikes RING — one lonely tone with a long valley-reverb tail
  that the mix gives room to die (Law 8: the mix whispers so one ring can matter).
  Whoosh is cloth and air; there is no arcade "shing," there is a toll in miniature.
  Every swing rings through forgotten valleys — which is also *why the Stirred come.*
- **VFX:** smear trails (exist), directional painted sparks on glance, ink-splash on
  tear. No glow, no elemental coatings.
- **Unique mechanic:** the Hush-parry (§11) and toll-sync (§14) are the blade's magic.
- **Upgrade path:** none in v1 (no menus, no smithing — BRIEF non-goal). The blade
  "upgrades" by wear: chips, tally-scratches on the flat after each chapter (visual
  history, zero mechanics).
- **Lore:** never texted. Its crossguard is a closed eye. Players who zoom will see.
- **Post-v1 seed (gate-logged):** *taking up the watch* — NG+ only, a knight may draw
  the planted clapper-greatsword from the S5 snow. Slow arcs, earth-toll strikes,
  screen-wide gravity. The price: the Great Bell hangs unguarded. (Paper only.)

## §10 · THE MOVESET (frame budgets @60fps baseline; every move declares its cancel)

| Move | Anticip. | Strike | Hitstop | Follow+recover | Cancel window |
|---|---|---|---|---|---|
| Light 1 | 8f | 3f (smear) | 2f | 12f | roll/backstep after impact+2 |
| Light 2 | 6f | 3f | 2f | 12f | chain L3 or roll |
| Light 3 (capstone) | 12f | 4f (big smear) | 3f | 18f | none — commit |
| Heavy (charge) | hold 10–45f | 4f | 4f | 20f | release early = light-heavy |
| Running attack | sprint canc. 6f | 4f | 3f | 16f | roll late |
| Rolling attack | out of roll 4f | 3f | 2f | 14f | — |
| Backstep poke | 5f | 2f | 1f | 10f | backstep again |
| Jump attack | airborne 6f | 3f | 3f | landing 12f | — |
| Plunge attack | drop | 4f on land | 5f | 20f crater | — (authored heights) |
| Slide attack | in slide | 3f | 2f | ride-out | stand/roll |
| Kick (shove) | 6f | 2f | 2f | 10f | — (guard-break + ledge shove) |
| Guard (hold) | 4f raise | — | — | 6f lower | any |
| Hush-parry | §11 | — | — | — | riposte only |
| Quieting (finisher) | §13 | — | — | — | none — a vow, not a move |

- **No repeated-feeling animations:** L1/L2/L3 are three different cuts (descending,
  cross, rising) — never the same swing replayed. Heavies mirror per facing.
- Rules of weight: nothing above 12f anticipation is safe to spam; recovery frames are
  where enemies answer; hitstop scales with blow, never exceeds 5f (painterly restraint).

## §11 · THE HUSH-PARRY (the skill expression)

Strict-timing deflect (8f window) with the most SOMNIUM payoff possible:

- On success **the game holds its breath**: 300ms of near-total silence — ambient and
  music recede, the attacker's ink stalls mid-stroke, **and every ambient particle
  stops**: petals hang, motes freeze, embers pause mid-rise (one flag on the FX update;
  free). Through that stillness, **one pure ring** — the parry is the only sound in the
  world. Then the riposte window. Parrying is not "perfect timing"; it is restoring
  order, and the world acknowledges mastery.
- Visual: no spark flash — a *smothering*: the strike is caught in the cloak-wrapped
  forearm and QUIETED, painted motion collapsing to stillness.
- **Dual parry:** both knights parry the same beat → the full held breath — one full
  second, every Stirred on screen stalls. Rare, emergent, unforgettable. No prompt ever
  teaches it; the world just rewards it when it happens.
- Guard (hold) is the forgiving cousin: blocks light strikes with posture chip; heavies
  break guard. Parry is guard's graduation.

## §12 · IMPACT (the player must feel every hit)

Locked juice stack (BRIEF §7.7) + additions, all painterly-restrained:
- hitstop (table above) · hit-flash (one-frame value pop, not white-out) · knockback
  with weight classes · camera trauma (small, decaying, never nauseous)
- **directional painted sparks** along the blade path on glance; ink-splash on tear
- cloth answers every impact (cloak whips on hits taken — exists since the spike)
- **pad rumble:** hits, heavy landings — and **the distant toll thrums the pad softly
  from Scene 1 onward**, growing chapter by chapter until the S5 fight plays the
  players' hands like the buried bell floor. (DualSense path; degrade gracefully.)
- dynamic sound layering: whoosh (cloth) + the ring (§9) + world answer (the
  two-second held breath after the last enemy hushes — canon §9).
- **the strongest impacts are the quietest details** (Ian's restraint law): a slight
  pause · steel ringing · dust lifting · a cape settling · **a raven taking flight** —
  the heaviest blows are punctuated by a bird leaving the nearest silhouette, not by a
  bigger flash. No floating numbers, no anime flashes, no screen-filling effects, ever.

## §13 · ENEMY REACTIONS (the painted damage language)

- Small Stirred stagger on lights; large ones absorb lights and answer heavies.
- Loud Age armor on shade-knights *dents* — plates cave, ink leaks at the seams; weak
  strikes on their armor GLANCE (painted spark, blade deflects, knight exposed —
  teaches heavy timing without a tutorial).
- Strikes on stone glance hard: sparks, recoil, chip the wall (persistent scratch decal
  — the world remembers the fight).
- No blood: the Stirred bleed **ink and noise** — wounds hiss like escaping air.
- **The quieting (finisher/execution):** a staggered Stirred can be *stilled* — the
  knight plants the blade through the ink-mass and HOLDS, kneeling, until it settles
  into quiet sediment. Two seconds, uninterruptible, tender. Executions in this game
  look like putting something to rest. **Joint quieting:** large Stirred need both
  knights holding it down — the co-op execution is a shared vow, not a gore shot.

## §14 · CO-OP COMBAT (two guardians, not two heroes)

- **ATTENTION IS NOISE (the unification):** the Stirred are drawn to sound, and the
  knights are the loudest things alive — so the aggro system IS the noise system.
  Every action carries a loudness (walk < wade < sprint < roll < strike < ring); each
  Stirred attends to the knight who rang loudest most recently. From this one rule,
  formations emerge with zero UI: **one draws** (be loud), **one protects** (stand
  between), **one interrupts** (parry/kick), **one finishes** (the quieting). The game
  rewards awareness over aggression because awareness is literally quieter.
- **The Ring (diegetic taunt):** a knight strikes their blade against stone — one
  deliberate unlawful bell-toll. Every Stirred in earshot turns. Uses the existing
  glance-off-stone tech; costs a recovery window (taunting is a commitment).
- **De-escalation:** Stirred that lose attention drift back toward settling — disengage,
  go quiet, and some fights can be walked away from before they finish waking. Fights
  are accidents of noise; some accidents can be un-had. (Authored per encounter,
  Phase 2 intent.)
- **Toll-sync:** strikes that land together land true — both knights hitting one target
  within the same beat window bonus-stagger it. Near the S5 arena the world's toll IS
  the beat; players who sync to it fight in rhythm with the world. Ambient, optional,
  never a UI metronome.
- **Stagger-and-climb the giant:** killed for v1 (§17) — the rope-and-toll arena
  mechanic (WORLD_BIBLE §5/§10) is our boss teamwork identity.
- **Cross-coverage:** facing is meaningful in side-view — two knights back-to-back is a
  real formation, and the camera loves it.
- **Combat revive:** embrace-revive under pressure = the drama engine; the reviver's
  back is exposed (no i-frames); partner's guard can cover. No timers on screen.
- Dual parry (§11), joint quieting (§13) — already the signature set.

## §15 · KEPT-THING RITES (the "magic" — post-v1 paper, gate-logged)

Knights are not casters; magic is keeper-craft (WORLD_BIBLE §6). Player-facing magic =
**uncorking kept things** (WORLD_BIBLE §8) — spending a preserved moment, tenderly:
- *A Held Breath* → area hush: Stirred stall in the silence (crowd control as quiet).
- *One Firefly Hour* → a following light in the dark stretches.
- *A Snowfall, Unspent* → slow-fall over an arena; everything gentles.
- *Jarred shout* (the Ferrier's) → thrown: ravens flock and eat a Stirred's noise.
No projectiles, no glow, no mana. Each rite = one beautiful painted event, one use,
found again by exploring. **Nothing here enters v1** (BRIEF melee kit is the lock).

## §16 · QUALITY BAR (extracted, never copied)

| Study | Principle extracted | Our application |
|---|---|---|
| Prince of Persia | traversal as rhythm — verbs chain without stalls | cancel-window table §10; vault/slide preserve momentum |
| Assassin's Creed | flow through forgiveness — no button-mash traversal | auto-mantle at walk, buffered edge-jumps |
| Ghost of Tsushima | weight + elegance; cloth as motion's echo; wind as guide | cloak laws §3; the wind already blows toward the Ember |
| Elden Ring | spacing honesty — fixed roll distance, readable recoveries | §10 frame budgets are contracts, never fudged |
| Uncharted | climbing readability + partner presence | reach-grab telegraphs; wrist-offer pull-ups |
| TLOU Part II | transition blending — no snapping, ever | every anim declares entry/exit blends + cancels |

**The four approval questions (asked of every animation before it ships):** satisfying
with no damage numbers? · would someone clip it? · does it communicate weight, power,
mastery through animation alone? · would it hold up beside modern AAA action games —
*as painted 2.5D, on its own terms*? If any answer is no: iterate.

## §17 · KILL-LOG (movement & combat — do not resurrect without new evidence)

- **Swimming** → killed; deep water = deep dream (boundary event with meaning §3.6).
- **Ziplines** → killed; the Hush does not do fast. (The template itself hedged.)
- **Sidestep-as-verb** → *kill REVERSED in spirit 2026-07-12 by Ian's master prompt v2
  (goal-locked): the band is now real (§18) and depth-walk + depth-roll own lateral
  spacing. No separate "sidestep" move exists — the band itself is the sidestep.*
- **The 14-weapon arsenal** (longsword→whip→tome→catalyst) → killed; two knights, one
  dreamed sword each, mastered — by the template's own maxim. Clapper = NG+ seed only.
- **Shield formations / shield bash / dual shields** → killed; the slides' knights carry
  sword and cloak. The cloak IS the off-hand (Hush-parry smother).
- **Staff/tome/catalyst magic + glowing projectiles** → killed; magic = kept-thing rites
  (§15), post-v1.
- **Climbing the boss (SotC-style)** → killed for v1; rope-and-toll is our boss identity
  and colossus-climbing is someone else's memory.
- **FOV manipulation / speed lines** → translated: zoom + camera-y + cloth + parallax
  blur carry speed, painterly.
- **Stamina bar / lock-on / sync-prompt UI / damage numbers** → killed or diegetic
  (breath = fatigue; facing = lock-on; the world = the UI).
- **Perfect Counter + Guard Counter + Parry + Riposte as four systems** → collapsed to
  one skill expression: the Hush-parry and its riposte, plus plain guard.

---

# v2.0 — THE DEPTH AMENDMENT (Ian's master prompt v2, goal-locked 2026-07-12)

*Principles extracted and re-derived for this world, as v1.1 did with its source. Every
number marked TUNE is a starting slider from the research canon, honest until the pad
says otherwise.*

## §18 · THE DEPTH BAND (the world model — the one structural change)

**Fiction (World Gate):** the knights were always free to step off the pilgrim line into
the meadow's depth — the world simply never needed them to. Now that the Stirred circle,
it does. The band is the painting's foreground; walking "toward the frame" walks toward
the reader of the paperback.

- **World model:** every actor = `(x, z, h)` — x along the journey, z depth inside the
  band (+z toward camera), h height above ground (jump/plunge only). Screen: `sy =
  GROUND_Y + z·Z_SLOPE − h`, scale `1 + z·Z_SCALE` (subtle — TUNE ≈ ±5% across the band),
  draw order = z-sort of the whole world pass (knights, Stirred, fire, boss slot, fx).
- **The band is authored per scene** (designed play spaces, never systemic): `SceneDef`
  gains `bandNear/bandFar` (+ optional per-x-range overrides for paths, ledges, arena
  mouths). S1 field = generous; stair stretches = narrow ribbon (the band is composition).
- **Depth speed** ≈ 0.6× walk speed (belt-scroller cadence, TUNE); diagonals normalized.
  Facing stays ±1 — the knights are side-view creatures; z-movement never flips them.
- **Generous to hit, honest to dodge (the pick, logged):** attack events carry a WIDE
  z-tolerance (TUNE start: knight ~±26px, Stirred lights similar); the knight's hurt
  z-band NARROWS while actively depth-moving (the SoR4 rule). No position magnetism —
  the generosity IS the band. False-positive law: a rolling/downed body's z-band is its
  posture's, not its standing one.
- **The shadow is the depth UI:** every actor's contact shadow is pinned to `(x, z, h=0)`
  and never leaves the ground; it is the only depth instrument. No markers, no arrows,
  no outlines (banned list). Jump = ground(x,z) + h arc; z steerable mid-air but damped
  0.4× (TUNE); the shadow shows the landing before the knight does.
- **Circling:** roll aims along the held stick vector (x/z normalized), same fixed 140px,
  same i-frames — the circle verb is the roll the knights already know. Backstep stays
  pure −facing (the spacing verb is 1D on purpose: retreat is along the blade line).
- **Camera:** x-framing unchanged; the camera does NOT chase z (the band lives inside the
  frame's height). Depth never scrolls; it composes.
- **Co-op:** knights repel gently within ~24px ellipse (never superimpose — our choice,
  extending the SoR4 player rule); embrace/quieting/fire checks become elliptical
  distances (x-weighted 1 : z-weighted 2.2, TUNE).

## §19 · CHAIN FLOW (the end-pose contract — the feel rework)

**The demand: no swing restarts from neutral.** The chain is one sentence, not three words.

- **Contract:** L2's first key = L1's follow-through pose; L3's first key = L2's. The
  chain window opens at impact+2f (existing cancel law) and closes at recovery end; a
  chained cut SKIPS its neutral wind-up — its anticipation is the previous follow-through
  gathered (TUNE: chained anticipation ≈ 60% of cold anticipation, staying inside §10's
  totals).
- **The finisher slot:** heavyTap during L2/L3 recovery starts the charge FROM that end
  pose (light-heavy already exists; now it inherits the pose). The full sentence:
  descending → cross → rising → the held heavy. Four cuts, one breath.
- **Selection considers the body** (master prompt): the mover picks the next cut by
  current sword side (L1 ends blade-low-right → L2 pulls cross from there), sprint state
  (RUNATK), roll state (rolling attack), airborne (jump/falling attack §18), backstep
  (poke). No same-swing-twice, ever (§10 law upheld).
- **Buffer honesty (research, ER lesson):** all input buffers CLEAR when a hit lands on
  the knight — no roll from beyond the grave. Buffers stay open through hitstop (the
  SF2 gift). First visible response to any press ≤3f even when contact is 20f away.
- **Steps carry:** each chained cut steps the knight forward per §10's momentum line;
  the struck Stirred gives the same ground — the duel travels across the band.

## §20 · THE CONTEXT CAMERA (three rooms, one painter)

The Painter's Camera (§1.5) gains combat awareness. Three states, eased blends
(~1.5s ease-in-out, TUNE; never a cut):

- **EXPLORATION** — as built: wide, anchors, repose, sprint-widen. Unchanged.
- **COMBAT** — any Stirred drawn/attacking in frame: zoom eases ~7% closer (readability,
  not drama), target biases toward the fight's centroid while ALWAYS fitting both
  knights (fit-both never loses), slight look-ahead toward the loudest threat. Painterly
  restraint: no shake beyond the existing trauma cap; trauma = trauma² with Perlin
  channels (research-verified Eiserloh) already matches §12.
- **BOSS** — the §5 law verbatim: locked wide 0.74, both knights + his full height,
  push-ins rationed two per boss. Phase transitions may reframe once, eased.
- **Mental-map law (GoW rules, scaled):** an on-screen Stirred only leaves frame if the
  players caused it; an off-screen one never attacks without its cry arriving first
  (§21 the Criers; ravens bank = the direction hint). The camera never surprises.

## §21 · THE STIRRED ROSTER (each teaches one lesson; all pass WB §0 → CANON_LOG)

*All are Stirred — the dream's memory of Loud Age soldiers, ink over denting plate. No
skeletons, no goblins, no recolors: variants differ in silhouette, plate, and what they
remember.*

| Variant | Silhouette (64px) | Lesson | Language |
|---|---|---|---|
| **The Stirred** (built) | broken mirror of the knight | timing & spacing | existing dent/glance |
| **The Sealed** | plate fused into a tower shield-wall, no gaps forward | flanking — the band exists | front undentable (glance forever); kick staggers; a cut from ≠z or behind opens it. Never strikes first — it only holds ground |
| **The Startled** | thin, low, too many elbows; bolts in ink-streaks | reaction & the depth-roll | crosses z constantly; lunge telegraphs long (24f) but arrives fast; whiffs leave it sprawled |
| **The Burdened** | colossal hunch under a BOUND BELL strapped to its back | patience & stagger | absorbs lights; heavies stagger; its bell must never touch ground — the joint quieting (both knights) is its only rest. Slow arcs, honest recoveries |
| **The Crier** | head thrown back, jaw unhinged mid-wail | pressure & priority | no projectiles — its CRY is the ranged attack: a visible ripple ring that staggers and WAKES nearby Stirred (attention-is-noise weaponized). Killing quiet = killing it first |
| **The Remembered** | upright, keeper's staff-drill stance — it stands like the statues | the parry | fights in keeper footwork (the minotaur Phase-3 language, seeded early); its measured strikes are THE parry teacher; a parried Remembered kneels a beat — grief, not stun |

- Alignment AI: a Stirred seeks z-alignment before striking (|dz| < tolerance), repels
  its kin (no stacking), and attention-is-noise remains the only aggro law — the token
  pool is the loudness ranking, cap ~2 simultaneous attackers (TUNE), asynchronous.
- Placement stays sparse and authored (§8). No filler, no waves, no inflated ink.

## §22 · THE SANDBOX (the yard — where feel is proven)

A dev harness, not a chapter: `?yard` boots a single S1-slice arena — full band, one
rest-fire, and **the Bound Post**: a Loud Age training post wrapped in keeper's felt
(a thing built to be struck without waking anything — the one lawful loudness in the
world). It takes every strike, rings muffled, shows dents that knit; toggleable sparring
Stirred of each §21 variant spawn by key. Every moveset change is proven here against
the Feel Gate BEFORE it enters the journey. Player-facing version = POST-V1 paper.

---

*Every entry above passed WORLD_BIBLE §0. New verbs and attacks go through the Feel
Gate (§0 here) AND the World Gate, then land in `docs/CANON_LOG.md`. The knights are
loud; the craft is quiet; the last verb is walk.*
