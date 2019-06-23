export default function limiter(value, floor, ceiling) {
  if (value < floor) {
    return floor
  }

  if (value > ceiling) {
    return ceiling
  }

  return value
}
