import './index.scss';

import {
  Clock, AnimationMixer, Scene, WebGLRenderer, PerspectiveCamera, Mesh, BoxGeometry, MeshLambertMaterial, PointLight, Vector3,
} from 'three';
import FBXLoader from 'three-fbx-loader';
import { ArToolkitSource, ArToolkitContext, ArMarkerControls } from 'node-ar.js';

import markerPattern from './assets/marker.patt';
import cameraParam from './assets/camera_para.dat';
import character from './assets/character.fbx';

const scene = new Scene();
const camera = new PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.001, 10000);

camera.position.z = -5;
camera.position.y = 5;
camera.lookAt(new Vector3());
scene.add(camera);

const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const light = new PointLight(0xffffff, 1);
light.position.x = 1;
light.position.y = 1.5;
scene.add(light);

const mixers = [];

const loader = new FBXLoader();
loader.load(character, (object) => {
  object.mixer = new AnimationMixer(object);
  object.position.y = 0.15;
  mixers.push(object.mixer);
  console.log(object.mixer);

  const action = object.mixer.clipAction(object.animations[0]);
  action.play();

  object.traverse((child) => {
    if (child.isMesh) {
      child.material = new MeshLambertMaterial({ color: 0xff0000 });
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  object.scale.set(0.005, 0.005, 0.005);
  scene.add(object);
});

const box = new Mesh(
  new BoxGeometry(0.9, 0.1, 0.9),
  new MeshLambertMaterial({ color: 0xfe9900 }),
);
box.position.y = 0.1;
scene.add(box);

document.body.appendChild(renderer.domElement);

// Set up AR
const _artoolkitsource = ArToolkitSource();
const arToolkitSource = new _artoolkitsource({ sourceType: 'webcam' });

const arToolkitContext = new ArToolkitContext({
  cameraParametersUrl: cameraParam,
  detectionMode: 'mono',
  maxDetectionRate: 60,
});
arToolkitContext.init(() => {
  arToolkitContext.arController.setPattRatio(0.9);
  arToolkitContext.addEventListener('markerFound', () => { console.log('marker found'); });
  camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});

const markerControls = new ArMarkerControls(arToolkitContext, camera, { //eslint-disable-line
  type: 'pattern',
  patternUrl: markerPattern,
  changeMatrixMode: 'cameraTransformMatrix',
});

const clock = new Clock();
const update = () => {
  if (arToolkitSource.ready) arToolkitContext.update(arToolkitSource.domElement);
  for (let i = 0; i < mixers.length; i += 1) {
    mixers[i].update(clock.getDelta());
  }
  renderer.render(scene, camera);
  requestAnimationFrame(update);
};

update();


const onResize = () => {
  // camera.aspect = window.innerWidth / window.innerHeight;
  // camera.updateProjectionMatrix();
  // renderer.setSize(window.innerWidth, window.innerHeight);

  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);
  if (arToolkitContext.arController) {
    arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
  }
};

arToolkitSource.init(() => onResize());

window.addEventListener('resize', () => onResize());
