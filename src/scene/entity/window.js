import * as THREE from "three";

export default class Window extends THREE.Mesh {
  constructor() {
    super();
    this.width = 0.5;
    this.height = 1;
    const depth = 0.1;
    this.name = 'window';
    this.material = new THREE.MeshBasicMaterial({ color: 'black' });
    this.geometry = new THREE.BoxGeometry(this.width, this.height, depth);
    this.geometry.translate(0, 0, depth/2);

    // const frame = new THREE.BoxGeometry(this.width + 0.2, this.height + 0.2, 1);
    // this.frameMesh = new THREE.Mesh(frame, this.material);
    // frame.translate(0, 0, depth/2);
    // this.add(frame);
    // this.add(new THREE.AxesHelper(10));
  }
}
