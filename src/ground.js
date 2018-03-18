import { h } from "preact";
import { PlaneGeometry, Mesh, MeshBasicMaterial } from "three";

export default function Ground() {
  const geometry = new PlaneGeometry(30, 30, 10, 10);
  const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: 'white', wireframe: true }));
  mesh.position.y = -0.2;
  mesh.rotation.x = -Math.PI/2;
  return mesh;
}
