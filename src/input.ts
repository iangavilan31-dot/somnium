// Two-player input — the CROAKDOWN drop-in model, fiction-native.
// Keyboard always drives P1. Pads claim slots on first button press:
// a pad claims P1 if no pad owns P1 AND the keyboard hasn't spoken since the wake;
// otherwise it claims P2 (which IS the join signal — P2 wakes into the scene).
// No lobby, no prompt: pressing a button on a second controller is "waking up".

const P1_KEYS_AXIS_NEG = ["ArrowLeft", "KeyA"];
const P1_KEYS_AXIS_POS = ["ArrowRight", "KeyD"];
// THE DEPTH BAND (M&C §18): W/up = away from the reader (−z), S/down = toward (+z).
// The rest/tend gesture moved from S-hold to E-hold when S became a movement key.
const P1_KEYS_DEPTH_NEG = ["ArrowUp", "KeyW"];
const P1_KEYS_DEPTH_POS = ["ArrowDown", "KeyS"];

export class PlayerInput {
  padIndex = -1; // claimed pad, -1 = none
  useKeyboard = false;
  private hub: InputHub;
  constructor(hub: InputHub, useKeyboard: boolean) {
    this.hub = hub;
    this.useKeyboard = useKeyboard;
  }
  private pad(): Gamepad | null {
    if (this.padIndex < 0) return null;
    const p = navigator.getGamepads ? navigator.getGamepads()[this.padIndex] : null;
    return p && p.connected ? p : null;
  }
  axis(): number {
    let a = 0;
    if (this.useKeyboard) {
      for (const k of P1_KEYS_AXIS_NEG) if (this.hub.keys.has(k)) a -= 1;
      for (const k of P1_KEYS_AXIS_POS) if (this.hub.keys.has(k)) a += 1;
    }
    const p = this.pad();
    if (p) {
      if (Math.abs(p.axes[0]) > 0.25) a += p.axes[0];
      if (p.buttons[14]?.pressed) a -= 1;
      if (p.buttons[15]?.pressed) a += 1;
    }
    return Math.max(-1, Math.min(1, a));
  }
  axisZ(): number {
    let a = 0;
    if (this.useKeyboard) {
      for (const k of P1_KEYS_DEPTH_NEG) if (this.hub.keys.has(k)) a -= 1;
      for (const k of P1_KEYS_DEPTH_POS) if (this.hub.keys.has(k)) a += 1;
    }
    const p = this.pad();
    if (p) {
      if (Math.abs(p.axes[1]) > 0.25) a += p.axes[1]; // stick down = toward the reader
      if (p.buttons[12]?.pressed) a -= 1;
      if (p.buttons[13]?.pressed) a += 1;
    }
    return Math.max(-1, Math.min(1, a));
  }
  private padEdge(b: number) { return this.padIndex >= 0 && this.hub.padEdges.get(this.padIndex)?.has(b); }
  private key(c: string) { return this.useKeyboard && this.hub.edges.has(c); }
  private keyHeld(c: string) { return this.useKeyboard && this.hub.keys.has(c); }
  private padHeld(b: number) {
    const p = this.pad();
    return !!p?.buttons[b]?.pressed;
  }
  // ---- the moveset inputs (M&C §10). Lights fire on PRESS — feel honesty. ----
  attackPressed() { return this.key("KeyJ") || this.key("KeyX") || this.padEdge(0); } // cross/A tap = light
  heavyPressed() { return this.key("KeyI") || this.padEdge(7); }  // RT press starts the charge
  heavyHeld() { return this.keyHeld("KeyI") || this.padHeld(7); } // release fires the heavy
  rollPressed() { return this.key("KeyK") || this.padEdge(1); }   // B tap: roll (dir) / backstep (neutral)
  sprintHeld() {                                                  // hold-to-sprint (Souls muscle memory)
    return this.keyHeld("ShiftLeft") || this.keyHeld("ShiftRight") || this.keyHeld("KeyK") || this.padHeld(1);
  }
  guardHeld() { return this.keyHeld("KeyL") || this.padHeld(4); } // LB hold = guard
  parryPressed() { return this.key("KeyO") || this.key("Semicolon") || this.padEdge(5); } // RB tap = Hush-parry
  jumpPressed() { return this.key("Space") || this.padEdge(3); } // Y/triangle = jump (gap verb; free only in the yard)
  hitPressed() { return this.key("KeyH"); } // debug harm (keyboard only)
  restHeld() { return this.keyHeld("KeyE") || this.padHeld(1); } // E / circle/B held = the tend gesture (S now walks the band)
  replayPressed() { return this.key("KeyR") || this.padEdge(9); }
}

export class InputHub {
  keys = new Set<string>();
  edges = new Set<string>();
  padEdges = new Map<number, Set<number>>();
  anyKeyThisFrame = false;
  keyboardSpoke = false; // has the keyboard EVER driven movement/attack this scene
  p1: PlayerInput;
  p2: PlayerInput;
  p2JoinRequested = false; // set the frame an unclaimed pad claims P2

  private padPrev = new Map<number, Set<number>>();

  constructor() {
    this.p1 = new PlayerInput(this, true);
    this.p2 = new PlayerInput(this, false);
    window.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      this.edges.add(e.code);
      this.anyKeyThisFrame = true;
      this.keyboardSpoke = true;
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    window.addEventListener("blur", () => this.keys.clear());
  }

  pollPads() {
    this.p2JoinRequested = false;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < pads.length; i++) {
      const p = pads[i];
      if (!p || !p.connected) continue;
      let prev = this.padPrev.get(i);
      if (!prev) { prev = new Set(); this.padPrev.set(i, prev); }
      let edges = this.padEdges.get(i);
      if (!edges) { edges = new Set(); this.padEdges.set(i, edges); }
      edges.clear();
      let anyPress = false;
      p.buttons.forEach((b, bi) => {
        if (b.pressed && !prev.has(bi)) { edges.add(bi); anyPress = true; this.anyKeyThisFrame = true; }
        if (b.pressed) prev.add(bi); else prev.delete(bi);
      });
      // slot claiming — the drop-in doorway
      const claimed = i === this.p1.padIndex || i === this.p2.padIndex;
      if (anyPress && !claimed) {
        if (this.p1.padIndex < 0 && !this.keyboardSpoke) {
          this.p1.padIndex = i; // solo pad play: first pad is P1
        } else if (this.p2.padIndex < 0) {
          this.p2.padIndex = i;
          this.p2JoinRequested = true; // P2 wakes up
        }
      }
    }
  }

  debugPressed() { return this.edges.has("F1"); }
  endFrame() {
    this.edges.clear();
    this.anyKeyThisFrame = false;
  }
}
