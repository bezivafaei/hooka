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

// Global memory cache of decoded frame images so switching or re-rendering is instantaneous
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
  const appleTagRef = useRef<HTMLDivElement>(null);
  const appleAuraRef = useRef<HTMLDivElement>(null);

  const grapeFloatRef = useRef<HTMLDivElement>(null);
  const grapeTagRef = useRef<HTMLDivElement>(null);
  const grapeAuraRef = useRef<HTMLDivElement>(null);

  const citrusFloatRef = useRef<HTMLDivElement>(null);
  const citrusTagRef = useRef<HTMLDivElement>(null);
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

    // Eagerly instantiate all 40 frames into memory
    const frames = getOrInitFrames();

    // Physics interpolation state for silky continuous rotation
    let currentProgress = 0;
    let targetProgress = 0;
    let currentFrameFloat = 0;

    const paint = (frameIndex: number, rotProgress: number) => {
      if (!frames.length) return;

      // Find best available frame: exact target or nearest loaded frame
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

    // Advanced 3D Spatial Physics for Floating Fruit Pieces
    const applyFruitMotion = (
      el: HTMLElement | null,
      tagEl: HTMLElement | null,
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
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        if (auraEl) auraEl.style.opacity = "0";
        return;
      }

      let enterEase = 1;
      let exitEase = 0;
      let blur = 0;

      if (progress < peakStart) {
        const t = clamp((progress - start) / Math.max(peakStart - start, 0.001));
        enterEase = 1 - Math.pow(1 - t, 3);
        blur = (1 - enterEase) * 12;
      } else if (progress > peakEnd) {
        const t = clamp((progress - peakEnd) / Math.max(end - peakEnd, 0.001));
        exitEase = Math.pow(t, 2.4);
        blur = exitEase * 14;
      }

      const opacity = enterEase * (1 - exitEase);
      const dirX = side === "right" ? 1 : -1;

      // 3D Orbital curve trajectory
      const transX = (1 - enterEase) * (isMobile ? 32 : 65) * dirX - exitEase * (isMobile ? 22 : 45) * dirX;
      const transY = (progress - (peakStart + peakEnd) / 2) * (isMobile ? -26 : -44) - exitEase * 22;
      
      // Dynamic 3D tilt
      const rotY = (1 - enterEase) * 14 * dirX - exitEase * 12 * dirX;
      const rotZ = (1 - enterEase) * -5 * dirX + exitEase * 5 * dirX;
      const scale = 0.88 + enterEase * 0.16 - exitEase * 0.08;

      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `perspective(800px) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 0) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      el.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : "none";
      el.style.visibility = opacity > 0.005 ? "visible" : "hidden";

      if (tagEl) {
        const tagEnter = clamp((enterEase - 0.15) / 0.85);
        const tagTransX = (1 - tagEnter) * 16 * dirX;
        const tagTransY = (1 - tagEnter) * 8;
        tagEl.style.opacity = (tagEnter * (1 - exitEase)).toFixed(3);
        tagEl.style.transform = `translate3d(${tagTransX.toFixed(1)}px, ${tagTransY.toFixed(1)}px, 0)`;
      }

      if (auraEl) {
        const auraScale = 0.75 + enterEase * 0.35 - exitEase * 0.2;
        auraEl.style.opacity = (opacity * 0.9).toFixed(3);
        auraEl.style.transform = `scale(${auraScale.toFixed(3)})`;
      }
    };

    const updateDOM = () => {
      const isMobile = window.innerWidth < 768;

      // 1. Rotation completes smoothly at 0.82
      const rotProgress = clamp(currentProgress / 0.82);
      const targetFrameFloat = rotProgress * (FRAME_COUNT - 1);
      
      // Frame interpolation with inertia damping
      const fDiff = targetFrameFloat - currentFrameFloat;
      if (Math.abs(fDiff) > 0.01) {
        currentFrameFloat += fDiff * 0.22;
      } else {
        currentFrameFloat = targetFrameFloat;
      }

      const activeFrameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.round(currentFrameFloat))
      );

      paint(activeFrameIndex, rotProgress);

      // Degrees count to 360 over the rotation phase
      const degrees = Math.round(rotProgress * 360);
      if (degreeRef.current) {
        degreeRef.current.textContent = `${degrees}°`;
      }

      // 2. Sequential Fruit Showcases (Apple -> Grape -> Citrus)
      applyFruitMotion(
        appleFloatRef.current,
        appleTagRef.current,
        appleAuraRef.current,
        currentProgress,
        0.05,
        0.13,
        0.21,
        0.28,
        "right",
        isMobile,
      );

      applyFruitMotion(
        grapeFloatRef.current,
        grapeTagRef.current,
        grapeAuraRef.current,
        currentProgress,
        0.28,
        0.36,
        0.44,
        0.52,
        "left",
        isMobile,
      );

      applyFruitMotion(
        citrusFloatRef.current,
        citrusTagRef.current,
        citrusAuraRef.current,
        currentProgress,
        0.52,
        0.60,
        0.68,
        0.75,
        "right",
        isMobile,
      );

      // 3. Central Statement: Appears at 0.73, fully readable until 0.88, then smoothly glides up
      const textIn = clamp((currentProgress - 0.73) / 0.09);
      const textOut = clamp((currentProgress - 0.90) / 0.08);
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

      // 4. Seamless Unstick / Exit Transition (0.83 -> 1.00):
      // As the 360 video finishes its final turn, it naturally glides upward and prepares
      // for the next section (#menu) without feeling stuck or halted!
      if (media) {
        const exitProgress = clamp((currentProgress - 0.83) / 0.17);
        if (exitProgress > 0) {
          const exitEase = Math.pow(exitProgress, 1.8);
          const mediaY = -exitEase * 38;
          const mediaOp = 1 - exitEase * 0.28;
          media.style.transform = `translate3d(0, ${mediaY.toFixed(1)}px, 0)`;
          media.style.opacity = mediaOp.toFixed(3);
        } else {
          media.style.transform = "none";
          media.style.opacity = "1";
        }
      }
    };

    // Continuous Animation Loop with Inertia Lerp
    const loop = () => {
      if (disposed) return;

      const pDiff = targetProgress - currentProgress;
      if (Math.abs(pDiff) > 0.0001) {
        currentProgress += pDiff * 0.16;
      } else {
        currentProgress = targetProgress;
      }

      updateDOM();

      const rotProgress = clamp(currentProgress / 0.82);
      const targetFrameFloat = rotProgress * (FRAME_COUNT - 1);
      const isStillMoving =
        Math.abs(targetProgress - currentProgress) > 0.0002 ||
        Math.abs(targetFrameFloat - currentFrameFloat) > 0.02;

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
      // Natural responsive scroll travel multiplier (tightened for mobile to prevent dragging)
      const multiplier = window.innerWidth < 768 ? 2.9 : 3.5;
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
            <span className="spin-label">چرخش تعاملی ۳۶۰°</span>
            <span className="spin-degree" ref={degreeRef}>۰°</span>
          </div>
          <p className="spin-hint">برای چرخش و مشاهده طعم‌ها به پایین اسکرول کنید</p>
        </div>

        <div className="manifesto-media" ref={mediaRef}>
          <canvas ref={canvasRef} aria-label="چرخش قلیان هوکا" role="img" />
          <div className="manifesto-vignette" aria-hidden="true" />
        </div>

        {/* 1. Apple & Mint Showcase */}
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
            <div className="flavor-luxury-tag" ref={appleTagRef}>
              <div className="flavor-tag-header">
                <span className="flavor-tag-dot" />
                <span className="flavor-tag-badge">ترکیب اختصاصی</span>
              </div>
              <h4 className="flavor-tag-title">سیب ترش & نعناع کوهی</h4>
              <p className="flavor-tag-sub">Double Apple & Crisp Mint</p>
              <span className="flavor-tag-note">طراوت خنک کوهستانی</span>
            </div>
          </div>
        </aside>

        {/* 2. Grape & Ice Showcase */}
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
            <div className="flavor-luxury-tag" ref={grapeTagRef}>
              <div className="flavor-tag-header">
                <span className="flavor-tag-dot" />
                <span className="flavor-tag-badge">سرو سلطنتی</span>
              </div>
              <h4 className="flavor-tag-title">انگور سیاه شاهانی</h4>
              <p className="flavor-tag-sub">Royal Black Grape & Chill</p>
              <span className="flavor-tag-note">شیرینی عمیق و مخملی</span>
            </div>
          </div>
        </aside>

        {/* 3. Citrus & Mint Showcase */}
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
            <div className="flavor-luxury-tag" ref={citrusTagRef}>
              <div className="flavor-tag-header">
                <span className="flavor-tag-dot" />
                <span className="flavor-tag-badge">عطر تابستانی</span>
              </div>
              <h4 className="flavor-tag-title">لیمو ترش سیسیلی & موهیتو</h4>
              <p className="flavor-tag-sub">Zesty Citrus & Fresh Lime</p>
              <span className="flavor-tag-note">انرژی‌بخش و مرکباتی</span>
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
