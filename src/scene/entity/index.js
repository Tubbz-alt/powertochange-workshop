import * as THREE from 'three';
import Polygon from './polygon';
import groupBy from 'lodash/groupBy';
import { normalToString, shapeFromPoints, extrudePoints } from '../utils';

const BAY_LENGTH = 1.2;

export default class Entity extends THREE.Mesh {
  constructor() {
    super();
    this.polygons = [];

    this.width = 4;

    this.profile = [
      [-this.width/2, 0],
      [this.width/2, 0],
      [this.width/2, 2],
      [0, 3.7],
      [-this.width/2, 2]
    ];

    this.geometry = extrudePoints(1.2, this.profile);
    this.material = new THREE.MeshNormalMaterial();

    this.bays = [0];

    this.prepend = this.prepend.bind(this);
    this.append = this.append.bind(this);

    this.makePolygons();
  }

  prepend(number=1) {
    if (number >= 0) {
      this.bays = [this.bays.length, ...this.bays];
    } else {
      if (this.bays.length > 1) this.bays = this.bays.slice(-number);
    }

    console.log(`prepend ${number}`, this.bays)
  }

  append(number=1) {
    if (number >= 0) {
      this.bays = [...this.bays, this.bays.length];
    } else {
      if (this.bays.length > 1) this.bays = this.bays.slice(0, number);
    }

    console.log(`append ${number}`, this.bays)
  }

  update() {
    this.geometry.boundingBox = null;
    this.geometry.boundingSphere = null;
    this.geometry.verticesNeedUpdate = true;
  }

  makePolygons() {
    const grouped = groupBy(this.geometry.faces, normalToString);
    this.polygons = Object.values(grouped).map(polygon =>
      new Polygon(this.geometry, polygon)
    );
    // console.log(this.polygons);
  }

  get footprint() {
    return (this.bays.length * BAY_LENGTH) * this.width;
  }
}
