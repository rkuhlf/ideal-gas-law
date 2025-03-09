import { Atom } from "./atom.ts";
import { Simulation } from "./pressure-simulation.ts";

// var cursor_x = -1;
// var cursor_y = -1;
// document.onmousemove = function(event)
// {
//  cursor_x = event.pageX;
//  cursor_y = event.pageY;
// }


export function renderSimulation(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, sim: Simulation, offset: number[] = [0, 0]) {
  renderBackground(canvas, ctx);
  renderParticles(ctx, sim, offset);
}

export function renderBackground(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, color="white") {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function renderParticles(ctx: CanvasRenderingContext2D, sim: Simulation, offset: number[] = [0, 0]) {
  for (const atom of sim.getAtoms()) {
    drawAtom(ctx, atom, offset);
  }
}

export function renderBoxedSimulation(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, sim: Simulation) {
  const topLeftX = canvas.width / 2 - sim.width / 2
  const topLeftY = canvas.height / 2 - sim.height / 2
  renderSimulation(canvas, ctx, sim, [
      topLeftX,
      topLeftY,
  ]);

  ctx.strokeStyle = 'rgb(0, 0, 0)';
  const offset = 10;
  ctx.lineWidth = 5;
  ctx.strokeRect(
      topLeftX - offset / 2,
      topLeftY - offset / 2,
      sim.width + offset,
      sim.height + offset);
}


function drawAtom(ctx: CanvasRenderingContext2D, atom: Atom, offset: number[]= [0, 0]) {
  // Draw a single dot
  ctx.beginPath();
  ctx.arc(atom.position[0] + offset[0], atom.position[1] + offset[1], 5, 0, Math.PI * 2);
  ctx.fillStyle = "black"; // Dot color
  ctx.fill();
  ctx.closePath();
}

function drawAtomColor(ctx: CanvasRenderingContext2D, atom: Atom) {
  // Draw a single dot
  ctx.beginPath();
  ctx.arc(atom.position[0], atom.position[1], 5, 0, Math.PI * 2);
  ctx.fillStyle = "red"; // Dot color
  ctx.fill();
  ctx.closePath();
}