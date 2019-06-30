import paper from 'paper';
import randBetweenInt from '../../lib/randBetweenInt';

export default function getPipeStartPoint(view) {
  const bounds = view.bounds;
  const pointBounds = bounds.scale(0.8);
  const { x, y, width, height } = pointBounds;

  return new paper.Point({
    x: Math.floor(randBetweenInt(x, x + width)),
    y: Math.floor(randBetweenInt(y, y + height)),
  });
}
