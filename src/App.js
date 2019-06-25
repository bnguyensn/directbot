import React from 'react';
import paper from 'paper';
import {
  registerResizeCanvas,
  unregisterResizeCanvas,
} from './components/canvas/resizeCanvas';
import Toolbar from './components/toolbar/Toolbar';
import getCanvasCenter from './actions/draw/getCanvasCenter';
import getConnectedPoints from './actions/api/getConnectedPoints';
import getColors from './actions/api/getColors';

// Not used
const globals = {
  fps: 60,
  callTrack: 0,
};

export default function App() {
  console.log(`App is called ${(globals.callTrack += 1)} time(s)`);

  const canvasRef = React.useRef(null);
  const paperScopeRef = React.useRef(new paper.PaperScope());

  const pathMapRef = React.useRef(new Map());
  const animatingPathMapRef = React.useRef(new Map());

  const [endAnimationOnCollision, setEndAnimationOnCollision] = React.useState(
    false
  );

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
    // ********** Base canvas variables ********** //

    const canvas = canvasRef.current;
    const paperScope = paperScopeRef.current;
    const centerPoint = new paper.Point(getCanvasCenter(canvas));

    // ********** Get data from NOOP's API ********** //

    const [noopConnectedPoints, noopColors] = await Promise.all([
      getConnectedPoints(centerPoint, 500),
      getColors(),
    ]);

    // ********** Animation data ********** //

    const animationData = {
      allPoints: noopConnectedPoints,
      animatedPoints: [],
    };

    // ********** Creating the actual path ********** //

    // Need to re-activate the PaperScope after setState() hook calls else we
    // can't create Paper.js items. Don't know why though...
    paperScope.activate();

    const p = new paper.Path({
      segments: [],
      strokeColor: noopColors[0],
      strokeWidth: 3,
      opacity: 0.5,
    });

    pathMapRef.current.set(p, animationData);
    animatingPathMapRef.current.set(p, animationData);

    console.log(`Size of pathMap: ${pathMapRef.current.size}`);
    console.log(
      `Size of animatingPathMap: ${animatingPathMapRef.current.size}`
    );
  };

  const animatePath = (animationData, path) => {
    const { allPoints, animatedPoints } = animationData;

    const animatedCount = animatedPoints.length;

    if (animatedCount === allPoints.length) {
      // There are no more points to add! Stop the animation.
      return false;
    }

    const nextPoint = animationData.allPoints[animatedCount];

    if (endAnimationOnCollision) {
      const collisionResult = path.hitTest(nextPoint);

      if (collisionResult) {
        // Collision test passes! Stop the animation.
        return false;
      }
    }

    // "Grow" the path by 1 Point
    path.add(nextPoint);
    animationData.animatedPoints.push(nextPoint);

    return true;
  };

  const handleEachFrame = e => {
    if (animatingPathMapRef.current.size === 0) {
      // There are no more paths to animate. Pause the playing function.
      pauseAllAnimations();
      console.log('STOP!');
    }

    animatingPathMapRef.current.forEach((animationData, path, m) => {
      const animated = animatePath(animationData, path);

      if (!animated) {
        // The animation should end. Remove this path from the animation
        // list.
        m.delete(path);
      }
    });
  };

  const playAllAnimations = () => {
    const view = paperScopeRef.current.view;
    view.onFrame = handleEachFrame;
    setIsPlaying(true);
  };

  const pauseAllAnimations = () => {
    const view = paperScopeRef.current.view;
    view.onFrame = null;
    setIsPlaying(false);
  };

  const togglePlaying = () => {
    if (isPlaying) {
      pauseAllAnimations();
    } else {
      playAllAnimations();
    }
  };

  const clear = () => {
    const paperScope = paperScopeRef.current;
    const project = paperScope.project;
    const layer = project.activeLayer;
    layer.removeChildren();
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
