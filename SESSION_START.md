# SOMNIUM — session boot file

**Read `BRIEF.md` first. The GOAL at its top wins every conflict.**

- **What:** 2.5D painted co-op journey — two knights wake in a dark-fantasy-paperback
  world (Frazetta/McBride/Nasmith + film grain, one accent hue per scene).
- **Port:** 5131 (`npm run dev`, strictPort — if taken, it's already running; reuse it).
- **Stack:** Vite + TS + raw Canvas 2D. Own git repo.
- **Status:** **Gate 0 spike BUILT 2026-07-12 — awaiting Ian's grade.** Proof:
  `docs/gate0/gate0.mp4` + stills + `docs/GATE0_REPORT.md`. Headed perf 165fps.
- **Next step:** Ian grades the spike (watch the mp4 or `npm run dev` → :5131;
  R replays the wake). PASS → Phase 1 journey spine per BRIEF.md §7.9.
  FAIL → iterate the spike only; still nothing else gets built.
- **Laws in force:** animation-first gate · no cyan holo/scanlines/microtype · real
  clicks only in QA · visible-page canvas capture · no shadowBlur per-entity ·
  title + one tag max of UI text.
