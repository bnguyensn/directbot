import React from 'react';
import paper from 'paper';
import {
  registerResizeCanvas,
  unregisterResizeCanvas,
} from './components/canvas/resizeCanvas';
import Toolbar from './components/toolbar/Toolbar';
import getCanvasCenter from './actions/draw/getCanvasCenter';
import getConnectedPoints from './actions/api/getConnectedPoints';

let callTrack = 0;

export default function App() {
  console.log(`App is called ${(callTrack += 1)} time(s)`);

  const canvasRef = React.useRef(null);
  const paperScopeRef = React.useRef(new paper.PaperScope());

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

    const centerPoint = new paper.Point(getCanvasCenter(canvas));
    const noopConnectedPoints = await getConnectedPoints(centerPoint, 1000);

    const p = new paper.Path({
      segments: noopConnectedPoints,
      strokeColor: 'black',
    });
  };

  const allActions = {
    add,
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
      <Toolbar allActions={allActions} />
    </div>
  );
}
