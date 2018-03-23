import "./line_material";
import * as THREE from "three";

import seamless from '../../materials/40_plywood texture-seamless.jpg';
import seamlessHR from '../../materials/53_Plexwood texture-seamless-hr.jpg';

// export const defaultMaterial = new THREE.MeshLambertMaterial({
//   color: 'yellow',
//   opacity: 1,
//   transparent: false,
//   overdraw: 0.5,
//   polygonOffset: true,
//   polygonOffsetFactor: 1
//  });
export const highlightMaterial = new THREE.MeshBasicMaterial( { color: 'yellow' } );
export const windowMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
export const groundMaterial = new THREE.MeshBasicMaterial({ color: 'white', wireframe: true });
export const shadowMaterial = new THREE.ShadowMaterial({ side: THREE.DoubleSide, opacity: 0.15, transparent: true });
export const edgeMaterial = new THREE.LineBasicMaterial({
  color: 0x000000,
  linewidth: 3,
  overdraw: 0.5,
  transparent: false
});

var faceTexture = new THREE.TextureLoader().load(seamless);
faceTexture.wrapS = THREE.RepeatWrapping;
faceTexture.wrapT = THREE.RepeatWrapping;
// sideTexture.repeat.set(5,5);

// var sideTexture = new THREE.TextureLoader().load(seamlessHR);
// sideTexture.wrapS = THREE.RepeatWrapping;
// sideTexture.wrapT = THREE.RepeatWrapping;
// sideTexture.repeat.set(5,5);

// const faceMaterial = new THREE.MeshStandardMaterial({ map: faceTexture, metalness: 0, roughness: 0.7 });
// const sideMaterial = new THREE.MeshStandardMaterial({ map: sideTexture, metalness: 0, roughness: 1 });

// export const defaultMaterial = [
//   faceMaterial,
//   sideMaterial,
// ];


export const defaultMaterial = new THREE.MeshLambertMaterial({
  color: 0xD0BC95,
  opacity: 1,
  transparent: false,
  map: faceTexture,
  overdraw: 0.5,
  polygonOffset: true,
  polygonOffsetFactor: 1
 });
