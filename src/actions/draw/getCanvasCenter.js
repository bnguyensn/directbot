export default function getCanvasCenter(canvas) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: rect.width / 2,
    y: rect.height / 2,
  };
}
