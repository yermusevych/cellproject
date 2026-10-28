import { clamp, mix, smooth } from "./timeline.ts";

// Each everyday example has its own reversible one-chapter clock.
export const analogyProgress = (p: number, stage: number) =>
  smooth(stage + 1.08, stage + 1.9, p);
export function worksheetCopy(p: number, i: number) {
  const t = clamp(analogyProgress(p, 0) * 4 - i);
  return { visible: t > 0, travel: smooth(0, 1, t) };
}
export function sockPosition(i: number, side: number, t: number): [number, number, number] {
  const startX = (i - 1.5) * 0.62 + side * 0.12;
  return [mix(startX, side * (2.0 + (i % 2 - 0.5) * 0.42), t),
    0.3 + Math.sin(t * Math.PI) * 0.45 - t * 0.62,
    mix((i % 2) * 0.12, (Math.floor(i / 2) - 0.5) * 0.52, t)];
}
// Closed surfaces share a neck until it reaches zero; only then separate.
// This models the shape of division, not the physics of real soap films.
export function bubbleProfile(v: number, side: number, t: number) {
  const close = smooth(0.05, 0.9, t), split = smooth(0.9, 1, t);
  const a = v * Math.PI / 2;
  return {
    x: mix(side * 2.05 * Math.sin(a), side * (1.6 - 1.6 * Math.cos(v * Math.PI)), close) + side * split * 0.45,
    radius: mix(2.05 * Math.cos(a), 1.6 * Math.sin(v * Math.PI), close),
  };
}
