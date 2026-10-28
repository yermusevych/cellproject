import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Check,
  ChevronRight,
  CircleHelp,
  Focus,
  Maximize2,
  MoveUpRight,
  Pause,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import type { SceneNavigation } from "./NavigationControls";
import { CellScene } from "./CellScene";
import {
  biology,
  clamp,
  definitions,
  phases,
  classroomContext,
} from "./timeline";
import "./style.css";
import { ANALOGY_DEFINITIONS, analogyParts } from "./SceneAnnotations";
import { classroomLabelSets } from "./timeline";
import { analogyProgress } from "./analogyMotion";

class SceneBoundary extends React.Component<
  { children: React.ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="webgl-fallback">
        <h2>The 3D view could not start.</h2>
        <p>
          Try a browser with WebGL enabled. All six stage descriptions and
          controls remain available.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
function App() {
  const timeline = useRef(0),
    navigation = useRef<SceneNavigation | null>(null),
    playEnd = useRef(7.3);
  const [progress, setProgress] = useState(0),
    [analogy, setAnalogy] = useState(false),
    [labels, setLabels] = useState(true),
    [selected, setSelected] = useState<string | null>(null),
    [playing, setPlaying] = useState(false),
    [sound, setSound] = useState(false),
    [notes, setNotes] = useState(false),
    [reduced, setReduced] = useState(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [ready, setReady] = useState(false);
  const audio = useRef<AudioContext | null>(null),
    audioGain = useRef<GainNode | null>(null);
  const b = biology(progress),
    stage = b.stage,
    phase = phases[stage],
    intro = progress < 0.85,
    final = progress > 7.03;
  const jump = useCallback(
    (p: number, smoothScroll = true) => {
      window.scrollTo({
        top:
          (clamp(p, 0, 7.3) / 7.3) *
          (document.documentElement.scrollHeight - window.innerHeight),
        behavior: smoothScroll && !reduced ? "smooth" : "instant",
      });
    },
    [reduced],
  );
  useEffect(() => {
    const update = () => {
      const p =
        (window.scrollY /
          Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          )) *
        7.3;
      timeline.current = p;
      setProgress(p);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    setReady(true);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  useEffect(() => {
    if (!playing) return;
    let last = 0,
      id = 0;
    const tick = (time: number) => {
      if (last) {
        const p =
          timeline.current + Math.min(0.05, (time - last) / 1000) * 0.115;
        if (p >= playEnd.current) {
          setPlaying(false);
          jump(playEnd.current, false);
          return;
        }
        jump(p, false);
      }
      last = time;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, jump]);
  useEffect(() => {
    const stop = () => setPlaying(false);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchmove", stop, { passive: true });
    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
    };
  }, []);
  useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).matches("button,input,a,textarea,select") ||
        notes
      )
        return;
      if (e.key === "Escape") setSelected(null);
      if (e.code === "Space") {
        e.preventDefault();
        playEnd.current = 7.3;
        setPlaying((v) => !v);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        jump(intro ? 1.15 : Math.min(7.3, stage + 2.15));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        jump(Math.max(0, stage + 0.15));
      }
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [jump, stage, intro, notes]);
  useEffect(() => {
    setSelected(null);
  }, [stage, analogy]);
  useEffect(() => {
    document.documentElement.dataset.reduced = String(reduced);
  }, [reduced]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  const toggleSound = async () => {
    if (!audio.current) {
      const ctx = new AudioContext(),
        gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      [110, 164.81, 220.2].forEach((frequency, i) => {
        const osc = ctx.createOscillator(),
          g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = frequency;
        g.gain.value = 0.045 / (i + 1);
        osc.connect(g);
        g.connect(gain);
        osc.start();
      });
      audio.current = ctx;
      audioGain.current = gain;
    }
    await audio.current.resume();
    const next = !sound;
    audioGain.current?.gain.setTargetAtTime(
      next ? 0.17 : 0,
      audio.current.currentTime,
      0.5,
    );
    setSound(next);
  };
  const select = useCallback(
    (name: string) => setSelected((v) => (v === name ? null : name)),
    [],
  );
  const phaseJump = (i: number) => {
    setPlaying(false);
    jump(i + 1.48);
  };
  const replayAnalogy = () => {
    navigation.current?.reset();
    playEnd.current = stage + 1.94;
    jump(stage + 1.08, false);
    setPlaying(true);
  };
  const analogyPlayback = (
    <div className="analogy-playback">
      <button onClick={replayAnalogy}><RotateCcw size={12} /> Replay scene</button>
      <input type="range" min="0" max="100" step="0.1"
        aria-label="Scrub this analogy" value={analogyProgress(progress, stage) * 100}
        onChange={(e) => {
          setPlaying(false);
          // The smooth scene clock still runs forwards or backwards as you scrub.
          const t = Number(e.target.value) / 100;
          const linear = (1 - 2 * Math.sin(Math.asin(1 - 2 * t) / 3)) / 2;
          jump(stage + 1.08 + linear * 0.82, false);
        }} />
    </div>
  );
  return (
    <>
      <a className="skip-link" href="#phase-navigation">
        Skip to stage navigation
      </a>
      <div
        className={`experience ${intro ? "is-intro" : ""} ${final ? "is-final" : ""} ${ready ? "is-ready" : ""} ${analogy ? "is-analogy" : ""}`}
      >
        <header className="header">
          <button
            className="brand"
            onClick={() => {
              setPlaying(false);
              jump(0);
            }}
            aria-label="Life in Motion, back to beginning"
          >
            <span className="brand-mark">
              <i />
              <i />
              <i />
            </span>
            <span>
              Life in Motion
            </span>
          </button>
          <span className="header-caption">Topics 1.1 & 1.2</span>
          <div className="header-actions">
            <button
              className="notes-button"
              onClick={() => {
                setPlaying(false);
                setNotes(true);
              }}
            >
              Class notes <MoveUpRight size={13} />
            </button>
            <span className="header-divider" />
            <button
              className={`icon-button ${sound ? "active" : ""}`}
              onClick={() => void toggleSound()}
              aria-label={
                sound ? "Mute ambient sound" : "Enable quiet ambient sound"
              }
              title="Ambient sound"
            >
              {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <button
              className="icon-button"
              onClick={() => setReduced((v) => !v)}
              aria-label={
                reduced ? "Enable ambient motion" : "Reduce ambient motion"
              }
              aria-pressed={reduced}
              title="Reduce motion"
            >
              <AudioLines size={17} />
              {reduced && <span className="setting-dot" />}
            </button>
          </div>
        </header>
        <div
          className="scene"
          role="img"
          aria-label={`${intro ? "Animal cell" : phase.name + ": " + phase.description} ${analogy ? "Real-world analogy view." : "Interactive three-dimensional model."}`}
        >
          <SceneBoundary>
            <Suspense
              fallback={
                <div className="loading">
                  Entering the cell
                  <span />
                </div>
              }
            >
              <CellScene
                timeline={timeline}
                stage={stage}
                navigation={navigation}
                onInteract={() => setPlaying(false)}
                onClear={() => setSelected(null)}
                reduced={reduced}
                labels={labels}
                analogy={analogy}
                selected={selected}
                onSelect={select}
              />
            </Suspense>
          </SceneBoundary>
        </div>
        <div id="spatial-label-layer" aria-label="Structure labels">
          <svg id="label-leaders" aria-hidden="true" />
        </div>
        <div className="specimen-info">
          <span className="live-dot" />
          {analogy ? "THE EVERYDAY, REIMAGINED" : "ANIMAL CELL"}
          <span className="specimen-divider" />
          {analogy ? "ANIMATED ANALOGY" : "CELL CYCLE MODEL"}
        </div>
        <div className="scene-index" aria-hidden="true">
          {intro ? "" : String(stage + 1).padStart(2, "0")}
        </div>
        <main className="story" key={intro ? "intro" : final ? "final" : stage}>
          {intro ? (
            <>
              <h1>
                THE CELL
                <br />
                <span>CYCLE</span>
                <span className="title-period">.</span>
              </h1>
              <p className="intro-subtitle">One cell. Six steps. Two cells.</p>
              <p className="intro-description">
                New cells help you grow, replace older cells
                <br />
                and repair damage.
              </p>
              <button className="enter-button" onClick={() => jump(1.12)}>
                Enter the cell{" "}
                <span>
                  <ArrowDown size={18} />
                </span>
              </button>
            </>
          ) : final ? (
            <>
              <div className="final-equation">
                ONE CELL <ArrowRight size={20} /> TWO CELLS
              </div>
              <h1 className="final-title">
                Life grows
                <br />
                by division.
              </h1>
              <p className="stage-description">
                Each daughter cell has a complete copy of the DNA and begins
                interphase.
              </p>
              <button
                className="enter-button"
                onClick={() => {
                  setPlaying(false);
                  jump(0);
                }}
              >
                Replay the cycle{" "}
                <span>
                  <RotateCcw size={17} />
                </span>
              </button>
              <p className="cycle-again">
                Interphase → Prophase → Metaphase
                <br />
                Anaphase → Telophase → Cytokinesis ↻
              </p>
            </>
          ) : (
            <>
              <div className="phase-count">
                <span>{String(stage + 1).padStart(2, "0")}</span> / 06{" "}
                <span className="phase-kind">{phase.group}</span>
              </div>
              <h1 className="phase-title">{phase.name.toUpperCase()}</h1>
              <p className="action-phrase">{phase.action}</p>
              <p className="stage-description biological-description">
                {phase.description}
              </p>
              <div className="analogy-story">
                <h2>{phase.analogy}</h2>
                <p>{phase.analogyText}</p>
                <span>{phase.analogyKey}</span>
                {analogyPlayback}
              </div>
              <button
                className="science-trigger"
                onClick={() => {
                  setPlaying(false);
                  setNotes(true);
                }}
              >
                Inside this step <ChevronRight size={12} />
              </button>
              {stage === 0 && (
                <div className="interphase-steps">
                  {["Grow", "Copy DNA", "Prepare"].map((v, i) => (
                    <span
                      key={v}
                      className={
                        Math.min(2, Math.floor(clamp(progress - 1) * 3)) === i
                          ? "current"
                          : ""
                      }
                    >
                      {v}
                    </span>
                  ))}
                </div>
              )}
              <div className="event-caption">
                <span />
                {phase.event}
              </div>
            </>
          )}
        </main>
        <div className="scene-footer">
          <div className="scene-caption">
            <span className="small-cross" />
            <span>
              {intro
                ? "A living system. An endless beginning."
                : analogy
                  ? phase.analogy
                  : "ILLUSTRATIVE MODEL · NOT TO SCALE"}
            </span>
          </div>
          <div className="scene-tools">
            <button
              className="icon-button label-toggle"
              onClick={() => setLabels((v) => !v)}
              aria-pressed={labels}
              title="Toggle structure labels"
              aria-label="Toggle structure labels"
            >
              <Focus size={16} />
              <span>{labels ? "Labels on" : "Labels off"}</span>
            </button>
            <button
              className="icon-button camera-zoom"
              aria-label="Zoom in"
              title="Zoom in"
              onClick={() => {
                setPlaying(false);
                navigation.current?.zoom(0.82);
              }}
            >
              <ZoomIn size={16} />
            </button>
            <button
              className="icon-button camera-zoom"
              aria-label="Zoom out"
              title="Zoom out"
              onClick={() => {
                setPlaying(false);
                navigation.current?.zoom(1.22);
              }}
            >
              <ZoomOut size={16} />
            </button>
            <button
              className="icon-button reset-camera"
              onClick={() => {
                navigation.current?.reset();
              }}
              title="Reset camera angle"
              aria-label="Reset camera angle"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>
        <div className="model-part-shortcuts" aria-label="Model parts">
          {(analogy ? analogyParts[stage] : classroomLabelSets[stage].map(([name]) => name)).map(name =>
            <button key={name} onClick={() => select(name)}>{name}</button>)}
          {selected && <button onClick={() => setSelected(null)}>Close part description</button>}
        </div>
        <div className="sr-only" role="status" aria-live="polite">
          {selected && `${selected}. ${definitions[selected] || ANALOGY_DEFINITIONS[selected] || ""}`}
        </div>
        <div className="view-switch" aria-label="Visualization mode">
          <button
            className={!analogy ? "chosen" : ""}
            onClick={() => setAnalogy(false)}
            aria-pressed={!analogy}
          >
            <span className="view-dot" />
            Cell view
          </button>
          <button
            className={analogy ? "chosen" : ""}
            onClick={() => setAnalogy(true)}
            aria-pressed={analogy}
          >
            Real-world analogy <MoveUpRight size={12} />
          </button>
        </div>
        <footer className="timeline-footer">
          <div className="timeline-topline">
            <span>
              {intro ? "SCROLL TEXT TO DISCOVER" : "SCROLL TEXT TO TRANSFORM"}{" "}
              <ArrowDown size={12} />
            </span>
            <button
              className="play-button"
              onClick={() => {
                if (final) jump(0, false);
                playEnd.current = 7.3;
                setPlaying((v) => !v);
              }}
            >
              {playing ? (
                <Pause size={13} fill="currentColor" />
              ) : (
                <Play size={13} fill="currentColor" />
              )}
              {playing ? "Pause journey" : "Play journey"}
            </button>
            <span className="timeline-percent">
              {Math.round((progress / 7.3) * 100)
                .toString()
                .padStart(2, "0")}
              <span> / 100</span>
            </span>
          </div>
          <nav
            id="phase-navigation"
            className="phase-navigation"
            aria-label="Cell cycle stages"
          >
            {phases.map((ph, i) => (
              <button
                key={ph.name}
                className={`${!intro && stage === i ? "current" : ""} ${progress >= i + 2 ? "visited" : ""}`}
                onClick={() => phaseJump(i)}
                aria-current={!intro && stage === i ? "step" : undefined}
              >
                <span className="nav-top">
                  <span className="nav-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="nav-line">
                    <i style={{ width: `${clamp(progress - i - 1) * 100}%` }} />
                  </span>
                  <span className="nav-point">
                    {progress >= i + 2 ? <Check size={8} /> : null}
                  </span>
                </span>
                <span className="nav-name">{ph.name}</span>
              </button>
            ))}
          </nav>
          <label className="sr-only" htmlFor="timeline-scrub">
            Scrub through the complete cell cycle
          </label>
          <input
            id="timeline-scrub"
            className="timeline-scrub"
            type="range"
            min="0"
            max="7.3"
            step="0.005"
            value={progress}
            onChange={(e) => {
              setPlaying(false);
              jump(Number(e.target.value), false);
            }}
          />
          <div className="timeline-bottom">
            <span>MITOSIS & THE CELL CYCLE</span>
            <span className="drag-instruction">
              Drag to rotate · Scroll or pinch to zoom · Click a part · Timeline changes stage
            </span>
            <div className="stage-arrows">
              <button
                aria-label="Previous stage"
                disabled={intro}
                onClick={() => {
                  setPlaying(false);
                  jump(stage === 0 ? 0 : stage + 0.12);
                }}
              >
                <ArrowLeft size={15} />
              </button>
              <button
                aria-label="Next stage"
                disabled={final}
                onClick={() => {
                  setPlaying(false);
                  jump(intro ? 1.12 : Math.min(7.3, stage + 2.12));
                }}
              >
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </footer>
      </div>
      <div className="scroll-track" aria-hidden="true" />
      {notes && <FieldNotes stage={stage} onClose={() => setNotes(false)} />}
      <div className="sr-only" aria-live="polite">
        {intro
          ? "The Cell Cycle. One cell. Six steps. Two cells."
          : final
            ? "Division complete. Two daughter cells."
            : `${phase.name}. ${phase.description}`}
      </div>
    </>
  );
}
function FieldNotes({
  onClose,
  stage,
}: {
  onClose: () => void;
  stage: number;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    const section = d?.querySelector(
      `[data-stage="${stage}"]`,
    ) as HTMLElement | null;
    if (d && section) d.scrollTop = section.offsetTop - 24;
    return () => {
      d?.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="field-notes"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        className="icon-button close-notes"
        aria-label="Close class notes"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <CircleHelp size={25} />
      <h2>
        What we learned.
        <br />
        The cell cycle.
      </h2>
      <p>
        Six steps show the two main stages of the cell cycle: growth and
        development, followed by cell division.
      </p>
      <div className="stage-notes">
        {phases.map((phase, i) => (
          <section key={phase.name} data-stage={i}>
            <h3>
              {String(i + 1).padStart(2, "0")} · {phase.name}
            </h3>
            <p>{phase.description}</p>
            <span className="textbook-source">{phase.source}</span>
            <ol>
              {phase.details.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <dl>
        {classroomContext.map((item) => (
          <div key={item.title}>
            <dt>{item.title}</dt>
            <dd>
              {item.text}
              <span className="textbook-source">{item.source}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="model-note">
        The four chromosomes are a simplified model, following the pattern in
        Figure 1.9. Colors, size and timing help show the changes; they are not
        measurements of a real cell.
      </p>
      <p className="classroom-reference">
        Class textbook: Topics 1.1 and 1.2. The six steps follow Figure 1.9 on
        printed pages 26–27; the two main stages follow Figure 1.10 on page 27.
      </p>
      <div className="notes-controls">
        Drag the model to rotate at any time. Scroll or pinch over it to zoom.
        Click a model part or its 3D label to read its description. The zoom
        buttons and camera reset are always available. Tap the membrane for a
        ripple. Scroll over the lesson text, use the timeline or arrow keys to
        change stage. Press Escape to close a part description.
        Space starts or pauses playback. Sound is optional and starts quietly.
      </div>
      <button className="enter-button" onClick={onClose}>
        Back to the cell <ChevronRight size={16} />
      </button>
    </dialog>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
