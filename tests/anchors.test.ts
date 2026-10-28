import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { StructureAnchorResolver } from "../src/structureAnchors.ts";
import { labelAnchor } from "../src/geometry.ts";

function verifySurface(mesh: THREE.Mesh, camera: THREE.PerspectiveCamera, point: number[]) {
  const target = new THREE.Vector3(...point);
  const positions = mesh.geometry.getAttribute("position"), indices = mesh.geometry.getIndex()!;
  const triangle = new THREE.Triangle(), closest = new THREE.Vector3();
  let distance = Infinity;
  for (let i = 0; i < indices.count; i += 3) {
    for (const [vertex, offset] of [[triangle.a, 0], [triangle.b, 1], [triangle.c, 2]] as const) {
      vertex.fromBufferAttribute(positions, indices.getX(i + offset)).applyMatrix4(mesh.matrixWorld);
    }
    distance = Math.min(distance, triangle.closestPointToPoint(target, closest).distanceTo(target));
  }
  assert.ok(distance < 1e-7, "Leader endpoint must coincide with a rendered triangle, including contour vertices");
}

function verifyContour(mesh: THREE.Mesh, camera: THREE.PerspectiveCamera, point: number[], x: number, y: number) {
  const projected = new THREE.Vector3(...point).project(camera);
  const positions = mesh.geometry.getAttribute("position");
  for (let i = 0; i < positions.count; i++) {
    const vertex = mesh.localToWorld(new THREE.Vector3().fromBufferAttribute(positions, i)).project(camera);
    assert.ok(vertex.x * x + vertex.y * y <= projected.x * x + projected.y * y + 1e-8,
      "Shell pointer must meet the visible silhouette, never the transparent interior");
  }
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
      verifyContour(sphere, camera, point, name === "Nucleus" ? -1 : 0.6, name === "Nucleus" ? 0 : -0.8);
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
    verifyContour(mesh, camera, point, 1, -0.16);
  }
});
test("stage-six nucleus and daughter-cell pointers meet their visible outlines after orbit and separation", () => {
  const scene = new THREE.Scene(), resolver = new StructureAnchorResolver();
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), new THREE.MeshBasicMaterial());
  nucleus.userData = { anchorFor: ["Nucleus", "New nucleus", "Nuclear membrane"], anchorSide: 1 };
  const daughter = new THREE.Mesh(new THREE.SphereGeometry(1.68, 48, 32), new THREE.MeshBasicMaterial());
  daughter.userData = { anchorFor: ["Daughter cell"], anchorSide: -1 };
  scene.add(nucleus, daughter);
  for (const separation of [1.74, 2.8]) {
    nucleus.position.set(separation, -0.1, 0); nucleus.scale.setScalar(1.08);
    daughter.position.set(-separation, 0.1, 0); daughter.scale.set(1, 1, 0.87);
    for (const position of [[3, 2, 9], [-7, 1, 6], [2, -4, -9]]) {
      const camera = new THREE.PerspectiveCamera(43, 1.6, 0.1, 100);
      camera.position.set(...position as [number, number, number]); camera.lookAt(0.2, 0, 0); camera.updateMatrixWorld();
      for (const name of ["Nucleus", "New nucleus", "Daughter cell"]) {
        const mesh = name === "Daughter cell" ? daughter : nucleus;
        const [point] = resolver.resolve(scene, camera, name, 7.3);
        verifySurface(mesh, camera, point);
        verifyContour(mesh, camera, point, name === "Daughter cell" ? 0.55 : -1, name === "Daughter cell" ? -1 : 0);
      }
    }
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
