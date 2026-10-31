import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Bluetooth, MessageSquare, Mic } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const FRAME_COUNT = 96;
const FRAME_BASE = "/assets/veyro-frames/";
const CHAPTERS = [
  {
    title: "01 / THE DESIGN",
    description: "Engineered for a connected ride.",
  },
  {
    title: "02 / COMMUNICATION",
    description: "Your voice. Your connection.",
  },
  {
    title: "03 / INTELLIGENCE",
    description: "Technology that listens.",
  },
  {
    title: "04 / INSIDE VEYRO",
    description: "Every component. One vision.",
  },
];

function framePath(index: number) {
  return `${FRAME_BASE}frame_${String(index).padStart(3, "0")}.webp`;
}

export default function HelmetScrollSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const loadedRef = useRef<boolean[]>([]);
  const activeFrameRef = useRef(0);
  const activeChapterRef = useRef(0);
  const preloadAroundRef = useRef<(index: number) => void>(() => undefined);
  const isVisibleRef = useRef(false);
  const drawRef = useRef<() => void>(() => undefined);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLSpanElement>(null);
  const progressValueRef = useRef<HTMLSpanElement>(null);
  const [chapter, setChapter] = useState(0);
  const [hasInitialFrame, setHasInitialFrame] = useState(false);
  const reducedMotion = useReducedMotion();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    const frames = framesRef.current;
    const loaded = loadedRef.current;
    if (!canvas || !context || !canvas.width || !canvas.height) return;

    context.fillStyle = "#050608";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const target = activeFrameRef.current;
    let image = loaded[target] ? frames[target] : undefined;
    if (!image) {
      for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
        const before = target - distance;
        const after = target + distance;
        if (before >= 0 && loaded[before]) {
          image = frames[before];
          break;
        }
        if (after < FRAME_COUNT && loaded[after]) {
          image = frames[after];
          break;
        }
      }
    }

    if (!image?.naturalWidth) return;
    const mobile = window.innerWidth <= 720;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const copyBottom = heroCopyRef.current?.getBoundingClientRect().bottom ?? 0;
    const mobileTop = (copyBottom + 18) * pixelRatio;
    const mobileBottom = canvas.height - 78 * pixelRatio;
    const availableHeight = Math.max(1, mobileBottom - mobileTop);
    const scale = mobile
      ? Math.min(canvas.width / image.naturalWidth, availableHeight / image.naturalHeight) *
        (window.innerHeight <= 740 ? 1.08 : 1.18)
      : Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const x = (canvas.width - width) / 2 + (mobile ? 0 : canvas.width * 0.12);
    const y = mobile
      ? mobileTop + (availableHeight - height) / 2
      : (canvas.height - height) / 2;
    context.drawImage(image, x, y, width, height);
  }, []);

  useEffect(() => {
    drawRef.current = draw;
    draw();
  }, [draw]);

  useEffect(() => {
    let cancelled = false;

    const loadFrame = (index: number) => {
      if (loadedRef.current[index]) return;
      let image = framesRef.current[index];
      if (!image) {
        image = new Image();
        image.decoding = "async";
        framesRef.current[index] = image;
        image.src = framePath(index);
      }

      const markLoaded = () => {
        if (!image?.naturalWidth || framesRef.current[index] !== image) return;
        loadedRef.current[index] = true;
        if (index === 0) setHasInitialFrame(true);
        if (isVisibleRef.current) drawRef.current();
      };
      image.onerror = () => {
        if (framesRef.current[index] === image) framesRef.current[index] = undefined;
        console.error(`Unable to load VEYRO animation frame ${index}: ${framePath(index)}`);
      };
      if (image.complete) {
        markLoaded();
      } else {
        image.onload = markLoaded;
      }
    };

    loadFrame(0);
    if (reducedMotion) return () => {
      cancelled = true;
    };

    let nextIndex = 6;
    let idleId: number | undefined;
    const loadRemaining = () => {
      if (cancelled || nextIndex >= FRAME_COUNT) return;
      loadFrame(nextIndex);
      nextIndex += 1;
      idleId = window.setTimeout(loadRemaining, 35);
    };
    preloadAroundRef.current = (center) => {
      for (let offset = 0; offset <= 5; offset += 1) {
        const before = center - offset;
        const after = center + offset;
        if (before >= 0) loadFrame(before);
        if (after < FRAME_COUNT) loadFrame(after);
      }
    };

    const priorityTimer = window.setTimeout(() => {
      preloadAroundRef.current(activeFrameRef.current);
      idleId = window.setTimeout(loadRemaining, 35);
    }, 0);
    return () => {
      cancelled = true;
      preloadAroundRef.current = () => undefined;
      window.clearTimeout(priorityTimer);
      if (idleId !== undefined) window.clearTimeout(idleId);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const resizeObserver = new ResizeObserver(() => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * pixelRatio);
      canvas.height = Math.round(bounds.height * pixelRatio);
      if (isVisibleRef.current) drawRef.current();
    });
    resizeObserver.observe(canvas);

    let animationFrame = 0;
    const updateScroll = () => {
      if (!isVisibleRef.current || reducedMotion) return;
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const bounds = section.getBoundingClientRect();
        const travel = Math.max(1, section.offsetHeight - window.innerHeight);
        const nextProgress = Math.max(0, Math.min(1, -bounds.top / travel));
        const frame = Math.min(FRAME_COUNT - 1, Math.round(nextProgress * (FRAME_COUNT - 1)));
        const nextChapter = Math.min(3, Math.floor(nextProgress * 4));
        activeFrameRef.current = frame;
        stageRef.current?.classList.toggle("sequence__stage--revealing", nextProgress > 0.06);
        preloadAroundRef.current(frame);
        if (nextChapter !== activeChapterRef.current) {
          activeChapterRef.current = nextChapter;
          setChapter(nextChapter);
        }
        if (progressFillRef.current) {
          progressFillRef.current.style.transform = `scaleX(${nextProgress})`;
        }
        if (progressValueRef.current) {
          progressValueRef.current.textContent = `${String(Math.round(nextProgress * 100)).padStart(2, "0")}%`;
        }
        progressBarRef.current?.setAttribute("aria-valuenow", String(Math.round(nextProgress * 100)));
        drawRef.current();
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          drawRef.current();
          updateScroll();
        }
      },
      { rootMargin: "100px 0px" },
    );
    observer.observe(section);
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      cancelAnimationFrame(animationFrame);
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={`sequence${reducedMotion ? " sequence--reduced" : ""}`}
      id="experience"
      aria-label="Scroll-controlled VEYRO H1 product reveal"
    >
      <span className="sequence__home-anchor" id="home" aria-hidden="true" />
      <div className="sequence__stage" ref={stageRef}>
        <img
          className={`sequence__fallback${hasInitialFrame ? " sequence__fallback--hidden" : ""}`}
          src={framePath(0)}
          alt="VEYRO H1 smart helmet"
        />
        <canvas
          className="sequence__canvas"
          ref={canvasRef}
          aria-label="VEYRO H1 helmet animation controlled by scrolling"
        />
        <div className="sequence__shade" />

        <div className="sequence__hero-copy" ref={heroCopyRef}>
          <p className="eyebrow"><span className="eyebrow__dot" /> Introducing VEYRO H1</p>
          <h1>
            The future<br />of riding<span>.</span>
            <br /><em>Starts here.</em>
          </h1>
          <p className="sequence__hero-description">
            A new vision for intelligent motorcycle communication. Voice control, seamless connectivity, and a smarter riding experience — in one helmet.
          </p>
          <div className="sequence__hero-actions">
            <a className="button button--primary" href="#waitlist">
              Join the waitlist <ArrowRight size={16} />
            </a>
            <a className="button button--secondary" href="#technology">
              Explore technology <ArrowDown size={15} />
            </a>
          </div>
          <div className="sequence__hero-features" aria-label="Planned product capabilities">
            <span><Bluetooth size={14} /> Bluetooth</span>
            <span><Mic size={14} /> Voice assistant</span>
            <span><MessageSquare size={14} /> Smart communication</span>
          </div>
        </div>

        <div className="sequence__meta">
          <span>VEYRO H1</span>
          <span className="sequence__meta-divider" />
          <span>AN ENGINEERING CONCEPT</span>
        </div>

        <motion.div
          className="sequence__story"
          key={chapter}
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          aria-live="polite"
        >
          <p className="eyebrow">{CHAPTERS[chapter].title}</p>
          <h2>{CHAPTERS[chapter].description}</h2>
        </motion.div>

        <div className="sequence__bottom">
          <span className="sequence__scroll">
            <span className="sequence__scroll-dot" />
            {reducedMotion ? "A closer look at VEYRO H1" : "Scroll to explore"}
          </span>
          <div
            ref={progressBarRef}
            className="sequence__progress"
            role="progressbar"
            aria-label="Animation progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <span ref={progressValueRef}>00%</span>
            <span className="sequence__track">
              <span ref={progressFillRef} />
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
