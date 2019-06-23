/**
 * Obtain a range of random colors from the Noop Hexbot.
 * @param count number - How many colors to get?
 * @returns string[] - An array of colors in hex format
 * */
export default async function getColors(count = 1) {
  const res = await fetch(
    `https://api.noopschallenge.com/hexbot?count=${count}`
  );

  return res.colors.map(color => color.value);
}
