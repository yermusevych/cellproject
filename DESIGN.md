---
name: The Cell Cycle
description: A nocturnal science museum for a continuous living specimen.
colors:
  abyss: "#071313"
  ink: "#e9eee6"
  muted: "#a3b7ad"
  sea: "#a6d4bf"
  line: "#284139"
  copper: "#efb093"
  chromosome-a: "#e7a883"
  chromosome-b: "#b4cabb"
  chromosome-c: "#d7bd8c"
  chromosome-d: "#bfadc9"
  membrane: "#6fc8b4"
  chromosome: "#f6ad83"
  teal: "#8ee8d3"
  control-active: "#193029"
  switch-active: "#30493c"
  label-surface: "#0e241de6"
  detail-surface: "#10251fed"
  notes-surface: "#10241c"
  parchment: "#d8c5a7"
  scene-annotation-surface: "#10291f"
  scene-annotation-outline: "#557564"
  scene-annotation-text: "#edf3e6"
  scene-annotation-body: "#d8e4d1"
  scene-label-edge: "#3c5e4c"
  scene-plaque-edge: "#667f68"
  scene-close-surface: "#294936"
  scene-close-mark: "#e3e9d8"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(66px, 7.1vw, 114px)"
    fontWeight: 500
    lineHeight: 1.01
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(38px, 4.25vw, 69px)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "17px"
    fontWeight: 500
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "10px"
    fontWeight: 400
rounded:
  label: "3px"
  tool: "4px"
  detail: "12px"
  dialog: "14px"
  pill: "30px"
  circle: "50%"
spacing:
  hairline-gap: "3px"
  compact: "4px"
  icon: "9px"
  label: "7px 10px"
  switch-option: "10px 15px"
  detail: "23px"
  dialog: "40px"
components:
  icon-button:
    textColor: "#acc3b6"
    rounded: "{rounded.circle}"
    padding: "{spacing.icon}"
  icon-button-hover:
    backgroundColor: "{colors.control-active}"
    textColor: "#eff5e8"
  enter-button:
    textColor: "{colors.ink}"
    padding: "0"
  view-switch:
    backgroundColor: "#0b1c18aa"
    rounded: "{rounded.pill}"
    padding: "{spacing.compact}"
  view-switch-option:
    textColor: "#9cb3a4"
    rounded: "{rounded.pill}"
    padding: "{spacing.switch-option}"
  view-switch-option-selected:
    backgroundColor: "{colors.switch-active}"
    textColor: "#e6ecdf"
  stage-navigation:
    textColor: "#9ab19e"
    padding: "0"
  stage-navigation-current:
    textColor: "#edf0dd"
  timeline-scrubber:
    height: "3px"
    width: "100%"
  spatial-label:
    backgroundColor: "{colors.scene-annotation-surface}"
    textColor: "{colors.scene-annotation-text}"
  structure-detail:
    backgroundColor: "{colors.scene-annotation-surface}"
    textColor: "{colors.scene-annotation-body}"
    width: "300px"
  structure-detail-close:
    backgroundColor: "{colors.scene-close-surface}"
    textColor: "{colors.scene-close-mark}"
  field-notes:
    backgroundColor: "{colors.notes-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dialog}"
    padding: "{spacing.dialog}"
---

# Design System: The Cell Cycle

## Overview

**Creative North Star: "The Nocturnal Science Museum"**

A living specimen occupies a dark, continuous exhibition space. Translucent sea-glass membranes, warm glowing chromosomes and pale typography give the experience a calm cinematic character. Controls stay small and precise; large, tightly tracked headings carry the narrative.

The user chose an elegant scientific museum atmosphere with minimal interface chrome and smooth, scroll-controlled 3D. Preserve the organic procedural model and restrained exhibit language. Childish clipart, card grids and slide-like stage replacements do not belong to this experience.

**Key Characteristics:**

- One continuous specimen with reversible biological transformation.
- Sea-glass translucency and copper light against near-black green.
- Large Manrope headings paired with quiet DM Sans annotations.
- Fine rules, small circular controls and spatial structure labels.

## Colors

Cool green-black depth surrounds warm biological detail; the frontmatter preserves the implemented CSS and scene colors.

### Primary

- **Copper:** UI accents, focus outlines, phase counters and small markers.
- **Chromosome:** the procedural chromatid material, supported by warm emissive light.

### Secondary

- **Sea:** the reusable sea-glass UI accent.
- **Membrane:** the translucent cell envelope shader's base color.
- **Teal:** the faint equatorial plane and cool scientific scene accent.

### Neutral

- **Abyss:** the page, WebGL background and fog share a single dark environment.
- **Ink / Muted:** primary reading text and quieter supporting copy.
- **Line:** restrained dividers; related local greens delineate controls.
- **Control Active / Switch Active:** tonal selection surfaces.
- **Notes Surface:** the translucent contextual reading overlay. The retained label/detail CSS surface tokens belong to the earlier overlay styles.
- **Scene Annotation Surface / Outline / Text / Body:** opaque dark-green texture faces, fine framing, pale headings and supporting copy on the camera-facing 3D annotations.
- **Scene Label Edge / Plaque Edge / Close Surface / Close Mark:** shallow mesh edges and the separate 3D close control.
- **Parchment:** the fine timeline thumb and text selection.

**The Specimen Light Rule.** Use luminous color to distinguish biological structures and small interaction states. Preserve the dark exhibition field around them.

## Typography

**Display Font:** Manrope, sans-serif. **Body Font:** DM Sans, sans-serif. Both families are bundled locally. There is no separate mono family.

The pairing is geometric and understated. Manrope carries headings at medium weight; DM Sans handles story descriptions and interface controls. Canvas-textured 3D labels and plaques use the browser sans-serif stack. Typography is fluid and purpose-specific rather than a uniform mathematical scale.

### Hierarchy

- **Display:** the opening title uses the display token, balanced wrapping and pale green secondary words. The final statement has its own fluid size (`clamp(45px, 5.4vw, 82px)`) and close line spacing (`1.1`).
- **Headline:** uppercase phase names use the headline token. Intermediate screens reduce them to `4.5vw`; mobile uses `clamp(30px, 8.4vw, 57px)`.
- **Title:** small structure headings use the title token. The notes heading is larger (`38px/1.2`, medium weight) and becomes `30px` on mobile.
- **Body:** phase descriptions use the body token with a narrow reading measure (`300px` maximum). Mobile body copy becomes `11px/1.65`.
- **Label:** interface annotations use the label token; specimen metadata and timeline captions use smaller, spaced uppercase lettering. Progress digits use tabular numerals. Scene labels rasterize at `24px` and scale to about `11.52px` on desktop, with a `0.86` mobile multiplier. Plaques rasterize at `600px` wide, using `31px` medium headings and `26px/35px` body text, then display at `300px` wide on desktop or `75vw` on mobile.

**The Quiet Annotation Rule.** Keep interface labels subordinate to the stage title and specimen; do not promote every control into a heading.

## Layout

The experience is fixed to the viewport. A separate scroll track (`1100vh`) controls a continuous timeline. The desktop header spans the top; story copy sits at the left (`7%`, `32%` width, `480px` maximum), while the specimen occupies the center-right. The intro expands the text region to `45%` and `680px` maximum. A six-column timeline anchors the lower edge with fine progress lines and previous/next controls.

The default header is `108px` high with `4.5%` side padding. The bottom timeline is `196px` high. The central view switch floats above it. Layout adapts at `1100px`, and at `759px` the story moves above the specimen (`7%` left, `16%` top, `85%` width); the timeline remains six columns. Mobile hides supporting intro/event copy and some secondary tools, reduces control padding and uses a camera fit that contains both daughter cells. The intro mobile display is `clamp(49px, 12.7vw, 85px)`.

Height-specific layouts adjust the exhibit at `950px` and `720px`. Preserve these shorter-screen accommodations when adding content. Contextual panels use bounded widths rather than replacing the specimen: notes are at most `600px`, `calc(100vw - 32px)` wide and `85vh` high.

## Elevation & Depth

Depth comes chiefly from transparent Fresnel-lit membranes, lit chromosome tubes, fog, particles and the camera. The scene uses no shadow maps or postprocessing bloom; its glow comes from shaders, emissive materials and point lights. Interface depth is reserved for contextual overlays, with blur and diffuse black shadows. Scene labels and description plaques have shallow box backing, camera-facing texture planes and depth-test-disabled faces so their reading surfaces stay legible.

### Shadow Vocabulary

- **Field notes:** `0 30px 110px #0008` separates the modal from the exhibit.
- **Marker glow:** small live/active points use localized glow rather than raised button shadows.

The view switch has a translucent backdrop blur (`16px`); the notes backdrop uses `12px`. Scene annotations use opaque canvas textures and mesh edges rather than CSS shadows or backdrop blur.

## Shapes

Organic cell geometry is the signature silhouette. Interface geometry stays controlled: circular icon buttons and stage arrows, a pill-shaped two-way view selector, square-edged spatial label meshes and softly rounded contextual notes. Fine one-pixel borders define controls without turning the canvas into a collection of containers. The circular atom-like brand mark is built from three thin ellipses.

## Components

### Buttons

Small, quiet and precise. Icon controls use circular hit shapes, tonal green hover/active fills and a short color/background transition. The entry/replay action is plain text with a separately outlined circular arrow; hovering fills its circle and moves it down (`3px`). Previous/next arrows are outlined circles; disabled arrows dim to `0.28` opacity. Focus uses a copper outline (`2px`, `6px` offset) across buttons, links and inputs.

### View switch

A translucent outlined pill holds two compact options. The selected option receives the darker green fill and brighter text; selection changes the visualization while keeping the same biological timeline. Mobile padding and type are smaller. It is a view selector, not a chapter control.

### Navigation and scrubber

Six equal stage buttons combine an index, a thin partially filled line, a point and a name. The current stage brightens its label, warms its index and glows at the point; visited stages receive a check. Mobile removes the point. The range input stays directly draggable, with a one-pixel track and small parchment thumb; it also supports native keyboard input. Hover brightens stage names, and the shared focus outline remains visible.

### Spatial labels and structure details

Small dark labels are camera-facing 3D meshes with canvas-textured faces and shallow box backing. Fine scene leaders resolve their endpoints from the currently transformed model geometry. Nuclear and cell-shell labels use visible silhouette vertices in the current camera view, keeping pointers visibly on translucent boundaries during animation and orbit. DNA uses surface intersections; spindle fibres and poles use rendered buffers. Cytoplasm uses an interior target outside the nucleus. Plural DNA copies and Opposite ends have two leaders. Label positions are projected and bounded to the model area, then placed back into world space. Measured rendered label width informs horizontal bounds on narrow screens. Label scale compensates for camera distance to preserve readable size during orbit and zoom. Preserve visible attachment to the named structure as the model transforms or the camera moves.

Selecting a model part or its label opens a camera-facing 3D description plaque. Its header band stays separate from wrapped body text and the upper-right mesh close control. Plaques are bounded to the model area and use a desktop reading width (`300px`) or mobile width (`75vw`). Scene annotations are prioritized during pointer hit testing. The label toggle starts on and controls scene labels; part geometry remains clickable. Focus-revealed HTML buttons provide equivalent part selection and close actions, with a live description for assistive technology. Escape also closes the selected description. Changing stage or visualization clears selection. No general card system is implemented.

### Field notes

A native modal dialog provides scientific context and controls. It uses the notes surface, a fine border, soft corners, a blurred dark backdrop and a larger Manrope heading. Close, Escape and the return action dismiss it. Preserve the distinction between contextual reading and the ongoing exhibit.

### Continuous specimen and motion

Absolute scroll progress drives replication, condensation, alignment, chromatid separation, nuclear reformation and membrane furrowing. Backward scrubbing reverses the same geometry. Scroll over the lesson text or use the timeline and stage controls to progress; wheel or pinch over the model zooms.

Orbit, pan and zoom are always enabled for the cell and all six everyday scenes. The cinematic camera changes distance and oblique angle with progress until the first camera gesture or zoom-button action; user camera control then retains that framing while the lesson changes. Reset resumes cinematic framing without disabling interaction. Switching visualization or resizing also restores automatic fitting. Desktop framing leaves room for the left story column; mobile centers the model and increases fit for both daughter cells. The lesson copy remains readable throughout camera interaction.

Reduced motion initializes from the system preference and can be toggled. It removes ambient membrane/chromosome/fibre/analogy oscillation, particle drift and pointer parallax, disables CSS transitions/reveals and orbit damping, makes stage jumps immediate, and applies automatic camera targets without interpolation. User-directed scrolling, scrubbing, orbit, pan, zoom and the biological transformations remain available. Guided playback remains explicitly user-controlled. Do not describe reduced motion as a static substitute for the requested educational model.

### Everyday scenes

The six procedural analogies are a photocopier, matching sleeping bags, paired gym students, socks separating into baskets, matching fenced gardens and a floating soap bubble splitting. Each has reversible stage-local animation, its own scrubber and replay, clickable parts and spatial labels. Explanations stay in the desktop story column and above the model on mobile, including the limits of each comparison. Cytoplasmic organelle and nucleolus models remain omitted; touch ripple effects are removed; classroom language stays within the supplied Topics 1.1 and 1.2.

## Do's and Don'ts

### Do:

- **Do** preserve the dark cinematic science museum atmosphere and organic translucent specimen.
- **Do** keep large, elegant headings and small, restrained scientific annotations.
- **Do** keep biological progression reversible and retain user camera framing until reset or automatic refit.
- **Do** preserve keyboard focus, direct scrubbing, mobile camera fit and reduced-motion behavior.
- **Do** keep orbit, pan and zoom available alongside readable lesson text and 3D annotations.

### Don't:

- **Don't** introduce childish clipart, card grids or slide-like stage replacements.
- **Don't** replace continuous biological transformations with static illustrations.
- **Don't** add bloom, heavy panel shadows or saturated fills to routine interface controls.
- **Don't** claim the illustrative colors, chromosome count, spacing or timing are literal biological scale.

