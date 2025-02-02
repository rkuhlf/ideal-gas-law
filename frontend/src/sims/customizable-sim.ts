import { screenActiveInterval } from "../canvas-helpers.js";
import { initializeChart } from "../chart.js";
import { MovingAverage } from "../moving-average.js";
import { Simulation, ensureSimAtomCount } from "../pressure-simulation.js";
import { renderSimulation } from "../render-simulation.js";
import { addResizeListener } from "../canvas-helpers.js";
import { handleCustomDimensions } from "./input-handlers.js";
import { Atom } from "../atom.js";
import { scaled, squaredMagnitude } from "../vector.js";

function getNewAtom(width: number, height: number) {
  const mag = 500;

  return {
    position: [Math.random() * width, Math.random() * height],
    velocity: [Math.random() * mag - (mag / 2), Math.random() * mag - (mag / 2)],
  }
}

function getTemperature(sim: Simulation): number {
  const atoms = sim.getAtoms();
  return atoms.reduce((acc: number, a: Atom): number => {
    return acc + squaredMagnitude(a.velocity) / atoms.length;
  }, 0);
}

function setTemperature(sim: Simulation, newTemp: number) {
  let prevTemp = getTemperature(sim);
  let ratio = Math.sqrt(newTemp / prevTemp);

  for (const atom of sim.getAtoms()) {
    atom.velocity = scaled(atom.velocity, ratio);
  }
}

function getElements() {
  const simulationCanvas = document.getElementById("customizable-sim");
  const impulseCanvas = document.getElementById("customizable-sim-output");
  const atomCountInput = document.getElementById("atom-count");
  const constantFactorInput = document.getElementById("constant-input");
  const heightInput = document.getElementById("custom-sim-height-input");
  const widthInput = document.getElementById("costum-sim-width-input");
  const temperatureInput = document.getElementById("temperature-input");

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

  if (!(constantFactorInput instanceof HTMLInputElement)) {
    console.error("Could not find attraction input");
    throw new Error("Failed to find element");
  }

  if (!(heightInput instanceof HTMLInputElement)) {
    console.error("Could not find attraction input");
    throw new Error("Failed to find element");
  }

  if (!(widthInput instanceof HTMLInputElement)) {
    console.error("Could not find attraction input");
    throw new Error("Failed to find element");
  }

  if (!(temperatureInput instanceof HTMLInputElement)) {
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
    constantFactorInput,
    heightInput,
    widthInput,
    temperatureInput
  }
}

export function initializeCustomizableSim() {
  let simulationPeriod = 0.02;
  let renderPeriod = 0.02;

  const {
    simulationCanvas,
    simCtx,
    impulseCtx,
    atomCountInput,
    heightInput,
    widthInput,
    temperatureInput,
    constantFactorInput,
  } = getElements();

  const sim = new Simulation(Math.floor(simulationCanvas.getBoundingClientRect().width / 2), Math.floor(simulationCanvas.getBoundingClientRect().height / 2));
  addResizeListener(simulationCanvas);
  handleCustomDimensions(sim, heightInput, widthInput);

  atomCountInput.valueAsNumber = 50;
  ensureSimAtomCount(sim, () => getNewAtom(sim.width, sim.height), atomCountInput.valueAsNumber);
  atomCountInput.addEventListener("input", () => {
    ensureSimAtomCount(sim, () => getNewAtom(sim.width, sim.height), atomCountInput.valueAsNumber);
    // After we add a bunch of atoms with new velocities, make sure that the temperature is still the same.
    setTemperature(sim, temperatureInput.valueAsNumber);
  });

  temperatureInput.valueAsNumber = 20_000;
  setTemperature(sim, temperatureInput.valueAsNumber);
  temperatureInput.addEventListener("input", () => {
    temperatureInput.valueAsNumber = Math.max(temperatureInput.valueAsNumber, 1);
    setTemperature(sim, temperatureInput.valueAsNumber);
  });

  constantFactorInput.valueAsNumber = 0.0001;

  // We want to collect values for one second.
  const totalImpulse = new MovingAverage(1 / simulationPeriod);
  const totalImpulseAverage = new MovingAverage(10 / simulationPeriod);

  screenActiveInterval(() => {
    const result = sim.update(simulationPeriod, {
      jitteriness: 0,
      minDistance: 5,
      repulsiveness: 0,
    });
    
    const pressure = (result.totalHorizontalImpulse / sim.height + result.totalVerticalImpulse / sim.width) / 2;
    totalImpulse.addItem(pressure);
    totalImpulseAverage.addItem(pressure);
  }, simulationCanvas, simulationPeriod * 1000);

  screenActiveInterval(() => {
    renderSimulation(simulationCanvas, simCtx, sim);
  }, simulationCanvas, renderPeriod * 1000);

  const chartData: number[][] = [[], [], []];
  const chartLabels: number[] = [];
  const chart = initializeChart(impulseCtx, chartLabels, chartData, ['Live Data', 'Moving Average', 'Predicted'], "Pressure ()", "Pressure vs. Time");
  const start = Date.now();

  screenActiveInterval(() => {
    const timePassed = Date.now() - start;
    
    chartLabels.push(Math.round(timePassed / 1000));
    // P = c * nT / A
    chartData[2].push(constantFactorInput.valueAsNumber * atomCountInput.valueAsNumber * temperatureInput.valueAsNumber / sim.width / sim.height);
    chartData[1].push(totalImpulseAverage.getAverage());
    chartData[0].push(totalImpulse.getAverage());
    chart.update();
  }, simulationCanvas, 1000);
}