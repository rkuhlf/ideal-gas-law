import { screenActiveInterval } from "../canvas-helpers.js";
import { initializeChart } from "../chart.js";
import { MovingAverage } from "../moving-average.js";
import { Simulation, ensureSimAtomCount, renderSimulation } from "../pressure-simulation.js";

function getNewAtom(width: number, height: number) {
  const mag = 500;

  return {
    position: [Math.random() * width, Math.random() * height],
    velocity: [Math.random() * mag - (mag / 2), Math.random() * mag - (mag / 2)],
  }
}

function getElements() {
  const simulationCanvas = document.getElementById("customizable-sim");
  const impulseCanvas = document.getElementById("customizable-sim-output");
  const atomCountInput = document.getElementById("atom-count");
  const attractionInput = document.getElementById("attraction");

  if (!(simulationCanvas instanceof HTMLCanvasElement)) {
    console.error("Could not find canvas");
    throw new Error("Failed to find element");
  }
  if (!(impulseCanvas instanceof HTMLCanvasElement)) {
    console.error("Could not find canvas");
    throw new Error("Failed to find element");
  }

  if (!(atomCountInput instanceof HTMLInputElement)) {
    console.error("Could not find atom count input");
    throw new Error("Failed to find element");
  }

  if (!(attractionInput instanceof HTMLInputElement)) {
    console.error("Could not find attraction input");
    throw new Error("Failed to find element");
  }

  const simCtx = simulationCanvas.getContext("2d");
  if (!simCtx) {
    throw new Error("Failed to find element");
  }

  const impulseCtx = impulseCanvas.getContext("2d");
  if (!impulseCtx) {
    throw new Error("Failed to find element");
  }

  return {
    simulationCanvas,
    simCtx,
    impulseCtx,
    atomCountInput,
    attractionInput,
  }
}

export function initializeCustomizableSim() {
  let simulationPeriod = 0.02;
  let renderPeriod = 0.04;

  let attraction: number;

  const {
    simulationCanvas,
    simCtx,
    impulseCtx,
    atomCountInput,
    attractionInput,
  } = getElements();

  const width = simulationCanvas.width;
  const height = simulationCanvas.height;
  const sim = new Simulation(width, height);

  ensureSimAtomCount(sim, () => getNewAtom(width, height), atomCountInput.valueAsNumber);
  atomCountInput.addEventListener("input", () => {
    ensureSimAtomCount(sim, () => getNewAtom(width, height), atomCountInput.valueAsNumber);
  });

  attraction = attractionInput.valueAsNumber;
  attractionInput.addEventListener("input", () => {
    attraction = attractionInput.valueAsNumber;
  });

  // We want to collect values for one second.
  const totalImpulse = new MovingAverage(1 / simulationPeriod);
  const totalImpulseAverage = new MovingAverage(10 / simulationPeriod);

  screenActiveInterval(() => {
    const result = sim.update(simulationPeriod, {
      jitteriness: 0,
      minDistance: 5,
      repulsiveness: attraction,
    });
    
    totalImpulse.addItem(result.totalCollisionImpulse);
    totalImpulseAverage.addItem(result.totalCollisionImpulse);
  }, simulationPeriod * 1000);

  screenActiveInterval(() => {
    renderSimulation(simulationCanvas, simCtx, sim);
  }, renderPeriod * 1000);

  const chartData: number[][] = [[], []];
  const chartLabels: number[] = [];
  const chart = initializeChart(impulseCtx, chartLabels, chartData, ['Live Data', 'Moving Average'], "Pressure ()", "Pressure vs. Time");
  const start = Date.now();

  screenActiveInterval(() => {
    const timePassed = Date.now() - start;
    
    chartLabels.push(Math.round(timePassed / 1000));
    chartData[1].push(totalImpulseAverage.getAverage());
    chartData[0].push(totalImpulse.getAverage());
    chart.update();
  }, 1000);
}