function resizeCanvasFnGenerator(canvas) {
  return () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

export function registerResizeCanvas(canvas) {
  const resizeCanvasFn = resizeCanvasFnGenerator(canvas);

  window.addEventListener('resize', resizeCanvasFn);

  return resizeCanvasFn
}

export function unregisterResizeCanvas(resizeCanvasFn) {
  window.removeEventListener('resize', resizeCanvasFn);
}
