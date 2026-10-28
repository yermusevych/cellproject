import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Billboard, Line } from "@react-three/drei";
import * as THREE from "three";

export const ANALOGY_DEFINITIONS: Record<string, string> = {
  Photocopier: "The machine copies four different worksheets to make a second matching set. This represents DNA copying in interphase; the cell also grows and makes more organelles.",
  Scanner: "The moving light represents copying information. A cell copies DNA, rather than using a scanner.",
  "Original worksheets": "Four different worksheets represent DNA information. The originals remain while matching copies are made.",
  "Matching copies": "Each copied worksheet matches its original. Copying DNA prepares a complete set of information for each new cell.",
  "Sleeping bags": "Matching pairs roll into compact bundles without losing their material. This represents DNA condensing into duplicated chromosomes during prophase.",
  "Gym class": "Four matching pairs of students line up at the gym’s centre line, like duplicated chromosomes lining up in the middle of the cell during metaphase.",
  "Gym centre line": "The line represents the middle of the cell, where duplicated chromosomes line up during metaphase.",
  "Matching students": "Each pair represents a duplicated chromosome with two matching DNA copies. The matching shirts help you follow each pair.",
  Baskets: "The two baskets represent opposite ends of the cell. Each receives one sock of every kind, like both ends receiving matching DNA sets during anaphase.",
  "Matching socks": "One sock from each pair moves into each basket. This represents matching DNA copies separating to opposite ends during anaphase.",
  "Matching gardens": "Each garden contains a matching complete set of four plants. This represents the complete DNA set inside each new nucleus.",
  "Garden fences": "A fence forms around each complete garden. The two enclosures represent two nuclei forming in telophase, before the cell separates.",
  "Soap bubble": "The model changes from one connected bubble to two separate bubbles. It represents the shape of cytokinesis. A real cell also divides its cytoplasm and organelles.",
  "Narrowing neck": "The middle narrows, then separates. This is a shape comparison; soap bubbles do not copy DNA or reproduce like cells.",
};
export const analogyParts = [["Photocopier", "Scanner", "Original worksheets", "Matching copies"], ["Sleeping bags"], ["Gym class", "Gym centre line", "Matching students"], ["Baskets", "Matching socks"], ["Matching gardens", "Garden fences"], ["Soap bubble", "Narrowing neck"]];
export const pickPart = (name: string, select: (name: string) => void) => (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (e.delta < 5) select(name); };

function textTexture(title: string, body?: string) {
  const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d")!;
  ctx.font = body ? "26px sans-serif" : "24px sans-serif";
  const lines: string[] = [];
  if (body) {
    let line = "";
    for (const word of body.split(" ")) {
      if (line && ctx.measureText(line + " " + word).width > 540) { lines.push(line); line = word; }
      else line += (line ? " " : "") + word;
    }
    if (line) lines.push(line);
  }
  canvas.width = body ? 600 : Math.ceil(ctx.measureText(title).width) + 42;
  canvas.height = body ? 132 + lines.length * 35 : 58;
  ctx.fillStyle = "#10291f"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#557564"; ctx.lineWidth = 2; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  ctx.fillStyle = "#efb093"; ctx.beginPath(); ctx.arc(body ? 24 : 17, body ? 37 : 29, body ? 4 : 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#edf3e6"; ctx.font = body ? "500 31px sans-serif" : "24px sans-serif";
  ctx.fillText(title, body ? 40 : 29, body ? 47 : 37);
  if (body) { ctx.fillStyle = "#d8e4d1"; ctx.font = "26px sans-serif"; lines.forEach((line, i) => ctx.fillText(line, 26, 129 + i * 35)); }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, ratio: canvas.height / canvas.width, pixels: body ? 300 : canvas.width * 0.48 };
}

// Actual 3D meshes attached to the model, billboarding only their readable face.
export function SceneLabel({ text, at = [0, 0, 0], onSelect, part = text, onMeasure }: { text: string; at?: [number, number, number]; onSelect: (name: string) => void; part?: string; onMeasure?: (width: number) => void }) {
  const root = useRef<THREE.Group>(null), visual = useRef<THREE.Group>(null);
  const art = useMemo(() => textTexture(text), [text]), point = useMemo(() => new THREE.Vector3(), []);
  const { size } = useThree();
  const edge = useMemo(() => new THREE.Vector3(), []), centre = useMemo(() => new THREE.Vector3(), []), right = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => () => art.texture.dispose(), [art]);
  useFrame(({ camera }) => {
    if (!root.current || !visual.current) return;
    root.current.getWorldPosition(point);
    const units = 2 * camera.position.distanceTo(point) * Math.tan(((camera as THREE.PerspectiveCamera).fov || 43) * Math.PI / 360) / size.height;
    const scale = units * art.pixels * (size.width < 760 ? 0.86 : 1);
    visual.current.scale.setScalar(scale);
    if (onMeasure) {
      right.set(1, 0, 0).applyQuaternion(camera.quaternion);
      edge.copy(point).addScaledVector(right, scale * 1.025 / 2).project(camera);
      centre.copy(point).project(camera);
      onMeasure(Math.abs(edge.x - centre.x) * size.width);
    }
  });
  return <group ref={root} position={at}><Billboard><group ref={visual} onPointerDown={e => e.stopPropagation()} onClick={pickPart(part, onSelect)} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
    <mesh userData={{ annotation: true }} renderOrder={40} position={[0, 0, -0.014]}><boxGeometry args={[1.025, art.ratio + 0.025, 0.025]} /><meshStandardMaterial color="#3c5e4c" roughness={0.6} depthTest={false} /></mesh>
    <mesh userData={{ annotation: true }} renderOrder={41}><planeGeometry args={[1, art.ratio]} /><meshBasicMaterial map={art.texture} toneMapped={false} depthTest={false} /></mesh>
  </group></Billboard></group>;
}

export function DescriptionPlaque({ title, body, anchor, onClose }: { title: string; body: string; anchor: () => [number, number, number]; onClose: () => void }) {
  const root = useRef<THREE.Group>(null), scale = useRef<THREE.Group>(null);
  const art = useMemo(() => textTexture(title, body), [title, body]);
  const right = useMemo(() => new THREE.Vector3(), []), up = useMemo(() => new THREE.Vector3(), []), front = useMemo(() => new THREE.Vector3(), []);
  const { size, gl } = useThree();
  useEffect(() => () => { delete gl.domElement.dataset.selectedPart; }, [gl, title]);
  useEffect(() => () => art.texture.dispose(), [art]);
  useFrame(({ camera, gl }) => {
    if (!root.current || !scale.current) return;
    const p = new THREE.Vector3(...anchor()), width = size.width < 760 ? size.width * 0.75 : 300;
    const units = 2 * camera.position.distanceTo(p) * Math.tan(((camera as THREE.PerspectiveCamera).fov || 43) * Math.PI / 360) / size.height;
    right.set(1, 0, 0).applyQuaternion(camera.quaternion); up.set(0, 1, 0).applyQuaternion(camera.quaternion); front.set(0, 0, 1).applyQuaternion(camera.quaternion);
    root.current.position.copy(p).addScaledVector(right, size.width < 760 ? 0 : width * units * 0.7).addScaledVector(up, size.width < 760 ? -width * units * art.ratio * 0.9 : width * units * art.ratio * 0.2).addScaledVector(front, 1.1);
    // Keep the spatial plaque inside the model area as the user orbits.
    const screen = root.current.position.clone().project(camera), halfX = width / size.width + 0.035;
    const halfY = width * art.ratio / size.height;
    screen.x = THREE.MathUtils.clamp(screen.x, -1 + halfX, 1 - halfX);
    screen.y = THREE.MathUtils.clamp(screen.y, -0.44 + halfY, (size.width < 760 ? 0.22 : 0.64) - halfY);
    root.current.position.copy(screen.unproject(camera));
    const plaqueUnits = 2 * camera.position.distanceTo(root.current.position) * Math.tan(((camera as THREE.PerspectiveCamera).fov || 43) * Math.PI / 360) / size.height;
    scale.current.scale.setScalar(width * plaqueUnits); gl.domElement.dataset.selectedPart = title;
  });
  useEffect(() => () => { document.body.style.cursor = ""; }, []);
  return <group ref={root}><Billboard><group ref={scale} onPointerDown={e => e.stopPropagation()}>
    <mesh userData={{ annotation: true }} renderOrder={50} position={[0, 0, -0.018]}><boxGeometry args={[1.02, art.ratio + 0.02, 0.035]} /><meshStandardMaterial color="#667f68" roughness={0.5} depthTest={false} /></mesh>
    <mesh userData={{ annotation: true }} renderOrder={51} onClick={e => e.stopPropagation()}><planeGeometry args={[1, art.ratio]} /><meshBasicMaterial map={art.texture} toneMapped={false} depthTest={false} /></mesh>
    <group position={[0.43, art.ratio / 2 - 0.08, 0.025]} onClick={e => { e.stopPropagation(); onClose(); }}>
      <mesh userData={{ annotation: true }} renderOrder={52}><boxGeometry args={[0.14, 0.14, 0.02]} /><meshBasicMaterial color="#294936" depthTest={false} /></mesh>
      <Line points={[[-0.018, -0.018, 0.014], [0.018, 0.018, 0.014]]} color="#e3e9d8" lineWidth={1} depthTest={false} renderOrder={53} />
      <Line points={[[-0.018, 0.018, 0.014], [0.018, -0.018, 0.014]]} color="#e3e9d8" lineWidth={1} depthTest={false} renderOrder={53} />
    </group>
  </group></Billboard></group>;
}
