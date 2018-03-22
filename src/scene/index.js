import { h, Component } from 'preact';
import { Observable } from "rxjs";
import * as THREE from "three";
const OrbitControls = require("three-orbit-controls")(THREE);

import Entity from "./entity"
import Window, { addWindow } from "./entity/window";
import { MouseButton, getPosition, checkForIntersection, clampedNormal } from "./lib/utils";
import { highlightMaterial } from "./lib/materials";

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

    this.lines = new THREE.Line(new THREE.Geometry(), highlightMaterial);
    this.scene.add(this.lines);

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

    this.entity = new Entity();
    this.scene.add(this.entity);

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

    // mouse actions

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

    // threejs intersections actions

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

    const clickExtrude$ =
      faceMouseDown$
        .do( ([{ buttons }, intersections]) => {
          const direction = (buttons === MouseButton.PRIMARY) ? 1 : -1;
          const { polygon } = intersections[0].face;
          polygon.extrude(1 * direction);
        });

    // house specific actions

    const wallMouseDown$ =
      faceMouseDown$
        .filter( ([event, intersections]) => {
          const {face} = intersections.find(i => i.face);
          return (
            face.normal.x === 1 ||
            face.normal.x === -1
          );
        })
        .do(_ => console.log('wall'));

    const endWallMouseDown$ =
      faceMouseDown$
        .filter( ([event, intersections]) => {
          const {face} = intersections.find(i => i.face);
          return (
            face.normal.z === 1 || face.normal.z === -1
          );
        })
        .do(_ => console.log('end wall'));
        // .do( ([event, intersections]) => {
        //   const intersection = intersections[0];
        //   const { face } = intersection;
        //   const { polygon } = face;
        //   const amount = (event.buttons === MouseButton.PRIMARY) ? 1 : -1;

        //   if (face.normal.z === 1) {
        //     intersection.object.entity.append(amount);
        //   } else {
        //     intersection.object.entity.prepend(amount);
        //   }
        // });

    // const dragExtrude$ =
    //   wallMouseDown$
    //     .do(addWindow.bind(this))
    //     .do( ([{ buttons }, intersections]) => {
    //       const intersection = is = intersections[0];
    //       // const direction = (buttons === MouseButton.PRIMARY) ? 1 : -1;
    //       const { polygon } = intersection.face;

    //       const geometry = new THREE.Geometry();
    //       this.lines.geometry = geometry;
    //       geometry.vertices = [...polygon.vertices];
    //       this.lines.geometry.verticesNeedUpdate = true;
    //       // polygon.extrude(1 * direction);

    //       // this.plane.setFromNormalAndCoplanarPoint(
    //       //   intersection.face.normal,
    //       //   intersection.point.clone()
    //       // );
    //       vertices = Array.from(is.face.polygon.vertices);
    //       origVertices = vertices.map(v => v.clone());

    //       this.plane.setFromCoplanarPoints(
    //         intersection.point.clone(),
    //         intersection.point.clone().add(new THREE.Vector3(0,1,0)),
    //         intersection.point.clone().add(intersection.face.normal.normalize())
    //       );
    //       this.raycaster.ray.intersectPlane(this.plane, startPt);
    //       // console.log(origVertices);

    //       console.log([...polygon.vertices]);
    //     })
    //     // .switchMapTo(mouseMove$)
    //     .takeUntil(mouseUp$)
    //     .repeat()
    //     .do(a => {
    //       if (this.raycaster.ray.intersectPlane(this.plane, planeIntersection)) {
    //         const change = planeIntersection.clone().sub(startPt);
    //         const b = change.multiply(is.face.normal.normalize());

    //         vertices.forEach( (vertex, index) => {
    //           vertex.copy(
    //             origVertices[index].clone().add(b)
    //           );
    //         });

    //         console.log(is);

    //         is.object.update();
    //       }
    //     });

    // render action

    this.render$ =
      Observable
        .merge(wheel$, mouseDownAndMoving$, mouseUp$, wallMouseDown$, endWallMouseDown$)
        .throttleTime(20)
        .delay(10)
        .startWith(true)
        .subscribe(_ => requestAnimationFrame(this.render3D));
  }

  componentWillUnmount() {
    this.render$.unsubscribe();
  }

  render3D() {
    // console.log('render');
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        ref={ me => me.appendChild(this.renderer.domElement) } />
    );
  }
}
