// Painted-fleck FX: dust dabs, motes, petals, fireflies, ravens, shooting stars,
// sword smear. No shadowBlur, ever — glows are baked sprites.

import { mulberry32, TAU } from "./math";
import { bakeGlowSprite, WORLD_W } from "./paint";
// ash-petals fall in the Ember's column (Chapter 1 weather law: dead-still air,
// ash off the Ember, never rain) — the disc's apparent world-x sweeps 850..1450
// across the camera range, so the spawn band covers it

interface Particle {
  x: number; y: number; vx: number; vy: number;
  age: number; life: number; size: number; color: string;
}
interface Petal extends Particle { sway: number }
interface Firefly { x: number; y: number; bx: number; by: number; ph: number; ph2: number }
interface Bird { x: number; y: number; vx: number; flap: number; size: number }
interface Streak { x: number; y: number; vx: number; vy: number; age: number; life: number }
interface SmearSample { tx: number; ty: number; gx: number; gy: number; age: number }

const DUST_COLORS = ["#57503f", "#6a6250", "#4a4436", "#5f5744"];

export class Fx {
  private parts: Particle[] = [];
  private motes: Particle[] = [];
  private petals: Petal[] = [];
  private fireflies: Firefly[] = [];
  private birds: Bird[] = [];
  private streaks: Streak[] = [];
  private smears: SmearSample[] = [];
  private R = mulberry32(7);
  private glow = bakeGlowSprite();
  private petalTimer = 1.5;
  private birdTimer = 9;
  private streakTimer = 18;
  private emberTimer = 0.8;
  private embers: Particle[] = [];
  private ashTimer = 0.6;
  private ashes: Petal[] = [];

  constructor() {
    for (let i = 0; i < 26; i++) {
      this.motes.push({
        x: this.R() * WORLD_W, y: 500 + this.R() * 500,
        vx: 6 + this.R() * 10, vy: (this.R() - 0.5) * 6,
        age: this.R() * 10, life: 1e9,
        size: 0.8 + this.R() * 1.6,
        color: this.R() < 0.3 ? "#6b5142" : "#4d4a3c",
      });
    }
    for (let i = 0; i < 9; i++) {
      const bx = 300 + this.R() * 1800, by = 905 + this.R() * 95;
      this.fireflies.push({ x: bx, y: by, bx, by, ph: this.R() * TAU, ph2: this.R() * TAU });
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
    // dust
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.age += dt;
      if (p.age >= p.life) { this.parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 150 * dt;
      p.vx *= 1 - 1.6 * dt;
    }
    // motes
    for (const m of this.motes) {
      m.age += dt;
      m.x += (m.vx + Math.sin(m.age * 0.7) * 6) * dt;
      m.y += (m.vy + Math.sin(m.age * 0.43 + 2) * 5) * dt;
      if (m.x > WORLD_W) m.x -= WORLD_W;
      if (m.y < 420) m.y = 1000; if (m.y > 1040) m.y = 460;
    }
    // petals drifting off the flower field
    this.petalTimer -= dt;
    if (this.petalTimer <= 0 && this.petals.length < 14) {
      this.petalTimer = 1.2 + this.R() * 1.4;
      this.petals.push({
        x: 1050 + this.R() * 500, y: 915 + this.R() * 40,
        vx: -(8 + this.R() * 12), vy: 5 + this.R() * 9,
        age: 0, life: 5 + this.R() * 3,
        size: 1.4 + this.R() * 0.9, color: "#cfd0bd",
        sway: this.R() * TAU,
      });
    }
    for (let i = this.petals.length - 1; i >= 0; i--) {
      const p = this.petals[i];
      p.age += dt;
      if (p.age >= p.life) { this.petals.splice(i, 1); continue; }
      p.x += (p.vx + Math.sin(p.age * 1.6 + p.sway) * 10) * dt;
      p.y += (p.vy + Math.sin(p.age * 2.3 + p.sway) * 4) * dt;
    }
    // fireflies wander near their base
    for (const f of this.fireflies) {
      f.ph += dt * (0.5 + 0.3 * Math.sin(f.ph2));
      f.ph2 += dt * 0.23;
      f.x = f.bx + Math.sin(f.ph * 1.7) * 26 + Math.sin(f.ph2 * 2.1) * 14;
      f.y = f.by + Math.sin(f.ph * 1.1 + 2) * 12;
    }
    // ravens
    this.birdTimer -= dt;
    if (this.birdTimer <= 0) {
      this.birdTimer = 14 + this.R() * 16;
      const fromLeft = this.R() < 0.5;
      const n = 1 + ((this.R() * 3) | 0);
      const baseY = 260 + this.R() * 160;
      for (let i = 0; i < n; i++) {
        this.birds.push({
          x: fromLeft ? -40 - i * 26 : WORLD_W + 40 + i * 26,
          y: baseY + (this.R() - 0.5) * 40,
          vx: (fromLeft ? 1 : -1) * (55 + this.R() * 20),
          flap: this.R() * TAU,
          size: 6 + this.R() * 4,
        });
      }
    }
    for (let i = this.birds.length - 1; i >= 0; i--) {
      const b = this.birds[i];
      b.x += b.vx * dt;
      b.y += Math.sin(b.flap * 0.5) * 3 * dt;
      b.flap += dt * 9;
      if (b.x < -80 || b.x > WORLD_W + 80) this.birds.splice(i, 1);
    }
    // shooting stars
    this.streakTimer -= dt;
    if (this.streakTimer <= 0) {
      this.streakTimer = 22 + this.R() * 23;
      this.streaks.push({
        x: 200 + this.R() * 2000, y: 60 + this.R() * 200,
        vx: (this.R() < 0.5 ? -1 : 1) * (420 + this.R() * 220), vy: 260 + this.R() * 120,
        age: 0, life: 0.6,
      });
    }
    for (let i = this.streaks.length - 1; i >= 0; i--) {
      const s = this.streaks[i];
      s.age += dt;
      if (s.age >= s.life) { this.streaks.splice(i, 1); continue; }
      s.x += s.vx * dt; s.y += s.vy * dt;
    }
    // ash-petals falling off the Ember — dark flecks, silhouetted only where they
    // cross the disc and its glow. Slow (Law 5: all ambient motion is drift).
    this.ashTimer -= dt;
    if (this.ashTimer <= 0 && this.ashes.length < 12) {
      this.ashTimer = 0.9 + this.R() * 1.3;
      this.ashes.push({
        x: 800 + this.R() * 700, y: 320 + this.R() * 300,
        vx: (this.R() - 0.5) * 5, vy: 11 + this.R() * 7,
        age: 0, life: 15 + this.R() * 6,
        size: 1.3 + this.R() * 1.0, color: "#1a0806",
        sway: this.R() * TAU,
      });
    }
    for (let i = this.ashes.length - 1; i >= 0; i--) {
      const a = this.ashes[i];
      a.age += dt;
      if (a.age >= a.life) { this.ashes.splice(i, 1); continue; }
      a.x += (a.vx + Math.sin(a.age * 0.9 + a.sway) * 4) * dt;
      a.y += a.vy * dt;
    }
    // embers rising off the sun-warmed band
    this.emberTimer -= dt;
    if (this.emberTimer <= 0 && this.embers.length < 10) {
      this.emberTimer = 1.4 + this.R() * 2.2;
      this.embers.push({
        x: 850 + this.R() * 800, y: 920 + this.R() * 60,
        vx: -(4 + this.R() * 9), vy: -(8 + this.R() * 9),
        age: 0, life: 6 + this.R() * 3,
        size: 1 + this.R() * 0.7, color: "#c25a28",
      });
    }
    for (let i = this.embers.length - 1; i >= 0; i--) {
      const e = this.embers[i];
      e.age += dt;
      if (e.age >= e.life) { this.embers.splice(i, 1); continue; }
      e.x += (e.vx + Math.sin(e.age * 1.3) * 5) * dt;
      e.y += e.vy * dt;
    }
    // smear
    for (let i = this.smears.length - 1; i >= 0; i--) {
      this.smears[i].age += dt;
      if (this.smears[i].age > 0.16) this.smears.splice(i, 1);
    }
  }

  // called inside the world transform, BEFORE the knight (fx sit behind him)
  draw(ctx: CanvasRenderingContext2D) {
    // shooting stars
    for (const s of this.streaks) {
      const u = s.age / s.life;
      const a = 0.5 * Math.sin(Math.PI * u); // in-out
      const d = Math.hypot(s.vx, s.vy) || 1;
      const lx = (s.vx / d) * 70, ly = (s.vy / d) * 70;
      ctx.strokeStyle = `rgba(216,200,184,${a.toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(s.x - lx, s.y - ly);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }
    // ravens — two-stroke wings, flap
    ctx.strokeStyle = "#050304";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (const b of this.birds) {
      const w = Math.sin(b.flap) * 0.55;
      ctx.beginPath();
      ctx.moveTo(b.x - b.size, b.y - w * b.size);
      ctx.quadraticCurveTo(b.x, b.y + b.size * 0.18, b.x + b.size, b.y - w * b.size);
      ctx.stroke();
    }
    // motes
    for (const m of this.motes) {
      ctx.globalAlpha = 0.30 + Math.sin(m.age * 1.7) * 0.12;
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.size, m.size * 0.75, 0, 0, TAU);
      ctx.fill();
    }
    // ash-petals — dark tumbling flakes; visible only against the Ember's light
    for (const a of this.ashes) {
      const u = a.age / a.life;
      ctx.globalAlpha = 0.6 * (u < 0.08 ? u * 12.5 : 1 - Math.max(0, (u - 0.8) * 5));
      ctx.fillStyle = a.color;
      ctx.beginPath();
      ctx.ellipse(a.x, a.y, a.size, a.size * 0.55, Math.sin(a.age * 1.1 + a.sway) * 1.2, 0, TAU);
      ctx.fill();
    }
    // petals
    for (const p of this.petals) {
      const u = p.age / p.life;
      ctx.globalAlpha = 0.55 * (u < 0.1 ? u * 10 : 1 - Math.max(0, (u - 0.75) * 4));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, Math.sin(p.age * 2 + p.sway) * 0.8, 0, TAU);
      ctx.fill();
    }
    // fireflies — baked glow sprite + hot core
    for (const f of this.fireflies) {
      const pulse = 0.16 + 0.34 * (0.5 + 0.5 * Math.sin(f.ph * 2.3 + f.ph2));
      ctx.globalAlpha = pulse;
      ctx.drawImage(this.glow, f.x - 14, f.y - 14);
      ctx.globalAlpha = Math.min(1, pulse * 1.8);
      ctx.fillStyle = "#ffb066";
      ctx.fillRect(f.x - 0.8, f.y - 0.8, 1.6, 1.6);
    }
    // embers — tiny warm sparks, pulsing
    for (const e of this.embers) {
      const u = e.age / e.life;
      ctx.globalAlpha = 0.4 * Math.sin(Math.PI * Math.min(1, u * 1.1)) * (0.7 + 0.3 * Math.sin(e.age * 5));
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, e.size, e.size * 0.8, 0, 0, TAU);
      ctx.fill();
    }
    // dust
    for (const p of this.parts) {
      const u = p.age / p.life;
      ctx.globalAlpha = 0.55 * (1 - u);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size * (1 + u * 0.8), p.size * 0.7, 0, 0, TAU);
      ctx.fill();
    }
    // sword smear
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
