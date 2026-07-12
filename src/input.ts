// Keyboard + gamepad. Edge-triggered actions, polled axis.

export class Input {
  private keys = new Set<string>();
  private edges = new Set<string>();
  anyKeyThisFrame = false;

  constructor() {
    window.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      this.edges.add(e.code);
      this.anyKeyThisFrame = true;
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    window.addEventListener("blur", () => this.keys.clear());
  }

  private pad(): Gamepad | null {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) if (p && p.connected) return p;
    return null;
  }
  private padPrev = new Set<number>();
  private padEdges = new Set<number>();

  pollPad() {
    const p = this.pad();
    this.padEdges.clear();
    if (!p) return;
    p.buttons.forEach((b, i) => {
      if (b.pressed && !this.padPrev.has(i)) { this.padEdges.add(i); this.anyKeyThisFrame = true; }
      if (b.pressed) this.padPrev.add(i); else this.padPrev.delete(i);
    });
  }

  axis(): number {
    let a = 0;
    if (this.keys.has("ArrowLeft") || this.keys.has("KeyA")) a -= 1;
    if (this.keys.has("ArrowRight") || this.keys.has("KeyD")) a += 1;
    const p = this.pad();
    if (p && Math.abs(p.axes[0]) > 0.25) a += p.axes[0];
    if (p) {
      if (p.buttons[14]?.pressed) a -= 1; // dpad
      if (p.buttons[15]?.pressed) a += 1;
    }
    return Math.max(-1, Math.min(1, a));
  }

  attackPressed() { return this.edges.has("KeyJ") || this.edges.has("KeyX") || this.padEdges.has(0); }
  hitPressed() { return this.edges.has("KeyH") || this.padEdges.has(2); }
  replayPressed() { return this.edges.has("KeyR") || this.padEdges.has(9); }
  debugPressed() { return this.edges.has("F1"); }

  endFrame() {
    this.edges.clear();
    this.anyKeyThisFrame = false;
  }
}
