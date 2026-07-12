// F1 perf overlay — off by default. Sim/render instrumented INSIDE the game
// because headless numbers are lies (see BRIEF §5).

export interface Perf { fps: number; simMs: number; renderMs: number }

export function drawDebug(
  ctx: CanvasRenderingContext2D,
  perf: Perf, state: string, zoom: number, dpr: number,
) {
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(8, 8, 190, 74);
  ctx.fillStyle = "#cfc6b8";
  ctx.font = "12px monospace";
  ctx.textBaseline = "top";
  ctx.fillText(`fps    ${perf.fps.toFixed(1)}`, 16, 14);
  ctx.fillText(`sim    ${perf.simMs.toFixed(2)} ms`, 16, 29);
  ctx.fillText(`render ${perf.renderMs.toFixed(2)} ms`, 16, 44);
  ctx.fillText(`${state}  zoom ${zoom.toFixed(2)}`, 16, 59);
  ctx.restore();
}
