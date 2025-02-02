function addResizeEndedListener(callback: () => void) {
    let resizeTimer: number | null = null;
    window.addEventListener("resize", () => {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
            resizeTimer = null;
        }
        
        resizeTimer = setTimeout(() => {
            callback();
        }, 200);
    });
}

export function addSimResizeListener(simulationCanvas: HTMLCanvasElement, callback: (width: number, height: number) => void) {
    addResizeEndedListener(() => {
        const newWidth = simulationCanvas.getBoundingClientRect().width;
        const newHeight = simulationCanvas.getBoundingClientRect().height;
        // Change the canvas's width and height property so that the rendering isn't stretched.
        simulationCanvas.width = newWidth;
        simulationCanvas.height = newHeight;
        callback(newWidth, newHeight)
    });
}