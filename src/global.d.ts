declare global {
    class Go {
        importObject: WebAssembly.Imports;
        run(instance: WebAssembly.Instance): Promise<void>;
    };
    function add(): void;
}
  
declare module "*.wasm" {
    const wasmModule: WebAssembly.Module;
    export default wasmModule;
  }
  
  

export {};
