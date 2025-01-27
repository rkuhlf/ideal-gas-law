
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