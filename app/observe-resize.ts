export function setStyleIfChanged(element: HTMLElement, property: string, value: string) {
  if (element.style.getPropertyValue(property) !== value) {
    element.style.setProperty(property, value);
  }
}

export function observeResize(target: Element | null, callback: () => void): ResizeObserver {
  if (!target) {
    return {
      observe() {},
      unobserve() {},
      disconnect() {},
    } as ResizeObserver;
  }

  let frame = 0;

  const observer = new ResizeObserver(() => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      callback();
    });
  });

  observer.observe(target);
  return observer;
}
