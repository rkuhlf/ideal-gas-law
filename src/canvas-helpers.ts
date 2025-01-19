

export function screenActiveInterval(handler: () => void, timeout: number) {
    setInterval(() => {
      if (!document.hidden) {
        handler();
      }
    }, timeout);
  }