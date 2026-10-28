import {
  biology,
  clamp,
  daughterCenter,
  mix,
  smooth,
  CHROMOSOME_COUNT,
  membraneProfile,
} from "./timeline.ts";
export type Point3 = [number, number, number];
const TAU = Math.PI * 2,
  COUNT = CHROMOSOME_COUNT;
export function dnaConfinement(p: number) {
  const b = biology(p);
  return (
    mix(0.64, 1, smooth(2.85, 3.18, p)) *
    mix(1, mix(0.35, 0.55, b.daughterEnvelope), smooth(4.75, 5.05, p))
  );
}
export function centrosomePosition(side: number, p: number): Point3 {
  const b = biology(p);
  return [
    mix(0.8, side * (2.18 + b.elongation * 0.65), b.poles),
    mix(1.42, 0, b.poles) + (side > 0 ? 0.14 * (1 - b.poles) : 0),
    0,
  ];
}
export const spindleOrigin = centrosomePosition;
export function spindleCurvePoint(
  t: number,
  i: number,
  side: number,
  p: number,
): Point3 {
  const b = biology(p),
    u = t * clamp(b.spindle * 1.08),
    start = spindleOrigin(side, p),
    end = chromosomePositionAt(0.5, i, side, p),
    bow = Math.sin(u * Math.PI) * (0.12 + Math.abs(end[1]) * 0.16);
  return [
    mix(start[0], end[0], u),
    mix(start[1], end[1], u) + bow * Math.sign(end[1]),
    mix(start[2], end[2], u) + Math.sin(u * Math.PI) * 0.13,
  ];
}
export function chromosomeCenterPoint(
  i: number,
  side: number,
  p: number,
): Point3 {
  const b = biology(p),
    a = (i / COUNT) * TAU,
    c = dnaConfinement(p);
  return [
    mix(Math.sin(i * 2.7) * 0.7, 0, b.alignment) * c +
      side * b.separation * daughterCenter(b.division),
    mix(Math.cos(a) * 0.63, 1.5 - i, b.alignment) *
      (1 - b.decondensation * 0.48) *
      c,
    mix(Math.sin(a) * 0.55, i % 2 ? 0.22 : -0.22, b.alignment) *
      (1 - b.decondensation * 0.5) *
      c,
  ];
}
export function chromatidLocalPoint(
  t: number,
  i: number,
  side: number,
  p: number,
): Point3 {
  const b = biology(p),
    cond = b.condensation * (1 - b.decondensation),
    a = i * 1.73,
    u = t * 2 - 1;
  const scale = mix(1, 0.66, b.decondensation);
  const loose: Point3 = [
    (Math.sin(t * TAU * 1.7 + a) * 0.37 + Math.sin(t * TAU * 3 + a) * 0.1) *
      scale +
      side * 0.055 * b.replication,
    (u * 0.66 + Math.cos(t * TAU * 2 + a) * 0.18) * scale,
    Math.cos(t * TAU * 1.6 + a) * 0.35 * scale,
  ];
  const curve =
    (Math.sqrt(u * u + 0.025) - Math.sqrt(0.025)) /
    (Math.sqrt(1.025) - Math.sqrt(0.025));
  const compact: Point3 = [
    side *
      (0.075 +
        0.31 * curve * (1 - b.separation) +
        0.3 * (1 - curve) * b.separation),
    u * (0.33 + (i % 2) * 0.055),
    Math.sin(t * Math.PI) * 0.035,
  ];
  return [
    mix(loose[0], compact[0], cond),
    mix(loose[1], compact[1], cond),
    mix(loose[2], compact[2], cond),
  ];
}
export function chromosomePositionAt(
  t: number,
  i: number,
  side: number,
  p: number,
): Point3 {
  const center = chromosomeCenterPoint(i, side, p),
    point = chromatidLocalPoint(t, i, side, p),
    c = dnaConfinement(p);
  return [
    center[0] + point[0] * c,
    center[1] + point[1] * c,
    center[2] + point[2] * c,
  ];
}
export function labelAnchor(name: string, p: number, fallback: Point3): Point3 {
  const b = biology(p);
  switch (name) {
    case "DNA":
    case "DNA (chromatin)":
    case "Chromatin":
      return chromosomePositionAt(0.24, 0, -1, p);
    case "Duplicated chromosome":
      return chromosomePositionAt(0.5, 2, -1, p);
    case "DNA copy":
      return chromosomePositionAt(0.5, 2, -1, p);
    case "DNA copies": {
      const a = chromosomePositionAt(0.5, 1, 1, p),
        c = chromosomePositionAt(0.5, 1, -1, p);
      return [mix(a[0], c[0], 0.5), a[1], a[2]];
    }
    case "Nucleus":
    case "New nucleus":
      return p < 3 ? [0, 0, 0] : [daughterCenter(b.division), 0, 0];
    case "Nuclear membrane": {
      const r =
        p < 3
          ? mix(1.26, 1.46, smooth(1, 1.9, p))
          : mix(0.73, 1.08, b.daughterEnvelope);
      return [
        (p < 3 ? 0 : daughterCenter(b.division)) + r * 0.71,
        -r * 0.45,
        r * 0.54,
      ];
    }
    case "Cytoplasm":
      return [-daughterCenter(b.division), -1.25, 0.32];
    case "Spindle fibres":
      return spindleCurvePoint(20 / 32, 2, 1, p);
    case "Middle of the cell":
      return [0, 0.6, 1];
    case "Centrosome":
      return centrosomePosition(b.replication > 0.5 ? 1 : -1, p);
    case "Opposite ends":
      return centrosomePosition(1, p);
    case "Daughter cell":
      return [-daughterCenter(b.division) - 0.7, 0.55, 0.6];
    case "Cell membrane": {
      const { x, r } = membraneProfile(0.55, 1, p);
      return [x, r * Math.cos(2.25), r * Math.sin(2.25) * 0.87];
    }
    default:
      return fallback;
  }
}
