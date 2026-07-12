// Painted-fleck FX: dust dabs, drifting motes, sword smear. No shadowBlur, ever.

import { mulberry32, TAU } from "./math";

interface Particle {
  x: number; y: number; vx: number; vy: number;
  age: number; life: number; size: number; color: string;
}

interface SmearSample { tx: number; ty: number; gx: number; gy: number; age: number }

const DUST_COLORS = ["#57503f", "#6a6250", "#4a4436", "#5f5744"];

export class Fx {
  private parts: Particle[] = [];
  private motes: Particle[] = [];
  private smears: SmearSample[] = [];
  private R = mulberry32(7);

  constructor() {
    // ambient motes — pollen/ash drifting through the field
    for (let i = 0; i < 26; i++) {
      this.motes.push({
        x: this.R() * 2400, y: 500 + this.R() * 500,
        vx: 6 + this.R() * 10, vy: (this.R() - 0.5) * 6,
        age: this.R() * 10, life: 1e9,
        size: 0.8 + this.R() * 1.6,
        color: this.R() < 0.3 ? "#6b5142" : "#4d4a3c",
      });
    }
  }

  dust(x: number, y: number, n: number, dir: number) {
    for (let i = 0; i < n; i++) {
      this.parts.push({
        x: x + (this.R() - 0.5) * 14, y: y - this.R() * 6,
        vx: dir * (12 + this.R() * 42) + (this.R() - 0.5) * 24,
        vy: -(18 + this.R() * 50),
        age: 0, life: 0.45 + this.R() * 0.5,
        size: 1.6 + this.R() * 3.2,
        color: DUST_COLORS[(this.R() * DUST_COLORS.length) | 0],
      });
    }
  }

  smear(tx: number, ty: number, gx: number, gy: number) {
    this.smears.push({ tx, ty, gx, gy, age: 0 });
  }

  update(dt: number) {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.age += dt;
      if (p.age >= p.life) { this.parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 150 * dt;
      p.vx *= 1 - 1.6 * dt;
    }
    for (const m of this.motes) {
      m.age += dt;
      m.x += (m.vx + Math.sin(m.age * 0.7) * 6) * dt;
      m.y += (m.vy + Math.sin(m.age * 0.43 + 2) * 5) * dt;
      if (m.x > 2400) m.x -= 2400;
      if (m.y < 420) m.y = 1000; if (m.y > 1040) m.y = 460;
    }
    for (let i = this.smears.length - 1; i >= 0; i--) {
      this.smears[i].age += dt;
      if (this.smears[i].age > 0.16) this.smears.splice(i, 1);
    }
  }

  // called inside the world transform
  draw(ctx: CanvasRenderingContext2D) {
    for (const m of this.motes) {
      ctx.globalAlpha = 0.30 + Math.sin(m.age * 1.7) * 0.12;
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.size, m.size * 0.75, 0, 0, TAU);
      ctx.fill();
    }
    for (const p of this.parts) {
      const u = p.age / p.life;
      ctx.globalAlpha = 0.55 * (1 - u);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size * (1 + u * 0.8), p.size * 0.7, 0, 0, TAU);
      ctx.fill();
    }
    // sword smear — ribbon between consecutive samples
    for (let i = 1; i < this.smears.length; i++) {
      const a = this.smears[i - 1], b = this.smears[i];
      const alpha = 0.20 * (1 - b.age / 0.16);
      if (alpha <= 0) continue;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#c99b72";
      ctx.beginPath();
      ctx.moveTo(a.tx, a.ty);
      ctx.lineTo(b.tx, b.ty);
      ctx.lineTo(b.gx, b.gy);
      ctx.lineTo(a.gx, a.gy);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
