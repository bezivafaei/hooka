"use client";

import { useEffect, useRef } from "react";
import { setStyleIfChanged } from "./observe-resize";
import { TypeLine } from "./type-line";

const FRAME_COUNT = 40;
const FRAME_BASE = "/images/manifesto/frames/frame";

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

function framePath(index: number) {
  return `${FRAME_BASE}-${String(index + 1).padStart(3, "0")}.webp`;
}

// Global cached image instances so re-renders or navigation are instantaneous
let globalFrames: HTMLImageElement[] | null = null;

function getOrInitFrames(): HTMLImageElement[] {
  if (globalFrames) return globalFrames;
  if (typeof window === "undefined") return [];

  globalFrames = Array.from({ length: FRAME_COUNT }, (_, i) => {
    const image = new Image();
    image.decoding = "async";
    image.src = framePath(i);
    if (typeof image.decode === "function") {
      image.decode().catch(() => {});
    }
    return image;
  });

  return globalFrames;
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
  focusY = 0.48,
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
  const mediaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);

  const appleFloatRef = useRef<HTMLDivElement>(null);
  const appleAuraRef = useRef<HTMLDivElement>(null);

  const grapeFloatRef = useRef<HTMLDivElement>(null);
  const grapeAuraRef = useRef<HTMLDivElement>(null);

  const citrusFloatRef = useRef<HTMLDivElement>(null);
  const citrusAuraRef = useRef<HTMLDivElement>(null);

  const degreeRef = useRef<HTMLSpanElement>(null);
  const currentDrawnIndexRef = useRef(-1);
  const textShownRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const media = mediaRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const statement = statementRef.current;
    if (!section || !canvas || !overlay || !statement) return;

    let disposed = false;
    let rafId = 0;
    let isLoopRunning = false;

    // Eagerly pre-instantiate all 40 frames into memory
    const frames = getOrInitFrames();

    // High-responsiveness single lerp for immediate finger tracking with buttery 60fps interpolation
    let targetProgress = 0;
    let currentProgress = 0;
    let currentFrameFloat = 0;

    const paint = (frameIndex: number, rotProgress: number) => {
      if (!frames.length) return;

      let renderImage: HTMLImageElement | null = null;
      let usedIndex = -1;

      if (frames[frameIndex]?.complete && frames[frameIndex]?.naturalWidth) {
        renderImage = frames[frameIndex];
        usedIndex = frameIndex;
      } else {
        for (let offset = 1; offset < FRAME_COUNT; offset++) {
          const prev = frameIndex - offset;
          const next = frameIndex + offset;
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

      if (
        canvas.width === 0 ||
        Math.abs(canvas.width - pixelWidth) > 8 ||
        Math.abs(canvas.height - pixelHeight) > 36
      ) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        currentDrawnIndexRef.current = -1;
      }

      if (usedIndex === currentDrawnIndexRef.current) return;
      currentDrawnIndexRef.current = usedIndex;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

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

    // Clean, high-performance 3D spatial orbit motion for minimalist fruit pieces
    const applyFruitMotion = (
      el: HTMLElement | null,
      auraEl: HTMLElement | null,
      progress: number,
      start: number,
      peakStart: number,
      peakEnd: number,
      end: number,
      side: "right" | "left",
      isMobile: boolean,
    ) => {
      if (!el) return;

      if (progress < start || progress > end) {
        if (el.style.visibility !== "hidden") {
          el.style.opacity = "0";
          el.style.visibility = "hidden";
        }
        if (auraEl && auraEl.style.opacity !== "0") {
          auraEl.style.opacity = "0";
        }
        return;
      }

      let enterEase = 1;
      let exitEase = 0;
      let blur = 0;

      if (progress < peakStart) {
        const t = clamp((progress - start) / Math.max(peakStart - start, 0.001));
        enterEase = 1 - Math.pow(1 - t, 3);
        blur = (1 - enterEase) * 10;
      } else if (progress > peakEnd) {
        const t = clamp((progress - peakEnd) / Math.max(end - peakEnd, 0.001));
        exitEase = Math.pow(t, 2.4);
        blur = exitEase * 12;
      }

      const opacity = enterEase * (1 - exitEase);
      const dirX = side === "right" ? 1 : -1;

      // 3D Orbital Trajectory
      const transX = (1 - enterEase) * (isMobile ? 32 : 60) * dirX - exitEase * (isMobile ? 22 : 40) * dirX;
      const transY = (progress - (peakStart + peakEnd) / 2) * (isMobile ? -24 : -40) - exitEase * 20;
      const rotY = (1 - enterEase) * 14 * dirX - exitEase * 12 * dirX;
      const rotZ = (1 - enterEase) * -5 * dirX + exitEase * 5 * dirX;
      const scale = 0.88 + enterEase * 0.16 - exitEase * 0.08;

      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `perspective(800px) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 0) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      el.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : "none";
      el.style.visibility = "visible";

      if (auraEl) {
        const auraScale = 0.75 + enterEase * 0.35 - exitEase * 0.2;
        auraEl.style.opacity = (opacity * 0.85).toFixed(3);
        auraEl.style.transform = `scale(${auraScale.toFixed(3)})`;
      }
    };

    const updateDOM = () => {
      const isMobile = window.innerWidth < 768;

      // 360 rotation completes smoothly at 0.78
      const rotProgress = clamp(currentProgress / 0.78);
      const targetFrameFloat = rotProgress * (FRAME_COUNT - 1);
      
      // Fast, responsive frame interpolation (0.35 factor ensures instant finger tracking)
      const fDiff = targetFrameFloat - currentFrameFloat;
      if (Math.abs(fDiff) > 0.01) {
        currentFrameFloat += fDiff * 0.35;
      } else {
        currentFrameFloat = targetFrameFloat;
      }

      const activeFrameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.round(currentFrameFloat))
      );

      paint(activeFrameIndex, rotProgress);

      const degrees = Math.round(rotProgress * 360);
      if (degreeRef.current) {
        degreeRef.current.textContent = `${degrees}°`;
      }

      // Minimalist Floating Fruit Motion (Clean visuals, zero text clutter)
      applyFruitMotion(
        appleFloatRef.current,
        appleAuraRef.current,
        currentProgress,
        0.05,
        0.13,
        0.20,
        0.27,
        "right",
        isMobile,
      );

      applyFruitMotion(
        grapeFloatRef.current,
        grapeAuraRef.current,
        currentProgress,
        0.27,
        0.35,
        0.43,
        0.50,
        "left",
        isMobile,
      );

      applyFruitMotion(
        citrusFloatRef.current,
        citrusAuraRef.current,
        currentProgress,
        0.50,
        0.58,
        0.66,
        0.73,
        "right",
        isMobile,
      );

      // Central Statement: Appears at 0.72, fully readable through 0.85, then naturally glides up
      const textIn = clamp((currentProgress - 0.72) / 0.08);
      const textOut = clamp((currentProgress - 0.88) / 0.09);
      const textEase = 1 - Math.pow(1 - textIn, 3);
      const textOp = textEase * (1 - textOut);
      const textTransY = (1 - textEase) * 16 - textOut * 24;
      const textBlur = (1 - textEase) * 6 + textOut * 6;

      overlay.style.opacity = textOp.toFixed(3);
      overlay.style.transform = `translate3d(0, ${textTransY.toFixed(1)}px, 0)`;
      overlay.style.filter = textBlur > 0.1 ? `blur(${textBlur.toFixed(1)}px)` : "none";
      overlay.style.visibility = textOp > 0.005 ? "visible" : "hidden";

      if (currentProgress > 0.70 && !textShownRef.current) {
        textShownRef.current = true;
        statement.classList.add("is-visible");
      }

      // Effortless unstick & exit transition (0.80 -> 1.00):
      // Before rotation fully stops, the section naturally prepares to glide into the next section
      if (media) {
        const exitProgress = clamp((currentProgress - 0.80) / 0.20);
        if (exitProgress > 0) {
          const exitEase = Math.pow(exitProgress, 1.8);
          const mediaY = -exitEase * 42;
          const mediaOp = 1 - exitEase * 0.25;
          media.style.transform = `translate3d(0, ${mediaY.toFixed(1)}px, 0)`;
          media.style.opacity = mediaOp.toFixed(3);
        } else {
          media.style.transform = "none";
          media.style.opacity = "1";
        }
      }
    };

    const loop = () => {
      if (disposed) return;

      const pDiff = targetProgress - currentProgress;
      if (Math.abs(pDiff) > 0.0001) {
        currentProgress += pDiff * 0.25;
      } else {
        currentProgress = targetProgress;
      }

      updateDOM();

      const rotProgress = clamp(currentProgress / 0.78);
      const targetFrameFloat = rotProgress * (FRAME_COUNT - 1);
      const isStillMoving =
        Math.abs(targetProgress - currentProgress) > 0.0003 ||
        Math.abs(targetFrameFloat - currentFrameFloat) > 0.03;

      if (isStillMoving) {
        rafId = window.requestAnimationFrame(loop);
      } else {
        isLoopRunning = false;
      }
    };

    const requestLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        rafId = window.requestAnimationFrame(loop);
      }
    };

    const handleScroll = () => {
      const viewport = window.innerHeight;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - viewport, 1);
      targetProgress = clamp(-rect.top / travel);
      requestLoop();
    };

    let initialWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    const syncHeight = () => {
      // Snappy and responsive travel: 2.6 on mobile, 3.2 on desktop
      const multiplier = window.innerWidth < 768 ? 2.6 : 3.2;
      setStyleIfChanged(section, "height", `${Math.ceil(window.innerHeight * multiplier)}px`);
    };

    const handleResize = () => {
      if (Math.abs(window.innerWidth - initialWidth) > 50) {
        initialWidth = window.innerWidth;
        syncHeight();
        currentDrawnIndexRef.current = -1;
        requestLoop();
      }
    };

    syncHeight();
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (rafId) window.cancelAnimationFrame(rafId);
      section.style.removeProperty("height");
    };
  }, []);

  return (
    <section className="manifesto-scroll" id="experience" ref={sectionRef} aria-label="چرخش تعاملی و طعم‌های هوکا">
      <div className="manifesto-sticky">
        <div className="manifesto-glow" aria-hidden="true" />

        <div className="manifesto-topbar" aria-hidden="true">
          <div className="spin-badge">
            <span className="spin-pulse" />
            <svg className="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.57 2.6L21 8m0 0v-6m0 6h-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="spin-label">چرخش ۳۶۰°</span>
            <span className="spin-degree" ref={degreeRef}>۰°</span>
          </div>
        </div>

        <div className="manifesto-media" ref={mediaRef}>
          <canvas ref={canvasRef} aria-label="چرخش قلیان هوکا" role="img" />
          <div className="manifesto-vignette" aria-hidden="true" />
        </div>

        {/* Pure Minimalist Floating Fruits with Radiant Depth Halo */}
        <aside className="flavor-showcase flavor-showcase-apple" ref={appleFloatRef} aria-label="طعم سیب و نعناع">
          <div className="flavor-aura flavor-aura-apple" ref={appleAuraRef} aria-hidden="true" />
          <div className="flavor-showcase-inner">
            <div className="flavor-art-wrap">
              <img
                src="/images/flavors/apple-minimal.webp"
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
          <div className="flavor-aura flavor-aura-grape" ref={grapeAuraRef} aria-hidden="true" />
          <div className="flavor-showcase-inner">
            <div className="flavor-art-wrap">
              <img
                src="/images/flavors/grape-minimal.webp"
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
          <div className="flavor-aura flavor-aura-citrus" ref={citrusAuraRef} aria-hidden="true" />
          <div className="flavor-showcase-inner">
            <div className="flavor-art-wrap">
              <img
                src="/images/flavors/citrus-minimal.webp"
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
