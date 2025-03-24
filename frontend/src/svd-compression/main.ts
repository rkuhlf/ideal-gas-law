// Included from $(go env GOROOT)/misc/wasm/wasm_exec.js
import "../wasm-exec.js";

async function loadWasm() {
  const go = new Go();
  const response = await fetch("/wasm/svd-compression.wasm");
  const buffer = await response.arrayBuffer();

  const { instance } = await WebAssembly.instantiate(buffer, go.importObject);
  go.run(instance);
  console.log(request());
}


document.addEventListener("DOMContentLoaded", async () => {
    await loadWasm();


});