# Validation — classroom-aligned content and 3D inspection

## Exact structure-label anchors

- Cell labels resolve endpoints from tagged, currently transformed scene objects in `src/structureAnchors.ts`. Nucleus, New nucleus, Nuclear membrane, Cell membrane and Daughter cell leaders meet rendered silhouette vertices in the current camera view. This keeps their endpoints visibly on the translucent blue/green boundaries. DNA retains triangle intersections; spindle endpoints read the animated line buffer, and pole endpoints read membrane vertices. Missing or hidden targets hide the corresponding label. Cytoplasm retains a volume target outside the nucleus.
- Nucleus labels and pointer selection identify the blue nuclear envelope, with matching envelope highlight and definition. The small pink decoration no longer acts as the Nucleus selection target. DNA copies and Opposite ends each have two leaders.
- All 21 tests and the TypeScript/Vite production build passed for the contour-pointer revision. Anchor regressions cover nucleus transforms and camera rotation, deformed membranes, completed-stage-six nucleus and daughter-cell outlines across orbit and separation, animated spindle buffers and the daughter-cell cytoplasm target. Numerical checks complement the visual review.
- A fresh independent finish review returned `ship` with no material fixes after comparing both user screenshots with seven captures in `.impeccable/review-contour/`: intro, stage six, final separation, orbit, final orbit, mobile final and mobile intro. Endpoints were visibly attached to the blue/green boundaries. Earlier all-stage and nucleus-selection captures remain in `.impeccable/review-anchors/`. No physical-touch hardware or sustained FPS benchmark was used.
- A browser interaction check selected the actual 3D Nucleus label at the intro: the blue nuclear shell highlighted, the description and close target appeared, and Escape dismissed the selection. Browser console errors and warnings were empty.
- The Pages workflow tests, builds and deploys each `main` push. Deployment results are verified and reported separately after source publication.

## Always-active 3D update

- Removed the separate exploration state/button and story-dimming rules. OrbitControls is always enabled; rotation leaves lesson text at opacity 1. Wheel/pinch over the canvas zooms; scrolling over lesson text and the timeline changes stage. Camera reset restores framing without disabling interaction, and viewport changes re-fit the scene.
- Replaced DOM model labels and the screen-space definition panel with actual 3D billboard meshes, world-anchor leaders, a spatial description plaque and its 3D close target. All cell labels remain available on mobile, with a measured-width screen gutter. Model parts in every analogy now select the corresponding analogy definition; keyboard equivalents remain available.
- Browser checks confirmed real 3D-label selection, physical worksheet/model selection, 3D close, rotation with no mode button, and unchanged full story opacity. Desktop 1440x900, mobile 390x844 and 2048x1012 captures were inspected. Browser diagnostics reported no errors or warnings during these checks.
- The production build and all 16 tests passed. Final independent review scored both requested visual fixes resolved: complete text below the close control and an unclipped mobile Cell membrane label. Captures are in `.impeccable/review-always-3d/`.

The entries below describe earlier completed revisions; the always-active behavior above supersedes the former explicit exploration mode.

- Both supplied textbook sections were read. The relevant complete pages were rendered and inspected: Topic 1.1 p. 11; Topic 1.2 pp. 26–27 (Figures 1.9 and 1.10).
- All six explanations, label definitions, analogy captions and class notes are bounded to those sections. Advanced molecular explanations and outside biology reference links were removed.
- The app distinguishes the two main stages from its six numbered steps. Page references are visible in class notes and mapped in CURRICULUM.md.
- TypeScript and Vite production build passed. All 13 tests passed, including DNA containment, spindle geometry, membrane separation, four DNA sets per end, classroom label definitions and a vocabulary-scope guard.
- Browser checks verified textbook-level metaphase/anaphase copy and labels, class notes, entering/exiting 3D mode, orbit beyond the previous limits, zoom buttons and wheel zoom. Wheel zoom left lesson progress unchanged. A membrane pointer interaction triggered the ripple uniforms and interaction counter. Camera reset restores the lesson view.
- Desktop 1440x900 and mobile 390x844 layouts were inspected. No physical touch hardware or sustained FPS benchmark was used.
- The user selected six separate analogies, all implemented in procedural 3D: photocopier, rolled sleeping bags, gym class, socks/baskets, fenced gardens, and dividing soap-bubble shapes. The prior library model was removed.

## Six-model verification

- All six scenes were visually inspected in desktop 1440x900 and mobile 390x844 layouts, plus the user's 2048x1012 viewport. Captures are in `.impeccable/review-analogies/`.
- Each model follows the same reversible stage-local clock. A dedicated scrubber and replay control keep playback within the selected chapter. Analogy copy sits beside the desktop specimen and above the mobile specimen.
- Numerical checks cover sequential production of four worksheet copies, four distinct sock kinds in each basket, and bubble closure before separation. The final TypeScript/Vite production build and all 16 tests passed. A fresh independent visual review returned `ship` with no material fixes; documentation was checked separately against the implementation.
- Full orbit crossed to the rear of the model (camera z became negative), and the zoom control reduced camera distance from approximately 13.82 to 11.34. The invisible cell is unmounted in analogy mode so its interaction targets and geometry updates cannot intercept model inspection.
- The bubble is an illustrative changing surface, not a solver for soap-film physics. The caption explicitly states that real cells also divide cytoplasm and organelles. No physical-touch hardware or FPS benchmark was used.

Latest label correction: the marked interphase spindle organizer now has a Centrosome label, a moving anchor, matching selection highlight and a short definition. Its label is included among the first three labels so it remains visible on mobile. This is the explicit user-requested vocabulary exception.
