import { initializeCustomDimensionSim } from "./sims/custom-dimensions-sim.js";
import { initializeCustomizableSim } from "./sims/customizable-sim.js";
import { initializeRandomDirectionSim } from "./sims/random-direction-sim.js";
import { initializeParticleSim } from "./sims/single-particle-sim.js";
// Included from $(go env GOROOT)/misc/wasm/wasm_exec.js
import "./wasm-exec.js";

async function loadWasm() {
  const go = new Go();
  const response = await fetch("/wasm/main.wasm");
  const buffer = await response.arrayBuffer();

  const { instance } = await WebAssembly.instantiate(buffer, go.importObject);
  go.run(instance);
  console.log(add());
}



document.addEventListener("DOMContentLoaded", async () => {
  await loadWasm();

  initializeParticleSim();
  initializeRandomDirectionSim();
  initializeCustomizableSim();
  initializeCustomDimensionSim();
});

