import * as THREE from 'three';
import * as CANNON from 'cannon-es';

let scene, camera, renderer, world;
let dice = [];

init();
animate();

function init() {
  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 20);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);

  // Physics world
  world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0)
  });

  // Ground
  const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane(),
    material: new CANNON.Material()
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  const groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  groundMesh.rotation.x = -Math.PI / 2;
  scene.add(groundMesh);

  // Roll button
  document.getElementById('rollButton').addEventListener('click', rollDice);
}

function rollDice() {
  clearDice();

  const die = createDie('d20'); // Change to 'd4', 'd6', 'd10', 'd20'
  dice.push(die);
}

function createDie(type) {
  let geometry;
  switch (type) {
    case 'd4':
      geometry = new THREE.TetrahedronGeometry(1);
      break;
    case 'd6':
      geometry = new THREE.BoxGeometry(1, 1, 1);
      break;
    case 'd10':
      geometry = new THREE.Geometry(); // Placeholder — needs custom geometry
      break;
    case 'd20':
      geometry = new THREE.IcosahedronGeometry(1);
      break;
  }

  const material = new THREE.MeshStandardMaterial({ color: 0x00aaff });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)); // Approximate shape
  const body = new CANNON.Body({
    mass: 1,
    shape: shape,
    position: new CANNON.Vec3(0, 5, 0)
  });
  body.velocity.set(Math.random() * 5, 10, Math.random() * 5);
  body.angularVelocity.set(Math.random(), Math.random(), Math.random());
  world.addBody(body);

  return { mesh, body };
}

function clearDice() {
  dice.forEach(d => {
    scene.remove(d.mesh);
    world.removeBody(d.body);
  });
  dice = [];
}

function animate() {
  requestAnimationFrame(animate);
  world.step(1/60);

  dice.forEach(d => {
    d.mesh.position.copy(d.body.position);
    d.mesh.quaternion.copy(d.body.quaternion);
  });

  renderer.render(scene, camera);
}
