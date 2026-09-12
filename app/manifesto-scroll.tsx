"use client";

import { useEffect, useRef } from "react";
import { setStyleIfChanged } from "./observe-resize";
import { TypeLine } from "./type-line";

const FRAME_COUNT = 40;
const FRAME_BASE = "/images/manifesto/frames/frame";

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

function framePath(index: number) {
  return `${FRAME_BASE}-${String(index + 1).padStart(3, "0")}.jpg`;
}

function drawContain(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  scale = 1,
) {
  const fitScale = Math.min(width / image.width, height / image.height) * scale;
  const drawWidth = image.width * fitScale;
  const drawHeight = image.height * fitScale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;
  ctx.fillStyle = "#0e0d0c";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  scale = 1,
  focusX = 0.5,
  focusY = 0.46,
) {
  const coverScale = Math.max(width / image.width, height / image.height) * scale;
  const drawWidth = image.width * coverScale;
  const drawHeight = image.height * coverScale;
  const offsetX = (width - drawWidth) * focusX;
  const offsetY = (height - drawHeight) * focusY;
  ctx.fillStyle = "#0e0d0c";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

export function ManifestoScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  const appleFloatRef = useRef<HTMLDivElement>(null);
  const grapeFloatRef = useRef<HTMLDivElement>(null);
  const citrusFloatRef = useRef<HTMLDivElement>(null);
  const degreeRef = useRef<HTMLSpanElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentDrawnIndexRef = useRef(-1);
  const targetIndexRef = useRef(0);
  const textShownRef = useRef(false);
  const readyRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const statement = statementRef.current;
    if (!section || !canvas || !overlay || !statement) return;

    let raf = 0;
    let disposed = false;
    const loadingFrames = new Set<number>();

    framesRef.current = Array.from({ length: FRAME_COUNT }, () => {
      const image = new Image();
      image.decoding = "async";
      return image;
    });

    const requestUpdate = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    const loadFrame = (index: number) => {
      if (index < 0 || index >= FRAME_COUNT || loadingFrames.has(index)) return;

      const image = framesRef.current[index];
      if (!image || image.src) return;

      loadingFrames.add(index);
      const finish = () => {
        if (disposed) return;
        loadingFrames.delete(index);
        if (!readyRef.current && (index === 0 || framesRef.current.some((f) => f?.complete && f?.naturalWidth))) {
          readyRef.current = true;
          syncHeight();
          requestUpdate();
        }
        if (Math.abs(index - targetIndexRef.current) <= 1 || currentDrawnIndexRef.current === -1) {
          requestUpdate();
        }
      };

      image.onload = finish;
      image.onerror = finish;
      image.src = framePath(index);
    };

    const preloadAround = (index: number) => {
      loadFrame(index);
      for (const offset of [1, -1, 2, -2, 3, 4, 5]) {
        loadFrame(index + offset);
      }
    };

    // Eagerly preload all frames in rapid background batches
    const preloadAllFrames = () => {
      loadFrame(0);
      let nextBatch = 1;
      const step = () => {
        if (disposed || nextBatch >= FRAME_COUNT) return;
        const end = Math.min(nextBatch + 4, FRAME_COUNT);
        for (let i = nextBatch; i < end; i++) {
          loadFrame(i);
        }
        nextBatch = end;
        if (nextBatch < FRAME_COUNT) {
          setTimeout(step, 60);
        }
      };
      setTimeout(step, 100);
    };

    const paint = (progress: number) => {
      const frames = framesRef.current;
      if (!frames.length) return;

      // 360 rotation completes over the first 72% of scroll travel, then holds at 360 degrees
      const rotProgress = clamp(progress / 0.72);
      const targetIndex = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(rotProgress * (FRAME_COUNT - 1))));
      targetIndexRef.current = targetIndex;
      preloadAround(targetIndex);

      // Find best available frame: exact target or closest loaded frame
      let renderImage: HTMLImageElement | null = null;
      let usedIndex = -1;

      if (frames[targetIndex]?.complete && frames[targetIndex]?.naturalWidth) {
        renderImage = frames[targetIndex];
        usedIndex = targetIndex;
      } else {
        // Find nearest loaded frame so canvas never goes blank or freezes
        for (let offset = 1; offset < FRAME_COUNT; offset++) {
          const prev = targetIndex - offset;
          const next = targetIndex + offset;
          if (prev >= 0 && frames[prev]?.complete && frames[prev]?.naturalWidth) {
            renderImage = frames[prev];
            usedIndex = prev;
            break;
          }
          if (next < FRAME_COUNT && frames[next]?.complete && frames[next]?.naturalWidth) {
            renderImage = frames[next];
            usedIndex = next;
            break;
          }
        }
      }

      if (!renderImage) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        currentDrawnIndexRef.current = -1;
      }

      if (usedIndex === currentDrawnIndexRef.current) return;
      currentDrawnIndexRef.current = usedIndex;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);

      const isMobile = width < 768;
      const zoom = 1 + Math.sin(rotProgress * Math.PI) * (isMobile ? 0.05 : 0.04);
      if (isMobile) {
        drawCover(ctx, renderImage, width, height, zoom, 0.5, 0.48);
      } else {
        drawContain(ctx, renderImage, width, height, zoom);
      }
      ctx.restore();
    };

    const update = () => {
      const viewport = window.innerHeight;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - viewport, 1);
      const progress = clamp(-rect.top / travel);

      document.documentElement.style.setProperty("--manifesto-p", progress.toFixed(4));
      paint(progress);

      // Degrees count to 360 over the rotation phase and stay at 360 during hold
      const rotProgress = clamp(progress / 0.72);
      const degrees = Math.round(rotProgress * 360);
      if (degreeRef.current) {
        degreeRef.current.textContent = `${degrees}°`;
      }

      // Enhanced Motion Physics with cinematic depth-of-field defocus blur
      const isMobile = window.innerWidth < 768;

      const applyMotion = (
        ref: React.RefObject<HTMLDivElement | null>,
        start: number,
        peakStart: number,
        peakEnd: number,
        end: number,
        dirX: number,
      ) => {
        const el = ref.current;
        if (!el) return;

        if (progress < start || progress > end) {
          el.style.opacity = "0";
          el.style.visibility = "hidden";
          return;
        }

        let enterEase = 1;
        let exitEase = 0;
        let blur = 0;

        if (progress < peakStart) {
          const t = clamp((progress - start) / Math.max(peakStart - start, 0.001));
          enterEase = 1 - Math.pow(1 - t, 3);
          blur = (1 - enterEase) * 16;
        } else if (progress > peakEnd) {
          const t = clamp((progress - peakEnd) / Math.max(end - peakEnd, 0.001));
          exitEase = Math.pow(t, 2.5);
          blur = exitEase * 18;
        }

        const opacity = enterEase * (1 - exitEase);
        const transX = (1 - enterEase) * (isMobile ? 32 : 65) * dirX - exitEase * (isMobile ? 22 : 40) * dirX;
        const transY = (progress - (peakStart + peakEnd) / 2) * (isMobile ? -22 : -36) - exitEase * 18;
        const rot = (1 - enterEase) * -4 * dirX + exitEase * 4 * dirX;
        const scale = 0.88 + enterEase * 0.12 - exitEase * 0.06;

        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
        el.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : "none";
        el.style.visibility = opacity > 0.005 ? "visible" : "hidden";
      };

      // 1. Apple & Mint: Enters blurred -> sharp focus -> blurs out
      applyMotion(appleFloatRef, 0.05, 0.14, 0.22, 0.29, 1);

      // 2. Grape & Ice: Enters blurred -> sharp focus -> blurs out
      applyMotion(grapeFloatRef, 0.27, 0.35, 0.43, 0.50, -1);

      // 3. Citrus & Mint: Enters blurred -> sharp focus -> blurs out
      applyMotion(citrusFloatRef, 0.48, 0.56, 0.63, 0.70, 1);

      // Central statement fade: Appears gracefully at 0.72 when all fruits have cleanly dissolved
      const textIn = clamp((progress - 0.72) / 0.10);
      const textOut = clamp((progress - 0.94) / 0.05);
      const textEase = 1 - Math.pow(1 - textIn, 3);
      const textOp = textEase * (1 - textOut);
      const textTransY = (1 - textEase) * 16 - textOut * 12;
      const textBlur = (1 - textEase) * 8 + textOut * 8;

      overlay.style.opacity = textOp.toFixed(3);
      overlay.style.transform = `translate3d(0, ${textTransY.toFixed(1)}px, 0)`;
      overlay.style.filter = textBlur > 0.1 ? `blur(${textBlur.toFixed(1)}px)` : "none";
      overlay.style.visibility = textOp > 0.005 ? "visible" : "hidden";

      if (progress > 0.70 && !textShownRef.current) {
        textShownRef.current = true;
        statement.classList.add("is-visible");
      }
    };

    const syncHeight = () => {
      // Extended scroll travel so 360 rotation is regal, deliberate, and provides comfortable pauses
      const multiplier = window.innerWidth < 768 ? 4.8 : 5.0;
      setStyleIfChanged(section, "height", `${Math.ceil(window.innerHeight * multiplier)}px`);
    };

    const handleResize = () => {
      syncHeight();
      currentDrawnIndexRef.current = -1;
      requestUpdate();
    };

    syncHeight();
    preloadAllFrames();
    requestUpdate();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
      if (raf) window.cancelAnimationFrame(raf);
      section.style.removeProperty("height");
    };
  }, []);

  return (
    <section className="manifesto-scroll" id="experience" ref={sectionRef} aria-label="چرخش تعاملی و طعم‌های هوکا">
      <div className="manifesto-sticky">
        <div className="manifesto-glow" aria-hidden="true" />

        <div className="manifesto-media">
          <canvas ref={canvasRef} aria-label="چرخش قلیان هوکا" role="img" />
          <div className="manifesto-vignette" aria-hidden="true" />
        </div>

        {/* Floating Minimalist Fruit Visuals - Clean Alpha PNGs, Defocus Blur Motion */}
        <aside className="flavor-showcase flavor-showcase-apple" ref={appleFloatRef} aria-label="طعم سیب و نعناع">
          <div className="flavor-showcase-inner">
            <div className="flavor-art-wrap">
              <img
                src="/images/flavors/apple-minimal.png"
                alt="برش سیب و نعناع تازه"
                width={716}
                height={629}
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </aside>

        <aside className="flavor-showcase flavor-showcase-grape" ref={grapeFloatRef} aria-label="طعم انگور سیاه تازه">
          <div className="flavor-showcase-inner">
            <div className="flavor-art-wrap">
              <img
                src="/images/flavors/grape-minimal.png"
                alt="خوشه انگور سیاه تازه با برگ مو"
                width={645}
                height={820}
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </aside>

        <aside className="flavor-showcase flavor-showcase-citrus" ref={citrusFloatRef} aria-label="طعم مرکبات و نعناع">
          <div className="flavor-showcase-inner">
            <div className="flavor-art-wrap">
              <img
                src="/images/flavors/citrus-minimal.png"
                alt="برش لیمو و نعناع تازه"
                width={813}
                height={772}
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </aside>

        <div className="manifesto-overlay" ref={overlayRef}>
          <h2 className="manifesto-statement" ref={statementRef} data-type>
            <TypeLine>هارمونی عطر میوه‌های تازه با کام‌دهی نرم</TypeLine>
            <TypeLine delay={100} className="light">برای شب‌هایی با خاطره‌ای ماندگار</TypeLine>
          </h2>
        </div>
      </div>
    </section>
  );
}
