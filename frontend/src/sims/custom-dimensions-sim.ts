import { screenActiveInterval } from "../canvas-helpers.js";
import { MovingAverage } from "../moving-average.js";
import { Simulation, ensureSimAtomCount } from "../pressure-simulation.js";
import { renderSimulation } from "../render-simulation.js";
import { randomDirection, scaled } from "../vector.js";
import { PressureChart } from "./pressure-chart.js";
import { addResizeListener as synchronizeCanvasDimensions } from "../canvas-helpers.js";
import { handleCustomDimensions } from "./input-handlers.js";

function getNewAtom(width: number, height: number) {
    // const mag = (Math.random() - 0.5) * height;
    const mag = height / 2;
    return {
        position: [Math.random() * width, Math.random() * height],
        // Set the velocity to the height so that it is hitting once per iteration, like we said in the description.
        velocity: scaled(randomDirection(), mag)
    }
}

function getElements() {
    const simulationCanvas = document.getElementById("custom-dimension-sim");
    const impulseCanvas = document.getElementById("custom-dimension-output");
    const widthInput = document.getElementById("width-input");
    const heightInput = document.getElementById("height-input");
    const timesAreaCanvas = document.getElementById("custom-dimension-output-per-area");

    if (!(simulationCanvas instanceof HTMLCanvasElement)) {
        console.error("Could not find canvas");
        throw new Error("Failed to find element");
    }
    if (!(impulseCanvas instanceof HTMLCanvasElement)) {
        console.error("Could not find canvas");
        throw new Error("Failed to find element");
    }
    if (!(timesAreaCanvas instanceof HTMLCanvasElement)) {
        console.error("Could not find canvas");
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
    const timesAreaCtx = timesAreaCanvas.getContext("2d");
    if (!timesAreaCtx) {
        throw new Error("Failed to find element");
    }

    return {
        simulationCanvas,
        simCtx,
        impulseCtx,
        timesAreaCtx,
        widthInput,
        heightInput,
    }
}

export function initializeCustomDimensionSim() {
    const simulationPeriod = 0.02;
    const renderPeriod = 0.02;
    const atomCount = 100;

    const {
        simulationCanvas,
        simCtx,
        impulseCtx,
        timesAreaCtx,
        widthInput,
        heightInput,
    } = getElements();


    const sim = new Simulation(Math.floor(simulationCanvas.getBoundingClientRect().width / 2), Math.floor(simulationCanvas.getBoundingClientRect().height / 2));

    ensureSimAtomCount(sim, () => getNewAtom(sim.width, sim.height), atomCount);
    handleCustomDimensions(sim, heightInput, widthInput);

    // We want to collect values for one second.
    const pressureChart = new PressureChart(impulseCtx, simulationPeriod);
    const timesArea = new MovingAverage(1 / simulationPeriod);
    const timesAreaAverage = new MovingAverage(10 / simulationPeriod);

    screenActiveInterval(() => {
        const result = sim.update(simulationPeriod, {
            jitteriness: 0,
            minDistance: 5,
            repulsiveness: 0,
        });

        const pressure = (result.totalHorizontalImpulse / sim.height + result.totalVerticalImpulse / sim.width) / 2
        pressureChart.runIter(pressure);

        timesArea.addItem(pressure * sim.width * sim.height);
        timesAreaAverage.addItem(pressure * sim.width * sim.height);
    }, simulationCanvas, simulationPeriod * 1000);

    screenActiveInterval(() => {
        const topLeftX = simulationCanvas.width / 2 - sim.width / 2
        const topLeftY = simulationCanvas.height / 2 - sim.height / 2
        renderSimulation(simulationCanvas, simCtx, sim, [
            topLeftX,
            topLeftY,
        ]);

        simCtx.strokeStyle = 'rgb(0, 0, 0)';
        const offset = 10;
        simCtx.lineWidth = 5;
        simCtx.strokeRect(
            topLeftX - offset / 2,
            topLeftY - offset / 2,
            sim.width + offset,
            sim.height + offset);
    }, simulationCanvas, renderPeriod * 1000);

    const timesAreaChartData: number[][] = [[], []];
    // const timesAreaChart = initializeChart(timesAreaCtx, chartLabels, timesAreaChartData, ['Live Data', 'Moving Average'], "Pressure * Area ()", "Pressure * Area vs. Time");
    const start = Date.now();

    screenActiveInterval(() => {

        pressureChart.update();


        // timesAreaChartData[1].push(timesAreaAverage.getAverage());
        // timesAreaChartData[0].push(timesArea.getAverage());
        // timesAreaChart.update();
    }, simulationCanvas, 1000);

    synchronizeCanvasDimensions(simulationCanvas);
}