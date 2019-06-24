import React from 'react';
import paper from 'paper';
import {
  registerResizeCanvas,
  unregisterResizeCanvas,
} from './components/canvas/resizeCanvas';
import Toolbar from './components/toolbar/Toolbar';
import getCanvasCenter from './actions/draw/getCanvasCenter';
import getConnectedPoints from './actions/api/getConnectedPoints';

// Not used
const globals = {
  fps: 60,
  callTrack: 0,
};

export default function App() {
  console.log(`App is called ${(globals.callTrack += 1)} time(s)`);

  const canvasRef = React.useRef(null);
  const paperScopeRef = React.useRef(new paper.PaperScope());
  const pathRef = React.useRef(null);

  const [coordinates, setCoordinates] = React.useState([]);
  const [coordinatesDisp, setCoordinatesDisp] = React.useState([]);
  const [isPlaying, setIsPlaying] = React.useState(false);

  // Set up Paper.js and the canvas element.
  // Note: this effect only runs once on component mount and once on component
  // unmount.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const paperScope = paperScopeRef.current;

    paperScope.setup(canvas);
    paperScope.activate();

    // const resizeCanvasFn = registerResizeCanvas(canvas);

    return () => {
      // unregisterResizeCanvas(resizeCanvasFn);
    };
  }, []);

  const add = async () => {
    const canvas = canvasRef.current;
    const paperScope = paperScopeRef.current;

    // Get data from NOOP's API
    const centerPoint = new paper.Point(getCanvasCenter(canvas));
    const noopConnectedPoints = await getConnectedPoints(centerPoint, 100);

    setCoordinates(
      noopConnectedPoints.map(point => ({ x: point.x, y: point.y }))
    );
    setCoordinatesDisp([]);

    // Need to re-active the PaperScope after setState() hook calls.
    // Why? Don't know yet...
    paperScope.activate();
    pathRef.current = new paper.Path({
      segments: [],
      strokeColor: 'black',
    });
  };

  const togglePlaying = () => {
    const view = paperScopeRef.current.view;

    if (isPlaying) {
      view.onFrame = null;
      setIsPlaying(false);
    } else {
      view.onFrame = e => {
        const path = pathRef.current;

        if (coordinatesDisp.length !== coordinates.length && path !== null) {
          const i = coordinatesDisp.length;
          const pointToAdd = new paper.Point(coordinates[i]);

          path.add(pointToAdd);

          coordinatesDisp.push(coordinates[i]);
        } else {
          view.onFrame = null;
          setIsPlaying(false);
        }
      };
      setIsPlaying(true);
    }
  };

  const sayInfo = () => {
    console.log(
      `Current view's size: ${paperScopeRef.current.view.size.width}` +
        ` / ${paperScopeRef.current.view.size.height}`
    );
  };

  const allActions = {
    add,
    togglePlaying,
    sayInfo,
  };

  return (
    <div className="app">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        resize="true"
      >
        An HTML canvas.
      </canvas>
      <Toolbar allActions={allActions} isPlaying={isPlaying} />
    </div>
  );
}
