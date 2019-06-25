/**
 * @param startPoint Point - The starting point
 * @param count number - How many connected points to be returned? Default to
 * 100.
 * @returns Object[] - An array of connected points
 * */

import paper from 'paper';
import limiter from '../../lib/limiter';
import checkBacktracking from '../../lib/checkBacktracking';

export default async function getConnectedPoints(
  start = new paper.Point({ x: 0, y: 0 }),
  count = 100
) {
  const res = await window.fetch(
    `https://api.noopschallenge.com/directbot?count=${count}&connected=1`,
    {
      method: 'GET',
      mode: 'cors',
      referrer: 'no-referrer',
    }
  );
  const data = await res.json();

  const dataNoBacktracking = data.directions.reduce(
    (acc, cur, i) => {
      const prevDirection = acc[acc.length - 1].direction;
      const curDirection = cur.direction;

      if (i > 0 && !checkBacktracking(prevDirection, curDirection)) {
        acc.push(cur);
      }

      return acc;
    },
    [data.directions[0]]
  );

  return dataNoBacktracking.reduce(
    (acc, cur) => {
      const length = limiter(cur.distance, 20, 20);

      const { x: prevX, y: prevY } = acc[acc.length - 1];

      acc.push(
        new paper.Point({
          x:
            cur.direction === 'right'
              ? prevX + length
              : cur.direction === 'left'
              ? prevX - length
              : prevX,
          y:
            cur.direction === 'down'
              ? prevY + length
              : cur.direction === 'up'
              ? prevY - length
              : prevY,
        })
      );

      return acc;
    },
    [start]
  );
}
