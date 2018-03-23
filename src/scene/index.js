import { h, Component } from 'preact';
import { Observable } from "rxjs";
import * as THREE from "three";
import subtract from "lodash/subtract";
const OrbitControls = require("three-orbit-controls")(THREE);

import Entity from "./entity"
import Window, { addWindow } from "./entity/window";
import { MouseButton, getPosition, checkForIntersection, clampedNormal } from "./lib/utils";
import { highlightMaterial } from "./lib/materials";
import { area } from "./lib/clipper";

export default class Scene extends Component {

  constructor(props) {
    super(props);

    console.log("NEEEEEW")

    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.render3D = this.render3D.bind(this);
    this.addEvents = this.addEvents.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  componentDidMount() {
    const { width=400, height=400, bgColor=0xcccccc } = this.props;

    this.scene = new THREE.Scene();

    this.lines = new THREE.Line(new THREE.Geometry(), highlightMaterial);
    this.scene.add(this.lines);

    var ground = new THREE.GridHelper(20, 20, 0xDDDDDD, 0xEEEEEE);
    ground.rotation.x = -Math.PI;
    ground.position.set(0, -0.005, 0);
    this.scene.add(ground);

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

    this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    // this.planeHelper = new THREE.PlaneHelper(this.plane, 10, 0xffff00);
    // this.scene.add(this.planeHelper);

    this.addEvents();
  }

  addEvents() {

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

    const intersectionPt = new THREE.Vector3();
    let is;

    const roofMouseDown$ =
      faceMouseDown$
        .filter( ([event, intersections]) => {
          const intersection = is = intersections[0];//intersections.find(i => i.face);
          const { face } = intersection;
          return (
            face.normal.y !== 0 ||
            face.normal.y !== -0
          );
        })
        .do( ([event, intersections]) => {
          const { polygon } = intersections[0].face;
          const direction = (event.buttons === MouseButton.PRIMARY) ? 1 : -1;
          this.entity.addFloor(direction);

          this.props.updateMetrics({
            floors: [this.entity.floors, ''],
            height: [Math.max(...this.entity.children[0].geometry.vertices.map(v => v.y)), 'm']
          });
        })
        .do(_ => console.log('roof'));

    const wallMouseDown$ =
      faceMouseDown$
        .filter( ([event, intersections]) => {
          const intersection = is = intersections[0];//intersections.find(i => i.face);
          const { face } = intersection;
          return (
            face.normal.x === 1 ||
            face.normal.x === -1
          );
        })
        .do( ([event, intersections]) => {
          const { point, face } = intersections[0];
          this.plane.setFromCoplanarPoints(
            point.clone(),
            point.clone().add(new THREE.Vector3(0,1,0)),
            point.clone().add(face.normal.normalize())
          );
        })
        .do(_ => console.log('wall'));

    const endWallMouseDown$ =
      faceMouseDown$
        .filter( ([event, intersections]) => {
          const intersection = is = intersections[0];
          const { face } = intersection;

          return (
            face.normal.z === 1 || face.normal.z === -1
          );
        })
        .do( ([event, intersections]) => {
          const { polygon } = intersections[0].face;
          const direction = (event.buttons === MouseButton.PRIMARY) ? 1 : -1;
          polygon.extrude(1.2 * direction);
          polygon.geometry.verticesNeedUpdate = true;
          polygon.geometry.computeBoundingSphere();

          const endPoints = is.object.geometry.vertices.slice(0, is.object.geometry.vertices.length/2).map(v => ([v.x, v.y]));
          const endWallArea = [area(endPoints), 'm²'];
          const groundPoints = is.object.geometry.vertices.filter(v => v.y === 0);
          const length = [Math.abs(groundPoints[1].z - groundPoints[2].z), 'm'];

          this.props.updateMetrics({ length, endWallArea });

        })
        .do(_ => console.log('end wall'));

    // house actions

    const wallDrag$ =
      wallMouseDown$
        .switchMapTo(mouseMove$)
        .takeUntil(mouseUp$)
        .do(_ => console.log('dragging wall'))
        .do(_ => {
          this.raycaster.ray.intersectPlane(this.plane, intersectionPt);
          is.face.polygon.vertices.forEach(vertex => {
            vertex.x = intersectionPt.x;
          });
          is.face.polygon.geometry.verticesNeedUpdate = true;

          const groundPoints = is.object.geometry.vertices.filter(v => v.y === 0);
          const width = [Math.abs(groundPoints[0].x - groundPoints[1].x), 'm'];

          this.props.updateMetrics({ width });

          // console.log(Math.abs(w[0].x - w[1].x));
          // const width = [...is.face.polygon.vertices].filter(v => v.y === 0).map(v => v.z);
          // console.log(width);
        })
        .repeat();

    const endWallDrag$ =
      endWallMouseDown$
        .switchMapTo(mouseMove$)
        .takeUntil(mouseUp$)
        .do(_ => console.log('dragging endwall'))
        .repeat();

    // render action

    this.render$ =
      Observable
        .merge(
          wheel$,
          mouseDownAndMoving$,
          mouseUp$,
          // wallMouseDown$,
          // endWallMouseDown$,
          wallDrag$,
          endWallDrag$,
          roofMouseDown$
        )
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
