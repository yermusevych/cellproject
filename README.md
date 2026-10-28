# Life in Motion — The Cell Cycle

An interactive 3D animal-cell model for the supplied class textbook, Topics 1.1 and 1.2.

## Run

`npm install` then `npm run dev`. Production: `npm run build`, then `npx vite preview --host 127.0.0.1`.

## Classroom scope

The biology shown and explained follows Topic 1.1 p. 11 and Topic 1.2 pp. 25–27, especially Figures 1.9 and 1.10. There are two main stages: growth and development (interphase), and cell division (mitosis and cytokinesis). The six numbered steps preserve the four phases of mitosis between interphase and cytokinesis.

Descriptions, definitions, labels and class notes use the supplied textbook as their authority. Advanced molecular terminology and outside biology links have been removed. See CURRICULUM.md for the source map. The four-chromosome count remains a visual simplification requested for the project.

## Implementation

React, TypeScript, Vite, Three.js, React Three Fiber and Drei. The cell and its DNA are procedural geometry. One reversible scroll timeline controls DNA copying, condensation, alignment, separation, new nuclei and physical cell division. The membrane is built from two connected surfaces that close and separate. Bundled fonts avoid external runtime assets. Labels use camera-facing 3D meshes and spatial leaders resolved against the currently transformed model geometry. Nuclear and cell-shell labels meet visible silhouette vertices in the current camera view, so their endpoints read clearly on the translucent boundaries during animation and orbit. DNA labels meet rendered triangles; spindle and pole labels follow rendered geometry buffers. Cytoplasm points into the cell interior outside the nucleus. DNA copies and Opposite ends use two leaders to identify both targets. Selecting Nucleus targets the blue nuclear envelope, including its selection highlight and definition. Selected-part descriptions are 3D plaques with a close control.

The cytoplasmic organelle models remain removed. Six individually selected everyday scenes replace the library analogy: photocopier, sleeping bags, gym class, socks and baskets, fenced gardens, and a floating soap bubble that splits. Each has a reversible scene scrubber and replay. Orbit, pan and zoom are always active, with no separate mode and no fading of lesson descriptions. Click model parts or their spatial labels to read 3D descriptions. Labels are on by default and can be hidden. Analogy explanations occupy the story column on desktop and sit above the model on mobile, explaining both the classroom connection and the limits of the comparison. The bubble represents shape, not real soap-film physics or biological reproduction.

## Controls and access

Drag the model to rotate, right-drag to pan, and use the wheel or a two-finger pinch over it to zoom. These controls are always active. Scroll over the lesson text or use the timeline, phase buttons or previous/next arrows to change stage. Space toggles guided playback outside controls. The first camera gesture or zoom-button action holds your camera framing as the lesson progresses. Reset resumes cinematic framing without disabling 3D interaction; switching visualization or resizing also restores automatic fitting. Click a model part or 3D label to read its description; Escape or the 3D close control dismisses it. Keyboard equivalents for model parts appear on focus. Tapping the membrane produces a short, restrained visual ripple; this interaction is illustrative, not a new biology lesson. Class notes show textbook page references. Labels, sound, reduced motion and replay remain available.

The interface retains its dark museum-like visual system. DPR is capped; reduced motion disables ambient movement and smooth jumps while keeping user-controlled biological progression. Sizes, colors, spacing and timing are illustrative.

## GitHub publishing

The source mirror is [yermusevych/cellproject](https://github.com/yermusevych/cellproject), and the GitHub Pages destination is [Life in Motion](https://yermusevych.github.io/cellproject/). Every project change must be tested, built and published to the existing Sites project, then synchronized as the same full source to GitHub `main` and deployed to Pages. This workflow is standing user authorization; see AGENTS.md for the account and synchronization requirements.

`python scripts/github-snapshot.py` emits the complete Git-visible source tree for connector-based synchronization, including binary files separately. Use a complete replacement tree parented to the inspected current `main` head so deleted files are removed too. Dependencies, generated builds, local credentials, QA captures, runtime files and textbook attachments remain excluded.

`.github/workflows/pages.yml` runs on each `main` push and manual dispatch. It installs dependencies with `npm ci`, runs tests, builds with `--base=/cellproject/`, and deploys `dist` to Pages. The ordinary Sites build keeps `/`. Verify both publications after each change and report their deployment results.
