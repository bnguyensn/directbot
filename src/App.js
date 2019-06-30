import React from 'react';
import paper from 'paper';
import {
  registerResizeCanvas,
  unregisterResizeCanvas,
} from './components/canvas/resizeCanvas';
import Toolbar from './components/toolbar/Toolbar';
import getConnectedPoints from './actions/api/getConnectedPoints';
import getColors from './actions/api/getColors';
import randBetweenInt from './lib/randBetweenInt';
import getPipeStartPoint from './actions/draw/getPipeStartPoint';

const PIPE_SETTINGS = {
  segmentDistance: 10,
  pipeMinLength: 20,
  pipeMaxLength: 40,
  pipeMinWidth: 1,
  pipeMaxWidth: 10,
  pipeEndPointsCount: 100,
  maxPipesBeforeClear: 75,
};

export default function App() {
  // 2x React refs are used to store references to the HTML canvas element and
  // the Paper.js scope object.
  const canvasRef = React.useRef(null);
  const paperScopeRef = React.useRef(new paper.PaperScope());

  // Path data is stored in 2x Maps. One contains all available paths, the other
  // contains only those that are being animated (i.e. it's a subset of the
  // former).
  const pathMapRef = React.useRef(new Map());
  const animatingPathMapRef = React.useRef(new Map());

  // We also need a React ref to store our timer ID
  const timerIDRef = React.useRef(0);

  // We could end a path's animation upon collision with another path. This
  // behaviour is turned off by default.
  const [endAnimationOnCollision, setEndAnimationOnCollision] = React.useState(
    false
  );

  // This controls whether animations are being played or not.
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

  React.useEffect(() => {
    timerIDRef.current = window.setInterval(autoAdd, 1000);

    return () => {
      window.clearInterval(timerIDRef.current);
    };
  }, []);

  const add = async () => {
    // ********** Base canvas variables ********** //

    const paperScope = paperScopeRef.current;
    const view = paperScope.view;

    // ********** Setup point & color data from NOOP's API ********** //

    const startPoint = getPipeStartPoint(view);
    const [noopConnectedPoints, noopColors] = await Promise.all([
      getConnectedPoints(
        startPoint,
        PIPE_SETTINGS
      ),
      getColors(),
    ]);

    // ********** Setup animation data ********** //

    const animationData = {
      allPoints: noopConnectedPoints,
      animatedPoints: [],
    };

    // ********** Create the Paper.js path ********** //

    // Need to re-activate Paper.js' PaperScope after setState() hook calls else
    // we can't create Paper.js items. Don't know why though...
    paperScope.activate();

    const p = new paper.Path({
      segments: [],
      strokeColor: noopColors[0],
      strokeWidth: randBetweenInt(
        PIPE_SETTINGS.pipeMinWidth,
        PIPE_SETTINGS.pipeMaxWidth
      ),
      opacity: 1,
    });

    pathMapRef.current.set(p, animationData);
    animatingPathMapRef.current.set(p, animationData);

    console.log('Added a new pipe');
  };

  const autoAdd = () => {
    if (pathMapRef.current.size > PIPE_SETTINGS.maxPipesBeforeClear) {
      clear();
    } else if (animatingPathMapRef.current.size <= 3) {
      add();
    }
  };

  /**
   * The frame handler relies on this function to return false to remove a path
   * from the animation basket.
   * */
  const animatePath = (animationData, path) => {
    const { allPoints, animatedPoints } = animationData;

    const animatedCount = animatedPoints.length;

    if (animatedCount === allPoints.length) {
      // All points have been animated.
      return false;
    }

    const nextPoint = animationData.allPoints[animatedCount];

    if (endAnimationOnCollision) {
      const collisionResult = path.hitTest(nextPoint);

      if (collisionResult) {
        // Collision test passes.
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
      // pauseAllAnimations();
      // console.log('STOP!');
    }

    animatingPathMapRef.current.forEach((animationData, path, m) => {
      const animated = animatePath(animationData, path);

      if (!animated) {
        // Remove this path from the animation basket.
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

  const clear = () => {
    // Clear the canvas
    const paperScope = paperScopeRef.current;
    const project = paperScope.project;
    const layer = project.activeLayer;
    layer.removeChildren();

    // Clear the path Maps
    pathMapRef.current.clear();
    animatingPathMapRef.current.clear();
  };

  // ********** User actions ********** //

  const togglePlaying = () => {
    if (isPlaying) {
      pauseAllAnimations();
    } else {
      playAllAnimations();
    }
  };

  const allActions = {
    togglePlaying,
  };

  // ********** Render ********** //

  return (
    <div className="app">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        resize
      >
        An HTML canvas.
      </canvas>
      <Toolbar allActions={allActions} isPlaying={isPlaying} />
    </div>
  );
}
