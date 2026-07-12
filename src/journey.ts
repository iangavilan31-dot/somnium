// The journey spine — five chapters, one epilogue. Each scene owns ONE accent hue,
// one whisper, one light. Scenes bake lazily on first entry (boot stays fast) and
// stay cached. The campfire is the master ritual: resting together is how the world
// re-dreams the scene forward (transition = save = P2's wake-in, one system).

import type { Layer } from "./paint";
import { bakeScene } from "./paint";

export interface SceneBake {
  layers: Layer[];          // behind the play plane, painter's order
  mid?: Layer[];            // just in front of the play plane (thorn sentinel etc.)
  fgA?: Layer; fgB?: Layer; // wind-crossfade tuft pair (optional)
  near?: Layer;             // nearest soft-focus framing (optional)
}

export interface SceneDef {
  id: number;
  name: string;
  whisper: string;            // 2–5 serif words on entry
  boundsL: number; boundsR: number;
  spawnX: number;             // where the knights enter walking (or wake, scene 1)
  lightX: number;             // key-light world x — shadows point away from it
  glaze: string;              // the scene's unifying wash color
  glazeBase: number; glazeBreath: number;
  // the world breathes everywhere; only scenes that SEE the Ember get the disc veil
  veil: { x: number; y: number; r: number; parallax: number; outA: number; inA: number } | null;
  fireX: number | null;       // the rest-fire; null = edge-exit scene
  exitEastX: number | null;   // walking past this edge leaves the scene (S1, epilogue)
  bake(): SceneBake;
}

// ---------- the campfire (in-world entity, play plane) ----------
// Painted flame: licking dabs + baked glow, no shadowBlur. The fire is warm ground
// truth in every night scene — Law 6: a fire is somebody's work (here, the knights').
export class Campfire {
  constructor(public x: number) {}
  private licks: { ph: number; sp: number; w: number; h: number }[] = Array.from(
    { length: 8 },
    (_, i) => ({ ph: i * 1.3, sp: 2.2 + (i % 3) * 0.6, w: 4.5 + (i % 4), h: 19 + (i % 5) * 5 }),
  );
  update(dt: number) {
    for (const l of this.licks) l.ph += dt * l.sp;
  }
  draw(ctx: CanvasRenderingContext2D, groundY: number, glow: HTMLCanvasElement, t: number) {
    const y = groundY - 2;
    // warm ground pool
    const flick = 0.82 + Math.sin(t * 7.3) * 0.06 + Math.sin(t * 11.7) * 0.04;
    ctx.globalAlpha = 0.38 * flick;
    ctx.drawImage(glow, this.x - 64, y - 54, 128, 82);
    ctx.globalAlpha = 0.55 * flick;
    ctx.drawImage(glow, this.x - 34, y - 34, 68, 44);
    ctx.globalAlpha = 1;
    // stone ring + logs — a fire-cradle worn by ten thousand kettles
    ctx.fillStyle = "#0a0a0d";
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI;
      ctx.beginPath();
      ctx.ellipse(this.x + Math.cos(a) * 25, y + 2 + Math.sin(a) * 3, 5.5, 3.6, a * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#120b07";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(this.x - 12, y); ctx.lineTo(this.x + 10, y - 6);
    ctx.moveTo(this.x + 12, y); ctx.lineTo(this.x - 9, y - 5);
    ctx.stroke();
    // flame licks — painted, never gradient-cone
    for (const l of this.licks) {
      const u = (Math.sin(l.ph) + 1) / 2;
      const lean = Math.sin(l.ph * 0.7) * 3;
      const hh = l.h * (0.7 + u * 0.5);
      ctx.globalAlpha = 0.55 + u * 0.3;
      ctx.fillStyle = u > 0.6 ? "#e8964a" : "#c25a28";
      ctx.beginPath();
      ctx.ellipse(this.x + lean * 0.5, y - 8 - hh * 0.45, l.w * (1 - u * 0.35), hh * 0.5, lean * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
    // hot core
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#f4b56a";
    ctx.beginPath();
    ctx.ellipse(this.x, y - 9, 7.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ---------- scene registry ----------
// Scene 1 wraps the proven Red-Sun Field baker. Scenes 2–5 + epilogue register here
// as they are built (this file is the single source of journey order).
const SCENE1: SceneDef = {
  id: 1,
  name: "RED-SUN FIELD",
  whisper: "What will you do?", // shown by the wake sequence (existing flow)
  boundsL: 320, boundsR: 2100,
  spawnX: 1250,
  lightX: 1150,
  glaze: "#8a4a30", glazeBase: 0.050, glazeBreath: 0.010,
  veil: { x: 1150, y: 555, r: 235, parallax: 0.04, outA: 0.058, inA: 0.078 },
  fireX: null,
  exitEastX: 2080, // past the wayshrine, dusk takes the field
  bake(): SceneBake {
    const s = bakeScene();
    return { layers: s.layers, mid: [s.thorn], fgA: s.fgA, fgB: s.fgB, near: s.near };
  },
};

export const SCENES: SceneDef[] = [SCENE1];

export function registerScene(def: SceneDef) {
  SCENES.push(def);
  SCENES.sort((a, b) => a.id - b.id);
}
