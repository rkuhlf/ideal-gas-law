
function isElementInView(element: HTMLElement, fullyInView: boolean = false) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  if (fullyInView) {
    // Check if the entire element is in the viewport
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= windowHeight &&
      rect.right <= windowWidth
    );
  } else {
    // Check if any part of the element is in the viewport
    return (
      rect.top < windowHeight &&
      rect.bottom > 0 &&
      rect.left < windowWidth &&
      rect.right > 0
    );
  }
}


export function screenActiveInterval(handler: () => void, inViewElement: HTMLElement, timeout: number) {
  setInterval(() => {
    if (!document.hidden && isElementInView(inViewElement)) {
      handler();
    }
  }, timeout);
}


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

export function addResizeListener(simulationCanvas: HTMLCanvasElement, callback: (width: number, height: number) => void) {
  const onResize = () => {
    const newWidth = simulationCanvas.getBoundingClientRect().width;
    const newHeight = simulationCanvas.getBoundingClientRect().height;
    // Change the canvas's width and height property so that the rendering isn't stretched.
    simulationCanvas.width = newWidth;
    simulationCanvas.height = newHeight;
    callback(newWidth, newHeight)
  }
  // Call it once initially to make sure the initial size is synchronized.
  onResize();
  addResizeEndedListener(onResize);
}