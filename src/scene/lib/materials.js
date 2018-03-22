import * as THREE from "three";

export const defaultMaterial = new THREE.MeshNormalMaterial({
  opacity: 0.4,
  transparent: true,
  overdraw: 0.5,
  polygonOffset: true,
  polygonOffsetFactor: 1
 });
export const highlightMaterial = new THREE.MeshBasicMaterial( { color: 'yellow' } );
export const windowMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
export const groundMaterial = new THREE.MeshBasicMaterial({ color: 'white', wireframe: true });

export const edgeMaterial = new THREE.LineBasicMaterial({
  color: 0x000000,
  linewidth: 1,
  overdraw: 0.5,
  transparent: false
});
