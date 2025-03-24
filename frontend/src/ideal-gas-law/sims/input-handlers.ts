// Code for updating simulations in response to changes in input.

interface Resizable {
    resize: (width: number, height: number) => void;
    width: number;
    height: number;
}

export function handleCustomDimensions(sim: Resizable, heightInput: HTMLInputElement, widthInput: HTMLInputElement) {
    heightInput.valueAsNumber = sim.height;
    widthInput.valueAsNumber = sim.width;
    console.log(widthInput.valueAsNumber, sim.width)
    widthInput.addEventListener('change', () => {
        widthInput.valueAsNumber = Math.max(widthInput.valueAsNumber, 0);
        sim.resize(widthInput.valueAsNumber, sim.height);
    });
    heightInput.addEventListener('change', () => {
        heightInput.valueAsNumber = Math.max(heightInput.valueAsNumber, 0);
        sim.resize(sim.width, heightInput.valueAsNumber);
    });
}