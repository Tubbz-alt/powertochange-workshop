import * as THREE from 'three';

export default class Model extends THREE.Mesh {

  constructor() {
    super();
    this.extrudePoints = this.extrudePoints.bind(this);
    this.shapeFromPoints = this.shapeFromPoints.bind(this);

    this.profile = [
      [-2, 0],
      [2, 0],
      [2, 2],
      [0, 4],
      [-2, 2]
    ];

    this.geometry = this.extrudePoints(5, this.profile);
    this.material = new THREE.MeshNormalMaterial();
  }

  shapeFromPoints(points) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach( ([x, y]) => shape.lineTo(x, y));
    return shape;
  }

  extrudePoints(amount, points, holes=[]) {
    const shape = this.shapeFromPoints(points);
    shape.holes = holes.map(hole => this.shapeFromPoints(hole));
    return new THREE.ExtrudeGeometry(shape, { amount, bevelEnabled: false });
  }

}
