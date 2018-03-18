import { h, Component } from 'preact';
import * as THREE from "three";
const OrbitControls = require("three-orbit-controls")(THREE);
import { Observable } from "rxjs";

export default class Scene extends Component {

  constructor(props) {
    super(props);
    const { width=400, height=400, bgColor=0xcccccc } = props;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 1000);
    this.camera.position.set(5, 5, -10);
    this.camera.lookAt(new THREE.Vector3());

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(bgColor);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    this.render3D = this.render3D.bind(this);
  }

  componentDidMount() {
    const model = new THREE.Mesh(
      new THREE.BoxGeometry(2,2,2),
      new THREE.MeshNormalMaterial()
    );

    this.scene.add(model);

    this.controls = new OrbitControls(this.camera);
    this.controls.maxPolarAngle = 1.5;

    Observable
      .fromEvent(this.renderer.domElement, 'mousemove')
      .startWith(true)
      .subscribe(this.render3D);
  }

  render3D() {
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        ref={ me => me.appendChild(this.renderer.domElement) } />
    );
  }
}
