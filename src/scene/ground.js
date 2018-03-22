import { h } from "preact";
import { PlaneGeometry, Mesh, MeshBasicMaterial } from "three";
import { groundMaterial } from "./materials";

export default function Ground() {
  const geometry = new PlaneGeometry(30, 30, 10, 10);
  const mesh = new Mesh(geometry, groundMaterial);
  mesh.position.y = 0;
  mesh.rotation.x = -Math.PI/2;
  return mesh;
}
