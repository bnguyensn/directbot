import paper from 'paper';
import limiter from '../../lib/limiter';
import checkBacktracking from '../../lib/checkBacktracking';

/**
 * @param startPoint Point - The starting point
 * @param pipeSettings Object - Pipes configurations
 * @returns Object[] - An array of connected points
 * */
export default async function getConnectedPoints(
  startPoint,
  pipeSettings
) {
  // Call the NOOP API 🤖
  const res = await window.fetch(
    'https://api.noopschallenge.com/directbot?' +
      `count=${pipeSettings.pipeEndPointsCount}&connected=1`,
    {
      method: 'GET',
      mode: 'cors',
      referrer: 'no-referrer',
    }
  );
  const data = await res.json();

  // Remove all backtracking NOOP directions
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

  // Loop through all NOOP directions, convert them to Paper.js Points, and add
  // them to our final Point array.
  const { pipeMinLength, pipeMaxLength, segmentDistance } = pipeSettings;
  const connectedPoints = [startPoint];
  for (let i = 0; i < dataNoBacktracking.length; i++) {
    const { direction, distance } = dataNoBacktracking[i];
    const limitedDistance = limiter(
      distance,
      pipeMinLength,
      pipeMaxLength,
      segmentDistance
    );
    const { x: prevEPX, y: prevEPY } = connectedPoints[
      connectedPoints.length - 1
    ];

    // Create the current endpoint
    const curEP = new paper.Point({
      x:
        direction === 'right'
          ? prevEPX + limitedDistance
          : direction === 'left'
          ? prevEPX - limitedDistance
          : prevEPX,
      y:
        direction === 'down'
          ? prevEPY + limitedDistance
          : direction === 'up'
          ? prevEPY - limitedDistance
          : prevEPY,
    });
    const { x: curEPX, y: curEPY } = curEP;

    // Add segments between the 2 endpoints, if applicable.
    const segmentCount = limitedDistance / segmentDistance - 1;
    if (segmentCount > 0) {
      for (let j = 0; j < segmentCount; j++) {
        connectedPoints.push(
          new paper.Point({
            x:
              prevEPX + Math.sign(curEPX - prevEPX) * segmentDistance * (j + 1),
            y:
              prevEPY + Math.sign(curEPY - prevEPY) * segmentDistance * (j + 1),
          })
        );
      }
    }

    // Finally, add the current endpoint
    connectedPoints.push(curEP);
  }

  return connectedPoints;
}
