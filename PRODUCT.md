# Product
<!-- impeccable:product-schema 1 -->
## Platform
web
## Stack
User prefers React, TypeScript, Vite, Three.js, React Three Fiber and procedural geometry. Implement with these tools.
## Users
School students and visitors exploring cell division.
## Product Purpose
A complete scroll-controlled journey through six teaching stages of animal-cell division, with continuous biological transformation and animated everyday analogies.
## Capabilities and Constraints
All six stages, reversible scrubbing, stage navigation, real sister-chromatid separation, membrane furrowing and division, structure labels, keyboard controls, mobile and reduced motion. No static substitution for requested motion. Scientific detail outranks spectacle.
## Brand Commitments
Dark cinematic scientific experience, restrained interface, translucent membrane, glowing chromosomes, elegant large typography. Main copy supplied in the brief must be preserved.
## Evidence on Hand
Full user brief in the attached pasted-text-1.txt. Biology reference: OpenStax Biology 2e section 10.2.
## Accessibility & Inclusion
Keyboard-accessible controls, readable contrast, reduced motion, fallback descriptions.

## Classroom Content Authority
The user's supplied BC9 Topics 1.1 and 1.2 are the boundary for educational content. Use their vocabulary and level, especially Topic 1.2 Figures 1.9 and 1.10 (pp. 26–27). Do not add advanced mechanisms or extra technical label definitions. The organelle models remain removed. The user selected the six distinct everyday simulations recorded below.

## Model inspection
The user requested full 3D orbit, zoom in/out and subtle membrane-touch ripples. Rotation, pan and zoom are always active, with no separate exploration mode. The lesson stays readable while the camera moves. The first camera gesture or zoom action takes control from cinematic framing; Reset resumes it, and changing visualization or resizing also restores automatic fitting. Scroll over lesson text or use the timeline to change stage; wheel/pinch over the model zooms. Labels and selected-part descriptions are actual 3D billboard meshes connected to the model, with clickable geometry, a 3D close control, and focus-revealed keyboard equivalents. Labels start on and remain toggleable. Their bounds preserve mobile reading space. This remains an animal cell; no cell wall is added.

The user requires labels to point precisely to the named structure, including during animation and camera inspection. Nucleus selection identifies the nuclear envelope; plural labels identify both corresponding targets.

## Header name
The user rejected the cell / cycle header. It is renamed Life in Motion; The Cell Cycle remains the lesson subject.

## Confirmed everyday scenes
The user chose all six before implementation: Interphase photocopier; Prophase matching sleeping bags rolling tightly; Metaphase paired students at the gym centre line; Anaphase sock pairs dividing between baskets; Telophase fences enclosing matching gardens; Cytokinesis a large floating soap bubble separating into two. Replace the prior library scene completely. Build real procedural 3D models with detail on all sides, reversible stage-local animation, labels, replay, and always-active orbit, pan and zoom. Keep the biology vocabulary within the supplied textbook and distinguish an analogy's limits.
