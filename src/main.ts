// SOMNIUM — wake in a world.
// Gate 0 (animation spike) is the only thing that gets built first. Read BRIEF.md.

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

function resize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
}
window.addEventListener("resize", resize);
resize();

function frame() {
  ctx.fillStyle = "#060505";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
