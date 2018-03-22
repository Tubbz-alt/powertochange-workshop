import * as THREE from "three";

export const defaultMaterial = new THREE.MeshNormalMaterial({ opacity: 0.4, transparent: true });
export const highlightMaterial = new THREE.MeshBasicMaterial( { color: 'yellow' } );
export const windowMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
export const groundMaterial = new THREE.MeshBasicMaterial({ color: 'white', wireframe: true });
