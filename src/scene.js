import { h, Component } from 'preact';
import * as THREE from "three";
const OrbitControls = require("three-orbit-controls")(THREE);
import { Observable } from "rxjs";
// import Model from "./model";
import Entity from "./entity"
import Ground from "./ground";

const MouseButton = {
  PRIMARY: 1,
  SECONDARY: 2,
  WHEEL: 4
};

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

    // this.model = new Model();
    this.model = new Entity();

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
                        .share();

    const intersections$ = mouseMove$
                            .map(checkForIntersection.bind(this))
                            .distinctUntilChanged((x, y) => {
                              if (x.length > 0 && y.length > 0) {
                                return x[0].faceIndex === y[0].faceIndex;
                              } else {
                                return (x.length === y.length)
                              }
                            });

    const mouseDown$ = Observable
                        .fromEvent(this.renderer.domElement, 'mousedown')
                        .share();

    const extrude$ = mouseDown$
      .withLatestFrom(intersections$)
      .filter( ([event, intersections]) => intersections.length > 0)
      .do( ([{ buttons }, intersections]) => {
        const direction = (buttons === MouseButton.PRIMARY) ? 1 : -1;
        const { polygon } = intersections[0].face;
        console.log(polygon);
        polygon.extrude(1 * direction);
      });

    const mouseUp$ = Observable
                      .fromEvent(document, 'mouseup');

    const mouseDownAndMoving$ = mouseDown$
                                  .switchMapTo(mouseMove$)
                                  .takeUntil(mouseUp$)
                                  .repeat();

    this.render$ = Observable
                      .merge(wheel$, mouseDownAndMoving$, extrude$)
                      .throttleTime(20)
                      .delay(10)
                      .startWith(true)
                      .subscribe(this.render3D);
  }

  componentWillUnmount() {
    this.render$.unsubscribe();
  }

  render3D() {
    console.log('render');
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        ref={ me => me.appendChild(this.renderer.domElement) } />
    );
  }
}
