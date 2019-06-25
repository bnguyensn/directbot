const backtrackingPairs = [['left', 'right'], ['up', 'down']];

export default function checkBacktracking(prevDirection, curDirection) {
  return backtrackingPairs.some(
    backtrackingPair =>
      backtrackingPair.includes(curDirection) &&
      backtrackingPair.includes(prevDirection) &&
      curDirection !== prevDirection
  );
}
