import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import {
  Canvas,
  events as fiberEvents,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { SceneLabel, DescriptionPlaque, ANALOGY_DEFINITIONS } from "./SceneAnnotations";
import { definitions } from "./timeline";
import { StructureAnchorResolver } from "./structureAnchors";
import { EverydayAnalogies } from "./EverydayAnalogies";
import { NavigationControls, type SceneNavigation } from "./NavigationControls";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";
import {
  chromosomeCenterPoint,
  chromatidLocalPoint,
  chromosomePositionAt,
  dnaConfinement,
  centrosomePosition,
  spindleCurvePoint,
  labelAnchor,
} from "./geometry";
import {
  biology,
  clamp,
  mix,
  smooth,
  membraneProfile,
  daughterCenter,
  CHROMOSOME_COUNT,
  CHROMOSOME_COLORS,
  classroomLabelSets as LABEL_SETS,
} from "./timeline";

type Timeline = MutableRefObject<number>;
type Props = {
  timeline: Timeline;
  stage: number;
  reduced: boolean;
  labels: boolean;
  analogy: boolean;
  selected: string | null;
  onSelect: (v: string) => void;
  navigation: MutableRefObject<SceneNavigation | null>;
  onInteract: () => void;
  onClear: () => void;
};
const TAU = Math.PI * 2;
const COPPER = "#f6ad83",
  TEAL = "#8ee8d3";
const membraneVertex = `
 uniform float time;uniform float rippleTime;uniform vec3 rippleOrigin;uniform float motion;
 varying vec3 vNormal;varying vec3 vPosition;varying vec3 vView;
 void main(){
  float age=time-rippleTime;float d=length(position-rippleOrigin);float front=age*1.9*motion;
  float envelope=exp(-pow((d-front)*6.,2.))*exp(-max(age,0.)*1.6)*step(0.,age)*(1.-step(2.8,age));
  vec3 displaced=position+normal*cos((d-front)*22.)*envelope*.035*motion;
  vNormal=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(displaced,1.);vView=normalize(-mv.xyz);vPosition=position;gl_Position=projectionMatrix*mv;
 }`;
const membraneFragment = `
 uniform vec3 color;uniform float opacity;uniform float time;uniform float rippleTime;uniform vec3 rippleOrigin;uniform float motion;
 varying vec3 vNormal;varying vec3 vPosition;varying vec3 vView;
 void main(){
  float rim=pow(1.-abs(dot(normalize(vNormal),vView)),2.4);
  float bands=sin(vPosition.y*38.+sin(vPosition.x*8.+time*.2*motion)*.4)*.5+.5;
  float grain=sin(vPosition.x*63.+vPosition.z*42.)*sin(vPosition.y*58.-vPosition.z*23.);
  float age=time-rippleTime;float d=length(vPosition-rippleOrigin);float front=age*1.9*motion;
  float envelope=exp(-pow((d-front)*6.,2.))*exp(-max(age,0.)*1.6)*step(0.,age)*(1.-step(2.8,age));
  float pulse=max(0.,cos((d-front)*22.))*envelope;
  float a=(.035+rim*.59+bands*.012+grain*.009+pulse*.45)*opacity;
  gl_FragColor=vec4(color*(.50+rim*.75)+vec3(.43,.67,.57)*pulse,a);
 }`;
function membraneMaterial(color: string, opacity = 1) {
  return new THREE.ShaderMaterial({
    vertexShader: membraneVertex,
    fragmentShader: membraneFragment,
    uniforms: {
      color: { value: new THREE.Color(color) },
      opacity: { value: opacity },
      time: { value: 0 },
      rippleTime: { value: -100 },
      rippleOrigin: { value: new THREE.Vector3() },
      motion: { value: 1 },
    },
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  });
}
function interactive(name: string, onSelect: Props["onSelect"]) {
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.delta < 5) onSelect(name);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      document.body.style.cursor = "";
    },
  };
}

// A reusable fixed buffer. Only vertices change; no per-frame GPU allocations.
function surfaceGeometry(rows = 48, cols = 64) {
  const g = new THREE.BufferGeometry();
  const positions = new Float32Array((rows + 1) * (cols + 1) * 3);
  const index: number[] = [];
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j,
        b = a + cols + 1;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setIndex(index);
  return g;
}
function CellMembrane({
  side,
  timeline,
  onSelect,
  selected,
  reduced,
}: {
  side: number;
  timeline: Timeline;
  onSelect: Props["onSelect"];
  selected: string | null;
  reduced: boolean;
}) {
  const { gl } = useThree();
  const geometry = useMemo(() => surfaceGeometry(), []),
    material = useMemo(() => membraneMaterial("#6fc8b4"), []);
  useFrame(({ clock }) => {
    const p = timeline.current,
      arr = geometry.attributes.position.array as Float32Array;
    let n = 0;
    for (let i = 0; i <= 48; i++) {
      const v = i / 48;
      const { x, r } = membraneProfile(v, side, p);
      for (let j = 0; j <= 64; j++) {
        const a = (j / 64) * TAU;
        const wave = reduced
          ? 1
          : 1 +
            0.008 *
              Math.sin(a * 5 + v * 16 + clock.elapsedTime * 0.7) *
              Math.sin(v * Math.PI);
        arr[n++] = x;
        arr[n++] = r * Math.cos(a) * wave;
        arr[n++] = r * Math.sin(a) * 0.87 * wave;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    material.uniforms.time.value = clock.elapsedTime;
    material.uniforms.motion.value = reduced ? 0 : 1;
    material.uniforms.opacity.value = [
      "Cell membrane",
      "Cytoplasm",
      "Daughter cell",
    ].includes(selected || "")
      ? 1.55
      : 1;
  });
  return (
    <mesh
      geometry={geometry}
      material={material}
      userData={{ anchorFor: ["Cell membrane", "Opposite ends", "Daughter cell", "Cytoplasm"], anchorSide: side, anchorPole: 48 * 65, envelope: true }}
      renderOrder={3}
      onPointerDown={(e) => {
        material.uniforms.rippleOrigin.value.copy(
          e.object.worldToLocal(e.point.clone()),
        );
        material.uniforms.rippleTime.value = material.uniforms.time.value;
        const stamp = String(e.nativeEvent.timeStamp);
        if (gl.domElement.dataset.rippleInput !== stamp) {
          gl.domElement.dataset.rippleInput = stamp;
          gl.domElement.dataset.rippleCount = String(
            Number(gl.domElement.dataset.rippleCount || 0) + 1,
          );
        }
      }}
    />
  );
}
function Nucleus({
  timeline,
  onSelect,
  selected,
}: {
  timeline: Timeline;
  onSelect: Props["onSelect"];
  selected: string | null;
}) {
  const original = useRef<THREE.Mesh>(null),
    left = useRef<THREE.Mesh>(null),
    right = useRef<THREE.Mesh>(null);
  const nucleoli = useRef<THREE.Group>(null);
  const materials = useMemo(
    () => [
      membraneMaterial("#8cbdd0", 1),
      membraneMaterial("#9fbfc7"),
      membraneMaterial("#9fbfc7"),
    ],
    [],
  );
  useFrame(() => {
    const b = biology(timeline.current);
    if (original.current) {
      original.current.visible = b.envelope > 0.001;
      original.current.scale.setScalar(
        mix(1.26, 1.46, smooth(1, 1.9, timeline.current)),
      );
    }
    materials[0].uniforms.opacity.value =
      b.envelope * (["Nucleus", "Nuclear membrane"].includes(selected || "") ? 1.9 : 0.95);
    materials[0].uniforms.color.value.set(["Nucleus", "Nuclear membrane"].includes(selected || "") ? "#efb093" : "#8cbdd0");
    [left.current, right.current].forEach((m, i) => {
      if (!m) return;
      m.visible = b.daughterEnvelope > 0.001;
      m.position.x = (i ? 1 : -1) * daughterCenter(b.division);
      m.scale.setScalar(mix(0.73, 1.08, b.daughterEnvelope));
      materials[i + 1].uniforms.opacity.value =
        b.daughterEnvelope *
        (["New nucleus", "Nucleus", "Nuclear membrane"].includes(selected || "")
          ? 2
          : 1);
      materials[i + 1].uniforms.color.value.set(
        ["New nucleus", "Nucleus", "Nuclear membrane"].includes(selected || "")
          ? "#efb093"
          : "#9fbfc7",
      );
    });
    if (nucleoli.current) nucleoli.current.visible = b.envelope > 0.15;
  });
  return (
    <>
      <mesh ref={original} material={materials[0]} {...interactive("Nucleus", onSelect)} userData={{ anchorFor: ["Nucleus", "Nuclear membrane"], anchorSide: 0, envelope: true }}>
        <sphereGeometry args={[1, 48, 32]} />
      </mesh>
      <group ref={nucleoli}>
        <mesh position={[0.32, 0.3, 0.1]}>
          <sphereGeometry args={[0.22, 24, 16]} />
          <meshStandardMaterial
            color="#c9a6b8"
            roughness={0.4}
            emissive="#92707a"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
      {[-1, 1].map((s, i) => (
        <group key={s}>
          <mesh
            ref={i ? right : left}
            material={materials[i + 1]}
            userData={{ anchorFor: ["Nucleus", "New nucleus", "Nuclear membrane"], anchorSide: s, envelope: true }}
            {...interactive("Nucleus", onSelect)}
          >
            <sphereGeometry args={[1, 40, 28]} />
          </mesh>
          <DaughterNucleolus side={s} timeline={timeline} selected={selected} />
        </group>
      ))}
    </>
  );
}
function DaughterNucleolus({
  side,
  timeline,
  selected,
}: {
  side: number;
  timeline: Timeline;
  selected: string | null;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      const b = biology(timeline.current);
      ref.current.visible = b.daughterEnvelope > 0.3;
      ref.current.position.set(
        side * daughterCenter(b.division) + 0.22,
        0.22,
        0.12,
      );
      ref.current.scale.setScalar(b.daughterEnvelope);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.16, 16, 12]} />
      <meshStandardMaterial
        color="#dcb6bd"
        emissive="#ba8b80"
        emissiveIntensity={0}
      />
    </mesh>
  );
}

const COUNT = CHROMOSOME_COUNT,
  SEGMENTS = 80,
  SIDES = 9;
export function chromosomeCenter(i: number, side: number, p: number) {
  return new THREE.Vector3(...chromosomeCenterPoint(i, side, p));
}
function chromatidPoint(t: number, i: number, side: number, p: number) {
  return new THREE.Vector3(...chromatidLocalPoint(t, i, side, p));
}

function Chromosome({
  i,
  side,
  ...props
}: { i: number; side: number } & Props) {
  const mesh = useRef<THREE.Mesh>(null);
  const hover = useRef(false);
  const geometry = useMemo(() => surfaceGeometry(SEGMENTS, SIDES), []);
  const center = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []),
    normal = useMemo(() => new THREE.Vector3(), []),
    binormal = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    const p = props.timeline.current,
      b = biology(p);
    if (!mesh.current) return;
    const visible = side < 0 ? 1 : b.replication;
    mesh.current.visible = visible > 0.001;
    geometry.setDrawRange(0, Math.floor(SEGMENTS * visible) * SIDES * 6);
    mesh.current.position.copy(chromosomeCenter(i, side, p));
    mesh.current.scale.setScalar(dnaConfinement(p));
    if (!props.reduced)
      mesh.current.position.y += Math.sin(clock.elapsedTime * 0.8 + i) * 0.015;
    const positions = geometry.attributes.position.array as Float32Array;
    let n = 0;
    const radius =
      mix(0.022, 0.071, b.condensation * (1 - b.decondensation)) *
      (hover.current ||
      [
        "DNA",
        "DNA (chromatin)",
        "Chromatin",
        "Duplicated chromosome",
        "DNA copies",
        "DNA copy",
      ].includes(props.selected || "")
        ? 1.22
        : 1);
    for (let k = 0; k <= SEGMENTS; k++) {
      const t = k / SEGMENTS;
      center.copy(chromatidPoint(t, i, side, p));
      tangent
        .copy(chromatidPoint(Math.min(1, t + 0.005), i, side, p))
        .sub(chromatidPoint(Math.max(0, t - 0.005), i, side, p))
        .normalize();
      normal.set(0, 0, 1).cross(tangent).normalize();
      binormal.crossVectors(tangent, normal).normalize();
      for (let j = 0; j <= SIDES; j++) {
        const a = (j / SIDES) * TAU;
        const r = radius * Math.sqrt(Math.min(1, Math.sin(t * Math.PI) * 16));
        positions[n++] =
          center.x + r * (normal.x * Math.cos(a) + binormal.x * Math.sin(a));
        positions[n++] =
          center.y + r * (normal.y * Math.cos(a) + binormal.y * Math.sin(a));
        positions[n++] =
          center.z + r * (normal.z * Math.cos(a) + binormal.z * Math.sin(a));
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  });
  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      userData={{ anchorFor: i === 0 && side < 0 ? ["DNA", "DNA (chromatin)", "Chromatin"] : i === 2 && side < 0 ? ["Duplicated chromosome", "DNA copy"] : i === 1 ? ["DNA copies"] : [], anchorRing: i === 0 ? 19 : 40, anchorStride: SIDES + 1, anchorSides: SIDES }}
      {...interactive(
        props.stage === 0
          ? "DNA (chromatin)"
          : props.stage >= 3
            ? "DNA copy"
            : "Duplicated chromosome",
        props.onSelect,
      )}
      onPointerOver={(e) => {
        e.stopPropagation();
        hover.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hover.current = false;
        document.body.style.cursor = "";
      }}
    >
      <meshStandardMaterial
        color={CHROMOSOME_COLORS[i]}
        metalness={0.28}
        roughness={0.32}
        emissive="#f18e63"
        emissiveIntensity={
          [
            "DNA",
            "DNA (chromatin)",
            "Chromatin",
            "Duplicated chromosome",
            "DNA copies",
            "DNA copy",
          ].includes(props.selected || "")
            ? 1.35
            : 0.37
        }
      />
    </mesh>
  );
}
function Centrosome({ side, ...props }: { side: number } & Props) {
  const ref = useRef<THREE.Group>(null);
  const rays = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * TAU;
        return [
          new THREE.Vector3(),
          new THREE.Vector3(
            Math.cos(a) * 0.36,
            Math.sin(a) * 0.36,
            Math.sin(a * 3) * 0.19,
          ),
        ];
      }),
    [],
  );
  useFrame(() => {
    const b = biology(props.timeline.current);
    if (!ref.current) return;
    ref.current.visible = side < 0 || b.replication > 0.5;
    ref.current.position.set(
      ...centrosomePosition(side, props.timeline.current),
    );
    ref.current.rotation.z = b.poles * 1.2;
  });
  return (
    <group ref={ref} {...interactive("Centrosome", props.onSelect)}>
      {rays.map((p, i) => (
        <Line
          key={i}
          points={p}
          color={
            ["Centrosome", "Spindle fibres"].includes(props.selected || "")
              ? COPPER
              : "#c1eedc"
          }
          transparent
          opacity={
            ["Centrosome", "Spindle fibres"].includes(props.selected || "")
              ? 1
              : 0.48
          }
          lineWidth={
            ["Centrosome", "Spindle fibres"].includes(props.selected || "")
              ? 2
              : 0.65
          }
        />
      ))}
      <mesh rotation={[0.5, 0, 0.5]} userData={{ anchorFor: ["Centrosome"], anchorSide: side }}>
        <capsuleGeometry args={[0.065, 0.19, 5, 10]} />
        <meshStandardMaterial
          color="#e3e9c6"
          emissive="#a2dabb"
          emissiveIntensity={
            ["Centrosome", "Spindle fibres"].includes(props.selected || "")
              ? 2
              : 0.7
          }
        />
      </mesh>
      <mesh position={[0.1, 0.02, 0.03]} rotation={[0.5, 0, 2]}>
        <capsuleGeometry args={[0.065, 0.18, 5, 10]} />
        <meshStandardMaterial color="#e3e9c6" />
      </mesh>
    </group>
  );
}
function SpindleFiber({
  i,
  side,
  ...props
}: { i: number; side: number } & Props) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(3 * 33), 3),
    );
    return g;
  }, []);
  const ref = useRef<THREE.Line>(null);
  const anchor = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#8bdac5",
        transparent: true,
        opacity: 0.6,
      }),
    [],
  );
  const line = useMemo(
    () => new THREE.Line(geometry, material),
    [geometry, material],
  );
  useFrame(({ clock }) => {
    const p = props.timeline.current,
      b = biology(p);
    line.userData = { anchorFor: i === 2 && side > 0 ? ["Spindle fibres"] : [], anchorVertex: 20 };
    line.visible = b.spindle > 0.001;
    const end = new THREE.Vector3(...chromosomePositionAt(0.5, i, side, p));
    const arr = geometry.attributes.position.array as Float32Array;
    for (let j = 0; j <= 32; j++) {
      const t = j / 32;
      const point = spindleCurvePoint(t, i, side, p);
      arr[j * 3] = point[0];
      arr[j * 3 + 1] = point[1];
      arr[j * 3 + 2] =
        point[2] +
        (props.reduced
          ? 0
          : Math.sin(clock.elapsedTime + i + t * 4) *
            0.013 *
            Math.sin(t * Math.PI));
    }
    geometry.attributes.position.needsUpdate = true;
    material.opacity =
      (props.selected === "Spindle fibres" ? 1 : 0.53) *
      Math.min(1, b.spindle * 3);
    if (anchor.current) {
      anchor.current.visible = b.spindle > 0.92;
      anchor.current.position.copy(end);
    }
  });
  return (
    <>
      <primitive
        ref={ref}
        object={line}
        {...interactive("Spindle fibres", props.onSelect)}
      />
      <mesh ref={anchor} {...interactive("Spindle fibres", props.onSelect)}>
        <sphereGeometry args={[0.055, 10, 8]} />
        <meshBasicMaterial
          color={props.selected === "Spindle fibres" ? "#fff9d0" : "#fcf2c6"}
        />
      </mesh>
    </>
  );
}
function Equator({
  timeline,
  onSelect,
  selected,
}: Pick<Props, "timeline" | "onSelect" | "selected">) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      const p = timeline.current;
      ref.current.visible = p > 2.8 && p < 4.2;
      (ref.current.material as THREE.MeshBasicMaterial).opacity =
        smooth(2.8, 3.1, p) *
        (1 - smooth(3.9, 4.2, p)) *
        (selected === "Middle of the cell" ? 0.22 : 0.06);
    }
  });
  return (
    <mesh
      ref={ref}
      rotation={[0, Math.PI / 2, 0]}
      userData={{ anchorFor: ["Middle of the cell"], anchorLocal: [0.8, 0.6, 0] }}
      {...interactive("Middle of the cell", onSelect)}
    >
      <circleGeometry args={[2.23, 64]} />
      <meshBasicMaterial
        color={TEAL}
        transparent
        opacity={0.05}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
function ContractileRing({
  timeline,
  onSelect,
  selected,
}: Pick<Props, "timeline" | "onSelect" | "selected">) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      const b = biology(timeline.current);
      ref.current.visible = b.division > 0.01 && b.division < 0.97;
      const r = membraneProfile(0, 1, timeline.current).r;
      ref.current.scale.set(r, r * 0.87, 1);
    }
  });
  return (
    <mesh
      ref={ref}
      rotation={[0, Math.PI / 2, 0]}
      {...interactive("Cell membrane", onSelect)}
    >
      <torusGeometry args={[1, 0.017, 8, 96]} />
      <meshBasicMaterial
        color={
          ["Cell membrane", "Cell membrane"].includes(selected || "")
            ? COPPER
            : "#d3ddb3"
        }
        transparent
        opacity={
          ["Cell membrane", "Cell membrane"].includes(selected || "") ? 1 : 0.72
        }
      />
    </mesh>
  );
}
function ParticleField({
  reduced,
  timeline,
}: Pick<Props, "reduced" | "timeline">) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    let seed = 73;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    return new Float32Array(
      Array.from({ length: 1100 * 3 }, () => (random() - 0.5) * 29),
    );
  }, []);
  useFrame(({ clock, pointer }) => {
    if (ref.current && !reduced) {
      ref.current.rotation.y = clock.elapsedTime * 0.006 + pointer.x * 0.006;
      ref.current.rotation.x = pointer.y * 0.006;
      ref.current.position.y = Math.sin(clock.elapsedTime * 0.1) * 0.1;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#96ccbd"
        size={0.018}
        transparent
        opacity={0.33}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
function FloatingLabel({ name, offset, timeline, onSelect, slot }: {
  name: string; offset: [number, number, number]; timeline: Timeline; onSelect: Props["onSelect"]; slot: number;
}) {
  const root = useRef<THREE.Group>(null), label = useRef<THREE.Group>(null), line = useRef<Line2>(null);
  const measuredWidth = useRef(140);
  const resolver = useMemo(() => new StructureAnchorResolver(), []);
  const { size, scene } = useThree();
  const second = useRef<Line2>(null), pin = useRef<THREE.Mesh>(null);
  const origin = useMemo(() => new THREE.Vector3(), []), candidate = useMemo(() => new THREE.Vector3(), []);
  const end: [number, number, number] = name === "Nucleus" ? [-1.2, -0.45, 0.9] : name === "Cell membrane" ? [1.3, 0.1, 0.65] : [offset[0] * 1.6, offset[1] * 1.6 - (slot === 4 ? 0.4 : 0), 0.65];
  useFrame(({ camera }) => {
    if (!root.current || !label.current) return;
    const anchors = resolver.resolve(scene, camera, name, timeline.current);
    root.current.visible = anchors.length > 0;
    if (!anchors.length) return;
    origin.set(...anchors[0]);
    root.current.position.copy(origin);
    candidate.copy(origin).add(new THREE.Vector3(...end)).project(camera);
    const half = Math.min(0.48, (measuredWidth.current + (size.width < 760 ? 24 : 40)) / size.width);
    candidate.x = THREE.MathUtils.clamp(candidate.x, size.width < 760 ? -1 + half : -0.14 + half, 1 - half);
    candidate.y = THREE.MathUtils.clamp(candidate.y, -0.30, size.width < 760 ? 0.18 : 0.56);
    if (size.width < 760 && slot === 2) candidate.x = -0.45;
    candidate.unproject(camera).sub(origin);
    label.current.position.copy(candidate);
    line.current?.geometry.setPositions([0, 0, 0, candidate.x, candidate.y, candidate.z]);
    if (second.current) {
      second.current.visible = anchors.length > 1;
      if (anchors[1]) {
        const delta = new THREE.Vector3(...anchors[1]).sub(origin);
        second.current.geometry.setPositions([delta.x, delta.y, delta.z, candidate.x, candidate.y, candidate.z]);
        if (pin.current) pin.current.position.copy(delta);
      }
    }
    if (pin.current) pin.current.visible = anchors.length > 1;
  });
  return <group ref={root}>
    <mesh renderOrder={40}><sphereGeometry args={[0.024, 10, 8]} /><meshBasicMaterial color="#d9ecd9" depthTest={false} /></mesh>
    <mesh ref={pin} renderOrder={40}><sphereGeometry args={[0.024, 10, 8]} /><meshBasicMaterial color="#d9ecd9" depthTest={false} /></mesh>
    <Line ref={second} points={[[0, 0, 0], end]} color="#9fc6b5" lineWidth={0.7} transparent opacity={0.7} depthTest={false} renderOrder={39} />
    <Line ref={line} points={[[0, 0, 0], end]} color="#9fc6b5" lineWidth={0.7} transparent opacity={0.7} depthTest={false} renderOrder={39} />
    <group ref={label}><SceneLabel text={name} onSelect={onSelect} onMeasure={width => { measuredWidth.current = width; }} /></group>
  </group>;
}
function Labels({
  labels,
  onSelect,
  stage,
  timeline,
}: Pick<Props, "labels" | "onSelect" | "stage" | "timeline">) {
  const { size } = useThree();
  if (!labels) return null;
  return (
    <group>
      {LABEL_SETS[stage]
        .map(([name, offset], slot) => (
          <FloatingLabel
            key={name}
            name={name}
            offset={offset}
            slot={slot}
            timeline={timeline}
            onSelect={onSelect}
          />
        ))}
    </group>
  );
}

function World(props: Props) {
  return (
    <>
      <color attach="background" args={["#071313"]} />
      <fog attach="fog" args={["#071313", 17, 120]} />
      <ambientLight intensity={1.25} />
      <pointLight position={[-3, 4, 5]} color="#b7e8d6" intensity={28} />
      <pointLight position={[4, -2, 2]} color="#f9b59a" intensity={18} />
      <directionalLight position={[0, 4, 6]} intensity={1.5} />
      <ParticleField {...props} />
      <NavigationControls {...props} />
      {!props.analogy && <group>
        <CellMembrane side={-1} {...props} />
        <CellMembrane side={1} {...props} />
        <Nucleus {...props} />
        {Array.from({ length: COUNT }, (_, i) => (
          <group key={i}>
            {[-1, 1].map((side) => (
              <group key={side}>
                <Chromosome i={i} side={side} {...props} />
                <SpindleFiber i={i} side={side} {...props} />
              </group>
            ))}
          </group>
        ))}
        <Centrosome side={-1} {...props} />
        <Centrosome side={1} {...props} />
        <Equator {...props} />
        <ContractileRing {...props} />
        <Labels {...props} labels={props.labels && !props.analogy} />
      </group>}
      <group>
        {props.analogy && <EverydayAnalogies {...props} />}
      </group>
      {props.selected && <DescriptionPlaque title={props.selected}
        body={definitions[props.selected] || ANALOGY_DEFINITIONS[props.selected] || ""}
        anchor={() => props.analogy ? [0, 0, 0] : labelAnchor(props.selected!, props.timeline.current, [0, 0, 0])}
        onClose={props.onClear} />}
    </>
  );
}
export function CellScene(props: Props) {
  return (
    <Canvas
      events={state => ({ ...fiberEvents(state), filter: hits => [...hits.filter(hit => hit.object.userData.annotation), ...hits.filter(hit => !hit.object.userData.annotation && !hit.object.userData.envelope), ...hits.filter(hit => !hit.object.userData.annotation && hit.object.userData.envelope)] })}
      dpr={[1, window.innerWidth < 760 ? 1.25 : 1.7]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      camera={{ position: [1.5, 1.4, 10.2], fov: 43 }}
      fallback={
        <div className="webgl-fallback">
          Your browser cannot display the 3D cell. Explore each stage using the
          timeline and descriptions below.
        </div>
      }
    >
      <World {...props} />
    </Canvas>
  );
}
