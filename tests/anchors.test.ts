import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { StructureAnchorResolver } from "../src/structureAnchors.ts";
import { labelAnchor } from "../src/geometry.ts";

function verifySurface(mesh: THREE.Mesh, camera: THREE.PerspectiveCamera, point: number[]) {
  const target = new THREE.Vector3(...point);
  const ray = new THREE.Raycaster(camera.position, target.clone().sub(camera.position).normalize());
  const hit = ray.intersectObject(mesh)[0];
  assert.ok(hit, "Anchor ray must hit the rendered target");
  assert.ok(hit.point.distanceTo(target) < 1e-7, "Leader endpoint must coincide with a rendered triangle");
}
test("nucleus labels end on its actual surface after transforms and camera rotation", () => {
  const scene = new THREE.Scene(), resolver = new StructureAnchorResolver();
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  sphere.userData = { anchorFor: ["Nucleus", "Nuclear membrane"], anchorSide: 0 };
  sphere.scale.setScalar(1.46); sphere.position.set(1.7, 0.2, -0.3); scene.add(sphere);
  for (const position of [[3, 2, 8], [-7, 1, 2], [0, -3, -8]]) {
    const camera = new THREE.PerspectiveCamera(43, 1.6, 0.1, 100);
    camera.position.set(...position as [number, number, number]); camera.lookAt(sphere.position); camera.updateMatrixWorld();
    for (const name of ["Nucleus", "Nuclear membrane"]) {
      const [point] = resolver.resolve(scene, camera, name, 1.8);
      verifySurface(sphere, camera, point);
      assert.ok(new THREE.Vector3(...point).distanceTo(sphere.position) > 1.45);
    }
  }
  sphere.visible = false;
  assert.equal(resolver.resolve(scene, new THREE.Camera(), "Nucleus", 3.5).length, 0);
});
test("membrane anchors stay on deformed render triangles rather than old radius estimates", () => {
  const scene = new THREE.Scene(), resolver = new StructureAnchorResolver();
  const geometry = new THREE.SphereGeometry(2.38, 48, 32);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  mesh.userData = { anchorFor: ["Cell membrane"], anchorSide: 1 }; scene.add(mesh);
  const camera = new THREE.PerspectiveCamera(43, 1.6, 0.1, 100); camera.position.set(2, 1, 9); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  for (const stretch of [1, 1.22, 0.88]) {
    const attr = geometry.getAttribute("position");
    for (let i = 0; i < attr.count; i++) attr.setXYZ(i, attr.getX(i) * stretch, attr.getY(i) * 0.99, attr.getZ(i) * 0.97);
    attr.needsUpdate = true;
    const [point] = resolver.resolve(scene, camera, "Cell membrane", 4.5);
    verifySurface(mesh, camera, point);
  }
});
test("spindle labels follow the actual animated line buffer and its world transform", () => {
  const scene = new THREE.Scene(), resolver = new StructureAnchorResolver();
  const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0.3, 0.2), new THREE.Vector3(2, 0.7, 0.4)]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
  line.userData = { anchorFor: ["Spindle fibres"], anchorVertex: 1 }; line.position.set(0.2, 0.1, -0.3); line.rotation.z = 0.4; scene.add(line);
  for (const z of [0.2, 0.213, 0.19]) {
    geometry.getAttribute("position").setZ(1, z);
    const [point] = resolver.resolve(scene, new THREE.Camera(), "Spindle fibres", 3.5);
    const expected = line.localToWorld(new THREE.Vector3(1, 0.3, z));
    assert.ok(expected.distanceTo(new THREE.Vector3(...point)) < 1e-7);
  }
});
test("cytoplasm anchor stays outside the completed daughter nucleus", () => {
  const point = labelAnchor("Cytoplasm", 7.3, [0, 0, 0]);
  assert.ok(Math.hypot(point[1], point[2]) > 1.08);
  assert.ok(Math.hypot(point[1], point[2] / 0.87) < 1.68);
});
