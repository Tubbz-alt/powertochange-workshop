import * as THREE from "three";
import groupBy from 'lodash/groupBy';
import Polygon from './polygon';
import { extrudePoints } from '../utils';
import { normalToString } from '../utils';
import { curriedOffset } from "../../clipper";
import { defaultMaterial, edgeMaterial } from "../materials";

export default class Bay {

  constructor(entity, geometry=undefined) {

    this.length = 1.2;
    this.width = 4;

    this.profile = [
      [-this.width/2, 0],
      [this.width/2, 0],
      [this.width/2, 2],
      [0, 3.7],
      [-this.width/2, 2]
    ];

    this.material = defaultMaterial;

    if (geometry) {
      this.geometry = geometry;
    } else {
      this.geometry = extrudePoints(1.2, this.profile);//, [curriedOffset(-0.286, this.profile)]);
    }

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    const edgesGeometry = new THREE.EdgesGeometry(this.geometry, 1);
    const lineSegments = new THREE.LineSegments(edgesGeometry, edgeMaterial);

    this.mesh.add(lineSegments);
    this.mesh.entity = entity;

    this.polygons = [];
    this.makePolygons();
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


}
