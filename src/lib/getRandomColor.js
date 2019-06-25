const colors = [
  '#f44336',
  '#ff9800',
  '#ffeb3b',
  '#2196f3',
  '#4caf50',
  '#3f51b5',
  '#9c27b0',
];

export default function getRandomColor() {
  const i = Math.floor(Math.random() * 6);
  return colors[i];
}
