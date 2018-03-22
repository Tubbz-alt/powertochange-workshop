import { h, Component } from 'preact';
import * as THREE from "three";
const OrbitControls = require("three-orbit-controls")(THREE);
import { Observable } from "rxjs";
import Entity from "./entity"
import { MouseButton, getPosition, checkForIntersection, clampedNormal } from "./utils";
import Window, { addWindow } from "./entity/window";

export default class Scene extends Component {

  constructor(props) {
    super(props);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.render3D = this.render3D.bind(this);
    this.addEvents = this.addEvents.bind(this);
  }

  componentDidMount() {
    const { width=400, height=400, bgColor=0xcccccc } = this.props;

    this.scene = new THREE.Scene();

    this.renderer.setClearColor(bgColor);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    this.raycaster = new THREE.Raycaster();

    this.camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 1000);

    this.controls = new OrbitControls(this.camera);
    this.controls.maxPolarAngle = 1.5;
    const savedControls = JSON.parse(localStorage.getItem('controlsState'));
    if(savedControls){
      const { target, objectPosition, objectRotation } = savedControls;
      this.controls.target.copy(target);
      this.controls.object.position.copy(objectPosition);
      this.controls.object.rotation.copy(objectRotation);
    } else {
      this.camera.position.set(10, 15, -5);
      this.camera.lookAt(new THREE.Vector3());
    }

    window.addEventListener('unload', () => {
      localStorage.setItem('controlsState', JSON.stringify({
        target: this.controls.target,
        objectPosition: this.controls.object.position,
        objectRotation: this.controls.object.rotation
      }));
    });

    this.model = new Entity();
    this.scene.add(this.model);

    var ground = new THREE.GridHelper(20, 20, 0xDDDDDD, 0xEEEEEE);
    ground.rotation.x = -Math.PI;
    ground.position.set(0, 0, 0);
    this.scene.add(ground);

    this.plane = new THREE.Plane(new THREE.Vector3(1, 1, 0.2), 0);
    // this.planeHelper = new THREE.PlaneHelper(this.plane, 10, 0xffff00);
    // this.scene.add(this.planeHelper);

    this.addEvents();
  }

  addEvents() {

    let is;
    const planeIntersection = new THREE.Vector3();
    const startPt = new THREE.Vector3();
    let origVertices = [];
    let vertices = [];

    const wheel$ =
      Observable
        .fromEvent(this.renderer.domElement, 'wheel');

    const mouseMove$ =
      Observable
        .fromEvent(this.renderer.domElement, 'mousemove')
        .share();

    const mouseUp$ =
      Observable
        .fromEvent(document, 'mouseup')
        .do(_ => this.controls.enabled = true)
        .share();

    const mouseDown$ =
      Observable
        .fromEvent(this.renderer.domElement, 'mousedown')
        .share();

    const mouseDownAndMoving$ =
      mouseDown$
        .switchMapTo(mouseMove$)
        .takeUntil(mouseUp$)
        .repeat();

    const intersections$ =
      Observable.merge(mouseMove$, mouseUp$)
        .throttleTime(20)
        .map(checkForIntersection.bind(this))
        .share();

    const distinctIntersections$ =
      intersections$
        .distinctUntilChanged((x, y) => {
          if (x.length > 0 && y.length > 0) {
            return x[0].faceIndex === y[0].faceIndex;
          } else {
            return (x.length === y.length)
          }
        });

    const faceMouseDown$ =
      mouseDown$
        .withLatestFrom(intersections$)
        .filter( ([event, intersections]) => intersections.length > 0)
        .do(_ => this.controls.enabled = false)
        .share();

    const wallMouseDown$ =
      faceMouseDown$
        .filter( ([event, intersections]) => {
          return (
            intersections[0].face.normal.x === 1 ||
            intersections[0].face.normal.x === -1
          );
        });

    const endWallMouseDown$ =
      faceMouseDown$
        .filter( ([event, intersections]) => {
          return (
            intersections[0].face.normal.z === 1 || intersections[0].face.normal.z === -1
          );
        })
        .do( ([event, intersections]) => {
          const intersection = intersections[0];
          const { face } = intersection;
          const { polygon } = face;

          const amount = (event.buttons === MouseButton.PRIMARY) ? 1 : -1;

          if (face.normal.z === 1) {
            intersection.object.append(amount);
            // polygon.append(amount);
          } else {
            intersection.object.prepend(amount);
            // polygon.prepend(amount);
          }
          // console.log(face.normal)
        });

    const dragExtrude$ =
      wallMouseDown$
        .do(addWindow.bind(this))
        .do( ([{ buttons }, intersections]) => {
          const intersection = is = intersections[0];
          // const direction = (buttons === MouseButton.PRIMARY) ? 1 : -1;
          const { polygon } = intersection.face;
          // polygon.extrude(1 * direction);

          // this.plane.setFromNormalAndCoplanarPoint(
          //   intersection.face.normal,
          //   intersection.point.clone()
          // );
          vertices = Array.from(is.face.polygon.vertices);
          origVertices = vertices.map(v => v.clone());

          this.plane.setFromCoplanarPoints(
            intersection.point.clone(),
            intersection.point.clone().add(new THREE.Vector3(0,1,0)),
            intersection.point.clone().add(intersection.face.normal.normalize())
          );
          this.raycaster.ray.intersectPlane(this.plane, startPt);
          // console.log(origVertices);
        })
        // .switchMapTo(mouseMove$)
        .takeUntil(mouseUp$)
        .repeat()
        .do(a => {
          if (this.raycaster.ray.intersectPlane(this.plane, planeIntersection)) {
            const change = planeIntersection.clone().sub(startPt);
            const b = change.multiply(is.face.normal.normalize());

            vertices.forEach( (vertex, index) => {
              vertex.copy(
                origVertices[index].clone().add(b)
              );
            });

            is.object.update();
          }
        });

    const clickExtrude$ =
      faceMouseDown$
        .do( ([{ buttons }, intersections]) => {
          const direction = (buttons === MouseButton.PRIMARY) ? 1 : -1;
          const { polygon } = intersections[0].face;
          polygon.extrude(1 * direction);
        });

    this.render$ =
      Observable
        .merge(wheel$, mouseUp$, mouseDownAndMoving$, dragExtrude$, endWallMouseDown$)
        .throttleTime(20)
        .delay(10)
        .startWith(true)
        .subscribe(_ => requestAnimationFrame(this.render3D));
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
