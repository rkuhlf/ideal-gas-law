import { screenActiveInterval } from "../canvas-helpers.js";
import { initializeChart } from "../chart.js";
import { MovingAverage } from "../moving-average.js";
import { Simulation } from "../pressure-simulation.js";
import { renderSimulation } from "../render-simulation.js";
import { addResizeListener } from "../canvas-helpers.js";

function getNewAtom(width: number, height: number) {
    return {
        position: [Math.random() * width, Math.random() * height],
        // Set the velocity to the height so that it is hitting once per iteration, like we said in the description.
        velocity: [0, height],
    }
}


function getElements() {
    const simulationCanvas = document.getElementById("particle-model-sim");
    const impulseCanvas = document.getElementById("particle-model-sim-output");
    const perAtomCanvas = document.getElementById("particle-model-sim-output");
    const addAtomInput = document.getElementById("add-atom");

    if (!(simulationCanvas instanceof HTMLCanvasElement)) {
        console.error("Could not find canvas");
        throw new Error("Failed to find element");
    }
    if (!(impulseCanvas instanceof HTMLCanvasElement)) {
        console.error("Could not find canvas");
        throw new Error("Failed to find element");
    }
    if (!(perAtomCanvas instanceof HTMLCanvasElement)) {
        console.error("Could not find canvas");
        throw new Error("Failed to find element");
    }

    if (!(addAtomInput instanceof HTMLButtonElement)) {
        console.error("Could not find atom count input");
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
    const perAtomCtx = impulseCanvas.getContext("2d");
    if (!perAtomCtx) {
        throw new Error("Failed to find element");
    }

    return {
        simulationCanvas,
        simCtx,
        impulseCtx,
        perAtomCtx,
        addAtomInput,
    }
}

export function initializeParticleSim() {
    let simulationPeriod = 0.02;
    let renderPeriod = 0.02;

    const {
        simulationCanvas,
        simCtx,
        impulseCtx,
        perAtomCtx,
        addAtomInput,
    } = getElements();

    const width = simulationCanvas.width;
    const height = simulationCanvas.height;
    const sim = new Simulation(width, height);

    let atomCount = 1;
    sim.addAtom(getNewAtom(width, height));
    addAtomInput.onclick = (): void => {
        atomCount += 1;
        sim.addAtom(getNewAtom(width, height));
    }
    // There should be a chart that says the pressure-per-atom.

    // We want to collect values for one second.
    const totalImpulse = new MovingAverage(1 / simulationPeriod);
    const totalImpulseAverage = new MovingAverage(10 / simulationPeriod);

    screenActiveInterval(() => {
        const result = sim.update(simulationPeriod, {
            jitteriness: 0,
            minDistance: 5,
            repulsiveness: 0,
        });

        totalImpulse.addItem(result.totalHorizontalImpulse + result.totalVerticalImpulse);
        totalImpulseAverage.addItem(result.totalHorizontalImpulse + result.totalVerticalImpulse);
    }, simulationCanvas, simulationPeriod * 1000);

    screenActiveInterval(() => {
        renderSimulation(simulationCanvas, simCtx, sim);
    }, simulationCanvas, renderPeriod * 1000);

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
    }, simulationCanvas, 1000);

    addResizeListener(simulationCanvas, sim.resize.bind(sim));
}