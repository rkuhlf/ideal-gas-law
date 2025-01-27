import { screenActiveInterval } from "../canvas-helpers.js";
import { initializeChart } from "../chart.js";
import { MovingAverage } from "../moving-average.js";
import { Simulation, ensureSimAtomCount } from "../pressure-simulation.js";
import { renderSimulation } from "../render-simulation.js";
import { magnitude, randomDirection, scaled } from "../vector.js";

function getAtomVelocity(mag: number, isRandomDirection: boolean): number[] {
    if (!isRandomDirection) {
        return [0, mag];
    }

    return scaled(randomDirection(), mag);
}

function getNewAtom(width: number, height: number, isRandomDirection: boolean) {
    const mag = (Math.random() - 0.5) * height;
    return {
        position: [Math.random() * width, Math.random() * height],
        // Set the velocity to the height so that it is hitting once per iteration, like we said in the description.
        velocity: getAtomVelocity(mag, isRandomDirection),
    }
}

function getElements() {
    const simulationCanvas = document.getElementById("random-direction-sim");
    const impulseCanvas = document.getElementById("random-direction-sim-output");
    const randomDirectionToggle = document.getElementById("random-direction");

    if (!(simulationCanvas instanceof HTMLCanvasElement)) {
        console.error("Could not find canvas");
        throw new Error("Failed to find element");
    }
    if (!(impulseCanvas instanceof HTMLCanvasElement)) {
        console.error("Could not find canvas");
        throw new Error("Failed to find element");
    }

    if (!(randomDirectionToggle instanceof HTMLInputElement)) {
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
        randomDirectionToggle,
    }
}

export function initializeRandomDirectionSim() {
    const simulationPeriod = 0.02;
    const renderPeriod = 0.02;
    const atomCount = 100;

    const {
        simulationCanvas,
        simCtx,
        impulseCtx,
        randomDirectionToggle
    } = getElements();

    const width = simulationCanvas.width;
    const height = simulationCanvas.height;
    const sim = new Simulation(width, height);

    let isRandomDirection = false;
    randomDirectionToggle.addEventListener('change', () => {
        isRandomDirection = randomDirectionToggle.checked;

        // Not good to modify these atoms in-place because it breaks encapsulation but it's okay for now.
        for (const atom of sim.getAtoms()) {
            atom.velocity = getAtomVelocity(magnitude(atom.velocity), isRandomDirection);
        }
    })

    ensureSimAtomCount(sim, () => getNewAtom(width, height, isRandomDirection), atomCount);
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
}