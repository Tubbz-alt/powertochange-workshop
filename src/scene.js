import { h, Component } from 'preact';
import * as THREE from "three";
const OrbitControls = require("three-orbit-controls")(THREE);
import { Observable } from "rxjs";
import Model from "./model";
import Ground from "./ground";

function getPosition(x, y, width, height) {
  return [x / width * 2 - 1, -(y / height) * 2 + 1];
}

function checkForIntersection(event) {
  const [x, y] = getPosition(
    event.offsetX,
    event.offsetY,
    this.props.width,
    this.props.height
  );
  this.raycaster.setFromCamera({x, y}, this.camera);
  return this.raycaster.intersectObject(this.model);
}

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

    this.raycaster = new THREE.Raycaster();

    this.model = new Model();

    this.render3D = this.render3D.bind(this);
  }

  componentDidMount() {
    this.scene.add(Ground());
    this.scene.add(this.model);

    this.controls = new OrbitControls(this.camera);
    this.controls.maxPolarAngle = 1.5;

    const wheel$ = Observable
      .fromEvent(this.renderer.domElement, 'wheel');

    const mouseMove$ = Observable
      .fromEvent(this.renderer.domElement, 'mousemove')
      // .share();

    const mouseDown$ = Observable
      .fromEvent(this.renderer.domElement, 'mousedown')

    mouseDown$
      .map(checkForIntersection.bind(this))
      .subscribe(console.log);

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
