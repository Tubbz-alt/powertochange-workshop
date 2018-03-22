import * as THREE from 'three';

export default class Polygon {

  constructor(
    geometry,
    faces=[],
    { tags=[], extrudeSnap=1.2 } = {}
  ) {
    this.vertices = new Set();
    this.faces = new Set();
    this.geometry = geometry;
    this.extrudeSnap = extrudeSnap;
    this.window = undefined;
    faces.forEach(this.addFace.bind(this));

    this.prepend = this.prepend.bind(this);
    this.append = this.append.bind(this);
  }

  prepend(number=1) {
    console.log(`prepend ${number}`)
  }

  append(number=1) {
    console.log(`append ${number}`)
  }

  addFace(face) {
    this.faces.add(face);
    face.polygon = this;
    this.addVertices([
      this.geometry.vertices[face.a],
      this.geometry.vertices[face.b],
      this.geometry.vertices[face.c]
    ]);
  }

  addVertices(vertices) {
    vertices.forEach(vector => this.vertices.add(vector));
  }

  get normal() {
    return [...this.faces][0].normal.clone().normalize();
  }

  extrude(distance) {
    this.vertices.forEach(vector => {
      vector.add(
        this.normal.clone().multiplyScalar(distance)
      );
    });
    this.geometry.verticesNeedUpdate = true;
    this.geometry.computeBoundingSphere();
  }

}
