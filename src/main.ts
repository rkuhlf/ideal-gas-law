import { initializeCustomizableSim } from "./sims/customizable-sim.js";
import { initializeRandomDirectionSim } from "./sims/random-direction-sim.js";
import { initializeParticleSim } from "./sims/single-particle-sim.js";
// Included from $(go env GOROOT)/misc/wasm/wasm_exec.js
// This was seeminig to be the wrong version somehow?

import "./wasm_exec.js";

async function loadWasm() {
  const go = new Go();
  const response = await fetch("/wasm/add.wasm");
  const buffer = await response.arrayBuffer();

  const { instance } = await WebAssembly.instantiate(buffer, go.importObject);
  go.run(instance);
  console.log(add());

  // const { instance } = await WebAssembly.instantiateStreaming(fetch("/wasm/simple.wasm"), importObject);

  // go.run(instance);
  // console.log("Go WASM loaded!");
}



document.addEventListener("DOMContentLoaded", async () => {
  await loadWasm();

  // console.log(add());

  // initializeCustomizableSim();
  // initializeParticleSim();
  initializeRandomDirectionSim();
});

