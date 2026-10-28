import test from "node:test";
import assert from "node:assert/strict";
import {
  biology,
  membraneProfile,
  phases,
  CHROMOSOME_COUNT,
  classroomLabelSets,
  definitions,
  classroomContext,
} from "../src/timeline.ts";
import {
  chromosomePositionAt,
  centrosomePosition,
  spindleCurvePoint,
  dnaConfinement,
} from "../src/geometry.ts";
import { daughterCenter, mix, smooth } from "../src/timeline.ts";
import { analogyProgress, bubbleProfile, sockPosition, worksheetCopy } from "../src/analogyMotion.ts";

test("four worksheet copies appear in order without losing originals", () => {
  assert.equal([0, 1, 2, 3].filter(i => worksheetCopy(1.08, i).visible).length, 0);
  assert.equal([0, 1, 2, 3].filter(i => worksheetCopy(1.49, i).visible).length, 2);
  for (let i = 0; i < 4; i++) assert.deepEqual(worksheetCopy(1.9, i), { visible: true, travel: 1 });
});
test("each sock basket receives the same four kinds at distinct positions", () => {
  for (let i = 0; i < 4; i++) {
    const left = sockPosition(i, -1, 1), right = sockPosition(i, 1, 1);
    assert.ok(left[0] < -1.5 && right[0] > 1.5);
    assert.equal(left[1], right[1]); assert.equal(left[2], right[2]);
    assert.ok(Math.abs(left[0] + right[0]) < 1e-9);
  }
  assert.equal(new Set([0, 1, 2, 3].map(i => sockPosition(i, -1, 1).join())).size, 4);
});
test("soap-bubble neck remains joined until closure then produces two closed surfaces", () => {
  for (const t of [0, 0.3, 0.6, 0.88]) {
    const l = bubbleProfile(0, -1, t), r = bubbleProfile(0, 1, t);
    assert.equal(l.x, r.x); assert.ok(l.radius > 0); assert.equal(l.radius, r.radius);
  }
  for (const side of [-1, 1]) {
    const neck = bubbleProfile(0, side, 1), pole = bubbleProfile(1, side, 1);
    assert.equal(neck.radius, 0); assert.ok(pole.radius < 1e-9);
    assert.ok(Math.abs(neck.x) > 0.4);
  }
  for (let stage = 0; stage < 6; stage++) {
    assert.equal(analogyProgress(stage + 1, stage), 0);
    assert.equal(analogyProgress(stage + 1.95, stage), 1);
  }
});
test("six teaching chapters follow the specified order", () =>
  assert.deepEqual(
    phases.map((p) => p.name),
    [
      "Interphase",
      "Prophase",
      "Metaphase",
      "Anaphase",
      "Telophase",
      "Cytokinesis",
    ],
  ));
test("DNA replicates before condensation and separation", () => {
  assert.equal(biology(1.1).replication, 0);
  assert.equal(biology(1.8).replication, 1);
  assert.equal(biology(1.8).condensation, 0);
  assert.equal(biology(3.5).separation, 0);
});
test("metaphase has alignment, a bipolar spindle and no nuclear envelope", () => {
  const b = biology(3.5);
  assert.equal(b.alignment, 1);
  assert.equal(b.poles, 1);
  assert.equal(b.spindle, 1);
  assert.equal(b.envelope, 0);
  assert.equal(b.separation, 0);
});
test("anaphase separates sisters before daughter envelopes reform", () => {
  assert.ok(biology(4.5).separation > 0.5);
  assert.equal(biology(4.9).separation, 1);
  assert.equal(biology(4.9).daughterEnvelope, 0);
  assert.equal(biology(4.9).spindle, 1);
});
test("telophase restores nuclei and decondenses chromosomes", () => {
  const b = biology(5.9);
  assert.equal(b.daughterEnvelope, 1);
  assert.equal(b.decondensation, 1);
  assert.equal(b.spindle, 0);
});
test("membrane equators meet until the neck is almost closed", () => {
  for (const p of [0, 3.5, 5.8, 6.2, 6.6]) {
    const l = membraneProfile(0, -1, p),
      r = membraneProfile(0, 1, p);
    assert.ok(Math.abs(l.x) < 1e-9);
    assert.ok(Math.abs(r.x) < 1e-9);
    assert.equal(l.r, r.r);
    assert.ok(l.r > 0);
  }
});
test("final membrane halves are closed and physically separated", () => {
  const left = membraneProfile(0, -1, 7.3),
    right = membraneProfile(0, 1, 7.3);
  assert.ok(left.r < 1e-9);
  assert.ok(right.r < 1e-9);
  assert.ok(left.x < -0.8);
  assert.ok(right.x > 0.8);
  assert.ok(membraneProfile(1, 1, 7.3).r < 1e-9);
});
test("scrubbing is deterministic and reversible across every transition", () => {
  const positions = [0, 1.5, 2.4, 3.5, 4.5, 5.5, 6.5, 7.3];
  const states = positions.map(biology);
  positions
    .slice()
    .reverse()
    .forEach((p, i) =>
      assert.deepEqual(biology(p), states[states.length - 1 - i]),
    );
  for (let p = 0; p < 7.3; p += 0.01) {
    const b = biology(p);
    for (const [key, value] of Object.entries(b))
      assert.ok(Number.isFinite(value), `${key} at ${p}`);
  }
});
test("complete DNA tubes remain within intact and re-forming nuclear envelopes", () => {
  for (let p = 0; p <= 7.3; p += 0.035) {
    const b = biology(p);
    if (b.envelope < 0.01 && b.daughterEnvelope < 0.01) continue;
    const daughter = b.daughterEnvelope > 0.01,
      r = daughter
        ? mix(0.73, 1.08, b.daughterEnvelope)
        : mix(1.26, 1.46, smooth(1, 1.9, p));
    for (let i = 0; i < CHROMOSOME_COUNT; i++)
      for (const side of [-1, 1]) {
        if (side > 0 && b.replication === 0) continue;
        for (let k = 0; k <= 60; k++) {
          const v = chromosomePositionAt(k / 60, i, side, p),
            cx = daughter ? side * daughterCenter(b.division) : 0;
          const radius =
            Math.hypot(v[0] - cx, v[1], v[2]) + 0.11 * dnaConfinement(p);
          assert.ok(
            radius <= r + 0.002,
            `DNA exceeds envelope at p=${p.toFixed(3)}, radius=${radius}, envelope=${r}`,
          );
        }
      }
  }
});
test("growing spindle roots coincide with centrosomes throughout prophase", () => {
  for (let p = 2; p <= 3.4; p += 0.02)
    for (const side of [-1, 1])
      assert.deepEqual(
        spindleCurvePoint(0, 2, side, p),
        centrosomePosition(side, p),
      );
  for (const side of [-1, 1]) {
    const actual = spindleCurvePoint(1, 2, side, 3.5),
      expected = chromosomePositionAt(0.5, 2, side, 3.5);
    assert.ok(Math.hypot(...actual.map((v, i) => v - expected[i])) < 1e-10);
  }
});

test("four replicated chromosomes produce four daughter chromosomes at each pole", () => {
  assert.equal(CHROMOSOME_COUNT, 4);
  for (const side of [-1, 1]) {
    const centers = Array.from({ length: CHROMOSOME_COUNT }, (_, i) =>
      chromosomePositionAt(0.5, i, side, 4.9),
    );
    assert.equal(centers.length, 4);
    assert.equal(new Set(centers.map((p) => p[1].toFixed(4))).size, 4);
    assert.ok(centers.every((p) => p[0] * side > 1.7));
  }
});

test("every classroom label has a definition and every step has a textbook reference", () => {
  assert.equal(classroomLabelSets.length, 6);
  for (const labels of classroomLabelSets)
    for (const [name] of labels)
      assert.ok(definitions[name], `Missing classroom definition: ${name}`);
  for (const phase of phases)
    assert.match(phase.source, /Topic 1\.2.*p\. 2[67]/);
});
test("lesson vocabulary stays within textbook scope except the user-requested centrosome label", () => {
  const courseDefinitions = Object.fromEntries(
    Object.entries(definitions).filter(([name]) => name !== "Centrosome"),
  );
  const courseLabels = classroomLabelSets.map((labels) =>
    labels.filter(([name]) => name !== "Centrosome"),
  );
  const text = JSON.stringify({
    phases,
    definitions: courseDefinitions,
    classroomContext,
    classroomLabelSets: courseLabels,
  });
  assert.doesNotMatch(
    text,
    /kinetochore|cohesin|separase|prometaphase|abscission|actin|myosin|histone|nucleol|centromere|centrosome|G₁|G₂|anaphase A\b|anaphase B\b|metaphase plate/i,
  );
  assert.equal(phases.filter((p) => p.group.startsWith("MITOSIS")).length, 4);
  assert.equal(phases[0].group, "GROWTH & DEVELOPMENT");
});
