import * as THREE from "three";
import { labelAnchor, type Point3 } from "./geometry.ts";

type Target = THREE.Object3D & { geometry?: THREE.BufferGeometry };

// Resolve against the actual, currently transformed render geometry. Surface
// labels use triangle intersections; curve labels read the rendered buffers.
export class StructureAnchorResolver {
  private ray = new THREE.Raycaster();
  private box = new THREE.Box3();
  private centre = new THREE.Vector3();
  private size = new THREE.Vector3();
  private right = new THREE.Vector3();
  private up = new THREE.Vector3();
  private origin = new THREE.Vector3();
  private direction = new THREE.Vector3();

  resolve(scene: THREE.Object3D, camera: THREE.Camera, name: string, p: number): Point3[] {
    const targets: Target[] = [];
    scene.traverseVisible(object => {
      if ((object.userData.anchorFor as string[] | undefined)?.includes(name)) targets.push(object as Target);
    });
    if (!targets.length) return [];
    for (const target of targets) target.updateWorldMatrix(true, false);
    if (name === "Cytoplasm") return [labelAnchor(name, p, [0, 0, 0])];
    if (name === "Opposite ends") return targets.map(target => this.vertex(target, target.userData.anchorPole));
    if (name === "Spindle fibres" || name === "Middle of the cell") {
      const t = targets[0];
      if (t.userData.anchorLocal) return [t.localToWorld(new THREE.Vector3(...t.userData.anchorLocal as Point3)).toArray() as Point3];
      return [this.vertex(t, t.userData.anchorVertex)];
    }
    if (["DNA", "DNA (chromatin)", "Chromatin", "DNA copies", "DNA copy", "Duplicated chromosome"].includes(name)) {
      return targets.map(target => {
        const attr = target.geometry!.getAttribute("position");
        const start = target.userData.anchorRing * target.userData.anchorStride;
        this.centre.set(0, 0, 0);
        for (let i = 0; i < target.userData.anchorSides; i++) this.centre.add(new THREE.Vector3().fromBufferAttribute(attr, start + i));
        this.centre.divideScalar(target.userData.anchorSides);
        target.localToWorld(this.centre);
        return this.surface([target], camera, this.centre.clone());
      });
    }
    const preferred = targets.find(t => t.userData.anchorSide === 0) ?? targets.find(t => t.userData.anchorSide === (name === "Daughter cell" ? -1 : 1)) ?? targets[0];
    // A front-surface hit on a transparent shell looks like empty space.
    // Attach shell leaders to their visible contour instead, in every view.
    if (["Nucleus", "New nucleus"].includes(name)) return [this.contour([preferred], camera, -1, 0)];
    if (name === "Nuclear membrane") return [this.contour([preferred], camera, 0.6, -0.8)];
    if (name === "Cell membrane") return [this.contour(targets, camera, 1, -0.16)];
    if (name === "Daughter cell") return [this.contour([preferred], camera, 0.55, -1)];
    preferred.geometry!.computeBoundingBox();
    this.box.copy(preferred.geometry!.boundingBox!).applyMatrix4(preferred.matrixWorld);
    this.box.getCenter(this.centre); this.box.getSize(this.size);
    camera.updateWorldMatrix(true, false);
    this.right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    this.up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    const nuclear = ["Nucleus", "New nucleus", "Nuclear membrane"].includes(name);
    const radius = nuclear ? Math.min(this.size.x, this.size.y, this.size.z) / 2 : this.size.y / 2;
    const hint = this.centre.clone()
      .addScaledVector(this.right, radius * (name === "Nucleus" || name === "New nucleus" ? -0.82 : nuclear ? 0.69 : name === "Cell membrane" ? 0.89 : 0.3))
      .addScaledVector(this.up, radius * (name === "Nucleus" || name === "New nucleus" ? 0.12 : name === "Cell membrane" ? -0.16 : -0.42));
    // Generic membrane labels may hit either visible half; a nucleus label
    // stays attached to the one chosen nucleus rather than nearby DNA.
    return [this.surface(nuclear || name === "Centrosome" || name === "Daughter cell" ? [preferred] : targets, camera, hint)];
  }

  private contour(targets: Target[], camera: THREE.Camera, x: number, y: number): Point3 {
    camera.updateWorldMatrix(true, false);
    const vertex = new THREE.Vector3(), projected = new THREE.Vector3(), endpoint = new THREE.Vector3();
    let furthest = -Infinity;
    for (const target of targets) {
      const positions = target.geometry!.getAttribute("position");
      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i).applyMatrix4(target.matrixWorld);
        projected.copy(vertex).project(camera);
        const score = projected.x * x + projected.y * y;
        if (score > furthest) { furthest = score; endpoint.copy(vertex); }
      }
    }
    return endpoint.toArray() as Point3;
  }

  private vertex(target: Target, index: number): Point3 {
    return target.localToWorld(new THREE.Vector3().fromBufferAttribute(target.geometry!.getAttribute("position"), index)).toArray() as Point3;
  }

  private surface(targets: Target[], camera: THREE.Camera, hint: THREE.Vector3): Point3 {
    camera.getWorldPosition(this.origin);
    this.direction.copy(hint).sub(this.origin).normalize();
    this.ray.set(this.origin, this.direction);
    const hits: THREE.Intersection[] = [];
    for (const target of targets) {
      target.geometry!.computeBoundingSphere();
      // Some transparent shells disable pointer raycasting; label attachment
      // must still intersect their rendered triangles.
      THREE.Mesh.prototype.raycast.call(target as THREE.Mesh, this.ray, hits);
    }
    hits.sort((a, b) => a.distance - b.distance);
    if (hits[0]) return hits[0].point.toArray() as Point3;
    // A fallback remains on an actual vertex, never in empty space.
    let closest = Infinity, point = hint.clone();
    for (const target of targets) {
      const attr = target.geometry!.getAttribute("position");
      for (let i = 0; i < attr.count; i++) {
        const vertex = target.localToWorld(new THREE.Vector3().fromBufferAttribute(attr, i));
        const distance = vertex.distanceToSquared(hint);
        if (distance < closest) { closest = distance; point = vertex; }
      }
    }
    return point.toArray() as Point3;
  }
}
