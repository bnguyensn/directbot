import paper from 'paper';
import getRandomColor from '../../lib/getRandomColor';

/**
 * Draw a bunch of paths from an array of Points on the current view. Colors are
 * randomized.
 * @param points Point[] - An array of Paper.js Points
 * */
export default function drawPathsFromPoints(points) {
  points.forEach((point, i, arr) => {
    if (i > 0) {
      new paper.Path({
        segments: [point, arr[i - 1]],
        strokeColor: getRandomColor(),
      });
    }
  });
}
