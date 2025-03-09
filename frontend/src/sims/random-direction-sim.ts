import { screenActiveInterval } from "../canvas-helpers.js";
import { initializeChart } from "../chart.js";
import { MovingAverage } from "../moving-average.js";
import { Simulation, ensureSimAtomCount, getHorizontalPressure, getPressure, getVerticalPressure } from "../pressure-simulation.js";
import { renderBoxedSimulation } from "../render-simulation.js";
import { magnitude, randomDirection, scaled } from "../vector.js";
import { addResizeListener } from "../canvas-helpers.js";
import { handleCustomDimensions } from "./input-handlers.js";

function getAtomVelocity(mag: number, isRandomDirection: boolean): number[] {
    if (!isRandomDirection) {
        if (Math.random() < 0.5)  {
            return [0, -mag];
        } else {
            return [0, mag];
        }
    }

    return scaled(randomDirection(), mag);
}

function getNewAtom(width: number, height: number, isRandomDirection: boolean) {
    const mag = (Math.random() - 0.5) * height * 2;
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
    const widthInput = document.getElementById("random-width-input");
    const heightInput = document.getElementById("random-height-input");

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

    if (!(widthInput instanceof HTMLInputElement)) {
        throw new Error("Failed to find element");
    }
    
    if (!(heightInput instanceof HTMLInputElement)) {
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
        randomDirectionToggle,
        widthInput,
        heightInput
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
        randomDirectionToggle,
        widthInput,
        heightInput,
    } = getElements();

    const sim = new Simulation(Math.floor(simulationCanvas.getBoundingClientRect().width / 2), Math.floor(simulationCanvas.getBoundingClientRect().height / 2));

    let isRandomDirection = false;
    randomDirectionToggle.addEventListener('change', () => {
        isRandomDirection = randomDirectionToggle.checked;

        // Not good to modify these atoms in-place because it breaks encapsulation but it's okay for now.
        for (const atom of sim.getAtoms()) {
            atom.velocity = getAtomVelocity(magnitude(atom.velocity), isRandomDirection);
        }
    })

    handleCustomDimensions(sim, heightInput, widthInput);
    ensureSimAtomCount(sim, () => getNewAtom(sim.width, sim.height, isRandomDirection), atomCount);

    // We want to collect values for one second.
    const totalImpulse = new MovingAverage(1 / simulationPeriod);
    const totalImpulseAverage = new MovingAverage(10 / simulationPeriod);
    const verticalImpulse = new MovingAverage(1 / simulationPeriod);
    const verticalImpulseAverage = new MovingAverage(10 / simulationPeriod);
    const horizontalImpulse = new MovingAverage(1 / simulationPeriod);
    const horizontalImpulseAverage = new MovingAverage(10 / simulationPeriod);

    screenActiveInterval(() => {
        const result = sim.update(simulationPeriod, {
            jitteriness: 0,
            minDistance: 5,
            repulsiveness: 0,
        });

        totalImpulse.addItem(getPressure(sim, result));
        totalImpulseAverage.addItem(getPressure(sim, result));
        horizontalImpulse.addItem(getHorizontalPressure(sim, result));
        horizontalImpulseAverage.addItem(getHorizontalPressure(sim, result));
        verticalImpulse.addItem(getVerticalPressure(sim, result));
        verticalImpulseAverage.addItem(getVerticalPressure(sim, result));
    }, simulationCanvas, simulationPeriod * 1000);

    screenActiveInterval(() => {
        renderBoxedSimulation(simulationCanvas, simCtx, sim);
    }, simulationCanvas, renderPeriod * 1000);

    const chartData: number[][] = [[], [], [], [], [], []];
    const chartLabels: number[] = [];
    const chart = initializeChart(impulseCtx, chartLabels, chartData, ['Live Pressure', 'Average Pressure', 'Live Horizontal Pressure', 'Average Horizontal Pressure', 'Live Vertical Pressure', 'Average Vertical Pressure'], "Pressure ()", "Pressure vs. Time");
    const start = Date.now();

    screenActiveInterval(() => {
        const timePassed = Date.now() - start;

        chartLabels.push(Math.round(timePassed / 1000));
        chartData[5].push(verticalImpulseAverage.getAverage());
        chartData[4].push(verticalImpulse.getAverage());
        chartData[3].push(horizontalImpulseAverage.getAverage());
        chartData[2].push(horizontalImpulse.getAverage());
        chartData[1].push(totalImpulseAverage.getAverage());
        chartData[0].push(totalImpulse.getAverage());
        chart.update();
    }, simulationCanvas, 1000);

    addResizeListener(simulationCanvas);
}