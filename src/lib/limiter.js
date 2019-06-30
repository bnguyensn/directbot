/**
 * E.g. roundToMultiple(42, 5) will return 40
 * */
function roundToMultiple(value, multiple) {
  return value - (value % multiple);
}

/**
 * Limit a number to a range and potentially a multiple of a number.
 * */
export default function limiter(value, floor, ceiling, multiple = 1) {
  if (value < floor) {
    return roundToMultiple(floor, multiple);
  }

  if (value > ceiling) {
    return roundToMultiple(ceiling, multiple);
  }

  return roundToMultiple(value, multiple);
}
