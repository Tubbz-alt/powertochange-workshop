export function normalToString(face) {
  const { normal } = face;
  return [normal.x, normal.y, normal.z].join("");
}
