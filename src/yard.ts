// THE YARD (M&C §22) — dev sandbox, not a chapter. `?yard` boots one S1-slice
// arena with the BOUND POST: a Loud Age training post the keepers wrapped in felt —
// a thing built to be struck without waking anything. The one lawful loudness.
// Every feel change is proven here before it enters the journey. Dev-only in v1.

import { noise1, TAU } from "./math";
import { bakeScene, GROUND_Y, Z_SCALE, Z_SLOPE } from "./paint";
import type { SceneBake, SceneDef } from "./journey";
import type { Fx } from "./fx";

export const YARD_IDX = -1; // lives outside the journey's SCENES order

export const YARD: SceneDef = {
  id: 90,
  name: "THE YARD",
  whisper: "practice, quietly",
  boundsL: 420, boundsR: 2000,
  bandMin: -48, bandMax: 48, // the widest band in the game — it exists to be tested
  spawnX: 1080,
  lightX: 1150,
  glaze: "#8a4a30", glazeBase: 0.050, glazeBreath: 0.010,
  veil: { x: 1150, y: 555, r: 235, parallax: 0.04, outA: 0.058, inA: 0.078 },
  fireX: 640,
  exitEastX: null,
  bake(): SceneBake {
    const s = bakeScene();
    return { layers: s.layers, mid: [s.thorn], fgA: s.fgA, fgB: s.fgB, near: s.near };
  },
};

export class BoundPost {
  x = 1420; z = 0;
  dents = 0;          // felt takes the blow; dents knit while it stands unstruck
  private knitT = 0;
  private wobble = 0; // rotation spring after a hit
  private wobbleV = 0;

  // steel meets felt: a muffled thud, a wobble, dust off the wraps — no ring
  struck(heavy: boolean, fromX: number, fx: Fx): "hit" {
    const dir = this.x >= fromX ? 1 : -1;
    this.wobbleV += dir * (heavy ? 3.2 : 1.8);
    this.dents = Math.min(5, this.dents + (heavy ? 2 : 1));
    this.knitT = 0;
    fx.dust(this.x - dir * 8, GROUND_Y + this.z * Z_SLOPE - 68, heavy ? 7 : 4, dir * 0.5);
    return "hit";
  }

  update(dt: number) {
    // damped spring — the post remembers being a bell-tower beam; it sways, it settles
    const k = 46, c = 7.5;
    this.wobbleV += (-this.wobble * k - this.wobbleV * c) * dt;
    this.wobble += this.wobbleV * dt;
    this.knitT += dt;
    if (this.knitT > 14 && this.dents > 0) { this.dents--; this.knitT = 9; } // felt remembers its shape
  }

  draw(ctx: CanvasRenderingContext2D, t: number) {
    const gy = GROUND_Y + this.z * Z_SLOPE;
    const s = 1 + this.z * Z_SCALE;
    ctx.save();
    ctx.translate(this.x, gy);
    ctx.scale(s, s);
    ctx.rotate(this.wobble * 0.045);

    // contact shadow (the depth instrument, same law as every actor)
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = "#030403";
    ctx.beginPath(); ctx.ellipse(0, -2, 26, 6, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;

    // the post — a salvaged beam, centuries-planted, leaning a breath off true
    ctx.rotate(0.02);
    ctx.fillStyle = "#0d0a0c";
    ctx.beginPath();
    ctx.moveTo(-9, 0); ctx.lineTo(-7, -132); ctx.lineTo(6, -134); ctx.lineTo(10, 0);
    ctx.closePath(); ctx.fill();
    // worn crown — ten thousand practice cuts rounded it
    ctx.beginPath(); ctx.ellipse(-0.5, -133, 8, 4.5, 0.06, 0, TAU); ctx.fill();

    // felt wraps (the keepers' quieting) — three bands, cord-tied
    ctx.fillStyle = "#1a1416";
    for (const [y, h] of [[-58, 26], [-96, 18], [-122, 12]] as const) {
      ctx.beginPath();
      ctx.moveTo(-11, y); ctx.lineTo(11, y); ctx.lineTo(10, y - h); ctx.lineTo(-10, y - h);
      ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = "#241a14";
    ctx.lineWidth = 1.6;
    for (const y of [-62, -74, -100, -126]) {
      ctx.beginPath(); ctx.moveTo(-11, y); ctx.lineTo(11, y + 1.5); ctx.stroke();
    }
    // dents — the felt caves where steel landed, seams open a little
    ctx.fillStyle = "#060409";
    for (let i = 0; i < this.dents; i++) {
      const dy = -64 - (i * 13) % 52;
      const dxx = noise1(i * 3.7) * 6;
      ctx.beginPath(); ctx.arc(dxx, dy, 3.6, 0, TAU); ctx.fill();
    }
    // one garland at the crown, gone to seed — even a practice post is kept
    ctx.strokeStyle = "#2b2118";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -128);
    ctx.quadraticCurveTo(0, -122 + noise1(t * 0.4) * 1.5, 8, -129);
    ctx.stroke();
    ctx.restore();
  }
}
