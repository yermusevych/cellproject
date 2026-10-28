import { useEffect, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { mix, smooth } from "./timeline";
export type SceneNavigation = {
  zoom: (factor: number) => void;
  reset: () => void;
};
export function NavigationControls({
  navigation,
  timeline,
  analogy,
  onInteract,
  reduced,
}: {
  navigation: MutableRefObject<SceneNavigation | null>;
  timeline: MutableRefObject<number>;
  analogy: boolean;
  onInteract: () => void;
  reduced: boolean;
}) {
  const controls = useRef<OrbitControlsImpl>(null),
    { camera, gl, size } = useThree(), manual = useRef(false);
  const position = useRef(new THREE.Vector3()), target = useRef(new THREE.Vector3());
  useEffect(() => { manual.current = false; }, [analogy]);
  useEffect(() => { manual.current = false; }, [size.width, size.height]);
  useEffect(() => {
    navigation.current = {
      zoom(factor) {
        manual.current = true;
        onInteract();
        const focus = controls.current?.target ?? new THREE.Vector3();
        const offset = camera.position.clone().sub(focus);
        const distance = THREE.MathUtils.clamp(
          offset.length() * factor,
          2.5,
          80,
        );
        camera.position.copy(
          focus.clone().add(offset.normalize().multiplyScalar(distance)),
        );
        controls.current?.update();
      },
      reset() {
        manual.current = false;
      },
    };
    return () => {
      navigation.current = null;
    };
  }, [navigation, camera, onInteract]);
  useFrame((_, dt) => {
    const mobile = size.width < 760, p = timeline.current;
    if (camera instanceof THREE.PerspectiveCamera) { camera.fov = mobile ? 48 : 43; camera.updateProjectionMatrix(); }
    if (!manual.current) {
      const zoom = 1 - smooth(0, 1.4, p) * 0.12 + smooth(2.8, 3.4, p) * 0.05 - smooth(3.9, 4.1, p) * 0.09 + smooth(4.12, 4.85, p) * 0.14 + smooth(5.8, 7, p) * 0.1;
      const aspect = size.width / size.height;
      const fit = mobile ? mix(analogy ? 4.1 : 4, analogy ? 4.5 : 5, smooth(5.8, 7, p)) / (Math.tan(24 * Math.PI / 180) * aspect) : mix(4.6, 6.3, smooth(5.8, 7, p)) / (Math.tan(21.5 * Math.PI / 180) * aspect);
      const distance = Math.max(mobile ? 12.2 : analogy ? 14 : 10.2, fit) * zoom;
      const angle = 0.13 + Math.sin(p * 0.8) * 0.12;
      position.current.set(Math.sin(angle) * distance, (analogy ? 4.5 : 1.12) + Math.sin(p * 0.7) * 0.35, Math.cos(angle) * distance);
      target.current.set(mobile ? 0 : analogy && size.width < 1100 ? -0.35 : -1.35, mobile ? analogy ? -0.55 : 0.3 : analogy ? -0.6 : 0, 0);
      const blend = reduced ? 1 : 1 - Math.exp(-dt * 5);
      camera.position.lerp(position.current, blend);
      controls.current?.target.lerp(target.current, blend);
      controls.current?.update();
    }
    gl.domElement.dataset.cameraDistance = camera.position.length().toFixed(3);
    gl.domElement.dataset.cameraPosition = camera.position
      .toArray()
      .map((n) => n.toFixed(3))
      .join(",");
    gl.domElement.dataset.orbitEnabled = "true";
  });
  return (
    <OrbitControls
      ref={controls}
      enabled
      onStart={() => { manual.current = true; onInteract(); }}
      enableRotate
      enableZoom
      enablePan
      enableDamping={!reduced}
      dampingFactor={0.09}
      rotateSpeed={0.65}
      zoomSpeed={0.75}
      minDistance={2.5}
      maxDistance={80}
      minPolarAngle={0.015}
      maxPolarAngle={Math.PI - 0.015}
      screenSpacePanning
      makeDefault
    />
  );
}
