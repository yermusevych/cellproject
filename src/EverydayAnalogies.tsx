import { createContext, useContext, useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { CHROMOSOME_COLORS as COLORS, mix, smooth } from "./timeline";
import { SceneLabel, pickPart } from "./SceneAnnotations";
import { analogyProgress, bubbleProfile, sockPosition, worksheetCopy } from "./analogyMotion";

type Props = { timeline: MutableRefObject<number>; stage: number; reduced: boolean; labels: boolean; onSelect: (name: string) => void };
const Selection = createContext<(name: string) => void>(() => {});
type ClockProps = Pick<Props, "timeline">;
const INK = "#203e38", PAPER = "#f0e6cf", TEAL = "#8ee8d3";
const NAMES = ["A", "B", "C", "D"];

function Block({ at = [0, 0, 0], size, color = INK, radius = 0.04, metal = 0, rough = 0.6, children }:
  { at?: [number, number, number]; size: [number, number, number]; color?: string; radius?: number; metal?: number; rough?: number; children?: ReactNode }) {
  return <RoundedBox args={size} position={at} radius={radius} smoothness={3}>
    <meshStandardMaterial color={color} metalness={metal} roughness={rough} />{children}
  </RoundedBox>;
}
function Label({ at, children }: { at: [number, number, number]; children: ReactNode }) {
  const select = useContext(Selection), text = Array.isArray(children) ? children.join("") : String(children);
  const part = text.startsWith("Originals") ? "Original worksheets" : text.startsWith("Matching copies") ? "Matching copies" : text.startsWith("Matching pair ") ? "Sleeping bags" : text === "Centre line" ? "Gym centre line" : text === "Matching pair" ? "Matching students" : text === "One of every kind" ? "Baskets" : text === "Complete matching garden" ? "Matching gardens" : text.includes("bubble") || text.includes("neck") ? "Narrowing neck" : text;
  return <SceneLabel text={text} at={at} onSelect={select} part={part} />;
}
function Tube({ points, radius = 0.025, color = PAPER }: { points: THREE.Vector3[]; radius?: number; color?: string }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  return <mesh><tubeGeometry args={[curve, 32, radius, 8, false]} /><meshStandardMaterial color={color} roughness={0.65} /></mesh>;
}
function Bench({ size = [6.7, 0.14, 3.3] as [number, number, number] }) {
  return <group position={[0, -1.12, 0]}>
    <Block size={size} color="#193830" radius={0.07} metal={0.2} />
    <Block at={[0, -0.12, 0]} size={[size[0] - 0.32, 0.12, size[2] - 0.2]} color="#10251f" />
  </group>;
}

export function EverydayAnalogies(props: Props) {
  const { gl } = useThree();
  useFrame(() => {
    gl.domElement.dataset.analogyStage = String(props.stage);
    gl.domElement.dataset.analogyProgress = analogyProgress(props.timeline.current, props.stage).toFixed(3);
  });
  return <Selection.Provider value={props.onSelect}><group position={[0, -0.18, 0]}
    onClick={pickPart(["Photocopier", "Sleeping bags", "Gym class", "Baskets", "Garden fences", "Soap bubble"][props.stage], props.onSelect)}
    onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
    {props.stage === 0 && <Photocopier {...props} />}
    {props.stage === 1 && <SleepingBags {...props} />}
    {props.stage === 2 && <GymClass {...props} />}
    {props.stage === 3 && <SockBaskets {...props} />}
    {props.stage === 4 && <Gardens {...props} />}
    {props.stage === 5 && <SoapBubbles {...props} />}
  </group></Selection.Provider>;
}

function Worksheet({ i, copy = false }: { i: number; copy?: boolean }) {
  const select = useContext(Selection);
  // Original and copy use the same authored geometry, including the A–D mark.
  const texture = useMemo(() => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 176;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, 128, 176);
    ctx.fillStyle = COLORS[i]; ctx.fillRect(10, 10, 108, 35);
    ctx.fillStyle = "#203e38"; ctx.font = "bold 28px sans-serif"; ctx.fillText(NAMES[i], 18, 37);
    ctx.fillStyle = "#496457";
    for (let n = 0; n < 5; n++) ctx.fillRect(14, 60 + n * 15, 92 - ((n + i) % 3) * 15, 4);
    ctx.strokeStyle = COLORS[i]; ctx.lineWidth = 3;
    ctx.strokeRect(15, 143, 19 + i * 14, 16);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, [i]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group onClick={pickPart(copy ? "Matching copies" : "Original worksheets", select)}>
    <Block size={[0.57, 0.018, 0.79]} color={PAPER} radius={0.008} rough={0.95} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]}>
      <planeGeometry args={[0.56, 0.78]} /><meshStandardMaterial map={texture} roughness={0.95} />
    </mesh>
  </group>;
}
function Photocopier({ timeline, labels }: Props) {
  const select = useContext(Selection);
  const scanner = useRef<THREE.Mesh>(null), meter = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const t = analogyProgress(timeline.current, 0), pass = (t * 4) % 1;
    if (scanner.current) { scanner.current.position.z = mix(-0.65, 0.65, pass); scanner.current.visible = t > 0 && t < 1; }
    if (meter.current) { meter.current.scale.x = Math.max(0.02, t); meter.current.position.x = -0.4 + t * 0.35; }
  });
  return <group rotation={[0.15, -0.12, 0]}>
    <Bench />
    <Tube color="#172c25" radius={0.045} points={[new THREE.Vector3(-0.9, -0.7, -0.98), new THREE.Vector3(-1.2, -0.9, -1.28), new THREE.Vector3(-0.2, -1.0, -1.45), new THREE.Vector3(0.3, -1.0, -1.65)]} />
    <Block at={[0, -0.32, 0]} size={[2.55, 1.5, 1.9]} color="#c1cec0" radius={0.1} metal={0.15} rough={0.4} />
    <Block at={[0, 0.39, 0]} size={[2.7, 0.22, 2.02]} color="#416257" radius={0.06} />
    <Block at={[0, 0.52, 0]} size={[2.26, 0.045, 1.58]} color="#142c27" radius={0.015} metal={0.5} rough={0.15} />
    <mesh position={[0, 0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.12, 1.42]} /><meshPhysicalMaterial color="#a5e4cf" transparent opacity={0.18} metalness={0.15} roughness={0.12} side={THREE.DoubleSide} />
    </mesh>
    <mesh ref={scanner} onClick={pickPart("Scanner", select)} position={[0, 0.56, 0]}><boxGeometry args={[2.02, 0.014, 0.045]} /><meshBasicMaterial color={TEAL} /></mesh>
    <group position={[0, 0.57, -0.97]} rotation={[-0.48, 0, 0]}>
      <Block at={[0, 0.07, -0.88]} size={[2.7, 0.14, 1.8]} color="#d9decf" radius={0.065} />
      <Block at={[0, -0.012, -0.88]} size={[2.32, 0.025, 1.5]} color="#8b9e8d" radius={0.025} />
    </group>
    {[-0.88, 0.88].map(x => <mesh key={x} position={[x, 0.55, -0.96]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.08, 0.08, 0.25, 16]} /><meshStandardMaterial color="#668074" metalness={0.7} roughness={0.3} />
    </mesh>)}
    <Block at={[0, 0.1, 0.972]} size={[2.12, 0.14, 0.045]} color="#132922" radius={0.008} />
    <Block at={[0, -0.4, 0.965]} size={[2.3, 0.55, 0.07]} color="#a7b8a7" radius={0.025} />
    <Block at={[0, -0.29, 1.025]} size={[0.65, 0.055, 0.05]} color="#405e50" radius={0.015} />
    <Block at={[0, -0.82, 0.965]} size={[2.3, 0.16, 0.06]} color="#8ca18e" radius={0.02} />
    <Block at={[-0.4, 0.32, 1.02]} size={[0.96, 0.24, 0.08]} color="#132f29" radius={0.02} />
    <mesh ref={meter} position={[-0.4, 0.32, 1.066]}><boxGeometry args={[0.7, 0.06, 0.01]} /><meshBasicMaterial color={TEAL} /></mesh>
    {[0, 1, 2].map(n => <mesh key={n} position={[0.46 + n * 0.16, 0.32, 1.03]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.045, 0.045, 0.06, 16]} /><meshStandardMaterial color={n === 0 ? TEAL : "#6f8b79"} /></mesh>)}
    {[-1, 1].map(side => <group key={side}>
      <Block at={[side * 2.26, -0.34, 0]} size={[1.67, 0.1, 2.0]} color="#466052" radius={0.035} metal={0.4} />
      <Block at={[side * 3.07, -0.23, 0]} size={[0.04, 0.18, 2]} color="#6d8978" radius={0.015} />
    </group>)}
    {[0, 1, 2, 3].map(i => <group key={i}>
      <group position={[-2.25 + (i % 2 - 0.5) * 0.68, -0.26, (Math.floor(i / 2) - 0.5) * 0.88]}><Worksheet i={i} /></group>
      <CopiedSheet i={i} timeline={timeline} />
    </group>)}
    {labels && <>
      <Label at={[-2.25, -0.65, 1.2]}>Originals · A B C D</Label>
      <Label at={[2.25, -0.65, 1.2]}>Matching copies · A B C D</Label>
      <Label at={[0, 1.05, 0.1]}>Scanner</Label>
    </>}
  </group>;
}
function CopiedSheet({ i, timeline }: ClockProps & { i: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const s = worksheetCopy(timeline.current, i), t = s.travel;
    ref.current.visible = s.visible;
    ref.current.position.set(mix(1.0, 2.25 + (i % 2 - 0.5) * 0.68, t), mix(0.05, -0.26, t) + Math.sin(t * Math.PI) * 0.18, (Math.floor(i / 2) - 0.5) * 0.88);
  });
  return <group ref={ref}><Worksheet i={i} copy /></group>;
}

function SleepingBags({ timeline, labels }: Props) {
  return <group rotation={[0.12, -0.08, 0]}>
    <Bench size={[6.5, 0.12, 3.6]} />
    {[0, 1, 2, 3].map(i => <group key={i} position={[(i - 1.5) * 1.45, -0.86, 0]}>
      {[-1, 1].map(side => <SleepingBag key={side} i={i} side={side} timeline={timeline} />)}
      {labels && <Label at={[0, 0.28, 1.5]}>Matching pair {NAMES[i]}</Label>}
    </group>)}
  </group>;
}
function SleepingBag({ i, side, timeline }: ClockProps & { i: number; side: number }) {
  const flat = useRef<THREE.Group>(null), roll = useRef<THREE.Group>(null), straps = useRef<THREE.Group>(null);
  const stitches = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = analogyProgress(timeline.current, 1), length = 2.5 * (1 - t);
    if (flat.current) { flat.current.scale.z = Math.max(0.005, 1 - t); flat.current.position.z = -1.25 + length / 2; flat.current.visible = t < 0.995; }
    if (roll.current) { roll.current.position.set(0, mix(0.09, 0.34, t), mix(1.25, -1.19, t)); roll.current.scale.set(1, mix(0.24, 1, t), mix(0.24, 1, t)); roll.current.rotation.x = -t * Math.PI * 6; }
    if (straps.current) { straps.current.scale.setScalar(smooth(0.8, 1, t)); straps.current.position.set(0, 0.34, mix(1.25, -1.19, t)); }
    if (stitches.current) stitches.current.visible = t < 0.98;
  });
  return <group position={[side * 0.32, 0, 0]}>
    <group ref={flat}>
      <Block size={[0.55, 0.13, 2.5]} color={COLORS[i]} radius={0.06} rough={0.94} />
      <Block at={[0, 0.072, -0.94]} size={[0.43, 0.08, 0.45]} color="#d4d5b9" radius={0.045} rough={1} />
      <group ref={stitches}>{Array.from({ length: 8 }, (_, n) => <Line key={n} points={[[-0.23, 0.07, -1.15 + n * 0.31], [0.23, 0.07, -1.15 + n * 0.31]]} color="#4d5c4d" lineWidth={0.65} transparent opacity={0.5} />)}</group>
      <Line points={[[0.25, 0.05, -1.12], [0.25, 0.05, 1.12]]} color="#e9e0bf" lineWidth={1.5} />
    </group>
    <group ref={roll}>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.32, 0.32, 0.55, 40]} /><meshStandardMaterial color={COLORS[i]} roughness={0.9} /></mesh>
      {[-1, 1].map(s => <group key={s} position={[s * 0.28, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh><circleGeometry args={[0.31, 40]} /><meshStandardMaterial color={COLORS[i]} side={THREE.DoubleSide} roughness={1} /></mesh>
        {[0.08, 0.15, 0.23, 0.3].map(r => <mesh key={r} position={[0, 0, s * 0.003]}><torusGeometry args={[r, 0.009, 5, 40]} /><meshStandardMaterial color="#667360" roughness={1} /></mesh>)}
      </group>)}
    </group>
    <group ref={straps}>{[-0.16, 0.16].map(x => <group key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh><torusGeometry args={[0.33, 0.025, 6, 40]} /><meshStandardMaterial color="#2a4137" roughness={0.9} /></mesh>
      <Block at={[0, 0.32, 0]} size={[0.1, 0.055, 0.09]} color="#7d927a" radius={0.01} metal={0.5} />
    </group>)}</group>
  </group>;
}

function GymClass({ timeline, labels }: Props) {
  return <group rotation={[0.13, -0.08, 0]}>
    <Block at={[0, -1.0, 0]} size={[6.4, 0.2, 4.0]} color="#a77d50" radius={0.05} rough={0.8} />
    {Array.from({ length: 13 }, (_, i) => <Line key={i} points={[[-3.1, -0.89, -1.85 + i * 0.3], [3.1, -0.89, -1.85 + i * 0.3]]} color="#654f34" lineWidth={0.5} />)}
    <Line points={[[-2.9, -0.88, -1.75], [2.9, -0.88, -1.75], [2.9, -0.88, 1.75], [-2.9, -0.88, 1.75], [-2.9, -0.88, -1.75]]} color={PAPER} lineWidth={2} />
    <Line points={[[0, -0.875, -1.75], [0, -0.875, 1.75]]} color={PAPER} lineWidth={3} />
    <mesh position={[0, -0.872, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.63, 0.65, 64]} /><meshStandardMaterial color={PAPER} side={THREE.DoubleSide} /></mesh>
    {[-1, 1].map(s => <group key={s} position={[s * 2.8, -0.8, -1.15]}><Block size={[0.4, 0.22, 1]} color="#3e5b4b" /><Block at={[0, 0.14, 0]} size={[0.45, 0.08, 1.05]} color="#cfbb88" /></group>)}
    {[0, 1, 2, 3].map(i => [-1, 1].map(side => <Student key={`${i}-${side}`} i={i} side={side} timeline={timeline} />))}
    {labels && <><Label at={[0, -0.63, 2.0]}>Centre line</Label><Label at={[0.65, 0.9, 1.25]}>Matching pair</Label></>}
  </group>;
}
function Student({ i, side, timeline }: ClockProps & { i: number; side: number }) {
  const select = useContext(Selection);
  const root = useRef<THREE.Group>(null), legs = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = analogyProgress(timeline.current, 2);
    if (root.current) { root.current.position.set(mix(side * (1.25 + (i % 2) * 0.75), side * 0.3, t), -0.84, mix((i - 1.5) * 0.7 + Math.sin(i * 2) * 0.3, (i - 1.5) * 0.88, t)); root.current.rotation.y = mix(side * -0.4, 0, t); }
    if (legs.current) legs.current.rotation.x = Math.sin(t * Math.PI * 10) * 0.2 * (1 - t);
  });
  const skin = ["#be8765", "#dfb28a", "#8e6249", "#cc9d77"][i];
  return <group ref={root} onClick={pickPart("Matching students", select)}>
    <group ref={legs}>{[-1, 1].map(s => <group key={s} position={[s * 0.085, 0.22, 0]}>
      <Block size={[0.115, 0.39, 0.14]} color="#253b36" radius={0.035} />
      <Block at={[0, -0.18, 0.045]} size={[0.145, 0.095, 0.24]} color={PAPER} radius={0.035} />
    </group>)}</group>
    <Block at={[0, 0.62, 0]} size={[0.34, 0.42, 0.22]} color={COLORS[i]} radius={0.07} rough={0.94} />
    {[-1, 1].map(s => <group key={s} position={[s * 0.225, 0.62, 0]} rotation={[0, 0, s * 0.12]}>
      <mesh><capsuleGeometry args={[0.065, 0.22, 5, 10]} /><meshStandardMaterial color={skin} roughness={0.85} /></mesh>
      <mesh position={[0, 0.12, 0]}><capsuleGeometry args={[0.075, 0.06, 4, 10]} /><meshStandardMaterial color={COLORS[i]} /></mesh>
    </group>)}
    <mesh position={[0, 0.89, 0]}><cylinderGeometry args={[0.07, 0.08, 0.1, 12]} /><meshStandardMaterial color={skin} /></mesh>
    <mesh position={[0, 1.07, 0]}><sphereGeometry args={[0.16, 24, 20]} /><meshStandardMaterial color={skin} roughness={0.8} /></mesh>
    <mesh position={[0, 1.13, -0.025]} rotation={[-0.2, 0, 0]}><sphereGeometry args={[0.165, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.53]} /><meshStandardMaterial color={i % 2 ? "#433b2a" : "#241e18"} /></mesh>
    {[-1, 1].map(s => <mesh key={s} position={[s * 0.054, 1.09, 0.143]}><sphereGeometry args={[0.012, 8, 8]} /><meshStandardMaterial color="#292a20" /></mesh>)}
    <mesh position={[0, 0.65, 0.116]}><circleGeometry args={[0.04, 16]} /><meshStandardMaterial color={PAPER} /></mesh>
  </group>;
}

function SockBaskets({ timeline, labels }: Props) {
  return <group rotation={[0.12, -0.1, 0]}>
    <Bench size={[6.7, 0.12, 3.4]} />
    {[-1, 1].map(side => <group key={side} position={[side * 2.0, -0.65, 0]}><Basket />
      {labels && <Label at={[0, -0.2, 1.0]}>One of every kind</Label>}
    </group>)}
    {[0, 1, 2, 3].map(i => [-1, 1].map(side => <MovingSock key={`${i}-${side}`} i={i} side={side} timeline={timeline} />))}
  </group>;
}
function Basket() {
  const select = useContext(Selection);
  return <group onClick={pickPart("Baskets", select)}>
    <Block at={[0, -0.3, 0]} size={[1.5, 0.12, 1.5]} color="#a28d60" radius={0.12} rough={1} />
    {[-1, 1].map(side => <group key={side}>
      {Array.from({ length: 9 }, (_, n) => <group key={n}>
        <Block at={[-0.65 + n * 0.16, 0.03, side * 0.72]} size={[0.065, 0.65, 0.055]} color={n % 2 ? "#b49f6c" : "#c5b27c"} radius={0.015} rough={1} />
        <Block at={[side * 0.72, 0.03, -0.65 + n * 0.16]} size={[0.055, 0.65, 0.065]} color="#b49f6c" radius={0.015} rough={1} />
      </group>)}
      {[0, 1, 2, 3].map(n => <group key={n}>
        <Block at={[0, -0.24 + n * 0.17, side * 0.73]} size={[1.5, 0.045, 0.045]} color="#897648" radius={0.012} rough={1} />
        <Block at={[side * 0.73, -0.24 + n * 0.17, 0]} size={[0.045, 0.045, 1.5]} color="#897648" radius={0.012} rough={1} />
      </group>)}
      <Block at={[0, 0.38, side * 0.74]} size={[1.58, 0.12, 0.11]} color="#d2bd86" radius={0.04} />
      <Block at={[side * 0.74, 0.38, 0]} size={[0.11, 0.12, 1.58]} color="#d2bd86" radius={0.04} />
      <mesh position={[side * 0.8, 0.33, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.27, 0.04, 7, 28, Math.PI]} /><meshStandardMaterial color="#ac9866" roughness={1} /></mesh>
    </group>)}
  </group>;
}
function MovingSock({ i, side, timeline }: ClockProps & { i: number; side: number }) {
  const select = useContext(Selection);
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = analogyProgress(timeline.current, 3);
    if (ref.current) { ref.current.position.set(...sockPosition(i, side, t)); ref.current.rotation.set(mix(0.15, -1.15, t), side * t * 0.3, mix(side * 0.06, side * 0.2, t)); }
  });
  return <group ref={ref} scale={0.72} onClick={pickPart("Matching socks", select)}>
    <Block at={[0, 0.18, 0]} size={[0.24, 0.62, 0.16]} color={COLORS[i]} radius={0.08} rough={1} />
    <Block at={[0.075, -0.16, 0]} size={[0.39, 0.23, 0.18]} color={COLORS[i]} radius={0.09} rough={1} />
    <Block at={[0.23, -0.17, 0]} size={[0.13, 0.2, 0.18]} color="#d9dbc0" radius={0.055} rough={1} />
    <Block at={[-0.035, -0.12, -0.015]} size={[0.19, 0.2, 0.18]} color="#d9dbc0" radius={0.06} rough={1} />
    {[0, 1, 2].map(n => <Block key={n} at={[0, 0.35 + n * 0.055, 0]} size={[0.25, 0.025, 0.17]} color={PAPER} radius={0.008} rough={1} />)}
    {Array.from({ length: i + 1 }, (_, n) => <mesh key={n} position={[0, 0.17 - n * 0.07, 0.085]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color={PAPER} /></mesh>)}
  </group>;
}

function Gardens({ timeline, labels }: Props) {
  return <group rotation={[0.15, -0.08, 0]}>
    <Bench size={[6.5, 0.12, 3.6]} />
    {[-1, 1].map(side => <group key={side} position={[side * 1.65, -0.88, 0]}>
      <Block size={[2.65, 0.22, 2.65]} color="#4a5030" radius={0.1} rough={1} />
      <Block at={[0, 0.12, 0]} size={[2.37, 0.05, 2.37]} color="#4b3927" radius={0.05} rough={1} />
      {[0, 1, 2, 3].map(i => <Plant key={i} i={i} />)}
      <GardenFence timeline={timeline} />
      {labels && <Label at={[0, -0.1, 1.65]}>Complete matching garden</Label>}
    </group>)}
  </group>;
}
function Plant({ i }: { i: number }) {
  const select = useContext(Selection);
  const x = (i % 2 - 0.5) * 1.12, z = (Math.floor(i / 2) - 0.5) * 1.12;
  return <group position={[x, 0.15, z]} onClick={pickPart("Matching gardens", select)}>
    <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.028, 0.035, 0.6, 9]} /><meshStandardMaterial color="#739765" roughness={1} /></mesh>
    {[-1, 1].map(s => <mesh key={s} position={[s * 0.14, 0.26 + s * 0.06, 0]} rotation={[0, 0, s * -0.7]} scale={[0.21, 0.075, 0.1]}><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color={s < 0 ? "#7d9e63" : "#a2b778"} roughness={0.9} /></mesh>)}
    <mesh position={[0, 0.63, 0]}><sphereGeometry args={[0.115, 16, 12]} /><meshStandardMaterial color="#bd9556" roughness={0.9} /></mesh>
    {Array.from({ length: 5 + i }, (_, n) => {
      const a = n * Math.PI * 2 / (5 + i);
      return <mesh key={n} position={[Math.cos(a) * 0.15, 0.64, Math.sin(a) * 0.15]} rotation={[0, -a, 0]} scale={[0.16, 0.065, 0.08]}><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color={COLORS[i]} roughness={0.75} /></mesh>;
    })}
    {Array.from({ length: 4 }, (_, n) => <mesh key={n} position={[Math.sin(n * 2 + i) * 0.32, 0.01, Math.cos(n * 3 + i) * 0.3]} scale={[0.06, 0.025, 0.04]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#9d8c64" roughness={1} /></mesh>)}
  </group>;
}
function GardenFence({ timeline }: ClockProps) {
  const fence = useRef<THREE.Group>(null);
  useFrame(() => { if (fence.current) { const t = analogyProgress(timeline.current, 4); fence.current.scale.y = Math.max(0.001, t); fence.current.visible = t > 0.001; } });
  return <group ref={fence}>
    {[0, 1, 2, 3].map(edge => <group key={edge} rotation={[0, edge * Math.PI / 2, 0]} position={[0, 0.12, 0]}>
      {Array.from({ length: 9 }, (_, n) => <group key={n} position={[-1.18 + n * 0.295, 0.43, 1.26]}>
        <Block size={[0.17, 0.77, 0.07]} color="#d9cfa9" radius={0.015} rough={0.9} />
        <mesh position={[0, 0.43, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.12, 0.14, 4]} /><meshStandardMaterial color="#d9cfa9" roughness={0.9} /></mesh>
        {[0.2, 0.6].map(y => <mesh key={y} position={[0, y - 0.4, 0.04]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.013, 0.013, 0.015, 8]} /><meshStandardMaterial color="#667365" metalness={0.7} /></mesh>)}
      </group>)}
      {[0.3, 0.68].map(y => <Block key={y} at={[0, y, 1.22]} size={[2.55, 0.07, 0.08]} color="#b6aa81" radius={0.015} rough={0.9} />)}
    </group>)}
  </group>;
}

const filmVertex = `
 varying vec3 vN; varying vec3 vV; varying vec3 vP;
 void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); vP=position; gl_Position=projectionMatrix*mv; }
`;
const filmFragment = `
 varying vec3 vN; varying vec3 vV; varying vec3 vP;
 uniform float time; uniform float motion;
 void main(){
   float facing=abs(dot(normalize(vN),normalize(vV)));
   float rim=pow(1.-facing,2.4);
   float phase=facing*10.+vP.y*1.4+sin(vP.x*1.8+time*.2*motion)*.9;
   vec3 film=.52+.48*cos(phase+vec3(0.,2.1,4.2));
   vec3 c=mix(vec3(.25,.65,.56),film,.64);
   float highlight=pow(max(dot(reflect(-normalize(vV),normalize(vN)),normalize(vec3(-.4,.8,1.))),0.),48.);
   gl_FragColor=vec4(c*(.38+rim*.95)+highlight*.85,.07+rim*.61+highlight*.2);
 }
`;
function SoapBubbles(props: Props) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (group.current) { group.current.position.y = props.reduced ? 0 : Math.sin(clock.elapsedTime * 0.6) * 0.08; group.current.rotation.z = props.reduced ? 0.06 : 0.06 + Math.sin(clock.elapsedTime * 0.22) * 0.025; } });
  return <group ref={group}>
    {[-1, 1].map(side => <BubbleHalf key={side} side={side} {...props} />)}
    {props.labels && <Label at={[0, -2.2, 0]}>{analogyProgress(props.timeline.current, 5) > 0.9 ? "Two separate bubbles" : analogyProgress(props.timeline.current, 5) < 0.1 ? "One connected bubble" : "The neck narrows"}</Label>}
  </group>;
}
function BubbleHalf({ side, timeline, reduced }: Props & { side: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry(), rows = 56, cols = 96;
    const pos = new Float32Array((rows + 1) * (cols + 1) * 3), indices: number[] = [];
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j, b = a + cols + 1;
      if (side > 0) indices.push(a, b, a + 1, b, b + 1, a + 1);
      else indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setIndex(indices); return g;
  }, [side]);
  const uniforms = useMemo(() => ({ time: { value: 0 }, motion: { value: reduced ? 0 : 1 } }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => {
    const t = analogyProgress(timeline.current, 5), attr = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i <= 56; i++) {
      const profile = bubbleProfile(i / 56, side, t);
      for (let j = 0; j <= 96; j++) {
        const a = j / 96 * Math.PI * 2;
        attr.setXYZ(i * 97 + j, profile.x, profile.radius * Math.cos(a), profile.radius * Math.sin(a));
      }
    }
    attr.needsUpdate = true; geometry.computeVertexNormals(); geometry.computeBoundingSphere();
    if (material.current) { material.current.uniforms.time.value = clock.elapsedTime; material.current.uniforms.motion.value = reduced ? 0 : 1; }
  });
  return <mesh geometry={geometry} renderOrder={side > 0 ? 2 : 1}>
    <shaderMaterial ref={material} vertexShader={filmVertex} fragmentShader={filmFragment} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
  </mesh>;
}
