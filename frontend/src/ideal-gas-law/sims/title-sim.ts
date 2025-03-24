import { screenActiveInterval } from "../canvas-helpers.js";
import { Simulation, ensureSimAtomCount } from "../pressure-simulation.js";
import { renderBackground, renderParticles } from "../render-simulation.js";
import { addResizeListener } from "../canvas-helpers.js";
import { randomDirection, scaled } from "../vector.js";

function getNewAtom(width: number, height: number) {
    const mag = Math.sqrt(width * height) * 0.1;
    return {
        position: [Math.random() * width, Math.random() * height],
        // Set the velocity to the height so that it is hitting once per iteration, like we said in the description.
        velocity: scaled(randomDirection(), mag),
    }
}


function getElements() {
    const simulationCanvas = document.getElementById("title-sim");
    const titleText = document.getElementById("title-text");
    if (!(simulationCanvas instanceof HTMLCanvasElement)) {
        console.error("Could not find canvas");
        throw new Error("Failed to find element");
    }
    const simCtx = simulationCanvas.getContext("2d");
    if (!simCtx) {
        throw new Error("Failed to find element");
    }

    if (!(titleText instanceof HTMLElement)) {
        throw new Error("Failed to find title text");
    }

    return {
        simulationCanvas,
        simCtx,
        titleText,
    }
}

export function initializeTitleSim() {
    let simulationPeriod = 0.02;
    let renderPeriod = 0.02;
    let titleWidth = 100;
    let titleHeight = 100;

    const {
        simulationCanvas,
        simCtx,
        titleText,
    } = getElements();

    const width = simulationCanvas.width;
    const height = simulationCanvas.height;
    const sim = new Simulation(width, height);

    ensureSimAtomCount(sim, () => getNewAtom(sim.width, sim.height), 50);

    screenActiveInterval(() => {
        sim.update(simulationPeriod, {
            jitteriness: 0,
            minDistance: 5,
            repulsiveness: 0,
        });

        // Bounce the particles off of the title.
        for (const atom of sim.getAtoms()) {
            // If the particle is within the title
            if (Math.abs(atom.position[0] - sim.width / 2) < titleWidth / 2 && Math.abs(atom.position[1] - sim.height / 2) < titleHeight / 2) {
                // Check which side it's closest to.
                const leftDistance = Math.abs(atom.position[0] - (sim.width / 2 - titleWidth / 2));
                const rightDistance = Math.abs(atom.position[0] - (sim.width / 2 + titleWidth / 2));
                const topDistance = Math.abs(atom.position[1] - (sim.height / 2 - titleHeight / 2));
                const bottomDistance = Math.abs(atom.position[1] - (sim.height / 2 + titleHeight / 2));

                if (leftDistance < rightDistance && leftDistance < topDistance && leftDistance < bottomDistance) {
                    // Bounce off of the left wall.
                    atom.velocity[0] *= -1;
                    atom.position[0] = sim.width / 2 - titleWidth / 2;
                } else if (rightDistance < topDistance && rightDistance < bottomDistance) {
                    // Bounce off of the right wall.
                    atom.velocity[0] *= -1;
                    atom.position[0] = sim.width / 2 + titleWidth / 2;
                } else if (topDistance < bottomDistance) {
                    // Bounce off of the top wall.
                    atom.velocity[1] *= -1;
                    atom.position[1] = sim.height / 2 - titleHeight / 2;
                } else {
                    // Bounce off of the bottom wall.
                    atom.velocity[1] *= -1;
                    atom.position[1] = sim.height / 2 + titleHeight / 2;
                }
            }
        }

        // We also slow the atoms down each second.
        for (const atom of sim.getAtoms()) {
            atom.velocity = scaled(atom.velocity, 0.995);
        }
    }, simulationCanvas, simulationPeriod * 1000);

    screenActiveInterval(() => {
        renderBackground(simulationCanvas, simCtx, "#9ec7f5");
        renderParticles(simCtx, sim);
    }, simulationCanvas, renderPeriod * 1000);

    addResizeListener(simulationCanvas, (width, height) => {
        const {width: newTitleWidth, height: newTitleHeight} = titleText.getBoundingClientRect();
        titleWidth = newTitleWidth;
        titleHeight = newTitleHeight;
        sim.resize(width, height);
    });
}