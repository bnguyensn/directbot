export default function getAngleFromDirection(direction) {
  switch (direction) {
    case 'up':
      return -90;
    case 'down':
      return 90;
    case 'left':
      return 180;
    case 'right':
      return 0;
    default:
      return 0;
  }
}
