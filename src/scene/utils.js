export const MouseButton = {
  PRIMARY: 1,
  SECONDARY: 2,
  WHEEL: 4
};

export function normalToString(face) {
  const { normal } = face;
  return [normal.x, normal.y, normal.z].join("");
}

export function getPosition(x, y, width, height) {
  return [x / width * 2 - 1, -(y / height) * 2 + 1];
}

export function checkForIntersection(event) {
  const [x, y] = getPosition(
    event.offsetX,
    event.offsetY,
    this.props.width,
    this.props.height
  );
  this.raycaster.setFromCamera({x, y}, this.camera);
  return this.raycaster.intersectObject(this.model);
}

function _clampVal(input) {
  if (input > 0 && input < 0.00000001) return 0;
  else if (input < 0 && input > -0.00000001) return 0;
  // else if (input === -0) return 0;
  return input;
}

export function clampedNormal(normal) {
  return new THREE.Vector3(
    _clampVal(normal.x),
    _clampVal(normal.y),
    _clampVal(normal.z)
  );
}
