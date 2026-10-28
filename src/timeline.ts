export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const smooth = (a: number, b: number, p: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
// The two halves share the same equator until the neck closes. Only then
// do their inner poles move apart; this prevents a premature open seam.
export const daughterCenter = (d: number) =>
  mix(2.01, 1.68, smooth(0, 0.965, d)) + smooth(0.965, 1, d) * 0.87;
export function membraneProfile(v: number, side: number, p: number) {
  const b = biology(p),
    R = 2.62 * mix(0.91, 1, smooth(1, 1.9, p)),
    L = R * (1 + b.elongation * 0.18);
  const d = b.division,
    close = smooth(0, 0.98, d),
    theta = (v * Math.PI) / 2;
  return {
    x: mix(
      side * L * Math.sin(theta),
      side * (1.68 + smooth(0.965, 1, d) * 0.87 - 1.68 * Math.cos(v * Math.PI)),
      close,
    ),
    r: mix(R * Math.cos(theta), 1.68 * Math.sin(v * Math.PI), close),
  };
}
export function biology(p: number) {
  const condensation = smooth(1.85, 2.65, p);
  const separation = smooth(4.02, 4.82, p);
  const decondensation = smooth(5.1, 5.88, p);
  return {
    replication: smooth(1.3, 1.65, p),
    condensation,
    separation,
    decondensation,
    alignment: smooth(2.65, 3.2, p),
    poles: smooth(2.05, 2.85, p),
    spindle: smooth(2.25, 3.18, p) * (1 - smooth(5.05, 5.65, p)),
    envelope: 1 - smooth(2.35, 2.85, p),
    daughterEnvelope: smooth(5.05, 5.75, p),
    division: smooth(5.7, 7, p),
    elongation: smooth(4.15, 5, p),
    stage: Math.min(5, Math.max(0, Math.floor(p) - 1)),
    intro: 1 - smooth(0.35, 1, p),
    final: smooth(6.92, 7.25, p),
  };
}
export const CHROMOSOME_COUNT = 4;
export const CHROMOSOME_COLORS = ["#e7a883", "#b4cabb", "#d7bd8c", "#bfadc9"];
// Classroom content is bounded to the supplied Topics 1.1 and 1.2.
// Printed pp. 26–27, Figure 1.9, provide the six-step teaching sequence.
export const phases = [
  {
    name: "Interphase",
    action: "Grow. Copy. Prepare.",
    group: "GROWTH & DEVELOPMENT",
    source: "Topic 1.2 · p. 26 · Figure 1.9",
    description:
      "The cell grows, makes more organelles and copies the DNA in its nucleus. This prepares it for cell division.",
    event: "Copying the DNA prepares a complete set for each new cell.",
    details: [
      "The cell grows and the number of organelles increases.",
      "The DNA in the nucleus is copied.",
      "This is the growth and development stage of the cell cycle.",
    ],
    analogy: "Make a matching set",
    analogyText:
      "A photocopier copies four different worksheets. The originals stay, and four matching copies make a second complete set.",
    analogyKey:
      "Worksheets = DNA information. This shows copying; the cell also grows and makes more organelles.",
  },
  {
    name: "Prophase",
    action: "Condense. Pack. Prepare.",
    group: "MITOSIS · PHASE 1 OF 4",
    source: "Topic 1.2 · p. 26 · Figure 1.9",
    description:
      "The nuclear membrane begins to disappear. DNA condenses into duplicated chromosomes, each containing two copies of the same DNA.",
    event: "A duplicated chromosome contains two matching DNA copies.",
    details: [
      "The nuclear membrane begins to disappear.",
      "The DNA becomes more condensed.",
      "Each duplicated chromosome contains two copies of the same DNA.",
    ],
    analogy: "Roll the sleeping bags",
    analogyText:
      "Four matching pairs of sleeping bags roll into tight bundles. The material stays the same; it takes up less space.",
    analogyKey: "Packing the bags = DNA condensing. Each pair represents a duplicated chromosome; the nuclear membrane also begins to disappear.",
  },
  {
    name: "Metaphase",
    action: "Guide. Move. Align.",
    group: "MITOSIS · PHASE 2 OF 4",
    source: "Topic 1.2 · p. 26 · Figure 1.9",
    description:
      "Spindle fibres guide chromosome movement. The duplicated chromosomes line up along the middle of the cell.",
    event: "Look for the line of duplicated chromosomes in the middle.",
    details: [
      "Spindle fibres guide the chromosomes as they move.",
      "The duplicated chromosomes line up in the middle of the cell.",
      "Their DNA copies have not separated yet.",
    ],
    analogy: "Meet at the centre line",
    analogyText:
      "Four pairs of students move from around the gym to its centre line. Each matching pair lines up together.",
    analogyKey: "Paired students = duplicated chromosomes. Centre line = middle of the cell. In the cell, spindle fibres guide movement.",
  },
  {
    name: "Anaphase",
    action: "Separate. Move. Divide.",
    group: "MITOSIS · PHASE 3 OF 4",
    source: "Topic 1.2 · p. 27 · Figure 1.9",
    description:
      "The copies of DNA separate and move to opposite ends of the cell. Each end receives a complete matching set.",
    event: "One copy from each duplicated chromosome goes to each end.",
    details: [
      "The matching copies of DNA separate.",
      "The copies move toward opposite ends of the cell.",
      "Both ends receive a complete copy of the cell’s DNA.",
    ],
    analogy: "Split the sock pairs",
    analogyText:
      "Each of four sock pairs splits between two baskets. Each basket receives one sock of every kind: two matching sets.",
    analogyKey: "Matching socks = matching DNA copies. Baskets = opposite ends of the cell. The copies separate during this step.",
  },
  {
    name: "Telophase",
    action: "Surround. Form. Complete.",
    group: "MITOSIS · PHASE 4 OF 4",
    source: "Topic 1.2 · p. 27 · Figure 1.9",
    description:
      "Two nuclei form. Each nucleus contains a complete copy of the cell’s DNA.",
    event: "Two nuclei, each with a complete copy of the DNA.",
    details: [
      "A nucleus forms around each set of DNA.",
      "Each new nucleus has a complete copy of the cell’s DNA.",
      "This is the last of the four phases of mitosis.",
    ],
    analogy: "Enclose both gardens",
    analogyText:
      "Two gardens already contain matching sets of four plants. A separate fence forms around each complete garden.",
    analogyKey: "Each garden = a complete DNA set. The two enclosures represent two nuclei forming; the cell has not yet split.",
  },
  {
    name: "Cytokinesis",
    action: "Divide. Separate. Restart.",
    group: "CELL DIVISION STAGE",
    source: "Topic 1.2 · p. 27 · Figure 1.9",
    description:
      "The cytoplasm and organelles divide, forming two separate daughter cells. The cells then begin interphase.",
    event:
      "The daughter cells have the same genetic information as the parent cell.",
    details: [
      "The cytoplasm and organelles are divided between the two cells.",
      "Two separate daughter cells form.",
      "The daughter cells begin interphase, continuing the cell cycle.",
    ],
    analogy: "One bubble becomes two",
    analogyText:
      "A large floating soap-bubble model narrows in the middle. The neck closes and two separate bubbles drift apart.",
    analogyKey: "Shape analogy only: a dividing cell also divides its cytoplasm and organelles. Soap bubbles do not copy DNA or reproduce like cells.",
  },
];
export const definitions: Record<string, string> = {
  DNA: "The genetic material that stores an organism’s instructions. It is copied before cell division so that each new cell receives the same information.",
  "DNA (chromatin)":
    "DNA coiled and packed to fit inside the cell. Before cell division, it condenses further into chromosomes.",
  Chromatin:
    "DNA coiled and packed to fit inside the cell. It condenses further into chromosomes before the cell divides.",
  Chromosome: "Genetic material in a condensed form of DNA.",
  "Duplicated chromosome":
    "A condensed chromosome containing two copies of the same DNA.",
  "DNA copies":
    "The matching copies made when the cell copies its DNA. They separate during anaphase.",
  "DNA copy":
    "One of the matching copies of DNA that move to opposite ends during anaphase.",
  Nucleus:
    "The part of the cell containing its DNA. In telophase, two nuclei form, each containing a complete DNA copy.",
  "New nucleus":
    "One of the two nuclei formed in telophase. It contains a complete copy of the cell’s DNA.",
  "Nuclear membrane":
    "The membrane around the nucleus. It begins to disappear in prophase; by telophase, two nuclei have formed.",
  "Spindle fibres": "Structures that guide chromosome movement during mitosis.",
  Centrosome:
    "Organizes the spindle fibres that guide chromosome movement during cell division.",
  "Middle of the cell":
    "The place where the duplicated chromosomes line up during metaphase.",
  "Opposite ends":
    "The two ends of the cell that receive the separated DNA copies during anaphase.",
  "Cell membrane":
    "The outer boundary of this animal cell. As the cell divides, the boundary separates the two daughter cells.",
  Cytoplasm:
    "The material inside the cell surrounding the nucleus. It is divided between the two daughter cells during cytokinesis.",
  "Daughter cell":
    "One of the two cells formed by cell division. The daughter cells are genetically identical to each other and to the parent cell.",
};
export const classroomContext = [
  {
    title: "Why new cells matter",
    text: "Cell reproduction supports growth, replaces older cells and helps repair damage. All cells come from cells that already exist.",
    source: "Topic 1.1 · pp. 8–9; Topic 1.2 · pp. 25–26",
  },
  {
    title: "DNA carries the information",
    text: "DNA stores genetic information. It coils into chromatin and condenses further into chromosomes before a cell reproduces.",
    source: "Topic 1.1 · p. 11 · Figure 1.5",
  },
  {
    title: "Two main stages",
    text: "The growth and development stage is interphase. The cell division stage includes mitosis and cytokinesis. Mitosis has four phases: prophase, metaphase, anaphase and telophase.",
    source: "Topic 1.2 · pp. 26–27 · Figures 1.9–1.10",
  },
  {
    title: "A matching copy for each new cell",
    text: "Asexual reproduction involves one parent and produces genetically identical offspring. In this model, copying and dividing the DNA gives each daughter cell the same genetic information.",
    source: "Topic 1.1 · p. 10; Topic 1.2 · p. 26 · Figure 1.9",
  },
];

export const classroomLabelSets: [string, [number, number, number]][][] = [
  [
    ["DNA (chromatin)", [-0.6, 0.6, 0]],
    ["Centrosome", [0.65, 0.65, 0]],
    ["Nuclear membrane", [0.7, -0.6, 0]],
    ["Nucleus", [0.6, 0.6, 0]],
    ["Cell membrane", [0.4, -0.6, 0]],
  ],
  [
    ["Duplicated chromosome", [0.65, 0.8, 0]],
    ["Nuclear membrane", [0.5, 0.6, 0]],
    ["DNA copies", [-0.7, -0.6, 0]],
    ["Cell membrane", [0.7, -0.7, 0]],
  ],
  [
    ["Duplicated chromosome", [0.7, 0.8, 0]],
    ["Spindle fibres", [0.6, -0.7, 0]],
    ["Middle of the cell", [0.75, 0.45, 0]],
    ["Cell membrane", [-0.7, -0.6, 0]],
  ],
  [
    ["DNA copy", [-0.5, 0.8, 0]],
    ["Spindle fibres", [0.6, -0.7, 0]],
    ["Opposite ends", [0.7, 0.65, 0]],
    ["Cell membrane", [-0.5, -0.7, 0]],
  ],
  [
    ["New nucleus", [0.5, 0.8, 0]],
    ["DNA copy", [-0.6, 0.7, 0]],
    ["Nuclear membrane", [0.6, -0.7, 0]],
    ["Cell membrane", [0.35, -0.6, 0]],
  ],
  [
    ["Cytoplasm", [-0.6, 0.8, 0]],
    ["Daughter cell", [0.5, -0.7, 0]],
    ["Nucleus", [0.7, 0.6, 0]],
    ["Cell membrane", [0.4, -0.7, 0]],
  ],
];
