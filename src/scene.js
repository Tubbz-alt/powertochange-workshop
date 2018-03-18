import { h, Component } from 'preact';
import * as THREE from "three";
const OrbitControls = require("three-orbit-controls")(THREE);
import { Observable } from "rxjs";
import Model from "./model";

export default class Scene extends Component {

  constructor(props) {
    super(props);
    const { width=400, height=400, bgColor=0xcccccc } = props;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 1000);
    this.camera.position.set(10, 15, -5);
    this.camera.lookAt(new THREE.Vector3());

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(bgColor);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    this.render3D = this.render3D.bind(this);

    console.log("CONSTRUCT")
  }

  componentDidMount() {
    this.scene.add(new Model());

    this.controls = new OrbitControls(this.camera);
    this.controls.maxPolarAngle = 1.5;

    const wheel$ = Observable
      .fromEvent(this.renderer.domElement, 'wheel')

    const mouseMove$ = Observable
      .fromEvent(this.renderer.domElement, 'mousemove')

    this.render$ = Observable.merge(wheel$, mouseMove$)
                      .startWith(true)
                      .subscribe(this.render3D);
  }

  componentWillUnmount() {
    this.render$.unsubscribe();
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
