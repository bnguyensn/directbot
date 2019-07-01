import React from 'react';
import paper from 'paper';
import Toolbar from './components/toolbar/Toolbar';
import getConnectedPoints from './actions/api/getConnectedPoints';
import getColors from './actions/api/getColors';
import randBetweenInt from './lib/randBetweenInt';
import getPipeStartPoint from './actions/draw/getPipeStartPoint';

const PIPE_SETTINGS = {
  // Physical appearance of the pipes
  segmentDistance: 10,
  pipeMinLength: 20,
  pipeMaxLength: 40,
  pipeMinWidth: 1,
  pipeMaxWidth: 10,
  pipeEndPointsCount: 100,
  pipeOpacity: 1,

  // Amount of pipes in view before a full reset (clear all pipes from the
  // screen)
  maxPipesBeforeClear: 75,

  // Maximum amount of pipes (or more precisely, directions data) pre-fetched
  // from NOOP's Directbot.
  pipesPreFetchCount: 3,

  // Time between each fetch request
  pipesFetchFrequency: 1000, // ms

  // Amount of pipes running concurrently. In Windows 3DPipes, only 1 pipe runs
  // at a time. This will also never be higher than the amount of fetched
  // directions.
  maxConcurrentPipeAnimation: 1,

  // When the view is resized, all pipe animations are paused until this
  // debounce time elapses. This prevents janky animations / canvas behaviours
  // on resizing.
  resizeAnimationDebounceTime: 500, // ms
};

export default function App() {
  // 2x React refs are used to store references to the HTML canvas element and
  // the Paper.js scope object.
  const canvasRef = React.useRef(null);
  const paperScopeRef = React.useRef(new paper.PaperScope());

  // Pipes have 3 states:
  // - Not yet animated: these pipes have just been fetched from NOOP's API and
  // haven't been displayed on the screen.
  // - Animating: these pipes are being animated on the screen.
  // - Animated: these pipes have finished their animation.
  const animatedPipeMapRef = React.useRef(new Map());
  const notYetAnimatedPipeMapRef = React.useRef(new Map());
  const animatingPipeMapRef = React.useRef(new Map());

  const autoAddTimerID = React.useRef(null);
  const debounceTimerID = React.useRef(null);

  // We could end a path's animation upon collision with another path. This
  // behaviour is turned off by default.
  const [endAnimationOnCollision, setEndAnimationOnCollision] = React.useState(
    false
  );

  // This controls whether animations are being played or not.
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isPlayingPreResize, setIsPlayingPreResize] = React.useState(false);

  // Set up Paper.js and the canvas element. We only need to run this effect
  // once on component mounting because it doesn't rely on any of our states.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const paperScope = paperScopeRef.current;

    paperScope.setup(canvas);
    paperScope.activate();
  }, []);

  // The resize event handler depends on our isPlaying (and with it,
  // isPlayingPreResize) state, thus we need to re-run this effect every time
  // isPlaying changes. If you don't re-apply the event handler, isPlaying will
  // be stale (always stays at the default value of false) in our handler
  // function.
  React.useEffect(() => {
    const view = paperScopeRef.current.view;
    view.onResize = handleViewResize;
  }, [isPlaying, isPlayingPreResize]);

  React.useEffect(() => {
    autoAddTimerID.current = window.setInterval(
      fetchPipe,
      PIPE_SETTINGS.pipesFetchFrequency
    );

    return () => {
      window.clearInterval(autoAddTimerID.current);
    };
  }, []);

  // ********** MAIN LOGIC ********** //

  const fetchAPipe = async () => {
    // ********** Base canvas variables ********** //

    const paperScope = paperScopeRef.current;
    const view = paperScope.view;

    // ********** Setup point & color data from NOOP's API ********** //

    const startPoint = getPipeStartPoint(view);
    const [noopConnectedPoints, noopColors] = await Promise.all([
      getConnectedPoints(startPoint, PIPE_SETTINGS),
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
      opacity: PIPE_SETTINGS.pipeOpacity,
    });

    notYetAnimatedPipeMapRef.current.set(p, animationData);
    // animatingPipeMapRef.current.set(p, animationData);
  };

  const fetchPipe = async () => {
    if (animatedPipeMapRef.current.size > PIPE_SETTINGS.maxPipesBeforeClear) {
      clear();
    } else if (
      notYetAnimatedPipeMapRef.current.size < PIPE_SETTINGS.pipesPreFetchCount
    ) {
      const res = await fetchAPipe();

      if (res instanceof Error) {
        console.log(`Error fetching pipe: ${Error.message}`);
      }

      console.log(`size of Animated basket: ${animatedPipeMapRef.current.size}`);
      console.log(`size of NotYetAnimated basket: ${notYetAnimatedPipeMapRef.current.size}`);
      console.log(`size of Animating basket: ${animatingPipeMapRef.current.size}`);
    }
  };

  /**
   * The frame handler relies on this function to return false to remove a path
   * from the animation basket.
   * */
  const animatePipe = (animationData, path) => {
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
    // Try to add pipes into the "animating" map, up to the applicable limit
    if (
      animatingPipeMapRef.current.size <
        PIPE_SETTINGS.maxConcurrentPipeAnimation &&
      notYetAnimatedPipeMapRef.current.size > 0
    ) {
      const notYetAnimatedPipeMapKeysIter = notYetAnimatedPipeMapRef.current.keys();

      let iterRes = notYetAnimatedPipeMapKeysIter.next();
      while (
        !iterRes.done &&
        animatingPipeMapRef.current.size <
          PIPE_SETTINGS.maxConcurrentPipeAnimation
      ) {
        // Move the next in-queue-for-animation pipe from the "not yet animated"
        // to the "animating" map
        const nextPipeKey = iterRes.value;
        animatingPipeMapRef.current.set(
          nextPipeKey,
          notYetAnimatedPipeMapRef.current.get(nextPipeKey)
        );
        notYetAnimatedPipeMapRef.current.delete(nextPipeKey);

        iterRes = notYetAnimatedPipeMapKeysIter.next();
      }
    }

    // Animate pipes, if there are any
    if (animatingPipeMapRef.current.size > 0) {
      animatingPipeMapRef.current.forEach((animationData, path, m) => {
        const animated = animatePipe(animationData, path);

        if (!animated) {
          // Move this pipe from the "animating" to the "animated" map
          animatedPipeMapRef.current.set(path, animationData);
          m.delete(path);
        }
      });
    }
  };

  const viewResizeDebounceTimerCallback = () => {
    if (isPlayingPreResize && !isPlaying) {
      playAllAnimations();
    }
    debounceTimerID.current = null;
  };

  const handleViewResize = () => {
    if (isPlaying) {
      setIsPlayingPreResize(true);
      pauseAllAnimations();
    } else if (debounceTimerID.current === null) {
      // If animations are not playing when we resize, and if the debounce timer
      // is not running, then we are certain that animations are not playing
      // on resizing.
      // We need to check the debounce timer running state because the resize
      // event can fire very rapidly and isPlayingPreResize will be incorrectly
      // set to false during these rapid fires.
      setIsPlayingPreResize(false);
    }

    // Reset the debounce timer
    window.clearTimeout(debounceTimerID.current);
    debounceTimerID.current = window.setTimeout(
      viewResizeDebounceTimerCallback,
      PIPE_SETTINGS.resizeAnimationDebounceTime
    );
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
    animatedPipeMapRef.current.clear();
    animatingPipeMapRef.current.clear();
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
        resize="true"
      >
        An HTML canvas.
      </canvas>
      <Toolbar allActions={allActions} isPlaying={isPlaying} />
    </div>
  );
}
