import * as Comlink from 'comlink';
import paper from 'paper';
import getConnectedPoints from '../actions/api/getConnectedPoints';

function getInbetweens(prev, cur, distance) {
  const count = Math.ceil((cur - prev) / distance) - 1;
  const res = [];

  for (let i = 0; i < count; i++) {
    res.push(prev + distance * (i + 1));
  }

  return res;
}

class PipeSegmentData {
  constructor() {
    this.segmentDistance = 5;
    this.pipeSegments = [];
  }

  async getPipePoints(start, count) {
    const endPoints = await getConnectedPoints(start, count);
    const segmentPoints = [endPoints[0]];

    for (let i = 1; i < endPoints.length; i++) {
      const { x: curX, y: curY } = endPoints[i];
      const { x: prevX, y: prevY } = endPoints[i - 1];

      let inbetweenPoints;

      if (curX - prevX > this.segmentDistance) {
        inbetweenPoints = getInbetweens(prevX, curX, this.segmentDistance).map(
          inbetween =>
            new paper.Point({
              x: inbetween,
              y: curY,
            })
        );
      }

      if (curY - prevY <= this.segmentDistance) {
        inbetweenPoints = getInbetweens(prevY, curY, this.segmentDistance).map(
          inbetween =>
            new paper.Point({
              x: curX,
              y: inbetween,
            })
        );
      }

      segmentPoints.push(...inbetweenPoints, endPoints[i]);
    }

    this.pipeSegments.push(segmentPoints);
  }
}

Comlink.expose(PipeSegmentData);
