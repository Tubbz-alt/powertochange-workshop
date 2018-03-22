import * as THREE from 'three';
import Polygon from './polygon';
import groupBy from 'lodash/groupBy';
import { normalToString } from './face';

export default class Entity extends THREE.Mesh {
  constructor() {
    super();
    this.polygons = [];
    this.geometry = new THREE.BoxGeometry(1.2 * 2, 1, 1);
    this.material = new THREE.MeshNormalMaterial();
    this.geometry.translate(0, 0.5, 0);
    this.makePolygons();
  }

  makePolygons() {
    const grouped = groupBy(this.geometry.faces, normalToString);
    this.polygons = Object.values(grouped).map(polygon =>
      new Polygon(this.geometry, polygon)
    );
    console.log(this.polygons);
  }
}
