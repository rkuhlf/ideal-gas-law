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
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const atom of sim.getAtoms()) {
    drawAtom(ctx, atom, offset);
  }

  // for (const atom of sim.grid.getNear(cursor_x, cursor_y, 50)) {
  //   drawAtomColor(ctx, atom);
  // }

  // ctx.beginPath();
  // ctx.arc(cursor_x, cursor_y, 50, 0, Math.PI * 2);
  // ctx.strokeStyle = "blue"; // Color of the perimeter
  // ctx.lineWidth = 2;        // Thickness of the perimeter
  // ctx.stroke();             // Draw the stroke
  // ctx.closePath();
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