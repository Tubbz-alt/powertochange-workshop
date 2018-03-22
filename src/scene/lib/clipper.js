import Clipper from "clipper-js";
import { curry } from "lodash";

const multiplier = 1e6;
const toClipper = p => ({ X: p[0] * multiplier, Y: p[1] * multiplier });
const fromClipper = c => [c.X / multiplier, c.Y / multiplier];

export const offset = (
  jointType = "jtMiter",
  endType = "etClosedPolygon",
  miterLimit = Infinity,
  roundPrecision = 0,
  delta,
  points
) => {
  const subject = new Clipper([points.map(toClipper)], true);
  const newShape = subject.offset(delta * multiplier, {
    jointType,
    endType,
    miterLimit,
    roundPrecision
  });
  const outPath = newShape.paths[0] || [];
  return outPath.map(fromClipper);
};

export const curriedOffset = curry(offset, 6)('jtMiter', 'etClosedPolygon', Infinity, 0);

// export const area = outline => {
//   const shape = new Clipper([outline.map(toClipper)], true);
//   const rawArea = shape.totalArea();
//   return Math.abs(rawArea / multiplier) / multiplier;
// };
