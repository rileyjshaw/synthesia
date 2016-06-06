'use strict';

/**
 * Returns the average color from a list of HSL arrays.
 *
 * Computes the average saturation and lightness directly from the HSL values,
 * but computes hue from an RGB conversion. This ensures that the color won't
 * be muddy (as would be the case for RGB-only), but will be fairly accurate in
 * terms of hue (which would be untrue for HSL-only).
 *
 * @param  {[H, S, L][]} colors   A list of HSL value arrays (colors can be
 *                                passed in as separate arguments).
 *
 * @return {[H, S, L]}            The average color.
 */
function averageColor (...colors) {
  // If a single colors array was passed in as opposed to separate arguments
  // for each color, break it out.
  if (colors.length === 1 && Array.isArray(colors[0][0])) colors = colors[0];

  const N = colors.length;

  // Convert our HSL colors into the average normalized RGB.
  const rgb = colors
    // Convert the HSL values to RGB.
    .map(hslToRgb)
    // Divide each of the components by the number of colors...
    .map(rgb => rgb.map(component => component / N))
    // ...and then sum them to find the average.
    .reduce(([rA, gA, bA], [r, g, b]) => [rA + r, gA + g, bA + b])
    ;

  const H = rgbToHue(rgb);

  // Take the HSL mean of all saturation values.
  const S = colors
    .map(([h, s, l]) => s / N)
    .reduce((acc, cur) => acc + cur)
    ;

  // Take the HSL mean of all lightness values.
  const L = colors
    .map(([h, s, l]) => l / N)
    .reduce((acc, cur) => acc + cur)
    ;

  return [H, S, L];
}

/**
 * Transforms normalized HSL color components into normalized RGB.
 * Mostly dark magic.
 *
 * Converts an HSL color to normalized RGB.
 * @param  {float[]} hsl   A list of the three HSL components between 0 and 1.
 * @return {float[]} rgb   A list of the three RGB components between 0 and 1.
 */
function hslToRgb ([h, s, l]) {
  function hueToRgb (p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }

  const Q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const P = 2 * l - Q;

  const R = hueToRgb(P, Q, h + 1/3);
  const G = hueToRgb(P, Q, h);
  const B = hueToRgb(P, Q, h - 1/3);

  return [R, G, B];
}

/**
 * Extracts the hue from a normalized ([0, 1]) RGB color.
 * @param  {float[]} rgb   A list of the three RGB components between 0 and 1.
 * @return {int}        Hue angle between 0 and 360.
 */
function rgbToHue ([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const diff = max - min;

  // Exit early if achromatic.
  if (!diff) {return 0;}

  let hue;
  switch (max) {
    case r: hue = (g - b) / diff + (g < b ? 6 : 0);
    break;
    case g: hue = (b - r) / diff + 2;
    break;
    case b: hue = (r - g) / diff + 4;
    break;
  }

  return Math.round(360 * hue / 6);
}

module.exports = averageColor;
