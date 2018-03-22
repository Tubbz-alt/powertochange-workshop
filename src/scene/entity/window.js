import * as THREE from "three";
import { windowMaterial } from "../materials";

export function addWindow([{ buttons }, intersections]) {
  const intersection = intersections[0];
  const { polygon } = intersection.face;

  if (polygon.window) {
    this.scene.remove(polygon.window);
    polygon.window = undefined;
  } else {
    polygon.window = new Window();
    // console.log(intersection.point);


    polygon.window.position.copy(intersection.point);
    // polygon.window.position.copy(polygon.centroid);

    polygon.window.lookAt(
      intersection.point.clone().add(intersection.face.normal)
    );
    // intersection.object.add(w);
    this.scene.add(polygon.window);
  }

  // const a = new THREE.AxesHelper(10);
  // a.lookAt( intersection.face.normal );
  // a.position.copy(intersection.point);
  // intersection.object.add(a);
}

export default class Window extends THREE.Mesh {
  constructor() {
    super();
    this.width = 0.5;
    this.height = 1;
    const depth = 0.1;
    this.name = 'window';
    this.material = windowMaterial;
    this.geometry = new THREE.BoxGeometry(this.width, this.height, depth);
    this.geometry.translate(0, 0, depth/2);

    // const frame = new THREE.BoxGeometry(this.width + 0.2, this.height + 0.2, 1);
    // this.frameMesh = new THREE.Mesh(frame, this.material);
    // frame.translate(0, 0, depth/2);
    // this.add(frame);
    // this.add(new THREE.AxesHelper(10));
  }
}
