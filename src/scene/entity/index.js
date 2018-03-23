import * as THREE from 'three';
import Bay from "./bay";

export default class Entity extends THREE.Object3D {
  constructor() {
    super();

    this.bays = [0];
    this.floors = 1;

    this.bays.forEach( (bayIndex, index) => {
      const bay = new Bay(this);
      bay.mesh.translateZ(bay.length * index);
      this.add(bay.mesh);
    });

    this.prepend = this.prepend.bind(this);
    this.append = this.append.bind(this);
    this.addFloor = this.addFloor.bind(this);
  }

  addFloor(direction) {
    if ((direction > 0 && this.floors < 2) || (direction < 0 && this.floors > 1)) {
      this.floors += direction;
      this.children[0].geometry.vertices
        .filter(v => v.y > 0)
        .forEach(v => v.y += 3 * direction);

      this.children[0].geometry.verticesNeedUpdate = true;
      this.children[0].geometry.computeBoundingSphere();
    }
  }

  prepend(number=1) {
    if (number >= 0) {
      this.bays = [this.bays.length, ...this.bays];
    } else {
      if (this.bays.length > 1) this.bays = this.bays.slice(-number);
    }

    const bay = new Bay(this);
    bay.mesh.translateZ(bay.length * -1);
    this.add(bay.mesh);

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

  // get footprint() {
  //   return (this.bays.length * BAY_LENGTH) * this.width;
  // }
}
