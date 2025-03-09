import { initializeCustomDimensionSim } from "./sims/custom-dimensions-sim.js";
import { initializeCustomizableSim } from "./sims/customizable-sim.js";
import { initializeRandomDirectionSim } from "./sims/random-direction-sim.js";
import { initializeParticleSim } from "./sims/single-particle-sim.js";
import "./components/inputs.js"
import "./components/math.js"
import "./components/chart.js"
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


import katex from "katex";
import "katex/dist/katex.min.css";
import { initializeTitleSim } from "./sims/title-sim.js";



document.addEventListener("DOMContentLoaded", async () => {
  await loadWasm();

  
  const mathElements = document.querySelectorAll(".math");
  for (const el of mathElements) {
    if (!(el instanceof HTMLElement)) continue;
    katex.render(el.innerText || "", el, {
      displayMode: false,
    });
  }


  initializeParticleSim();
  initializeRandomDirectionSim();
  initializeCustomizableSim();
  initializeCustomDimensionSim();
  initializeTitleSim();
});

