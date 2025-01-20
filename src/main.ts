import { initializeCustomizableSim } from "./sims/customizable-sim.js";
import { initializeRandomDirectionSim } from "./sims/random-direction-sim.js";
import { initializeParticleSim } from "./sims/single-particle-sim.js";

document.addEventListener("DOMContentLoaded", () => {
  // initializeCustomizableSim();
  // initializeParticleSim();
  initializeRandomDirectionSim();
});

